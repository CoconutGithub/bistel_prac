# AI Chatbot Integration Guide

이 프로젝트는 `/main/ai-chat` 경로에 ChatGPT 스타일의 챗봇 UI를 포함합니다. 아래 순서대로 FastAPI 브릿지와 OpenAI Chat Completions를 연결하세요.

## 1) venv설정

초기 venv설치
```py -3 -m venv .venv```

## 2) 의존성 패키지 설치

requirements.txt설치
```pip install -r requirements.txt```

## 3) 가상환경에서 FastAPI실행

```.\.venv\Scripts\activate ```

```uvicorn main:app --reload --port 8000 --env-file .env```

## 4) 의존성 변경 시

의존성 변경시 requirements.txt수정 후
```pip install --upgrade --force-reinstall -r requirements.txt```

재실행
```uvicorn main:app --reload --port 8000 --env-file .env```