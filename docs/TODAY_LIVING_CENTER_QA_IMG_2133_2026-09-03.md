# Today · The Living Center — QA against IMG_2133

## Reference/live screenshot audit · September 3, 2026

This document records the defects visible in the supplied Today screenshot and the required production corrections. It is a QA record, not a new visual direction. The approved Living Center reference remains authoritative.

## Defects identified

### 1. Live information looks highlighted instead of embedded

Problem: multiple live strings are sitting on pale rectangular replacement strips. They read as selected/highlighted text or pasted labels rather than information physically living in the room.

Root cause: live text overlays used high-opacity white/pearl gradient backgrounds plus backdrop blur to cover text baked into the reference raster.

Correction: live slots must be transparent/native. Do not use opaque eraser strips. Use native typography, correct placement, subtle text shadow only where necessary, and rebuild production surfaces rather than visually pasting over the room.

### 2. Overall room is too fuzzy

Problem: typography, furniture edges, Aura detail and architectural surfaces are all softer than the intended reference quality.

Root causes include scaling a raster room above its comfortable resolution, using blur to hide baked text, and compounding atmospheric blur with UI blur.

Correction: remove unnecessary blur from information slots, render changing text and controls as native HTML/CSS, keep the source reference unblurred in the primary room plane, and reserve blur only for true atmospheric depth.

### 3. Living Glow Aura is too washed out and static

Problem: the center reads like a diffuse glow/flare rather than a living intelligence with a concentrated white center and recognizable refracted structure.

Correction: sharpen the white core, beam and fine rays; reduce haze blur; preserve restrained pearl/blush/pale-blue/lavender refraction; add the locked calm double-heartbeat pulse: primary beat, settle, softer second beat, rest. The beat subtly changes scale, brightness and ray density. Reduced-motion keeps a steady luminous form.

### 4. iPhone/iPad behavior is a camera/viewport problem, not merely a scale problem

Problem: forcing the wide 4:3 reference plane into portrait creates odd zoom, horizontal exploration at the wrong moments, clipped information and weak touch targets. The room can also appear surrounded by blank/beige areas when the reference plane does not fill the device.

Correction: automatic responsive composition. Phones and narrow/split views use a native portrait camera/composition of the same Today room and same information physics. Wider iPad landscape/desktop may use the architectural wide room. No manual browser zoom is required.

### 5. Device adaptation did not consistently respect safe areas

Correction: use `100dvh`, `viewport-fit=cover`, `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`, especially for header, scrolling canvas, Ask Glow and the five-world control.

### 6. Fixed-coordinate hotspots could shrink or drift away from visible objects

Problem: percentage hotspots designed around one 4:3 stage can become too small or misaligned when the stage is scaled/cropped for another device.

Correction: wide reference mode keeps mapped hotspots only while the correct camera is active. Portrait mode uses native controls with normal layout flow and usable touch sizes.

### 7. Time hierarchy is visually flattened

Problem: Now, Next, Later, Tonight and Tomorrow can read like separate blocks rather than one temporal field.

Correction: preserve Now as the dominant illuminated anchor. In portrait, keep the future as one connected temporal rail. In wide mode, retain the original architectural placement but keep interactive focus behavior tied back to Now.

### 8. Top-three and routine areas must behave, not just display

Correction: each priority opens into focus. Each routine completion changes state, returns a Glow completion receipt and persists for the current day locally instead of instantly resetting on refresh. The routine detail surface remains scrollable.

### 9. Replan must never pretend to change schedule data silently

Correction: Replan first produces a reversible preview. Local Today order can change immediately; external calendar/schedule changes still require confirmation and a visible receipt.

### 10. Expanded content can overflow smaller screens

Correction: detail/modal surfaces have bounded dynamic height, vertical scrolling and overscroll containment.

### 11. Bottom navigation must remain orientation, not a page deck

Correction: Today / Plan / Life / Brain / Create remain the five stable orientation points. Activating them goes through the continuous-world movement system and carries context rather than presenting book-like page replacement.

### 12. Create must be its own world

Correction: Create points to the Transformation Studio (`/create`) rather than incorrectly treating Projects as the Create world.

### 13. The reference image must not become a screenshot webpage

Correction: the reference controls composition and atmosphere, but dynamic data, typography, interaction, Aura state, accessibility and responsive behavior are real production layers. No fake OS status chrome is added.

### 14. Portrait must preserve the room's identity without becoming another generic dashboard

Correction: the portrait version uses the same pearlescent dawn climate, Living Glow center, temporal hierarchy, priorities, routines and Ask Glow. It uses borders, rails, spatial fields and editorial surfaces rather than a stack of identical rounded cards.

### 15. Reduced motion must not remove orientation

Correction: heartbeat/ripples stop when reduced motion is requested, but the Living Aura remains visible and state changes still return clear receipts.

## Current implementation corrections

- Replaced opaque live-data strips with transparent native text slots in the wide Today room.
- Added a responsive native Today composition for phone, narrow iPad and split-view conditions.
- Added dynamic viewport and safe-area support at the app root.
- Added sharper Living Glow Aura rendering and synchronized double-heartbeat behavior both in Today and the global Glow runtime.
- Added daily local persistence for routine completion state.
- Corrected Create navigation to the actual Create world.
- Preserved functional Search, Calendar, Attention, Now/focus, What Now, Capacity, Replan, priorities, routines, temporal moments, Saint, profile and Ask Glow interactions.
- Added permanent reference-image QA rules and continuous-world rules to the main design constitution and repository agent instructions.

## Remaining QA rule

Do not call Today visually finished until a new logged-in live screenshot is compared against the approved reference at the actual tested device size. Build success is necessary but does not prove visual fidelity.
