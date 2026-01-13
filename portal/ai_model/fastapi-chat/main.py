import json
import logging
import os
from datetime import datetime
from io import BytesIO
from typing import List, Literal, Optional
from uuid import uuid4, UUID
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

# 외부 라이브러리 임포트
# jwt: JSON Web Token 처리를 위한 라이브러리 (사용자 인증)
import jwt
# dotenv: .env 파일에서 환경변수를 로드하기 위한 라이브러리
from dotenv import load_dotenv
# fastapi: 웹 프레임워크 및 관련 유틸리티 (요청, 응답, 예외 처리 등)
from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, Response, UploadFile, Form
# CORSMiddleware: Cross-Origin Resource Sharing (CORS) 설정을 위한 미들웨어
from fastapi.middleware.cors import CORSMiddleware
# StreamingResponse: 스트리밍 응답(SSE 등)을 처리하기 위한 클래스
from fastapi.responses import StreamingResponse
# openai: OpenAI API와 상호작용하기 위한 공식 클라이언트
from openai import OpenAI, OpenAIError
# pydantic: 데이터 유효성 검사 및 설정 관리를 위한 라이브러리 (DTO 역할)
from pydantic import BaseModel, Field
# sqlalchemy: SQL 데이터베이스 상호작용을 위한 ORM/Toolkit
from sqlalchemy import create_engine, text as sa_text
from sqlalchemy.engine import Engine
# PyPDF2: PDF 파일에서 텍스트를 추출하기 위한 라이브러리
from PyPDF2 import PdfReader

# ---------- Config / Env ----------
# 환경 설정 및 환경 변수 로드 섹션

# .env 파일 로드 (환경변수 설정)
load_dotenv(dotenv_path=os.getenv("ENV_FILE", ".env"))

# 주요 설정값 로드
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") # OpenAI API 키
DATABASE_URL = os.getenv("DATABASE_URL")     # 데이터베이스 연결 URL
DB_SCHEMA = os.getenv("DB_SCHEMA", "dev")    # 사용할 DB 스키마 (기본값: dev)
JWT_SECRET = os.getenv("JWT_SECRET")         # JWT 토큰 서명/검증을 위한 비밀키
JWT_ALG = os.getenv("JWT_ALG", "HS256")      # JWT 알고리즘
# JWT Secret이 Base64로 인코딩되어 있는지 여부 확인
JWT_IS_BASE64 = os.getenv("JWT_IS_BASE64", "true").lower() in ("1", "true", "yes")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:9090") # CORS 허용 출처
MAX_UPLOAD_MB = float(os.getenv("MAX_UPLOAD_MB", "10"))           # 파일 업로드 최대 크기 (MB)
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")  # 텍스트 임베딩에 사용할 모델명

# 로거 설정: 애플리케이션 로그 기록용
logger = logging.getLogger("fastapi-chat")
logging.basicConfig(level=logging.INFO)

# ---------- Models ----------


class Message(BaseModel):
  """
  채팅 메시지 구조를 정의하는 Pydantic 모델
  OpenAI API의 메시지 포맷과 호환됩니다.
  """
  role: Literal["system", "user", "assistant"] # 메시지 발신자 역할 (시스템, 사용자, AI)
  content: str                                 # 메시지 내용


class ChatRequest(BaseModel):
  """
  채팅 완료(Chat Completion) 요청을 위한 DTO (Data Transfer Object)
  클라이언트로부터 받는 요청 데이터의 구조를 정의하고 검증합니다.
  """
  messages: List[Message] = Field(..., description="OpenAI Chat API와 호환되는 채팅 기록 리스트")
  model: str = Field(default="gpt-5-mini", description="사용할 OpenAI 모델 이름")
  stream: bool = Field(default=True, description="SSE(Server-Sent Events)를 통한 스트리밍 응답 여부")
  temperature: Optional[float] = Field(default=None, ge=0, le=2, description="모델의 창의성 조절 (생략 시 기본값 사용)")
  session_id: Optional[str] = Field(default=None, description="기존 세션 ID. 없을 경우 새로운 세션 생성.")
  document_ids: Optional[List[str]] = Field(default=None, description="컨텍스트로 사용할 업로드된 문서 ID 목록 (해당 세션에 속해야 함)")
  save_history: bool = Field(default=True, description="대화 내용을 DB에 저장할지 여부 (False일 경우 세션 생성 및 메시지 저장 안 함)")

class TranslateRequest(BaseModel):
  """
  번역 요청을 위한 DTO
  단발성 번역 기능을 위해 세션 관리 없이 메시지와 모델 정보만 받습니다.
  """
  messages: List[Message] = Field(..., description="번역할 내용을 담은 메시지 리스트 (OpenAI API 호환)")
  model: str = Field(default="gpt-5-mini", description="사용할 OpenAI 모델 이름")
  temperature: Optional[float] = Field(default=None, ge=0, le=2, description="모델의 창의성 조절")


# ---------- DB / OpenAI init ----------


def sanitize_db_url(url: str, default_schema: str = "dev"):
#스키마 확인하고 DDL추출
  parsed = urlparse(url)
  search_path = default_schema
  filtered_qs = []
  for k, v in parse_qsl(parsed.query, keep_blank_values=True):
    if k.lower() == "currentschema":
      if v:
        search_path = v
      continue
    filtered_qs.append((k, v))
  sanitized = parsed._replace(query=urlencode(filtered_qs))
  return urlunparse(sanitized), search_path


SANITIZED_DB_URL = None
DB_SEARCH_PATH = DB_SCHEMA
if DATABASE_URL:
  SANITIZED_DB_URL, search_path_from_url = sanitize_db_url(DATABASE_URL, DB_SEARCH_PATH)
  DB_SEARCH_PATH = search_path_from_url or DB_SEARCH_PATH

# OpenAI 클라이언트 초기화 (API 키가 있을 경우)
client: Optional[OpenAI] = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# SQLAlchemy 엔진 초기화 (DB URL이 있을 경우)
# future=True: SQLAlchemy 2.0 스타일 사용
# connect_args: PostgreSQL 스키마(search_path) 설정 주입
engine: Optional[Engine] = (
  create_engine(
    SANITIZED_DB_URL,
    future=True,
    connect_args={"options": f"-csearch_path={DB_SEARCH_PATH}"},
  )
  if SANITIZED_DB_URL
  else None
)

app = FastAPI(title="AI Chat FastAPI Bridge", version="0.4.0")

allowed_origins = [o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
  CORSMiddleware,
  allow_origins=allowed_origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# ---------- Helpers ----------


def require_openai():
  """
  OpenAI 클라이언트 사용 가능 여부를 확인하는 헬퍼 함수.
  설정되지 않았을 경우 500 에러를 반환합니다.
  """
  if client is None:
    raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured on the server.")


def require_db():
  """
  데이터베이스 연결 사용 가능 여부를 확인하는 헬퍼 함수.
  설정되지 않았을 경우 500 에러를 반환합니다.
  """
  if engine is None:
    raise HTTPException(status_code=500, detail="DATABASE_URL is not configured on the server.")


def get_user_id(authorization: Optional[str] = Header(None)):
#토큰 확인하고 디코딩해서 사용자 확인
  if not authorization or not authorization.startswith("Bearer "):
    logger.warning("Authorization header missing or malformed")
    raise HTTPException(status_code=401, detail="Authorization header is missing")
  if not JWT_SECRET:
    logger.error("JWT_SECRET not configured")
    raise HTTPException(status_code=500, detail="JWT_SECRET is not configured")
  token = authorization.split(" ", 1)[1]
  try:
    key: str | bytes
    # JWT 시크릿이 Base64 인코딩된 경우 디코딩 처리
    if JWT_IS_BASE64:
      import base64
      key = base64.urlsafe_b64decode(JWT_SECRET + "==")
    else:
      key = JWT_SECRET
    # JWT 디코딩 및 검증
    payload = jwt.decode(
      token,
      key,
      algorithms=[JWT_ALG],
      options={"verify_aud": False},
    )
  except jwt.PyJWTError as e:
    logger.warning("JWT decode failed: %s", e)
    raise HTTPException(status_code=401, detail=f"Invalid token: {e}") from e

  user_id = payload.get("userId") or payload.get("sub")
  if not user_id:
    raise HTTPException(status_code=401, detail="userId/sub claim is missing")
  return user_id


def derive_title_from_messages(msgs: List[Message]) -> str:
#채팅 제목 설정하기(자동으로 앞에 10글자 가져와서 정함)
  for m in msgs:
    if m.role == "user":
      return m.content[:10] or "새 대화"
  return "새 대화"


def list_sessions_db(user_id: str):
#DB에서 사용자별로 채팅 목록 가져오기
  require_db()
  with engine.connect() as conn:
    result = conn.execute(
      sa_text(
        """
        SELECT id, title, updated_at
          FROM dev.chat_sessions
         WHERE user_id = :user_id
         ORDER BY updated_at DESC
        """
      ),
      {"user_id": user_id},
    )
    return [
      {"id": str(row.id), "title": row.title, "updated_at": row.updated_at.isoformat()}
      for row in result
    ]


def create_session_db(user_id: str, title: str = "새 대화") -> str:
#새로운 채팅 세션
  require_db()
  session_id = str(uuid4())
  now = datetime.utcnow()
  with engine.begin() as conn:
    conn.execute(
      sa_text(
        """
        INSERT INTO dev.chat_sessions(id, user_id, title, created_at, updated_at)
        VALUES (:id, :user_id, :title, :created_at, :updated_at)
        """
      ),
      {
        "id": session_id,
        "user_id": user_id,
        "title": title,
        "created_at": now,
        "updated_at": now,
      },
    )
  return session_id


def verify_session_owner(session_id: str, user_id: str):
#채팅 세션에서 사용자 검증
  require_db()
  with engine.connect() as conn:
    row = conn.execute(
      sa_text("SELECT user_id FROM dev.chat_sessions WHERE id = :id"),
      {"id": session_id},
    ).first()
    if not row:
      raise HTTPException(status_code=404, detail="Session not found")
    if row.user_id != user_id:
      raise HTTPException(status_code=403, detail="Forbidden")


def get_session_messages(session_id: str, user_id: str):
  #세션에 있는 채팅 다 가져오기
  require_db()
  verify_session_owner(session_id, user_id)
  with engine.connect() as conn:
    result = conn.execute(
      sa_text(
        """
        SELECT id, role, content, created_at
          FROM dev.chat_messages
         WHERE session_id = :session_id
         ORDER BY created_at
        """
      ),
      {"session_id": session_id},
    )
    return [
      {
        "id": str(row.id),
        "role": row.role,
        "content": row.content,
        "created_at": row.created_at.isoformat(),
      }
      for row in result
    ]


def get_session_documents(session_id: str, user_id: str):
  require_db()
  # verify_session_owner(session_id, user_id) # Caller should verify or we verify here
  with engine.connect() as conn:
    # session_documents와 documents 테이블 조인
    result = conn.execute(
      sa_text(
        """
        SELECT d.id, d.filename, LENGTH(dc.content) as text_len
          FROM dev.session_documents sd
          JOIN dev.documents d ON sd.doc_id = d.id
          LEFT JOIN dev.document_chunks dc ON dc.doc_id = d.id
         WHERE sd.session_id = :session_id
           AND sd.user_id = :user_id
        """
      ),
      {"session_id": session_id, "user_id": user_id},
    )
    # text_len은 청크 단위로 나뉘어 있어서 정확한 전체 길이 추정은 어렵지만,
    # 여기서는 documents 테이블에 text_length 컬럼이 없으므로
    # 예시로 청크들의 합을 구하거나 단순화해서 처리.
    # 하지만 기존 store_document 로직을 보면 documents 테이블에 text_len이 없음.
    # upload_pdf 에서는 바로 리턴했음.
    # 간단히 파일명과 ID만 리턴하거나, distinct로 가져오자.
    
    # 수정: 문서 목록만 가져오기 (중복 제거)
    rows = conn.execute(
      sa_text(
        """
        SELECT d.id, d.filename
          FROM dev.session_documents sd
          JOIN dev.documents d ON sd.doc_id = d.id
         WHERE sd.session_id = :session_id
        """
      ),
      {"session_id": session_id},
    )
    
    docs = []
    seen = set()
    for row in rows:
      if row.id not in seen:
        docs.append({"id": str(row.id), "name": row.filename, "textLength": 0}) # textLength는 DB에 없으므로 0 처리
        seen.add(row.id)
    return docs


def add_message(session_id: str, role: str, content: str):
  require_db()
  with engine.begin() as conn:
    conn.execute(
      sa_text(
        """
        INSERT INTO dev.chat_messages(id, session_id, role, content, created_at)
        VALUES (:id, :session_id, :role, :content, :created_at)
        """
      ),
      {
        "id": str(uuid4()),
        "session_id": session_id,
        "role": role,
        "content": content,
        "created_at": datetime.utcnow(),
      },
    )


def touch_session(session_id: str, title: Optional[str] = None):
#채팅 제목 수정이나 업데이트 시간 변경
  require_db()
  with engine.begin() as conn:
    if title:
      conn.execute(
        sa_text(
          """
          UPDATE dev.chat_sessions
             SET updated_at = :updated_at,
                 title = :title
           WHERE id = :id
          """
        ),
        {"updated_at": datetime.utcnow(), "id": session_id, "title": title},
      )
    else:
      conn.execute(
        sa_text(
          """
          UPDATE dev.chat_sessions
             SET updated_at = :updated_at
           WHERE id = :id
          """
        ),
        {"updated_at": datetime.utcnow(), "id": session_id},
      )


def extract_pdf_text(file_bytes: bytes) -> str:
#PDF파일에서 텍스트 추출
  reader = PdfReader(BytesIO(file_bytes))
  texts = []
  for page in reader.pages:
    try:
      page_text = page.extract_text() or ""
      texts.append(page_text)
    except Exception:
      continue
  return "\n".join(texts).strip()


def split_text(text: str, chunk_chars: int = 1200, overlap: int = 200) -> List[str]:
#텍스트 처크 단위로 분할
  clean = text.replace("\r", "\n")
  parts = []
  start = 0
  n = len(clean)
  while start < n:
    end = min(start + chunk_chars, n)
    parts.append(clean[start:end])
    start = end - overlap if end - overlap > start else end
  return [p.strip() for p in parts if p.strip()]


def embed_texts(texts: List[str]) -> List[List[float]]:
#벡터db에 저장하기 위해서 변환
  require_openai()
  if not texts:
    return []
  response = client.embeddings.create(model=EMBED_MODEL, input=texts)
  return [item.embedding for item in response.data]


def store_document(user_id: str, session_id: str, filename: str, doc_text: str) -> dict:
  require_db()
  doc_id = str(uuid4())
  now = datetime.utcnow()
  chunks = split_text(doc_text)
  embeddings = embed_texts(chunks)

  with engine.begin() as conn:
    conn.execute(
      sa_text(
        """
        INSERT INTO dev.documents(id, user_id, filename, created_at)
        VALUES (:id, :user_id, :filename, :created_at)
        """
      ),
      {"id": doc_id, "user_id": user_id, "filename": filename, "created_at": now},
    )
    conn.execute(
      sa_text(
        """
        INSERT INTO dev.session_documents(session_id, doc_id, user_id, created_at)
        VALUES (:session_id, :doc_id, :user_id, :created_at)
        """
      ),
      {"session_id": session_id, "doc_id": doc_id, "user_id": user_id, "created_at": now},
    )
    for chunk_text, embedding in zip(chunks, embeddings):
      conn.execute(
        sa_text(
          """
          INSERT INTO dev.document_chunks(id, doc_id, content, embedding, created_at)
          VALUES (:id, :doc_id, :content, :embedding, :created_at)
          """
        ),
        {
          "id": str(uuid4()),
          "doc_id": doc_id,
          "content": chunk_text,
          "embedding": embedding,
          "created_at": now,
        },
      )
  return {"document_id": doc_id, "chunks": len(chunks), "filename": filename}


def filter_doc_ids_for_session(document_ids: List[str], session_id: str, user_id: str) -> List[str]:
  if not document_ids:
    return []
  require_db()
  doc_uuid = [UUID(d) for d in document_ids]
  with engine.connect() as conn:
    res = conn.execute(
      sa_text(
        """
        SELECT doc_id
          FROM dev.session_documents
         WHERE session_id = :session_id
           AND user_id = :user_id
           AND doc_id = ANY(:doc_ids)
        """
      ),
      {"session_id": session_id, "user_id": user_id, "doc_ids": doc_uuid},
    )
    return [str(r.doc_id) for r in res]


def search_similar_chunks(document_ids: List[str], query: str, top_k: int = 5):
  """
  pgvector를 사용하여 질문(query)과 가장 유사한 문서 청크를 벡터 유사도(cosine distance 등)로 검색합니다.
  operator <=> : vector similarity search via pgvector
  """
  require_db()
  if not document_ids:
    return []
  query_embed = embed_texts([query])[0]
  doc_uuid = [UUID(d) for d in document_ids]
  with engine.connect() as conn:
    res = conn.execute(
      sa_text(
        """
        SELECT doc_id, content
          FROM dev.document_chunks
         WHERE doc_id = ANY(:doc_ids)
         ORDER BY embedding <=> CAST(:embed AS vector)
         LIMIT :top_k
        """
      ),
      {"doc_ids": doc_uuid, "embed": query_embed, "top_k": top_k},
    )
    rows = [{"doc_id": str(row.doc_id), "content": row.content} for row in res]
    logger.info("RAG search docs=%s hits=%d", document_ids, len(rows))
    return rows


# ---------- Routes ----------


@app.options("/{full_path:path}")
async def preflight(full_path: str, request: Request):
  origin = request.headers.get("origin", "")
  if origin and origin in allowed_origins:
    headers = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": request.headers.get("access-control-request-headers", "*"),
      "Access-Control-Allow-Methods": request.headers.get("access-control-request-method", "GET,POST,OPTIONS"),
      "Access-Control-Allow-Credentials": "true",
    }
    return Response(status_code=200, headers=headers)
  return Response(status_code=200)


# @app.get("/healthz")
# async def healthz():
#   return {"status": "ok"}


@app.get("/api/chat/sessions")
def list_sessions(user_id: str = Depends(get_user_id)):
  return list_sessions_db(user_id)


@app.post("/api/chat/sessions")
def create_session(user_id: str = Depends(get_user_id)):
  session_id = create_session_db(user_id)
  return {"id": session_id, "title": "새 대화", "updated_at": datetime.utcnow().isoformat()}


@app.get("/api/chat/sessions/{session_id}")
def get_session(session_id: str, user_id: str = Depends(get_user_id)):
  msgs = get_session_messages(session_id, user_id)
  docs = get_session_documents(session_id, user_id)
  return {"id": session_id, "messages": msgs, "documents": docs}


@app.delete("/api/chat/sessions/{session_id}")
def delete_session(session_id: str, user_id: str = Depends(get_user_id)):
  require_db()
  verify_session_owner(session_id, user_id)
  with engine.begin() as conn:
    # 세션과 연결된 문서 IDs 가져오기
    docs_res = conn.execute(
      sa_text("SELECT doc_id FROM dev.session_documents WHERE session_id = :sid"),
      {"sid": session_id},
    )
    doc_ids = [str(r.doc_id) for r in docs_res]

    # 세션 삭제 (cascade로 session_documents, chat_messages 제거)
    conn.execute(sa_text("DELETE FROM dev.chat_sessions WHERE id = :id"), {"id": session_id})

    # 문서/청크 정리 (다른 세션에 연결되지 않은 문서만 삭제)
    if doc_ids:
      # 아직 다른 세션에서 참조 중인 문서는 보존
      keep_res = conn.execute(
        sa_text(
          """
          SELECT DISTINCT doc_id FROM dev.session_documents
           WHERE doc_id = ANY(:doc_ids)
             AND session_id <> :sid
          """
        ),
        {"doc_ids": doc_ids, "sid": session_id},
      )
      keep_ids = {str(r.doc_id) for r in keep_res}
      to_delete = [d for d in doc_ids if d not in keep_ids]
      if to_delete:
        conn.execute(sa_text("DELETE FROM dev.document_chunks WHERE doc_id = ANY(:doc_ids)"), {"doc_ids": to_delete})
        conn.execute(sa_text("DELETE FROM dev.documents WHERE id = ANY(:doc_ids)"), {"doc_ids": to_delete})
  return {"id": session_id, "deleted": True}


@app.post("/api/chat/sessions/{session_id}/messages")
def append_message(session_id: str, msg: Message, user_id: str = Depends(get_user_id)):
  """
  수동으로 메시지를 대화 기록에 추가합니다 (예: SQL 봇 응답 저장용).
  """
  verify_session_owner(session_id, user_id)
  add_message(session_id, msg.role, msg.content)
  touch_session(session_id)
  return {"status": "ok"}


@app.post("/api/chat/upload-pdf")#pdf파일 업로드하고 저장
async def upload_pdf(
  file: UploadFile = File(...),
  session_id: str = Form(...),
  user_id: str = Depends(get_user_id),
):
  if file.content_type not in ("application/pdf", "application/octet-stream") and not file.filename.lower().endswith(".pdf"):
    raise HTTPException(status_code=400, detail="PDF 파일만 업로드 가능합니다.")

  content = await file.read()
  if len(content) > MAX_UPLOAD_MB * 1024 * 1024:
    raise HTTPException(status_code=400, detail=f"파일 크기가 {MAX_UPLOAD_MB}MB를 초과했습니다.")

  verify_session_owner(session_id, user_id)

  try:
    doc_text = extract_pdf_text(content)
  except Exception as e:
    logger.exception("PDF 텍스트 추출 실패")
    raise HTTPException(status_code=500, detail=f"PDF 텍스트 추출 실패: {e}") from e

  try:
    doc_info = store_document(user_id=user_id, session_id=session_id, filename=file.filename, doc_text=doc_text)
  except Exception as e:
    logger.exception("문서 저장/임베딩 실패")
    raise HTTPException(status_code=500, detail=f"문서 저장 실패: {e}") from e

  return {
    **doc_info,
    "text_length": len(doc_text),
  }


@app.post("/api/chat/completions")
async def chat(req: ChatRequest, user_id: str = Depends(get_user_id)):
  """
  메인 채팅 엔드포인트 (통합 진입점)
  
  이 엔드포인트는 다음의 3가지 기능을 모두 처리하는 "통합 게이트웨이" 역할을 합니다:
  1. **일반 챗봇 (UI)**: 스트리밍 응답 (SSE), 세션 유지, RAG(문서 검색) 기능 사용.
  2. **Text-to-SQL (Java Service 호출)**: 스트리밍 미사용 (JSON 반환), 1회성 질문.
  3. **다국어 번역 (Java Service 호출)**: 스트리밍 미사용 (JSON 반환), 단순 번역.

  **왜 분리되지 않았나요?**
  - OpenAI API 클라이언트 설정, 인증(JWT), 기본 파라미터 처리 등의 공통 로직을 재사용하기 위함입니다.
  - 다만, SQL 변환이나 번역 요청 시에도 불필요한 '세션 생성' 및 'DB 저장'이 발생하는 구조적 특징이 있습니다.
  """
  require_openai()

  session_id = req.session_id
  if session_id:
    # [CHATBOT] 기존 세션이 있는 경우 (대화 이어가기)
    verify_session_owner(session_id, user_id)
  elif req.save_history:
    # [NEW CHAT] 세션 ID가 없고 기록 저장이 활성화된 경우에만 새로 생성
    session_id = create_session_db(user_id, derive_title_from_messages(req.messages))

  # [CHATBOT ONLY] RAG context (업로드된 문서가 있을 경우 검색 수행)
  # SQL이나 번역 요청은 document_ids를 보내지 않으므로 이 로직을 건너뜁니다.
  # session_id가 있어야 문서 필터링 가능 (문서는 세션에 귀속됨)
  context_snippets: List[str] = []
  if req.document_ids and session_id:
    try:
      allowed_doc_ids = filter_doc_ids_for_session(req.document_ids, session_id, user_id)
      # 마지막 사용자 메시지를 쿼리로 사용하여 유사 문서 검색
      chunks = search_similar_chunks(allowed_doc_ids, req.messages[-1].content if req.messages else "")
      context_snippets = [c["content"] for c in chunks]
    except Exception as e:
      logger.warning("문서 검색 실패: %s", e)

  kwargs = {
    "model": req.model,
    "messages": [m.model_dump() for m in req.messages],
    "stream": req.stream,
  }
  if req.temperature is not None:
    kwargs["temperature"] = req.temperature

  # 검색된 컨텍스트가 있으면 시스템 메시지에 추가
  if context_snippets:
    context_text = "\n\n".join([f"- {c}" for c in context_snippets])
    # 컨텍스트를 확실히 적용하기 위해 직전 사용자 메시지만 남기고 시스템에 문서 요약을 주입
    last_user = req.messages[-1].model_dump()
    kwargs["messages"] = [
      {
        "role": "system",
        "content": "업로드된 문서에서 추출한 내용입니다. 아래 문맥만을 근거로, 한국어로 간결하게 요약/분석하세요.\n"
        + context_text,
      },
      last_user,
    ]

  # [USER QUESTION] 사용자 질문을 DB에 저장 (저장 옵션 켜진 경우만)
  if req.save_history and session_id and req.messages and req.messages[-1].role == "user":
    add_message(session_id, "user", req.messages[-1].content)

  # [CHATBOT] 스트리밍 응답 처리 (SSE) -> Frontend UI에서 실시간 출력
  if req.stream:
    async def stream_generator():
      full_resp = []
      try:
        stream = client.chat.completions.create(**kwargs)
        for chunk in stream:
          content = chunk.choices[0].delta.content
          if content:
            # Frontend(ChatBotPage.tsx)는 OpenAI 표준 JSON 포맷을 파싱하므로 형식을 맞춰줍니다.
            yield f"data: {json.dumps({'choices': [{'delta': {'content': content}}]})}\n\n"
            full_resp.append(content)
        yield "data: [DONE]\n\n"
      except Exception as e:
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
      
      # 스트리밍이 끝나면 모아서 DB에 저장
      ai_msg = "".join(full_resp)
      if req.save_history and session_id and ai_msg:
        add_message(session_id, "assistant", ai_msg)
        touch_session(session_id)

    return StreamingResponse(stream_generator(), media_type="text/event-stream")

  # [SQL/TRANSLITER/API] 일반 응답 처리 (Non-streaming) -> Java Server 등이 JSON으로 받음
  else:
    try:
      resp = client.chat.completions.create(**kwargs)
      ai_msg = resp.choices[0].message.content
      
      # 응답을 DB에 저장 (저장 옵션 켜진 경우만)
      if req.save_history and session_id:
        add_message(session_id, "assistant", ai_msg)
        touch_session(session_id)
      
      # OpenAI 원본 응답 구조 그대로 반환 (Java 측에서 파싱)
      return resp
    except Exception as e:
      logger.exception("Chat completion failed")
      raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat/translate")
async def translate(req: TranslateRequest, user_id: str = Depends(get_user_id)):
  require_openai()
  kwargs = {
    "model": req.model,
    "messages": [m.model_dump() for m in req.messages],
    "stream": False,
  }
  if req.temperature is not None:
    kwargs["temperature"] = req.temperature

  try:
    completion = client.chat.completions.create(**kwargs)
    content = completion.choices[0].message.content or ""
    return {"choices": [{"message": {"content": content}}]}
  except OpenAIError as e:
    logger.error("OpenAI translate error: %s", e)
    raise HTTPException(status_code=502, detail=f"OpenAI error: {e}") from e
  except Exception as e:
    logger.exception("Unexpected translate error")
    raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


@app.post("/api/chat/sql")
async def generate_sql(req: ChatRequest, user_id: str = Depends(get_user_id)):
  require_openai()
  kwargs = {
    "model": req.model,
    "messages": [m.model_dump() for m in req.messages],
    "stream": False,
  }
  if req.temperature is not None:
    kwargs["temperature"] = req.temperature

  try:
    completion = client.chat.completions.create(**kwargs)
    content = completion.choices[0].message.content or ""
    return {"choices": [{"message": {"content": content}}]}
  except OpenAIError as e:
    logger.error("OpenAI sql-gen error: %s", e)
    raise HTTPException(status_code=502, detail=f"OpenAI error: {e}") from e
  except Exception as e:
    logger.exception("Unexpected sql-gen error")
    raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


@app.get("/")
async def root():
  return {"message": "AI Chat FastAPI Bridge. POST /api/chat/completions"}
