# Glow OS 3.0 Agent Rules

Before changing any UI, read `docs/glow-os-3-design-rulebook.md`.

These rules are mandatory for all future Glow OS work:

1. Preserve the existing Next.js App Router, TypeScript, Tailwind, Neon PostgreSQL, Drizzle ORM, Auth.js, Server Actions and Zod architecture. Do not introduce a second auth, database, ORM or styling framework.
2. Default visual foundation is white editorial luxury. Use #FFFFFF canvas, #FAFAFA secondary surfaces, #ECECEC dividers, #1C1C1E primary text, #6E6E73 secondary text, #B86F7D dusty rose accent and #F8EFF1 pale rose highlight.
3. Room colors are accents, never full-screen washes.
4. Use Playfair Display only for major editorial headings and Inter for functional UI. Critical information must never be 9px.
5. Keep visible density low. First viewport should usually show 3 to 5 meaningful elements.
6. Every room must answer within three seconds: Where am I? What matters now? What should I do next?
7. Use progressive disclosure. Primary now, secondary next, advanced on demand.
8. Use the universal Glow action layer for create/search/voice/plan/log/move requests. Do not add another global launcher.
9. Use the simplified life navigation architecture. Do not expose every route permanently.
10. Every visible control must have a real destination, real form, real action, contextual Glow action, or safe preserved-tool fallback. No decorative fake buttons.
11. Every major room must support Focus Mode.
12. Preserve room context such as current view, selected object and active step where technically appropriate.
13. Use an 8px spacing grid and consistent canvas, field, button and touch-target dimensions.
14. Calm is the default state. Accent color and motion are reserved for attention states.
15. Prefer Now / Next / Later as the cross-room information hierarchy.
16. Empty states should explain the space, why it matters and one clear next action.
17. Personalization changes emphasis, not structural location.
18. Life World may be immersive and dramatic. Operational rooms should remain calm, white and legible.
19. AI should remove complexity, not add widgets.
20. Never delete working routes, database workflows, integrations or user data to achieve a redesign.

Before finishing any UI task, verify responsive behavior on iPhone, iPad and desktop, keyboard/focus behavior, reduced-motion compatibility, and that all visible actions have a functional path.
