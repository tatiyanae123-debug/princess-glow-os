# Glow OS — Section 1 Steps 9–14

## Scope
Beauty → Face Skincare → Skincare Atelier.

## Step 9 — Configuration engine
`src/lib/glow/experience-registry.ts` is the executable V1 registry. Ordinary descendants must be configuration/data/state, not copied page architecture. Routes should resolve an experience ID and delegate to shared templates.

## Step 10 — Live migration sweep
Current main-branch audit found the active skincare route concentrated in `src/app/beauty/skincare/page.tsx` (large monolithic implementation), its room CSS, canonical `skincare-master.ts`, and related Beauty inventory/progress routes. `src/lib/glow/skincare-migration.ts` records KEEP / REFACTOR / MERGE decisions. Do not delete approved visual work or canonical inventory data during migration.

## Step 11 — Build order
1. Foundation: shared context + Atelier tokens/primitives.
2. Discovery: T03 Library + category configuration.
3. Objects: T04 Product/Routine/Goal detail.
4. Execution: T06 Builder + T07 Guided Routine + Routine Session state machine.
5. Intelligence: T08 Today/recommendations + contextual Ask Glow.
6. Time/Learning: T09 Calendar + T11 Progress + T13 Learn.
7. Overlays: Peek/Picker/Compare/Quick Add/Help/Receipt.

No descendant-specific architecture may be introduced unless registered as an exception.

## Step 12 — Automated QA
`experience-validation.ts` is the first architecture/regression gate. CI must fail for duplicate registry IDs, invalid templates/overlays, invalid inheritance, or malformed Guided/Object experiences. Add route, interaction, accessibility, data-identity and context-retention tests as template implementations land.

## Step 13 — Golden reference QA
Only these representative experiences require full golden visual review: Atelier Home, Product Library, Product Detail, Guided Routine, Today/Recommendation, Calendar, Progress, Completion. Ordinary descendants receive spot checks plus inherited template QA. Reference checks cover hierarchy, composition, spacing, typography, materials, lighting, depth, imagery, controls and responsive transformation.

## Step 14 — Family lock
Face Skincare may be marked LOCKED only when architecture, functional, canonical-data, intelligence, responsive, accessibility, golden-visual and regression QA all pass. Lock environment tokens, template assignments, object relationships, routine session state machine, overlay behavior and responsive rules. Future changes must be made at the highest correct ancestor and pass regression before promotion.

## Regression law
Never patch multiple descendants when a Global, Beauty, Skincare or Template ancestor can own the correction. New skincare experiences must register first, reuse an existing template where possible, and declare only their unique data/configuration.
