import type { GlowWorld } from '@/lib/glow-world/room-experience';
import { canonicalExperienceFor } from '@/lib/glow-world/canonical-experiences';

export type GlowPageLevel = 'world' | 'room' | 'studio' | 'experience' | 'object' | 'detail' | 'overlay';
export type GlowPageScope = 'world' | 'global';
export type GlowSyncDimension = 'data' | 'state' | 'time' | 'navigation' | 'intelligence' | 'action' | 'visual' | 'history';
export type GlowPageManifest = {
  id: string;
  match: string;
  label: string;
  world: GlowWorld;
  scope: GlowPageScope;
  level: GlowPageLevel;
  parent?: string | null;
  family: string;
  designFamily: string;
  layoutFamily: 'open' | 'structured' | 'protected';
  objectTypes: string[];
  specialists: string[];
  sync: GlowSyncDimension[];
  preservesReturnContext: boolean;
};

export const REQUIRED_SYNC_DIMENSIONS: GlowSyncDimension[] = ['data','state','time','navigation','intelligence','action','visual','history'];

const m = (
  id: string, match: string, label: string, world: GlowWorld, level: GlowPageLevel, parent: string | null,
  family: string, designFamily: string, layoutFamily: GlowPageManifest['layoutFamily'], objectTypes: string[], scope: GlowPageScope = 'world',
): GlowPageManifest => ({
  id, match, label, world, scope, level, parent, family, designFamily, layoutFamily, objectTypes,
  specialists: ['glow-kernel'], sync: [...REQUIRED_SYNC_DIMENSIONS], preservesReturnContext: true,
});

export const GLOW_PAGE_MANIFESTS: GlowPageManifest[] = [
  m('root.home','/home','Glow Home','today','overlay',null,'origin','world-fold','open',['world'],'global'),
  m('living.what-now','/living/what-now','What Now?','today','studio','/home','living-workspace','reference-living','structured',['task','event','routine']),
  m('living.planning-studio','/living/planning-studio','Planning Studio','plan','studio','/home','living-workspace','reference-living','structured',['task','event','goal','routine']),
  m('living.day-flow','/living/day-flow','Your Day in Flow','today','studio','/home','living-workspace','reference-living','structured',['event','task','routine']),
  m('living.today-systems','/living/today-systems','Today Systems','today','studio','/home','living-workspace','reference-living','structured',['task','routine','habit','reminder']),
  m('living.important-inbox','/living/important-inbox','Important Inbox','create','studio','/home','living-workspace','reference-living','structured',['capture','task','notification']),
  m('living.people','/living/people-to-contact','People to Contact','life','studio','/home','living-workspace','reference-living','structured',['person','relationship']),
  m('living.brain-web','/living/brain-web','Brain Web','brain','studio','/home','living-workspace','reference-living','open',['note','goal','routine','habit','relationship']),
  m('living.moving-forward','/living/moving-forward','Moving Forward','plan','studio','/home','living-workspace','reference-living','structured',['goal','project','task']),
  m('living.life-pulse','/living/life-pulse','Life Pulse','life','studio','/home','living-workspace','reference-living','structured',['wellness-entry','goal','task','note']),
  m('living.catch-up','/living/catch-up','Catch Up','today','studio','/home','living-workspace','reference-living','structured',['task','note']),
  m('living.personal-house','/living/personal-house','Personal House','life','studio','/home','living-workspace','reference-living','open',['space','task','routine','maintenance']),
  m('living.midday-reset','/living/midday-reset','Prepare for Midday Reset','plan','experience','/home','living-workspace','reference-living','protected',['routine','task']),
  m('living.vision-you','/living/vision-you','Vision & You','life','studio','/home','living-workspace','reference-living','open',['goal','task','wellness-entry']),
  m('today.world','/today','Today','today','world',null,'today','today-living','open',['day','task','event','routine']),

  m('plan.world','/planning','Plan','plan','world',null,'planning','planning-studio','open',['plan','task','event','goal']),
  m('plan.studio','/planning/studio','Horizon Studio','plan','studio','/planning','planning','planning-studio','open',['planning-period','task','event','routine']),
  m('plan.planner','/planning/planner','Planner','plan','room','/planning','planner-v1','planning-studio','structured',['planning-period','task','event']),
  ...['today','tomorrow','week','month','archive','insights'].map((key) => m(`plan.planner.${key}`,`/planning/planner/${key}`,key,'plan','experience','/planning/planner','planner-v1',key==='archive'||key==='insights'?'history-room':'planning-studio','structured',['planning-period','task','event'])),
  m('plan.calendar','/calendar','Calendar','plan','room','/planning','planning','temporal-observatory','structured',['event','appointment']),
  m('plan.tasks','/tasks','Tasks','plan','room','/planning','planning','planning-studio','structured',['task']),
  m('plan.tasks.detail','/tasks/[id]','Task Detail','plan','detail','/tasks','planning','dashboard-descendant','structured',['task']),
  m('plan.reminders','/reminders','Reminders','plan','room','/planning','planning','planning-studio','structured',['reminder']),
  m('plan.routines','/routines','Routines','plan','room','/planning','routines','routine-world','structured',['routine']),
  m('plan.habits','/habits','Habits','plan','room','/planning','habits','routine-world','structured',['habit']),
  m('plan.goals','/goals','Goals','plan','room','/planning','goals','future-landscape','open',['goal','milestone']),
  m('plan.projects','/projects','Projects','plan','room','/planning','projects','future-landscape','structured',['project','task','milestone']),

  m('life.world','/life','Life','life','world',null,'life','inhabited-world','open',['person','place','resource']),
  m('life.body','/body','Body','life','room','/life','body','body-blueprint','structured',['measurement','body-profile']),
  m('life.wellness','/wellness','Wellness','life','room','/life','wellness','wellness-room','structured',['wellness-entry','appointment']),
  m('life.fitness','/fitness','Fitness','life','room','/life','fitness','fitness-room','structured',['workout','exercise','recovery-signal']),
  m('life.fitness.week','/fitness/week','Fitness Week','life','studio','/fitness','fitness','dashboard-descendant','structured',['workout','recovery-signal']),
  m('life.fitness.workout','/fitness/workout','Workout','life','experience','/fitness','fitness','dashboard-descendant','protected',['workout','exercise']),
  m('life.fitness.exercises','/fitness/exercises','Exercise Library','life','studio','/fitness','fitness','dashboard-descendant','structured',['exercise']),
  m('life.fitness.progression','/fitness/progression','Progression','life','studio','/fitness','fitness','dashboard-descendant','structured',['workout','exercise','history']),
  m('life.fitness.recovery','/fitness/recovery','Recovery','life','studio','/fitness','fitness','dashboard-descendant','structured',['recovery-signal','workout']),
  m('life.food','/food','Food','life','room','/life','food','food-room','structured',['meal','recipe','food']),
  m('life.closet','/closet','Closet','life','room','/life','closet','dressing-room','open',['clothing-item','outfit','wear-history']),
  m('life.finance','/finance','Money','life','room','/life','money','money-room','structured',['transaction','account','bill']),
  m('life.money','/money','Money','life','room','/life','money','money-room','structured',['transaction','account','bill']),
  m('life.home','/life/home','Home','life','room','/life','home','home-room','open',['space','maintenance','inventory']),
  m('life.work','/work','Career + Work','life','room','/life','work','work-room','structured',['work-shift','job','interview']),
  m('life.travel','/travel','Travel','life','room','/life','travel','travel-room','open',['trip','reservation','place']),
  m('life.relationships','/relationships','Relationships','life','room','/life','relationships','relationship-room','open',['person','relationship']),
  m('life.saint','/saint','Saint Care','life','room','/life','saint-care','saint-room','structured',['care-entry','supply','appointment']),

  m('life.beauty','/beauty','Beauty','life','room','/life','beauty','personal-atelier','open',['product','routine','look']),
  m('beauty.intelligence','/beauty/intelligence','Beauty Intelligence','life','studio','/beauty','beauty-intelligence','personal-atelier','structured',['recommendation','routine','product']),
  m('beauty.today','/beauty/today','Beauty Today','life','experience','/beauty','beauty','personal-atelier','structured',['routine','product']),
  m('beauty.skincare','/beauty/skincare','Skincare','life','studio','/beauty','skincare','skincare-studio','open',['routine','product']),
  m('beauty.skincare.compatibility','/beauty/skincare/compatibility','Compatibility Studio','life','experience','/beauty/skincare','skincare','skincare-studio','structured',['product','ingredient']),
  m('beauty.gua-sha','/beauty/gua-sha','Gua Sha Studio','life','studio','/beauty','gua-sha','gua-sha-studio','open',['routine','tool','session']),
  m('beauty.gua-sha.morning','/beauty/gua-sha/morning','Morning Light Gua Sha','life','experience','/beauty/gua-sha','gua-sha','gua-sha-studio','protected',['routine','tool','session']),
  m('beauty.gua-sha.night','/beauty/gua-sha/night','Evening Gua Sha','life','experience','/beauty/gua-sha','gua-sha','gua-sha-studio','protected',['routine','tool','session']),
  m('beauty.makeup','/beauty/makeup','Makeup','life','studio','/beauty','makeup','makeup-studio','open',['product','look']),
  m('beauty.body','/beauty/body','Body Beauty','life','studio','/beauty','body-care','beauty-studio','open',['product','routine']),
  m('beauty.nails','/beauty/nails','Nails','life','studio','/beauty','nails','beauty-studio','open',['product','routine']),
  m('beauty.brows-lashes','/beauty/brows-lashes','Brows + Lashes','life','studio','/beauty','brows-lashes','beauty-studio','open',['product','routine']),
  m('beauty.oral-care','/beauty/oral-care','Oral Care','life','studio','/beauty','oral-care','beauty-studio','open',['product','routine']),
  m('beauty.fragrance','/beauty/fragrance','Fragrance','life','studio','/beauty','fragrance','beauty-studio','open',['product','wear-log']),
  m('beauty.maintenance','/beauty/maintenance','Beauty Maintenance','life','studio','/beauty','beauty-maintenance','beauty-studio','structured',['routine','appointment']),
  m('beauty.devices','/beauty/devices','Tools + Devices','life','room','/beauty','beauty-devices','beauty-studio','structured',['device','tool']),
  m('beauty.inventory','/beauty/inventory','Beauty Inventory','life','room','/beauty','beauty-inventory','inventory-room','structured',['product','device','tool']),
  m('beauty.progress','/beauty/progress','Beauty Progress','life','room','/beauty','beauty-progress','history-room','structured',['history','routine','product']),
  m('beauty.experiments','/beauty/experiments','Beauty Experiments','life','room','/beauty','beauty-experiments','beauty-studio','structured',['experiment']),
  m('beauty.safety','/beauty/safety','Safety Gate','life','experience','/beauty','beauty-safety','beauty-studio','protected',['product','ingredient','routine']),
  m('beauty.hair','/hair','Hair','life','studio','/beauty','hair','hair-studio','open',['product','routine','style']),

  m('brain.world','/brain','Brain','brain','world',null,'brain','knowledge-world','open',['note','memory','connection']),
  m('brain.dump','/brain/dump','Brain Dump','brain','studio','/brain','capture','dashboard-descendant','open',['capture','note','task','event','goal','project']),
  m('brain.notes','/notes','Notes','brain','room','/brain','notes','knowledge-room','structured',['note']),
  m('brain.memory','/memory','Memory','brain','room','/brain','memory','knowledge-room','open',['memory']),
  m('brain.timeline','/timeline','Timeline','brain','room','/brain','timeline','history-room','open',['history']),
  m('brain.connections','/connections','Brain Graph','brain','room','/brain','connections','knowledge-room','open',['relationship']),
  m('brain.observations','/observations','Insights','brain','room','/brain','observations','knowledge-room','open',['observation','insight']),

  m('create.world','/create','Create','create','world',null,'create','creation-world','open',['creation']),
  m('create.capture','/inbox','Capture','create','room','/create','capture','creation-room','structured',['capture','note','task']),
  m('create.import','/import','Import','create','room','/create','import','creation-room','structured',['source','document']),
  m('create.projects','/creative-projects','Creative Projects','create','room','/create','projects','creation-room','structured',['project','creation']),
  m('create.resources','/resources','Media Library','create','room','/create','resources','creation-room','structured',['resource','reference']),

  m('global.search','/search','Search','brain','overlay',null,'search','universal-lens','open',['glow-object'],'global'),
  m('global.ask-glow','/ask-glow','Ask Glow','brain','overlay',null,'ask-glow','universal-intelligence','open',['glow-object','thread'],'global'),
  m('global.concierge','/concierge','Concierge','create','overlay',null,'concierge','situation-orchestration','open',['glow-object','request'],'global'),
  m('global.attention','/attention','Attention Center','today','overlay',null,'attention','attention-center','structured',['attention-item'],'global'),
  m('global.notifications','/notifications','Notifications','today','overlay',null,'notifications','notification-stream','structured',['notification'],'global'),
  m('global.settings','/settings','Settings','today','overlay',null,'settings','settings','structured',['setting'],'global'),
];

function normalize(path: string) { return (path.split('?')[0] || '/').replace(/\/$/,'') || '/'; }

function canonicalWorldForPath(pathname:string):GlowWorld{
  if(pathname.startsWith('/planning') || pathname.startsWith('/tasks') || pathname.startsWith('/calendar') || pathname.startsWith('/routines') || pathname.startsWith('/goals') || pathname.startsWith('/projects') || pathname.startsWith('/habits')) return 'plan';
  if(pathname.startsWith('/brain') || pathname.startsWith('/notes') || pathname.startsWith('/memory') || pathname.startsWith('/search') || pathname.startsWith('/ask-glow')) return 'brain';
  if(pathname.startsWith('/create') || pathname.startsWith('/concierge')) return 'create';
  if(pathname.startsWith('/settings') || pathname.startsWith('/attention') || pathname.startsWith('/notifications')) return 'today';
  return 'life';
}

function manifestFromCanonical(pathname:string):GlowPageManifest|null{
  const spec=canonicalExperienceFor(pathname);
  if(!spec) return null;
  const scope:GlowPageScope =
    pathname.startsWith('/search') || pathname.startsWith('/ask-glow') || pathname.startsWith('/concierge') ||
    pathname.startsWith('/attention') || pathname.startsWith('/notifications') || pathname.startsWith('/settings')
      ? 'global' : 'world';
  const level:GlowPageLevel =
    /Detail$/.test(spec.title) ? 'detail' :
    spec.enclosure === 'protected' ? 'experience' :
    scope === 'global' ? 'detail' : 'experience';
  return m(
    `canonical.${pathname.replace(/^\//,'').replace(/[^a-zA-Z0-9]+/g,'.') || 'root'}`,
    pathname,
    spec.title,
    canonicalWorldForPath(pathname),
    level,
    spec.parentHref || null,
    `canonical-${spec.climate}`,
    `canonical-${spec.climate}`,
    spec.enclosure,
    ['glow-object'],
    scope,
  );
}

export function pageManifestFor(path: string) {
  const pathname = normalize(path);
  if (/^\/tasks\/[^/]+$/.test(pathname)) {
    return m('plan.tasks.detail.runtime',pathname,'Task Detail','plan','detail','/tasks','planning','dashboard-descendant','structured',['task']);
  }
  const exact = GLOW_PAGE_MANIFESTS.find((item) => item.match === pathname);
  if (exact) return exact;
  const canonical = manifestFromCanonical(pathname);
  if (canonical) return canonical;
  return [...GLOW_PAGE_MANIFESTS].filter((item) => pathname.startsWith(`${item.match}/`)).sort((a,b) => b.match.length - a.match.length)[0] ?? null;
}

export function pageManifestChainFor(path: string) {
  const current = pageManifestFor(path);
  if (!current) return [];
  const chain: GlowPageManifest[] = [current];
  let parent = current.parent ? pageManifestFor(current.parent) : null;
  const seen = new Set([current.id]);
  while (parent && !seen.has(parent.id)) {
    seen.add(parent.id);
    chain.unshift(parent);
    parent = parent.parent ? pageManifestFor(parent.parent) : null;
  }
  return chain;
}

export function pageContractViolations(path: string) {
  const manifest = pageManifestFor(path);
  if (!manifest) return [`UNREGISTERED_PAGE:${normalize(path)}`];
  const missing = REQUIRED_SYNC_DIMENSIONS.filter((item) => !manifest.sync.includes(item));
  return [...missing.map((item) => `MISSING_SYNC:${item}`), ...(manifest.preservesReturnContext ? [] : ['RETURN_CONTEXT_DISABLED'])];
}
