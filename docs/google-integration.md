# Google Integration Setup (Phase 2)

This document lists the manual steps required outside the codebase to enable
Google Calendar and Gmail read-only access. No secret values are included
here — only variable names and where to obtain them.

## 1. Google Cloud Console setup

1. Create (or reuse) a project at https://console.cloud.google.com.
2. Enable these APIs under **APIs & Services → Library**:
   - Google Calendar API
   - Gmail API
3. Configure the **OAuth consent screen** (APIs & Services → OAuth consent screen):
   - User type: External (or Internal, if using a Google Workspace domain restricted to your own account)
   - Add the following scopes:
     - `openid`
     - `email`
     - `profile`
     - `https://www.googleapis.com/auth/calendar.readonly`
     - `https://www.googleapis.com/auth/gmail.readonly`
   - Add your Google account as a **test user** while the app is in "Testing" publishing status (required — otherwise Google will reject sign-in for anyone not listed).
4. Create an **OAuth 2.0 Client ID** (APIs & Services → Credentials → Create Credentials → OAuth client ID):
   - Application type: Web application
   - Authorized redirect URIs:
     - `https://<your-production-domain>/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google` (for local development)
5. Google will issue a **Client ID** and **Client Secret** — copy these into your environment as described below. Do not commit them anywhere.

## 2. Required environment variables

Set these in Vercel (Project Settings → Environment Variables) for each environment (Production, Preview, Development) and in your local `.env`:

| Variable | Purpose | Where it comes from |
|---|---|---|
| `PRINCESS_GOOGLE_CLIENT_ID` | Google OAuth client ID | Google Cloud Console credential created above |
| `PRINCESS_GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Google Cloud Console credential created above |
| `AUTH_SECRET` | Auth.js session encryption | Generate locally: `openssl rand -base64 32` |
| `DATABASE_URL` | Neon Postgres connection string | Neon project dashboard |

No new environment variables were introduced beyond what Phase 1 already required — Phase 2 reuses `PRINCESS_GOOGLE_CLIENT_ID`/`PRINCESS_GOOGLE_CLIENT_SECRET`, which already existed in `.env.example`, and now actually uses them for calendar/Gmail scopes in addition to sign-in.

For Vercel preview deployments, keep `AUTH_URL` and `NEXTAUTH_URL` scoped to Production only. Preview deployments should use the current Vercel deployment host so authentication redirects remain on the preview domain.

After changing OAuth credentials in Vercel, create a fresh Preview deployment so the updated values are loaded.

## 3. What changed vs. Phase 1's Google sign-in

Phase 1 only used Google for basic sign-in (`openid email profile`). Phase 2 requests two additional read-only scopes and sets `access_type: 'offline'` + `prompt: 'consent'` so Google issues a **refresh token**, which is required for the app to read Calendar/Gmail data after the user's session token expires.

**Important:** anyone who signed in with Google before this change will need to **reconnect** (visit `/connections` → "Reconnect") to re-approve the new scopes and get a refresh token stored. Their existing Glow OS data (tasks, habits, routines, etc.) is completely unaffected — reconnecting only touches the stored Google `accounts` row.

## 4. Token storage and refresh

No new token storage was added. Tokens live in the existing Auth.js `accounts` table (`access_token`, `refresh_token`, `expires_at`, `scope` columns), written by the Auth.js Drizzle adapter on sign-in and updated by `src/lib/google/tokens.ts` on refresh. Tokens are never sent to client components and never logged — only generic status/error codes are logged or returned.

## 5. Database migration

One new migration: `drizzle/0001_phase2_google_and_importer.sql`. It is additive only:
- Adds a new `import_batches` table
- Adds nullable `source`, `source_version`, `import_batch_id`, `editable` columns to `routines`, `habits`, `tasks`, `beauty_routines`, `calendar_events`
- Adds a nullable `recurrence_days_of_week` column to `calendar_events`

No existing column is modified or dropped, and no existing data is touched. Run with:

```bash
npx drizzle-kit migrate
```

(or however migrations are currently applied in this project's deploy process — this doesn't change that process, just adds one more migration file to it).

## 6. Verifying the setup after deploying

1. Visit `/connections` while signed in.
2. Click **Connect Google** (or **Reconnect** if you signed in before this change).
3. Approve the consent screen — it will list Calendar (read-only) and Gmail (read-only) permissions.
4. Back on `/connections`, confirm both scopes show as "granted" and an account email appears.
5. Visit `/dashboard` — the Google Calendar and Gmail widgets should show real data instead of a "not connected" message.

If a widget shows an error instead, check the Vercel function logs for the specific reason code (`not_connected` / `insufficient_scope` / `revoked` / `error`) — the logs never contain token values, only these reason codes.
