네, 알겠습니다. 우리가 함께 진행한 모든 내용을 바탕으로, 다른 사람들이나 미래의 자신을 위해 프로젝트를 설명하는 `README.md` 파일을 작성해 드리겠습니다.

Markdown 형식이므로 그대로 복사하여 프로젝트 루트 폴더에 `README.md` 파일로 저장하시면 됩니다.

-----

# 반도체 공장 설비 정보 대시보드

이 프로젝트는 반도체 공장의 생산 라인, 공정, 설비 데이터를 계층적으로 조회하고, 특정 설비의 상세 파라미터 정보를 확인할 수 있는 웹 애플리케이션입니다.

## 📅 프로젝트 주요 기능

* **계단식 데이터 조회**: 라인(Line) 선택 시 해당 라인의 공정(Process) 목록이, 공정 선택 시 해당 공정의 설비(Equipment) 목록이 동적으로 필터링되어 드롭다운에 표시됩니다.
* **마스터-디테일 뷰**: 메인 그리드에서 특정 설비를 선택하면, 해당 설비에 설정된 파라미터와 값들을 상세 그리드에서 확인할 수 있습니다.
* **강력한 데이터 그리드**: AG-Grid 라이브러리를 사용하여 대용량 데이터를 효율적으로 표시하고, 정렬, 필터링 등의 기능을 제공합니다.
* **커스텀 테마**: AG-Grid 테마 빌더를 통해 생성된 맞춤형 UI 테마를 적용하여 사용자 경험을 개선했습니다.

## 🛠️ 기술 스택

| 구분      | 기술                                                                                                |
| :-------- |:--------------------------------------------------------------------------------------------------|
| **Frontend** | `React`, `TypeScript`, `AG-Grid Community`, `axios`                                               |
| **Backend** | `Spring Boot`, `Spring Data JPA`, `Java`                                                          |
| **Database** | `Oracle`                                                                                          |
| **Build Tools** | `Create React App`, `Gradle`                                                                      |

## 📁 프로젝트 구조

```
.
├── backend/
│   └── src/main/java/com/prac/semiconductor/
│       ├── Domain/          -- JPA Entity 클래스 (Line, Process, Equipment 등)
│       ├── dto/             -- 데이터 전송 객체 (LineDto, ProcessDto 등)
│       ├── repository/      -- Spring Data JPA 리포지토리
│       ├── service/         -- 비즈니스 로직 서비스
│       └── controller/      -- API 엔드포인트 컨트롤러
│
└── frontend/
    └── src/
        ├── components/      -- 재사용 가능한 React 컴포넌트
        ├── pages/           -- 메인 페이지 컴포넌트 (EquipmentGrid.tsx)
        ├── data.ts          -- 프론트엔드에서 사용하는 TypeScript 타입 정의
        ├── index.tsx        -- 애플리케이션 진입점 (AG-Grid 모듈 등록 및 전역 CSS import)
        └── App.tsx          -- 메인 애플리케이션 컴포넌트
```

## 🚀 시작하기

### 1\. 데이터베이스 설정

1.  프로젝트와 함께 제공된 DDL 스크립트를 실행하여 `LINE`, `PROCESS`, `EQUIPMENT`, `PARAMETER`, `SETVALUE` 테이블을 생성합니다.
2.  테스트 데이터가 필요한 경우, 함께 제공된 PL/SQL 스크립트를 실행하여 샘플 데이터를 생성합니다.
    * **주의**: PL/SQL 스크립트 실행 시 SQL 클라이언트(SQL\*Plus, DBeaver 등)에서 `&` 문자로 인한 프롬프트가 뜰 수 있으므로, 스크립트 시작 전에 `SET DEFINE OFF;` 명령을 실행하는 것이 좋습니다.

### 2\. 백엔드 실행

1.  `backend/` 디렉토리로 이동합니다.
2.  `src/main/resources/application.properties` (또는 `.yml`) 파일에 자신의 Oracle 데이터베이스 접속 정보를 입력합니다.
    ```properties
    spring.datasource.url=jdbc:oracle:thin:@//localhost:1521/XE
    spring.datasource.username=your_username
    spring.datasource.password=your_password
    spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
    spring.jpa.hibernate.ddl-auto=validate
    ```
3.  아래 명령어를 사용하거나 IDE의 실행 버튼을 눌러 Spring Boot 애플리케이션을 시작합니다.
    ```bash
    # Maven 사용 시
    ./mvnw spring-boot:run

    # Gradle 사용 시
    ./gradlew bootRun
    ```
    서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

### 3\. 프론트엔드 실행

1.  새로운 터미널을 열고 `frontend/` 디렉토리로 이동합니다.
2.  필요한 패키지를 설치합니다.
    ```bash
    npm install
    ```
3.  `package.json` 파일을 열어, CORS(Cross-Origin Resource Sharing) 문제를 피하기 위한 프록시 설정을 추가합니다.
    ```json
    {
      ...
      "proxy": "http://localhost:8080"
    }
    ```
4.  아래 명령어로 React 개발 서버를 시작합니다.
    ```bash
    npm start
    ```
    애플리케이션은 `http://localhost:3000`에서 열립니다.

## 📝 API 엔드포인트

| Method | URL                  | 설명                                 |
| :----- | :------------------- | :----------------------------------- |
| `GET`  | `/lines/factory-data` | 모든 라인, 공정, 설비, 파라미터 데이터를 계층 구조로 조회합니다. |

## 🌟 향후 개선 과제

- [ ] 그리드 데이터에 대한 CRUD(생성, 읽기, 수정, 삭제) 기능 추가
- [ ] 선택된 설비의 파라미터 값 변경 이력 조회 기능
- [ ] 차트 라이브러리(e.g., Chart.js, ECharts)를 연동하여 파라미터 데이터 시각화
- [ ] 사용자 인증 및 권한 관리 기능 도입