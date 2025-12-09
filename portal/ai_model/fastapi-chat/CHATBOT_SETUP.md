# AI Chatbot Integration Guide

이 프로젝트는 `/main/ai-chat` 경로에 ChatGPT 스타일의 챗봇 UI를 포함합니다. 아래 순서대로 FastAPI 브릿지와 OpenAI Chat Completions를 연결하세요.

## 1) 프런트엔드 설정
- `.env`에 엔드포인트 지정:
  - `REACT_APP_CHAT_API_URL=http://localhost:8000/api/chat`
- 호출 규격 (`POST {REACT_APP_CHAT_API_URL}/completions`)
  ```json
  {
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }
  ```
  - 기본적으로 SSE(`text/event-stream`)를 기대합니다. SSE가 없으면 `choices[0].message.content`가 담긴 JSON도 처리합니다.

## 2) FastAPI 브릿지 실행 예시
- 샘플 서버 코드 위치: `ai_model/fastapi-chat/main.py`
- 의존성: `ai_model/fastapi-chat/requirements.txt`
- 실행:
  ```bash
  cd ai_model/fastapi-chat
  python -m venv .venv && .\.venv\Scripts\activate    # Windows 기준
  pip install -r requirements.txt
  set OPENAI_API_KEY=sk-...                           # 또는 .env 사용
  uvicorn main:app --reload --port 8000
  ```
- Spring과 통합: 게이트웨이/리버스 프록시에서 `/api/chat/**`를 FastAPI로 포워딩하면 인증·세션 일관성을 유지할 수 있습니다.

## 3) FastAPI 엔드포인트 규격 (요약)
- `POST /api/chat/completions`
  - 요청: `{ "messages": [{ "role": "user"|"assistant"|"system", "content": "..." }], "stream": true, "model": "gpt-4o-mini", "temperature": 0.7 }`
  - 응답: SSE(`data: {...}\n\n`) 혹은 JSON `{ "choices":[{"message":{"content":"..."}}] }`
- 헬스체크: `GET /healthz`

## 4) 향후 이미지/PDF 분석 확장
- 동일 FastAPI 서비스에 `/api/chat/images`, `/api/chat/documents` 등의 엔드포인트를 추가하면 됩니다. 프런트는 `REACT_APP_CHAT_API_URL`만 동일하게 사용하면 호환됩니다.
- 업로드 시 파일 ID나 서명 URL을 반환하고, 대화 `messages`에 참조를 넣어 모델이나 RAG 파이프라인이 활용하도록 설계하세요.

## 5) 권장 DB 스키마 (대화 이력/감사)
- `chat_sessions(id PK, user_id, title, created_at, updated_at)`
- `chat_messages(id PK, session_id FK, role (user|assistant|system), content text, created_at)`
- `chat_attachments(id PK, message_id FK, type (pdf|image|other), url_or_path, meta jsonb, created_at)`
