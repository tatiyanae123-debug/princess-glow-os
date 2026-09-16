# Glow OS — Steps 21–25

## 21 Shared Engine Library
The shared engine contracts created in Step 21 remain the architectural runtime targets. Domain-specific pages must consume them instead of cloning them.

## 22 Canonical Object Migration
Audit projections across Today, Plan, Routines, Beauty, Closet, Fitness, Money, Travel, Career and Home. A projection references the same canonical object identity. Preserve history and provenance before retiring local copies. Uncertain identities are never auto-merged. The initial migration registry is in `canonical-object-migration.ts`; NEEDS_AUDIT means implementation evidence is not yet strong enough to safely merge data.

## 23 Automatic Experience Generation
`experience-generator.ts` converts validated Experience Definitions into thin route bindings, required states and generated QA obligations. It uses the Template → Shared Engine mapping and rejects missing engines/invalid definitions. It does not generate arbitrary one-off CSS or bypass canonical object identity.

## 24 Automated QA + Golden Regression
`qa-regression.ts` defines global structural gates and combines them with engine-specific QA. Golden visual comparison remains a separate human-approved gate for master templates and registered exceptions. Descendants inherit approved template quality unless explicitly exception-flagged. Structural tests must never claim visual equivalence.

## 25 Lock + Propagation
`lock-propagation.ts` models locks at Global, World, Room, Template and Experience levels. A change identifies affected descendants and therefore its regression target set. LOCKED ancestors require explicit change control/override rather than silent page patches. Experience-level overrides are reserved for registered true exceptions.

## Resulting factory loop
REGISTER → RESOLVE CANONICAL OBJECTS → GENERATE → RENDER THROUGH SHARED ENGINE → AUTOMATED QA → GOLDEN/EXCEPTION QA → LOCK → PROPAGATE FUTURE CHANGES AT THE CORRECT ANCESTOR.

This is now the default implementation loop for ordinary Glow experiences. New bespoke architecture is the exception, not the starting point.
