# Glow Living Dashboard Build — 2026-10-06

## Locked reference
The uploaded Glow dashboard reference is the visual source of truth for composition, information hierarchy, warm pearl editorial tone, card relationships, and the first-screen emphasis on weather, next event, current block, day progress, NOW, What Now, Big 3, and Day Flow.

The existing global Glow shell remains authoritative. The dashboard does not introduce a second global navigation runtime.

## Product boundary
Notion is the long-term system of record for structured planning and knowledge where connected. Glow is the adaptive daily intelligence surface. The dashboard shows only what is relevant now and routes deeper work to canonical Glow rooms or connected records.

## Screen architecture
First tier: greeting, date, day identity, live block, weather, next event, current block, day progress, NOW, What Should I Do Now?, Today's Big 3, Day Flow.

Second tier: Today's Schedule, Routines Today, Body, Beauty Today, Style.

Third tier: Career, Brand Brain, Life Admin, People, What Changed?, Weather & Leaving, On Your Mind, Can Wait, Waiting On, Money, Tomorrow.

Persistent global action: Capture, Ask Glow, contextual prompts.

## Canonical data model
The dashboard consumes canonical objects. It does not own duplicate truth.

- Task: id, title, description, status, priority, due date
- Event: id, source, title, start/end, all-day, location, external link
- Routine: id, name, description, time of day
- Habit: id, name, description, frequency
- Goal: id, title, category, status, progress, target
- Note: id, title, content, pinned, updated
- Wellness state: mood, energy, sleep, water
- Gmail signal: message id/thread id, sender, subject, date, snippet, unread
- Weather context: current temperature, apparent temperature, daily high/low, precipitation chance, condition code

Future adapters should project Notion, People, finance, richer fitness/activity, style/closet, packages and external waiting states into canonical Glow Objects rather than adding page-local data.

## Live time model
- Morning 05:00–10:00
- Between 10:00–16:00
- Evening 16:00–20:30
- Night 20:30–23:00

The client clock refreshes once per minute. Current block, wording, Day Flow state, next-event countdown, and preparation timing recompute from current time.

## Data sources now wired
- Glow PostgreSQL/Drizzle: tasks, routines, habits, notes, goals, wellness, Glow calendar events
- Google Calendar: read-only upcoming events through the existing Google OAuth integration
- Gmail: read-only bounded recent inbox metadata through the existing Google OAuth integration
- Weather: browser geolocation permission plus live Open-Meteo request
- Ask Glow: existing centralized Glow/Shakti runtime
- Task completion: existing authenticated Server Action, followed by Home revalidation

## Truthfulness rules
- Never render named people, workouts, beauty routines, money values, weather or events as if connected when the data is absent.
- Missing integrations render a useful empty or permission state.
- Suggestions may be generated from connected context but must be labeled as recommendations, not facts.
- The dashboard may summarize canonical records but never fork their identity.
- Consequential external actions continue to use the system approval, execution and receipt chain.

## Component system
LivingDashboard orchestrates the current-day projection. Its child card groups are top information, NOW, What Now, Big 3, Day Flow, schedule, routines, body, beauty, style, career, brand, admin, people, changed, leaving, mental load, can-wait, waiting, money and tomorrow.

The app-root shell continues to own Glow Current, Return Anchor, World Fold, Glow Thread, Ask Glow and universal action infrastructure.

## State and failure model
- Loading: cached personal-context snapshot renders immediately while refreshing.
- Empty: cards explain what is missing and provide one canonical next destination.
- Signed out: Home redirects to sign-in.
- Google permission missing/revoked: source status is preserved for connection management.
- Weather permission denied: weather card stays truthful and requests location permission.
- Offline: app-root NetworkStateBridge owns network state; session cache prevents a blank dashboard where possible.
- Mutation: tasks update through authenticated server actions and revalidate Home.

## Integration plan

### Notion
Not yet implemented in this repository. Add a dedicated server-side adapter using OAuth, selected-page/database permissions, stable external IDs, provenance, and a sync map into canonical Glow Objects. Read access is required for source-of-truth databases. Write access is required only if Glow should write captures or completions back into Notion.

### Google
Existing OAuth infrastructure is reused. Calendar requires calendar read scope. Gmail dashboard briefing requires Gmail read scope. Sending or modifying mail should remain separately permissioned and must not be implied by read access.

### Weather
Requires browser location permission. No street address is stored by this dashboard.

### Fitness and activity
The dashboard currently surfaces only fitness routines and wellness already present in Glow. Real step/activity metrics require a connected health/activity source and should enter through canonical fitness/recovery objects.

### People, Money, Style and Packages
These should be projected from their existing Glow rooms or future connected sources into the Life Model. Until present, Home shows truthful quiet states rather than invented values.

## Responsive plan
Desktop uses a wide editorial grid matching the reference hierarchy. iPad uses two-column top information and adaptive card grids. Narrow devices use single-column cards while the global Glow shell retains navigation meaning. Reduced-motion preferences suppress local transitions.

## Acceptance
- No demo facts are presented as real.
- Home is registered in the page manifest and inherits all eight synchronization dimensions.
- No second global navigation runtime.
- Task completion mutates canonical state.
- Calendar, Gmail and weather show source-backed state or explicit missing-permission state.
- Ask Glow remains the one centralized intelligence surface.
- UI remains usable on desktop and iPad and has a narrow-device fallback.
