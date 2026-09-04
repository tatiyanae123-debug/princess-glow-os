import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getTasksByUser, createTask } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getNotesByUser, createNote } from '@/lib/data/notes';
import { classifyUniversalInput, ingestText } from '@/lib/intelligence/universal-intake';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Risk = 'read' | 'low' | 'medium' | 'high';
type ResponseForm = 'conversation' | 'guide' | 'plan' | 'search' | 'visual';
type HistoryTurn = { role?: string; text?: string };
type Body = { text?: string; sourceRoute?: string; selectedContext?: string; approved?: boolean; risk?: Risk; history?: HistoryTurn[] };

function splitClauses(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const parts = normalized.split(/(?:\s*;\s*|\s+then\s+|\s+also\s+)/i).map((part) => part.trim()).filter((part) => part.length > 2);
  return parts.length > 1 ? parts.slice(0, 8) : [normalized];
}
function serverRisk(text: string): Risk {
  const value = text.toLowerCase();
  if (/\b(delete|erase|remove all|cancel|pay|purchase|transfer|send email|external account|clear all|archive all)\b/.test(value)) return 'high';
  if (/\b(move|reschedule|change|edit|update|replace|reorganize|rearrange|replan|fix the rest|everything|all unfinished)\b/.test(value)) return 'medium';
  if (/\b(add|create|save|file|log|remind|schedule|make a task|make a note)\b/.test(value)) return 'low';
  return 'read';
}
function responseFormFor(text: string): ResponseForm {
  const value = text.toLowerCase();
  if (/\b(image|visual card|mood board|visual|diagram)\b/.test(value)) return 'visual';
  if (/\b(step by step|guide me|talk me through|routine|walk me through)\b/.test(value)) return 'guide';
  if (/\b(plan|replan|fix the rest|schedule|scenario|reorganize|rearrange)\b/.test(value)) return 'plan';
  if (/\b(find|search|show me|pull up|where is|previous note|look for)\b/.test(value)) return 'search';
  return 'conversation';
}
function cleanTaskTitle(text: string) {
  return text.replace(/^(?:please\s+)?(?:add|create|make)\s+(?:me\s+)?(?:a\s+)?(?:new\s+)?(?:task|reminder)\s*(?:to|for|:)?\s*/i, '').replace(/^remind me to\s+/i, '').trim().slice(0, 255) || 'New task';
}
function cleanNoteTitle(text: string) {
  const cleaned = text.replace(/^(?:please\s+)?(?:save|create|make|file)\s+(?:this\s+)?(?:as\s+)?(?:a\s+)?(?:new\s+)?note\s*(?::)?\s*/i, '').trim();
  return (cleaned.split(/[.!?\n]/)[0] || 'New note').slice(0, 120);
}
function wantsNoteContext(sourceRoute: string, text: string) {
  return /\/(notes|brain|memory|timeline|graph|observations)/.test(sourceRoute) || /\b(note|notes|memory|memories|idea|ideas|thought|thoughts|insight|previous)\b/i.test(text);
}
async function contextFor(userId: string, sourceRoute: string, text: string) {
  const [tasks, events] = await Promise.all([getTasksByUser(userId), getCalendarEventsByUser(userId)]);
  const openTasks = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled').slice(0, 10).map((task) => ({
    title: task.title,
    priority: task.priority,
    due: task.dueDate?.toISOString() ?? null,
  }));
  const now = new Date();
  const upcomingEvents = events.filter((event) => event.startAt >= now).sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).slice(0, 10).map((event) => ({
    title: event.title,
    start: event.startAt.toISOString(),
    allDay: event.allDay,
    location: event.location,
  }));
  let recentNotes: Array<{ title: string; excerpt: string; updatedAt: string | null }> = [];
  if (wantsNoteContext(sourceRoute, text)) {
    const notes = await getNotesByUser(userId);
    recentNotes = notes.slice(0, 10).map((note) => ({
      title: note.title,
      excerpt: String(note.content ?? '').slice(0, 500),
      updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : null,
    }));
  }
  return { sourceRoute, currentTime: now.toISOString(), openTasks, upcomingEvents, recentNotes };
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
function fallbackReply(input: { text: string; selectedContext: string; context: Awaited<ReturnType<typeof contextFor>> }) {
  const value = input.text.toLowerCase();
  if (/\b(find|search|previous note|note where|notes about)\b/.test(value) && input.context.recentNotes.length) {
    const words = value.split(/[^a-z0-9]+/).filter((word) => word.length >= 4 && !['find','search','note','notes','where','about','previous'].includes(word));
    const scored = input.context.recentNotes.map((note) => {
      const haystack = `${note.title} ${note.excerpt}`.toLowerCase();
      return { note, score: words.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0) };
    }).sort((a, b) => b.score - a.score);
    const match = scored[0]?.note;
    if (match) return `I found a likely note: “${match.title}”. Open Notes if you want to work with it.`;
  }
  const nextTask = input.context.openTasks[0]?.title;
  const nextEvent = input.context.upcomingEvents[0]?.title;
  if (input.selectedContext) return `I’m using the selected context (${input.selectedContext}) plus this room. Tell me what you want to know or change about it.`;
  return nextTask
    ? `Your clearest open task is “${nextTask}”.${nextEvent ? ` Your next calendar item is “${nextEvent}”.` : ''}`
    : `I do not see an open task to recommend right now.`;
}
async function conversationalReply(input: { text: string; sourceRoute: string; selectedContext: string; history: HistoryTurn[]; userId: string }) {
  const context = await contextFor(input.userId, input.sourceRoute, input.text);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return fallbackReply({ text: input.text, selectedContext: input.selectedContext, context });

  const history = input.history.slice(-10).map((turn) => `${turn.role === 'user' ? 'Tatiyana' : 'Glow'}: ${String(turn.text ?? '').slice(0, 700)}`).join('\n');
  const instructions = `You are Glow, the one persistent intelligent presence inside Glow OS.

ROLE
- Stay subordinate to the room the user is working in. Today stays about Today, Calendar about time, Notes about writing, Beauty about beauty, Money about financial clarity.
- You can converse, search, guide step-by-step, create drafts/proposals, organize, and operate verified Glow OS actions.
- Never claim you changed data unless the system explicitly reports that an approved action completed.

CONTEXT
- Current room/route: ${input.sourceRoute}
- Selected object/context: ${input.selectedContext || 'none'}
- Current Glow context JSON: ${JSON.stringify(context)}
- Recent conversation:\n${history || 'none'}

REFERENCE RESOLUTION
- If the user says “this”, “that”, “it”, “move this”, or similar, resolve it from the selected object first, then the current room, then recent conversation. If still ambiguous, ask one concise clarifying question. Never guess before a mutation.

APPROVAL
- Read-only conversation, search, guidance, and navigation can happen immediately.
- Changes to tasks, calendar, reminders, files, money, personal data, or external communication must be proposed first and approved before execution.
- If an executor is not verified, say the request can be prepared or queued for review rather than claiming completion.

STYLE
- Be concise, practical, warm, and context-aware.
- Prefer the response form implied by the request: conversation, guide, plan, search result, or visual concept.

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
    if (!session?.user?.id) return NextResponse.json({ ok: false, message: 'Your Glow session expired. Sign in again and retry.' }, { status: 401 });
    const body = await request.json() as Body;
    const text = String(body.text ?? '').trim();
    const sourceRoute = String(body.sourceRoute ?? '').trim() || '/today';
    const selectedContext = String(body.selectedContext ?? '').trim();
    const approved = body.approved === true;
    const risk = serverRisk(text);
    const responseForm = responseFormFor(text);
    const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
    if (!text) return NextResponse.json({ ok: false, message: 'Say or type something first.' }, { status: 400 });

    if (risk === 'read') {
      const message = await conversationalReply({ text, sourceRoute, selectedContext, history, userId: session.user.id });
      return NextResponse.json({ ok: true, mode: 'answer', responseForm, requiresConfirmation: false, message });
    }

    const clauses = splitClauses(text);
    const proposals = clauses.map((clause) => {
      const classification = classifyUniversalInput({ text: clause });
      return { title: classification.title, type: classification.type, destinations: classification.destinations, confidence: classification.confidence };
    });
    if (!approved) {
      return NextResponse.json({
        ok: true,
        mode: 'proposal',
        responseForm,
        requiresConfirmation: true,
        risk,
        actions: proposals,
        message: `Glow prepared ${proposals.length} proposed change${proposals.length === 1 ? '' : 's'}. Review the plan before anything changes.`,
      });
    }

    const completed: string[] = [];
    const queued: string[] = [];
    for (const clause of clauses) {
      const classification = classifyUniversalInput({ text: clause });
      if (classification.type === 'task' || classification.type === 'reminder') {
        const task = await createTask(session.user.id, { title: cleanTaskTitle(clause), status: 'pending', priority: 'medium' });
        completed.push(`Created task “${task.title}”`);
        continue;
      }
      if (classification.type === 'note') {
        const note = await createNote(session.user.id, { title: cleanNoteTitle(clause), content: clause, tags: [], pinned: false });
        completed.push(`Created note “${note.title}”`);
        continue;
      }
      const intake = await ingestText(session.user.id, clause, { sourceRoute });
      queued.push(`${intake.classification.title} → ${intake.classification.destinations.join(', ') || 'Inbox'}`);
    }

    revalidatePath('/today');
    revalidatePath('/tasks');
    revalidatePath('/notes');
    revalidatePath('/inbox');
    const summary = [...completed, ...queued.map((item) => `Queued for review: ${item}`)].join('. ');
    return NextResponse.json({
      ok: true,
      mode: 'completed',
      responseForm,
      requiresConfirmation: false,
      actions: proposals,
      message: summary || 'The approved request is complete.',
      receipt: {
        id: randomUUID(),
        summary: summary || 'Approved Glow action completed',
        destinations: [...new Set(proposals.flatMap((proposal) => proposal.destinations))],
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown Glow error';
    console.error('[api/glow/command]', detail);
    return NextResponse.json({ ok: false, message: `Glow could not complete that request. ${detail}` }, { status: 500 });
  }
}
