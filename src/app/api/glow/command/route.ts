import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getTasksByUser, createTask } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getNotesByUser, createNote } from '@/lib/data/notes';
import { getActiveFocusSession } from '@/lib/intelligence/adaptive-os';
import { classifyUniversalInput, ingestText } from '@/lib/intelligence/universal-intake';
import { glowModelIsConfigured, requestGlowModel } from '@/lib/intelligence/glow-model-client';
import { interpretGlowUtterance, type GlowSemanticAction } from '@/lib/intelligence/glow-semantic-intent';
import {
  glowNeedsNoteContext,
  glowResponseFormFor,
  glowRiskForText,
  glowWorldForRoute,
  isVisualCreationRequest,
  GLOW_REFERENCE_RESOLUTION_ORDER,
  VERIFIED_GLOW_EXECUTORS,
  type GlowRisk,
} from '@/lib/intelligence/glow-operating-model';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type HistoryTurn = { role?: string; text?: string };
type SelectedContext = { label?: string; type?: string; id?: string; route?: string; capturedAt?: number };
type Body = {
  text?: string;
  sourceRoute?: string;
  selectedContext?: string;
  approved?: boolean;
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
  const parts = normalized
    .split(/(?:\s*;\s*|\s+then\s+|\s+also\s+)/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 2);
  return parts.length > 1 ? parts.slice(0, 8) : [normalized];
}

function parseSelectedContext(value: string): SelectedContext | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as SelectedContext;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return { label: value };
  }
}

function selectedContextLabel(context: SelectedContext | null) {
  if (!context?.label) return 'none';
  const parts = [context.type, context.label, context.route ? `from ${context.route}` : null].filter(Boolean);
  return parts.join(' · ');
}

function cleanTaskTitle(text: string) {
  return text
    .replace(/^(?:please\s+)?(?:add|create|make)\s+(?:me\s+)?(?:a\s+)?(?:new\s+)?(?:task|reminder)\s*(?:to|for|:)?\s*/i, '')
    .replace(/^remind me to\s+/i, '')
    .replace(/^(?:i\s+)?(?:need|have|want)\s+to\s+/i, '')
    .replace(/^i\s+(?:should|was supposed to)\s+/i, '')
    .trim()
    .slice(0, 255) || 'New task';
}

function cleanNoteTitle(text: string) {
  const cleaned = text
    .replace(/^(?:please\s+)?(?:save|create|make|file|keep|remember)\s+(?:this\s+)?(?:as\s+)?(?:a\s+)?(?:new\s+)?note\s*(?::)?\s*/i, '')
    .trim();
  return (cleaned.split(/[.!?\n]/)[0] || 'New note').slice(0, 120);
}

async function contextFor(userId: string, sourceRoute: string, text: string) {
  const [tasks, events] = await Promise.all([
    getTasksByUser(userId),
    getCalendarEventsByUser(userId),
  ]);

  const openTasks = tasks
    .filter((task) => task.status !== 'done' && task.status !== 'cancelled')
    .slice(0, 12)
    .map((task) => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      status: task.status,
      due: task.dueDate?.toISOString() ?? null,
    }));

  const now = new Date();
  const upcomingEvents = events
    .filter((event) => event.startAt >= now)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .slice(0, 12)
    .map((event) => ({
      id: event.id,
      title: event.title,
      start: event.startAt.toISOString(),
      end: event.endAt?.toISOString() ?? null,
      allDay: event.allDay,
      location: event.location,
    }));

  let activeFocus: null | {
    id: string;
    title: string;
    entityType: string;
    entityId: string;
    startedAt: string;
    plannedMinutes: number | null;
  } = null;
  try {
    const focus = await getActiveFocusSession(userId);
    if (focus) {
      activeFocus = {
        id: focus.id,
        title: focus.title,
        entityType: focus.entityType,
        entityId: focus.entityId,
        startedAt: focus.startedAt.toISOString(),
        plannedMinutes: focus.plannedMinutes,
      };
    }
  } catch {
    activeFocus = null;
  }

  let recentNotes: Array<{ id: string; title: string; excerpt: string; updatedAt: string | null }> = [];
  if (glowNeedsNoteContext(sourceRoute, text)) {
    const notes = await getNotesByUser(userId);
    recentNotes = notes.slice(0, 12).map((note) => ({
      id: note.id,
      title: note.title,
      excerpt: String(note.content ?? '').slice(0, 600),
      updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : null,
    }));
  }

  return {
    sourceRoute,
    world: glowWorldForRoute(sourceRoute),
    currentTime: now.toISOString(),
    activeFocus,
    openTasks,
    upcomingEvents,
    recentNotes,
  };
}

function fallbackReply(input: {
  text: string;
  selectedContext: SelectedContext | null;
  context: Awaited<ReturnType<typeof contextFor>>;
}) {
  const value = input.text.toLowerCase();

  if (/\b(find|search|previous note|note where|notes about)\b/.test(value) && input.context.recentNotes.length) {
    const words = value
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 4 && !['find', 'search', 'note', 'notes', 'where', 'about', 'previous'].includes(word));
    const scored = input.context.recentNotes
      .map((note) => {
        const haystack = `${note.title} ${note.excerpt}`.toLowerCase();
        return { note, score: words.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0) };
      })
      .sort((a, b) => b.score - a.score);
    const match = scored[0]?.note;
    if (match) return `I found a likely note: “${match.title}”. Open Notes if you want to work with it.`;
  }

  if (input.selectedContext?.label) {
    return `I’m using “${input.selectedContext.label}” from ${input.selectedContext.route ?? input.context.sourceRoute} as the selected object, plus the current ${input.context.world} context.`;
  }

  if (input.context.activeFocus) {
    return `Your active focus is “${input.context.activeFocus.title}”. I can use that together with this ${input.context.world} room to decide what comes next.`;
  }

  const nextTask = input.context.openTasks[0]?.title;
  const nextEvent = input.context.upcomingEvents[0]?.title;
  return nextTask
    ? `Your clearest open task is “${nextTask}”.${nextEvent ? ` Your next calendar item is “${nextEvent}”.` : ''}`
    : 'Tell me what is on your mind. I can help you make sense of it without you needing to phrase it like a command.';
}

async function conversationalReply(input: {
  text: string;
  sourceRoute: string;
  selectedContext: SelectedContext | null;
  history: HistoryTurn[];
  userId: string;
}) {
  const context = await contextFor(input.userId, input.sourceRoute, input.text);
  if (!glowModelIsConfigured()) return fallbackReply({ text: input.text, selectedContext: input.selectedContext, context });

  const history = input.history
    .slice(-12)
    .map((turn) => `${turn.role === 'user' ? 'User' : 'Glow'}: ${String(turn.text ?? '').slice(0, 700)}`)
    .join('\n');

  const instructions = `You are Glow, the one persistent living intelligence inside Glow OS.

CORE BEHAVIOR
- Talk with the user like a highly capable human who already understands the surrounding situation, not like a command parser or customer-service bot.
- The user never needs special syntax. They can ramble, use fragments, change direction mid-sentence, use shorthand, imply what they mean, or speak emotionally and casually.
- Infer the likely underlying goal from the whole utterance, current room, selected object, recent conversation, tasks, calendar, focus, and notes.
- Do not fixate on one keyword when the whole sentence means something else.
- When a harmless/read-only interpretation is reasonably clear, help immediately instead of asking the user to restate it more precisely.
- For a consequential mutation, resolve references carefully. Ask ONE short clarifying question only when you truly cannot safely tell what object or action the user means.
- Separate mixed thoughts mentally and respond to the real priorities rather than mirroring the ramble back mechanically.
- Never turn every thought into a task. Thoughts, feelings, hypotheticals, and preferences can remain thoughts unless the user expresses an intention, commitment, request, or desire to save/act.

IDENTITY
- Glow OS is the operating system. Glow is the one intelligence the user talks to.
- There is no second assistant identity, second conversation owner, or competing runtime.

CURRENT CONTEXT
- Current route: ${input.sourceRoute}
- Current Glow world: ${context.world}
- Selected object/context: ${selectedContextLabel(input.selectedContext)}
- Selected object original route: ${input.selectedContext?.route ?? 'none'}
- Current context JSON: ${JSON.stringify(context)}
- Recent conversation:\n${history || 'none'}

REFERENCE RESOLUTION
Use this order for ambiguous references:
1. ${GLOW_REFERENCE_RESOLUTION_ORDER[0]}
2. ${GLOW_REFERENCE_RESOLUTION_ORDER[1]}
3. ${GLOW_REFERENCE_RESOLUTION_ORDER[2]}
4. ${GLOW_REFERENCE_RESOLUTION_ORDER[3]}
If a consequential reference is still unresolved, ask one concise question. Do not guess before changing data.

CAPABILITIES AND TRUTH
- You can converse, search available Glow context, guide step-by-step, reason across time and preparation, create drafts/proposals, organize, and operate verified actions.
- Read-only conversation, guidance, search and planning discussion can happen immediately.
- Persistent changes require a proposal and user approval.
- The only verified direct executors are: ${VERIFIED_GLOW_EXECUTORS.join(', ')}.
- Calendar mutation, broad reorganization, external communication, financial actions, image rendering, and other unverified operations may be understood and proposed, but never falsely claimed as completed.
- Explain recommendations with a short useful reason when context supports one.
- Distinguish what you know from what you infer.

VOICE/TONE
- Write the way a thoughtful person would naturally speak aloud: warm, direct, fluid, concise, and context-aware.
- Use contractions naturally. Avoid canned assistant phrases, repetitive disclaimers, formal headings in ordinary conversation, and robotic enumeration unless structure genuinely helps.

User: ${input.text}`;

  try {
    return await requestGlowModel({
      content: [{ role: undefined, type: 'input_text', text: instructions } as never],
      maxOutputTokens: 850,
    }) || 'I’m here. Tell me what’s going on.';
  } catch {
    return fallbackReply({ text: input.text, selectedContext: input.selectedContext, context });
  }
}

function fallbackActions(text: string): PlannedAction[] {
  return splitClauses(text).map((clause) => {
    const classification = classifyUniversalInput({ text: clause });
    const type = ['task', 'reminder', 'note'].includes(classification.type)
      ? classification.type as GlowSemanticAction['type']
      : 'other';
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
    executor: action.type === 'task' || action.type === 'reminder' || action.type === 'note'
      ? 'verified'
      : 'review-queue',
  }));
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: 'Your Glow session expired. Sign in again and retry.' }, { status: 401 });
    }

    const body = await request.json() as Body;
    const text = String(body.text ?? '').trim();
    const sourceRoute = String(body.sourceRoute ?? '').trim() || '/today';
    const selectedContext = parseSelectedContext(String(body.selectedContext ?? '').trim());
    const approved = body.approved === true;
    const history = Array.isArray(body.history) ? body.history.slice(-12) : [];

    if (!text) {
      return NextResponse.json({ ok: false, message: 'Say or type something first.' }, { status: 400 });
    }

    const heuristicRisk = glowRiskForText(text);
    const semantic = await interpretGlowUtterance({
      text,
      sourceRoute,
      world: glowWorldForRoute(sourceRoute),
      selectedContext: selectedContextLabel(selectedContext),
      history,
    });
    const risk = semantic ? strongestRisk(semantic.risk, heuristicRisk) : heuristicRisk;
    const responseForm = semantic?.responseForm ?? glowResponseFormFor(text);

    if (semantic?.mode === 'clarify') {
      return NextResponse.json({
        ok: true,
        mode: 'answer',
        responseForm: 'conversation',
        requiresConfirmation: false,
        world: glowWorldForRoute(sourceRoute),
        message: semantic.clarification || 'Which thing do you mean?',
      });
    }

    const semanticWantsAction = semantic && (semantic.mode === 'action' || semantic.mode === 'mixed') && semantic.actions.length > 0;
    if (!semanticWantsAction && risk === 'read') {
      const message = await conversationalReply({ text, sourceRoute, selectedContext, history, userId: session.user.id });
      return NextResponse.json({
        ok: true,
        mode: 'answer',
        responseForm,
        requiresConfirmation: false,
        world: glowWorldForRoute(sourceRoute),
        message,
      });
    }

    const actions = plannedActions(semantic?.actions ?? [], text);

    if (!approved) {
      const visualWarning = isVisualCreationRequest(text)
        ? ' I understand the visual request, but no verified visual renderer is connected here yet, so approval will queue it for review rather than pretend it was rendered.'
        : '';
      const understanding = semantic?.mode === 'mixed'
        ? 'I separated the parts of what you said and found the changes that need your approval.'
        : actions.length === 1
          ? `I understood this as: ${actions[0].title}.`
          : `I separated that into ${actions.length} things you want handled.`;
      return NextResponse.json({
        ok: true,
        mode: 'proposal',
        responseForm,
        requiresConfirmation: true,
        risk,
        world: glowWorldForRoute(sourceRoute),
        actions: actions.map(({ title, type, destinations, confidence, executor }) => ({ title, type, destinations, confidence, executor })),
        message: `${understanding} Nothing changes until you approve.${visualWarning}`,
      });
    }

    const completed: string[] = [];
    const queued: string[] = [];
    const completedDestinations = new Set<string>();
    const queuedDestinations = new Set<string>();

    for (const action of actions) {
      if (action.type === 'task' || action.type === 'reminder') {
        const taskTitle = action.title || cleanTaskTitle(action.sourceText);
        const task = await createTask(session.user.id, {
          title: taskTitle.slice(0, 255),
          status: 'pending',
          priority: 'medium',
        });
        completed.push(`Created ${action.type} “${task.title}”`);
        completedDestinations.add('Tasks');
        continue;
      }

      if (action.type === 'note') {
        const note = await createNote(session.user.id, {
          title: (action.title || cleanNoteTitle(action.sourceText)).slice(0, 120),
          content: action.sourceText,
          tags: [],
          pinned: false,
        });
        completed.push(`Created note “${note.title}”`);
        completedDestinations.add('Notes');
        continue;
      }

      const intake = await ingestText(session.user.id, action.sourceText, { sourceRoute });
      const destinations = action.destinations.length
        ? action.destinations
        : intake.classification.destinations.length
          ? intake.classification.destinations
          : ['Inbox'];
      destinations.forEach((destination) => queuedDestinations.add(destination));
      queued.push(`${action.title || intake.classification.title} → ${destinations.join(', ')}`);
    }

    revalidatePath('/today');
    revalidatePath('/tasks');
    revalidatePath('/notes');
    revalidatePath('/inbox');

    const status = queued.length && completed.length
      ? 'partially-completed'
      : queued.length
        ? 'queued'
        : 'completed';

    const summaryParts: string[] = [];
    if (completed.length) summaryParts.push(`Completed: ${completed.join('; ')}`);
    if (queued.length) summaryParts.push(`Queued for review: ${queued.join('; ')}`);
    if (queued.length) summaryParts.push('No unverified executor was treated as completed');
    const summary = summaryParts.join('. ') || 'Approved Glow action completed.';

    return NextResponse.json({
      ok: true,
      mode: 'completed',
      responseForm,
      requiresConfirmation: false,
      actions: actions.map(({ title, type, destinations, confidence, executor }) => ({ title, type, destinations, confidence, executor })),
      message: summary,
      receipt: {
        id: randomUUID(),
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
    return NextResponse.json({
      ok: false,
      message: `Glow could not complete that request. ${detail}`,
    }, { status: 500 });
  }
}
