# Today · The Living Center — Batch 1

This batch implements the nine Today reference surfaces as **room states inside one continuous Today world**, not as nine page replacements.

## Included room states

1. Morning Brief
2. What now?
3. Focus Session
4. Design Review
5. Next Up
6. Later
7. Tonight
8. Tomorrow Preview
9. Replan My Day

## Continuous-world behavior

- The `/today` route stays mounted while the active room changes.
- Room movement updates `?room=` with `history.pushState` for deep-linkability without Next.js page replacement.
- Context is preserved in shared component state: checked actions, focus timer state, energy state, Shakti panel state, receipts, and replan preview state.
- Movement uses a restrained leave/arrive material transformation. Reduced-motion removes the transform.
- The footer orientation line represents position in the Today climate rather than tabs or a card deck.
- Shakti is persistent and can move the user to What Now, Replan, or Tomorrow while keeping the current day context.

## Glow Matter behavior implemented

- Shared refractive matter objects with visible edge light, internal volume, chromatic highlights, and soft contact shadows.
- Different climates alter environmental light rather than replacing the world shell.
- Completing/checking work updates the shared receipt.
- Replanning visibly reorganizes time blocks.
- Focus expands one task into a protected working environment with a live timer.

## Functional interactions

- Start/pause focus timer.
- Check/uncheck tasks, preparation, routines, and evening actions.
- Change current energy state from What Now.
- Open meeting, focus, day, evening, tomorrow, and replan states through object-linked actions.
- Apply/reset Replan suggestions.
- Persistent Shakti quick panel.
- Browser back/forward follows room history.

## Persistence and data wiring

This batch intentionally does not introduce a second task/calendar data model. The UI is stateful at the interaction layer and is structured so the existing canonical task, routine, calendar, and Google integration records can be bound into the room props next. No database migration is required for this visual/interaction batch.

## Acceptance criteria

- [ ] All nine states are reachable from `/today` without a full-page navigation transition.
- [ ] The world shell and Shakti remain present while moving between states.
- [ ] Each reference state has a different spatial composition and purpose-specific controls.
- [ ] Focus timer runs and pauses.
- [ ] Check rows update immediately and produce a visible action receipt.
- [ ] Replan changes produce a visible reorganization before returning to Today.
- [ ] Browser history restores the correct room state.
- [ ] iPad/desktop retains surrounding-world depth.
- [ ] iPhone compresses the rail to a bottom spatial control.
- [ ] Reduced-motion removes camera-like movement without removing orientation/context.
- [ ] Existing Phase 2 Google integration branch remains the base and is not merged automatically.

## QA path

Use `/today` and move through:

Morning Brief → What now? → Focus Session → Design Review → Next Up → Later → Tonight → Tomorrow Preview → Replan My Day.

Verify that every transition preserves the Today shell, the Shakti presence, the visible receipt, and browser history.

## Rollback

The batch is isolated to the new Today Living Center component, its CSS module, the updated `/today` route, and this document. Reverting those changes restores the prior Today implementation without a schema rollback.
