# HR Management

for Practice at bistel
***
## React TypeScript

### tsx기반의 React 빌드

Ag-grid(Community ver)를 사용한 차트 관리

`AgGridWrapper`를 default차트로 사용해 여러 페이지의 차트를 손쉽게 생성 가능\
기본적인 테마, ag-grid에서 제공하는 다양한 옵션들 설정

`EmployeeList`,`SalaryList`,`TaskList` 세개의 페이지로 나누어\
각각 사원 목록, 월급 지급 내역, 업무 목록을 표로 나타냄

>`EmployeeList`:
>사번을 PK로 가지는 사원 테이블 정보 표시 
>
>`SalaryList`:
>각 직원의 월급 지급 내역을 날짜별로 분류하여 상세 목록들 표시
>
>`TaskList`:
>회사의 업무들을 현재 상태와 함께 상세 내용들 표시

### Ag-grid에서 제공하는 옵션들

>Ag-grid 웹 사이트에서 theme custom후 가져오기\
> AgGridWrapper에 columnDef로 넘겨준 값들로 표 생성\
> AgGridWrapper에 rowData로 넘겨준 값들로 표 생성
> >Column Option\
> 클릭으로 오름, 내림차순 정렬 / shift를 누르고 다른 컬럼 누를 시 동시에 sorting가능\
> filter 옵션으로 컬럼 속성들 필터링 가능\
> floatingFilter 옵션으로 다양한 필터링 추가 / Equals, Does Not Equal, Contains, Does Not contain 등\
> resize로 컬럼 크기 조절 가능\
> editable 옵션 true로 설정 시 더블클릭으로 셀 값 수정 가능(실제 반영 X)\
> drag & drop 으로 컬럼 순서 변경, 컬럼 빼기 가능
>
> pagination, paginationPageSize로 자동 페이징, 기본적인 페이지 행 수 설정\
> **서버측에서 페이징을 한 후 Ag-grid에 전달 할 경우 페이징 불가** : 반드시 최초 요청 시 한번에 모든 데이터를 넘겨야 Ag-grid가 자동 페이징 가능\
> \
> CellValueChanged 라이브러리 추가하여 editable 옵션으로 변경된 셀 값 가져오기 가능\
> GirdApi 라이브러리 추가로 현재 grid 상태에 대한 api 받아오기 가능\
> CSV 파일로 Export
> Excel 파일 import

### 추가한 기능들
> Register 페이지들로 바로 데이터들 입력 가능\
> import 해온 Excel data 서버에 저장 후 데이터 통합\
> 로그인, 로그아웃 기능 추가\
> 로그인한 사용자에 따라 사용한 필터를 저장하는 사용자 개인화 적용\
> Menu 페이지 추가로 생성된 표들로 이동 가능\
> CellValueChanged로 가져온 값 서버측으로 넘겨, 즉각적으로 셀 데이터 수정 가능\
> 각 row 별로 삭제 버튼 추가하여 데이터 삭제

***

## Spring Boot

### Spring security, JPA, Jwt

Ag-grid를 사용하고 연습해보기 위한 프로젝트이기 때문에 front의 기능을 보조할 기능들만 구현

`Config`에서 SecurityFilter와 cors 설정
`Domain`들은 `Controller`, `DB`, `Service`,`Dto`로 나누어 관리

`Controller`와`Service`는 front의 요청에 맞는 기본적인 CRUD 응답 생성 후 전송\
`DB`는 Oracle Database와 연결하여 JPA Repository로 구성

***
## Oracle Database

### Oracle Database 21c Express

테이블은 총 6개로 구성\
`Department`,`Employee`,`Monthly_Salary`,`Status`,`Task`,`User_Filter`

현업에서 사용하는 큰 데이터들은 아니지만 연습해보기 위해 실무에서 자주 사용하는 반정규화 적용\
테이블의 컬럼 수는 늘리고, 제약 조건들을 완화하기 위해 FK도 설정하지 않음\
하지만 FK의 역할을 하는 컬럼은 생성 후 **Spring Boot** 내부적으로만 JoinColumn으로 사용

> `Department`
>
> | 컬럼명          | 데이터 타입           | NULL 허용 | 설명           | 순서 |
> |----------------|------------------------|-----------|----------------|------|
> | DEPT_ID        | NUMBER(8,0)            | No        | 부서 ID (기본키) | 1    |
> | DEPT_NAME      | VARCHAR2(100 BYTE)     | No        | 부서 이름        | 2    |
> | MANAGER_ID     | NUMBER(8,0)            | Yes       | 부서장 사번       | 3    |
> | PARENT_DEPT_ID | NUMBER(8,0)            | Yes       | 상위 부서 ID     | 4    |
> | DEPT_ADDRESS   | VARCHAR2(150 BYTE)     | No        | 부서 주소        | 5    |
>
> `Employee`
> 
> | 컬럼명         | 데이터 타입           | NULL 허용 | 설명               | 순서 |
> |----------------|------------------------|-----------|--------------------|------|
> | EMP\_ID         | NUMBER(8,0)            | No        | 직원 고유 ID (기본키) | 1    |
> | FIRST\_NAME     | VARCHAR2(10 BYTE)      | No        | 이름                | 2    |
> | LAST\_NAME      | VARCHAR2(10 BYTE)      | No        | 성                  | 3    |
> | ENG\_NAME       | VARCHAR2(20 BYTE)      | Yes       | 영문 이름           | 4    |
> | HIRE\_DATE      | DATE                   | No        | 입사일              | 5    |
> | QUIT\_DATE      | DATE                   | Yes       | 퇴사일              | 6    |
> | DEPT\_ID        | NUMBER(8,0)            | Yes       | 부서 ID (외래키)      | 7    |
> | ANNUAL\_SALARY  | NUMBER(13,0)           | Yes       | 연봉                | 8    |
> | EMAIL          | VARCHAR2(50 BYTE)      | Yes       | 이메일              | 9    |
> | STATUS\_CODE    | VARCHAR2(20 BYTE)      | Yes       | 재직 상태 코드       | 10   |
> | ADDRESS        | VARCHAR2(150 BYTE)     | Yes       | 주소                | 11   |
> | SSN            | VARCHAR2(14 BYTE)      | No        | 주민등록번호         | 12   |
> | PHONE\_NUMBER   | VARCHAR2(20 BYTE)      | Yes       | 전화번호             | 13   |
> | POSITION       | VARCHAR2(20 BYTE)      | Yes       | 직위                | 14   |
> | PASSWORD       | VARCHAR2(150 BYTE)     | No        | 로그인 비밀번호       | 15   |
> | ID             | VARCHAR2(30 BYTE)      | No        | 로그인 ID           | 16   |
> 
> `Monthly_Salary`
> 
> | 컬럼명                   | 데이터 타입      | NULL 허용 | 설명                    | 순서 |
> |--------------------------|------------------|-----------|-------------------------|------|
> | MONTHLY\_SALARY\_ID        | NUMBER(8,0)       | No        | 월급여 고유 ID (기본키)     | 1    |
> | BASE\_SALARY              | NUMBER(11,0)      | Yes       | 기본급                   | 2    |
> | MEAL\_ALLOW               | NUMBER(11,0)      | Yes       | 식대 수당                | 3    |
> | TRANSPORT\_ALLOW          | NUMBER(11,0)      | Yes       | 교통비 수당              | 4    |
> | COMM                     | NUMBER(11,0)      | Yes       | 커미션                  | 5    |
> | PAYMENT\_OTHERS           | NUMBER(11,0)      | Yes       | 기타 지급액              | 6    |
> | NATIONAL\_PENSION         | NUMBER(11,0)      | Yes       | 국민연금 공제액           | 7    |
> | HEALTH\_INSURANCE         | NUMBER(11,0)      | Yes       | 건강보험 공제액           | 8    |
> | EMPLOYMENT\_INSURANCE     | NUMBER(11,0)      | Yes       | 고용보험 공제액           | 9    |
> | LONGTERM\_CARE\_INSURANCE  | NUMBER(11,0)      | Yes       | 장기요양보험 공제액        | 10   |
> | INCOME\_TAX               | NUMBER(11,0)      | Yes       | 소득세 공제액             | 11   |
> | LOCAL\_INCOME\_TAX         | NUMBER(11,0)      | Yes       | 지방소득세 공제액          | 12   |
> | DEDUCTION\_OTHERS         | NUMBER(11,0)      | Yes       | 기타 공제액              | 13   |
> | EMP\_ID                   | NUMBER(8,0)       | No        | 직원 ID (외래키)         | 14   |
> | PAY\_DATE                 | DATE              | Yes       | 급여 지급일              | 15   |
> 
> `Status`
> 
> | 컬럼명              | 데이터 타입           | NULL 허용 | 설명                 | 순서 |
> |---------------------|------------------------|-----------|----------------------|------|
> | STATUS\_CODE         | VARCHAR2(20 BYTE)      | No        | 상태 코드 (기본키)       | 1    |
> | STATUS\_NAME         | VARCHAR2(20 BYTE)      | No        | 상태 이름              | 2    |
> | STATUS\_DESCRIPTION  | VARCHAR2(100 BYTE)     | Yes       | 상태 설명              | 3    |
> | TYPE                | VARCHAR2(20 BYTE)      | Yes       | 코드 유형 구분 (예: 재직/휴직) | 4    |
> 
> `Task`
> 
> | 컬럼명            | 데이터 타입           | NULL 허용 | 설명                    | 순서 |
> |-------------------|------------------------|-----------|-------------------------|------|
> | TASK\_ID           | NUMBER(8,0)            | No        | 업무 고유 ID (기본키)       | 1    |
> | TASK\_TITLE        | VARCHAR2(100 BYTE)     | No        | 업무 제목                  | 2    |
> | START\_DATE        | DATE                   | Yes       | 업무 시작일                | 3    |
> | DUE\_DATE          | DATE                   | Yes       | 마감일                   | 4    |
> | STATUS\_CODE       | VARCHAR2(20 BYTE)      | Yes       | 업무 상태 코드 (외래키)      | 5    |
> | PRIORITY          | NUMBER(2,0)            | Yes       | 우선순위 (1: 높음, 2: 보통, 3: 낮음 등) | 6    |
> | TASK\_DESCRIPTION  | CLOB                   | Yes       | 업무 상세 설명              | 7    |
> | ASSIGNED\_DATE     | DATE                   | Yes       | 업무 할당일                | 8    |
> | EMP\_ID            | NUMBER(8,0)            | No        | 담당자 ID (외래키)          | 9    |
> 
> `User_Filter`
> 
> | 컬럼명        | 데이터 타입           | NULL 허용 | 설명                          | 순서 |
> |---------------|------------------------|-----------|-------------------------------|------|
> | EMP\_ID        | NUMBER                 | No        | 사용자 ID (외래키)               | 1    |
> | TABLE\_NAME    | VARCHAR2(50 BYTE)      | No        | 필터가 적용된 테이블명             | 2    |
> | FILTER\_NAME   | VARCHAR2(100 BYTE)     | No        | 필터 이름 또는 컬럼명              | 3    |
> | FILTER\_VALUE  | VARCHAR2(100 BYTE)     | Yes       | 필터 값 (ex. "Active")          | 4    |
> | VALUE\_TYPE    | VARCHAR2(30 BYTE)      | Yes       | 필터 값의 타입 (ex. string, number) | 5    |
> | FILTER\_TYPE   | VARCHAR2(30 BYTE)      | No        | 필터 방식 (ex. equals, contains)  | 6    |