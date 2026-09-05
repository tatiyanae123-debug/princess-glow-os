# Glow OS 3.0 Agent Rules

Before changing any UI, read `docs/glow-os-3-design-rulebook.md`.
Before changing, adding, or rebuilding any navigation, room, page, responsive composition, or route transition, read `docs/GLOW_CURRENT_GLOBAL_NAVIGATION_LOCK_2026-09-05.md`. This lock supersedes older permanent-sidebar, bottom-rail, fixed-rail, five-world-button, breadcrumb, and other conventional primary-navigation instructions.
Before changing, adding, or rebuilding any room, page, voice surface, Ask Glow/Shakti interaction, or intelligence behavior, read `docs/GLOW_GLOBAL_INTELLIGENCE_INHERITANCE_LOCK_2026-09-04.md`.
Before changing Ask Glow, Shakti conversation surfaces, uploads, media understanding, image generation, creation workflows, or any multimodal input/output behavior, read `docs/GLOW_ASK_MULTIMODAL_CREATION_LOCK_2026-09-05.md`.

These rules are mandatory for all future Glow OS work:

1. Preserve the existing Next.js App Router, TypeScript, Tailwind, Neon PostgreSQL, Drizzle ORM, Auth.js, Server Actions and Zod architecture. Do not introduce a second auth, database, ORM or styling framework.
2. Default visual foundation is white editorial luxury. Use #FFFFFF canvas, #FAFAFA secondary surfaces, #ECECEC dividers, #1C1C1E primary text, #6E6E73 secondary text, #B86F7D dusty rose accent and #F8EFF1 pale rose highlight.
3. Room colors are accents, never full-screen washes.
4. Use Playfair Display only for major editorial headings and Inter for functional UI. Critical information must never be 9px.
5. Keep visible density low. First viewport should usually show 3 to 5 meaningful elements.
6. Every room must answer within three seconds: Where am I? What matters now? What should I do next?
7. Use progressive disclosure. Primary now, secondary next, advanced on demand.
8. Use the universal Glow action layer for create/search/voice/plan/log/move requests. Do not add another global launcher.
9. Use the universal Glow Current navigation layer mounted at the app root. Every current and future page inherits the same core navigation physics, World Fold, Glow Thread, Return Anchor, continuity, and responsive meaning. Do not introduce a second primary sidebar, tab bar, bottom bar, fixed rail, five-world button row, or page-specific navigation runtime. Local room navigation may express the shared physics differently but may not replace them.
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
28. Every future page must pass the acceptance tests in `docs/GLOW_GLOBAL_INTELLIGENCE_INHERITANCE_LOCK_2026-09-04.md` and `docs/GLOW_CURRENT_GLOBAL_NAVIGATION_LOCK_2026-09-05.md` before being considered complete.
29. Glow production AI must use the maintained Vercel AI SDK and `@ai-sdk/gateway` provider abstraction for language, speech, transcription, image generation, and supported multimodal reasoning. Do not hand-call `ai-gateway.vercel.sh/v4/ai/*`, do not hard-code Gateway protocol versions, and do not make individual pages own Gateway authentication. Provider/model fallback belongs in the centralized Glow runtime so protocol upgrades cannot break page-specific behavior.
30. Ask Glow is conversation-first and multimodal. Free typing, voice, attachments, pasted media, media understanding, inline generated outputs, and creation must remain available without forcing prompt buttons or separate assistant modes. Prompt buttons are optional suggestions only.
31. Never claim unlimited processing where platform or model limits exist. Remove artificially tiny product limits, process/persist large inputs in chunks where infrastructure supports it, and truthfully disclose what has and has not been read.
32. Explicit image-generation requests must use the verified centralized image renderer when available and show the generated image inline. Never queue an image request merely because an older UI did not expose rendering.
33. Glow Current itself is persistent infrastructure. Page-specific code may contribute a Navigation Identity or contextual destinations, but it must never remount, fork, or reset the global navigation runtime.

Before finishing any UI task, verify responsive behavior on iPhone, iPad and desktop, keyboard/focus behavior, reduced-motion compatibility, that all visible actions have a functional path, that Glow Current still follows the user across every tested room, and that the global intelligence behavior remains available without requiring page-specific command syntax.
