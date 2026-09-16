# Mini Job Queue Dashboard

A small full-stack job queue management dashboard built for the React + NestJS
intern assignment. React/TypeScript frontend, NestJS/TypeScript backend,
SQLite persistence.

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Axios, Lucide icons
- **Backend:** NestJS, TypeORM, SQLite, class-validator

## Project structure

```
job-queue-dashboard/
├── backend/     NestJS API (jobs module: controller, service, DTOs, entity)
└── frontend/    React dashboard (components, hooks, services, pages)
```

## 1. Setup & running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env      # defaults are fine for local dev
npm run start:dev         # http://localhost:3000
```

A SQLite file (`job-queue.sqlite`) is created automatically in `backend/` on
first run — no external database setup needed. `synchronize: true` is used to
create the schema automatically; in a larger/production app this would be
replaced with proper migrations.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:3000
npm run dev                # http://localhost:5173
```

Run the backend first (or in parallel); the frontend expects it at
`VITE_API_URL`.

## 2. API endpoints

| Method | Endpoint             | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | `/jobs`               | Create a job (`title`, `type`)       |
| GET    | `/jobs`                | List all jobs, newest first          |
| PATCH  | `/jobs/:id/status`     | Update a job's status                |
| DELETE | `/jobs/:id`            | Delete a job                         |

Every job has: `id` (UUID), `title`, `type`, `status`, `createdAt`.

Validation and error handling:
- `400` — invalid input (DTO validation) or an invalid status transition
- `404` — job not found
- `409` — job status changed by another request between read and write (see below)

## 3. Status transition rules

Allowed transitions:

```
pending → running → completed
                   ↘ failed
```

`completed` and `failed` are terminal — no transitions out of them are
permitted, and `pending → completed`/`pending → failed` are also rejected
(a job must pass through `running`).

**This is enforced entirely on the backend**, in `JobsService.updateStatus`,
not just in the UI. The frontend only shows the actions that are valid for a
job's current status (e.g. a `pending` job only shows "Start"), but that's a
UX convenience — even if someone calls `PATCH /jobs/:id/status` directly with
curl/Postman and skips the frontend entirely, the same `ALLOWED_TRANSITIONS`
map in the service rejects the request with a `400`.

## 4. Concurrency handling

**The scenario:** two browser tabs both have a `pending` job open, and both
send `PATCH /jobs/:id/status { status: "running" }` at nearly the same time.
Without protection, both requests could read `status = pending`, both pass
validation, and both write — the second write silently overwrites the first,
and (in a real system) the job could end up being processed twice.

**The approach — a conditional (optimistic) update:**

1. Read the job and note its current status.
2. Validate the requested transition against that status (as above).
3. Issue the update as:
   ```sql
   UPDATE jobs SET status = :next WHERE id = :id AND status = :expectedCurrent
   ```
   i.e. the status we just read is part of the `WHERE` clause, not just the
   data used to decide whether the transition is legal.
4. Check how many rows were affected.
   - **1 row affected:** nobody else touched this job between our read and
     our write — the update is safe and we return the updated job.
   - **0 rows affected:** the job's status in the database no longer matches
     what we read, which means another request updated (or deleted) it in
     the meantime. We don't silently overwrite it — we reload the current
     state and return a `409 Conflict` describing what actually happened.

This means whichever request reaches the database first "wins" the
transition, and the second one is rejected rather than corrupting the row.
It's enforced at the database layer (SQLite's own row-level write is atomic
per statement), so it holds even under real concurrent load, and it doesn't
require a separate lock table, a version column, or pessimistic row locking
— the status column doubles as the concurrency token, which keeps the
implementation simple while still being correct. This is a form of
**optimistic concurrency control**.

On the frontend, if a status update comes back as a `409`, the UI shows a
toast ("this job was updated by another user — refreshing the latest
state") and re-fetches the job list, so the second tab converges on the
real server state instead of showing a stale/incorrect status.

**Why not pessimistic locking (e.g. `SELECT ... FOR UPDATE`)?** For a job
queue where the "critical section" (checking a status and writing a new one)
is a single statement, row-level locks add complexity (holding transactions
open, lock timeouts) without a real benefit over a conditional update —
especially with SQLite, which serializes writes per-connection anyway. The
conditional-update approach gives the same correctness guarantee with a
much simpler implementation, which fits the scope of this assignment.

## 5. Frontend behavior

- Displays all jobs in a searchable, filterable table with status pills,
  relative timestamps (hover for the full timestamp), and per-status actions.
- Only shows actions valid for a job's current state (Start / Complete /
  Fail), so the UI itself never offers an invalid transition — though, as
  above, the backend is the real source of truth.
- Create Job modal: inline validation, disables the submit button and shows
  a spinner while submitting (prevents duplicate submissions), and surfaces
  API errors without closing the modal so the user can retry.
- Delete requires a confirmation dialog ("This action cannot be undone.").
- Loading states: skeleton stat cards and table rows on first load, a
  spinning refresh icon on manual refresh, and per-row spinners while a
  status change or delete is in flight (so other rows stay interactive).
- Error state: if the initial `GET /jobs` fails, the table area shows an
  "Unable to load jobs" message with a "Try Again" button rather than a
  blank page.
- Empty states: a distinct message/CTA for "no jobs yet" vs. "no jobs match
  your search/filter."
- Responsive from 375px through 1920px: stat cards wrap into a 2-column
  grid on small screens, and the jobs table scrolls horizontally on narrow
  viewports rather than being unusable.

## 6. Assumptions & trade-offs

- **SQLite over PostgreSQL** — simplest to run locally with zero setup,
  which matches the assignment's "don't over-engineer" guidance. TypeORM
  makes swapping to Postgres a config change (`type: 'postgres'` plus
  connection details), not a code change, if that were needed for
  deployment.
- **`synchronize: true`** — TypeORM auto-creates the schema from the entity.
  This is convenient for an assignment of this size; a real production app
  would use TypeORM migrations instead so schema changes are explicit and
  reviewable.
- **UUIDs for job IDs** — avoids exposing sequential/guessable IDs and
  sidesteps any auto-increment edge cases under concurrent inserts.
- **No auth** — out of scope per the assignment; every request is treated
  as a trusted client. A real deployment would add auth and probably scope
  jobs per user/tenant.
- **No pagination** — the dashboard loads all jobs at once. Fine for a demo
  dataset; with a large job volume this would need server-side pagination
  and the frontend would need infinite scroll or page controls.
- **Toasts are in-memory only** — they don't persist across a refresh,
  which is the expected/desired behavior for transient notifications.

## 7. Bonus production improvement

**Conditional (optimistic) concurrency control on status updates**, described
in detail in section 4. It's the most concrete, testable answer to the
assignment's concurrency question: it prevents two clients from both
successfully transitioning the same job, it degrades gracefully (a clear
`409` instead of a silent overwrite or a crash), and the frontend surfaces
that conflict to the user instead of hiding it — which matters for a job
queue, where a "phantom" double-run of the same job is exactly the kind of
bug this system needs to prevent.

## 8. Testing the flow

With both servers running:

1. Create a job → appears at the top of the table, counts update.
2. Filter by status / search by title or type.
3. `pending → running` via "Start", then `running → completed` or
   `running → failed` via the row actions.
4. Try to bypass the UI: `curl -X PATCH .../jobs/:id/status -d '{"status":"completed"}'`
   on a `pending` job → `400 Bad Request`.
5. Open the app in two tabs, create a job, and fire two simultaneous status
   updates (e.g. two curl requests in parallel) — only one succeeds, the
   other returns a `409`.
6. Delete a job → confirmation dialog → removed from the table, counts
   update.
7. Refresh the browser → data persists (backed by SQLite on disk).
8. Disconnect the backend and reload → the table shows the error state with
   a working "Try Again".

## 9. Deployment notes

- **Backend:** deployable to any Node host (Render, Railway, Fly.io, etc.).
  Set `PORT`, `CORS_ORIGIN` (the deployed frontend URL), and optionally
  `DATABASE_PATH`. For a longer-lived deployment, swap SQLite for a managed
  Postgres instance and update the `TypeOrmModule.forRoot` config in
  `src/app.module.ts` accordingly.
- **Frontend:** deployable as a static build (`npm run build` → `dist/`) to
  Vercel, Netlify, or similar. Set `VITE_API_URL` to the deployed backend's
  URL at build time.
