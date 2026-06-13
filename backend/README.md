# DeskGuard Backend — Core Engine

Node.js · Express · TypeScript · PostgreSQL · Prisma · node-cron

Implements the seat lifecycle: **FREE → OCCUPIED → AWAY → (confirm) → OCCUPIED → FREE**,
with cron-driven away/presence timeouts. No auth, no analytics, no dashboard — the core engine only.

## Setup

```bash
cd backend
cp .env.example .env          # set DATABASE_URL to your Postgres instance
npm install
npm run prisma:generate
npm run prisma:migrate         # creates tables (prisma migrate dev)
npm run seed                   # seeds the 74 seats matching the map
npm run dev                    # starts API on http://localhost:4000
```

If you don't have Postgres locally, the fastest option:

```bash
docker run --name deskguard-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=deskguard -p 5432:5432 -d postgres:16
```

(then use the default `DATABASE_URL` from `.env.example`)

## API

| Method | Route                          | Rule |
|--------|--------------------------------|------|
| GET    | `/api/seats`                   | All seats + active session |
| POST   | `/api/seats/:seatId/checkin`   | Seat must be FREE → OCCUPIED, opens session |
| POST   | `/api/seats/:seatId/away`      | Seat must be OCCUPIED → AWAY, `awayStartedAt = now` |
| POST   | `/api/seats/:seatId/confirm`   | `lastConfirmedAt = now`; if AWAY → OCCUPIED |
| POST   | `/api/seats/:seatId/checkout`  | Ends session → FREE |
| POST   | `/api/issues`                  | `{ seatNumber, issueType, description? }` → flags seat MAINTENANCE |

`:seatId` is the **seat number** (e.g. `C12`, `D1-03`) — the same id the map uses.

## Cron (every minute)

- **Away timeout** — `now - awayStartedAt > 20 min` → seat FREE, session inactive.
- **Presence timeout** — `now - lastConfirmedAt > 2 h` → seat ABANDONED, session inactive.

## Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # enums + Seat / Session / IssueReport
│   └── seed.ts            # 74 seats, numbers match the frontend map
└── src/
    ├── server.ts          # entrypoint (db connect, cron, listen)
    ├── app.ts             # express app + CORS + error handler
    ├── prisma/client.ts   # PrismaClient singleton
    ├── routes/            # seats.routes, issues.routes, index
    ├── controllers/       # thin request/response wrappers
    ├── services/          # seat lifecycle + issue logic (the rules)
    └── cron/timeouts.ts   # node-cron sweep
```
