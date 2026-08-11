# GLOW OS — WORLD REDESIGN MASTER SPEC

## Mission

Treat the approved editorial dashboard reference as the visual and interaction master plan for the entire Glow OS application, not only the Dashboard. Preserve the existing application architecture, authentication, Neon/Postgres database, Drizzle ORM, working routes, integrations, current data, and completed functionality. Redesign and expand the presentation and interaction layer so every Glow OS section becomes a rich, useful, deeply interactive room in one connected personal operating system.

This is an execution specification, not a brainstorming document. The implementation agent should inspect the repository, map existing routes/data/components to this spec, reuse working systems, add missing data structures only where needed, implement iteratively, run typecheck/tests/build, and open a PR when the branch is stable. Do not ask the user to manually copy code between tools.

## Product Principle

Glow OS must stop feeling like a collection of beige SaaS pages. It should feel like an editorial digital mansion: warm ivory, blush, champagne, sage, dusty peach and lavender; serif editorial headings; refined script accents; tactile paper/linen surfaces; photography, cutouts, Polaroids, botanical illustration, magazine composition, soft shadows, and responsive interactive widgets.

Every visual object must either provide context or perform a useful function. Decorative editorial moments are encouraged, but never at the expense of usability, responsiveness, accessibility or real data.

## Permanent World Navigation

Primary rooms:
Dashboard; Tasks & Planner; Calendar; Planning; Routines & Rituals; Habits; Fitness; Wellness; Food & Nutrition; Beauty OS; Beauty Lab; Hair; Finance; Financial Brain; Goals; Projects; Brain; Concierge; Observations; Memory; Timeline; Briefings; Closet; Gmail; World; Home; Connections; Notes & Brain Dump; Import; Settings.

The sidebar should remain recognizable and stable. Each room gets a distinct visual personality while retaining the same design system and navigation behavior.

## Universal Page Architecture

Every major room should implement, where relevant:

1. Identity/Header Area — title, subtitle, current context, optional editorial photography.
2. Hero Module — the most important thing happening in that room now.
3. Quick Intelligence Strip — 3–6 useful measurements or statuses.
4. Primary Action — contextual CTA such as Build My Day, Start Ritual, Start Workout, Plan Meals or Add Transaction.
5. Main Interactive Workspace — the actual functional tool, not a placeholder.
6. Editorial Visual Layer — image, collage, mood board, visual collection or progress visualization.
7. AI Insight — useful observation grounded in current data.
8. History & Progress — retain continuity across visits.
9. Quick Add — room-specific capture.
10. Cross-System Intelligence — actions update or reference related systems.
11. Contextual Modes — desktop/iPad/iPhone responsive states and focused modes.
12. Customization — widgets can be pinned, moved, resized, hidden or reordered when feasible.

## 01 Dashboard — The Grand Foyer

Create a living editorial home screen that summarizes the entire system. The hero should combine greeting, day theme, date/weather/context and a dynamic editorial collage. The collage can use user-controlled images, saved inspiration, current project imagery, goal imagery, beauty/food/travel objects and memory photographs.

Core dashboard widgets: Top Priority, Tasks Today, Habit Score, Focus Time, Water, Sleep/Energy when available, Today’s Plan, Ritual of the Day, Upcoming, playlist, Habit Tracker, Workout Plan, Beauty OS, Today’s Meals, Grocery Reminder, Finance Overview, Top Tasks, Journal, Inspiration, Dream Destination, Wellness Essentials, Current Goal, Project Progress, AI Observation, Use-Soon food reminder and Tomorrow Preview.

All dashboard widgets must connect to real routes/data and expose View/Start/Edit/Add/Complete/Ask AI actions where relevant.

## 02 Tasks & Planner — The Life Control Desk

Make tasks feel like an elegant stationery workspace rather than a plain list. Core views: Top 3, Today, Upcoming, Overdue, Waiting, Someday. Native categories should include Personal, Beauty, Fitness, Wellness, Food, Home, Career, Finance, School, Glow OS, Projects, Admin, Saint and Social.

Primary action: BUILD MY DAY. Use tasks + calendar + routines + meal times + workouts + deadlines + priorities + travel/context to propose a realistic day.

Task actions: complete, edit, reschedule, break into steps, attach note/file, assign project, calendarize, set reminder, ask AI, recurring, duplicate, move tomorrow, lower priority, convert to routine.

Add task triage, drag-and-drop prioritization, batch actions, duration estimates, dependency support, waiting-on status and AI next-action suggestions.

## 03 Calendar — The Time Gallery

Create Today/Week/Month/Year/Timeline views with visual dayparts: Morning 5–10, Afternoon 10–4, Evening 4–8:30, Night 8:30–11. Use restrained blush/sage/peach/lavender category tinting.

Support appointments, work, school, routines, workouts, meals, meal prep, hair, beauty, planning, Saint care, projects, social plans, deadlines, reminders, cleaning and finance.

Event actions: Start, Move, Skip Today, Short Version, Ask Glow OS, Edit, Convert to Task. Meal events: Cook, Swap, View Recipe, Add Missing Ingredients.

Add conflict detection, travel buffers, focus blocks, recurring ritual visibility controls, calendar load indicator and AI schedule repair.

## 04 Planning — The Strategy Studio

Create Today/Week/Month/Quarter/Year planning views plus Brain Dump, Top Three, Appointments, Deadlines, Things to Buy, Groceries, Things to Remember, Waiting On, Ideas, Meals to Make and Projects to Move.

Sunday Reset should become a guided ceremony with focused one-step mode covering cleaning, laundry, groceries, meal prep, planning, beauty, hair, finances, calendar and week setup.

Add planning review history, weekly theme, capacity planning, unfinished-item review, recurring reset templates and automatic carry-forward rules.

## 05 Routines & Rituals — The Ritual Library

Create beautiful visual routine cards for Morning, Midday Reset, Evening Wind-Down, Night Ritual and weekly themes. Routine Mode should show one step at a time with progress.

Support Full, Normal, 15-Minute, Running Late, Low Energy and Exhausted variants. Preserve routine purpose while adapting length.

Add estimated duration, skip/replace step, pause/resume, completion history, preferred variant by context and routine-builder tools. Allow a routine step to create a task, calendar block, habit or reminder.

## 06 Habits — The Personal Growth Garden

Use a botanical growth metaphor. Habits may include Morning Routine, Workout, Skincare AM/PM, Water, Hair Protection, Reading, Steps, No Spend, Planning, Supplements, Protein Breakfast and No Scrolling.

Core views: weekly heat map, monthly completion, strongest habits, least consistent habits, best completion time, trends, streaks and correlations.

Visual behavior: completed habits grow the garden. Avoid shame-based language. Add flexible streaks, minimum versions, habit pause, context-aware suggestions and AI observation grounded in data.

## 07 Fitness — The Body Sculpting Studio

Use editorial fitness photography and clean active workout surfaces. Core workspace: Today’s Workout, Weekly Split, Exercise Library, Progressive Overload, Steps, Cardio, Core, Measurements, Progress Photos, Recovery, Mobility and Workout History.

Workout Mode should strip away clutter. Each exercise displays sets/reps/load, prior performance, timer, form notes and next exercise.

Add workout templates, progression suggestions, readiness/recovery input, equipment filters, short-workout mode and links to Food, Wellness, Calendar and Goals.

## 08 Wellness — The Sanctuary

Use calm negative space, sage, water, tea, flowers and sunlight. Core cards: Mental Reset, Hydration, Sleep, Stress, Energy, Movement, Breathwork, Posture, Lymphatic Routine, Supplements, Meals and Recovery.

Primary action: I NEED A RESET. Launch a guided reset using breath, posture release, hydration/refuel check, priority review and one next action.

Add wellness check-in, gentle trend views, sleep/energy context if data exists, recovery-day mode, supplement schedule, self-care queue and cross-links to routines/fitness/food.

## 09 Food & Nutrition — The Nourishment Kitchen

Create an editorial kitchen + meal planner + grocery command center + pantry + recipe library + food intelligence system.

Views: Today, Meal Plan, Recipes, Groceries, Pantry, Meal Prep, Favorites, Food Brain.

Today: Breakfast/Lunch/Dinner/Snacks/Water plus Planned, Prepared and Missing-Ingredient status.

Quick intelligence: Meals Planned, Grocery Stock %, Protein Meals, Water, Food Budget, Use Soon.

Weekly Meal Plan: seven-day drag/drop meal cards with Swap, Repeat, Leftovers, Eating Out and Move actions.

Recipe fields: name, photo, meal type, prep/cook time, ingredients, directions, servings, protein source, optional nutrition, favorite, rating, estimated cost, last made, notes, leftover life, freezer-friendly, meal-prep-friendly and tags.

Smart Grocery List: generate from meal plan minus pantry inventory plus locked staples. Categorize Produce, Frozen, Protein, Grains, Dairy/Alternatives, Pantry, Condiments, Snacks, Drinks and Household. Purchased items can update Pantry.

Pantry/Fridge: quick states Full/Some Left/Low/Out plus optional quantity, purchase date, opened date, expiration, use-soon, location, servings, cost and linked recipes.

Use Soon: prioritize foods nearing expiration and suggest saved recipes first.

Meal Prep Mode: Review Week → Choose Meals → Check Pantry → Generate Groceries → Shop → Stock → Prep → Store → Schedule → Kitchen Reset.

Food Brain queries: What can I make with what I have? Build next week’s meals. Use leftovers. What is going bad? What do I repeatedly buy? What can I prep Sunday?

Connect Food to Fitness, Finance, Home/Kitchen, Calendar, Concierge and Observations.

## 10 Beauty OS — The Vanity Room

Use a Vogue-like vanity environment with product photography, shelves, mirrors, soft florals and gold tools. Core areas: Today’s Beauty Routine, AM Skincare, PM Skincare, Body, Gua Sha, Face Yoga, Lymphatic, Oral Care, Nails, Fragrance, Everything Shower and Maintenance.

Turn routines into interactive guided flows. Add weekly/monthly maintenance calendar, beauty schedule, today/tonight tabs, low-energy version, history and progress photo links.

## 11 Beauty Lab — The Product Laboratory

Create a visual inventory database. Product fields: product, brand, category, purchased, opened, expiration, routine, AM/PM, frequency, ingredients, reaction, rating, cost, repurchase, notes and progress photos.

Views: Shelf, Routine, Expiring, Favorites, Do Not Repurchase, Wishlist, Empty Soon.

Add inventory levels, cost-per-use estimate, duplicate detection, routine compatibility notes, restock queue, product history, before/after tracking and automatic Beauty OS linking.

## 12 Hair — The Hair Atelier

Create a premium salon-like room. Current Hair State: style, last wash, next wash, scalp, ends, heat exposure and growth progress.

Core cards: Morning Hair, Night Hair, Wash Day, U-Part Wig, Scalp, Ends, Minoxidil, Protective Styling, Products, Growth and Progress Photos.

Sunday and Thursday should visually highlight wash/maintenance cycles when applicable. Start Wash Day launches guided steps.

Add hairstyle history, install/unit tracking, heat log, trim history, product inventory, scalp/ends check-ins, growth photo timeline and maintenance forecast.

## 13 Finance — The Money Room

Keep visually refined but more analytical. Core: spent, budget, category chart, transactions, bills, subscriptions, savings goals, monthly budget, spending calendar and upcoming charges.

Categories should include Needs, Wants, Beauty, Food, Transportation, Home, Saint, Subscriptions, Savings and Investments plus existing user categories.

Add recurring transaction detection, bill calendar, category drilldown, monthly comparison, purchase tagging, savings envelopes and cross-links from Food/Beauty/Closet/Projects.

## 14 Financial Brain — Money Intelligence Center

Finance records. Financial Brain interprets.

Core tools: Cash-Flow Forecast, Savings Projections, Subscription Detector, Purchase Analyzer, Scenario Planner, Monthly Forecast and Financial Observations.

Queries: Can I afford this? Where did I overspend? What should I save? What subscriptions am I barely using? How much did I spend on takeout/beauty/etc.?

Add confidence/evidence to every observation and provide Act/Dismiss/Snooze/Why controls.

## 15 Goals — The Dream Gallery

Every goal is an editorial destination card rather than a spreadsheet row. Goal types: Glow OS, Fitness, Money, Career, Beauty, Travel, Home, Personal Growth and custom.

Goal detail: vision image, why, target, progress, milestones, supporting habits, supporting projects, next action, deadline, journal and timeline.

Add goal dependencies, milestones, archived goals, pace/projection, weekly contribution summary and automatic linking to tasks/projects/habits.

## 16 Projects — The Creative War Room

Project covers for Glow OS, Terrain Design, Creative Branding Studio, Content, Career and future ideas. Detail workspace: overview, status, progress, next action, milestones, tasks, calendar, files, notes, ideas, mood board, activity and AI Project Manager.

Always surface WHAT DO I NEED TO DO NEXT? Add project health, blocked/waiting states, decision log, timeline, references, deliverables and archive.

## 17 Brain — The Intelligence Chamber

Brain is the reasoning layer across Tasks, Calendar, Habits, Routines, Food, Fitness, Wellness, Finance, Projects, Goals, Observations and Memory.

Quick actions: Build My Day, Lighten My Day, Plan Tomorrow, What Am I Neglecting?, Prioritize My Week, Help Me Decide, Explain My Patterns, Build My Meals, Prepare My Reset.

Responses should produce actions and proposed changes, with transparent evidence/context. Add approval previews before destructive or external actions.

## 18 Concierge — The Personal Service Desk

Concierge is the execution layer. Requests: schedule something, prepare morning, create grocery list, plan meals, plan outing, prepare appointment, organize errands, build packing list, prepare tomorrow.

Add multi-step execution plans, connection awareness, confirmation only when necessary, and status history. Distinguish Brain = think/recommend and Concierge = organize/act.

## 19 Observations — The Pattern Observatory

Display intelligence cards such as hair wash tomorrow, product low, food use-soon, repeatedly postponed tasks, spending changes and stalled projects.

Each observation: evidence, confidence, detection date, related room, recommended action. Actions: Act, Dismiss, Snooze, Ask Why.

Add filters, categories, resolved history and anti-noise rules so only useful observations surface.

## 20 Memory — The Digital Memory Library

Long-term archive for photos, notes, events, decisions, places, people, projects, lessons, journal entries and milestones.

Search examples: When did I…? What did I decide about…? Show everything related to Terrain Design.

Add source, date, category, related entity, confidence, correction, privacy level, favorites and memory timeline.

## 21 Timeline — The River of Your Life

Interactive Today → Week → Month → Year → Years → Lifetime zoom. Surface photos, trips, jobs, goals, relationships, projects, achievements, journal entries, beauty/fitness progress, purchases and major life changes.

Add filters, milestones, comparison periods and jump-to-date.

## 22 Briefings — Your Personal Newspaper

Morning briefing: Today at a Glance, Schedule, Top Priorities, Routine, Weather, Deadlines, Meals, Money, Habits, Projects, Important Email, AI Observation, Tomorrow Preview.

Night closing report: Completed, Moved, Missed, Learned, Spent, Meals, Habits, Tomorrow.

Add configurable sections, concise/deep modes and archive.

## 23 Closet — The Digital Dressing Room

Visual inventory: tops, bottoms, dresses, shoes, bags, jewelry, work, gym, going out, seasonal.

Today’s Outfit should use weather + calendar + dress code + occasion + preferences where available.

Add outfit history, cost per wear, laundry status, favorites, wishlist, packing, donate, never worn, outfit planner and capsule/season views.

## 24 Gmail — The Communication Desk

Do not clone Gmail. Surface Needs Reply, Important, Appointments, Orders, Work, School, Finance and Subscriptions.

Email actions: Summarize, Draft Reply, Turn Into Task, Add to Calendar, Attach to Project, Remember.

Add follow-up detection, waiting-on view, order/appointment extraction and connection to Briefings/Concierge.

## 25 World — The Immersive Glow OS World

Optional world view maps rooms to systems: Bedroom → Morning/Night Routines; Vanity → Beauty; Dressing Room → Closet; Gym → Fitness; Spa → Wellness; Kitchen → Food; Office → Projects/Goals; Library → Memory/Notes/Learning; Bank → Finance; Garden → Habits; Travel Room → Travel.

Implement progressively. Desktop/iPad can use spatial cards first; full 3D is optional and must not block core functionality.

## 26 Home — Physical World Command Center

Rooms: Bedroom, Bathroom, Kitchen, Closet, Car, Laundry, Saint. Each: cleaning status, last reset, next reset, supplies, inventory, tasks and photos.

Kitchen connects to Food; closet connects to Closet; laundry connects to clothing status; Saint connects to care tasks/calendar.

Add recurring maintenance, supplies low, room reset templates and home timeline.

## 27 Connections — The Integration Room

Visual connection cards for Google Calendar, Apple Reminders, Gmail, Health, Weather and future services. States: Connected, Syncing, Needs Attention, Not Connected.

Show last sync, permissions, data used, reconnect, disconnect and privacy. Add sync-health diagnostics and clear error recovery.

## 28 Notes & Brain Dump — The Thought Studio

Pastel sticky-note/linen-board experience. Categories: Brain Dump, Ideas, Personal, Glow OS, Beauty, Food, Shopping, Projects, Things to Remember, Unsorted.

Primary action: ORGANIZE WITH AI. Suggestions: Task, Event, Project, Goal, Memory, Shopping Item, Grocery Item, Recipe Idea, Note.

Preserve the principle Brain Dump first, organize second. Add quick capture, pinning, backlinks and note-to-entity conversion.

## 29 Import — The Intake Portal

Accept PDF, screenshot, photo, CSV, notes, calendar data, routine docs, receipts, product lists, recipes and grocery lists. Extract candidate entities, show preview, then distribute to destination systems.

Add duplicate detection, confidence, source tracking, undo and import history.

## 30 Settings — The Control Room

Sections: Profile, Appearance, Theme, Photos, Widget Layout, Dashboard, Notifications, AI Behavior, Privacy, Memory, Integrations, Calendar, Routines, Food Preferences, Data, Export, Delete, Security, Accessibility.

CUSTOMIZE GLOW OS: backgrounds, hero photos, card images, accent colors, fonts, widget order, widget size, dashboard density, sidebar, page covers, world appearance and room themes without editing code.

## Cross-System Data Model

Extend current schema conservatively. Reuse existing models when possible.

Core relations:
Routine → Steps → optional Task/Habit/Event
Habit → Logs/History
Calendar Rule → Events
Beauty Product → Routine + Inventory + Usage
Workout → Exercises → Sets/History
Meal → Recipe/Foods
Recipe → Ingredients
Ingredient/Food → Pantry
Meal Plan → Meals → Grocery Needs
Grocery Item → Pantry after purchase
Food Inventory → Recipe/Use-Soon suggestions
Food Transaction → Finance
Goal → Milestones → Projects/Habits/Tasks
Project → Actions/Tasks/Files/Notes
Observation → Evidence + Related Entity
Memory → Sources + Related Entity
Brain → reasoning across all domains
Concierge → approved actions across connected domains

## Global Intelligence Layer

Implement a shared context service that can answer, at minimum:
- What matters now?
- What is next?
- What is overdue?
- What can move?
- What is blocked?
- What should be prepared?
- What is running low?
- What is expiring?
- What is slipping?
- What deserves attention this week?

AI recommendations must distinguish recorded fact from inference.

## Global Action Layer

Every major entity should support context-aware actions from a shared action pattern. Examples:
Task: complete/reschedule/split
Event: move/shorten/skip
Routine: start/use shorter version
Meal: cook/swap/leftovers
Product: mark low/restock
Observation: act/dismiss/snooze
Project: next action
Goal: update progress

## Responsive System

iPad is a first-class target. Desktop uses multi-column editorial layouts. iPad uses fewer columns without losing hierarchy. iPhone becomes an intentional vertical magazine feed with sticky quick actions and focused modes rather than a squeezed desktop grid.

## Data Safety and Integration Rules

- Keep Next.js App Router, TypeScript, Tailwind, Neon/Postgres, Drizzle, Auth.js and Vercel.
- Do not add Supabase or a second auth/database system.
- Do not break working integrations.
- Do not hard-code private data into client code.
- Use migrations only when genuinely required.
- Preserve current user data.
- External OAuth/Apple permissions may require the platform’s unavoidable user authorization; do not invent a bypass.

## Implementation Order

1. Audit routes, schema, reusable components and current room system.
2. Establish global editorial design tokens and responsive primitives.
3. Upgrade AppShell/sidebar/top navigation/room headers.
4. Upgrade Dashboard.
5. Upgrade Tasks/Calendar/Planning/Routines/Habits.
6. Upgrade Fitness/Wellness/Food/Beauty/Beauty Lab/Hair.
7. Upgrade Finance/Financial Brain/Goals/Projects.
8. Upgrade Brain/Concierge/Observations/Memory/Timeline/Briefings.
9. Upgrade Closet/Gmail/Home/Connections/Notes/Import/Settings.
10. Add/expand cross-system data models and action layer.
11. Add responsive behavior and customization.
12. Typecheck, lint/test as configured, production build, then fix errors before PR.

## Definition of Done

The redesign is not complete because pages exist. It is complete when every main room:
- has purposeful visual identity;
- contains useful real functionality;
- uses real data or explicit empty states;
- has a primary action;
- has at least one cross-system connection where meaningful;
- works on iPad/iPhone/desktop;
- avoids blank beige dead space;
- follows the same editorial design system;
- passes typecheck/build;
- preserves existing functionality and data.

The final product should feel like one intelligent personal digital world, not thirty independent dashboards.