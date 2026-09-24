# Glow OS Dashboard · Data Fidelity + Interaction Continuity Contract
Locked: 2026-09-22

## Purpose
The approved dashboard reference image governs visual composition, hierarchy, spacing, materials, glass treatment, card language, depth, and information density only. It is never a source of personal facts or production state.

## Source-of-truth law
Source → Glow Object → Glow Graph → Current State → Intelligence → Dashboard Projection → Interaction → Persisted Result.

Never:
- Screenshot → hardcoded JSX
- Mock/demo arrays → production dashboard
- Placeholder values → production fallback
- Local UI state → substitute for canonical life state

## Real-data law
Every task, event, routine, goal, count, recommendation, progress value, contact, notification, weather value, schedule item, or other personal fact must come from a real authorized source or an explicitly labeled empty/unavailable state.

If data is missing, show a truthful empty/loading/error/offline state. Never invent content to make the layout look full.

## Canonical identity law
Every meaningful rendered object preserves:
- canonical object id
- type
- source/provenance
- current state
- allowed actions
- updated timestamp
- destination or mutation target

Editing a title, time, date, priority, or status does not create a second copy of the object.

## Interaction continuity law
Every click, tap, swipe, slide, drag, expand, complete, edit, save, cancel, delete, reorder, filter, and tab change must:
1. act on the intended canonical object;
2. persist real mutations before claiming permanent success;
3. update only affected projections where possible;
4. preserve unrelated page state;
5. preserve relevant scroll, filter, date, tab, expanded-section, and parent context;
6. prevent stale responses or race conditions from overwriting newer user intent;
7. keep URL, selected object, visible content, and active navigation synchronized;
8. keep slide identity and slide content driven by the same authoritative selected state;
9. maintain consistent state across Home and deeper worlds;
10. remain correct after refresh and eventually across devices.

## Navigation law
Clickable UI must have a real destination or real action. No href="#", no empty handlers, no decorative fake controls.

When a user opens a task/event/routine from Home, Glow must retain the object's identity and return context. Back navigation should restore the logical parent state instead of resetting the user to the top.

## Mutation law
User Action → Immediate UI Response → Canonical Update → Recalculate affected projections → Reconcile UI → Continue from same context.

Do not:
- reset the whole page after a minor update;
- duplicate objects;
- leave stale summaries;
- visually move a card without persisting the underlying state;
- show Saved before the save actually succeeds.

## Gesture + slide law
Visible slide labels and slide content must derive from the same selected value. A swipe that completes commits the new selected item; a cancelled swipe returns cleanly to the previous one. Rapid gestures must not allow older requests to overwrite the newest selection.

## Responsive continuity law
Desktop, iPad, and iPhone are different projections of the same canonical state. Responsive layout changes presentation, not data, active object, selected day, unfinished edit, or navigation context.

## Simulation law
Current fact, goal, recommendation, prediction, and hypothetical scenario must remain distinct. Proposed/simulated changes do not mutate reality until explicitly confirmed.

## QA golden path
For every interactive surface test:
click → correct object → correct destination → correct information → edit/action → persist → reconcile → back/close → original context preserved → updated information visible → refresh → change still correct.

## Golden engineering test
If every word and number were removed from the reference image, the application must still know:
- what belongs in each region;
- where it comes from;
- whose data it is;
- which canonical object it represents;
- its current state;
- what clicking it means;
- which actions are allowed;
- how the result persists;
- where the user should return afterward.

## Final law
DESIGN FROM THE IMAGE. NEVER RUN FROM THE IMAGE.

The screenshot provides the visual language.
Glow Objects provide truth.
Glow Graph provides relationships.
Current State provides context.
The Intelligence Kernel chooses the projection.
The Action Layer executes changes.
Continuity State preserves the user's place.
