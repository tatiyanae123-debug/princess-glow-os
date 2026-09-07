import type { GlowWorld } from '@/lib/intelligence/glow-operating-model';

export type GlowRoomManifest = {
  world: GlowWorld;
  lens: string;
  objectDomains: string[];
  specialists: string[];
  predictions: string[];
  simulations: string[];
  executions: string[];
  learnings: string[];
  crossDomainEffects: string[];
  history: string[];
};

type Rule = { test: RegExp; manifest: GlowRoomManifest };

function manifest(input: GlowRoomManifest): GlowRoomManifest {
  return input;
}

const rules: Rule[] = [
  {
    test: /^\/today(?:\/|$)/,
    manifest: manifest({
      world: 'Today', lens: 'Now projection of Current Reality',
      objectDomains: ['task', 'calendar-event', 'reminder', 'routine', 'habit', 'appointment', 'project', 'wellness-signal', 'resource'],
      specialists: ['Planning', 'Routine', 'Wellness', 'Attention'],
      predictions: ['overload', 'hidden-preparation', 'next-action', 'deadline-risk'],
      simulations: ['next-hour', 'rebalanced-day', 'low-energy-day'],
      executions: ['complete', 'reschedule', 'capture', 'start', 'prepare'],
      learnings: ['planned-vs-actual', 'energy-windows', 'transition-friction'],
      crossDomainEffects: ['time', 'energy', 'attention', 'preparation', 'spending'],
      history: ['today-changes', 'completed-work', 'moved-work', 'decision-reasons'],
    }),
  },
  {
    test: /^\/(planning|calendar|tasks|goals|projects|reminders|routines|habits|tomorrow|focus)(?:\/|$)/,
    manifest: manifest({
      world: 'Plan', lens: 'Time, dependencies and possible futures',
      objectDomains: ['task', 'calendar-event', 'reminder', 'routine', 'habit', 'goal', 'project', 'appointment', 'planning-period', 'planning-block'],
      specialists: ['Planning', 'Goals', 'Projects', 'Routine', 'Attention'],
      predictions: ['conflict', 'overload', 'deadline-risk', 'missing-next-action', 'routine-break-risk'],
      simulations: ['current-reality', 'proposed-reality', 'if-i-do-x', 'if-i-do-not-do-x', 'best-balanced-option'],
      executions: ['schedule', 'reschedule', 'complete', 'start', 'accept-scenario', 'create-task', 'create-reminder'],
      learnings: ['duration', 'reschedule-pattern', 'capacity', 'preparation-time'],
      crossDomainEffects: ['time', 'energy', 'travel', 'preparation', 'goals', 'spending', 'recovery'],
      history: ['versions', 'scenario-decisions', 'receipts', 'planned-vs-actual'],
    }),
  },
  {
    test: /^\/(world|life|beauty|hair|fitness|wellness|food|home|closet|finance|money|work|resources|maintenance|ritual)(?:\/|$)/,
    manifest: manifest({
      world: 'Life', lens: 'Systems, resources and environments supporting life',
      objectDomains: ['product', 'beauty-item', 'clothing', 'finance', 'wellness-signal', 'resource', 'appointment', 'place', 'routine', 'fitness-session', 'hair-log', 'medication', 'supplement', 'work-schedule', 'maintenance-forecast'],
      specialists: ['Beauty', 'Hair', 'Fitness', 'Wellness', 'Nutrition', 'Closet', 'Home', 'Money', 'Work', 'Maintenance'],
      predictions: ['depletion', 'maintenance-due', 'budget-effect', 'recovery-need', 'duplicate-purchase'],
      simulations: ['routine-change', 'purchase-impact', 'recovery-plan', 'maintenance-shift'],
      executions: ['log', 'update-state', 'prepare', 'add-resource', 'create-task', 'schedule'],
      learnings: ['usage', 'preference', 'response', 'cost-pattern', 'maintenance-cycle'],
      crossDomainEffects: ['time', 'money', 'inventory', 'routine', 'energy', 'calendar', 'goals'],
      history: ['state-history', 'usage-history', 'purchase-history', 'maintenance-history', 'receipts'],
    }),
  },
  {
    test: /^\/(brain|notes|memory|timeline|graph|observations|briefings|rules|connections)(?:\/|$)/,
    manifest: manifest({
      world: 'Brain', lens: 'Memory, provenance, meaning and connection',
      objectDomains: ['note', 'memory', 'observation', 'timeline-event', 'relationship', 'rule', 'document', 'decision', 'resource'],
      specialists: ['Memory', 'Provenance', 'Learning', 'Decision', 'Connections'],
      predictions: ['contradiction', 'stale-truth', 'missing-link', 'repeated-pattern'],
      simulations: ['decision-comparison', 'future-self', 'pattern-change'],
      executions: ['capture', 'link', 'correct', 'supersede', 'pin', 'archive'],
      learnings: ['preference', 'pattern', 'decision-outcome', 'correction'],
      crossDomainEffects: ['all-domains'],
      history: ['full-object-history', 'source-history', 'corrections', 'superseded-truth', 'receipts'],
    }),
  },
  {
    test: /^\/(ask-glow|create|inbox|intake|import|gmail|search)(?:\/|$)/,
    manifest: manifest({
      world: 'Create', lens: 'Transformation, intake and creation',
      objectDomains: ['document', 'note', 'task', 'project', 'resource', 'intake-artifact', 'message', 'creation'],
      specialists: ['Intent', 'Intake', 'Creative', 'Planning', 'Memory', 'Search'],
      predictions: ['destination', 'duplicate', 'follow-up', 'missing-context'],
      simulations: ['draft', 'organization-options', 'creation-variants'],
      executions: ['capture', 'route', 'create-task', 'create-note', 'create-reminder', 'generate', 'organize'],
      learnings: ['routing-preference', 'creation-preference', 'source-pattern'],
      crossDomainEffects: ['tasks', 'projects', 'calendar', 'brain', 'life'],
      history: ['source-provenance', 'creation-history', 'routing-history', 'receipts'],
    }),
  },
  {
    test: /^\/(dashboard|concierge|notices)(?:\/|$)/,
    manifest: manifest({
      world: 'Today', lens: 'Cross-system attention and coordination',
      objectDomains: ['task', 'calendar-event', 'goal', 'project', 'notice', 'observation', 'scenario'],
      specialists: ['Attention', 'Planning', 'Prediction', 'Decision'],
      predictions: ['priority', 'conflict', 'overload', 'next-action'],
      simulations: ['best-balanced-option'],
      executions: ['propose', 'accept-scenario', 'snooze', 'complete'],
      learnings: ['attention-pattern', 'decision-outcome'],
      crossDomainEffects: ['all-domains'],
      history: ['receipts', 'scenario-decisions', 'notices'],
    }),
  },
];

const fallback = manifest({
  world: 'Life', lens: 'Context-aware projection of the shared Life Model',
  objectDomains: ['other'],
  specialists: ['Context', 'Intent'],
  predictions: ['relevant-next-step'],
  simulations: ['proposed-reality'],
  executions: ['capture', 'open'],
  learnings: ['context-use'],
  crossDomainEffects: ['all-domains'],
  history: ['versions', 'provenance', 'receipts'],
});

export function glowRoomManifestForRoute(pathname: string): GlowRoomManifest {
  const path = pathname || '/today';
  return rules.find((rule) => rule.test.test(path))?.manifest ?? fallback;
}
