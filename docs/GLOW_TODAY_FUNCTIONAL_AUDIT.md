# Glow Today functional audit

## Navigation contract

- `Today` opens `/dashboard`.
- `Brief` opens `/today/morning`.
- `Day Flow` opens `/today/flow`.
- `Debrief` opens `/today/evening`.
- The five-world dock keeps Today, Plan, Life, Brain, and Create reachable.
- The last route inside each world is remembered in browser storage.
- Supported browsers use the View Transition API; reduced-motion users receive an immediate transition.

## Live-data contract

- Greeting and date come from the device clock after mount. No status bar, date, or time is baked into an image.
- Priorities come from the authenticated user's task records.
- Next appointment comes from the calendar data already used by the dashboard.
- Capacity reflects the latest wellness energy check-in and shows a clear missing-data state when absent.
- Task completion writes through the existing task data layer.
- Carryover moves the selected task to tomorrow.
- Evening reflection writes through the existing day-review and memory-capture flow.
- Ask Glow opens the existing universal Glow voice/action layer.
- Create opens the existing universal intake layer.

## Visual contract

- Background images are environmental art only. All information and controls are live HTML.
- No simulated phone time, Wi-Fi, battery, or home indicator is included.
- Touch controls meet a 44px target where space permits.
- Content remains usable at phone, iPad, and desktop widths.
- Interfaces use progressive disclosure and no more than three visual-importance levels.

## Regression contract

- Existing routes, authentication, Neon/Drizzle data, Server Actions, Google integrations, tasks, routines, and prior Today detail view remain present.
- The old `app-shell-optimized` entry now re-exports the canonical shell so the two shells cannot drift.
- OAuth buttons render only when that provider is actually configured.
