# Globalgrad (AI Counsellor)

A full-stack study-abroad guidance platform with authentication, profile onboarding, university shortlisting/locking, and a real-time voice AI counsellor experience.

## Features

- Email/password signup + login (cookie-based JWT)
- Google sign-in (frontend OAuth flow)
- Multi-step onboarding (education, goals, budget, exams)
- University discovery + shortlist/lock management
- Voice AI counsellor via LiveKit rooms (token issued by backend)
- Real-time UI refresh on agent-triggered shortlist/lock updates

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router
- Backend: FastAPI, SQLAlchemy, Alembic, PostgreSQL
- Auth: JWT (HttpOnly cookie), Google OAuth
- Realtime Voice: LiveKit (+ LiveKit Agents)

## Repository Structure

- `backend/` — FastAPI API server + DB models/migrations + voice agent worker
- `frontend/` — React UI

## Environment Variables

Your `.env` files are intentionally gitignored. Create them locally.

### Backend (`backend/.env`)

```env
# App
PROJECT_NAME=Globalgrad
API_V1_STR=/api/v1

# Database
DATABASE_URL=""

# Auth
SECRET_KEY=""
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS (comma-separated; must be explicit when using cookies)
BACKEND_CORS_ORIGINS=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# LiveKit
LIVEKIT_URL=wss://your-livekit-server
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# LLM keys (used by voice agent stack)
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_API_KEY=your_google_api_key
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_LIVEKIT_URL=wss://your-livekit-server
```

## Run Locally

### 1) Backend API

From the `backend/` folder:

```bash
python -m venv venv
# activate venv (Windows PowerShell)
# .\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Optional (recommended): apply migrations
alembic upgrade head

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API health check:

- `GET http://localhost:8000/`

### 2) Frontend

From the `frontend/` folder:

```bash
npm install
npm run dev
```

Open:

- `http://localhost:5173`

### 3) Voice Agent Worker (LiveKit Agents)

The UI requests a LiveKit token from the backend (`GET /api/v1/voice/token`) and then connects to your LiveKit server.

To run the agent worker (from the `backend/` folder):

```bash
python app/voice_agent/agent.py
```

Notes:

- The voice experience requires a working LiveKit deployment (cloud or self-hosted).
- Make sure `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, and `VITE_LIVEKIT_URL` match the same LiveKit project.

## Key API Routes

All routes are prefixed by `API_V1_STR` (default: `/api/v1`).

- Auth
  - `POST /auth/signup`
  - `POST /auth/login`
  - `POST /auth/google-login`
  - `POST /auth/logout`
  - `GET  /auth/me`
- Onboarding
  - `GET /onboarding`
  - `PUT /onboarding`
- Universities
  - `GET    /universities`
  - `POST   /universities`
  - `DELETE /universities/{university_id}`
- Voice
  - `GET /voice/token`

## Security Notes

- Auth uses an HttpOnly cookie (`access_token`) so the frontend sends `credentials: 'include'` on requests.
- In production, configure:
  - HTTPS
  - `secure=True` cookies
  - restrictive CORS origins

