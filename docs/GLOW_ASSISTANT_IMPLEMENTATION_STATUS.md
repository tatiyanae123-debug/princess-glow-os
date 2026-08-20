# Glow Assistant — implementation status

This branch turns the conversational Glow vision into working Glow OS surfaces while preserving the existing app architecture and integrations.

## Implemented in this upgrade

- Ethereal global Glow orb with idle, listening, thinking and speaking states.
- Global conversational voice/text command surface.
- Personal source-of-truth data for the long routines/habits document and the 2026 workout system.
- Idempotent routine/habit installation into the existing user-scoped database.
- Morning, Midday, Night, Sunday and weekday reset/maintenance routines.
- Core daily habit set covering planning, hydration, medication tracking, supplements, beauty/hair care, movement, protein, steps and digital boundaries.
- 2026 Fitness Plan view with the seven-day split and daily workout resolution.
- Morning Brief that combines tasks, calendar, wellness, routines, habits and the assigned workout.
- “What should I do next?” orchestration using live personal context.
- Direct private Glow Memory capture for phrases beginning with “Remember…”, “Save this…”, or “Don’t forget…”.
- Glow Cards visual engine for Morning Ritual, Midday Reset, Night Ritual, Sunday Reset, Today’s Workout and Weekly Fitness Schedule.
- Safe review proposals for calendar, reminder and external changes before execution.
- Existing Apple Reminder intelligence, connected calendar context, quick-create, universal intake, recommendations and room awareness remain preserved.

## Safety / capability boundary

Glow OS can act inside its own database and through integrations that have explicit write support. It must not pretend to control arbitrary iOS/macOS screens or silently mutate external services without an available API/permission. Calendar, reminder, email, purchasing and other external/destructive actions stay confirmation-gated. Native device-level screen control would require a separate native accessibility/Shortcuts layer and platform permissions; it cannot be provided by a Next.js web app alone.

## Source-of-truth rule

User-authored or imported data is never deleted to apply this upgrade. The seeded personal operating system is versioned and installed idempotently so future source revisions can be migrated without duplicating the current system.
