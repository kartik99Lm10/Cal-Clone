# Cal Clone (Next.js + Prisma)

Cal.com-inspired scheduling app built with:
- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM + PostgreSQL

## Features

- Dashboard with sidebar layout
- Event Types CRUD (`/event-types`)
- Availability management (`/availability`)
- Bookings dashboard with upcoming/past tabs + cancel (`/bookings`)
- Public booking flow:
  - Select event type by slug (`/book/[slug]`)
  - Pick date and slot (availability-based, excludes booked slots)
  - Submit booking form
  - Confirmation page (`/book/confirmation`)
- Double booking prevention:
  - API-level check
  - DB-level unique constraint on `eventTypeId + date + time`

## Project Structure

- `src/app` - pages and API routes
- `src/components` - reusable UI and layout components
- `src/lib` - shared utilities (Prisma client)
- `src/server` - backend logic (HTTP helpers, scheduling utilities)
- `src/db` - database config module
- `prisma` - schema, migrations, seed script

## Environment Variables

Create `.env` (or copy `.env.example`):

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/cal_clone?schema=public"
```

If your password has special characters (like `@`), URL-encode it.

## Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

## API Endpoints

- Event Types
  - `GET /api/event-types`
  - `POST /api/event-types`
  - `PUT /api/event-types/:id`
  - `DELETE /api/event-types/:id`
- Availability
  - `GET /api/availability`
  - `POST /api/availability`
  - `PUT /api/availability/:id`
  - `DELETE /api/availability/:id`
- Bookings
  - `GET /api/bookings`
  - `POST /api/bookings`
  - `GET /api/bookings/:id`
  - `DELETE /api/bookings/:id`
- Public booking
  - `GET /api/public/event-types/:slug`
  - `GET /api/public/event-types/:slug/slots?date=YYYY-MM-DD`
- Ops
  - `GET /api/health` — liveness (use for load balancer / k8s probes)

## Tests

```bash
npm run test
```

## Seeding

`npm run seed` inserts:
- 2 event types
- sample availability
- a few sample bookings

## Build & deployment

```bash
npm run build
npm run start
```

`postinstall` runs `prisma generate` so the client is available after `npm install` on your host or CI.

### Production checklist

1. **Environment** — set `DATABASE_URL` (same value Prisma CLI uses; see `prisma.config.ts`).
2. **Migrations** — before traffic: `npx prisma migrate deploy`.
3. **Health checks** — point probes at `GET /api/health`.
4. **Optional seed** — only for demos/staging: `npm run seed` (not for production with real users).

### Docker / standalone output

The app is built with `output: "standalone"`. After `npm run build`, run the server from `.next/standalone` and copy `public` and `.next/static` next to it as described in the [Next.js standalone deployment docs](https://nextjs.org/docs/app/building-your-application/deploying#nodejs-server).

Prisma v7 uses the Postgres adapter in `src/lib/prisma.ts`; ensure the runtime can open TCP connections to PostgreSQL.
