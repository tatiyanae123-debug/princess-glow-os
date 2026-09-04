export type GlowWorld = 'Today' | 'Plan' | 'Life' | 'Brain' | 'Create';
export type GlowState =
  | 'resting'
  | 'waking'
  | 'listening'
  | 'understanding'
  | 'speaking'
  | 'creating'
  | 'awaiting-approval'
  | 'acting'
  | 'completing'
  | 'error';
export type GlowResponseForm = 'conversation' | 'guide' | 'plan' | 'search' | 'visual';
export type GlowRisk = 'read' | 'low' | 'medium' | 'high';

export const GLOW_IDENTITY = 'Glow' as const;
export const GLOW_OS_IDENTITY = 'Glow OS' as const;
export const VERIFIED_GLOW_EXECUTORS = ['task', 'reminder', 'note'] as const;

export const GLOW_STATE_SEQUENCE: GlowState[] = [
  'resting',
  'waking',
  'listening',
  'understanding',
  'speaking',
  'creating',
  'awaiting-approval',
  'acting',
  'completing',
  'error',
];

export function glowWorldForRoute(pathname: string): GlowWorld {
  if (pathname === '/today') return 'Today';
  if (/^\/(calendar|planning|tasks|goals|projects|reminders|routines|habits|tomorrow)(\/|$)/.test(pathname)) return 'Plan';
  if (/^\/(brain|notes|memory|timeline|graph|observations)(\/|$)/.test(pathname)) return 'Brain';
  if (/^\/(inbox|import|gmail|create)(\/|$)/.test(pathname)) return 'Create';
  return 'Life';
}

export function glowPromptsForRoute(pathname: string): string[] {
  if (pathname === '/today') return ['What should I do next?', 'Fix the rest of today', 'Move what can wait'];
  if (/^\/(calendar|planning)(\/|$)/.test(pathname)) return ['Find conflicts', 'Show my free time', 'Plan this with me'];
  if (/^\/(notes|brain|memory|timeline|graph|observations)(\/|$)/.test(pathname)) return ['Find a previous note', 'Show related ideas', 'Help me connect this'];
  if (/^\/(beauty|hair|fitness|food|wellness|home|finance|money|work)(\/|$)/.test(pathname)) return ['Guide me step by step', 'What comes next?', 'Make this easier today'];
  if (/^\/(inbox|import|gmail|create)(\/|$)/.test(pathname)) return ['Organize this', 'Turn this into tasks', 'Where should this go?'];
  return ['What can you help with here?', 'Show me what matters', 'Help me with this'];
}

export function glowResponseFormFor(text: string): GlowResponseForm {
  const value = text.toLowerCase();
  if (/\b(image|visual card|visual cards|mood board|visual|diagram)\b/.test(value)) return 'visual';
  if (/\b(step by step|guide me|talk me through|routine|walk me through)\b/.test(value)) return 'guide';
  if (/\b(plan|replan|fix the rest|schedule|scenario|reorganize|rearrange)\b/.test(value)) return 'plan';
  if (/\b(find|search|show me|pull up|where is|previous note|look for)\b/.test(value)) return 'search';
  return 'conversation';
}

export function isVisualCreationRequest(text: string) {
  const value = text.toLowerCase();
  return /\b(create|make|build|turn|convert|render|generate)\b/.test(value) && /\b(image|visual|visual card|visual cards|mood board|diagram)\b/.test(value);
}

export function glowRiskForText(text: string): GlowRisk {
  const value = text.toLowerCase();
  if (/\b(delete|erase|remove all|cancel|pay|purchase|transfer|send email|external account|clear all|archive all)\b/.test(value)) return 'high';
  if (/\b(move|reschedule|change|edit|update|replace|reorganize|rearrange|replan|fix the rest|everything|all unfinished)\b/.test(value)) return 'medium';
  if (isVisualCreationRequest(text)) return 'low';
  if (/\b(add|create|save|file|log|remind|schedule|make a task|make a note)\b/.test(value)) return 'low';
  return 'read';
}

export function glowNeedsNoteContext(pathname: string, text: string) {
  return /^\/(notes|brain|memory|timeline|graph|observations)(\/|$)/.test(pathname)
    || /\b(note|notes|memory|memories|idea|ideas|thought|thoughts|insight|previous)\b/i.test(text);
}

export const GLOW_REFERENCE_RESOLUTION_ORDER = [
  'selected object',
  'current page and Glow world',
  'recent conversation',
  'active focus, task, project, and available room context',
] as const;
