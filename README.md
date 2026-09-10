# UrbanEye

**"Eyes on every civic issue"**

UrbanEye is an AI-powered civic issue reporting and monitoring platform. Citizens
photograph public infrastructure problems (potholes, garbage, broken
streetlights, water leakage, damaged property, …), and Google's Gemini model
classifies each issue with a **category**, **severity**, **confidence** and a
short **description**. Reports are geotagged, prioritised and tracked from
submission to resolution, and administrators get a live dashboard and map.

This is a **student academic project** — intentionally simple, readable and
self-contained, but structured like a real full-stack application.

---

## Architecture

```
React (Vite) SPA          FastAPI REST API             SQLite / SQLAlchemy
+ Leaflet map     ──►     /api/* endpoints      ──►     users + reports tables
+ Tailwind CSS            + JWT auth (PBKDF2)                 │
+ React Router            + image validation                  │
                          + /uploads static files             │
                                     │
                                     ▼
                          Ai_/urbaneye_ai.py
                          (Google Gemini image analysis)
```

The frontend is a single-page app that talks to the backend through a Vite
dev proxy (`/api` and `/uploads`), so the browser never holds the Gemini API
key and never calls `localhost` directly. The Gemini key lives **server-side
only**.

---

## Technology stack

| Layer      | Technology                                             |
| ---------- | ------------------------------------------------------ |
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Leaflet + react-leaflet |
| Backend    | Python 3.11, FastAPI, Uvicorn, Pydantic v2             |
| AI         | `google-genai` SDK (Gemini) via `Ai_/urbaneye_ai.py`   |
| Database   | SQLite + SQLAlchemy 2 (switchable to PostgreSQL)       |
| Auth       | JWT (PyJWT) + PBKDF2 password hashing (stdlib)         |
| Tests      | pytest (backend), `npm run build` (frontend)           |

---

## Folder structure

```
UrbanEye/
├── Ai_/                      # Existing (preserved) AI module
│   ├── urbaneye_ai.py        # Gemini image analysis (working code)
│   ├── test_gemini.py        # Gemini connectivity smoke test
│   ├── test_urbaneye.py      # Batch test over test_images/
│   ├── pothole.jpg           # Sample image
│   └── test_images/          # 4 real-world sample photos
├── backend/                  # FastAPI backend
│   ├── main.py               # App factory, CORS, routers, static serving
│   ├── config.py             # Environment-based configuration
│   ├── database.py           # Engine, session, init_db
│   ├── models.py             # User + Report models, priority formula
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── auth.py               # Password hashing, JWT, auth dependencies
│   ├── ai_service.py         # Thin wrapper around Ai_/urbaneye_ai.py
│   ├── storage.py            # Upload validation + image storage
│   ├── seed.py               # DEMO DATA seed script
│   ├── routers/              # health, auth, analyze, reports, dashboard
│   └── tests/                # pytest suite
├── Frontend/                 # React + Vite SPA
│   └── src/
│       ├── api/              # API client layer (token + error handling)
│       ├── auth/             # AuthContext
│       ├── components/       # layout, ui, map, cards
│       ├── pages/            # Home, Login, Register, ReportIssue, …
│       └── lib/              # constants, type-safe enums
├── Data_base/                # Legacy placeholder (kept, unused)
├── requirements.txt          # Python runtime dependencies
├── requirements-dev.txt      # + pytest / httpx
└── .env.example              # Template for environment variables
```

---

## Local setup

### Prerequisites

- Python 3.11+
- Node.js 18+ (npm)

### 1. Backend

```bash
cd UrbanEye

# Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt -r requirements-dev.txt
```

### 2. Environment variables

```bash
cp .env.example .env
```

Then edit `.env` and set at least:

```dotenv
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=some-long-random-string
```

`GEMINI_API_KEY` may also be placed in `Ai_/.env` (that is where the AI
module looks first, then it walks up to the project root). **Never commit**
either `.env` file — both are gitignored.

| Variable          | Purpose                                   | Default                     |
| ----------------- | ----------------------------------------- | --------------------------- |
| `GEMINI_API_KEY`  | Google Gemini API key (required for AI)   | —                           |
| `JWT_SECRET`      | JWT signing secret                        | ephemeral random (dev only) |
| `JWT_EXPIRE_MINUTES` | Token lifetime (minutes)                | `1440`                      |
| `DATABASE_URL`    | SQLAlchemy URL (SQLite or PostgreSQL)     | `sqlite:///./urbaneye.db`   |
| `UPLOAD_DIR`      | Uploaded image folder                     | `./uploads`                 |
| `MAX_UPLOAD_MB`   | Max upload size                           | `10`                        |
| `CORS_ORIGINS`    | Allowed frontend origins (comma-separated)| `http://localhost:5173,…`   |

> PostgreSQL later: set `DATABASE_URL=postgresql+psycopg://user:pass@host:5432/urbaneye`
> and install `psycopg` — no model code changes required.

### 3. Initialize the database

The database is created automatically on first backend start. To create it
explicitly, or to load clearly-labelled **demo data**:

```bash
python -m backend.database        # create tables only
python -m backend.seed            # create tables + demo admin/citizen + sample reports
```

The seed script prints demo credentials, e.g.:

- Admin — `admin@urbaneye.com` / `admin123`
- Citizen — `citizen@urbaneye.com` / `citizen123`

### 4. Start the backend

```bash
uvicorn backend.main:app --reload
```

API docs: <http://localhost:8000/docs>

### 5. Start the frontend

```bash
cd Frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

> The Vite dev server proxies `/api` and `/uploads` to
> `http://127.0.0.1:8000`. If you run the backend on a different port, update
> `Frontend/vite.config.ts`.

### Production-style single server (optional)

```bash
cd Frontend && npm run build      # produces Frontend/dist
cd .. && uvicorn backend.main:app
```

When `Frontend/dist` exists, FastAPI serves the built SPA automatically.

---

## Running tests

```bash
# Backend (needs .venv with requirements-dev.txt installed)
python -m pytest backend/tests -q

# Existing AI scripts (need GEMINI_API_KEY to call Gemini)
python Ai_/test_gemini.py
python Ai_/test_urbaneye.py

# Frontend build (type-checks + bundles)
cd Frontend && npm run build
```

The live Gemini endpoint test is skipped automatically when no
`GEMINI_API_KEY` is set.

---

## API overview

| Method | Endpoint                     | Auth    | Description                                   |
| ------ | ---------------------------- | ------- | --------------------------------------------- |
| GET    | `/api/health`                | public  | Service status + whether AI key is configured |
| GET    | `/api/stats/public`          | public  | Landing-page aggregate statistics             |
| POST   | `/api/auth/register`         | public  | Register (creates a **citizen** account)      |
| POST   | `/api/auth/login`            | public  | Login, returns JWT + user                     |
| GET    | `/api/auth/me`               | user    | Current user                                  |
| POST   | `/api/analyze`               | user    | Upload image → Gemini analysis result         |
| POST   | `/api/reports`               | user    | Create a report (image + classification + location) |
| GET    | `/api/reports`               | user    | List reports (own for citizens, all for admins) |
| GET    | `/api/reports/{id}`          | user    | Report detail (owner or admin)                |
| PATCH  | `/api/reports/{id}/status`   | admin   | Update report status                          |
| GET    | `/api/dashboard/stats`       | admin   | Aggregate dashboard statistics                |

**Priority score** is derived server-side:
`priority = 0.7 * (severity_weight / 3) * 100 + 0.3 * confidence`
where severity weight is Low=1, Medium=2, High=3.

**Statuses:** `Submitted`, `Under Review`, `In Progress`, `Resolved`, `Rejected`.

---

## Current limitations

- **AI requires a Gemini API key.** Without `GEMINI_API_KEY`, `/api/analyze`
  returns `503` with a clear message; the Report Issue form falls back to
  manual classification so the rest of the app still works.
- **No email verification or password reset** — accounts are local only.
- **Single admin role model** — admin accounts are created via the seed script
  or directly in the database (self-registration never grants admin).
- **SQLite for development.** Concurrency and scale require PostgreSQL.
- **No status-history table** — only the current status and last-updated
  timestamp are tracked.
- **No real-time updates** (no websockets) — data refreshes on page load.
- **No reverse geocoding** — users can type an address; the map click and
  browser geolocation supply coordinates.

---

## Future improvements

- PostgreSQL + Alembic migrations.
- Email verification, password reset, and refresh tokens.
- Full status history/timeline per report.
- Duplicate-report detection (cluster nearby reports of the same category).
- Public read-only map (currently requires login for privacy).
- Push/email notifications to reporters and administrators.
- Admin analytics over time (trends, resolution SLAs).
