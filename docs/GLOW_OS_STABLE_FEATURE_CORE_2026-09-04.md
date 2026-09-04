# Glow OS Stable Feature Core — 2026-09-04

This file is the runtime stability contract. It is about features and behavior, not visual styling.

## Core rule

Glow OS keeps the page/domain structure, but the runtime must stay simple enough to be dependable.

One user action should have one owner. Do not mount multiple assistants, quick-add overlays, reference-workspace interaction layers, or competing adaptive systems on the same page.

## Always-on core

- Five worlds: Today / Plan / Life / Brain / Create.
- Navigation to real pages.
- Search.
- Tasks.
- Calendar/events.
- Routines and habits.
- Notes and inbox/import.
- Core Life rooms already backed by real data.
- Authentication and privacy boundaries.
- One persistent Glow intelligence.
- Explicit approval before meaningful mutations.
- Action receipts after approved actions.
- Undo only when a real reversible implementation exists; never fake undo.
- Responsive layouts may reorganize the same objects, not mount duplicate page implementations.

## Removed from the shared runtime shell

These can exist as isolated page features later, but must not all mount globally:

- ReferenceRoomWorkspace.
- ReferenceRoomInteractions.
- Legacy GlowVoiceCommand overlay.
- QuickAdd global overlay (creation routes through Glow or the destination page).
- GlowActionButton global overlay.
- DataConnectionVault wrapper around every page.
- Separate dashboard AppShell branch.
- Fake/local AI assistant panels with canned replies.

## Deferred until the stable core passes QA

- Automatic whole-page rearrangement.
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

Deferred does not mean deleted. It means the feature cannot be allowed to destabilize the core runtime.

# Glow

Glow is the product-facing intelligent presence inside Glow OS. Do not introduce a second assistant name.

Glow is not a separate AI destination. The minimized presence and expanded conversation are the same system.

## Presence states

- Resting: available and minimized.
- Waking: opening after a tap/call.
- Listening: receiving voice input.
- Understanding: interpreting the request and current room.
- Speaking: answering without changing data.
- Creating: preparing new content or a proposed output.
- Awaiting approval: a meaningful data/system mutation is ready for review.
- Acting: performing an approved mutation.
- Completing: returns a visible receipt.
- Error: no mutation is claimed; the user sees what failed.

## Context continuity

The root Glow component persists across route changes. It keeps recent conversation in the current browser session and always sends the current pathname as room context. Pages may additionally dispatch `glow:context` with a selected object.

The canonical open event is `glow:open`. Existing `glow:voice-open` and `glow:quick-add` events are compatibility aliases that route into the same Glow system.

## Approval law

Read-only conversation and navigation may happen immediately.

Creating or changing persistent data requires a proposal first. The user approves or cancels. High-risk/destructive/external actions are never silently executed.

The first stable action set is intentionally narrow:

- Create a task/reminder after approval.
- Create a note after approval.
- Other approved commands are routed into the intake/inbox review path until a dedicated safe executor exists.

This is intentional. Glow must never claim to have moved, deleted, sent, purchased, paid, or changed something when no verified executor exists.

## Action receipts

After an approved action, Glow reports exactly what completed and what was only queued for review. The receipt includes the destination(s). No fake success states.

## Page behavior

Glow remains subordinate to the current room. Today remains about Today; Calendar remains about time; Notes remains about writing; Money remains about financial clarity. Glow expands only when needed and returns to minimized presence when the interaction is over.

# Regression test

Before adding a new global feature, ask:

1. Does another mounted system already do this?
2. Does it add another overlay/provider/listener that can compete for the same interaction?
3. Can it be page-local instead of global?
4. Can it be deferred until after the core behavior is verified?
5. Does it perform a real action, or merely look like it does?

If a feature duplicates ownership, increases global listeners/overlays, or can report false success, it does not enter the stable core.
