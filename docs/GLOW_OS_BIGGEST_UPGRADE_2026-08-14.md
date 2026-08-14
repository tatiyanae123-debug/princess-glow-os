# Glow OS — Biggest Upgrade Architecture

Date: 2026-08-14
Status: implementation source of truth
Reference: the ten uploaded batch boards plus the expanded home/dashboard reference.

## 1. Core product model

Glow OS is one connected personal operating system, not a collection of separate apps.

The site has five permanent layers:

1. **Home layer** — the fastest daily control surface.
2. **Life domains** — planning, mind, wellness, beauty, money, work, home/world.
3. **Glow intelligence** — Brain, Concierge, Observations, Memory, Timeline, Graph, Briefings.
4. **Modes and tools** — Command Surface, Add Anything, Deep Focus, Interview Prep, Workout Studio, Ambient Space.
5. **System layer** — Gmail, Import, Connections, Notices, Settings, System Overview.

Every page should use the same editorial visual system: warm ivory background, refined serif headings, soft rose/plum accents, thin borders, low-contrast shadows, rounded cards, calm lifestyle photography, sparse data visualization, and no dense SaaS-dashboard styling.

## 2. Global navigation

The sidebar is organized by user intent instead of by technical feature count.

### TODAY
- Home
- Dashboard
- Briefings
- Debriefs

### LIFE
- Calendar
- Tasks
- Reminders
- Timeline
- Goals

### MIND
- Brain
- Concierge
- Memory
- Observations
- Graph
- Journal / Notes

### WELLNESS
- Wellness
- Fitness
- Food & Nutrition
- Medications & Supplements
- Habits
- Routines
- Sleep
- Symptoms & Recovery

### BEAUTY
- Beauty OS
- Beauty Lab
- Hair Studio
- Beauty Progress
- Hair Lifecycle
- Beauty Calendar

### MONEY
- Financial Brain
- Financial Overview
- Spending
- Savings
- Subscriptions
- Forecast
- Purchases & Transactions

### WORK + CREATE
- Projects
- Creative Studio
- Career & Work
- Applications
- Interviews
- Project Deep Dive
- Terrain Design Studio

### HOME + WORLD
- Home
- All Rooms
- Life World
- Travel
- Saint’s Space
- Closet

### TOOLS + MODES
- Command Surface
- Add Anything
- Deep Focus
- Interview Prep
- Workout Studio
- Ambient Space

### SYSTEM
- Gmail
- Import
- Connections
- Notices
- System Overview
- Settings

The collapsed/default sidebar only shows the most-used rooms. `All Rooms` remains the full directory.

## 3. Page groups from the reference batches

### Batch 1 — Today + Planning
- Home / Today command center
- Morning Brief
- Evening Debrief
- Calendar day view
- Calendar week view
- Calendar month view
- Timeline view

**Flow:** Home → Morning Brief → focused daily work → Evening Debrief → tomorrow preview.

### Batch 2 — Mind
- Brain
- Concierge
- Memory
- Timeline
- Observations
- Graph
- Journal
- Briefings

**Flow:** Inputs and life data feed Memory + Graph. Observations detect patterns. Brain explains what matters. Concierge turns the intelligence into actions. Briefings package it for the user.

### Batch 3 — Wellness
- Wellness overview
- Fitness
- Food & Nutrition
- Medications & Supplements
- Habits
- Routines
- Sleep
- Symptoms & Recovery

**Flow:** daily health signals feed Wellness; Fitness/Food/Medication/Routines act on them; Sleep and Symptoms show recovery; Brain can surface cross-domain insights.

### Batch 4 — Beauty
- Beauty OS
- Beauty Lab
- Hair Studio
- Beauty Progress
- Hair Lifecycle
- Beauty Calendar

**Flow:** Beauty OS is the hub. Beauty Lab stores products/ingredients/reactions. Hair Lifecycle manages wash-cycle logic. Progress tracks outcomes. Beauty Calendar schedules treatments and appointments.

### Batch 5 — Money + Goals
- Financial Brain
- Financial Overview
- Goals
- Spending
- Subscriptions
- Forecast
- Purchases & Transactions

**Flow:** transactions → spending/accounts → financial overview → forecast → Financial Brain recommendations → Goals.

### Batch 6 — Work + Create
- Projects
- Creative Studio
- Career & Work
- Applications
- Interviews
- Project Deep Dive
- Terrain Design Studio

**Flow:** Career & Work handles job pipeline. Projects handles all active work. Creative Studio is the making space. Project Deep Dive opens a specific project. Terrain Design Studio is a specialized project room.

### Batch 7 — Home + World
- Home
- All Rooms
- Life World
- Travel
- Saint’s Space
- Closet
- Gmail
- Import

**Flow:** Life World is the spatial overview. All Rooms is the directory. Home owns household systems. Travel/Closet/Saint are dedicated life rooms. Gmail and Import bring outside data into Glow.

### Batch 9 — Advanced Tools + Special Modes
- Command Surface
- Add Anything
- Deep Focus
- Interview Prep
- Workout Studio
- Ambient Space
- Connections
- System Overview

These are not primary life domains. They are temporary modes or cross-system utilities launched from anywhere.

### Batch 10 — Special Features + Integrations
- Reminders
- Gmail
- Import
- Brain Connection / child views
- All Rooms
- Notices
- Life Graph
- Home summary

These pages make Glow OS feel like a connected operating system rather than a static dashboard.

## 4. Homepage hierarchy

The expanded Home reference becomes the canonical home composition.

1. Cinematic greeting hero with Morning Brief CTA.
2. Four priority cards: Today’s Focus, Next Event, Morning Routine, Important Alert.
3. Today at a Glance.
4. Top Tasks.
5. Life Pulse.
6. Habit Tracker, Nutrition, Sleep, Mood.
7. Right rail: Upcoming, Glow Insight, Quick Actions, Tomorrow Preview.
8. Recently Opened / Explore Your World.
9. Recent Activity.

On iPad/mobile, the right rail becomes a stacked section below the primary content and the hero becomes shorter to keep interaction fast.

## 5. Routing model

Canonical URLs should be stable and readable:

- `/dashboard`
- `/briefings/morning`
- `/debriefs/evening`
- `/calendar?view=day|week|month|timeline`
- `/brain`
- `/concierge`
- `/memory`
- `/observations`
- `/graph`
- `/notes`
- `/wellness`
- `/fitness`
- `/food`
- `/medications`
- `/habits`
- `/routines`
- `/sleep`
- `/symptoms`
- `/beauty`
- `/beauty/lab`
- `/hair`
- `/beauty/progress`
- `/hair/lifecycle`
- `/beauty/calendar`
- `/finance/brain`
- `/finance`
- `/finance/spending`
- `/finance/subscriptions`
- `/finance/forecast`
- `/finance/transactions`
- `/goals`
- `/projects`
- `/creative-studio`
- `/work`
- `/work/applications`
- `/work/interviews`
- `/projects/[projectId]`
- `/projects/terrain-design`
- `/home`
- `/all-rooms`
- `/world`
- `/travel`
- `/saint`
- `/closet`
- `/command`
- `/intake`
- `/focus`
- `/interview-prep`
- `/workout-studio`
- `/ambient`
- `/connections`
- `/system`
- `/gmail`
- `/import`
- `/notices`
- `/brain/connections`
- `/settings`

## 6. Shared component system

Do not build every page as a one-off. Use a single reusable page language:

- `EditorialPageHeader`
- `HeroPanel`
- `MetricCard`
- `InsightCard`
- `ScheduleList`
- `ProgressRing`
- `MiniTrendChart`
- `ImageCard`
- `ActionCard`
- `TabbedPageNav`
- `RightRail`
- `StatusPill`
- `GlowInsight`
- `EmptyState`
- `QuickActions`

This keeps all 40+ views visually related and dramatically reduces maintenance.

## 7. Data relationships

The website should share the same underlying objects across pages rather than duplicating data.

- Calendar events feed Home, Briefings, Timeline, Work, Beauty Calendar, Travel.
- Tasks feed Home, Projects, Career & Work, Goals, Debriefs.
- Habits/routines feed Home, Wellness, Beauty, Sleep, Debriefs.
- Meals feed Food, Home, Wellness, Briefings.
- Medications feed Wellness, Reminders, Briefings.
- Finance entries feed Financial Overview, Spending, Forecast, Goals.
- Notes/files feed Memory, Projects, Creative Studio, Brain.
- Gmail feeds Career & Work, Reminders, Brain, Connections.
- Imported files are routed into the correct domain through Add Anything / Import.

## 8. Visual behavior

- Default mode is bright warm ivory. No dark-mode-first pages.
- Evening Debrief and Ambient Space may use warmer dusk tones while keeping readable light surfaces.
- Architectural or cinematic imagery is reserved for heroes and spatial rooms, not every card.
- Motion should be calm and functional: page fades, card lifts, progress animation, route continuity.
- Heavy 3D/scroll effects must degrade gracefully on iPhone/iPad.
- Focus Mode removes global chrome and leaves only the task/session surface.

## 9. Implementation order

1. Global navigation + route map + page shells.
2. Home + Morning Brief + Evening Debrief.
3. Mind batch.
4. Wellness batch.
5. Beauty batch.
6. Money + Goals batch.
7. Work + Create batch.
8. Home + World batch.
9. Tools + Modes.
10. Integrations + system pages.
11. Data wiring, QA, responsive polish, performance pass.

## 10. Non-negotiables

- Keep current Next.js/App Router + React + TypeScript + Tailwind + Neon/Drizzle + Auth.js architecture.
- Do not introduce a second auth or database system.
- Preserve real existing data/actions while changing presentation and navigation.
- Never replace a functional screen with a fake decorative mockup.
- Every CTA shown in the UI must route or perform a real action.
- Every page must work on iPad and iPhone.
