# Glow OS Global Intelligence Inheritance Lock

**Status:** AUTHORITATIVE / PERMANENT
**Date:** 2026-09-04
**Scope:** Every existing and future Glow OS world, room, page, subpage, surface, object view, responsive composition, and device layout.

## Core law

The user never adapts their language to the interface. The interface adapts to the user.

Every Glow OS surface must inherit the same persistent intelligence layer. No page may introduce a smaller, more literal, keyword-only, command-only, or separately configured assistant behavior.

This intelligence is the same continuous presence across Today, Plan, Life, Brain, Create, and every future room inside those worlds. Product-facing identity follows the current Shakti naming lock. Existing internal `glow/*` route and implementation names may remain where needed for compatibility, but they must not create a second intelligence.

## 1. Natural language is universal

On every page the user may:

- speak naturally
- ramble
- use fragments
- pause or self-correct
- change direction mid-sentence
- use shorthand
- imply intent instead of naming a command
- use pronouns such as this, that, it, them, later, there, or the thing we discussed
- combine multiple requests in one thought
- ask emotionally or imprecisely worded questions
- use voice or text interchangeably

No future surface may require phrases such as `create task`, `add reminder`, `save note`, `open calendar`, or other command syntax when the user’s meaning can be inferred safely from context.

## 2. Meaning before routing

The required order is:

1. receive the whole utterance
2. infer the user’s underlying goal
3. resolve relevant context
4. separate distinct intentions when needed
5. distinguish read-only help from persistent actions
6. determine risk
7. ask one concise clarification only if consequential ambiguity remains
8. answer immediately when read-only intent is sufficiently clear
9. preview/propose persistent changes
10. execute only after required approval
11. return a truthful action receipt

A page must never route the request by keyword first and ask the semantic model second.

## 3. Context resolution is shared across every room

Ambiguous references resolve in this order:

1. selected object
2. current room/page and current Glow world
3. recent conversation
4. active focus, tasks, projects, calendar, and available room context
5. relevant saved context that the intelligence layer can legitimately access

The user should be able to select an object and say `move that later`, `make this easier`, `what should happen next?`, or `save this` without restating the object’s name.

If a consequential mutation still has more than one plausible target, ask one short clarifying question. Do not force clarification for harmless read-only help when a reasonable interpretation is available.

## 4. Thought is not automatically action

Glow OS must distinguish between:

- thought
- feeling
- preference
- hypothetical
- curiosity
- intention
- commitment
- reminder need
- persistent action request

Examples:

`I’m thinking about learning French.` is not automatically a goal or task.

`I need to sign up for a French class this week.` may be interpreted as actionable intent.

`There’s no way all of this fits today, can you help?` is planning/guidance first, not an automatic schedule mutation.

This distinction is mandatory on every future page.

## 5. Mixed and rambling input must be decomposed intelligently

A single utterance may contain multiple needs. The intelligence layer should identify the meaningful parts without mechanically splitting on every `and`, `then`, or pause.

Example:

`I need groceries, I have to email her, my hair appointment is Friday, and I need time for my project.`

The system should understand the different commitments, time context, domains, and possible actions while preserving the relationship between them.

Do not create unnecessary tasks from descriptive context.

## 6. Model-first semantics, deterministic safety floor

Semantic interpretation is model-first.

Heuristics, regex, and deterministic rules may exist only as:

- safety floors
- high-risk escalation
- fallback behavior
- validation
- known executor routing

They must not become the primary meaning engine.

A semantic model may make the system more flexible, but it may never downgrade destructive or consequential language below the deterministic safety floor.

## 7. Persistent changes keep truth and approval

Read-only conversation, search, explanation, planning discussion, guidance, and navigation can happen immediately when safe.

Persistent data creation or mutation follows the global truth chain:

**understood → proposed → approved → executed → receipt**

Never claim that a mutation happened unless a verified executor actually completed it.

Unsupported actions may still be understood correctly and proposed or queued, but must never be falsely reported as completed.

## 8. Voice and text share one intelligence

Voice must not be a separate, weaker command system.

Required voice flow:

**listen → transcribe → semantic interpretation → contextual reasoning → response/action proposal → natural spoken reply**

Voice transcription, semantic understanding, and spoken replies must be provided by centralized production services rather than configured separately page by page.

A future page must never display `voice is not configured on this page` merely because the page did not define its own voice setup.

## 9. Voice reliability is global

The production intelligence layer should prefer the configured premium speech path and gracefully try compatible fallbacks where supported.

Voice failure must not erase the text response or destroy the conversation state.

The visual room and the intelligence state remain usable if speech playback is unavailable.

## 10. Every page contributes context, not a new brain

Future pages may provide the intelligence layer with:

- current route
- current Glow world
- room role
- selected object
- active item
- local entities
- visible timing context
- available verified actions
- relevant domain records

They must not implement their own independent chatbot, intent parser, voice assistant, memory owner, or competing conversation history.

There is one persistent intelligence and one continuous conversation across the world.

## 11. New pages inherit this automatically

New rooms must connect to the centralized persistent intelligence runtime rather than duplicating it.

The default implementation rule is:

- reuse the shared persistent presence/component
- reuse the central command/semantic route
- reuse the same voice/transcription service
- pass page context into the shared intelligence
- register only genuinely new verified executors when needed
- do not fork behavior per page

A future page is incomplete if the user must learn a different way to talk to the intelligence there.

## 12. Page-specific intelligence may change role, not comprehension quality

The intelligence can adapt its emphasis by room:

- Today: present-moment guide
- Plan: time architect
- Life: domain-aware life guide
- Brain: memory and connection guide
- Create: transformation and organization partner

But comprehension quality, continuity, context resolution, voice capability, approval truth, and natural-language freedom remain invariant.

## 13. Required acceptance tests for every new page

Before a new page/room is considered implemented, test at minimum:

1. `What should I do next?`
2. `Make this easier.` with a selected object
3. `Do that later.` with a resolvable recent reference
4. `Do that later.` with an intentionally ambiguous reference and verify one concise clarification
5. `I need to call her tomorrow.`
6. `I’m thinking about learning French.` and verify it is not silently converted into a task
7. a multi-intent ramble containing at least three different commitments
8. a self-correction such as `Tomorrow... actually Sunday.`
9. voice input of a natural sentence with no command keywords
10. text and voice producing the same semantic interpretation
11. a destructive request proving the safety floor still escalates risk
12. a persistent write proving approval happens before execution
13. a verified action proving a truthful receipt appears only after execution
14. iPhone, iPad, and desktop continuity
15. moving between rooms while preserving conversation and selected-context continuity where appropriate

## 14. Prohibited regressions

Never reintroduce:

- keyword-first command parsing as the main brain
- page-specific assistant personalities
- page-specific voice configuration requirements
- separate conversation histories for each room
- exact-command syntax requirements
- forcing the user to name UI controls
- turning every thought into a task
- guessing ambiguous consequential mutations
- claiming actions happened when they did not
- losing intelligence context when moving through the continuous Glow world
- a weaker intelligence experience on newly added pages

## Final invariant

**The user talks like themselves. Glow OS does the work of understanding them.**

This is a permanent system law for all current and future Glow OS surfaces.