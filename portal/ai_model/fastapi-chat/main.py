import json
import logging
import os
from datetime import datetime
from typing import List, Literal, Optional
from uuid import uuid4
from urllib.parse import urlparse, parse_qsl, urlencode, urlunparse

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi import Response, Request
from openai import OpenAI, OpenAIError
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine

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


# ---------- Env & clients ----------

# Load environment variables (.env) before reading keys
load_dotenv(dotenv_path=os.getenv("ENV_FILE", ".env"))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")


def sanitize_db_url(url: str, default_schema: str = "dev"):
  """
  Strip unsupported params like currentSchema (psycopg3) and derive search_path.
  """
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
DB_SEARCH_PATH = os.getenv("DB_SCHEMA", "dev")
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

app = FastAPI(title="AI Chat FastAPI Bridge", version="0.2.0")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:9090").split(",")
app.add_middleware(
  CORSMiddleware,
  allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

logger = logging.getLogger("fastapi-chat")
logging.basicConfig(level=logging.INFO)


# ---------- Helpers ----------

def require_openai():
  if client is None:
    raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured on the server.")


def require_db():
  if engine is None:
    raise HTTPException(status_code=500, detail="DATABASE_URL is not configured on the server.")


def get_user_id(x_user_id: Optional[str] = Header(None)):
  # 실제 서비스에서는 JWT 디코딩 등으로 교체
  if not x_user_id:
    raise HTTPException(status_code=401, detail="X-User-Id header is required")
  return x_user_id


def derive_title_from_messages(msgs: List[Message]) -> str:
  for m in msgs:
    if m.role == "user":
      return m.content[:50] or "새 대화"
  return "새 대화"


def list_sessions_db(user_id: str):
  require_db()
  with engine.connect() as conn:
    result = conn.execute(
      text(
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
      text(
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
      text("SELECT user_id FROM dev.chat_sessions WHERE id = :id"),
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
      text(
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
      text(
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
        text(
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
        text(
          """
          UPDATE dev.chat_sessions
             SET updated_at = :updated_at
           WHERE id = :id
          """
        ),
        {"updated_at": datetime.utcnow(), "id": session_id},
      )


# ---------- Routes ----------


@app.options("/{full_path:path}")
async def preflight(full_path: str, request: Request):
  # Allow CORS preflight without auth header requirement and include CORS headers
  origin = request.headers.get("origin", "")
  if origin and origin in [o.strip() for o in allowed_origins]:
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
    conn.execute(
      text("DELETE FROM dev.chat_sessions WHERE id = :id"),
      {"id": session_id},
    )
  return {"id": session_id, "deleted": True}


@app.post("/api/chat/completions")
async def chat(req: ChatRequest, user_id: str = Depends(get_user_id)):
  require_openai()

  # Resolve session
  session_id = req.session_id
  if session_id:
    verify_session_owner(session_id, user_id)
  else:
    session_id = create_session_db(user_id, derive_title_from_messages(req.messages))

  # Save user message (last one is current question)
  if req.messages:
    add_message(session_id, "user", req.messages[-1].content)

  # Build OpenAI kwargs
  kwargs = {
    "model": req.model,
    "messages": [m.model_dump() for m in req.messages],
    "stream": req.stream,
  }
  if req.temperature is not None:
    kwargs["temperature"] = req.temperature

  if req.stream:
    def event_stream():
      assistant_text = ""
      try:
        response = client.chat.completions.create(**kwargs)
        for chunk in response:
          delta = chunk.choices[0].delta.content or ""
          assistant_text += delta
          yield f"data: {json.dumps({'choices': [{'delta': {'content': delta}}]})}\n\n"
        # persist assistant message after stream ends
        add_message(session_id, "assistant", assistant_text or "")
        touch_session(session_id, derive_title_from_messages(req.messages))
        yield "data: [DONE]\n\n"
      except OpenAIError as e:
        logger.error("OpenAI streaming error: %s", e)
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
        yield "data: [DONE]\n\n"
      except Exception as e:  # pylint: disable=broad-except
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
  except Exception as e:  # pylint: disable=broad-except
    logger.exception("Unexpected error")
    raise HTTPException(status_code=500, detail=f"Unexpected error: {e}") from e


@app.get("/")
async def root():
  return {"message": "AI Chat FastAPI Bridge. POST /api/chat/completions"}
