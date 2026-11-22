# Batch C · Wave 7 · Visual Convergence

Status: implementation handoff from Batch B
Date: 2026-09-16

Wave 7 converges the entire app through shared operating-system visual rules. It does not redesign individual worlds again.

## Locked visual foundation
- white editorial-luxury operational canvas
- warm ivory/champagne material moments only where a room calls for them
- Inter for functional UI, Playfair Display for major editorial headings
- readable critical text; no critical 7–9px UI
- 8px spacing rhythm
- low visible density with progressive disclosure
- room colors are accents, never full-screen washes
- one shared surface, field, button, focus, empty-state, motion and responsive language
- shared Glow shell remains the owner of navigation geometry
- world/room art direction extends the global language instead of replacing it

## Implementation strategy
Wave 7 is delivered as a final shared convergence stylesheet loaded after legacy/reference room CSS so existing working routes keep their behavior while visual drift is normalized centrally. SectionPage typography is also raised to the locked readable hierarchy.

## Lock gate
Wave 7 can be marked LOCKED only when the convergence layer builds successfully and a preview confirms representative pages from Today, Plan, Life, Beauty, Brain and Create still preserve their identities without reverting to independent app-like visual systems.
