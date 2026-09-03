# Glow OS 3.0 Agent Rules

Before changing any UI, read `docs/glow-os-3-design-rulebook.md`. It is the authoritative design constitution and supersedes earlier dashboard/sidebar/template assumptions.

These rules are mandatory for all future Glow OS work:

1. Preserve the existing Next.js App Router, TypeScript, Tailwind, Neon PostgreSQL, Drizzle ORM, Auth.js, Server Actions and Zod architecture. Do not introduce a second auth, database, ORM or styling framework.
2. Glow OS is one continuous intelligent world made from Glow Matter. Today, Plan, Life, Brain and Create are major climates, not conventional page containers.
3. Navigation means focus, reveal, drift, transform, camera movement or material reorganization. Never regress to page curls, book flips, hard cuts, blank fades, repeated push navigation or generic screen replacement.
4. Preserve the global constants: Living Glow Aura, permanent Ask Glow, five-world orientation, consistent gestures, save/undo/search/action receipts, refined Glow Matter, ivory pearl/polished stone/champagne metal/water-reflection language, accessibility and iPhone/iPad usability.
5. Every room must be meaningfully different in spatial metaphor, light climate, depth, object shapes, information structure, motion, completion behavior, Aura role, recommendation style, time/progress representation and exploration model.
6. If two rooms could swap their content and still look/behave almost the same, at least one room is wrong. No repeated hero + rounded-card grid templates.
7. When the user supplies or approves a room reference image, that image is the authoritative visual blueprint for that room unless explicitly replaced. Match camera/crop, composition, object position/proportion, typography placement, materials, transparency, lighting, depth and Aura placement.
8. Never cover live text with opaque white patch strips that look highlighted or selected. Live data must be transparently integrated or rebuilt as native production surfaces.
9. Never globally blur a room to hide implementation problems. Preserve source clarity, render live typography/controls natively, and keep Glow's core/rays crisp inside controlled atmospheric bloom.
10. Do not generate a replacement image when the user asked only for implementation/code fixes.
11. Responsive adaptation is mandatory. Automatically support iPhone portrait, iPhone landscape where appropriate, iPad portrait, iPad landscape and desktop. Never force portrait devices to horizontally pan a fixed 4:3 stage, never rely on manual zoom, and never leave blank/beige letterbox bars as the main adaptation.
12. Use CSS/media queries, dynamic viewport units and safe-area insets. Preserve context across orientation changes. Keep touch targets usable and detail surfaces scrollable.
13. Living Glow Aura uses a calm double-heartbeat pulse when motion is enabled. Its center remains intensely white and sharp enough to feel alive rather than like a fuzzy orb. Reduced-motion mode is stable rather than pulsing.
14. Use the universal Glow action layer for create/search/voice/plan/log/move requests. Do not add a competing global assistant.
15. Every visible control must have a real destination, real form, real action, contextual Glow action, state change or safe preserved fallback. No decorative fake buttons.
16. Preserve working routes, database workflows, integrations and user data during redesigns.
17. Preserve positional, context and conversation continuity. Returning to a room should feel like returning to the same place.
18. Large user source files such as `Pasted markdown.md`, routines/workout/beauty/hair/home/finance documents and inventories are authoritative content/feature inputs where applicable. They do not override approved room visuals or force generic database layouts.
19. Beauty and health-related surfaces must apply their specific intelligence/safety rules, not aesthetic styling alone.
20. Before finishing any UI task, compare the live result against its locked reference and audit blur/sharpness, transparency, clipping, hit areas, scrolling, responsive behavior, safe areas, Glow state, all visible controls, keyboard/focus and reduced motion.

The hard acceptance test is: same physics, different climates, one continuous world. If the implementation feels like a collection of separate web pages or interchangeable dashboards, it is not Glow OS.
