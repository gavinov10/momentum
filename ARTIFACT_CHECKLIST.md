# Artifact Checklist

**Repository:** [Momentum](https://github.com/gavinov10/momentum)

Link to each required artifact in the GitHub repository, with a brief description of where each item can be found.

---

## 1. Project overview & documentation

| Artifact               | Link                                                                                           | Description                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Root README**        | [README.md](https://github.com/gavinov10/momentum/blob/main/README.md)                         | Project overview, features, tech stack, architecture, installation, target users, and roadmap. |
| **Backend README**     | [backend/README.md](https://github.com/gavinov10/momentum/blob/main/backend/README.md)         | Backend overview and setup (FastAPI, SQLAlchemy, auth).                                        |
| **Frontend README**    | [frontend/README.md](https://github.com/gavinov10/momentum/blob/main/frontend/README.md)       | Frontend overview and setup (React, Vite, TypeScript).                                         |
| **Artifact checklist** | [ARTIFACT_CHECKLIST.md](https://github.com/gavinov10/momentum/blob/main/ARTIFACT_CHECKLIST.md) | This document — mapping of required artifacts to their locations in the repo.                  |

---

## 2. Backend (API & server)

| Artifact                       | Link                                                                                                                 | Description                                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Main application entry**     | [backend/app/main.py](https://github.com/gavinov10/momentum/blob/main/backend/app/main.py)                           | FastAPI app, CORS, router registration (`/applications`, `/auth`, `/gmail`).                      |
| **Application CRUD API**       | [backend/app/api/applications.py](https://github.com/gavinov10/momentum/blob/main/backend/app/api/applications.py)   | REST endpoints for job applications (create, list, get, update, delete); protected by JWT.        |
| **Gmail sync API**             | [backend/app/api/gmail_sync.py](https://github.com/gavinov10/momentum/blob/main/backend/app/api/gmail_sync.py)       | Endpoint(s) that pull job-related emails from Gmail and create/update applications.               |
| **Auth router**                | [backend/app/auth/router.py](https://github.com/gavinov10/momentum/blob/main/backend/app/auth/router.py)             | Register, login (JWT), and user management routes.                                                |
| **Auth config (JWT, user DB)** | [backend/app/auth/config.py](https://github.com/gavinov10/momentum/blob/main/backend/app/auth/config.py)             | FastAPI Users setup: SQLAlchemyUserDatabase, JWTStrategy, BearerTransport, FastAPIUsers instance. |
| **User manager**               | [backend/app/auth/user_manager.py](https://github.com/gavinov10/momentum/blob/main/backend/app/auth/user_manager.py) | Custom `UserManager` (password hashing, user creation, ID handling for JWT).                      |
| **User DB adapter**            | [backend/app/auth/user_db.py](https://github.com/gavinov10/momentum/blob/main/backend/app/auth/user_db.py)           | SQLAlchemy user-database adapter wired into FastAPI Users.                                        |
| **Auth schemas**               | [backend/app/auth/schemas.py](https://github.com/gavinov10/momentum/blob/main/backend/app/auth/schemas.py)           | Pydantic models: `UserCreate`, `UserRead`, `UserUpdate` (email validation via `EmailStr`).        |
| **Backend dependencies**       | [backend/requirements.txt](https://github.com/gavinov10/momentum/blob/main/backend/requirements.txt)                 | Python dependencies (FastAPI, SQLAlchemy, FastAPI Users, Alembic, etc.).                          |

---

## 3. Database

| Artifact                       | Link                                                                                                                     | Description                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **Database config**            | [backend/app/db/database.py](https://github.com/gavinov10/momentum/blob/main/backend/app/db/database.py)                 | Async SQLAlchemy engine, session factory, `get_db` dependency.                                                                 |
| **Models (User, Application)** | [backend/app/db/models.py](https://github.com/gavinov10/momentum/blob/main/backend/app/db/models.py)                     | `User` and `Application` tables; `ApplicationStatus` enum; relationships.                                                      |
| **Application schemas**        | [backend/app/schemas/application.py](https://github.com/gavinov10/momentum/blob/main/backend/app/schemas/application.py) | Pydantic `ApplicationCreate`, `ApplicationRead`, `ApplicationUpdate`.                                                          |
| **Alembic config**             | [backend/alembic.ini](https://github.com/gavinov10/momentum/blob/main/backend/alembic.ini)                               | Alembic configuration file.                                                                                                    |
| **Migrations folder**          | [backend/migrations/](https://github.com/gavinov10/momentum/tree/main/backend/migrations)                                | Alembic environment (`env.py`) and template.                                                                                   |
| **Migration versions**         | [backend/migrations/versions/](https://github.com/gavinov10/momentum/tree/main/backend/migrations/versions)              | Schema revisions: initial user/application tables, auth fields, OAuth accounts, Gmail sync timestamp, status/location updates. |

---

## 4. Frontend

| Artifact                     | Link                                                                                                                                                     | Description                                                                                                                                      |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **App entry & routing**      | [frontend/src/App.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/App.tsx)                                                             | Root component, auth gate, React Router (Dashboard, Job Tracker, Resume Generator).                                                              |
| **Frontend entry**           | [frontend/src/main.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/main.tsx)                                                           | React DOM render, `StrictMode`.                                                                                                                  |
| **API & auth client**        | [frontend/src/services/api.ts](https://github.com/gavinov10/momentum/blob/main/frontend/src/services/api.ts)                                             | All backend calls: auth (login, register, getCurrentUser), applications CRUD; token in headers.                                                  |
| **Auth store**               | [frontend/src/stores/authStore.ts](https://github.com/gavinov10/momentum/blob/main/frontend/src/stores/authStore.ts)                                     | Zustand store: token, user, login, register, logout, loadUser; persisted to localStorage.                                                        |
| **Login UI**                 | [frontend/src/components/Login.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/components/Login.tsx)                                   | Login/register form; uses auth store and API.                                                                                                    |
| **Forgot password**          | [frontend/src/components/ForgotPassword.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/components/ForgotPassword.tsx)                 | Request-password-reset form.                                                                                                                     |
| **Reset password**           | [frontend/src/components/ResetPassword.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/components/ResetPassword.tsx)                   | Token-based password reset form.                                                                                                                 |
| **OAuth callback**           | [frontend/src/components/OAuthCallback.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/components/OAuthCallback.tsx)                   | Handles redirect/code exchange after OAuth (e.g. Google) login.                                                                                  |
| **Navbar**                   | [frontend/src/components/Navbar.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/components/Navbar.tsx)                                 | Top navigation bar (links, user menu). Styles: [Navbar.css](https://github.com/gavinov10/momentum/blob/main/frontend/src/components/Navbar.css). |
| **Application form**         | [frontend/src/components/ApplicationForm.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/components/ApplicationForm.tsx)               | Create/edit form for a job application (validation via React Hook Form + Zod).                                                                   |
| **Application detail modal** | [frontend/src/components/ApplicationDetailModal.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/components/ApplicationDetailModal.tsx) | Modal showing full details of a single application.                                                                                              |
| **Dashboard page**           | [frontend/src/pages/Dashboard.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/pages/Dashboard.tsx)                                     | Overview page with summary stats / recent activity.                                                                                              |
| **Job Tracker page**         | [frontend/src/pages/JobTracker.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/pages/JobTracker.tsx)                                   | List/Kanban views, CRUD, CSV export, column settings.                                                                                            |
| **Resume Generator page**    | [frontend/src/pages/ResumeGenerator.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/pages/ResumeGenerator.tsx)                         | Resume form state, experience/education editors, copy/print.                                                                                     |
| **Resume templates**         | [frontend/src/components/ResumeTemplates.tsx](https://github.com/gavinov10/momentum/blob/main/frontend/src/components/ResumeTemplates.tsx)               | Professional and Minimal resume preview components.                                                                                              |
| **Resume types**             | [frontend/src/types/resume.ts](https://github.com/gavinov10/momentum/blob/main/frontend/src/types/resume.ts)                                             | TypeScript types and defaults for resume data.                                                                                                   |
| **Frontend dependencies**    | [frontend/package.json](https://github.com/gavinov10/momentum/blob/main/frontend/package.json)                                                           | React, Vite, TypeScript, React Router, Zustand, React Hook Form, Zod, etc.                                                                       |

---

## 5. Configuration & tooling

| Artifact              | Link                                                                                                   | Description                                                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Root Python deps**  | [requirements.txt](https://github.com/gavinov10/momentum/blob/main/requirements.txt)                   | Top-level Python requirements (mirrors backend).                                                                                                                                                                                                           |
| **Vite config**       | [frontend/vite.config.ts](https://github.com/gavinov10/momentum/blob/main/frontend/vite.config.ts)     | Vite build and dev server configuration.                                                                                                                                                                                                                   |
| **TypeScript config** | [frontend/tsconfig.json](https://github.com/gavinov10/momentum/blob/main/frontend/tsconfig.json)       | TypeScript compiler options for the frontend (with [tsconfig.app.json](https://github.com/gavinov10/momentum/blob/main/frontend/tsconfig.app.json) and [tsconfig.node.json](https://github.com/gavinov10/momentum/blob/main/frontend/tsconfig.node.json)). |
| **ESLint config**     | [frontend/eslint.config.js](https://github.com/gavinov10/momentum/blob/main/frontend/eslint.config.js) | Frontend linting rules.                                                                                                                                                                                                                                    |
| **Pytest config**     | [backend/pytest.ini](https://github.com/gavinov10/momentum/blob/main/backend/pytest.ini)               | Pytest configuration for backend tests.                                                                                                                                                                                                                    |
| **.gitignore**        | [.gitignore](https://github.com/gavinov10/momentum/blob/main/.gitignore)                               | Files and folders excluded from version control.                                                                                                                                                                                                           |

---

## 6. Testing

| Artifact                 | Link                                                                                                                     | Description                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| **Backend tests folder** | [backend/tests/](https://github.com/gavinov10/momentum/tree/main/backend/tests)                                          | Pytest test suite for the backend API.                        |
| **Test configuration**   | [backend/tests/conftest.py](https://github.com/gavinov10/momentum/blob/main/backend/tests/conftest.py)                   | Shared pytest fixtures (test client, database, auth helpers). |
| **Auth tests**           | [backend/tests/test_auth.py](https://github.com/gavinov10/momentum/blob/main/backend/tests/test_auth.py)                 | Tests for register / login / JWT-protected routes.            |
| **Application tests**    | [backend/tests/test_applications.py](https://github.com/gavinov10/momentum/blob/main/backend/tests/test_applications.py) | Tests for the job application CRUD endpoints.                 |

---

**Note:** All links target the `main` branch. Replace `main` in any URL with your default branch name if different.
