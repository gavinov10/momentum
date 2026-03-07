# Artifact Checklist

**Repository:** [Momentum](https://github.com/gavinov10/momentum)

Link to each required artifact in the GitHub repository, with a brief description of where each item can be found.

---

## 1. Project overview & documentation

| Artifact | Link | Description |
|----------|------|-------------|
| **Root / project README** | [README (root)](https://github.com/gavinov10/momentum) | Repo root; add a root README here if required. |
| **Backend README** | [backend/README.md](https://github.com/gavinov10/momentum/blob/main/backend/README.md) | Backend overview and setup (FastAPI, SQLAlchemy, auth). |
| **Frontend README** | [frontend/README.md](https://github.com/gavinov10/momentum/blob/main/frontend/README.md) | Frontend overview and setup (React, Vite, TypeScript). |

---

## 2. Backend (API & server)

| Artifact | Link | Description |
|----------|------|-------------|
| **Main application entry** | [backend/app/main.py](https://github.com/gavinov10/momentum/blob/main/backend/app/main.py) | FastAPI app, CORS, router registration (`/applications`, `/auth`). |
| **Application CRUD API** | [backend/app/api/applications.py](https://github.com/gavinov10/momentum/blob/main/backend/app/api/applications.py) | REST endpoints for job applications (create, list, get, update, delete); protected by JWT. |
| **Auth router** | [backend/app/auth/router.py](https://github.com/gavinov10/momentum/blob/main/backend/app/auth/router.py) | Register, login (JWT), and user management routes. |
| **Auth config (JWT, user DB)** | [backend/app/auth/config.py](https://github.com/gavinov10/momentum/blob/main/backend/app/auth/config.py) | FastAPI Users setup: SQLAlchemyUserDatabase, JWTStrategy, BearerTransport, FastAPIUsers instance. |
| **User manager** | [backend/app/auth/user_manager.py](https://github.com/gavinov10/momentum/blob/main/backend/app/auth/user_manager.py) | Custom UserManager (password hashing, user creation, ID handling for JWT). |
| **Auth schemas** | [backend/app/auth/schemas.py](https://github.com/gavinov10/momentum/blob/main/backend/app/auth/schemas.py) | Pydantic models: UserCreate, UserRead, UserUpdate (email validation via EmailStr). |
| **Dependencies** | [backend/requirements.txt](https://github.com/gavinov10/momentum/blob/main/backend/requirements.txt) | Python dependencies (FastAPI, SQLAlchemy, FastAPI Users, Celery, Redis, etc.). |

---

## 3. Database

| Artifact | Link | Description |
|----------|------|-------------|
| **Database config** | [backend/app/db/database.py](https://github.com/gavinov10/momentum/blob/main/backend/app/db/database.py) | Async SQLAlchemy engine, session factory, `get_db` dependency. |
| **Models (User, Application)** | [backend/app/db/models.py](https://github.com/gavinov10/momentum/blob/main/backend/app/db/models.py) | User and Application tables; ApplicationStatus enum; relationships. |
| **Application schemas** | [backend/app/schemas/application.py](https://github.com/gavinov10/momentum/blob/main/backend/app/schemas/application.py) | Pydantic ApplicationCreate, ApplicationRead, ApplicationUpdate. |
| **Migrations** | [backend/migrations/](https://github.com/gavinov10/momentum/tree/main/backend/migrations) | Alembic migrations (versions in `versions/`). |

---

## 4. Frontend

| Artifact | Link | Description |
|----------|------|-------------|
| **App entry & routing** | [frontend/src/App.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/App.tsx) | Root component, auth gate, React Router (Dashboard, Job Tracker, Resume Generator). |
| **Frontend entry** | [frontend/src/main.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/main.tsx) | React DOM render, StrictMode. |
| **API & auth client** | [frontend/src/services/api.ts](https://github.com/gavinov10/momentum/blob/main/frontend/src/services/api.ts) | All backend calls: auth (login, register, getCurrentUser), applications CRUD; token in headers. |
| **Auth store** | [frontend/src/stores/authStore.ts](https://github.com/gavinov10/momentum/blob/main/frontend/src/stores/authStore.ts) | Zustand store: token, user, login, register, logout, loadUser; persisted to localStorage. |
| **Login UI** | [frontend/src/components/Login.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/components/Login.tsx) | Login/register form; uses auth store and API. |
| **Job Tracker page** | [frontend/src/pages/JobTracker.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/pages/JobTracker.tsx) | List/Kanban views, CRUD, CSV export, column settings. |
| **Resume Generator page** | [frontend/src/pages/ResumeGenerator.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/pages/ResumeGenerator.tsx) | Resume form state, experience/education editors, copy/print. |
| **Resume templates** | [frontend/src/components/ResumeTemplates.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/components/ResumeTemplates.tsx) | Professional and Minimal resume preview components. |
| **Resume types** | [frontend/src/types/resume.ts](https://github.com/gavinov10/momentum/blob/main/frontend/src/types/resume.ts) | TypeScript types and defaults for resume data. |
| **Frontend dependencies** | [frontend/package.json](https://github.com/gavinov10/momentum/blob/main/frontend/package.json) | React, Vite, TypeScript, React Router, Zustand, etc. |

---

## 5. Configuration & tooling

| Artifact | Link | Description |
|----------|------|-------------|
| **Root Python deps** | [requirements.txt](https://github.com/gavinov10/momentum/blob/main/requirements.txt) | Top-level Python requirements (mirrors backend). |
| **Vite config** | [frontend/vite.config.ts](https://github.com/gavinov10/momentum/blob/main/frontend/vite.config.ts) | Vite build and dev server configuration. |
| **TypeScript config** | [frontend/tsconfig.json](https://github.com/gavinov10/momentum/blob/main/frontend/tsconfig.json) | TypeScript compiler options for the frontend. |

---

## 6. Testing (if required)

| Artifact | Link | Description |
|----------|------|-------------|
| **Backend tests** | [backend/](https://github.com/gavinov10/momentum/tree/main/backend) | Add a `tests/` directory here for pytest; requirements include pytest, pytest-asyncio, pytest-httpx. |

---

**Note:** Replace `main` in any URL with your default branch name (e.g. `master`) if different. Add or remove rows to match the exact list of required artifacts for your application.
