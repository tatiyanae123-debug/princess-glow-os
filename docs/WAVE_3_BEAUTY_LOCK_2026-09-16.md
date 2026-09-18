# Glow OS — Wave 3 Beauty Lock

Date: 2026-09-16
Branch: `batch-a-wave-3-beauty-lock`
Status: RELEASE-GATE CANDIDATE — lock only after CI + preview QA pass

## Scope

Wave 3 owns the Beauty world and closes Beauty-facing dependencies inherited from Wave 2 without reopening the locked Today / Planning / Routines architecture.

Required Beauty surfaces:

- Beauty hub / Beauty Today
- Skincare Treatment Lab
- Gua Sha / facial massage
- Hair
- Makeup
- Body Care
- Nails / Brows / Lashes and grooming maintenance
- Oral Care / Fragrance
- Tools / Devices
- Maintenance
- Inventory / Progress where they are shared Beauty infrastructure

## Canonical completion rules

1. Every Beauty surface must resolve through the shared Glow shell, page manifest, spatial navigation and deep-room contracts.
2. No Beauty page may fork canonical ownership truth. Owned products come from canonical Beauty inventory data.
3. Routines remain canonical routine objects. Beauty may project them but must not create a competing routine system.
4. Dated maintenance and appointments remain connected to calendar/timeline state rather than static decorative copy.
5. Beauty intelligence must be contextual and inventory-aware. It may use product, routine, maintenance, progress and current-state context without inventing ownership.
6. All Beauty navigation targets must be real routes or intentional projections. No dead controls are accepted as complete.
7. Loading, empty and error behavior must preserve the Glow shell and give the user a recoverable next action.
8. Wave 2 is not redesigned here. Only Beauty-facing integration defects may be repaired.

## Domain acceptance matrix

| Domain | Acceptance requirement |
| --- | --- |
| Skincare | Treatment Lab, AM/PM logic, inventory, routines, progress and treatment context remain connected. |
| Gua Sha | Studio/guide/session routes preserve guided movement, routine/session context and canonical Beauty data. |
| Hair | Hair Studio remains a first-class Beauty destination with routine, product, history and inspiration context. |
| Makeup | Makeup studio exposes products/looks and returns cleanly to Beauty navigation. |
| Body | Body Care exposes product/routine context and participates in Beauty Today / maintenance where relevant. |
| Nails/Brows/Lashes | Grooming and recurring maintenance remain represented through Beauty maintenance/routines rather than orphaned static pages. |
| Oral/Fragrance | Oral-care inventory/routines and Fragrance studio remain discoverable Beauty capabilities. |
| Tools/Devices | Device library is backed by canonical inventory and device context. |
| Maintenance | Recurrence, due context, appointments and routines remain connected rather than duplicated. |

## Deferred Wave 2 closure

Wave 3 accepts only these Wave 2 integration closures:

- Beauty routines can project into Today without replacing Today architecture.
- Beauty appointments/maintenance can project into Calendar/Today using canonical dated state.
- Beauty actions can return to the universal shell/navigation without local navigation forks.
- Current/Ask Glow context can identify the active Beauty room.

Any unrelated Today, Planning or Routines redesign is explicitly out of scope.

## Lock gate

Wave 3 may be marked `LOCKED` only when all of the following are true on this branch/PR:

- `npm run typecheck` passes.
- `npm test` passes.
- `npm run build` passes.
- Vercel preview deployment reaches READY.
- Smoke navigation covers Beauty hub, Skincare, Gua Sha, Hair, Makeup, Body, Fragrance, Devices, Maintenance and Inventory/Progress.
- No blocker-level runtime error is observed during the preview smoke pass.
- No dead Beauty navigation target is found.

After the gate passes, merge the PR and treat Wave 3 as locked. Subsequent visual-system-wide work belongs to Wave 7; general functional repairs belong to Wave 8; device/state matrix work belongs to Wave 9.
