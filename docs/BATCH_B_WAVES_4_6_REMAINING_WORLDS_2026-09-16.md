# Glow OS — Batch B · Remaining Worlds

Date: 2026-09-16
Branch: `batch-b-waves-4-6-remaining-worlds`
Status: IMPLEMENTATION / RELEASE-GATE CANDIDATE

Batch B completes the remaining major Glow OS worlds in order: Wave 4 → Wave 5 → Wave 6. It does not reopen locked Today/Plan/Beauty architecture except for shared integration repairs required by these worlds.

## Governing world law

Glow OS remains one continuous living system. The canonical primary worlds are Today, Plan, Life, Brain and Create. Domain rooms such as Closet, Fitness and Wellness live inside the Life system and may also have direct routes. All worlds inherit the universal Glow shell, Current, Ask Glow, navigation, canonical objects, persistence, loading/empty/error behavior and action receipts.

---

# Wave 4 — Closet + Fitness + Wellness

## Closet

Required completion:
- Closet is a first-class Life room and direct destination.
- Owned wardrobe items remain canonical objects rather than duplicated display data.
- Categories, outfits, looks, styling, inspiration, wishlist/shopping context and wear/history projections resolve to real data or explicit empty states.
- Closet can use body/style context without inventing measurements, ownership or purchases.
- Outfit decisions can project into Today/events/travel where applicable without creating a competing calendar.
- Navigation returns cleanly to Life and the universal shell.

## Fitness

Required completion:
- Fitness is an active movement studio, not a generic dashboard.
- Workout plan, sessions, exercises, progress, recovery and scheduling project canonical objects.
- Planned workouts can appear in Today/Plan while remaining owned by the canonical planning/routine model.
- Session completion persists and can contribute to progress/history.
- Low-energy/recovery context is represented without silently replacing the user's chosen plan.
- Loading, empty and error states retain useful next actions.

## Wellness

Required completion:
- Wellness is a restoration/body-state room with sleep, recovery, energy, self-care and relevant routine context.
- Wellness does not fabricate medical conclusions.
- Wellness projections may use user-entered/synced state only when available and must degrade cleanly when data is absent.
- Wellness routines and dated care can project to Today/Plan without duplicating canonical schedule data.
- Fitness recovery and Wellness state may connect contextually while remaining separate domains.

### Wave 4 lock gate
- Closet, Fitness and Wellness routes resolve.
- Their manifest/navigation/room-experience identities agree.
- No blocker dead controls in core paths.
- Persistence works for actions that claim to save/complete.
- Shared Today/Plan/Life projections do not fork canonical data.
- Typecheck, tests, build and preview smoke pass.

---

# Wave 5 — Life

Life is the Personal House. It is a connected suite of lived domains, not a replacement for the five-world structure.

Required Life coverage:
- Life hub / Personal House
- Body
- Fitness
- Wellness
- Beauty and connected Beauty rooms
- Closet / Style
- Food / Recipes / Grocery
- Home
- Money / Finance projection
- Career / Work
- Relationships / People where implemented
- Travel
- Other established Life chambers already present in the canonical architecture

Required completion:
- Life hub exposes its established chambers as navigable spatial rooms.
- Chamber identities, routes and deep-room behavior are consistent with the shared manifest and shell.
- Life data is canonical and cross-domain projections are references, not copied truth.
- Home, food/grocery, money, career/work and travel have usable primary paths and recoverable empty states.
- Life can surface relevant upcoming commitments and context without becoming a second Today or Plan.
- Search/Ask Glow/Current can identify the active Life room.

### Wave 5 lock gate
- All established Life chambers have a real destination or an intentional in-Life projection.
- No blocker dead links from the Life hub.
- Canonical data ownership remains intact across chambers.
- Typecheck, tests, build and preview smoke pass for Life core routes.

---

# Wave 6 — Brain + Create

## Brain

Brain is Glow's knowledge/memory climate. It organizes captured meaning and connections without becoming a duplicate task manager.

Required completion:
- Brain hub resolves as a primary world.
- Memory, observations, connections and other established Brain rooms are reachable.
- Capture/search/retrieval surfaces distinguish stored knowledge from generated interpretation.
- Brain can reference canonical tasks, projects, people, routines and Life objects without duplicating ownership.
- Empty Brain states explain how knowledge enters the system.
- Ask Glow and Current understand active Brain context.

## Create

Create is the making/creative climate. It turns ideas and source material into projects and artifacts without replacing canonical Projects/Tasks.

Required completion:
- Create hub resolves as a primary world.
- Established creative rooms/workflows are reachable from the hub.
- Ideas, references, projects and outputs retain explicit relationships.
- Actions that claim to create/save/update persist or clearly identify themselves as non-persistent previews.
- Create can hand work to Projects/Tasks/Plan through canonical references.
- Empty/error states preserve a clear next creative action.
- Ask Glow and Current understand active Create context.

### Wave 6 lock gate
- Brain and Create primary routes resolve through the universal shell.
- Established subrooms are reachable with no blocker dead navigation.
- Canonical ownership boundaries remain intact.
- Save/create actions are truthful about persistence.
- Typecheck, tests, build and preview smoke pass.

---

# Batch B final acceptance

Batch B may be marked `LOCKED` only after Waves 4, 5 and 6 each pass their gates and the combined preview confirms:

1. Every major Glow world exists and is reachable.
2. Today, Plan, Life, Brain and Create preserve their distinct jobs.
3. Beauty remains connected without being accidentally forked or demoted.
4. Closet, Fitness and Wellness are complete Life domains.
5. Universal navigation, Current and Ask Glow survive transitions between all major worlds.
6. No blocker-level runtime errors or dead primary-world routes remain.
7. `npm run typecheck`, `npm test` and `npm run build` pass.
8. Vercel preview is READY and the world-to-world smoke test passes.

After this gate passes, Waves 4–6 can be locked and work moves to Batch C / Wave 7 Visual Convergence.
