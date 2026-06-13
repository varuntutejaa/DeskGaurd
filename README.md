# DeskGuard — Library Seat Management System

DeskGuard is a real-time seat management platform built for the Main Library at Manipal University Jaipur. It enables students to check in to seats, mark themselves away, and check out, while librarians monitor occupancy, manage reported issues, and register students — all from a live dashboard.

---

## Project Structure

```
DeskGaurd/
├── frontend/        # React + TypeScript + Vite (client application)
└── backend/         # Node.js + Express + Prisma (REST API)
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| Zustand | Global state management |
| React Router v6 | Client-side routing |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Prisma ORM | Database access layer |
| Neon PostgreSQL | Serverless hosted database |
| TypeScript | Type safety |

---

## Features

- **Interactive Floor Map** — SVG-based live seat map with colour-coded seat statuses (available, occupied, away, abandoned, maintenance)
- **Seat Actions** — Students can check in, go away, confirm presence, and check out; all actions update instantly with optimistic UI
- **Librarian Dashboard** — Real-time occupancy stats, zone utilisation charts, occupancy trends, flagged seats, and issue reports
- **Student Management** — Librarians can register, view, and remove students; data is persisted to the live PostgreSQL database
- **Role-Based Access** — Hardcoded auth with two roles: `student` and `admin`; route guards prevent unauthorised access
- **Offline Resilience** — App functions fully without the backend using deterministic fallback seat data and mock dashboard stats

---

## Credentials (Development)

| Role | Email | Password |
|---|---|---|
| Student | `student@muj.manipal.edu` | `1234567890` |
| Librarian / Admin | `admin@muj.manipal.edu` | `0987654321` |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Neon PostgreSQL database (or any PostgreSQL instance)

### 1. Clone the repository

```bash
git clone https://github.com/varuntutejaa/DeskGaurd.git
cd DeskGaurd
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://..."   # Your Neon / PostgreSQL connection string
PORT=4000
```

Push the Prisma schema to the database:

```bash
npx prisma db push
```

Start the backend server:

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

### 3. Set up the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`. API calls are proxied to `http://localhost:4000` during development automatically.

---

## Deployment

### Frontend — Vercel / Netlify

| Setting | Value |
|---|---|
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variable | `VITE_API_URL=<your-backend-url>` |

### Backend — Railway / Render

| Setting | Value |
|---|---|
| Root directory | `backend` |
| Start command | `npm start` |
| Environment variable | `DATABASE_URL=<your-neon-connection-string>` |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/seats` | List all seats with current status |
| POST | `/api/seats/:id/checkin` | Check in to a seat |
| POST | `/api/seats/:id/away` | Mark seat as away |
| POST | `/api/seats/:id/confirm` | Confirm presence |
| POST | `/api/seats/:id/checkout` | Check out from a seat |
| POST | `/api/issues` | Report a seat issue |
| GET | `/api/students` | List all registered students |
| POST | `/api/students` | Register a new student |
| DELETE | `/api/students/:id` | Remove a student |
| GET | `/api/dashboard/stats` | Occupancy statistics |
| GET | `/api/dashboard/zones` | Zone utilisation breakdown |
| GET | `/api/dashboard/trends` | Hourly occupancy trend data |
| GET | `/api/dashboard/flagged` | Flagged / at-risk seats |
| GET | `/api/issues` | List reported issues |

---

## Database Schema (Prisma)

The backend uses two primary models:

- **Seat** — Represents a physical library seat with status, zone, and type metadata
- **Session** — Tracks active and historical check-in sessions per seat
- **Issue** — Stores reported seat issues with status tracking
- **Student** — Stores student records registered by librarians

---

## License

This project was developed for academic and institutional use at Manipal University Jaipur. All rights reserved.
