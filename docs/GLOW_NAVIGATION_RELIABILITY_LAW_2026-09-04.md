# Glow OS Navigation Reliability Law

**Status:** CANONICAL · AUTHORITATIVE · PERMANENT

This law supplements the Glow Current constitution and the Effortless Interaction Law.

## Permanent requirement

Every visible navigation control in Glow OS must work on the first press on iPhone, iPad, desktop, Safari, pointer, touch, and keyboard.

Visual sophistication may never be allowed to make a control unreliable.

## Home guarantee

**Glow OS = Home.**

A Home control must remain reachable from the current viewport on every current and future Glow OS page. It must sit above full-screen room layers and must not require the user to scroll back to the top to find it.

## Direct-navigation fallback

Glow Current may use smooth in-memory transformations when they are proven reliable. If a room-to-room interaction is not reliable, the visible control must use a durable direct navigation path instead.

For critical navigation, reliability outranks transition cleverness.

A visible button may never depend exclusively on a fragile custom `pushState` or gesture path when a direct route can guarantee arrival.

## Contextual-room law

Contextual pages such as Focus, People, Places, Resources, Journey, and future equivalents may expose direct contextual entrances while the user is inside that context. These entrances must remain above decorative full-screen layers and must be tappable.

They are contextual, not the permanent global navigation model.

## Top-position law

Opening a new Glow room must begin at the room's intended orientation/top state unless preserving a specific prior scroll position is explicitly part of the user action.

A new destination must never accidentally inherit an unrelated scroll position that hides its Home, Today, Ask Glow, title, or primary orientation.

## Frozen-control prohibition

Do not ship:

- buttons that look active but do nothing,
- controls covered by invisible overlays,
- navigation with a lower stacking layer than the room covering it,
- decorative elements that intercept taps,
- route changes that update only the URL without reliably updating the visible room,
- navigation that works on desktop but freezes on iPad Safari,
- controls that require a second press because hydration or room state was not synchronized.

## Future-page inheritance

Every future Glow OS page automatically inherits these tests:

1. Can I press Glow OS and reach Home from where I am right now?
2. Does the destination open visibly at the correct orientation?
3. Does every visible navigation button respond on the first press?
4. Are all critical navigation controls above full-screen overlays?
5. If the elegant transition fails, is there a reliable direct route fallback?
6. Does it work with touch on iPad/iPhone Safari?

If any answer is no, the navigation is not finished.

## Final rule

**Simple controls. Futuristic movement. Reliable arrival.**
