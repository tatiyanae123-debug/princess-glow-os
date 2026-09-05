# Glow OS — Single Navigation Authority Law

Status: permanent implementation law

## Core rule

A Glow OS environment may not mount multiple competing primary navigation systems.

For every Today environment there is exactly one primary navigation authority, mounted above room content and above full-screen overlays.

It permanently owns:

- Glow OS = Home
- Today = What Now / current-day center
- Ask Glow = anywhere

Room content may scroll, transform, reveal, or use its own internal contextual controls underneath this authority. The primary anchors must not disappear because a room header scrolls, because an overlay has a higher stacking level, or because another local Home link is detected.

## Reliability law

A visible navigation control must work on the first press.

For critical navigation, reliable arrival takes priority over preserving a decorative transition. Full route navigation is acceptable when it prevents frozen controls, stale room state, or iPad Safari failures.

## Scroll law

The navigation authority is attached to the viewport, not to a room's internal scrolling container. Focus, People, Places, Resources, Journey, and future Today rooms scroll beneath it.

## Layering law

The primary navigation authority must remain above all Today overlays and room surfaces. Individual rooms must never cover or replace it.

## Duplication law

Do not simultaneously mount:

- a global Home fallback,
- a local Today chrome,
- a room-specific primary header,
- and a contextual navigation safety layer

as competing primary navigation on the same Today route.

When a route has a dedicated navigation authority, lower-level fallbacks stay out of that route.

## Future-page requirement

Every future Glow OS page must declare one navigation owner. If the page belongs to an existing environment with an authority, it inherits that authority rather than inventing another one.

The usability test is:

> Can the user always see how to reach Home, Today, and Ask Glow without scrolling back to the top or learning the page architecture?

If not, the page is not navigation-complete.
