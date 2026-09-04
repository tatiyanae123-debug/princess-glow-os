# Glow OS Optical Redesign — 2026-09-04

This specification supersedes the prior literal-room Today aesthetic. New image references are treated as complete aesthetic and architectural redesign evidence.

## Naming
- Product: Glow OS.
- Intelligent presence: Glow.
- Product-facing command: Ask Glow.
- Do not use a second assistant name.

## Today visual architecture
- Quiet optical operating environment rather than a literal furnished room.
- Pearlescent translucent material, milky acrylic, refractive liquid forms, thin structure lines, restrained spectral dispersion, crisp native typography.
- The interface itself is the architecture.
- No screenshot/background UI duplication.

## Today information architecture
1. Top identity bar: Glow OS / world identity / Ask Glow.
2. Left utility rail: Today / Focus / People / Places / Resources / Journeys / Create.
3. Living Center surface:
   - current time and NOW
   - one large living Glow Matter object
   - What now? input routed to Glow
   - real Capacity and Energy
   - real Top 3 priorities
   - In focus / Next up / Appointments strip
4. Time stream:
   - NEXT
   - LATER
   - TONIGHT
   - TOMORROW
   - real events/tasks only; empty space stays empty
5. Bottom controls:
   - Day view
   - Replan my day through Glow with proposal-before-write
   - truthful save state
   - Undo only when actually reversible

## Runtime laws
- One Today renderer.
- One DOM/object set per viewport.
- One Glow intelligence.
- One owner per action.
- No page-wide scale transform.
- No alternate desktop/iPad/mobile Today implementations.
- No broad backdrop blur or legacy Today hotfix stack.
- Today is isolated from legacy global CSS.
- iPad Split View recomposes the same objects instead of shrinking a screenshot.
- Phone stacks the same objects into a vertical time experience.

## Data truth
- Reference names, events, times, priorities, percentages, focus durations, and countdowns are examples only.
- Live data replaces them.
- No fake completion, fake event, fake energy, fake timer, fake countdown, or fake undo state.

## Glow behavior
- Ask Glow is always reachable.
- Glow carries current route and selected-object context.
- Read-only help can respond immediately.
- Meaningful writes require a visible proposal and user approval.
- Completed writes return an action receipt.
