# Momentum

Momentum is a full-stack web application designed to help job seekers organize and track their job search process. The platform allows users to manage applications, track interview stages, and monitor their progress across multiple opportunities in one centralized dashboard.

The goal of Momentum is to simplify the job search process by replacing scattered spreadsheets, notes, and email threads with a structured and efficient application tracking system.

---

## Features

- Track job applications in one centralized dashboard
- Monitor application status (applied, interview, offer, rejected)
- Organize company information and application details
- Manage interview stages and follow-ups
- Visual overview of job search progress
- Form validation and structured data entry

---

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- TanStack React Query
- Zustand
- React Hook Form
- Zod
- Headless UI
- Heroicons

### Backend
- FastAPI
- Pydantic
- SQLAlchemy
- Uvicorn

### Development Tools
- ESLint
- TypeScript ESLint

---

## Architecture

Momentum follows a modern full-stack architecture:

Frontend:
React + TypeScript handles the user interface, routing, and client state.

Backend:
FastAPI serves as the API layer, handling requests, validation, and business logic.

Database:
SQLAlchemy manages interactions with the relational database.

API Communication:
TanStack React Query manages API calls, caching, and server state.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/momentum.git
cd momentum
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Start the frontend development server

```bash
npm run dev
```

### 4. Start the backend server

```bash
uvicorn main:app --reload
```

---

## Project Structure

```
momentum/
│
├── frontend/
│   ├── components
│   ├── pages
│   ├── hooks
│   └── state
│
├── backend/
│   ├── api
│   ├── models
│   ├── schemas
│   └── services
│
└── README.md
```

---

## Target Users

- College students searching for internships or entry-level roles
- Recent graduates applying to multiple companies
- Job seekers managing large numbers of applications
- Career mentors helping students track application progress

---

## Problem Momentum Solves

Many job seekers track their applications using spreadsheets, notes, or email threads, which quickly becomes disorganized and difficult to manage. Momentum provides a centralized platform that allows users to efficiently track applications, monitor progress, and stay organized throughout the job search process.

---

## Future Improvements

- Resume generation tools
- Automated job application tracking from email
- Analytics dashboard for job search insights
- AI-powered job recommendations
- Integration with LinkedIn and job boards

---

## Contributors

- Gavino Vargas

---

## License

This project is for educational and development purposes.
