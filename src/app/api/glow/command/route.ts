import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createTask } from '@/lib/data/tasks';
import { createNote } from '@/lib/data/notes';
import { classifyUniversalInput, ingestText } from '@/lib/intelligence/universal-intake';
import { glowModelIsConfigured, requestGlowModel } from '@/lib/intelligence/glow-model-client';
import { interpretGlowUtterance, type GlowSemanticAction } from '@/lib/intelligence/glow-semantic-intent';
import {
  glowResponseFormFor,
  glowRiskForText,
  glowWorldForRoute,
  isVisualCreationRequest,
  GLOW_REFERENCE_RESOLUTION_ORDER,
  VERIFIED_GLOW_EXECUTORS,
  type GlowRisk,
} from '@/lib/intelligence/glow-operating-model';
import { getLivingKernelContext, kernelContextPrompt, type KernelSelectedContext } from '@/lib/intelligence/living-kernel';
import {
  canonicalGlowObjectId,
  createKernelScenario,
  decideKernelScenario,
  recordKernelReceipt,
} from '@/lib/intelligence/living-kernel-registry';
import { markLivingKernelDirty, syncLivingLifeModel } from '@/lib/intelligence/living-kernel-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

type HistoryTurn = { role?: string; text?: string };
type SelectedContext = { label?: string; type?: string; id?: string; route?: string; capturedAt?: number };
type Body = {
  text?: string;
  sourceRoute?: string;
  selectedContext?: string;
  approved?: boolean;
  scenarioId?: string;
  risk?: GlowRisk;
  history?: HistoryTurn[];
};
type PlannedAction = GlowSemanticAction & { executor: 'verified' | 'review-queue' };

const RISK_RANK: Record<GlowRisk, number> = { read: 0, low: 1, medium: 2, high: 3 };

function strongestRisk(a: GlowRisk, b: GlowRisk): GlowRisk {
  return RISK_RANK[a] >= RISK_RANK[b] ? a : b;
}

function splitClauses(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const parts = normalized.split(/(?:\s*;\s*|\s+then\s+|\s+also\s+)/i).map((part) => part.trim()).filter((part) => part.length > 2);
  return parts.length > 1 ? parts.slice(0, 8) : [normalized];
}

function parseSelectedContext(value: string): SelectedContext | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as SelectedContext;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return { label: value };
  }
}

function selectedContextLabel(context: SelectedContext | null) {
  if (!context?.label) return 'none';
  return [context.type, context.label, context.route ? `from ${context.route}` : null].filter(Boolean).join(' · ');
}

function cleanTaskTitle(text: string) {
  return text
    .replace(/^(?:please\s+)?(?:add|create|make)\s+(?:me\s+)?(?:a\s+)?(?:new\s+)?(?:task|reminder)\s*(?:to|for|:)?\s*/i, '')
    .replace(/^remind me to\s+/i, '')
    .replace(/^(?:i\s+)?(?:need|have|want)\s+to\s+/i, '')
    .replace(/^i\s+(?:should|was supposed to)\s+/i, '')
    .trim().slice(0, 255) || 'New task';
}

function cleanNoteTitle(text: string) {
  const cleaned = text.replace(/^(?:please\s+)?(?:save|create|make|file|keep|remember)\s+(?:this\s+)?(?:as\s+)?(?:a\s+)?(?:new\s+)?note\s*(?::)?\s*/i, '').trim();
  return (cleaned.split(/[.!?\n]/)[0] || 'New note').slice(0, 120);
}

function fallbackActions(text: string): PlannedAction[] {
  return splitClauses(text).map((clause) => {
    const classification = classifyUniversalInput({ text: clause });
    const type = ['task', 'reminder', 'note'].includes(classification.type) ? classification.type as GlowSemanticAction['type'] : 'other';
    return {
      sourceText: clause,
      type,
      title: classification.title,
      destinations: classification.destinations,
      confidence: classification.confidence,
      executor: type === 'task' || type === 'reminder' || type === 'note' ? 'verified' : 'review-queue',
    };
  });
}

function plannedActions(semanticActions: GlowSemanticAction[], text: string): PlannedAction[] {
  const base = semanticActions.length ? semanticActions : fallbackActions(text);
  return base.map((action) => ({
    ...action,
    executor: action.type === 'task' || action.type === 'reminder' || action.type === 'note' ? 'verified' : 'review-queue',
  }));
}

async function conversationalReply(input: {
  text: string;
  sourceRoute: string;
  selectedContext: SelectedContext | null;
  history: HistoryTurn[];
  userId: string;
}) {
  const context = await getLivingKernelContext({
    userId: input.userId,
    route: input.sourceRoute,
    selectedContext: input.selectedContext as KernelSelectedContext,
    text: input.text,
    maxObjects: 96,
  });

  const selected = context.selectedObject;
  const nextObjects = context.objects.slice(0, 4);
  if (!glowModelIsConfigured()) {
    if (selected) return `I’m using “${selected.title}” as the selected Glow Object in Current Reality. I can reason from its state, timing, relationships, history, and connected life systems.`;
    if (nextObjects.length) return `The clearest things in Current Reality are ${nextObjects.map((item) => `“${item.title}”`).join(', ')}. I can help decide what matters next or simulate a better arrangement without changing anything yet.`;
    return 'Tell me what is on your mind. I’ll reason from the shared Glow Life Model rather than treating this room as a separate app.';
  }

  const history = input.history.slice(-12).map((turn) => `${turn.role === 'user' ? 'User' : 'Glow'}: ${String(turn.text ?? '').slice(0, 700)}`).join('\n');
  const instructions = `You are Glow, the one persistent living intelligence inside Glow OS.

GOVERNING ARCHITECTURE
- The Life Model is the sole conceptual source of truth. Rooms are lenses, never independent data owners.
- Use the Glow Graph to reason across domains and cause/effect.
- Keep Current Reality separate from any proposed future. Never speak as though a draft scenario already happened.
- Preserve provenance, confidence, history, permissions and cross-domain effects.
- If the user asks what would happen, compare or plan hypothetically, simulate rather than mutate.
- Consequential changes follow understood → proposed → approved → executed → receipt.

CORE BEHAVIOR
- Understand natural rambling, fragments, pronouns, corrections and mixed requests.
- Infer intent from the whole utterance plus selected object, Life Model, graph, recent conversation and room lens.
- Do not turn thoughts, feelings or hypotheticals into tasks without action intent.
- Ask one concise clarification only when a consequential reference cannot be resolved safely.
- Explain useful causal links in plain language. Do not expose database or implementation details unless asked.

IDENTITY
- Glow OS is the operating system. Glow is its one shared intelligence. No room owns a separate assistant.

${kernelContextPrompt(context)}

Current route: ${input.sourceRoute}
Selected context label: ${selectedContextLabel(input.selectedContext)}
Recent conversation:\n${history || 'none'}

REFERENCE RESOLUTION
1. ${GLOW_REFERENCE_RESOLUTION_ORDER[0]}
2. ${GLOW_REFERENCE_RESOLUTION_ORDER[1]}
3. ${GLOW_REFERENCE_RESOLUTION_ORDER[2]}
4. ${GLOW_REFERENCE_RESOLUTION_ORDER[3]}

CAPABILITY TRUTH
- Read-only reasoning, search, guidance and simulation discussion can happen immediately.
- Persistent changes require a proposal and approval.
- Verified direct executors currently include: ${VERIFIED_GLOW_EXECUTORS.join(', ')}.
- Never claim an unverified external action completed.

VOICE
Warm, direct, fluid and concise. Avoid canned assistant phrasing and unnecessary headings.

User: ${input.text}`;

  try {
    return await requestGlowModel({ content: [{ role: undefined, type: 'input_text', text: instructions } as never], maxOutputTokens: 1000 }) || 'I’m here. Tell me what is going on.';
  } catch {
    if (selected) return `I’m using “${selected.title}” and its connected Glow Objects to understand this.`;
    return 'I can still help from the shared Life Model. Tell me what you want to understand or change.';
  }
}

export async function POST(request: Request) {
  let userId = '';
  let activeScenarioId: string | null = null;
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, message: 'Your Glow session expired. Sign in again and retry.' }, { status: 401 });
    userId = session.user.id;

    const body = await request.json() as Body;
    const text = String(body.text ?? '').trim();
    const sourceRoute = String(body.sourceRoute ?? '').trim() || '/today';
    const selectedContext = parseSelectedContext(String(body.selectedContext ?? '').trim());
    const approved = body.approved === true;
    const suppliedScenarioId = String(body.scenarioId ?? '').trim() || null;
    const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
    if (!text) return NextResponse.json({ ok: false, message: 'Say or type something first.' }, { status: 400 });

    const kernelContext = await getLivingKernelContext({
      userId,
      route: sourceRoute,
      selectedContext: selectedContext as KernelSelectedContext,
      text,
      maxObjects: 96,
    });

    const heuristicRisk = glowRiskForText(text);
    const semantic = await interpretGlowUtterance({
      text,
      sourceRoute,
      world: kernelContext.manifest.world,
      selectedContext: selectedContextLabel(selectedContext),
      history,
    });
    const risk = semantic ? strongestRisk(semantic.risk, heuristicRisk) : heuristicRisk;
    const responseForm = semantic?.responseForm ?? glowResponseFormFor(text);

    if (semantic?.mode === 'clarify') {
      return NextResponse.json({ ok: true, mode: 'answer', responseForm: 'conversation', requiresConfirmation: false, world: kernelContext.manifest.world, currentRealityId: kernelContext.currentRealityId, message: semantic.clarification || 'Which thing do you mean?' });
    }

    const semanticWantsAction = semantic && (semantic.mode === 'action' || semantic.mode === 'mixed') && semantic.actions.length > 0;
    if (!semanticWantsAction && risk === 'read') {
      const message = await conversationalReply({ text, sourceRoute, selectedContext, history, userId });
      return NextResponse.json({ ok: true, mode: 'answer', responseForm, requiresConfirmation: false, world: kernelContext.manifest.world, currentRealityId: kernelContext.currentRealityId, message });
    }

    const actions = plannedActions(semantic?.actions ?? [], text);
    const selectedObjectId = kernelContext.selectedObject?.id;

    if (!approved) {
      const scenarioId = await createKernelScenario({
        userId,
        title: actions.length === 1 ? actions[0].title : `Glow proposal · ${actions.length} changes`,
        summary: semantic?.mode === 'mixed' ? 'Glow separated the actionable parts of the request while preserving the rest as conversation.' : `Proposed from ${sourceRoute}. Nothing has changed yet.`,
        sourceRoute,
        sourceText: text,
        confidence: actions.length ? actions.reduce((sum, action) => sum + action.confidence, 0) / actions.length : .5,
        kind: 'proposed-reality',
        changes: actions.map((action) => ({
          objectId: selectedObjectId,
          actionType: action.type,
          patch: { title: action.title, destinations: action.destinations, sourceText: action.sourceText },
          rationale: `The user requested this through Glow from ${sourceRoute}.`,
          expectedEffects: action.destinations.length ? action.destinations : [action.type],
        })),
      });
      await recordKernelReceipt({
        userId,
        scenarioId,
        action: 'Proposed Glow change',
        reasons: ['The user expressed action intent; approval is required before Current Reality changes.'],
        evidence: [text, `Source route: ${sourceRoute}`],
        affectedObjectIds: selectedObjectId ? [selectedObjectId] : [],
        affectedDomains: [...new Set(actions.flatMap((action) => action.destinations.length ? action.destinations : [action.type]))],
        confidence: actions.length ? Math.min(...actions.map((action) => action.confidence)) : .5,
        executor: 'simulation-engine',
        result: 'proposed',
        reversible: true,
        details: { risk, actions: actions.map(({ title, type, destinations, confidence, executor }) => ({ title, type, destinations, confidence, executor })) },
      });
      const visualWarning = isVisualCreationRequest(text) ? ' This proposal will not pretend a visual was rendered by the command executor; explicit visual creation uses Glow’s multimodal renderer.' : '';
      const understanding = semantic?.mode === 'mixed'
        ? 'I separated the actionable parts of what you said and kept them in a proposed reality.'
        : actions.length === 1 ? `I understood this as: ${actions[0].title}.` : `I separated that into ${actions.length} proposed changes.`;
      return NextResponse.json({
        ok: true,
        mode: 'proposal',
        scenarioId,
        currentRealityId: kernelContext.currentRealityId,
        responseForm,
        requiresConfirmation: true,
        risk,
        world: kernelContext.manifest.world,
        actions: actions.map(({ title, type, destinations, confidence, executor }) => ({ title, type, destinations, confidence, executor })),
        message: `${understanding} Nothing changes until you approve.${visualWarning}`,
      });
    }

    activeScenarioId = suppliedScenarioId ?? await createKernelScenario({
      userId,
      title: `Approved Glow action · ${actions[0]?.title ?? text.slice(0, 80)}`,
      summary: 'Approval was received in the same Glow conversation.',
      sourceRoute,
      sourceText: text,
      confidence: actions.length ? Math.min(...actions.map((action) => action.confidence)) : .5,
      changes: actions.map((action) => ({ objectId: selectedObjectId, actionType: action.type, patch: { title: action.title, destinations: action.destinations }, rationale: 'User-approved action.', expectedEffects: action.destinations })),
    });
    await decideKernelScenario(userId, activeScenarioId, 'accepted');

    const completed: string[] = [];
    const queued: string[] = [];
    const completedDestinations = new Set<string>();
    const queuedDestinations = new Set<string>();
    const affectedObjectIds: string[] = selectedObjectId ? [selectedObjectId] : [];
    const affectedDomains = new Set<string>();

    for (const action of actions) {
      if (action.type === 'task' || action.type === 'reminder') {
        const taskTitle = action.title || cleanTaskTitle(action.sourceText);
        const task = await createTask(userId, { title: taskTitle.slice(0, 255), status: 'pending', priority: 'medium' });
        completed.push(`Created ${action.type} “${task.title}”`);
        completedDestinations.add('Tasks');
        affectedDomains.add('task');
        affectedObjectIds.push(canonicalGlowObjectId('task', task.id));
        continue;
      }
      if (action.type === 'note') {
        const note = await createNote(userId, { title: (action.title || cleanNoteTitle(action.sourceText)).slice(0, 120), content: action.sourceText, tags: [], pinned: false });
        completed.push(`Created note “${note.title}”`);
        completedDestinations.add('Notes');
        affectedDomains.add('note');
        affectedObjectIds.push(canonicalGlowObjectId('note', note.id));
        continue;
      }

      const intake = await ingestText(userId, action.sourceText, { sourceRoute });
      const destinations = action.destinations.length ? action.destinations : intake.classification.destinations.length ? intake.classification.destinations : ['Inbox'];
      destinations.forEach((destination) => { queuedDestinations.add(destination); affectedDomains.add(destination.toLowerCase()); });
      queued.push(`${action.title || intake.classification.title} → ${destinations.join(', ')}`);
    }

    await markLivingKernelDirty(userId, 'Glow approved action');
    await syncLivingLifeModel(userId, { force: true, reason: `Approved scenario ${activeScenarioId}` });

    const status = queued.length && completed.length ? 'partially-completed' : queued.length ? 'queued' : 'completed';
    const summaryParts: string[] = [];
    if (completed.length) summaryParts.push(`Completed: ${completed.join('; ')}`);
    if (queued.length) summaryParts.push(`Queued for review: ${queued.join('; ')}`);
    if (queued.length) summaryParts.push('No unverified executor was treated as completed');
    const summary = summaryParts.join('. ') || 'Approved Glow action completed.';

    const receiptId = await recordKernelReceipt({
      userId,
      scenarioId: activeScenarioId,
      action: summary,
      reasons: ['The user explicitly approved the proposed reality.'],
      evidence: [text, `Source route: ${sourceRoute}`, selectedObjectId ? `Selected object: ${selectedObjectId}` : 'No selected object'],
      affectedObjectIds: [...new Set(affectedObjectIds)],
      affectedDomains: [...affectedDomains],
      confidence: actions.length ? Math.min(...actions.map((action) => action.confidence)) : 1,
      executor: queued.length ? (completed.length ? 'execution-engine+review-queue' : 'review-queue') : 'execution-engine',
      result: completed.length || !queued.length ? 'completed' : 'unavailable',
      reversible: completed.length > 0 && queued.length === 0,
      details: { status, completed, queued, destinations: [...completedDestinations], queuedDestinations: [...queuedDestinations] },
    });

    revalidatePath('/today');
    revalidatePath('/tasks');
    revalidatePath('/notes');
    revalidatePath('/inbox');
    revalidatePath('/planning');

    return NextResponse.json({
      ok: true,
      mode: 'completed',
      scenarioId: activeScenarioId,
      responseForm,
      requiresConfirmation: false,
      actions: actions.map(({ title, type, destinations, confidence, executor }) => ({ title, type, destinations, confidence, executor })),
      message: summary,
      receipt: {
        id: receiptId,
        status,
        summary,
        completed,
        queued,
        destinations: [...completedDestinations],
        queuedDestinations: [...queuedDestinations],
        needsAttention: queued.length > 0,
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown Glow error';
    console.error('[api/glow/command]', detail);
    if (userId) {
      try {
        await recordKernelReceipt({
          userId,
          scenarioId: activeScenarioId,
          action: 'Glow action failed',
          reasons: ['The requested execution did not finish successfully.'],
          evidence: [detail],
          executor: 'execution-engine',
          result: 'failed',
          reversible: false,
          details: { error: detail },
        });
      } catch {}
    }
    return NextResponse.json({ ok: false, message: `Glow could not complete that request. ${detail}` }, { status: 500 });
  }
}
