import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensurePersonalOsInstalled } from '@/lib/personal-os/install';
import { orchestrateNow } from '@/lib/personal-os/orchestrator';
import { personalHabits, personalRoutines, routinesForDate, workoutForDate } from '@/lib/personal-os/source-of-truth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Turn = { role: 'user' | 'assistant'; content: string };

function daypart(date: Date) {
  const hour = date.getHours();
  if (hour < 11) return 'morning';
  if (hour < 16) return 'afternoon';
  if (hour < 20) return 'evening';
  return 'night';
}

function routineForQuestion(text: string, now: Date) {
  const value = text.toLowerCase();
  if (/morning/.test(value)) return personalRoutines.find((r) => r.key === 'morning-ritual');
  if (/midday|afternoon/.test(value)) return personalRoutines.find((r) => r.key === 'midday-reset');
  if (/night|evening|wind down|bed/.test(value)) return personalRoutines.find((r) => r.key === 'night-ritual');
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return routinesForDate(now).find((r) => r.daysOfWeek?.includes(day)) ?? routinesForDate(now)[0];
}

function recentUser(history: Turn[]) {
  return [...history].reverse().find((turn) => turn.role === 'user')?.content ?? '';
}

function recentAssistant(history: Turn[]) {
  return [...history].reverse().find((turn) => turn.role === 'assistant')?.content ?? '';
}

function expandFollowUp(text: string, history: Turn[]) {
  const value = text.trim().toLowerCase();
  const previousUser = recentUser(history).toLowerCase();
  const previousAssistant = recentAssistant(history).toLowerCase();
  const context = `${previousUser} ${previousAssistant}`;
  if (!history.length) return text;

  if (/^(what about|and|okay but|but|how about|then what|after that|what next|next|why|when|how|which one|tell me more|go on|continue)\b/.test(value)) {
    if (/workout|training|gym|exercise/.test(context)) return `${text} about today's workout and fitness plan`;
    if (/routine|ritual|reset|wind down|night|morning|midday/.test(context)) return `${text} about the routine we were discussing`;
    if (/habit|habits/.test(context)) return `${text} about my habits`;
    if (/calendar|schedule|appointment|event/.test(context)) return `${text} about my schedule`;
    if (/task|priority|to-do|todo/.test(context)) return `${text} about my tasks and priorities`;
    if (/what should i do|next move|right now/.test(context)) return `${text} about what I should do next right now`;
  }
  return text;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, message: 'Sign in again so Glow can answer from your life.' }, { status: 401 });

    const body = await request.json() as { text?: string; history?: Turn[] };
    const rawText = String(body.text ?? '').trim();
    const history = Array.isArray(body.history) ? body.history.slice(-12).filter((turn): turn is Turn => Boolean(turn && (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string')) : [];
    if (!rawText) return NextResponse.json({ ok: false, message: 'Ask Glow something first.' }, { status: 400 });

    await ensurePersonalOsInstalled(session.user.id);
    const now = new Date();
    const text = expandFollowUp(rawText, history);
    const value = text.toLowerCase();
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
    const context = `${weekday} ${daypart(now)}`;

    if (/what should i do|what do i do|what now|what('?s| is) next|what should i be doing|how should i spend|plan my (day|night|evening|morning)|what needs my attention|then what|after that|what next/.test(value)) {
      const result = await orchestrateNow(session.user.id, now);
      return NextResponse.json({ ok: true, message: `${result.headline}. ${result.message}`, headline: result.headline, nextAction: result.nextAction, secondary: result.secondary, context });
    }

    if (/workout|training|gym|exercise/.test(value)) {
      const workout = workoutForDate(now);
      if (/why/.test(value)) return NextResponse.json({ ok: true, message: `${workout.name} is scheduled today because the plan is balancing ${workout.purpose.toLowerCase()} with the rest of your weekly split.`, href: '/fitness/plan', context });
      if (/after|then|next/.test(value)) return NextResponse.json({ ok: true, message: `After ${workout.name}, keep the rest of the day recovery-friendly: hydrate, eat a protein-focused meal, complete your normal evening care, and protect sleep.`, href: '/fitness/plan', context });
      return NextResponse.json({ ok: true, message: `Today is ${workout.name}. ${workout.purpose} Your plan is ${workout.exercises.join(', ')}.`, href: '/fitness/plan', context });
    }

    if (/routine|ritual|reset|wind down|bedtime|morning|midday|afternoon|evening|night/.test(value)) {
      const routine = routineForQuestion(value, now);
      if (routine) {
        if (/tell me more|continue|go on|all of it|full/.test(value)) {
          const all = routine.steps.map((step, index) => `${index + 1}. ${step.title}${step.notes ? ` — ${step.notes}` : ''}`).join(' ');
          return NextResponse.json({ ok: true, message: `${routine.name}: ${all}`, href: `/routines?routine=${encodeURIComponent(routine.key)}`, context });
        }
        const first = routine.steps.slice(0, 5).map((step, index) => `${index + 1}. ${step.title}`).join(' ');
        return NextResponse.json({ ok: true, message: `For this ${context}, use ${routine.name}. Start here: ${first}`, href: `/routines?routine=${encodeURIComponent(routine.key)}`, context });
      }
    }

    if (/habit|habits|consistent|consistency/.test(value)) {
      const names = personalHabits.slice(0, 10).map((habit) => habit.name).join(', ');
      return NextResponse.json({ ok: true, message: `Your core habits include ${names}. If you want, ask me “which three matter most right now?” and I’ll narrow it down for this moment.`, href: '/habits', context });
    }

    if (/which three|top three|most important/.test(value) && /habit|priority|right now/.test(`${value} ${recentAssistant(history).toLowerCase()}`)) {
      const result = await orchestrateNow(session.user.id, now);
      return NextResponse.json({ ok: true, message: `For right now, make it simple: 1. ${result.nextAction.label}. 2. Hydration. 3. Your current daypart routine. Those three give you momentum without turning the whole system into homework.`, nextAction: result.nextAction, secondary: result.secondary, context });
    }

    if (/calendar|schedule|appointment|event/.test(value)) {
      return NextResponse.json({ ok: true, message: `I can keep talking this through with you. For exact event details, open Calendar; if you tell me what you want changed, I’ll prepare the change for review rather than guessing.`, href: '/calendar', context });
    }

    if (/reminder|remember/.test(value)) {
      return NextResponse.json({ ok: true, message: `Tell me the reminder in plain English, including when it should happen. I’ll keep the conversation here and prepare the reminder safely.`, href: '/reminders', context });
    }

    if (/task|todo|to-do|priority/.test(value)) {
      return NextResponse.json({ ok: true, message: `We can work through your priorities conversationally. Ask me “what should I do first?”, “what can wait?”, or “what should I do after that?” and I’ll keep the thread going.`, href: '/tasks', context });
    }

    if (/thank|thanks/.test(value)) {
      return NextResponse.json({ ok: true, message: `Of course. I’m still here — keep talking to me naturally and I’ll stay with the same conversation.`, context });
    }

    if (/^(yes|yeah|yep|okay|ok|sure|please do|do that)\b/.test(value) && history.length) {
      return NextResponse.json({ ok: true, message: `Okay. I’m following the same thread. Tell me the next detail or say “what next?” and I’ll continue from where we were.`, context });
    }

    return NextResponse.json({
      ok: true,
      message: `I’m with you. I can keep this as a real back-and-forth conversation, but I don’t have a confident life-data answer for that exact point yet. I won’t invent one. You can keep explaining, ask a follow-up, or ask me to search the relevant part of Glow OS.`,
      href: `/search?q=${encodeURIComponent(rawText)}`,
      context,
      fallback: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Glow could not answer that yet.';
    console.error('[api/glow/ask]', message);
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
