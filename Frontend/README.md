# UrbanEye Frontend

React + TypeScript + Vite + Tailwind CSS frontend for **UrbanEye** — an
AI-powered civic issue reporting and monitoring platform.

See the **[project README](../README.md)** for the full architecture, setup
instructions and API overview.

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:5173>. The dev server proxies `/api` and `/uploads` to
the FastAPI backend at <http://127.0.0.1:8000>.

## Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the development server       |
| `npm run build`   | Type-check (`tsc -b`) and bundle   |
| `npm run preview` | Preview the production build       |
| `npm run lint`    | Lint the source                    |

## Structure

```
src/
├── api/           # API client + typed request layer
├── auth/          # AuthContext (login/register/session restore)
├── components/
│   ├── layout/    # Navbar, Footer, Layout
│   ├── ui/        # Button, Badge, Card, Field, Spinner, EmptyState, Toast
│   ├── map/       # ReportMap (Leaflet) + LocationPicker
│   ├── auth/      # RequireAuth / RequireAdmin route guards
│   ├── Logo.tsx   # UrbanEye eye mark
│   └── ReportCard.tsx
├── pages/         # Home, Login, Register, ReportIssue, MyReports,
│                  # ReportDetail, AdminDashboard, MapPage, NotFound
├── lib/           # Category/severity/status constants + styles
├── types.ts       # Shared TypeScript types
├── App.tsx        # Route definitions
└── main.tsx       # Entry point + providers
```
