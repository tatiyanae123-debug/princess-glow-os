# Glow OS — Exact Reference Placement Law

**Status:** Permanent constitutional rule.

## Core rule

**The approved reference image already contains the UI architecture. Glow must discover the intended information-bearing surfaces inside that image and make those exact surfaces live.**

Live text, numbers, icons, statuses, and controls must not be placed merely near an object, approximately over an object, or in a generic transparent layer covering the same area. They must inhabit the exact physical information surface intended by the reference.

If the user circles, marks, points to, or otherwise identifies a physical area in a reference image, that marked area is an explicit authoritative placement instruction. It means **inside this exact thing**, not “somewhere around here.” User markup overrides inferred placement.

## Outer object vs. inner information face

Every meaningful object must be analyzed in two parts:

1. **Outer physical object boundary** — where the object begins and ends in the scene.
2. **Usable inner information face** — the exact recessed, framed, flat, curved, inset, reflective, carved, illuminated, or otherwise readable region intended to contain live information.

The usable information face, not the full outer object, defines the live content boundary.

Examples:

- An arch may be large overall, while only its inset panel is appropriate for text.
- A monument may include decorative borders, but only its central face may hold priorities.
- A basin may include rims, reflections, an orb, and an inscription ring; each has a separate semantic role.
- A mirror may contain a reflective face, frame, lights, and shelf; makeup information belongs only where its function naturally fits.

## Hard placement law

For every live element, Glow must be able to answer:

**Why does this exact piece of information live on this exact physical surface?**

If there is no clear semantic and architectural answer, the element is misplaced.

A visible word, number, icon, status, or control fails QA if it looks as though it could be dragged off its object and placed elsewhere on the page without changing meaning.

## Object-first implementation order

Never implement reference-driven pages by opening the image, estimating x/y coordinates, and absolutely positioning text.

The required order is:

**reference → physical object → exact inner information face → semantic meaning → allowed data → wording treatment → geometry → interaction → state response**

Not:

**database label → coordinate → overlay**

## Exact surface geometry

Each information face must have an explicit geometry contract defining, as needed:

- polygon or mask
- local coordinate system
- inner safe boundary
- optical padding
- perspective
- skew
- rotation
- curvature
- transform origin
- maximum width and height
- maximum line count
- type scale range
- line-height range
- clipping/overflow behavior
- icon/control zones
- touch target
- focus state
- expansion origin

Live content must remain inside that contract at all supported device sizes.

## Surface dictates presentation

Glow preserves the architecture first.

If the complete system wording does not fit elegantly inside the approved surface:

- preserve the full underlying system value
- shorten only the physical inscription when semantically safe
- adjust hierarchy before changing architecture
- use a natural expanded state to reveal full detail
- never stretch, widen, cover, or visually damage the reference object simply to fit a database title

The room decides how the information is presented.

## User-circled and annotated zones

User annotations are high-priority implementation instructions.

When the user circles a sign, plaque, panel, basin, mirror, arch, shelf, rail, aperture, drawer, frame, or other region and indicates that wording or controls belong there:

- treat the marked zone as the authoritative host surface
- identify its exact usable inner face
- fit the correct information entirely within it
- preserve its boundaries, depth, lighting, and material
- do not reinterpret the circle as a loose approximate location
- do not substitute a nearby floating card, pill, or overlay

## Reference photo as architectural wireframe

The approved reference should be read as a physical wireframe of the product.

Its architecture tells Glow where different kinds of information naturally live.

Examples:

- carved sign → priorities or current commitments
- aperture/portal → approaching time or transition
- basin/vessel → capacity, state, or Glow intelligence
- pathway → temporal flow
- horizon → future
- mirror → visual guidance/workspace
- rail → garments
- shelf → products or tools
- drawer/bin → stored inventory
- desk → notes or active work

These meanings are page-specific and must not be copied mechanically across rooms.

## Today canonical application

For the approved Today world:

- The left priority monument’s inner writable face is the authoritative surface for Today’s priorities, task rows, embedded completion controls, and any compact “more” affordance.
- The right temporal structure’s intended display face is the authoritative surface for the next-event/open-time state. Text must not wander across decorative or visually busy portions of the aperture.
- The central basin/orb structure is the authoritative home for current capacity and immediate Glow intelligence when that meaning is assigned to it.
- The illuminated route communicates Now → Next → Later → Tonight → Tomorrow primarily through light, distance, and state, not paragraphs placed on the floor.
- The horizon remains the future and should stay visually softer than Now.

## Permanent exclusion

Never regress to:

- beautiful background + generic overlay UI
- approximate placement “near” a reference object
- text floating outside a circled/marked host surface
- independent pills/cards covering architectural information faces
- coordinate-first placement without semantic mapping
- long uncontrolled wrapping that escapes a physical surface
- generic labels forced into an object without adapting their physical presentation

## Final invariant

**Inside the object means inside the object.**

**The reference image already contains the interface architecture. Glow’s job is to make those exact physical information surfaces operational, not to invent a second UI layer on top of them.**
