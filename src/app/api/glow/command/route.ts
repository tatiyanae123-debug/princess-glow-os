import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getTasksByUser, createTask } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getNotesByUser, createNote } from '@/lib/data/notes';
import { getActiveFocusSession } from '@/lib/intelligence/adaptive-os';
import { classifyUniversalInput, ingestText } from '@/lib/intelligence/universal-intake';
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
    .trim()
    .slice(0, 255) || 'New task';
}

function cleanNoteTitle(text: string) {
  const cleaned = text
    .replace(/^(?:please\s+)?(?:save|create|make|file)\s+(?:this\s+)?(?:as\s+)?(?:a\s+)?(?:new\s+)?note\s*(?::)?\s*/i, '')
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

function extractResponseText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const root = payload as Record<string, unknown>;
  if (typeof root.output_text === 'string') return root.output_text;
  const output = Array.isArray(root.output) ? root.output : [];
  const chunks: string[] = [];
  for (const itemValue of output) {
    if (!itemValue || typeof itemValue !== 'object') continue;
    const item = itemValue as Record<string, unknown>;
    const content = Array.isArray(item.content) ? item.content : [];
    for (const contentValue of content) {
      if (!contentValue || typeof contentValue !== 'object') continue;
      const part = contentValue as Record<string, unknown>;
      if (typeof part.text === 'string') chunks.push(part.text);
    }
  }
  return chunks.join('\n').trim();
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
    : 'I do not see an open task to recommend right now.';
}

async function conversationalReply(input: {
  text: string;
  sourceRoute: string;
  selectedContext: SelectedContext | null;
  history: HistoryTurn[];
  userId: string;
}) {
  const context = await contextFor(input.userId, input.sourceRoute, input.text);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackReply({ text: input.text, selectedContext: input.selectedContext, context });

  const history = input.history
    .slice(-10)
    .map((turn) => `${turn.role === 'user' ? 'User' : 'Glow'}: ${String(turn.text ?? '').slice(0, 700)}`)
    .join('\n');

  const instructions = `You are Glow, the one persistent intelligent presence inside Glow OS.

IDENTITY
- Glow OS is the operating system.
- Glow is the one intelligent presence the user talks to.
- There is no second assistant identity, second conversation owner, or competing agent runtime.

ROLE
- Stay subordinate to the room the user is working in. Today stays about Today, Calendar about time, Notes about writing, Beauty about beauty, Money about financial clarity.
- You can converse, search, guide step-by-step, create drafts/proposals, organize, and operate verified Glow OS actions.
- Never claim you changed data unless the system explicitly reports that an approved verified executor completed the mutation.

CURRENT CONTEXT
- Current route: ${input.sourceRoute}
- Current Glow world: ${context.world}
- Selected object/context: ${selectedContextLabel(input.selectedContext)}
- Selected object original route: ${input.selectedContext?.route ?? 'none'}
- Current Glow context JSON: ${JSON.stringify(context)}
- Recent conversation:\n${history || 'none'}

REFERENCE RESOLUTION
Resolve ambiguous references in exactly this order:
1. ${GLOW_REFERENCE_RESOLUTION_ORDER[0]}
2. ${GLOW_REFERENCE_RESOLUTION_ORDER[1]}
3. ${GLOW_REFERENCE_RESOLUTION_ORDER[2]}
4. ${GLOW_REFERENCE_RESOLUTION_ORDER[3]}
If the reference is still ambiguous, ask one concise clarifying question before any mutation. Never guess what “this”, “that”, or “it” means before changing data.

RESPONSE FORMS
- conversation
- search result
- guided steps
- plan/proposal
- visual concept/card structure
Choose the form that best matches the request.

APPROVAL
- Read-only conversation, search, guidance, and navigation can happen immediately.
- Creating or changing persistent data requires a proposal first. Nothing changes until the user approves.
- Cancel means nothing changes.
- The only verified direct executors are: ${VERIFIED_GLOW_EXECUTORS.join(', ')}.
- Calendar rescheduling, broad reorganization, external communication, financial actions, image rendering, and other unverified operations must be prepared or queued for review. Never say they happened when they did not.

VISUAL CREATION
- If the user asks to create/render/generate an image, visual cards, mood board, or diagram and no verified visual executor is connected, prepare the concept or queue it for review. Do not claim an image was rendered.

STYLE
- Be concise, practical, warm, and context-aware.
- Preserve continuity with the current room and recent conversation.

User: ${input.text}`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_GLOW_MODEL || 'gpt-5',
      input: [{ role: 'user', content: [{ type: 'input_text', text: instructions }] }],
      max_output_tokens: 650,
    }),
  });
  if (!response.ok) throw new Error('Glow could not reach the language model.');
  return extractResponseText(await response.json()) || 'I am here. Tell me what you want to do next.';
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
    const risk = glowRiskForText(text);
    const responseForm = glowResponseFormFor(text);
    const history = Array.isArray(body.history) ? body.history.slice(-10) : [];

    if (!text) {
      return NextResponse.json({ ok: false, message: 'Say or type something first.' }, { status: 400 });
    }

    if (risk === 'read') {
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

    const clauses = splitClauses(text);
    const proposals = clauses.map((clause) => {
      const classification = classifyUniversalInput({ text: clause });
      return {
        title: classification.title,
        type: classification.type,
        destinations: classification.destinations,
        confidence: classification.confidence,
        executor: classification.type === 'task' || classification.type === 'reminder' || classification.type === 'note'
          ? 'verified'
          : 'review-queue',
      };
    });

    if (!approved) {
      const visualWarning = isVisualCreationRequest(text)
        ? ' No verified visual renderer is connected, so approval will queue the visual work for review rather than claim an image was created.'
        : '';
      return NextResponse.json({
        ok: true,
        mode: 'proposal',
        responseForm,
        requiresConfirmation: true,
        risk,
        world: glowWorldForRoute(sourceRoute),
        actions: proposals,
        message: `Glow prepared ${proposals.length} proposed change${proposals.length === 1 ? '' : 's'}. Nothing changes until you approve.${visualWarning}`,
      });
    }

    const completed: string[] = [];
    const queued: string[] = [];
    const completedDestinations = new Set<string>();
    const queuedDestinations = new Set<string>();

    for (const clause of clauses) {
      const classification = classifyUniversalInput({ text: clause });

      if (classification.type === 'task' || classification.type === 'reminder') {
        const task = await createTask(session.user.id, {
          title: cleanTaskTitle(clause),
          status: 'pending',
          priority: 'medium',
        });
        completed.push(`Created task “${task.title}”`);
        completedDestinations.add('Tasks');
        continue;
      }

      if (classification.type === 'note') {
        const note = await createNote(session.user.id, {
          title: cleanNoteTitle(clause),
          content: clause,
          tags: [],
          pinned: false,
        });
        completed.push(`Created note “${note.title}”`);
        completedDestinations.add('Notes');
        continue;
      }

      const intake = await ingestText(session.user.id, clause, { sourceRoute });
      const destinations = intake.classification.destinations.length
        ? intake.classification.destinations
        : ['Inbox'];
      destinations.forEach((destination) => queuedDestinations.add(destination));
      queued.push(`${intake.classification.title} → ${destinations.join(', ')}`);
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
      actions: proposals,
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
