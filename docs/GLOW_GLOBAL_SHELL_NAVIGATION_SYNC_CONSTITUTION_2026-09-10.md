# Glow OS Global Shell + Navigation + Synchronization Constitution

**Date locked:** 2026-09-10  
**Status:** Governing system-wide architectural law  
**Applies to:** every current and future world, room, studio, experience, object view, detail surface, overlay, route, redesign, migration, integration, experiment, and responsive layout.

## Prime law

No Glow page may independently decide how Glow navigation, identity, state, intelligence, responsive behavior, object synchronization, history, permissions, or return behavior works. A page may design its experience. The operating system owns everything else.

Glow OS is one living digital model of the user's life. A page is a projection into that model, never an isolated app, dashboard, or duplicate source of truth.

## One global shell

The app root owns the permanent Glow shell. Every page inherits it. Pages may not remount, fork, imitate, or replace it.

The shell owns:
- Glow identity and world/room/experience/object location.
- Glow Current, World Fold, Glow Thread, Return Anchor, contextual rail, universal action host, Ask Glow/Shakti access, attention state, and global utilities.
- Back/reverse-current behavior, parent return, world travel, cross-world portals, state restoration, responsive geometry, safe areas, overlays, sheets, focus mode, and route transitions.
- Global accessibility, keyboard/focus, reduced-motion, touch-target, and device behavior.

## Canonical spatial hierarchy

All navigable experiences declare their place in:

`Glow -> World -> Room -> Studio/Collection -> Experience -> Object -> Detail/Session -> Temporary Overlay`

Every page must have a canonical manifest containing identity, world, level, parent, family, design family, layout family, objects, specialists, synchronization dimensions, and return-context behavior.

Unregistered pages are architectural regressions. Legacy descendants may temporarily inherit the nearest registered ancestor while being migrated, but new work is never complete while unregistered.

## Location context

Every active page must contribute a shared Location Context containing:
- current pathname/route and manifest identity;
- world, room, studio/experience family, page level, and ancestry;
- selected Glow Object where applicable;
- active step/session/view where applicable;
- entry/return context;
- current local state needed to restore the experience.

Location Context is shared with Glow Current and the Glow Intelligence Kernel. It is not owned by the page.

## Navigation memory

Navigation must preserve continuity instead of resetting the user to generic roots.

The system must preserve, where technically relevant:
- where the user came from;
- current view and selected object;
- scroll position;
- active tab/filter;
- active routine/session step;
- unfinished action;
- temporary local state;
- world state anchors;
- reverse-current history.

Opening Ask Glow, a tool, another object, or another world must not erase the user's meaningful return position.

## Parent-child inheritance

Inheritance order is mandatory:

`Global Glow rules -> World rules -> Room rules -> Studio rules -> Experience-specific expression`

A child inherits all operating-system behavior from its ancestors. Local art direction may vary. Local infrastructure may not.

## Consistency is not sameness

All experiences share Glow DNA:
- navigation physics;
- location and return semantics;
- spacing/token foundations;
- typography hierarchy;
- motion/transition language;
- Ask Glow behavior;
- object/state behavior;
- synchronization;
- responsive/accessibility rules;
- loading/error/empty-state semantics;
- history, permissions, provenance, receipts, and undo semantics.

Experiences may differ in composition, imagery, editorial direction, information density, atmosphere, specialized controls, specialist intelligence, and purpose.

Calendar may feel temporal. Closet may feel like a dressing room. Gua Sha may feel like a studio. Goals may feel like a future landscape. Brain may feel like a knowledge environment. They remain one operating system.

## Eight mandatory synchronization dimensions

Every page must participate in all applicable dimensions through shared runtime infrastructure:
1. **Data sync:** one canonical Glow Object identity; edits propagate everywhere.
2. **State sync:** state transitions are reflected by all projections.
3. **Time sync:** Today, Calendar, routines, plans, previews, and specialists share the same temporal truth.
4. **Navigation sync:** every screen knows its canonical location and ancestry.
5. **Intelligence sync:** all specialists reason from the shared Life Model/Glow Graph/Kernel.
6. **Action sync:** actions mutate canonical state, not page-local copies.
7. **Visual-system sync:** all pages inherit the global design foundation while allowing family art direction.
8. **History sync:** meaningful changes preserve event history, provenance, explanation, correction, and undo where supported.

## Experience families

Related screens are one family over shared objects, not separate apps.

Examples:
- Today family: Morning Brief, What Now, Focus, Event, Next Up, Later, Tonight, Tomorrow Preview, Replan, Day View -> one Day model.
- Routine family: Library, Category, Routine, Preparation, Guided Session, Completion, History, Recommendation -> one Routine object.
- Goals family: Landscape, Goal, Milestones, Plan, Progress, Simulation, Review -> one Goal object.
- Closet family: Closet, Collections, Item, Outfit, Styling, Packing, Laundry, Wear History -> shared clothing/outfit objects.

Future families follow the same law.

## Contextual navigation and cross-world portals

Navigation is contextual, not a giant menu. Glow answers:
- Where am I?
- What surrounds me?
- Where can I naturally go next?

Glow Objects are navigable portals. Tapping an Evening Skincare routine from Today opens the exact appropriate skincare experience, not a generic routines homepage. Trips can portal into packing, closet, budget, calendar, weather, documents, reservations, and related objects through Glow Graph relationships.

## Event-driven synchronization

Pages do not manually synchronize other pages.

A meaningful action emits a canonical state/event transition to the shared Glow runtime. The Life Model updates once. Every relevant projection updates from that shared truth.

Example: `RoutineCompleted` may update Today, routine history, habit state, beauty history, planning state, predictions, and Ask Glow context without the initiating page owning those updates.

## Receipts, undo, and history

Meaningful mutations must preserve truthful receipts: what changed, why, affected objects/domains, executor result, provenance/confidence where relevant, and an undo/correction path where technically possible.

## Responsive and accessibility law

The same information architecture and navigation meaning must survive iPhone, iPad, and desktop. Responsive design may transform composition but may not relocate core meaning into a different mental model.

All page families inherit shared keyboard/focus behavior, reduced-motion support, semantic labels, safe areas, touch targets, and readable critical information.

## Migration and version enforcement

Different generations of Glow may not remain indefinitely side by side.

Legacy pages must migrate toward the canonical manifest/family/shell contract. Page-specific redesigns cannot create a new shell generation. The operating-system foundation evolves once, then all families inherit it.

Every new or rebuilt page must pass the page-contract audit before completion. Any of the following is a regression:
- unregistered route;
- duplicate permanent shell/navigation;
- lost return context;
- page-local source of truth for a canonical Glow Object;
- page-specific chatbot/intelligence runtime;
- missing sync dimension;
- hard-coded navigation special case when a manifest/relationship can express it;
- separate responsive mental model;
- missing history/provenance for meaningful mutation;
- visual family that replaces Glow identity instead of extending it.

## Implementation authority

`src/lib/glow-world/page-manifest.ts` is the canonical route/location contract registry. `AppShell`, Glow Current, and shared navigation/runtime infrastructure consume that contract. New pages must register before they are considered complete.

This constitution extends and does not weaken the existing Glow Current lock, Universal Shell lock, Living Intelligence/Digital Twin Constitution, Ask Glow inheritance law, and Glow Object/Life Model laws. When local or older page instructions conflict with this constitution, this constitution wins.