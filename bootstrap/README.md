
# 🧾 HR Management System

> React(AG Grid + Bootstrap) + Spring Boot + Oracle 기반의 직원/업무/급여 관리 웹 어플리케이션

## 📌 프로젝트 개요
이 프로젝트는 기업의 인사 관리 시스템(HRMS)을 웹 기반으로 구현한 시스템입니다.  
직원 등록, 업무 배정, 월급 지급 등 기본적인 HR 업무를 **편리하게 관리**할 수 있도록 구성되었습니다.

---

## 🔧 주요 기능

| 기능 영역 | 설명                                    |
|-----------|---------------------------------------|
| 👥 직원 관리 | 직원 목록 조회, 등록, 수정, 필터링 (AG Grid 기반)    |
| 📋 업무 관리 | 업무 등록, 업무 리스트 확인 및 필터링                |
| 💰 급여 지급 | 사번 기준 월급 지급 처리 및 이력 확인                |
| 🔐 인증 및 보안 | JWT토큰과 Spring SecurityFilter를 사용한 로그인 |

---

## 🛠 사용 기술 스택

### 🖥️ Frontend
- **React** (TypeScript)
- **AG Grid** (Community Edition)
- **React-Bootstrap** (UI 구성)
- **Axios** (API 통신)
- **React Router DOM** (페이지 라우팅)

### ⚙️ Backend
- **Spring Boot 3.4**
- **Spring MVC (REST API)**
- **Spring Data JPA + Hibernate**
- **Oracle DB**
- **CORS / Session 설정**

### 🗃️ Database
- **Oracle Database**
- 테이블: `EMPLOYEE`, `TASK`, `MONTHLY_SALARY`, `USER_LOGIN`,  `DEPARTMENT`, 

---

[//]: # (## 📁 프로젝트 구조)

[//]: # ()
[//]: # (```)

[//]: # (hr_management/)

[//]: # (├── backend/)

[//]: # (│   ├── src/main/java/com/example/hr/)

[//]: # (│   │   ├── controller/)

[//]: # (│   │   ├── service/)

[//]: # (│   │   ├── repository/)

[//]: # (│   │   └── entity/)

[//]: # (│   └── application.yml)

[//]: # (│)

[//]: # (├── frontend/)

[//]: # (│   ├── src/)

[//]: # (│   │   ├── pages/                 # 페이지별 컴포넌트)

[//]: # (│   │   ├── components/            # 공통 컴포넌트 &#40;AgGridWrapper 등&#41;)

[//]: # (│   │   ├── hooks/                 # 커스텀 훅)

[//]: # (│   │   ├── api/                   # axios 통신 모듈)

[//]: # (│   │   └── App.tsx, index.tsx)

[//]: # (│   └── public/)

[//]: # (└── README.md)

[//]: # (```)

[//]: # ()
[//]: # (---)

## ⚙️ 실행 방법

### 1. Backend 실행 (Spring Boot)

```bash
# IntelliJ / Eclipse 로 import
# 또는 CLI:
cd backend
./mvnw spring-boot:run
```

- `application.yml` 또는 `application.properties` 에 Oracle 접속 정보 설정
- 접속 요구 정보는 따로 기재

```yaml
spring:
  config:
    import: optional:file:.env[.properties]
  jackson:
    time-zone: Asia/Seoul

  datasource:
    url: jdbc:oracle:thin:@//${DB_HOST}:${DB_PORT}/XEPDB1
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: oracle.jdbc.OracleDriver

  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    database: oracle
    generate-ddl: false
```

---

### 2. Frontend 실행 (React)

```bash
cd frontend
npm install
npm run dev
```

- `.env` 파일에서 백엔드 API 주소 설정 필요 (예: `VITE_API_BASE_URL=http://localhost:8080`)

---

## ✅ 구현 완료된 페이지

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 로그인 | `/` 또는 `/login` | 사용자 인증 |
| 메뉴 | `/menu` | 기능 진입 버튼 |
| 직원 목록 | `/employee` | AG Grid + 검색/정렬 |
| 직원 등록 | `/employee/register` | 신규 등록 폼 |
| 업무 목록 | `/task` | 업무 조회 |
| 업무 등록 | `/task/register` | 상태 선택, 업무 설명 등 |
| 급여 내역 | `/salary` | 월급 지급 이력 |
| 급여 지급 | `/salary/payment/:empId` | 사원별 월급 지급 폼 |

---

## 🧪 테스트 계정 (예시)

```
ID: admin
PW: 1234
```

---

## ✨ 프로젝트 특징

- AG Grid를 활용한 **고성능 그리드 UI** 구현
- Axios 기반의 **RESTful API 통신**
- React-Bootstrap을 통한 **모던한 UI 구성**
- Oracle DB 연동 + JPA 기반 CRUD 처리
- 확장 가능한 구조 (권한/관리자 기능 등 추가 가능)

---

## 📌 향후 개선점

- 부서/직급 관리 기능 추가
- 월급 정산 내역 자동 계산 기능
- AG Grid 엔터프라이즈 기능 적용 (피벗, 그룹핑 등)

---

[//]: # (## 📃 라이선스)

[//]: # ()
[//]: # (본 프로젝트는 학습 및 포트폴리오 용도로 자유롭게 활용 가능합니다.)
