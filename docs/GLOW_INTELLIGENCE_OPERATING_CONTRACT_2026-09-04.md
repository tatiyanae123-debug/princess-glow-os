# Glow Intelligence Operating Contract — Permanent

Date locked: 2026-09-04
Status: authoritative for every current and future Glow OS page

## Identity law

**Glow OS = the operating system.**

**Glow = the one intelligent presence the user talks to.**

There is no second assistant identity, no retired-name runtime, no competing conversation system, and no page-specific assistant that can take ownership away from Glow.

Permanent engineering rule:

> One Glow identity. One conversation context. One owner for each action.

Any future feature that introduces a second assistant identity, duplicate global conversation, competing action owner, or parallel assistant runtime is a regression and must not ship.

## One continuous presence

Glow is mounted once at the root of Glow OS and persists while the user moves through Today, Plan, Life, Brain, and Create.

The minimized pearl and expanded conversation are states of the same component and same conversation. Expanding Glow must not route the user to a different assistant or create a second conversation owner.

On Today, when the page already contains the approved Ask Glow control in the upper-right, the separate minimized pearl may remain hidden. That Ask Glow control must open the same root Glow presence. Other rooms receive the minimized persistent presence unless a future approved room design provides an equivalent entry point into that same root presence.

## Glow operating states

The canonical state model is:

1. Resting
2. Waking
3. Listening
4. Understanding
5. Speaking / Creating
6. Waiting for Approval
7. Taking Action
8. Completing
9. Error / Needs Attention

Error / Needs Attention is mandatory. Glow must never claim success after a failed action or when a required executor is unavailable.

The state registry lives in `src/lib/intelligence/glow-operating-model.ts`.

## Context continuity

Glow carries and resolves:

- current route
- current Glow world
- selected object
- selected object's original route/page
- recent conversation in the current browser session
- available open tasks
- upcoming calendar information
- active focus context when available
- recent Notes context when the route or request makes Notes/Brain context relevant

Pronouns and ambiguous references such as “this”, “that”, “it”, or “move this” resolve in this order:

1. selected object
2. current page and Glow world
3. recent conversation
4. active focus, task, project, and available room context

If the reference remains ambiguous, Glow asks one concise clarifying question before any mutation. Glow never guesses what “this” means before changing persistent data.

## Page-specific behavior

Glow remains one intelligence while adapting its role to the current room.

### Today
Suggested actions may include:
- What should I do next?
- Fix the rest of today
- Move what can wait

### Plan / Calendar
Suggested actions may include:
- Find conflicts
- Show my free time
- Plan this with me

### Brain / Notes / Memory
Suggested actions may include:
- Find a previous note
- Show related ideas
- Help me connect this

### Beauty / Hair / Fitness / Food / Wellness and similar Life rooms
Suggested actions may include:
- Guide me step by step
- What comes next?
- Make this easier today

### Create / Import / Inbox
Suggested actions may include:
- Organize this
- Turn this into tasks
- Where should this go?

Future pages inherit Glow automatically through the root presence. Page authors may add room-specific suggestions or selected-object context, but they must not mount a new assistant.

## Input law

Glow can receive:

- text
- browser voice recognition
- selected page context
- direct Ask Glow actions
- Cmd/Ctrl + K
- `glow:voice-open` compatibility calls
- `glow:quick-add` compatibility calls

Voice state must visibly enter Listening while audio is captured and Understanding after usable input is received.

## Response forms

Glow supports these canonical response forms:

- conversation
- search
- guided steps
- plan
- visual concept

Response form does not imply that an executor exists.

If the user requests a visual output such as visual cards, an image, mood board, or diagram and no verified visual renderer is connected, Glow may prepare the concept or queue it for review. It must not claim the image was rendered.

## Brain and Notes retrieval

When the user is in Notes, Brain, Memory, Timeline, Graph, Observations, or asks about previous notes, ideas, memories, thoughts, or related information, Glow retrieves recent Notes context in addition to Tasks and Calendar context.

If the language model connection is unavailable, Glow keeps a local note-match fallback so “find my old note” can still return a likely match rather than collapsing to Tasks/Calendar-only behavior.

## Approval law

The canonical mutation workflow is:

You ask → Glow understands → Glow prepares proposal → you review → Approve / Cancel → Glow acts → receipt

The review surface must make clear:

- what Glow thinks the action is
- action type
- expected destination
- that nothing changes until approval

Cancel means nothing changes.

Read-only conversation, search, guidance, and navigation can occur immediately.

Creating or changing persistent data requires approval first.

## Verified direct executors

The intentionally narrow verified direct executor set is:

- create task/reminder
- create note

Other approved operations route into the intake/review pipeline until a dedicated verified executor exists.

Examples:

- “Reschedule my entire afternoon” may be understood and proposed, but Glow must not claim calendar events moved until a verified calendar mutation executor exists.
- “Make this into visual cards” may be proposed and queued, but Glow must not claim rendered cards exist until a verified visual executor exists.

## Action receipts

After approval, Glow must distinguish:

- what actually completed
- what was only queued for review
- where completed work went
- where queued work is waiting
- whether anything needs attention

Queued work is never labeled as completed work.

The server receipt status may be:

- completed
- partially-completed
- queued

Only destinations written by verified executors are reported as completed destinations.

## Root events

Pages integrate with the one root Glow presence through:

- `glow:open`
- `glow:context`
- `glow:clear-context`
- `glow:voice-open` compatibility alias
- `glow:quick-add` compatibility alias

`glow:context` should include a stable object label and, where available, type and ID. The root presence records the source route at selection time so Glow can distinguish an object selected on a previous page from the current room.

## Future-page integration law

Every new Glow OS page must follow these rules by default:

1. It lives inside the same Glow OS root layout.
2. It does not mount another assistant, agent, chatbot, conversation provider, or global action owner.
3. It inherits the root Glow presence and the canonical world mapping from `glow-operating-model.ts`.
4. It may dispatch selected context into Glow instead of building a page-local assistant.
5. It may provide room-specific suggestions while preserving one Glow identity.
6. Persistent mutations require proposal and approval.
7. Unverified executors queue work rather than report false success.
8. Every receipt distinguishes completed vs queued work.
9. The selected object's source page remains attached to context.
10. If the page introduces a new route family, its Glow world and suggested actions should be added to the canonical operating model instead of duplicated inside the page.

## Retired-name rule

The retired assistant name must not return in:

- runtime components
- UI copy
- event names
- providers
- APIs
- route names
- product-facing documentation
- future page-local assistants

The product-facing identity is Glow.

## Regression checklist

Before shipping any page or intelligence feature, verify:

- Is there only one Glow identity?
- Is there only one current conversation context?
- Is each action owned by one system?
- Does selected context preserve its original route?
- Does Glow know the current route and Glow world?
- Are relevant Tasks, Calendar, Focus, and Notes contexts available?
- Does ambiguous-reference resolution follow the canonical order?
- Does meaningful mutation wait for approval?
- Does Cancel leave data unchanged?
- Does an unavailable executor queue work instead of pretending to complete it?
- Does the receipt explicitly distinguish completed work from queued work?
- Does the page reuse the root Glow presence rather than mount another assistant?

If any answer is no, the feature is not compliant with the Glow intelligence contract.
