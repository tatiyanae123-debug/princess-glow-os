'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { db } from '@/db';
import { briefingSnapshots } from '@/db/schema/completion-v1';
import { buildPersonalContext } from '@/lib/intelligence/context';

export type BriefingKind = 'morning' | 'evening' | 'weekly' | 'monthly' | 'tomorrow';

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

function isoWeekKey(date: Date) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function periodKey(kind: BriefingKind, date: Date) {
  if (kind === 'weekly') return isoWeekKey(date);
  if (kind === 'monthly') return date.toISOString().slice(0, 7);
  return date.toISOString().slice(0, 10);
}

function summaryFor(kind: BriefingKind, context: Awaited<ReturnType<typeof buildPersonalContext>>) {
  const eventCount = context.todaysEvents.length;
  const openTasks = context.unfinishedTasks.length;
  const overdue = context.overdueTasks.length;
  const completedHabits = context.habits.filter((habit) => habit.completedToday).length;
  const habitTotal = context.habits.length;
  const topRecommendation = context.recommendations[0]?.title;

  if (kind === 'tomorrow') {
    return `${context.todayLabel} is carrying ${eventCount} event${eventCount === 1 ? '' : 's'} and ${openTasks} open task${openTasks === 1 ? '' : 's'}. ${topRecommendation ? `Protect space for ${topRecommendation}.` : 'Keep the plan intentionally light and realistic.'}`;
  }
  if (kind === 'evening') {
    return `Close the day with ${openTasks} unfinished task${openTasks === 1 ? '' : 's'}, ${overdue} overdue, and ${completedHabits} of ${habitTotal} habits logged. Use the recommendations below to reduce tomorrow's carryover.`;
  }
  if (kind === 'weekly') {
    return `Weekly pulse: ${openTasks} open task${openTasks === 1 ? '' : 's'}, ${overdue} overdue, ${context.activeGoals.length} active goal${context.activeGoals.length === 1 ? '' : 's'}, and a current focus score of ${context.focusScore}.`;
  }
  if (kind === 'monthly') {
    return `Monthly checkpoint: ${context.activeGoals.length} active goal${context.activeGoals.length === 1 ? '' : 's'}, ${openTasks} open task${openTasks === 1 ? '' : 's'}, ${overdue} overdue, and ${context.focusScore}/100 current focus. Use this snapshot to decide what deserves more or less attention next month.`;
  }
  return `${context.dailyBrief} Your focus score is ${context.focusScore}/100.${topRecommendation ? ` Best next move: ${topRecommendation}.` : ''}`;
}

export async function generateExpandedBriefingAction(kind: BriefingKind) {
  const userId = await requireUser();

  try {
    const contextDate = new Date();
    if (kind === 'tomorrow') contextDate.setDate(contextDate.getDate() + 1);
    const context = await buildPersonalContext(userId, contextDate);

    await db.insert(briefingSnapshots).values({
      userId,
      kind,
      periodKey: periodKey(kind, context.generatedAt),
      content: {
        dailyBrief: context.dailyBrief,
        summary: summaryFor(kind, context),
        focusScore: context.focusScore,
        unfinishedTasks: context.unfinishedTasks.length,
        overdueTasks: context.overdueTasks.length,
        todaysEvents: context.todaysEvents.length,
        openAppleReminders: context.appleReminders.filter((item) => !item.completed).length,
        habitsCompleted: context.habits.filter((habit) => habit.completedToday).length,
        habitsTotal: context.habits.length,
        activeGoals: context.activeGoals,
        recommendations: context.recommendations.slice(0, 5),
        attentionSignals: context.attentionSignals.slice(0, 4),
        patterns: context.patterns.slice(0, 4),
        targetDate: context.generatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[Glow OS] expanded briefing generation unavailable', error);
  }

  revalidatePath('/briefings');
}
