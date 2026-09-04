# Glow OS Image Fidelity + Collision Contract — 2026-09-04

This contract applies to every current and future Glow OS room, world, responsive state, photo archive, visual card, mood board, hero image, product image, uploaded image, and editable image surface.

## Core law

An image is a physical information surface inside Glow OS. It may never behave like a loose web image pasted into a layout.

Every image must have:

- one explicit containing surface
- controlled overflow
- intentional object fit
- intentional focal position
- stable aspect ratio or stable responsive height
- a defined stacking layer
- a defined text-safe zone when copy intentionally sits over photography
- no accidental overlap with neighboring images, controls, labels, captions, or navigation
- no stretching beyond its container geometry
- no browser-default inline image spacing
- no low-quality CSS effect that makes a sharp source look blurry

## Crop law

Use `contain` when seeing the whole object matters, including wardrobe items, product inventory, tools, diagrams, and reference objects.

Use `cover` when the image is atmospheric or photographic and cropping is acceptable.

Portrait-oriented subjects should use an intentional focal point. Do not rely on `50% 50%` when the subject's head, hair, face, garment, or important detail sits above or below center.

Editable Glow images must allow the crop/focal view to be corrected without replacing the source image.

## Quality law

Glow preserves the original source resolution. CSS may not simulate detail that does not exist.

Images must use browser high-quality interpolation (`image-rendering: auto`) and avoid unnecessary repeated transforms, filters, opacity layers, or scaling that softens the source.

Do not embed screenshots of interfaces as functional interface surfaces.

## Collision law

Image surfaces use isolated stacking contexts and clipped/paint-contained boundaries.

Image media is layer 0.
Intentional image copy is layer 2.
Optical edge treatment is layer 3 and never receives pointer events.
Temporary edit controls are layer 5 and appear only during editing/focus.

A neighboring grid item must never visually enter another image surface.

All image-grid children must have `min-width: 0` and `max-width: 100%`.

## Text-over-image law

Text may overlap photography only when that overlap is intentional and art-directed.

Intentional overlay copy must:

- stay inside a safe zone
- remain readable against the local image luminance
- not cover the primary subject when avoidable
- move or recompose at tablet and phone sizes
- never collide with image editing controls

If those conditions cannot be met, the copy moves outside the image.

## Responsive law

Phone and iPad layouts recompose image relationships rather than shrinking desktop overlaps.

At narrow widths:

- hero copy may move to the bottom or outside the image
- image grids may reduce their column count
- portrait and product images may gain height rather than being cropped harder
- controls remain within the image boundary
- no fixed desktop offsets may force copy outside a visual surface

## Room-specific defaults

- Closet: whole garment/object visibility wins. Default to `contain`.
- Hair: preserve crown/length context. Use a slightly elevated focal point for cover crops.
- Timeline: preserve the photographed moment while keeping timeline nodes visible outside cards.
- Mood Board: preserve the source aspect ratio whenever practical. Do not force every pin into the same crop.
- Reference room images: all editable image slots use the shared Glow image surface and persistent focal/crop settings.

## QA acceptance test

Before a page is considered visually complete, verify:

1. No image overlaps another image unintentionally.
2. No text overlaps an image unintentionally.
3. No edit control permanently covers meaningful image content.
4. No image leaks outside its own surface.
5. No image is stretched.
6. Important subjects are not cropped at the head, hair, hands, garment edges, or product edges without intentional art direction.
7. Tablet and phone states preserve the image's purpose.
8. Empty and broken-image states keep the layout stable.
9. Images remain sharp at normal device scale.
10. Every intentional overlay still has readable contrast and a safe zone.

A page that fails any of these checks is not finished.
