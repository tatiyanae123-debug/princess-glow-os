export type GlowWorld = 'today' | 'plan' | 'life' | 'brain' | 'create';

export type RoomExperience = {
  room: string;
  world: GlowWorld;
  climate: string;
  physics: string;
  intelligence: string;
  primaryQuestion: string;
  completion: string;
};

const experience = (
  room: string,
  world: GlowWorld,
  climate: string,
  physics: string,
  intelligence: string,
  primaryQuestion: string,
  completion: string,
): RoomExperience => ({ room, world, climate, physics, intelligence, primaryQuestion, completion });

export function roomExperienceFor(pathname: string): RoomExperience {
  if (pathname.startsWith('/beauty/facial-massage')) return experience('gua-sha-studio', 'life', 'mint-water-pearl', 'guided-glide', 'saved-routine-and-tool-context', 'What facial movement am I doing now?', 'soft-release');
  if (pathname.startsWith('/beauty/lab')) return experience('makeup-studio', 'life', 'reflective-blush-pearl', 'mirror-refraction', 'placement-and-sequencing', 'How do I create the look I need?', 'look-settles-into-memory');
  if (pathname.startsWith('/beauty')) return experience('beauty-command', 'life', 'warm-pearl-reflection', 'orchestrated-layers', 'ready-state-orchestration', 'How do I get completely ready?', 'final-look-warm-light');
  if (pathname.startsWith('/hair')) return experience('hair-studio', 'life', 'silk-pearl', 'directional-flow', 'sequence-and-maintenance', 'What does my hair need now?', 'style-settles');
  if (pathname.startsWith('/wellness') || pathname.startsWith('/maintenance')) return experience('wellness', 'life', 'restorative-pearl', 'slow-breath', 'supportive-restoration', 'What would support me right now?', 'soft-release');
  if (pathname.startsWith('/fitness')) return experience('fitness', 'life', 'grounded-silver-pearl', 'rhythmic-momentum', 'guided-execution', 'What movement am I doing now?', 'residual-strength-light');
  if (pathname.startsWith('/food')) return experience('food', 'life', 'warm-ivory-kitchen', 'practical-flow', 'use-and-preparation', 'What do I need to eat, make, or use?', 'dish-becomes-memory');
  if (pathname.startsWith('/closet')) return experience('closet', 'life', 'textile-pearl', 'rail-and-layer', 'outfit-context', 'What should I wear?', 'outfit-composes');
  if (pathname.startsWith('/home')) return experience('home', 'life', 'stone-and-daylight', 'place-navigation', 'spatial-organization', 'What does this place need?', 'space-settles');
  if (pathname.startsWith('/life') || pathname.startsWith('/world') || pathname.startsWith('/life-world')) return experience('life', 'life', 'lived-daylight', 'thresholds-and-rooms', 'domain-orchestration', 'Which part of life needs me?', 'room-glows-quietly');
  if (pathname.startsWith('/finance')) return experience('money', 'life', 'cool-mint-ivory', 'still-ledger', 'exact-and-restrained', 'What is true about my money?', 'number-resolves');

  if (pathname.startsWith('/calendar')) return experience('time-observatory', 'plan', 'lavender-time-haze', 'orbital-time', 'conflict-and-preparation', 'Where does this belong in time?', 'time-slot-seals');
  if (pathname.startsWith('/planning') || pathname.startsWith('/tomorrow')) return experience('plan', 'plan', 'champagne-lavender-horizon', 'spatial-time', 'simulation-before-approval', 'What should the future look like?', 'approved-path-illuminates');
  if (pathname.startsWith('/tasks') || pathname.startsWith('/reminders')) return experience('readiness', 'plan', 'ivory-rose', 'readiness-gravity', 'next-action', 'What is ready to move?', 'object-travels-to-done');
  if (pathname.startsWith('/routines') || pathname.startsWith('/habits')) return experience('rhythm', 'plan', 'soft-sage-pearl', 'cyclical-rhythm', 'adaptive-routine', 'What rhythm supports today?', 'cycle-closes-softly');
  if (pathname.startsWith('/goals') || pathname.startsWith('/projects')) return experience('horizon', 'plan', 'distant-champagne', 'landmark-horizon', 'progress-and-preparation', 'What am I moving toward?', 'horizon-clarifies');

  if (pathname.startsWith('/memory')) return experience('memory', 'brain', 'cinematic-amber-pearl', 'depth-and-resurfacing', 'contextual-recall', 'What do I want to remember?', 'memory-recedes-gently');
  if (pathname.startsWith('/timeline')) return experience('timeline', 'brain', 'river-pearl', 'temporal-river', 'history-vs-possibility', 'How did this unfold?', 'moment-joins-river');
  if (pathname.startsWith('/notes') || pathname.startsWith('/resources')) return experience('notes', 'brain', 'paper-pearl', 'quiet-desk', 'edge-assistance', 'What do I want to think through?', 'ink-settles');
  if (pathname.startsWith('/connections')) return experience('brain-graph', 'brain', 'deep-violet-pearl', 'relational-depth', 'evidence-linked-connections', 'How are these things related?', 'connection-stabilizes');
  if (pathname.startsWith('/observations')) return experience('insights', 'brain', 'observatory-pearl', 'evidence-constellation', 'evidence-thresholds', 'Is there enough evidence for a pattern?', 'insight-forms-only-when-supported');
  if (pathname.startsWith('/brain') || pathname.startsWith('/rules') || pathname.startsWith('/briefings')) return experience('brain', 'brain', 'deep-pearl-atmosphere', 'conceptual-depth', 'knowledge-and-context', 'What do I know, notice, or need to understand?', 'meaning-settles');

  if (pathname.startsWith('/import')) return experience('import', 'create', 'clear-prismatic-pearl', 'source-to-meaning', 'provenance-and-approval', 'What is this source actually saying?', 'approved-object-travels-home');
  if (pathname.startsWith('/inbox') || pathname.startsWith('/intake')) return experience('capture', 'create', 'mist-pearl', 'mist-to-structure', 'classify-after-capture', 'What is trying to become real?', 'object-finds-destination');
  if (pathname.startsWith('/concierge')) return experience('concierge', 'create', 'champagne-command-light', 'situation-orchestration', 'multi-domain-coordination', 'What situation are we orchestrating?', 'plan-remains-one-living-situation');

  if (pathname.startsWith('/settings')) return experience('settings', 'today', 'neutral-pearl', 'minimal-motion', 'explicit-control', 'How should Glow behave?', 'setting-confirms-with-receipt');
  if (pathname.startsWith('/gmail')) return experience('communications', 'life', 'quiet-ivory', 'thread-flow', 'contextual-follow-up', 'What needs a response?', 'thread-releases');

  return experience('today', 'today', 'living-ivory-pearl', 'temporal-depth', 'present-moment-guidance', 'What matters now?', 'warm-residual-light');
}
