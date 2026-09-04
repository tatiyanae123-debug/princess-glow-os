# Today stability fix — 2026-09-04

Root cause confirmed from the live screenshot: the runtime still rendered the approved reference screenshot underneath native live UI and also re-used the same screenshot for an avatar reveal. This creates ghost text, stale labels, raster softness, clipping artifacts, and duplicate visual layers whenever the viewport changes.

Fix strategy:
1. Stop rendering the reference screenshot visually in Today.
2. Hide the avatar/reference reveal entirely.
3. Build the Today environment natively in CSS so there is only one renderer.
4. Keep all mutable information native and crisp.
5. Preserve a three-zone landscape composition and a separate portrait flow using the same DOM.
6. Glow remains the single native intelligent presence; no retired assistant naming or duplicate intelligence layer may return.
