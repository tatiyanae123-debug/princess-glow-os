import type { GuaShaSavedStep } from '@/lib/beauty/gua-sha-studio-data';

export type GuaShaStudioView = 'today' | 'guided' | 'morning' | 'midday' | 'night';
export type GuaShaZone = 'Jaw' | 'Cheeks' | 'Eyes' | 'Forehead' | 'Neck';
export type GuaShaPressure = 'Light' | 'Medium' | 'Firm';

export type GuaShaMovementStep = {
  id: string;
  name: string;
  subtitle: string;
  zone: GuaShaZone;
  pressure: GuaShaPressure;
  seconds: number;
  repetitions: number;
  startPoint: string;
  endPoint: string;
  toolEdge: string;
  source: 'saved' | 'glow-guidance';
  products: string[];
};

export const VIEW_META: Record<GuaShaStudioView, { eyebrow: string; title: string; subtitle: string; tip: string }> = {
  today: {
    eyebrow: 'GUA SHA STUDIO',
    title: 'GUA SHA TODAY',
    subtitle: 'What does my face need?',
    tip: 'Small steps create lasting change.',
  },
  guided: {
    eyebrow: 'GUA SHA STUDIO',
    title: 'Guided Facial Movement',
    subtitle: 'Sculpt · Release · Renew',
    tip: 'Keep strokes slow, intentional, and connected.',
  },
  morning: {
    eyebrow: 'GUA SHA STUDIO',
    title: 'MORNING LIGHT GUA SHA',
    subtitle: 'Wake + refresh',
    tip: 'Morning Gua Sha can be a gentle way to start the day with intention.',
  },
  midday: {
    eyebrow: 'GUA SHA STUDIO',
    title: 'MIDDAY MINI RESET',
    subtitle: '2–3 minute release',
    tip: 'Small resets can make a busy day feel less tense.',
  },
  night: {
    eyebrow: 'GUA SHA STUDIO',
    title: 'NIGHT FULL SCULPT',
    subtitle: 'Slow evening session',
    tip: 'Longer, slower strokes can make the ritual feel more restorative.',
  },
};

const GUIDED: GuaShaMovementStep[] = [
  { id:'guided-neck', name:'Neck release', subtitle:'Prepare the pathway', zone:'Neck', pressure:'Light', seconds:60, repetitions:4, startPoint:'Base of neck', endPoint:'Jawline', toolEdge:'Broad curved edge', source:'glow-guidance', products:[] },
  { id:'guided-cheek', name:'Cheek Lift', subtitle:'From nose to temple', zone:'Cheeks', pressure:'Light', seconds:60, repetitions:6, startPoint:'Side of nose', endPoint:'Temple', toolEdge:'Broad curved edge', source:'glow-guidance', products:[] },
  { id:'guided-jaw', name:'Jaw release', subtitle:'Glide toward the ear', zone:'Jaw', pressure:'Light', seconds:60, repetitions:6, startPoint:'Center of chin', endPoint:'Ear', toolEdge:'Notched edge', source:'glow-guidance', products:[] },
  { id:'guided-under-eye', name:'Under-eye refresh', subtitle:'Very gentle outward sweep', zone:'Eyes', pressure:'Light', seconds:45, repetitions:3, startPoint:'Inner under-eye', endPoint:'Temple', toolEdge:'Small curved edge', source:'glow-guidance', products:[] },
  { id:'guided-brow', name:'Brow release', subtitle:'Lift toward the hairline', zone:'Forehead', pressure:'Light', seconds:45, repetitions:4, startPoint:'Brow', endPoint:'Hairline', toolEdge:'Broad edge', source:'glow-guidance', products:[] },
  { id:'guided-temple', name:'Temple release', subtitle:'Slow circular release', zone:'Eyes', pressure:'Light', seconds:45, repetitions:4, startPoint:'Temple', endPoint:'Temple', toolEdge:'Rounded corner', source:'glow-guidance', products:[] },
  { id:'guided-close', name:'Finish down neck', subtitle:'Complete the flow', zone:'Neck', pressure:'Light', seconds:60, repetitions:4, startPoint:'Jawline', endPoint:'Collarbone', toolEdge:'Broad edge', source:'glow-guidance', products:[] },
];

const MORNING: GuaShaMovementStep[] = [
  { id:'morning-neck', name:'Neck release', subtitle:'Gentle downward movement', zone:'Neck', pressure:'Light', seconds:60, repetitions:3, startPoint:'Below jaw', endPoint:'Collarbone', toolEdge:'Broad curved edge', source:'glow-guidance', products:[] },
  { id:'morning-jaw', name:'Jawline lift', subtitle:'Outward to ear', zone:'Jaw', pressure:'Light', seconds:60, repetitions:3, startPoint:'Center of chin', endPoint:'Ear', toolEdge:'Notched edge', source:'glow-guidance', products:[] },
  { id:'morning-cheek', name:'Cheek sweep', subtitle:'Upward and outward', zone:'Cheeks', pressure:'Light', seconds:60, repetitions:3, startPoint:'Side of nose', endPoint:'Cheekbone toward ear', toolEdge:'Broad curved edge', source:'glow-guidance', products:[] },
  { id:'morning-eye', name:'Under-eye refresh', subtitle:'Very gentle sweep', zone:'Eyes', pressure:'Light', seconds:45, repetitions:3, startPoint:'Inner under-eye', endPoint:'Temple', toolEdge:'Small curved edge', source:'glow-guidance', products:[] },
  { id:'morning-pass', name:'Final facial pass', subtitle:'Smooth and lift', zone:'Forehead', pressure:'Light', seconds:60, repetitions:3, startPoint:'Center of face', endPoint:'Outward', toolEdge:'Broad edge', source:'glow-guidance', products:[] },
  { id:'morning-return', name:'Return down neck', subtitle:'Complete the flow', zone:'Neck', pressure:'Light', seconds:60, repetitions:3, startPoint:'Jawline', endPoint:'Collarbone', toolEdge:'Broad edge', source:'glow-guidance', products:[] },
];

const MIDDAY: GuaShaMovementStep[] = [
  { id:'midday-jaw', name:'Jaw release', subtitle:'From jaw to ear', zone:'Jaw', pressure:'Light', seconds:30, repetitions:3, startPoint:'Center of jaw', endPoint:'Ear', toolEdge:'Knuckles or broad edge', source:'glow-guidance', products:[] },
  { id:'midday-cheek', name:'Cheek sweep', subtitle:'From cheek to temple', zone:'Cheeks', pressure:'Light', seconds:30, repetitions:3, startPoint:'Mid cheek', endPoint:'Temple', toolEdge:'Knuckles or broad edge', source:'glow-guidance', products:[] },
  { id:'midday-neck', name:'Neck release', subtitle:'Down the neck', zone:'Neck', pressure:'Light', seconds:30, repetitions:3, startPoint:'Under jaw', endPoint:'Collarbone', toolEdge:'Hands or broad edge', source:'glow-guidance', products:[] },
];

const NIGHT: GuaShaMovementStep[] = [
  { id:'night-slip', name:'Apply sufficient slip', subtitle:'Prepare skin and hands', zone:'Cheeks', pressure:'Light', seconds:45, repetitions:1, startPoint:'Face', endPoint:'Even coverage', toolEdge:'Hands', source:'glow-guidance', products:[] },
  { id:'night-neck', name:'Neck passes', subtitle:'Slow and grounding', zone:'Neck', pressure:'Light', seconds:75, repetitions:4, startPoint:'Collarbone', endPoint:'Jawline', toolEdge:'Broad edge', source:'glow-guidance', products:[] },
  { id:'night-jaw', name:'Jawline sculpt', subtitle:'Lift and release', zone:'Jaw', pressure:'Light', seconds:75, repetitions:6, startPoint:'Center of chin', endPoint:'Ear', toolEdge:'Notched edge', source:'glow-guidance', products:[] },
  { id:'night-cheek', name:'Cheekbone sweep', subtitle:'Sculpt and de-puff', zone:'Cheeks', pressure:'Light', seconds:75, repetitions:6, startPoint:'Side of nose', endPoint:'Temple', toolEdge:'Broad curved edge', source:'glow-guidance', products:[] },
  { id:'night-eye', name:'Under-eye (very gentle)', subtitle:'Soften and smooth', zone:'Eyes', pressure:'Light', seconds:45, repetitions:3, startPoint:'Inner under-eye', endPoint:'Temple', toolEdge:'Small curved edge', source:'glow-guidance', products:[] },
  { id:'night-brow', name:'Brow release', subtitle:'Relax and unwind', zone:'Forehead', pressure:'Light', seconds:60, repetitions:4, startPoint:'Brow', endPoint:'Hairline', toolEdge:'Broad edge', source:'glow-guidance', products:[] },
  { id:'night-close', name:'Finish down neck', subtitle:'Drain and calm', zone:'Neck', pressure:'Light', seconds:75, repetitions:4, startPoint:'Jawline', endPoint:'Collarbone', toolEdge:'Broad edge', source:'glow-guidance', products:[] },
];

export const SYSTEM_STEPS: Record<Exclude<GuaShaStudioView, 'today'>, GuaShaMovementStep[]> = {
  guided: GUIDED,
  morning: MORNING,
  midday: MIDDAY,
  night: NIGHT,
};

function inferZone(text: string): GuaShaZone {
  const value = text.toLowerCase();
  if (/neck|collarbone/.test(value)) return 'Neck';
  if (/jaw|chin/.test(value)) return 'Jaw';
  if (/eye|temple/.test(value)) return 'Eyes';
  if (/forehead|brow/.test(value)) return 'Forehead';
  return 'Cheeks';
}

function inferPressure(text: string): GuaShaPressure {
  const value = text.toLowerCase();
  if (/firm/.test(value)) return 'Firm';
  if (/medium|moderate/.test(value)) return 'Medium';
  return 'Light';
}

function inferSeconds(text: string, fallback: number) {
  const seconds = text.match(/(\d{1,3})\s*(?:sec|secs|second|seconds)\b/i);
  if (seconds) return Math.max(15, Math.min(600, Number(seconds[1])));
  const minutes = text.match(/(\d{1,2})\s*(?:min|mins|minute|minutes)\b/i);
  if (minutes) return Math.max(30, Math.min(1200, Number(minutes[1]) * 60));
  return fallback;
}

function inferRepetitions(text: string, fallback: number) {
  const match = text.match(/(\d{1,2})\s*(?:reps|repetitions|passes|times)\b/i);
  return match ? Math.max(1, Math.min(20, Number(match[1]))) : fallback;
}

export function savedStepToMovement(step: GuaShaSavedStep, index: number, fallback: GuaShaMovementStep): GuaShaMovementStep {
  const text = `${step.name} ${step.notes ?? ''}`;
  return {
    id: step.id,
    name: step.name,
    subtitle: step.notes?.trim() || fallback.subtitle,
    zone: inferZone(text),
    pressure: inferPressure(text),
    seconds: inferSeconds(text, fallback.seconds),
    repetitions: inferRepetitions(text, fallback.repetitions),
    startPoint: fallback.startPoint,
    endPoint: fallback.endPoint,
    toolEdge: fallback.toolEdge,
    source: 'saved',
    products: step.products,
  };
}

export function selectSavedSteps(view: Exclude<GuaShaStudioView, 'today'>, saved: GuaShaSavedStep[]) {
  if (!saved.length) return SYSTEM_STEPS[view];
  const viewMatches = saved.filter((step) => {
    const text = `${step.name} ${step.notes ?? ''}`.toLowerCase();
    if (view === 'morning') return step.timeOfDay === 'morning' || /morning|am\b|wake|refresh/.test(text);
    if (view === 'midday') return step.timeOfDay === 'afternoon' || /midday|mini\s*reset|desk|afternoon/.test(text);
    if (view === 'night') return step.timeOfDay === 'night' || step.timeOfDay === 'evening' || /night|evening|pm\b|full\s*sculpt/.test(text);
    return true;
  });
  const source = viewMatches.length ? viewMatches : view === 'guided' ? saved : [];
  if (!source.length) return SYSTEM_STEPS[view];
  return source.map((step, index) => savedStepToMovement(step, index, SYSTEM_STEPS[view][Math.min(index, SYSTEM_STEPS[view].length - 1)]));
}
