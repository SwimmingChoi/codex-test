# Daily Todo

Daily Todo는 날짜별로 할 일을 생성, 조회, 완료 체크, 수정, 삭제할 수 있는 1인용 로컬 웹 서비스입니다.

## 기술 스택

- Frontend: React + TypeScript + Vite
- Backend: FastAPI + Python
- DB: SQLite
- ORM: SQLAlchemy
- API 문서: FastAPI Swagger (`/docs`)
- Style: 기본 CSS

## 프로젝트 구조

```text
backend/
  app/
    main.py
    database.py
    models.py
    schemas.py
    crud.py
    routers/
      todos.py
  requirements.txt
frontend/
  src/
    App.tsx
    api.ts
    types.ts
    main.tsx
    App.css
  package.json
  vite.config.ts
README.md
```

## Backend 실행

1. `backend` 폴더로 이동합니다.

   ```bash
   cd backend
   ```

2. 가상환경을 생성하고 활성화합니다.

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```

   Windows PowerShell에서는 다음 명령을 사용합니다.

   ```powershell
   .venv\Scripts\Activate.ps1
   ```

3. requirements를 설치합니다.

   ```bash
   pip install -r requirements.txt
   ```

4. FastAPI 서버를 실행합니다.

   ```bash
   uvicorn app.main:app --reload
   ```

5. 브라우저에서 API 문서를 확인할 수 있습니다.

   - Swagger UI: <http://localhost:8000/docs>
   - Health check: <http://localhost:8000/api/health>

SQLite DB 파일은 앱 시작 시 자동으로 `backend/todos.db`에 생성됩니다.

## Frontend 실행

1. `frontend` 폴더로 이동합니다.

   ```bash
   cd frontend
   ```

2. npm 패키지를 설치합니다.

   ```bash
   npm install
   ```

3. 개발 서버를 실행합니다.

   ```bash
   npm run dev
   ```

4. 브라우저에서 <http://localhost:5173>으로 접속합니다.

프론트엔드는 기본적으로 `http://localhost:8000`의 백엔드 API를 호출합니다. 다른 주소를 사용하려면 `frontend/.env`에 다음처럼 설정하세요.

```env
VITE_API_BASE_URL=http://localhost:8000
```


## 실행 확인 방법

백엔드와 프론트엔드가 실제로 연결되는지 확인하려면 터미널 2개를 사용하세요.

### 1. 백엔드 확인

첫 번째 터미널에서 백엔드를 실행합니다.

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

정상 실행되면 다음 주소에서 확인할 수 있습니다.

- Health check: <http://localhost:8000/api/health>
  - 기대 응답: `{"status":"ok"}`
- Swagger API 문서: <http://localhost:8000/docs>
  - `/api/todos` API를 브라우저에서 직접 테스트할 수 있습니다.

터미널에서 바로 확인하려면 아래 명령을 실행하세요.

```bash
curl http://localhost:8000/api/health
curl "http://localhost:8000/api/todos?date=2026-05-13"
```

### 2. 프론트엔드 확인

두 번째 터미널에서 프론트엔드를 실행합니다.

```bash
cd frontend
npm run dev
```

정상 실행되면 브라우저에서 <http://localhost:5173>으로 접속해 다음 흐름을 확인하세요.

1. 오늘 날짜가 기본 선택되어 보이는지 확인합니다.
2. 입력창에 할 일을 작성하고 `추가` 버튼을 누릅니다.
3. 추가한 할 일이 목록에 바로 나타나는지 확인합니다.
4. 체크박스를 눌러 완료 상태와 취소선이 반영되는지 확인합니다.
5. `수정`, `삭제` 버튼이 동작하는지 확인합니다.
6. 이전/다음 날짜 버튼 또는 date picker로 날짜를 바꾼 뒤, 날짜별 목록이 따로 유지되는지 확인합니다.
7. 페이지를 새로고침해도 DB에 저장된 할 일이 다시 보이는지 확인합니다.

### 3. API로 직접 생성/수정/삭제 확인

프론트엔드 없이도 아래 명령으로 API와 DB 저장 동작을 확인할 수 있습니다.

```bash
# 생성
curl -X POST http://localhost:8000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"task_date":"2026-05-13","title":"README 검증용 할 일"}'

# 조회
curl "http://localhost:8000/api/todos?date=2026-05-13"

# 완료 처리: 위 생성 응답의 id로 1을 바꿔 실행
curl -X PATCH http://localhost:8000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"is_done":true}'

# 삭제: 위 생성 응답의 id로 1을 바꿔 실행
curl -X DELETE http://localhost:8000/api/todos/1
```

DB 파일은 백엔드 실행 후 `backend/todos.db`에 생성됩니다.

## REST API

- `GET /api/todos?date=YYYY-MM-DD`: 특정 날짜의 할 일 목록 조회
- `POST /api/todos`: 할 일 생성
  - body: `{ "task_date": "YYYY-MM-DD", "title": "..." }`
- `PATCH /api/todos/{todo_id}`: 할 일 내용 또는 완료 상태 수정
  - body: `{ "title": "...", "is_done": true }`
- `DELETE /api/todos/{todo_id}`: 할 일 삭제

## 주요 기능

- 오늘 날짜 기본 선택 및 날짜 선택기 제공
- 이전 날짜/다음 날짜 이동
- 날짜별 할 일 목록 저장 및 조회
- 빈 값 생성을 막는 할 일 추가
- 완료 체크/해제 및 완료 항목 취소선 표시
- 할 일 내용 수정 및 삭제
- “총 N개 중 M개 완료” 날짜별 요약
- API 요청 실패 메시지 및 로딩 상태 표시
- 모바일 대응 반응형 화면
