# Glow OS Personal Intelligence Master Plan

## Product definition

Glow OS is not a collection of pages. It is a personal intelligence system that understands what matters, shows what needs attention, and helps the user act without overwhelm.

## Product principles

1. Calm before complexity.
2. Private by default.
3. Explain every recommendation.
4. Require approval before changing tasks, routines, schedules, health records, or finances.
5. Reuse the existing Next.js App Router, Auth.js, Neon Postgres, Drizzle ORM, Tailwind CSS, Server Actions, and Zod architecture.
6. Do not add a second database, auth system, ORM, or styling framework.
7. Never store account passwords in source control or the database.
8. Build every major workflow with mobile and iPad use as a first-class requirement.

## 1. Dynamic living dashboard

The dashboard must adapt to:

- time of day
- day of week
- workday versus rest day
- native and Google Calendar events
- unfinished tasks
- scheduled workout
- energy and wellness logs
- weekly theme
- weather
- beauty, hair, finance, home, and Saint-care needs

### Required capabilities

- contextual greeting and summary
- morning, afternoon, evening, and night states
- low-energy mode
- appointment-aware planning
- workday and rest-day layouts
- widget pin, hide, resize, and reorder
- per-widget data source and last-updated indicator
- graceful disconnected and empty states

## 2. AI Concierge

The AI Concierge must support questions and requests such as:

- What should I do right now?
- Make today lighter because I am exhausted.
- What have I been neglecting?
- Reschedule everything unfinished.
- Prepare me for tomorrow.
- What beauty treatments are due this week?
- What should I focus on financially?
- What projects have stalled?
- Build today around my appointment.
- Turn this email into a task and calendar block.

### Approval model

The Concierge may analyze and propose immediately, but must create an explicit proposal before modifying:

- tasks
- routines
- calendar events
- habits
- projects
- health records
- finance records

Each proposal must include:

- plain-language summary
- exact records affected
- reason
- confidence
- reversible versus irreversible classification
- approve, edit, or reject controls
- audit-log entry after execution

## 3. Planning levels

### Today

- tasks
- routines
- calendar
- habits
- workout
- meals
- Saint care
- morning briefing
- evening recap

### Week

- weekly focus
- day themes
- habit grid
- workout tracker
- beauty and hair schedule
- spending snapshot
- unfinished-task rollover
- reflections

### Quarter and Year

- goals
- savings
- debt
- fitness progress
- books
- achievements
- bucket list
- projects
- identity goals
- quarterly reviews
- yearly manifesto

Today-level completions must be able to contribute to linked weekly, quarterly, and yearly goals.

## 4. Personal Memory

Every memory-capable record should support:

- date
- source
- category
- related project
- people involved
- confidence
- privacy level
- user corrections
- attachments
- related memories

The system should eventually answer:

- When did I last wash my wig?
- What products irritated my skin?
- What jobs did I apply to this month?
- How much have I spent on beauty?
- When was Saint's last grooming appointment?
- What did I decide about Terrain Design?
- Which routines help most when my energy is low?

## 5. Intelligent observations

Observation examples:

- workout timing patterns
- spending changes on low-energy days
- medication logging gaps
- upcoming hair treatment
- stalled projects
- sleep and wellness decline
- Sunday Reset correlation with stronger weeks
- overbooking by daypart
- beauty product depletion estimates
- subscription review reminders

### Observation requirements

- supportive tone
- evidence summary
- confidence score
- time window
- dismiss, snooze, or act controls
- no medical diagnosis
- no automatic financial action

## 6. Master Import and Template Library

Reusable templates:

- productive morning
- low-energy morning
- workday
- appointment day
- reset day
- hair wash day
- everything shower
- gym day
- recovery day
- travel day
- social day
- sick day
- Sunday Reset
- monthly reset

All imports must include preview, selection, editing, duplicate detection, import batch ID, source metadata, undo, and audit history.

## 7. Intelligent habits

Habit fields:

- daily, weekly, or custom frequency
- minimum and stretch goals
- time of day
- duration
- skip reasons
- streaks
- flexible recovery rules
- related goal
- related routine
- energy required
- completion notes
- acceptable alternate completions

Example: Movement can be completed through Pilates, gym training, or a long walk.

## 8. Advanced project manager

Initial projects:

- Glow OS
- Terrain Design
- Beauty brand
- Creative Branding Studio
- Career
- Pinterest and affiliate content
- Routine Cards

Project fields:

- current phase
- priority
- progress
- milestones
- next action
- deadlines
- files
- notes
- decisions
- research
- budget
- activity history
- AI-generated weekly status

The dashboard should always show the next action for each active project.

## 9. Life Timeline

Zoom levels:

- day
- week
- month
- year
- life chapter

Timeline sources:

- jobs
- trips
- photos
- relationships
- projects
- routines
- books
- fitness changes
- beauty progress
- achievements
- journal entries
- major decisions

## 10. Health and beauty intelligence

### Beauty Laboratory

- product name
- category
- ingredients
- opened date
- expiration
- routine position
- reaction
- cost
- repurchase status
- usage frequency
- progress photos
- compatibility warnings

### Hair Intelligence

- wash dates
- bond treatments
- scalp treatments
- style
- heat use
- product buildup
- wig maintenance
- trims
- breakage
- photos
- next required action

### Fitness Intelligence

Recommendations may consider:

- available time
- equipment
- soreness
- energy
- sleep
- previous session
- cycle
- injuries
- weekly progress

Any schedule-changing recommendation requires approval.

## 11. Financial brain

- spending trends
- savings goals
- debt payoff
- subscriptions
- projected cash flow
- beauty spending
- food spending
- Saint expenses
- travel savings
- recurring bills
- upcoming charges
- scenario planning

Recommendations must be educational and user-approved. They must not move money or cancel services automatically.

## 12. Emotional design

- soft animations
- completion sounds
- optional confetti
- time-of-day lighting
- themed backgrounds
- personalized photos
- progress landscapes
- seasonal visuals
- celebration moments
- gentle empty states
- encouraging language
- reduced-motion support
- mute controls

The aesthetic target is luxurious, calm, feminine, intelligent, and never childish.

## 13. Optional gamification

XP examples:

- workout: 50 XP
- morning routine: 30 XP
- reading: 15 XP
- Sunday Reset: 100 XP
- weekly-priority bonus

Visual metaphors:

- habit constellation
- fitness mountain
- savings river
- reading bookshelf
- project garden
- streak tree
- goal journey

Gamification must be optional and removable without affecting core data.

## 14. Automation and briefings

### Morning briefing

- schedule
- top three tasks
- workout
- weekly theme
- weather
- Saint care
- reminders
- encouraging message

### Evening recap

- completed items
- unfinished tasks
- spending
- habit progress
- tomorrow preview
- suggested adjustments

### Weekly review

- accomplishments
- missed habits
- spending changes
- project progress
- fitness summary
- next-week priorities

Start with in-app and email delivery. SMS is a later phase requiring separate approval, cost review, phone verification, webhook security, and rate limiting.

## 15. Privacy and security

- private-by-default records
- per-category privacy controls
- export and deletion tools
- connection revocation
- audit history
- encrypted OAuth tokens
- no passwords in the database
- separate health and finance permissions
- explicit AI action approvals
- secret scanning
- redacted logs
- least-privilege Google scopes

## Development order

1. Finish Google Calendar and Gmail safely.
2. Complete the Master Importer.
3. Build full Today and Week experiences.
4. Add Planning Hub persistence.
5. Build the AI Concierge with approval-based actions.
6. Add projects, memory, and intelligent observations.
7. Add finance, beauty, hair, fitness, and closet intelligence.
8. Add briefings, timeline, and optional gamification.

## Definition of done

A feature is not complete until it has:

- persisted data
- loading, empty, disconnected, and error states
- mobile and iPad behavior
- accessibility support
- validation
- permission and privacy handling
- auditability where relevant
- tests
- TypeScript check
- lint
- production build
- documented migration and rollback steps when schema changes are involved
