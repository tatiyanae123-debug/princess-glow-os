# Glow OS — Global Acceleration Steps 18–21

## Step 18 — Global Family Registry
All major remaining families are mapped at once: Today, Planning, Routines, Beauty, Closet + Style, Fitness + Wellness, Money, Brain, Create, Home, Travel, Career + Life. Each declares rooms, applicable T01–T15 templates, canonical object types, shared-engine dependencies, and one of four statuses: ALREADY_SUPPORTED, NEEDS_CONFIGURATION, NEEDS_SHARED_ENGINE, TRUE_EXCEPTION.

This registry is intentionally world-aware: Today/Plan/Brain/Create remain primary worlds; several life domains are rooms/families projected through Life rather than being promoted to unrelated top-level apps.

## Step 19 — Reuse + Dependency Matrix
Shared engines are ranked by the number of families they unlock and their dependencies. Build order is dependency-first, not page-order. Object Detail is foundational, followed by Library, Timeline, Intelligence, Collection, Builder, Guided Experience, Progress, Planner, Studio, Learn, Review, object projection, and domain-specific engines.

The matrix includes a validator so a shared engine cannot be intentionally scheduled before one of its declared prerequisites.

## Step 20 — Universal Glow Experience Renderer
`experience-renderer.ts` defines the runtime boundary: route/entry point resolves an experience ID, then the renderer resolves Registry definition → World/Room context → Template → canonical object → current state → intelligence → registered exception → template props.

Routes should become thin. Ordinary experiences should not own duplicated application architecture.

## Step 21 — Shared Engine Library
`shared-engine-library.ts` defines the first executable contracts for Object Detail, Library, Guided Experience, Builder, Timeline, Planner, Intelligence, Progress, Collection, Learn, and Review.

Every engine declares accepted inputs, universal states, capabilities, and minimum QA. Domain rooms specialize environment and content, not foundational behavior.

## Permanent speed rule
Build by reuse value. Fix the highest correct ancestor. Register before creating. Prefer configuration + canonical objects + shared engines. New architecture is allowed only for a registered true exception that cannot be represented correctly by the existing master-template system.
