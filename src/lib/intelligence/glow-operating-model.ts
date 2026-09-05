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
export type GlowTruthState = 'suggestion' | 'proposed' | 'confirmed' | 'completed' | 'unavailable';

export const GLOW_IDENTITY = 'Glow' as const;
export const GLOW_OS_IDENTITY = 'Glow OS' as const;
export const GLOW_CORE_PRINCIPLE = 'Glow is the living intelligence of Glow OS made visible.' as const;
export const GLOW_PHILOSOPHY = 'Glow is a calm place that knows the shape of a life.' as const;
export const GLOW_TRANSFORMATION_LOOP = 'mist → structure → action → memory → understanding' as const;
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

export const GLOW_LEARNING_LOOP = [
  'capture without friction',
  'understand intent',
  'identify relevant life areas',
  'add time, place, energy, people, and dependencies',
  'place information correctly',
  'surface it when useful',
  'guide action',
  'remember the result',
  'learn carefully from patterns',
] as const;

export const GLOW_REFERENCE_RESOLUTION_ORDER = [
  'selected object',
  'current page and Glow world',
  'recent conversation',
  'active focus, task, project, and available room context',
] as const;

export const GLOW_ACTION_TRUTH_STATES: GlowTruthState[] = [
  'suggestion',
  'proposed',
  'confirmed',
  'completed',
  'unavailable',
];

export const GLOW_LEARNING_DOMAINS = [
  'time and real task duration',
  'mental and physical energy windows',
  'capacity and day mode',
  'routines and routine variants',
  'behavioral friction and preparation gaps',
  'patterns across work, rest, joy, and completion',
  'taste and recommendation preferences',
  'decisions and superseded decisions',
  'memories, notes, observations, and connections',
  'planned versus actual outcomes',
  'attention load and overload risk',
  'dependencies, transitions, travel, and hidden preparation',
] as const;

export const GLOW_MEMORY_GUARDRAILS = [
  'structured records are stronger than raw chat history',
  'memory must be inspectable, editable, and deletable where supported',
  'inferences are not unquestionable facts',
  'source, time, confidence, edits, and contradictions should remain distinguishable',
  'old information must not silently replace current truth',
  'thoughts do not automatically become tasks or goals',
  'behavior must not be used to diagnose the user',
  'Glow learns without taking ownership of the user',
] as const;

export const GLOW_CAPABILITY_REGISTRY = [
  'Ask Glow',
  'Natural Language Intent Understanding',
  'Rambling and Brain-Dump Understanding',
  'Contextual Pronoun Resolution',
  'Voice Conversation',
  'Multimodal Conversation',
  'Photo and Image Understanding',
  'Video Understanding',
  'Audio and Voice Note Understanding',
  'Multi-File Context',
  'Paste and Drag-Drop Capture',
  'Native Image Generation',
  'Conversational Image Editing',
  'Cross-Modal Creation',
  'Inline Generated Artifacts',
  'Reference-Aware Creation',
  'Universal Capture',
  'Speak It Once, Place It Correctly',
  'What Should I Do Now',
  'Adaptive Day Builder',
  'Intelligent Schedule Replanning',
  'Planning-With-Me',
  'Routine Conductor',
  'Attention Center',
  'Morning Brief',
  'Evening Debrief',
  'Weekly Debrief',
  'Monthly Debrief',
  'Notes Intelligence',
  'Notes Web',
  'Memory',
  'Memory Web',
  'Timeline',
  'Observations',
  'Insights',
  'Brain Graph',
  'Connections',
  'Thought Garden',
  'Decision Archive',
  'Personal Taste Profile',
  'Life Continuity Engine',
  'Graceful Restart',
  'Friction Detective',
  'Personal Pattern Cinema',
  'Personal Energy Budget',
  'Future-Self Planning',
  'Confidence-Calibrated Intelligence',
  'Temporal Truth Layer',
  'Context Capsule',
  'Preparation Autocomplete',
  'Invisible Preparation Layer',
  'Choice Compression',
  'Recovery and Overload Awareness',
  'Source Lens',
  'Provenance and Evidence Memory',
  'Contradiction Detection',
  'Canonical Record Intelligence',
  'Screen-Aware Assistance',
  'Conversation-to-World Structuring',
  'Action Previews',
  'Action Receipts',
  'Undo and History',
  'Capacity-Aware Intelligence',
  'Persistent Conversation Across Glow Worlds',
] as const;

export function glowWorldForRoute(pathname: string): GlowWorld {
  if (pathname === '/today') return 'Today';
  if (/^\/(calendar|planning|tasks|goals|projects|reminders|routines|habits|tomorrow)(\/|$)/.test(pathname)) return 'Plan';
  if (/^\/(brain|notes|memory|timeline|graph|observations)(\/|$)/.test(pathname)) return 'Brain';
  if (/^\/(inbox|import|gmail|create|ask-glow)(\/|$)/.test(pathname)) return 'Create';
  return 'Life';
}

export function glowRoleForRoute(pathname: string) {
  if (pathname === '/ask-glow') return 'open multimodal conversation and creation partner';
  if (pathname === '/today') return 'attentive present-moment guide';
  if (/^\/(calendar|planning)(\/|$)/.test(pathname)) return 'precise time architect';
  if (/^\/(tasks|goals|projects|reminders|routines|habits)(\/|$)/.test(pathname)) return 'readiness and execution guide';
  if (/^\/(notes|brain|memory|timeline|graph|observations)(\/|$)/.test(pathname)) return 'lantern for memory, meaning, and connection';
  if (/^\/(beauty|hair)(\/|$)/.test(pathname)) return 'reflective preparation and routine guide';
  if (/^\/(fitness|wellness)(\/|$)/.test(pathname)) return 'grounded body and recovery guide';
  if (/^\/(food)(\/|$)/.test(pathname)) return 'practical nourishment and preparation guide';
  if (/^\/(finance|money)(\/|$)/.test(pathname)) return 'quiet financial clarity guide';
  if (/^\/(work)(\/|$)/.test(pathname)) return 'practical professional context guide';
  if (/^\/(inbox|import|gmail|create)(\/|$)/.test(pathname)) return 'open transformation and organization partner';
  return 'context-aware life guide';
}

export function glowPromptsForRoute(pathname: string): string[] {
  if (pathname === '/ask-glow') return ['Tell me what is on your mind', 'Attach something for me to understand', 'Create a visual with me'];
  if (pathname === '/today') return ['What should I do next?', 'Plan my next hour', 'What can wait today?'];
  if (/^\/(calendar|planning)(\/|$)/.test(pathname)) return ['Find conflicts', 'Show hidden preparation', 'Plan this with me'];
  if (/^\/(tasks)(\/|$)/.test(pathname)) return ['What is ready now?', 'What is blocked?', 'Make this realistic today'];
  if (/^\/(goals|projects)(\/|$)/.test(pathname)) return ['What is the next real action?', 'Show blockers', 'Connect this to my week'];
  if (/^\/(routines|habits)(\/|$)/.test(pathname)) return ['Guide me step by step', 'Use the quick version', 'Help me restart gently'];
  if (/^\/(notes|brain|memory|timeline|graph|observations)(\/|$)/.test(pathname)) return ['Find a previous note', 'Show related ideas', 'What pattern matters here?'];
  if (/^\/(beauty|hair|fitness|food|wellness|home)(\/|$)/.test(pathname)) return ['Guide me step by step', 'What comes next?', 'Make this easier today'];
  if (/^\/(finance|money)(\/|$)/.test(pathname)) return ['What needs attention?', 'Explain why this matters', 'Show the clearest next step'];
  if (/^\/(work)(\/|$)/.test(pathname)) return ['What should I prepare?', 'What is my next commitment?', 'Help me organize this'];
  if (/^\/(inbox|import|gmail|create)(\/|$)/.test(pathname)) return ['Organize this', 'Turn this into structure', 'Where should this go?'];
  return ['What matters here?', 'What should happen next?', 'Help me with this'];
}

export function glowResponseFormFor(text: string): GlowResponseForm {
  const value = text.toLowerCase();
  if (/\b(image|picture|photo|illustration|visual card|visual cards|mood board|moodboard|visual|diagram|face map|map|wallpaper)\b/.test(value)) return 'visual';
  if (/\b(step by step|guide me|talk me through|routine|walk me through|conductor|show me how)\b/.test(value)) return 'guide';
  if (/\b(plan|replan|fix the rest|schedule|scenario|reorganize|rearrange|compare choices|next hour|fit this|make this work|too much today)\b/.test(value)) return 'plan';
  if (/\b(find|search|show me|pull up|where is|previous note|look for|remember where)\b/.test(value)) return 'search';
  return 'conversation';
}

export function isVisualCreationRequest(text: string) {
  const value = text.toLowerCase();
  return /\b(create|make|build|turn|convert|render|generate|draw|design)\b/.test(value)
    && /\b(image|picture|photo|illustration|visual|visual card|visual cards|mood board|moodboard|diagram|map|wallpaper)\b/.test(value);
}

export function glowRiskForText(text: string): GlowRisk {
  const value = text.toLowerCase();
  if (/\b(delete|erase|remove all|cancel|pay|purchase|transfer|send email|external account|clear all|archive all)\b/.test(value)) return 'high';
  if (/\b(move|reschedule|change|edit|update|replace|reorganize|rearrange|replan|fix the rest|all unfinished|push that|shift that|do that later|make room for|move that)\b/.test(value)) return 'medium';
  if (isVisualCreationRequest(text)) return 'read';
  if (/\b(add|create|save|file|log|remind|schedule|make a task|make a note|don't let me forget|do not let me forget|write this down|keep this|put this somewhere|make sure i)\b/.test(value)) return 'low';
  if (/\b(i need to|i have to|i was supposed to|i should probably|i should |need to |have to )\b/.test(value)) return 'low';
  return 'read';
}

export function glowNeedsNoteContext(pathname: string, text: string) {
  return /^\/(notes|brain|memory|timeline|graph|observations)(\/|$)/.test(pathname)
    || /\b(note|notes|memory|memories|idea|ideas|thought|thoughts|insight|previous|decision|pattern|connection|remember|that thing|this thing)\b/i.test(text);
}
