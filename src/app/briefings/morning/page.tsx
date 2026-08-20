import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { MorningIntelligenceBriefing } from '@/components/briefings/morning-intelligence-briefing';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getNotesByUser } from '@/lib/data/notes';
import { getLifeModes } from '@/lib/intelligence/adaptive-os';
import { ensurePersonalOsInstalled } from '@/lib/personal-os/install';
import { routinesForDate, workoutForDate } from '@/lib/personal-os/source-of-truth';

export const dynamic = 'force-dynamic';

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDraftTitles(content: string | null) {
  if (!content) return [];
  return content
    .split('\n')
    .map((line) => line.replace(/^\s*\d+[.)]\s*/, '').trim())
    .filter((line) => line && line !== 'No priority tasks drafted. Protect open space.')
    .slice(0, 3);
}

export default async function MorningBriefPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  await ensurePersonalOsInstalled(userId);

  const [tasks, events, wellnessEntries, notes, modes] = await Promise.all([
    getTasksByUser(userId),
    getCalendarEventsByUser(userId),
    getWellnessEntriesByUser(userId),
    getNotesByUser(userId),
    getLifeModes(userId),
  ]);

  const now = new Date();
  const todayKey = localDateKey(now);
  const activeMode = modes.find((mode) => mode.isActive);
  const todayEvents = events
    .filter((event) => localDateKey(event.startAt) === todayKey)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  const draftNote = notes.find((note) => note.tags?.includes('tomorrow-top3') && note.tags?.includes(todayKey));
  const draftTitles = parseDraftTitles(draftNote?.content ?? null);
  const draftOrder = new Map(draftTitles.map((title, index) => [title.toLowerCase(), index]));
  const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
  const openTasks = tasks
    .filter((task) => task.status !== 'done' && task.status !== 'cancelled')
    .sort((a, b) => {
      const aDraft = draftOrder.get(a.title.toLowerCase());
      const bDraft = draftOrder.get(b.title.toLowerCase());
      if (aDraft != null || bDraft != null) {
        if (aDraft == null) return 1;
        if (bDraft == null) return -1;
        return aDraft - bDraft;
      }
      const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return (a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER);
    });

  const scheduledRoutines = routinesForDate(now);
  const morning = scheduledRoutines.find((routine) => routine.key === 'morning-ritual') ?? null;
  const workout = workoutForDate(now);
  const wellness = wellnessEntries.find((entry) => localDateKey(new Date(entry.entryDate)) === todayKey) ?? wellnessEntries[0] ?? null;

  return (
    <AppShell>
      <MorningIntelligenceBriefing
        modeName={activeMode?.name ?? 'Normal Day'}
        tasks={openTasks.map((task) => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate?.toISOString() ?? null,
        }))}
        events={todayEvents.map((event) => ({
          id: event.id,
          title: event.title,
          startAt: event.startAt.toISOString(),
          allDay: event.allDay,
        }))}
        energy={wellness?.energy ?? null}
        morningRoutine={morning ? {
          key: morning.key,
          name: morning.name,
          steps: morning.steps.map((step) => ({ title: step.title })),
        } : null}
        workout={{ name: workout.name, purpose: workout.purpose }}
      />
    </AppShell>
  );
}
