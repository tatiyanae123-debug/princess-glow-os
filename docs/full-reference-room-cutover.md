# Glow OS Full Reference-Room Cutover

This branch makes the reference-driven room system the normal visible experience while preserving all existing page children, routes, data access, integrations, authentication, Apple Reminders, AI/voice, and legacy capabilities behind an expandable capability vault.

## Non-negotiable rules

- Replace old visible page presentation, never delete underlying data or integrations.
- Keep Glow Voice global and context-aware.
- Keep user-replaceable imagery global.
- Keep real existing page functionality accessible during migration.
- Use the 23 supplied references as direct visual/structural specifications.
- Preserve horizontal + vertical spatial movement.
- Optimize iPad as a primary experience and recompose separately for iPhone.
- Do not create a second database/auth/ORM/styling system.

## Page mapping

Dashboard: command center + editable mood board + contextual right rail.
Tasks: tactile planning desk with Do First / Do Today / Can Wait and Inbox / Waiting On / Someday.
Calendar: editorial time wall with day/week/month/year/timeline modes.
Planning: strategy board with Top Three, appointments, deadlines, shopping, groceries, waiting-on, ideas, meals, projects, Sunday Reset.
Routines: library + guided player + active step + adaptive modes.
Habits: Garden View + List View + streak tree/score/insights.
Fitness: training studio with workout, muscle focus, recovery, progress, body stats.
Wellness: quiet sanctuary with check-in, tools, journal, sleep and AI companion.
Food: visual kitchen + meals, pantry, recipes, meal plan, groceries, hydration, nutrition.
Beauty OS: beauty HQ with routine, habits, progress, inventory, wishlist, budget, treatments.
Beauty Lab: laboratory/archive with product lifecycle, ingredients, compatibility, reactions, skin journal.
Hair: salon/lifecycle tracker with wash schedule, goals, stats, product shelf, treatments, inspiration.
Finance: operational money room.
Financial Brain: intelligence/forecasting/decision room.
Goals: aspirational goal studio + timeline + vision board + reflections + achievements.
Notes: editorial notebook system + quick capture + conversions to other Glow objects.
Settings: control room for account, integrations, privacy, AI, voice, images, layout, accessibility.
Life World: standard bright world map + immersive dark portal world.

## Migration approach

The current old page children remain mounted only inside a collapsed `Advanced tools & preserved legacy capabilities` vault so no data workflows are lost during the visual cutover. The reference workspace is now the primary visible room.
