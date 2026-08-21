# Liquid Crystal Migration Plan

Source of truth: locked stable checkpoint `locked/stable-2026-08-21` / commit `12b34cfb97f32473a9ec5f165b709679d01541b5`.

## Non-negotiable rule
Liquid-Crystal visuals must never replace, hide, intercept, or rewrite working Glow OS behavior. Existing routes, navigation, data, server actions, forms, uploads, conversations, routines, and content remain authoritative.

## Layering
1. Existing Glow OS: routes, data, actions, forms, navigation, content.
2. Glow Matter: explicit opt-in surfaces only.
3. Glow Physics: pointer-events:none ambient/touch effects.
4. Glow Climate: light and atmosphere only.
5. Glow Intelligence: aurora/completion phenomena only after confirmed actions.

## Visual migration states
- `legacy`: exact stable rendering.
- `hybrid`: existing page UI plus page climate/physics.
- `liquid-v1`: explicitly migrated Glow primitives.

No wildcard selectors may theme generic `div`, `button`, `a`, `input`, `card`, `panel`, `surface`, `rounded-*`, `bg-white`, or text utility classes.

## Batch order
0. Shell atmosphere only. Existing header/navigation/Ask Glow remain structurally unchanged.
1. Today.
2. Plan: Calendar, Tasks, Reminders, Planning, Goals, Projects, Routines, Habits.
3. Body: Fitness, Wellness, Food.
4. Beauty: Beauty, Makeup, Skincare, Hair, Closet, Gua Sha.
5. Money.
6. Brain: Brain, Memory, Timeline, Concierge, Connections, Observations, Graph, Notices.
7. Create: Create, Capture, Creative Studio, Notes, Inbox, Gmail, Import.
8. Home / World / Work.

## Acceptance gate
A migrated page may ship only when existing information is present, controls work, navigation is unchanged unless intentionally approved, loading/empty/forms work, iPhone/iPad/desktop are usable, keyboard/focus is preserved, reduced-motion is respected, Ask Glow works, and the page visually follows the Liquid-Crystal Constitution.

## Rollback
The branch `locked/stable-2026-08-21` is never modified by this migration. Any failed page may be set back to `legacy` without changing other pages.
