# Today Runtime Renderer Rule

Today must render from one authoritative live scene.

Production rules:
- Never use a reference screenshot as the runtime UI layer.
- References are visual and architectural targets only; they may not supply mutable text, timers, tasks, events, priorities, routines, navigation, or Glow labels.
- Never reveal/crop a reference screenshot to fake live elements.
- One native renderer owns all mutable Today information.
- Responsive states must reorganize that same renderer; they may not swap to a second legacy Today implementation.
- The current redesign uses an isolated optical/liquid-material Today renderer so legacy global CSS cannot move, blur, resize, or duplicate Today objects.
- Glow is the persistent intelligence. Ask Glow opens the same root Glow system; no second assistant instance is allowed inside Today.
- The new Today architecture is: top identity bar + restrained left utility rail + live NOW/living-matter/intelligence surface + operational focus strip + NEXT/LATER/TONIGHT/TOMORROW time stream + bottom day/replan/save controls.
- Real data replaces reference/demo content. Empty states remain visibly empty rather than being filled with fake events, percentages, routines, timers, or countdowns.
- Capacity must be labeled from real wellness data or state that no check-in exists.
- Undo appears only when a real reversible action exists.
- No page-wide transform scaling, no duplicate responsive DOMs, no broad backdrop blur, and no competing Today hotfix layers.
- Production visual upgrades are atomic: complete and QA a coherent renderer before switching it into production.
