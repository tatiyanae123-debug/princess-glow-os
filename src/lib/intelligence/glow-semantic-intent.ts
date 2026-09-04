import 'server-only';

import { requestGlowModel } from '@/lib/intelligence/glow-model-client';
import type { GlowResponseForm, GlowRisk } from '@/lib/intelligence/glow-operating-model';

export type GlowSemanticAction = {
  sourceText: string;
  type: 'task' | 'reminder' | 'note' | 'calendar' | 'schedule' | 'project' | 'goal' | 'routine' | 'other';
  title: string;
  destinations: string[];
  confidence: number;
};

export type GlowSemanticIntent = {
  mode: 'answer' | 'action' | 'mixed' | 'clarify';
  responseForm: GlowResponseForm;
  risk: GlowRisk;
  clarification?: string;
  actions: GlowSemanticAction[];
};

type Input = {
  text: string;
  sourceRoute: string;
  world: string;
  selectedContext: string;
  history: Array<{ role?: string; text?: string }>;
};

function parseIntent(text: string): GlowSemanticIntent | null {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try {
    const value = JSON.parse(cleaned) as Record<string, unknown>;
    const mode = value.mode;
    const responseForm = value.responseForm;
    const risk = value.risk;
    if (!['answer', 'action', 'mixed', 'clarify'].includes(String(mode))) return null;
    if (!['conversation', 'guide', 'plan', 'search', 'visual'].includes(String(responseForm))) return null;
    if (!['read', 'low', 'medium', 'high'].includes(String(risk))) return null;

    const actions = Array.isArray(value.actions)
      ? value.actions.flatMap((raw) => {
          if (!raw || typeof raw !== 'object') return [];
          const action = raw as Record<string, unknown>;
          const type = String(action.type ?? 'other');
          const allowedType = ['task', 'reminder', 'note', 'calendar', 'schedule', 'project', 'goal', 'routine', 'other'].includes(type)
            ? type as GlowSemanticAction['type']
            : 'other';
          const sourceText = String(action.sourceText ?? '').trim();
          const title = String(action.title ?? sourceText).trim().slice(0, 255);
          if (!sourceText || !title) return [];
          return [{
            sourceText,
            type: allowedType,
            title,
            destinations: Array.isArray(action.destinations)
              ? action.destinations.filter((item): item is string => typeof item === 'string').slice(0, 8)
              : [],
            confidence: typeof action.confidence === 'number'
              ? Math.max(0, Math.min(1, action.confidence))
              : 0.75,
          }];
        })
      : [];

    return {
      mode: mode as GlowSemanticIntent['mode'],
      responseForm: responseForm as GlowResponseForm,
      risk: risk as GlowRisk,
      clarification: typeof value.clarification === 'string' ? value.clarification.slice(0, 500) : undefined,
      actions,
    };
  } catch {
    return null;
  }
}

export async function interpretGlowUtterance(input: Input): Promise<GlowSemanticIntent | null> {
  const history = input.history
    .slice(-12)
    .map((turn) => `${turn.role === 'user' ? 'User' : 'Glow'}: ${String(turn.text ?? '').slice(0, 700)}`)
    .join('\n');

  const prompt = `You are Glow's semantic intent interpreter. Your job is to understand what the user MEANS before any command routing happens.

The user is allowed to talk like a person. They may ramble, pause, self-correct, use fragments, imply intent, use pronouns, or never say words like task/reminder/note. Do not require command syntax.

Examples of natural intent:
- "I need to call her tomorrow" can imply a task.
- "Don't let me forget my appointment paperwork" can imply a reminder.
- "I was supposed to wash my hair before Friday" can imply an action plus timing context.
- "Put this somewhere I'll remember it" can imply saving the selected content, but clarify if the destination or object cannot be safely resolved.
- "There's no way all of this fits today, can you help?" is usually planning/guidance first, not an automatic mutation.
- "Do that later" can be a change request only if "that" resolves from selected context or recent conversation; otherwise clarify.
- "I'm thinking about learning French" is a thought, not automatically a task or goal.
- "Can you tell me what I should do next?" is read-only guidance, not a write.

CONTEXT
Current route: ${input.sourceRoute}
Current world: ${input.world}
Selected context: ${input.selectedContext || 'none'}
Recent conversation:
${history || 'none'}

RULES
1. Infer the user's underlying goal, not just keywords.
2. Resolve pronouns from selected context first, then current room, then recent conversation. If a consequential action remains ambiguous, choose mode "clarify" and ask ONE concise question.
3. Separate a ramble into multiple actions only when the user actually expresses multiple commitments/requests.
4. Never turn a casual thought, feeling, preference, or hypothetical into a persistent action unless the user expresses intent to save/act on it.
5. Read-only questions, explanations, planning discussion, search and guidance use risk "read" unless the user explicitly or implicitly asks Glow to persist/change something.
6. Persistent creation is usually risk "low". Moving/editing/replanning existing information is usually "medium". Deleting, paying, transferring, external sending, or destructive/broad actions are "high".
7. Persistent changes always require approval later. Your job is interpretation, not execution.
8. Use responseForm conversation, guide, plan, search, or visual according to what would help most.
9. For each actual persistent action, return a short clean title and the exact sourceText from the user's utterance that expresses it. Use destinations that fit Glow OS.
10. If the user asks for something unsupported, still understand it correctly; mark it as type "other" rather than pretending it is executable.

Return ONLY JSON:
{"mode":"answer|action|mixed|clarify","responseForm":"conversation|guide|plan|search|visual","risk":"read|low|medium|high","clarification":"optional one question","actions":[{"sourceText":"exact relevant phrase","type":"task|reminder|note|calendar|schedule|project|goal|routine|other","title":"clean human title","destinations":["Tasks"],"confidence":0.0}]}

User: ${input.text}`;

  try {
    const response = await requestGlowModel({
      content: [{ type: 'input_text', text: prompt }],
      maxOutputTokens: 900,
    });
    return parseIntent(response);
  } catch {
    return null;
  }
}
