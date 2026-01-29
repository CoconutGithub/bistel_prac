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

## 5) uvicorn 안꺼질 때

python으로 실행 중인 프로세스 찾가
```tasklist /FI "IMAGENAME eq python.exe"```

그리고 종료(하나씩 종료)
```taskkill /F /PID <PID>```

## 6) 데이터베이스 공유 (Migration)

### 6-1) 백업 (덤프 생성)
현재 환경 터미널(PowerShell)에서 실행:
```powershell
pg_dump -h localhost -p 5432 -U postgres -d SIPortal2 > dump.sql
```
* 비밀번호 입력 필요

### 6-2) 복원 (Restore)
새로운 환경의 터미널(PowerShell)에서 실행:

1. 먼저 PostgreSQL에 접속해서 DB 생성 (만약 없다면)
   ```sql
   -- psql 접속 후 실행
   CREATE DATABASE <db name>;
   ```

2. 덤프 파일로 복원 실행
   ```powershell
   # -f 옵션으로 파일 지정
   psql -h localhost -U postgres -d SIPortal2 -f dump.sql
   ```
* 오류 발생 시 사용자/권한 확인 필요
