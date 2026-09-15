# Glow OS — Steps 36–40

## 36 Preview reality check
The pre-Step-36 PR head was verified in Vercel as READY after the Step 18–35 TypeScript fixes. This establishes the buildable baseline. Full authenticated visual/session QA remains a separate gate and must not be inferred from READY alone.

## 37 Shared React templates
`GlowSharedTemplates.tsx` supplies structural adapters for T01–T15. They expose shared context/primary/intelligence/continuity zones without domain-owned navigation. Domain-specific composition should specialize these adapters rather than fork shell architecture.

## 38 Master experience registry
`master-experience-registry.ts` is the control plane for validated, immutable normal experience configuration. It rejects invalid and duplicate experience identities and supports family queries and registry validation.

## 39 Global Glow Shell runtime contract
`global-shell-contract.ts` formalizes persistent shell capabilities, context, breadcrumbs/spatial return, mode and sync state. Pages are projections inside this shell and may not recreate global navigation/Ask Glow/attention/capture/mode/overlay systems.

## 40 Canonical object adapter layer
`canonical-object-adapters.ts` converts existing domain records into canonical Glow Object projections while preserving source identity, state, history, relationships and provenance. Template compatibility is declared centrally so objects can move across reusable experiences without duplicate databases.

## Gate
After these commits, the newest Vercel review deployment must return READY before migration automation continues. READY proves compilation/deployment, not Golden visual approval or complete live-route migration.
