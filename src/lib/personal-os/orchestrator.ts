import { buildPersonalContext } from '@/lib/intelligence/context';
import { routinesForDate, workoutForDate } from './source-of-truth';

export type GlowOrchestration = {
  headline: string;
  message: string;
  nextAction: { label: string; href: string };
  secondary: Array<{ label: string; href: string }>;
  reasons: string[];
};

function hourBucket(date: Date) {
  const hour = date.getHours();
  if (hour < 11) return 'morning';
  if (hour < 15) return 'midday';
  if (hour < 19) return 'afternoon';
  return 'night';
}

export async function orchestrateNow(userId: string, date = new Date()): Promise<GlowOrchestration> {
  const context = await buildPersonalContext(userId, date);
  const bucket = hourBucket(date);
  const workout = workoutForDate(date);
  const routines = routinesForDate(date);
  const openTasks = context.unfinishedTasks;
  const nextEvent = context.todaysEvents
    .filter((event) => event.startAt.getTime() >= date.getTime())
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0];
  const recommendation = context.recommendations[0];
  const reasons: string[] = [];

  if (nextEvent) reasons.push(`Your next calendar commitment is ${nextEvent.title}.`);
  if (openTasks.length) reasons.push(`${openTasks.length} task${openTasks.length === 1 ? '' : 's'} remain open.`);
  reasons.push(`Your training plan assigns ${workout.name} today.`);

  if (bucket === 'morning') {
    return {
      headline: 'Start with your morning ritual.',
      message: `Do the ritual in order instead of deciding everything at once. After that, Glow can protect your top priorities around ${nextEvent ? `your ${nextEvent.startAt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})} commitment` : 'your open calendar'}.`,
      nextAction: { label: 'Start Morning Ritual', href: '/routines?routine=morning-ritual&focus=1' },
      secondary: [{ label: 'Morning Brief', href: '/briefings/morning' }, { label: 'Morning Card', href: '/glow-cards?kind=morning' }],
      reasons,
    };
  }

  if (bucket === 'midday') {
    return {
      headline: 'Reset before adding more.',
      message: 'Use the Midday Reset: pause, hydrate, review what is already complete, then choose one next action. Do not turn the reset into another planning session.',
      nextAction: { label: 'Open Midday Reset', href: '/routines?routine=midday-reset&focus=1' },
      secondary: [{ label: 'Today’s Tasks', href: '/tasks' }, { label: 'Midday Card', href: '/glow-cards?kind=midday' }],
      reasons,
    };
  }

  if (bucket === 'night') {
    return {
      headline: 'Close the day instead of carrying it.',
      message: 'Run the Night Ritual, move unfinished work realistically, prepare tomorrow, and let the rest stay closed until morning.',
      nextAction: { label: 'Start Night Ritual', href: '/routines?routine=night-ritual&focus=1' },
      secondary: [{ label: 'Night Card', href: '/glow-cards?kind=night' }, { label: 'Plan Tomorrow', href: '/planning?view=tomorrow' }],
      reasons,
    };
  }

  if (recommendation) {
    return {
      headline: recommendation.title,
      message: recommendation.reason || 'This is the highest-value move Glow can see from the current context.',
      nextAction: { label: 'Go to Today', href: '/today' },
      secondary: [{ label: 'Tasks', href: '/tasks' }, { label: workout.name, href: '/fitness/plan' }],
      reasons,
    };
  }

  return {
    headline: openTasks[0]?.title || `Protect time for ${workout.name}.`,
    message: openTasks[0] ? 'Take one clear action before opening another list.' : 'Your task list is quiet enough to protect movement, food, hydration and recovery.',
    nextAction: openTasks[0] ? { label: 'Open Tasks', href: '/tasks' } : { label: 'Open Workout', href: '/fitness/plan' },
    secondary: routines.filter((r) => r.daysOfWeek).slice(0, 2).map((r) => ({ label: r.name, href: `/routines?routine=${r.key}` })),
    reasons,
  };
}
