# Today Runtime Renderer Rule

Today must render from one authoritative live scene.

Production rules:
- Never use the approved reference screenshot as the runtime UI layer.
- The reference is a visual target only; it may not supply mutable text, timers, tasks, events, priorities, routines, navigation, or Shakti labels.
- Never reveal/crop the reference screenshot to fake live elements (including avatar cutouts).
- One native renderer owns all mutable information.
- Responsive states must reorganize that same renderer; they may not swap to a second legacy Today implementation.
- Shakti is native light/material, not a raster cutout and not a pulsing overlay.
- Production visual upgrades are atomic: complete and QA on a preview branch first, then merge once.
