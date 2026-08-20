import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensurePersonalOsInstalled } from '@/lib/personal-os/install';
import { orchestrateNow } from '@/lib/personal-os/orchestrator';
import { personalHabits, personalRoutines, routinesForDate, workoutForDate } from '@/lib/personal-os/source-of-truth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ ok: false, message: 'Sign in again so Glow can answer from your life.' }, { status: 401 });

    const body = await request.json() as { text?: string };
    const text = String(body.text ?? '').trim();
    if (!text) return NextResponse.json({ ok: false, message: 'Ask Glow something first.' }, { status: 400 });

    await ensurePersonalOsInstalled(session.user.id);
    const now = new Date();
    const value = text.toLowerCase();
    const context = `${now.toLocaleDateString('en-US', { weekday: 'long' })} ${daypart(now)}`;

    if (/what should i do|what do i do|what now|what('?s| is) next|what should i be doing|how should i spend|plan my (day|night|evening|morning)|what needs my attention/.test(value)) {
      const result = await orchestrateNow(session.user.id, now);
      return NextResponse.json({ ok: true, message: `${result.headline}. ${result.message}`, headline: result.headline, nextAction: result.nextAction, secondary: result.secondary, context });
    }

    if (/workout|training|gym|exercise/.test(value)) {
      const workout = workoutForDate(now);
      return NextResponse.json({ ok: true, message: `Today is ${workout.name}. ${workout.purpose} Your plan is ${workout.exercises.join(', ')}.`, href: '/fitness/plan', context });
    }

    if (/routine|ritual|reset|wind down|bedtime|morning|midday|afternoon|evening|night/.test(value)) {
      const routine = routineForQuestion(value, now);
      if (routine) {
        const first = routine.steps.slice(0, 5).map((step, index) => `${index + 1}. ${step.title}`).join(' ');
        return NextResponse.json({ ok: true, message: `For this ${context}, use ${routine.name}. Start here: ${first}`, href: `/routines?routine=${encodeURIComponent(routine.key)}`, context });
      }
    }

    if (/habit|habits|consistent|consistency/.test(value)) {
      const names = personalHabits.slice(0, 8).map((habit) => habit.name).join(', ');
      return NextResponse.json({ ok: true, message: `Your core habits include ${names}. I can open Habits or help you choose the most important ones for right now.`, href: '/habits', context });
    }

    if (/calendar|schedule|appointment|event/.test(value)) {
      return NextResponse.json({ ok: true, message: `I can help with your schedule. Open Calendar to inspect the exact events, or tell me what you want changed and I’ll prepare it for review.`, href: '/calendar', context });
    }

    if (/reminder|remember/.test(value)) {
      return NextResponse.json({ ok: true, message: `I can help with reminders. Tell me what needs to happen and when, and I’ll prepare it safely.`, href: '/reminders', context });
    }

    if (/task|todo|to-do|priority/.test(value)) {
      return NextResponse.json({ ok: true, message: `I can help sort tasks and priorities. Ask “what should I do?” for one recommended next move, or open Tasks to see the full list.`, href: '/tasks', context });
    }

    return NextResponse.json({
      ok: true,
      message: `I heard you. I don’t have a confident life-data answer for that exact question yet, so I won’t make one up. I can search your Glow OS for it, or you can ask me to act on it.`,
      href: `/search?q=${encodeURIComponent(text)}`,
      context,
      fallback: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Glow could not answer that yet.';
    console.error('[api/glow/ask]', message);
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
