# Glow OS Canonical Master Audit — 2026-09-17

## Status

This audit compares the current Glow OS implementation against the canonical master architecture supplied on 2026-09-17.

The current application has a strong shared foundation, but the full canonical specification is **not yet implemented page-for-page**. The app contains mature infrastructure for the continuous-world model, shared Glow shell, Today/Plan/Beauty experiences, canonical data, responsive hardening, offline state, visual convergence, and deep-room identity. However, a number of canonical rooms are still represented by older generic pages, incomplete route families, or legacy navigation assumptions.

This file is the implementation audit, not a replacement for the master specification.

## Canonical architecture lock

The authoritative structural laws are:

- Exactly five primary Worlds: Today, Plan, Life, Brain, Create.
- Glow Home / World Fold is the origin and spatial World selector, not a sixth World.
- Beauty is a room/domain inside Life.
- Search, Ask Glow, Concierge, Attention Center, Notifications, Settings, Glow Current, Glow Thread, Return Anchor, Action Receipts, permissions, editing, synchronization, and object-detail infrastructure are global utilities, not Worlds.
- One Global Glow Shell owns global navigation and continuity.
- Rooms may have their own climate and local controls but may not create a competing app shell, permanent world bar, sidebar, or detached bottom-tab model.
- Dynamic records use reusable canonical object-detail families rather than one hard-coded route per record.
- Every meaningful object supports relationships, source/provenance when applicable, history, correction, and synchronization state.
- iPhone and iPad recompose instead of shrinking desktop layouts.
- Visual direction remains Living Pearl Modernism: warm ivory pearl, refractive blush/peach/lavender/aqua/champagne light, editorial typography, translucent Glow Matter, restrained depth, and no neon/cyberpunk/Y2K/mascot regression.

## Confirmed foundations already present

### Global shell and continuity

Present in the current codebase:

- Glow Current
- World Fold runtime
- Return Anchor behavior
- session-based world state restoration
- Glow Thread/history behavior
- spatial route transition layer
- Glow Presence
- Deep Room Atmosphere
- Network State Bridge
- keyboard-aware navigation shell
- protected/open/structured room enclosure model
- shared app shell page-contract metadata

### Continuous-world visual system

Present in shared CSS and room infrastructure:

- continuous-world atmosphere
- room climate variables
- visual-convergence layer
- domain-native room layer
- deep-room material identities
- responsive/device-state hardening
- safe-area support
- loading/error/offline foundations
- spatial-navigation contracts

### Canonical intelligence/data concepts

Present to varying degrees:

- shared data sources rather than page-local fake copies
- canonical task/event/routine/product concepts
- provenance/import review infrastructure
- intelligence registry and observations
- source migration concepts
- Search across canonical types
- Ask Glow
- Concierge
- action-oriented architecture

### Strongest implemented experience families

The most developed areas currently include:

- Today living experience
- Plan / Calendar / Tasks / Routines / Habits / Goals foundations
- Beauty Personal Atelier
- Skincare
- Gua Sha
- Hair
- Makeup foundations
- Beauty inventory/maintenance/progress/devices
- Fitness foundations
- Closet foundations
- Money foundations
- Brain/Memory/Timeline/Connections foundations
- Create/Import foundations

## Canonical corrections made in this branch

### Five-World normalization

Runtime world state now normalizes to only:

`Today · Plan · Life · Brain · Create`

Beauty routes now resolve to the Life World at runtime.

A deprecated `beauty` type token remains temporarily for compile compatibility with old components, but it is not emitted by the runtime and it is not present in the canonical World Fold target list.

### World Fold correction

The visible World Fold now exposes:

- Home
- Today
- Plan
- Life
- Brain
- Create

Beauty is no longer presented as a sixth World.

### Beauty hierarchy correction

The page manifest now models:

`Life → Beauty → Beauty studios / experiences`

rather than treating Beauty as a World.

### Global utility scope

The page manifest now marks these as global surfaces rather than Worlds:

- Search
- Ask Glow
- Concierge
- Attention Center
- Notifications
- Settings

### Architecture regression tests

Navigation tests now enforce:

- exactly five canonical World targets
- Beauty belongs to Life
- Beauty ancestry includes Life
- global utilities are globally scoped
- synchronization contract remains intact

## Confirmed gaps against the 2026-09-17 master specification

### 1. Full 266-page/page-family coverage is not yet present

The current route and page manifests do not yet contain a one-to-one implementation for every canonical named room, studio, experience, detail family, and global settings subpage in the master blueprint.

Some named pages are represented today by:

- query-state views
- generic SectionPage surfaces
- older route names
- shared canonical detail families
- a parent page without the specified deep child experience
- a data capability without the final room design

This is acceptable for reusable object records, but not for canonical named experiences that are supposed to have their own behavior and visual habitat.

### 2. Beauty still contains a legacy local shell

The Beauty Personal Atelier page currently renders its own local top-level World navigation and rail using the World target list.

That violates the canonical rule that the Global Glow Shell owns World navigation.

Required repair:

- remove or demote the local World navigation
- retain only Beauty-local room/studio navigation
- let Glow Current / World Fold remain the sole global navigation runtime

### 3. Legacy dashboard/sidebar CSS remains globally imported

The root layout still imports older dashboard/sidebar styling files alongside the newer convergence and spatial layers.

Even if newer CSS visually overrides much of it, this creates regression risk and contradicts the canonical no-dashboard/no-permanent-sidebar architecture.

Required repair:

- identify selectors still in use
- migrate any required visual tokens/components into canonical shell styles
- remove global dashboard/sidebar imports after regression verification

### 4. Several Life rooms still use generic page composition

Food, Work, Finance/Money, Notes, Settings, and several other routes still contain conventional `SectionPage`, white-card, rounded-panel, or form-first layouts.

These are functional foundations, not final canonical room climates.

Required repair:

- keep their data/actions
- replace generic card-grid composition with domain-native habitats
- preserve each room’s unique visual climate while sharing Glow Matter and shell behavior

### 5. Canonical Life coverage is incomplete

Needs dedicated completion or route-family verification for:

- Body blueprint and Measurements
- Regulation Studio
- Sleep
- full Wellness Appointments experience
- complete Beauty Nails/Brows + Lashes/Oral Care experiences
- Beauty Experiments and Safety Gate behavior
- Closet laundry/repairs/storage/audit depth
- Food meal-plan/recipe/grocery/pantry/meal-prep depth
- Home rooms/cleaning/maintenance/inventory depth
- Money recurring bills/debt/savings/purchase decision/calendar/learning depth
- Career Job Search/Job Detail/Interviews/Skills/Portfolio depth
- Travel itinerary/packing/bookings/budget depth
- Relationship Person Detail
- Saint Daily Care/Supplies/Appointments/Grooming depth

### 6. Brain depth is incomplete

Needs dedicated completion or route-family verification for:

- Thoughts
- Ideas / Idea Detail
- Insights / Insight Detail as distinct canonical experiences
- Decision Archive / Decision Detail
- canonical Brain Graph experience
- Imported Knowledge
- Source Migration Review
- Import Review

### 7. Create depth is incomplete

Needs dedicated completion or route-family verification for:

- Capture
- Inbox as Create-owned intake
- Creative Studio
- Creative Projects / Creative Project Detail
- Media Library
- Templates

### 8. Global utilities are not yet complete to master depth

Needs completion/verification for:

- Search Results grouping and actions
- Ask Glow Quick Ask / Full Thread / Reference Lock / Attachments / History as canonical page families
- Concierge Request Detail
- Attention Item Detail
- Notifications final state
- all Settings subpages
- Universal Object Detail specialization coverage
- Create + Edit Overlay consistency
- Action Receipt consistency
- Permission Prompt consistency
- Offline + Sync conflict-review state

### 9. Pixel-level visual fidelity still requires live visual verification

The repository contains the intended visual contracts and convergence layers, but source inspection alone cannot certify every page against the exact 1440×1024 reference geometry, iPad landscape/portrait recomposition, and iPhone vertical composition.

Final approval requires authenticated visual smoke-testing at those device sizes after the architecture migration builds cleanly.

## Implementation order from here

1. Keep the five-World/Beauty-in-Life correction locked.
2. Remove competing local World navigation, beginning with Beauty.
3. Complete the canonical page manifest so every named master experience has an implementation owner.
4. Convert remaining generic Life pages into domain-native rooms without replacing their existing data/action logic.
5. Complete Brain and Create deep families.
6. Complete global utility subpages and universal object/edit/receipt states.
7. Retire legacy dashboard/sidebar CSS only after dependency verification.
8. Run route/state/persistence regression tests.
9. Run authenticated desktop, iPad landscape, iPad portrait, and iPhone visual QA.
10. Merge only after the canonical architecture branch is green and visual regressions are cleared.

## Release rule

Do not describe the complete 2026-09-17 canonical master specification as fully implemented until every named canonical experience is either:

1. a verified dedicated experience, or
2. intentionally implemented through a documented reusable page family whose behavior and visual contract fully satisfy the master specification.

A route existing is not sufficient. A data table existing is not sufficient. A design document existing is not sufficient. The final implementation must satisfy location, content, behavior, visual habitat, responsive composition, state behavior, persistence, and navigation continuity together.
