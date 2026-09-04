# Glow OS Stable Feature Core — 2026-09-04

This is the runtime stability and intelligence contract for Glow OS. It describes behavior and system ownership, not decorative styling.

## Core rule

Glow OS keeps one dependable owner for each user action. Do not mount competing assistants, quick-add systems, page agents, or duplicate adaptive engines that can fight over the same state.

## Always-on core

- Five worlds: Today / Plan / Life / Brain / Create.
- Navigation to real pages.
- Search.
- Tasks.
- Calendar/events.
- Routines and habits.
- Notes and inbox/import.
- Core Life rooms backed by real data.
- Authentication and privacy boundaries.
- One persistent intelligent presence called **Glow**.
- Explicit approval before meaningful mutations.
- Truthful action receipts after approved actions.
- Undo only when a real reversible implementation exists.
- Responsive layouts reorganize the same objects rather than mounting duplicate page implementations.

## Removed from the shared runtime shell

These may exist as page-local features later, but they must not all mount globally:

- ReferenceRoomWorkspace.
- ReferenceRoomInteractions.
- Legacy GlowVoiceCommand overlay.
- Separate Quick Add overlay.
- Separate global GlowActionButton overlay.
- DataConnectionVault around every page.
- Separate dashboard AppShell branch.
- Fake/local AI assistant panels with canned replies.
- Any second intelligent-presence name or second assistant runtime.

## Deferred until the stable core passes QA

- Automatic whole-page rearrangement without a verified page implementation.
- Background proactive agents.
- Cross-system automatic writes without preview/approval.
- Achievement/celebration overlays.
- Continuous ambient audio.
- Complex gesture choreography.
- Multiple simultaneous animation systems.
- Future-self simulations that mutate live data.
- Pattern Cinema and other heavy experimental visualizations.
- Conversation-to-World Builder automation.
- Any feature that duplicates an existing core function under a second UI.

Deferred means the feature cannot destabilize the core runtime. It does not mean the concept is discarded.

# Glow — the persistent operating presence

Glow is the only product-facing intelligent presence inside Glow OS. Glow is not a separate AI destination and does not require the user to leave the page they are working in.

The minimized pearl, expanded conversation, voice interaction, contextual intelligence, proposals, actions, and receipts are all states of the **same Glow system**.

## Presence layer

### Resting
Glow remains available without taking over the page.

### Minimized
Glow compresses into a small persistent presence. It still communicates whether Glow is available, listening, working, waiting for approval, complete, or needs attention.

### Expanded
Glow unfolds into the conversation/work surface when the user taps Ask Glow, invokes the keyboard shortcut, begins a voice interaction, or calls an intelligent action.

Closing the expanded surface returns the same Glow to minimized/resting form. There is no separate assistant screen.

## Intelligence states

Glow uses a visible, deterministic operating sequence:

1. **Waking** — transitioning from passive presence into active presence.
2. **Listening** — receiving voice or contextual input. Nothing changes yet.
3. **Understanding** — interpreting intent, current room, selected object, recent conversation, and relevant data.
4. **Speaking** — answering without mutating persistent data.
5. **Creating** — preparing a draft, guide, visual concept, plan, note, schedule proposal, cards, project concept, or other new output.
6. **Awaiting approval** — a meaningful mutation is ready to review. Nothing changes yet.
7. **Acting** — performing an approved action using a verified executor.
8. **Completing** — returning the result and action receipt.
9. **Error** — the action failed or capability is unavailable. Glow must not claim success.

## Talk to Glow

Glow accepts text, voice, and page-context interaction. Example requests include:

- Pull up my grocery list.
- Fix the rest of today.
- Talk me through my hair routine.
- Show me what I need to do next.
- Make this workout into visual cards.
- Create an image concept.
- Plan this with me.
- Move things that can wait.
- Find a previous note.

Glow may act as:

- conversational assistant
- planner
- search system
- guide
- creator
- organizer
- routine conductor
- system operator

Response forms may include:

- conversation
- search result
- guided steps
- plan/proposal
- visual concept/card structure
- navigation/reveal
- verified system action
- action receipt

A response form is not the same as claiming a capability. If an executor is not implemented, Glow may prepare or queue the work but must say so clearly.

# Glow follows the user everywhere

Glow is mounted once at the root of Glow OS and persists across route changes.

Glow travels through the five worlds:

- Today
- Plan
- Life
- Brain
- Create

Glow should understand the room currently open and adapt its role without becoming the purpose of the room.

### Today context
Glow may use the current schedule, current focus, open tasks, priorities, capacity, and what comes next.

### Plan context
Glow may use dates, tasks, reminders, free time, conflicts, projects, goals, routines, habits, and deadlines when those data are available.

### Life context
Glow should use the specific Life room currently open, such as Body, Beauty, Hair, Food, Money, Home, Work, Relationships, or Travel.

### Brain context
Glow may use notes, recent note content, memories, ideas, observations, connections, and timeline context when those data are available.

### Create context
Glow may help capture, transform, draft, organize, import, and develop new work.

## Context continuity

The root Glow component keeps recent conversation in the current browser session and always sends the current pathname as room context.

Pages may dispatch:

- `glow:open` — expand Glow, optionally with a prefilled request.
- `glow:context` — attach a selected object to the conversation.
- `glow:clear-context` — clear the selected object.

Existing `glow:voice-open` and `glow:quick-add` events are compatibility aliases that route into the same Glow system.

Selected object context includes its source route so a reference from a prior room is not silently mistaken for a current-room object.

If the user says “this”, “that”, “it”, or “move this”, Glow resolves the reference in this order:

1. selected object
2. current page/room
3. recent conversation
4. active task/project context when available

If the reference is still ambiguous, Glow asks one concise clarifying question before any mutation.

# How Glow works

The canonical mutation flow is:

1. **You ask** — e.g. “Glow, fix the rest of today.”
2. **Glow listens** — receives the request; nothing changes.
3. **Glow understands** — reads the current room and relevant available data.
4. **Glow creates a proposal** — reorganizes possibilities without applying them.
5. **Glow shows the plan** — the user sees proposed changes and destinations.
6. **You approve or cancel** — cancel means nothing changes.
7. **Glow acts** — only verified executors may mutate data.
8. **Glow completes** — a truthful receipt says what completed and what was only queued.

## Approval law

Read-only conversation, search, guidance, and navigation may happen immediately.

Creating or changing persistent data requires a proposal first. The user approves or cancels. High-risk, destructive, financial, or external actions are never silently executed.

The first verified stable action set remains intentionally narrow:

- Create a task/reminder after approval.
- Create a note after approval.
- Other approved commands route into the intake/inbox review path until a dedicated safe executor exists.

Glow must never claim to have moved, deleted, sent, purchased, paid, scheduled, or changed something when no verified executor exists.

## Action receipts

After an approved action, Glow reports:

- what completed
- what was queued instead of executed
- where the result went
- whether anything still requires attention

Undo appears only when a real reversible implementation exists. Never show fake undo.

# Glow may change the interface

Glow intelligence is not limited to chat. Pages may respond to Glow by revealing relevant information, selecting an object, navigating to a working surface, showing a routine, displaying a proposal, or reorganizing a page-local view.

These interface effects must remain page-local and must not introduce a second global renderer or duplicate page tree.

# Glow stays subordinate to the work

Today is about Today. Calendar is about time. Notes is about writing. Beauty is about beauty. Money is about financial clarity.

Glow expands when needed, assists the current environment, then returns to minimized/resting presence. Glow does not turn every page into an assistant page.

# Regression test

Before adding a new global feature, ask:

1. Does another mounted system already own this action?
2. Does it add another overlay/provider/listener that can compete for the same interaction?
3. Can it be page-local instead of global?
4. Can it be deferred until the core behavior is verified?
5. Does it perform a real action or merely look like it does?
6. Does it preserve one Glow identity and one conversation context?
7. Does it require approval before a meaningful mutation?
8. Will the receipt accurately distinguish completed work from queued work?

If a feature duplicates ownership, increases global competition, loses context, or can report false success, it does not enter the stable core.
