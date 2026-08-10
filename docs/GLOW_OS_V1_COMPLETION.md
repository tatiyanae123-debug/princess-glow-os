# Glow OS V1 Completion Sprint

## Purpose

This branch consolidates the remaining Glow OS V1 work into one integrated release instead of continuing a long sequence of small phase branches.

## Architecture preserved

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Neon PostgreSQL
- Drizzle ORM
- Auth.js
- Server Actions
- Zod
- Vercel

No second database, authentication system, ORM, or styling framework is introduced.

## V1 systems

### Core Life OS
- Living Dashboard and visual customization
- Today
- Tasks
- Habits
- Routines
- Goals
- Calendar
- Notes
- Home
- Wellness
- Finance
- Master Importer

### Connected planning
- Build My Day around fixed Calendar commitments
- Standard and lighter-day planning
- Persistent Today / Week / Quarter / Year planning layers

### Intelligence
- Personal Context / Brain
- ranked next-action recommendations
- approval-based Concierge proposal queue
- audit history for proposal decisions
- intelligent observations with evidence and confidence
- morning, evening, and weekly briefing snapshots

### Connected digital world
- Google Calendar read-only synchronization
- Gmail read-only metadata/snippet intelligence
- Apple Reminders import-only iPhone Shortcut bridge
- Connections status UI

### Personal intelligence domains
- Projects / Creative Studio
- Life Memory
- Life Timeline
- Beauty Laboratory
- Hair Intelligence
- Fitness Intelligence
- Financial Brain
- Digital Closet
- Life World

## Database migrations

The completion branch expects migrations in order through:

- `0000_purple_butterfly.sql`
- `0001_phase2_google_and_importer.sql`
- `0002_create_task_from_email.sql`
- `0003_work_schedule_import_provenance.sql`
- `0004_google_calendar_sync.sql`
- `0005_intelligence_expansion.sql`
- `0006_completion_v1.sql`

`0005` adds Apple Reminders, planning blocks, Life Memory, and Projects.

`0006` adds persistent planning periods, AI proposals, audit events, observations, Beauty Laboratory inventory, hair logs, fitness sessions, closet inventory, finance goals, Life Timeline events, and briefing snapshots.

Do not merge/deploy persisted V1 routes against a database that has not received 0005 and 0006.

## One-time user actions that cannot be bypassed

### Google
Google OAuth requires the user to grant Calendar/Gmail read-only scopes. The authorized redirect URI must match the stable Vercel environment used for sign-in.

### Apple Reminders
A web application cannot silently access iPhone Reminders through native EventKit. V1 therefore uses an iPhone Shortcut bridge:

1. Sign into Glow OS.
2. Open Connections → Apple Reminders.
3. Choose **Prepare iPhone Shortcut**.
4. Copy the one-time bridge key.
5. In Shortcuts, find the reminders/lists to sync and create the documented JSON fields.
6. POST them to `/api/integrations/apple-reminders/import` with `Authorization: Bearer YOUR_KEY`.
7. Run once and grant iPhone permission when Apple asks.
8. The Shortcut may then be automated on-device if desired.

Glow OS never requests an Apple ID password. It stores only a SHA-256 hash of the bridge key and does not edit/delete iPhone reminders in V1.

## AI safety model

The Brain may analyze context immediately. Important writes are represented as proposals. Proposal decisions are explicit and audited. No financial action is executed automatically.

## Validation gate

The completion PR includes GitHub Actions validation for:

- TypeScript
- Vitest tests
- production Next.js build
- whitespace/diff integrity

Vercel Preview must also be Ready before promotion.

## Promotion workflow

1. Keep all work on `feat/glow-os-completion-sprint`.
2. Confirm CI and Vercel Preview are green.
3. Apply migrations 0005 and 0006 to the target Neon environment.
4. Test sign-in and the persisted V1 routes.
5. Complete the one-time Apple Shortcut setup if Reminders should be connected immediately.
6. Promote PR #27 into `main` only after those checks.

The safety snapshot remains at `backup/pre-completion-sprint-2026-08-08`.
