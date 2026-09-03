# Locked Reference Image QA + Responsive Rules

## Permanent · September 3, 2026

For every future image the user supplies for Glow OS, treat it as a visual QA contract for the relevant room unless the user explicitly says it is inspiration only.

Always compare the approved image against the live implementation for camera/crop, viewport, composition, object positions, proportions, typography, materials, transparency, blur/sharpness, light, depth, Aura placement, controls, hit areas, scrolling, responsive behavior, safe areas and transitions.

Never accept these regressions:

- Opaque white live-data strips that look highlighted, selected or pasted over the image.
- Global blur/fuzz used to hide mismatched text or objects.
- Low-resolution reference art enlarged without crisp native text/control layers.
- Fixed 4:3 canvases forced into portrait through horizontal scrolling.
- Manual zoom required to use the page.
- Blank or beige letterbox bars used as the main device adaptation.
- Tiny touch targets created by scaling desktop hotspot coordinates down to a phone.
- Clipped text, truncated objects, misaligned hit zones or non-scrolling detail surfaces.
- A static/fuzzy Glow center where the Living Glow Aura should be visibly alive.
- Page layouts that become interchangeable rounded-card dashboards.

Responsive behavior must be automatic:

- iPhone uses a native recomposition of the same room and information physics.
- iPad portrait and narrow split-view windows recompose rather than pan/zoom.
- iPad landscape and desktop may preserve the wider architectural room when enough space exists.
- Use dynamic viewport units and safe-area insets.
- Orientation changes keep active context.

Living Glow Aura must use a subtle double-heartbeat pulse when motion is enabled: strong first beat, settle, softer second beat, rest. The central white core and principal rays remain crisp within controlled atmospheric bloom. Reduced-motion uses a stable luminous state.

The approved reference image remains visually authoritative. Large source files such as `Pasted markdown.md` remain authoritative content/feature sources, but they never force the approved visual room into a generic list/database template.

Hard test: if the live screenshot looks highlighted, fuzzy, badly zoomed, letterboxed, clipped, dead, or materially different from the approved reference, the implementation is not finished.
