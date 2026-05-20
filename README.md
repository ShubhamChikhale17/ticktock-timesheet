# Ticktock

A SaaS-style timesheet management app built with Next.js, Tailwind CSS, and next-auth.

## Tech stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Auth**: next-auth v4 (Credentials + JWT)
- **Data**: In-memory mock store (resets on server restart — swap for a real DB when needed)
- **Testing**: Jest + React Testing Library

## Getting started

```bash
# install dependencies
npm install

# copy env vars and fill in your own NEXTAUTH_SECRET
cp .env.example .env.local

# run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo credentials

```
Email:    alex@tentwenty.me
Password: password123
```

## Running tests

```bash
npm test
```

Tests live in `__tests__/` and cover:

- `lib/mock-data` — CRUD helpers and date formatting
- `components/StatusBadge` — all three status variants
- `components/TimesheetModal` — form validation and submission
- `pages/Login` — field validation and signIn integration

## Project structure

```
src/
  app/
    (auth)/login/      # login page (outside dashboard layout)
    api/timesheets/    # REST endpoints for timesheets and tasks
    dashboard/         # main table view + [id] weekly detail page
  components/
    layout/Navbar.jsx
    providers/SessionProvider.jsx
    timesheets/        # TimesheetTable, TimesheetModal, WeeklyView
    ui/StatusBadge.jsx
  lib/
    auth.js            # nextAuth options
    mock-data.js       # in-memory store + helpers
__tests__/             # unit and component tests
```

## Key design decisions

- **App Router** — everything is a server component by default; client state is pushed down to leaf components only where needed.
- **In-memory store** — chosen to keep the demo self-contained. The module-level `let timesheets` array persists across requests within a server process but resets on restart. A Prisma + Postgres setup would be a natural next step.
- **JWT sessions** — simpler than database sessions for a demo; no extra table needed.
- **Optimistic deletes** — task rows are removed from the UI immediately on delete click; the API call runs in the background.

## Deployment (Vercel)

1. Push to a GitHub repo.
2. Import the repo in [vercel.com](https://vercel.com).
3. Add `NEXTAUTH_SECRET` and `NEXTAUTH_URL` as environment variables in the Vercel dashboard.
4. Deploy — no further config needed.
