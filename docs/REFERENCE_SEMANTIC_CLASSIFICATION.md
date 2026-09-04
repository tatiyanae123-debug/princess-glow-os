# Glow OS Reference Semantic Classification

This rule applies to every current and future Glow OS reference image, mockup, screenshot, visual reconstruction, page review, and implementation.

A reference image has two separate readings before anything is copied into the product.

## 1. Visual reading

The reference can lock:

- architecture
- proportions
- composition
- hierarchy
- typography
- spacing
- material behavior
- lighting
- transparency
- refraction
- shadows
- object placement
- controls
- interaction cues
- information density
- visual rhythm

When a reference is declared locked, these qualities are the visual source of truth unless a newer Glow OS rule explicitly supersedes them.

## 2. Semantic reading

Every visible word, number, label, object, and data value must be classified before implementation.

### PRODUCT CONTENT

Actual user-facing Glow OS content.

Examples:

- Glow OS
- Morning Brief
- Today
- Focus
- Ask Shakti
- Weather
- Write to my day
- All changes saved

Product content may be copied when it remains consistent with newer authoritative Glow OS rules.

### REFERENCE / PRODUCTION LABEL

A label used only to organize the design process, identify a mockup, batch, concept, generation, screen, or presentation.

Examples:

- Batch 1
- Batch 2
- Concept A
- Version 3
- Screen 04
- Mockup
- Reference
- Design exploration
- generation notes

Reference / production labels must never be copied into the live product unless the user explicitly promotes one to product content.

### VISUAL PLACEHOLDER CONTENT

Sample data used to demonstrate the design and information hierarchy.

Examples:

- Monday, Apr 14
- 9:41 AM
- sample weather
- sample appointment names
- sample people
- sample files
- sample quotes

For placeholder content, preserve the reference position, hierarchy, typography, sizing, and interaction pattern while replacing the sample value with canonical or dynamic Glow OS data when appropriate.

## Supersession check

Before implementing any reference element, ask:

1. Is it actual product content?
2. Is it only a production/reference label?
3. Is it placeholder data?
4. Is its terminology outdated?
5. Does a newer authoritative Glow OS rule supersede it?

The newest authoritative Glow OS rules always win on naming, behavior, intelligence, navigation, accessibility, and product semantics.

## Current examples

- `Glow OS` = PRODUCT CONTENT and the permanent route back to the true Glow OS Home.
- `Batch 1` = REFERENCE / PRODUCTION LABEL and must not appear in the user-facing product.
- `Ask Glow` in an older reference = superseded product naming. Use `Ask Shakti` while preserving the reference control's visual architecture.
- `Monday, Apr 14` and `9:41 AM` = VISUAL PLACEHOLDER CONTENT unless the user explicitly requests a locked QA state.

## Home law

The true Glow OS Home is `/home`.

`/dashboard` is a retired legacy entry point and must redirect to `/home`. The Home destination must use the current Glow Matter universe and must never expose the old legacy dashboard as the main Glow OS Home.
