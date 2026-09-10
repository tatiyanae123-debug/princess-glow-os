export type GlowWorld = 'today' | 'plan' | 'life' | 'brain' | 'create';
export type Enclosure = 'open' | 'structured' | 'protected';

export type DeepRoomIdentity = {
  id: string;
  match: string;
  world: GlowWorld;
  domain: string;
  material: string;
  enclosure: Enclosure;
  purpose: string;
};

/**
 * Route-level visual and architectural identity only.
 * Real object state remains in the Life Model/domain stores. This registry never owns user truth.
 * Most-specific prefix wins.
 */
export const DEEP_ROOM_MANIFEST: DeepRoomIdentity[] = [
  { id:'gua-sha-guide',match:'/beauty/gua-sha/guide',world:'life',domain:'gua-sha',material:'anatomical-glass',enclosure:'protected',purpose:'Guide one facial region, movement and direction at a time.' },
  { id:'gua-sha',match:'/beauty/gua-sha',world:'life',domain:'gua-sha',material:'anatomical-glass',enclosure:'structured',purpose:'Use the face itself as the spatial map for technique and care.' },
  { id:'beauty-maintenance',match:'/beauty/maintenance',world:'life',domain:'beauty-maintenance',material:'pearl-calendar',enclosure:'structured',purpose:'See recurring beauty care as a due-soon maintenance rhythm.' },
  { id:'beauty-inventory',match:'/beauty/inventory',world:'life',domain:'skincare',material:'treatment-cabinet',enclosure:'structured',purpose:'Inspect canonical owned Beauty objects without duplicating ownership truth.' },
  { id:'beauty-progress',match:'/beauty/progress',world:'life',domain:'skincare',material:'clinical-history',enclosure:'structured',purpose:'Understand treatment and product response across time.' },
  { id:'beauty-devices',match:'/beauty/devices',world:'life',domain:'skincare',material:'optical-tool-bench',enclosure:'structured',purpose:'Use and maintain devices as stateful Glow Objects.' },
  { id:'beauty-body',match:'/beauty/body',world:'life',domain:'body',material:'ivory-body-map',enclosure:'structured',purpose:'Navigate body care spatially by need and body region.' },
  { id:'makeup-look',match:'/beauty/makeup/look',world:'life',domain:'makeup',material:'pigment-editorial',enclosure:'protected',purpose:'Break a look down across face placement, technique and owned products.' },
  { id:'makeup',match:'/beauty/makeup',world:'life',domain:'makeup',material:'pigment-editorial',enclosure:'structured',purpose:'Build looks from occasion through face placement to result.' },
  { id:'fragrance',match:'/beauty/fragrance',world:'life',domain:'fragrance',material:'scent-vapor',enclosure:'structured',purpose:'Navigate scent by mood, layering, wear and occasion.' },
  { id:'beauty-today',match:'/beauty/today',world:'today',domain:'beauty',material:'luminous-pearl',enclosure:'open',purpose:'Show only Beauty care that matters in the current day.' },
  { id:'beauty',match:'/beauty',world:'life',domain:'beauty',material:'editorial-vanity',enclosure:'open',purpose:'Enter the personal Beauty archive and studio.' },

  { id:'hair-wash-day',match:'/hair/wash',world:'life',domain:'hair',material:'water-fiber',enclosure:'protected',purpose:'Move through pre-wash, cleanse, treat, condition, detangle, dry, style and protect.' },
  { id:'hair',match:'/hair',world:'life',domain:'hair',material:'fiber-photographic',enclosure:'structured',purpose:'Understand current hair state, cycle, maintenance, products and next action.' },

  { id:'exercise-detail',match:'/fitness/exercises/',world:'life',domain:'fitness',material:'training-dossier',enclosure:'structured',purpose:'Understand exercise role, technique, history, progression and alternatives.' },
  { id:'workout-day',match:'/fitness/workout',world:'life',domain:'fitness',material:'kinetic-architecture',enclosure:'protected',purpose:'Execute the current workout with utility-first sets, reps, rest and progression.' },
  { id:'workout-week',match:'/fitness/week',world:'life',domain:'fitness',material:'load-recovery-field',enclosure:'structured',purpose:'See training load and recovery as a weekly spatial rhythm.' },
  { id:'fitness',match:'/fitness',world:'life',domain:'fitness',material:'kinetic-architecture',enclosure:'structured',purpose:'Understand the current training journey, recovery, progress and next workout.' },

  { id:'routine-morning',match:'/routines/daily-life/morning',world:'plan',domain:'routines-morning',material:'morning-light',enclosure:'structured',purpose:'Move through the morning as a living sequence with energy and situation adaptations.' },
  { id:'routine-skincare',match:'/routines/skincare',world:'plan',domain:'skincare',material:'treatment-cabinet',enclosure:'structured',purpose:'Compose skincare by AM/PM, actives, compatibility, treatment rhythm and order.' },
  { id:'routine-hair',match:'/routines/hair',world:'plan',domain:'hair',material:'fiber-cycle',enclosure:'structured',purpose:'Navigate hair routines through cycles, maintenance and protective-style state.' },
  { id:'routine-fitness',match:'/routines/fitness',world:'plan',domain:'fitness',material:'kinetic-architecture',enclosure:'structured',purpose:'Connect workout week, active session, recovery, progression and history.' },
  { id:'routine-makeup',match:'/routines/makeup',world:'plan',domain:'makeup',material:'face-chart',enclosure:'structured',purpose:'Build a routine through look, occasion, placement, products and result.' },
  { id:'routine-home',match:'/routines/home',world:'plan',domain:'home',material:'spatial-house',enclosure:'structured',purpose:'Enter home routines through actual spaces and the objects that live there.' },
  { id:'routine-digital',match:'/routines/digital',world:'plan',domain:'digital',material:'personal-archive',enclosure:'structured',purpose:'Run digital cleanup as connected processes rather than a settings list.' },
  { id:'routine-travel',match:'/routines/travel',world:'plan',domain:'travel',material:'journey-field',enclosure:'structured',purpose:'Reorganize connected Glow Objects around the active Trip situation.' },
  { id:'routines',match:'/routines',world:'plan',domain:'routines',material:'ritual-universe',enclosure:'open',purpose:'Navigate living routines simultaneously by time, frequency, life area, energy and situation.' },

  { id:'calendar',match:'/calendar',world:'plan',domain:'calendar',material:'architectural-time',enclosure:'structured',purpose:'Manipulate time while respecting preparation, travel, energy and dependencies.' },
  { id:'planning',match:'/planning',world:'plan',domain:'planning',material:'future-state',enclosure:'open',purpose:'Explore and shape possible future states of the Life Model.' },

  { id:'closet-style',match:'/closet/style',world:'life',domain:'closet',material:'atelier-dossier',enclosure:'structured',purpose:'Evolve style identity from explicit preferences, evidence and provenance.' },
  { id:'closet-outfit',match:'/closet/outfit',world:'life',domain:'closet',material:'composition-table',enclosure:'protected',purpose:'Compose a full look from connected owned objects and context.' },
  { id:'closet-shopping',match:'/closet/shopping',world:'life',domain:'closet',material:'decision-atelier',enclosure:'structured',purpose:'Explain whether a potential purchase fills a real wardrobe need and what it changes.' },
  { id:'closet',match:'/closet',world:'life',domain:'closet',material:'fashion-atelier',enclosure:'open',purpose:'Use the owned wardrobe as an active life system.' },

  { id:'money-decision',match:'/finance/brain',world:'life',domain:'money',material:'private-simulation',enclosure:'protected',purpose:'Simulate buying, waiting and competing financial futures without mutating current reality.' },
  { id:'money',match:'/finance',world:'life',domain:'money',material:'quiet-ledger',enclosure:'structured',purpose:'Understand income, spending, savings, obligations and cash-flow pressure calmly.' },

  { id:'home',match:'/home',world:'life',domain:'home',material:'spatial-house',enclosure:'open',purpose:'Move through the home spatially into storage, objects, maintenance, routines and projects.' },
  { id:'saint',match:'/saint',world:'life',domain:'saint',material:'warm-memory',enclosure:'structured',purpose:'Connect care, walks, appointments, supplies, memories, travel and expenses around Saint.' },
  { id:'life',match:'/life',world:'life',domain:'life',material:'living-world',enclosure:'open',purpose:'Enter the connected personal world rather than a directory of apps.' },

  { id:'import-review',match:'/import/review',world:'brain',domain:'brain-import',material:'provenance-desk',enclosure:'protected',purpose:'Separate source fact, Glow inference, personal preference and unresolved identity.' },
  { id:'imported-knowledge',match:'/memory',world:'brain',domain:'brain-archive',material:'archival-paper',enclosure:'structured',purpose:'Preserve source, extracted concepts, provenance, relationships and where knowledge is used.' },
  { id:'identity-studio',match:'/brain/identity',world:'brain',domain:'brain-identity',material:'identity-dossier',enclosure:'structured',purpose:'Track explicit identity, preferences and evolving inferred patterns with provenance.' },
  { id:'brain',match:'/brain',world:'brain',domain:'brain',material:'living-archive',enclosure:'open',purpose:'Expose connected memory, knowledge, reflection, provenance and accumulated context.' },

  { id:'create',match:'/create',world:'create',domain:'create',material:'studio-table',enclosure:'open',purpose:'Transform ideas, sources, images, drafts and collections in a spatial working studio.' },

  { id:'today-night',match:'/today/night',world:'today',domain:'today-night',material:'lamp-pearl',enclosure:'open',purpose:'Close the day, care, prepare tomorrow and move toward sleep with very low density.' },
  { id:'today-evening',match:'/today/evening',world:'today',domain:'today-evening',material:'smoky-rose',enclosure:'open',purpose:'Transition from execution into closure, reset and tomorrow preparation.' },
  { id:'today-between',match:'/today/between',world:'today',domain:'today-between',material:'transition-field',enclosure:'structured',purpose:'Reconcile what happened, what slipped and what realistically fits next.' },
  { id:'today-morning',match:'/today/morning',world:'today',domain:'today-morning',material:'morning-light',enclosure:'open',purpose:'Progress through wake, energy, routine, commitments, food, beauty and leaving needs.' },
  { id:'today-focus',match:'/today/focus',world:'today',domain:'today-focus',material:'quiet-focus',enclosure:'protected',purpose:'Narrow the world to the current action while preserving Glow Current and Shakti.' },
  { id:'today',match:'/today',world:'today',domain:'today',material:'temporal-editorial',enclosure:'open',purpose:'Materialize current life state as what matters now, what is coming and what to do next.' },
];

const SORTED = [...DEEP_ROOM_MANIFEST].sort((a,b)=>b.match.length-a.match.length);

export function getDeepRoomIdentity(pathname: string): DeepRoomIdentity | null {
  return SORTED.find((room)=>pathname===room.match || pathname.startsWith(`${room.match}/`)) ?? null;
}
