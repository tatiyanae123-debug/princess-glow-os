import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getTasksByUser, createTask } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { createNote } from '@/lib/data/notes';
import { classifyUniversalInput, ingestText } from '@/lib/intelligence/universal-intake';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Risk = 'read' | 'low' | 'medium' | 'high';
type HistoryTurn = { role?: string; text?: string };

type Body = {
  text?: string;
  sourceRoute?: string;
  selectedContext?: string;
  approved?: boolean;
  risk?: Risk;
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

function serverRisk(text: string): Risk {
  const value = text.toLowerCase();
  if (/\b(delete|erase|remove all|cancel|pay|purchase|transfer|send email|external account|clear all|archive all)\b/.test(value)) return 'high';
  if (/\b(move|reschedule|change|edit|update|replace|reorganize|everything|all unfinished)\b/.test(value)) return 'medium';
  if (/\b(add|create|save|file|log|remind|schedule|make a task|make a note)\b/.test(value)) return 'low';
  return 'read';
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

async function contextFor(userId: string, sourceRoute: string) {
  const [tasks, events] = await Promise.all([
    getTasksByUser(userId),
    getCalendarEventsByUser(userId),
  ]);
  const openTasks = tasks
    .filter((task) => task.status !== 'done' && task.status !== 'cancelled')
    .slice(0, 8)
    .map((task) => ({ title: task.title, priority: task.priority, due: task.dueDate?.toISOString() ?? null }));
  const now = new Date();
  const upcomingEvents = events
    .filter((event) => event.startAt >= now)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .slice(0, 8)
    .map((event) => ({ title: event.title, start: event.startAt.toISOString(), allDay: event.allDay, location: event.location }));
  return { sourceRoute, openTasks, upcomingEvents };
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

async function conversationalReply(input: { text: string; sourceRoute: string; selectedContext: string; history: HistoryTurn[]; userId: string }) {
  const context = await contextFor(input.userId, input.sourceRoute);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const nextTask = context.openTasks[0]?.title;
    const nextEvent = context.upcomingEvents[0]?.title;
    return nextTask
      ? `You are in ${input.sourceRoute}. Your clearest open task is “${nextTask}”.${nextEvent ? ` Your next calendar item is “${nextEvent}”.` : ''}`
      : `You are in ${input.sourceRoute}. I do not see an open task to recommend right now.`;
  }

  const history = input.history
    .slice(-6)
    .map((turn) => `${turn.role === 'user' ? 'Tatiyana' : 'Shakti'}: ${String(turn.text ?? '').slice(0, 600)}`)
    .join('\n');
  const instructions = `You are Shakti, the persistent intelligent presence inside Glow OS. Be concise, practical, warm, and context-aware. You are not a separate destination: assist the room the user is already in. Never claim you changed data unless the system explicitly reports that an approved action completed. For requests that would change tasks, calendar, files, reminders, money, or external communication, say what you propose and wait for approval. Current room: ${input.sourceRoute}. Selected object/context: ${input.selectedContext || 'none'}. Current Glow context JSON: ${JSON.stringify(context)}. Recent conversation:\n${history || 'none'}\nUser: ${input.text}`;

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_GLOW_MODEL || 'gpt-5',
      input: [{ role: 'user', content: [{ type: 'input_text', text: instructions }] }],
      max_output_tokens: 500,
    }),
  });
  if (!response.ok) throw new Error('Shakti could not reach the language model.');
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
    const history = Array.isArray(body.history) ? body.history.slice(-6) : [];
    if (!text) return NextResponse.json({ ok: false, message: 'Say or type something first.' }, { status: 400 });

    if (risk === 'read') {
      const message = await conversationalReply({ text, sourceRoute, selectedContext, history, userId: session.user.id });
      return NextResponse.json({ ok: true, mode: 'answer', requiresConfirmation: false, message });
    }

    const clauses = splitClauses(text);
    const proposals = clauses.map((clause) => {
      const classification = classifyUniversalInput({ text: clause });
      return {
        title: classification.title,
        type: classification.type,
        destinations: classification.destinations,
        confidence: classification.confidence,
      };
    });

    if (!approved) {
      return NextResponse.json({
        ok: true,
        mode: 'proposal',
        requiresConfirmation: true,
        risk,
        actions: proposals,
        message: `I understood ${proposals.length} proposed change${proposals.length === 1 ? '' : 's'}. Review them before I act.`,
      });
    }

    const completed: string[] = [];
    const queued: string[] = [];
    for (const clause of clauses) {
      const classification = classifyUniversalInput({ text: clause });
      if (classification.type === 'task' || classification.type === 'reminder') {
        const task = await createTask(session.user.id, {
          title: cleanTaskTitle(clause),
          status: 'pending',
          priority: 'medium',
        });
        completed.push(`Created task “${task.title}”`);
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
        continue;
      }

      const intake = await ingestText(session.user.id, clause, { sourceRoute });
      queued.push(`${intake.classification.title} → ${intake.classification.destinations.join(', ') || 'Inbox'}`);
    }

    revalidatePath('/today');
    revalidatePath('/tasks');
    revalidatePath('/notes');
    revalidatePath('/inbox');

    const summary = [
      ...completed,
      ...queued.map((item) => `Queued for review: ${item}`),
    ].join('. ');
    return NextResponse.json({
      ok: true,
      mode: 'completed',
      requiresConfirmation: false,
      actions: proposals,
      message: summary || 'The approved request is complete.',
      receipt: {
        id: randomUUID(),
        summary: summary || 'Approved Shakti action completed',
        destinations: [...new Set(proposals.flatMap((proposal) => proposal.destinations))],
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown Shakti error';
    console.error('[api/shakti/command]', detail);
    return NextResponse.json({ ok: false, message: `Shakti could not complete that request. ${detail}` }, { status: 500 });
  }
}
