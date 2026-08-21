# Glow OS — Living Liquid-Crystal Constitution

This document is permanent design law for Glow OS. New UI work must inherit this language instead of inventing an unrelated theme.

## North star

Glow should feel like inhabiting a calm intelligent medium, not operating a collection of conventional app screens.

The system remains highly legible, white-dominant and operationally calm, but its white space is alive with restrained refraction, depth and atmosphere.

## 1. Glow Matter

Glow Matter is the signature material of the operating system.

It is not ordinary glassmorphism. It behaves like a refined liquid crystal suspended in clear water:
- translucent rather than cloudy
- pearlescent rather than metallic
- refractive rather than glossy
- soft depth rather than heavy shadow
- responsive rather than decorative
- calm in the idle state

Cards, sheets, controls and fields may inherit Glow Matter while keeping text contrast and task clarity intact.

## 2. Shared physics

Every Glow room obeys the same physics:
- touch can produce a subtle water/crystal ripple
- ambient caustic light moves slowly beneath the interface
- intelligent completion can produce a soft aurora sweep
- information should feel as if it condenses into clarity rather than abruptly popping into existence
- completed states may visually dissolve or soften into light where technically appropriate
- movement uses gentle momentum and easing, never noisy bounce
- light may move before or around objects to imply intelligence without adding another widget

These effects must obey `prefers-reduced-motion`.

## 3. One world, different climates

Pages are not separate themes. They are climates inside one world.

### Today / Dashboard
Pearlescent dawn. Rose, lilac and faint champagne. Optimistic, lucid, awakening.

### Plan
Calendar, Tasks, Planning, Reminders, Routines, Goals and Projects use cool lilac-blue temporal light. Precise, architectural and forward-moving.

### Body / Care
Fitness, Wellness and Food use mineral water, soft sage and clear blue light. Fresh, restorative and physical.

### Beauty
Beauty, Beauty Lab, Hair and Closet use rose pearl, champagne and violet opal. Warm, tactile and elegant.

### Money
Finance and Financial Brain use emerald mineral light with restrained gold. Grounded, weighted and trustworthy.

### Intelligence
Brain, Concierge, Observations, Memory, Timeline, Briefings and Connections use violet-blue neural/celestial light. Deep, connected and quietly intelligent.

### Home / World
Botanical mineral light, earth-pearl and subtle lavender. Spatial, lived-in and atmospheric.

### Create / System / Work
Notes, Resources, Gmail, Import, Settings and Work use clear opalescent/slate crystal. Focused and adaptable.

## 4. Intelligence as natural phenomenon

Glow intelligence should not require a chatbot-shaped visual everywhere.

The system may express intelligence through:
- aurora sweeps
- refraction shifts
- connected constellations
- gentle reordering
- information surfacing at the correct depth
- light trails connecting related objects
- mist-to-structure transitions

The existing universal Glow action layer remains the explicit conversational/action entry point.

## 5. Depth architecture

Depth is functional.

Use three primary optical depths:
1. Atmosphere: ambient field, caustics and climate.
2. Living surface: cards, controls, sheets and current context.
3. Attention: active Glow intelligence, focus action, urgent state or modal surface.

Do not create unnecessary floating layers merely for decoration.

## 6. Seasonal evolution

Glow may subtly shift ambient temperature by season, time of day or context, but structural locations, contrast and semantic meaning must remain stable.

Seasonality changes atmosphere, not usability.

## 7. Existing Glow OS 3.0 rules still apply

The liquid-crystal constitution extends the White Editorial Luxury rulebook. It does not remove its usability constraints.

Keep:
- white-dominant operational rooms
- low visible density
- progressive disclosure
- Now / Next / Later
- universal Glow action layer
- simplified navigation
- 8px spacing grid
- real functional controls only
- Focus Mode
- iPhone, iPad and desktop responsiveness
- keyboard and focus accessibility

Room colors remain atmospheric accents, not opaque full-screen washes.

## 8. Signature event contract

The shared Glow Matter field listens for these document events:
- `glow:intelligence`
- `glow:command-complete`
- `glow:action-complete`

Dispatch one of these events after a meaningful intelligent action to trigger the universal aurora response.

Example:

```ts
document.dispatchEvent(new CustomEvent('glow:intelligence'));
```

Do not trigger the aurora for every trivial click. It should retain meaning.

## 9. Acceptance filter

Before shipping a Glow page or feature, ask:

1. Does this still immediately answer where I am, what matters and what I should do next?
2. Does it feel made from Glow Matter rather than generic app components?
3. Does its climate belong to its domain without becoming a separate theme?
4. Does it use the same physics as the rest of Glow?
5. Is the motion calm and accessible?
6. Does intelligence reduce complexity rather than add visual noise?
7. Could this screen plausibly belong only to Glow?

If the answer to the last question is no, the design is not finished.
