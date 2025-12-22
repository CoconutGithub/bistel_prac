import json
import logging
import os
from datetime import datetime
from io import BytesIO
from typing import List, Literal, Optional
from uuid import uuid4, UUID
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Header, HTTPException, Request, Response, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAI, OpenAIError
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text as sa_text
from sqlalchemy.engine import Engine
from PyPDF2 import PdfReader

# ---------- Config / Env ----------

load_dotenv(dotenv_path=os.getenv("ENV_FILE", ".env"))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
DB_SCHEMA = os.getenv("DB_SCHEMA", "dev")
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALG = os.getenv("JWT_ALG", "HS256")
JWT_IS_BASE64 = os.getenv("JWT_IS_BASE64", "true").lower() in ("1", "true", "yes")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:9090")
MAX_UPLOAD_MB = float(os.getenv("MAX_UPLOAD_MB", "10"))
EMBED_MODEL = os.getenv("EMBED_MODEL", "text-embedding-3-small")

logger = logging.getLogger("fastapi-chat")
logging.basicConfig(level=logging.INFO)

# ---------- Models ----------


class Message(BaseModel):
  role: Literal["system", "user", "assistant"]
  content: str


class ChatRequest(BaseModel):
  messages: List[Message] = Field(..., description="Chat history compatible with OpenAI Chat API")
  model: str = Field(default="gpt-5-mini", description="OpenAI model name")
  stream: bool = Field(default=True, description="Whether to stream the response via SSE")
  temperature: Optional[float] = Field(default=None, ge=0, le=2, description="Omit to use model default")
  session_id: Optional[str] = Field(default=None, description="Existing session id. If absent, a new session will be created.")
  document_ids: Optional[List[str]] = Field(default=None, description="Uploaded document ids to use for context (must belong to this session)")

class TranslateRequest(BaseModel):
  messages: List[Message] = Field(..., description="Translation messages compatible with OpenAI Chat API")
  model: str = Field(default="gpt-5-mini", description="OpenAI model name")
  temperature: Optional[float] = Field(default=None, ge=0, le=2, description="Omit to use model default")


# ---------- DB / OpenAI init ----------


def sanitize_db_url(url: str, default_schema: str = "dev"):
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

client: Optional[OpenAI] = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
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
  if client is None:
    raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured on the server.")


def require_db():
  if engine is None:
    raise HTTPException(status_code=500, detail="DATABASE_URL is not configured on the server.")


def get_user_id(authorization: Optional[str] = Header(None)):
  if not authorization or not authorization.startswith("Bearer "):
    logger.warning("Authorization header missing or malformed")
    raise HTTPException(status_code=401, detail="Authorization header is missing")
  if not JWT_SECRET:
    logger.error("JWT_SECRET not configured")
    raise HTTPException(status_code=500, detail="JWT_SECRET is not configured")
  token = authorization.split(" ", 1)[1]
  try:
    key: str | bytes
    if JWT_IS_BASE64:
      import base64
      key = base64.urlsafe_b64decode(JWT_SECRET + "==")
    else:
      key = JWT_SECRET
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
  for m in msgs:
    if m.role == "user":
      return m.content[:50] or "새 대화"
  return "새 대화"


def list_sessions_db(user_id: str):
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
  """Ensure doc_ids belong to this session & user."""
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


@app.get("/healthz")
async def healthz():
  return {"status": "ok"}


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
  return {"id": session_id, "messages": msgs}


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


@app.post("/api/chat/upload-pdf")
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
  require_openai()

  session_id = req.session_id
  if session_id:
    verify_session_owner(session_id, user_id)
  else:
    session_id = create_session_db(user_id, derive_title_from_messages(req.messages))

  # RAG context
  context_snippets: List[str] = []
  if req.document_ids:
    try:
      allowed_doc_ids = filter_doc_ids_for_session(req.document_ids, session_id, user_id)
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
      {"role": "user", **last_user},
    ]

  if req.messages:
    add_message(session_id, "user", req.messages[-1].content)

  if req.stream:
    def event_stream():
      assistant_text = ""
      try:
        response = client.chat.completions.create(**kwargs)
        for chunk in response:
          delta = chunk.choices[0].delta.content or ""
          assistant_text += delta
          yield f"data: {json.dumps({'choices': [{'delta': {'content': delta}}]})}\n\n"
        add_message(session_id, "assistant", assistant_text or "")
        touch_session(session_id, derive_title_from_messages(req.messages))
        yield "data: [DONE]\n\n"
      except OpenAIError as e:
        logger.error("OpenAI streaming error: %s", e)
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
        yield "data: [DONE]\n\n"
      except Exception as e:
        logger.exception("Unexpected streaming error")
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")

  try:
    completion = client.chat.completions.create(**kwargs)
    content = completion.choices[0].message.content or ""
    add_message(session_id, "assistant", content)
    touch_session(session_id, derive_title_from_messages(req.messages))
    return {"session_id": session_id, "choices": [{"message": {"content": content}}]}
  except OpenAIError as e:
    logger.error("OpenAI error: %s", e)
    raise HTTPException(status_code=502, detail=f"OpenAI error: {e}") from e
  except Exception as e:
    logger.exception("Unexpected error")
    raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


@app.post("/api/chat/translate")
async def translate(req: TranslateRequest, user_id: str = Depends(get_user_id)):
  """
  Lightweight translation endpoint: no session creation, no history persistence.
  """
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


@app.get("/")
async def root():
  return {"message": "AI Chat FastAPI Bridge. POST /api/chat/completions"}
