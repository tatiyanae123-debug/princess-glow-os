# Glow OS — 3D Depth Integration Law

**Status:** Permanent constitutional rule.

Correct placement is not enough. Every live element must inherit the host object's actual 3D volume so that it appears physically built into the object itself.

## Core invariant

**The information must inhabit the object's volume, not merely its 2D face.**

A live element is not finished if it is correctly positioned but still looks like flat HTML printed on top of the architecture.

Every host object must establish, as appropriate:

1. **Front material edge** — the visible rim, frame, lip, bezel, carved edge, or physical boundary that visually sits in front.
2. **Recessed information plane** — the plane where text, numbers, icons, and statuses live a few visual millimeters inside the object.
3. **Internal light/refraction layer** — subtle illumination, refraction, subsurface glow, or reflected light that ties the information to Glow Matter.
4. **Interaction layer** — embedded controls that depress, brighten, refract, ripple, or otherwise react from within the material.

## Required depth cues

Where appropriate, live content should inherit:

- host-object perspective and local camera angle
- recessed z-depth
- local curvature or tilt
- edge occlusion: the host frame/rim must visibly sit in front of the information plane
- inset shadow or local ambient occlusion
- subtle internal highlight/refraction
- local material tint and contrast
- physically consistent text shadow/highlight direction
- embedded control depth
- press/release motion that moves deeper into the host rather than floating toward the camera

Do not use exaggerated 3D gimmicks. Depth must be restrained, legible, and consistent with the approved reference.

## Typography depth

Text may appear engraved, inlaid, internally illuminated, softly etched, refracted, embossed inward, or otherwise physically integrated according to the host material.

Text should never look like a browser layer hovering above the surface unless intentional suspension is part of that room's explicit physics.

The frame of a monument, plaque, basin, mirror, drawer, shelf, or portal must remain visually in front of the information plane when that is physically correct.

## Control depth

Completion controls, icons, handles, status pearls, arrows, toggles, and touch points must read as material components of the host object.

Preferred behaviors include:

- inset pearl depresses on touch
- illuminated seam brightens from within
- engraved symbol gains internal light
- recessed control sinks slightly on press
- material around the control refracts or ripples subtly

Avoid floating circles, generic app buttons, and detached hover elevation.

## Today canonical application

### Priority monument

- task text lives on a recessed inscription plane inside the monument
- the monument frame/rim sits visually in front of that plane
- row divisions appear carved/inlaid rather than CSS separators floating above the material
- number markers and completion controls read as inset Glow Matter components
- completion produces warm residual light within the inscription plane

### Next-event plaque

- event copy sits inside the lower plaque's recessed face
- the plaque border/edge visually occludes the information plane
- text follows the plaque perspective
- calendar/status control is embedded in the plaque, not floating over the window
- expansion originates by deepening/opening the plaque or moving closer into it

### Capacity basin

- Current Capacity belongs within the basin's inscription/inner vessel zone
- label and status follow the basin's curvature/perspective
- Glow intelligence appears to emanate from inside the vessel
- the orb, ring, and information plane work as one physical system
- interaction originates from the basin rather than from a flat rectangle placed over it

### Review Today threshold

- it must read as a physical threshold/step integrated into the foreground architecture
- text should be recessed/inlaid into that threshold
- it must not read as a giant rounded mobile button

## Responsive rule

Depth relationships must survive iPhone portrait, iPad portrait, iPad landscape, and desktop.

Responsive recomposition may change scale and camera crop, but must preserve:

- host object identity
- front-edge vs recessed-plane relationship
- information remaining inside the object
- interaction origin
- depth hierarchy

Do not flatten to generic cards on smaller devices.

## Reduced motion

Reduced-motion mode may remove press travel, camera movement, and animated refraction, but must preserve static depth through edge hierarchy, inset shadow, perspective, and material contrast.

## QA failure conditions

A surface fails if:

- text is in the right place but still looks printed on top
- the host frame does not visually sit in front of the information plane
- controls look like separate app components
- shadows/highlights imply the wrong z-depth
- interaction lifts content away from the host object
- responsive layouts flatten the object into a card
- decorative fake depth reduces readability

## Final invariant

**Correct surface + correct depth = valid Glow placement.**

**Every live element must inherit the host object's depth, perspective, material, edge hierarchy, internal light, and interaction physics so it appears built into the object itself.**
