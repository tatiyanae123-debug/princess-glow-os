# Glow OS Reference Room Functional Contract

This document is the interaction contract for the full reference-room rebuild. A control is not considered complete because it looks clickable. Every visible button, tab, chevron, link-like label, image action, rail action, object, and AI recommendation must do one of four things: execute a real existing action, navigate to a real page/view, open a real detail/editor, or open the preserved real capability while its native replacement is still being migrated.

## Global rules

1. No dead controls. If a native reference-room interaction has not yet been remapped, it must open the Data Connection Vault for that room rather than doing nothing.
2. Sidebar destinations are real routes.
3. Search opens Glow Brain search with current-room context.
4. More options opens the current room's complete preserved controls.
5. Glow Voice opens from every room and receives the current route as context.
6. Add Task, Event, Habit, Ritual, Goal, Note, Wellness Check-in, Beauty Step, and Finance Entry open the real existing forms.
7. Image controls must keep working independently of normal room actions.
8. Tabs represent real views. Where the new native view is not finished, the corresponding preserved real tool must open.
9. AI buttons never act as decoration. They either open contextual Glow Voice/AI, create an explicit proposal, or execute an existing low-risk action.
10. Destructive, external-account, bulk, or financial changes require the existing risk/confirmation rules.

## Dashboard
- Mood Board: add, replace, reset, reorder/pin when native support exists; image replacement always remains available.
- Build My Day: opens `/today` and real Build My Day logic.
- Plan My Meals / Grocery List: Food & Nutrition.
- Prepare My Reset: Routines reset flow.
- Today plan / upcoming / meals / habits: open their source rooms or source detail.
- Glow Intelligence / Do It For Me: contextual AI action/proposal.

## Tasks & Planner
- Add Task: real TaskForm.
- Task objects: real task details/edit/completion when native binding is present; preserved Tasks controls during migration.
- Do First / Do Today / Can Wait / Inbox / Waiting On / Someday: status views of the same underlying task system, never duplicate databases.
- Planner: Planning room.
- Focus Timer: Today/Focus.
- Fix My Day: Build My Day / contextual AI.

## Calendar
- Add Event: real EventForm.
- Today / Day / Week / Month / Year / Timeline: real calendar views.
- Event blocks: existing event detail/editor.
- Schedule intelligence: contextual AI.
- Connected Calendar / reminders remain existing sources.

## Planning
- Today / Week / Month / Quarter / Year: real planning scopes.
- Brain Dump: Universal Intake brain-dump mode.
- Top Three / appointments / deadlines / groceries / waiting / ideas: open the corresponding connected data.
- Sunday Reset: Routines reset flow.
- Quick Add controls: real forms.

## Routines & Rituals
- Create Ritual: real RoutineForm.
- Library / Morning / Night / Weekly / Hair Days / Events / Everything Shower / Custom: views over the existing routine system.
- Start / Continue Ritual: guided routine controls.
- Adaptive modes: same underlying routine, shortened presentation/plan.
- Steps: real routine step controls.
- AI Ritual Advisor: contextual AI.

## Habits
- Add Habit / Build Habit: real HabitForm.
- Garden and List: two views of the same habit records.
- Habit objects: existing completion/detail/edit controls.
- Today / Week / Month / Year / Insights: real scopes.
- AI Habit Coach: contextual AI.

## Fitness
- Start Workout: existing workout controls.
- Exercises: existing workout/exercise details where available.
- Programs / Progress / Body Stats / Mobility / Recovery / Challenges: existing Fitness tools.
- Progress Photos: real media workflow.
- AI Coach: contextual AI.

## Wellness
- Check In: real WellnessEntryForm.
- Sleep / Mood / Mind / Body / Recovery / Journal: existing wellness tools.
- Breathing / meditation / gratitude / stretch / sound bath: existing or preserved activity controls.
- AI Wellness Companion: contextual AI.

## Food & Nutrition
- Add Meal: existing Food/Nutrition capture or preserved form.
- Meal Plan / Pantry / Recipes / Nutrition / Groceries / Hydration / Favorites: real Food tools.
- Shopping List: real grocery list.
- Order Online never purchases silently; it opens the reviewable grocery/order workflow.
- AI Nutrition Coach: contextual AI.

## Beauty OS
- Start Routine: existing beauty routine controls.
- Skincare / Makeup / Body / Fragrance / Treatments / Prescriptions / Progress / Inspiration: real Beauty views.
- Inventory / Wishlist / Budget / Treatments: connected underlying data.
- Add to Routine: existing Beauty routine flow.
- AI Beauty Coach: contextual AI.

## Beauty Lab
- Inventory / Ingredients / Routines / Skin Journal / Hair Lab / Prescriptions / Compatibility / Analytics: real Lab views.
- Products: lifecycle status/detail/editor.
- Progress photos: real media flow.
- AI Beauty Assistant: contextual AI.

## Hair
- Wash Days / Treatments / Goals / Products / Scalp Care / Styles / Inspiration / History: real Hair views.
- Today's Routine / Wash Day Plan: existing Hair/routine tools.
- Product shelf and low-product alerts: real inventory where available.
- AI Hair Assistant: contextual AI.

## Finance
- Accounts / Budget / Goals / Investments / Bills & Subscriptions / Transactions / Taxes / Reports: real Finance views.
- Finance entry: real FinanceEntryForm.
- Transactions/bills/subscriptions: existing source records.
- AI recommendations: contextual finance intelligence with confirmation rules.

## Financial Brain
- Spending Intelligence / Cash Flow / Budget Planner / Goals & Savings / Investments / Net Worth / Big Purchases / Reports / AI Advisor: real financial-analysis views.
- Big Purchase Planner: recommendation/planning only unless user explicitly chooses an external action.
- AI Financial Coach: contextual AI.

## Goals
- Add Goal: real GoalForm.
- Life / Quarterly / Goal Planner / Vision Board / Milestones / Habit Goals / Achievements / Reflections: real Goal views.
- Goal objects: existing details and milestone actions.
- AI Goal Coach: contextual AI.

## Notes
- New Note: real NoteForm.
- Voice Note: Glow Voice / capture.
- Notebooks / Pinned / Shared / Trash: real Notes scopes.
- Note objects: real note editor/detail.
- Note-to-task/project/goal/event conversion uses existing destination systems.

## Settings
- My Account / Preferences / Notifications / Integrations / Security & Privacy / Data Management / About: real settings/control surfaces.
- Appearance and image customization remain working global systems.
- Integration controls route to existing Connections where applicable.

## Life World
- Each portal routes to its real room: Home, Mind/Brain, Fitness, Beauty, Finance, Travel World, Career Projects, Creative Studio.
- World Map / Memory Vault / Current Chapter / World Focus / Playlist / Journal open their real connected systems or preserved controls.
- Immersive Mode is a real view state, not a decorative label.

## Additional existing Glow OS pages

### Reminders
Apple Reminders sync, lists, due items, completion state, and related intelligence remain tied to the existing bridge and source data.

### Projects & Creative Studio
Project objects, milestones, next actions, files, decisions, deadlines, related tasks, and AI project management remain connected to existing project data.

### AI Brain
Search, recommendations, patterns, decisions, current-context questions, and action proposals use existing intelligence systems.

### Concierge
Every proposal has review/approve/edit/decline behavior with protected-action rules.

### Intelligent Observations
Active, category, snoozed, and resolved states remain real; observations expose evidence, confidence and related rooms.

### Memory
Memory objects retain source/date/category/confidence/privacy and can open related content.

### Timeline
Day/week/month/year/life scopes connect existing timeline and memory data.

### Briefings
Morning/evening/weekly/tomorrow briefings connect real calendar, task, project and observation context.

### Closet
Wardrobe, outfits, laundry, seasonal, packing, wishlist and cost-per-wear connect to real closet records where present and preserved capabilities where migration remains.

### Home
Home, cleaning, laundry, maintenance, inventory, shopping and Saint Care remain distinct connected workflows.

### Glow Inbox
Captured items can be reviewed, routed, edited, archived or converted to destination objects.

### Universal Intake
Voice/text/image/file capture must classify, preview, route and preserve source context.

### Personal Rules
Rules can be created, edited, paused and applied to planning/intelligence behavior.

### Resources
Guides/templates/checklists open real content and can be reused in other rooms.

### Connections
Every integration exposes connection state, last sync, permissions and its existing setup/management flow.

### Gmail Intelligence
Priority, follow-up, receipt, appointment and project insights use the existing Gmail read-only connection.

### Import Center
Import workflows preview mapping, validate, review errors and preserve current data before committing changes.

## Completion definition
A room passes the interaction audit only when:
- no visible button is inert;
- no visible link-like label is inert;
- navigation reaches a valid page or valid view;
- add actions open a real form;
- AI actions open a real contextual intelligence flow;
- images remain editable;
- current data/integrations are preserved;
- unfinished native remaps fall back to the preserved real capability rather than becoming fake UI;
- iPhone/iPad controls remain touch accessible;
- protected actions retain confirmation behavior.
