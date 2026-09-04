# Glow OS 3.0 Agent Rules

Before changing any UI, read `docs/glow-os-3-design-rulebook.md`.
Before changing, adding, or rebuilding any room, page, voice surface, Ask Glow/Shakti interaction, or intelligence behavior, read `docs/GLOW_GLOBAL_INTELLIGENCE_INHERITANCE_LOCK_2026-09-04.md`.

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
21. Every current and future room must inherit the one centralized persistent intelligence runtime. Never build a smaller page-specific chatbot, command parser, memory owner, or voice assistant.
22. Natural language is universal. The user may ramble, use fragments, self-correct, imply intent, use pronouns, combine requests, or speak without command keywords. Meaning must be interpreted before routing.
23. New pages contribute context to the shared intelligence, including current room, selected object, active item, local entities and verified actions. They do not create a new brain.
24. Voice and text must use the same semantic interpretation layer and conversation continuity. Voice must never require page-by-page configuration.
25. Semantic interpretation is model-first. Deterministic rules remain a safety floor, fallback and validation layer, not the primary meaning engine.
26. Thoughts, feelings, preferences and hypotheticals must not silently become tasks. Persistent action requires actual intent, a proposal where required, approval, verified execution and a truthful receipt.
27. Ambiguous consequential references resolve from selected object, current room, recent conversation and active context. Ask one concise clarification only when safe resolution is genuinely impossible.
28. Every future page must pass the acceptance tests in `docs/GLOW_GLOBAL_INTELLIGENCE_INHERITANCE_LOCK_2026-09-04.md` before being considered complete.

Before finishing any UI task, verify responsive behavior on iPhone, iPad and desktop, keyboard/focus behavior, reduced-motion compatibility, that all visible actions have a functional path, and that the global intelligence behavior remains available without requiring page-specific command syntax.