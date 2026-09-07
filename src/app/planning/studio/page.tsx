import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { PlanPlanningStudioV2, type PlanPlanningItemV2, type PlanStudioEventV2 } from '@/components/plan/plan-reference-v2';
import { getPlanningPeriods } from '@/lib/data/completion-v1';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

export const dynamic = 'force-dynamic';

export default async function PlanningStudioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const [periods, events] = await Promise.all([getPlanningPeriods(userId), getCalendarEventsByUser(userId)]);
  const planning: PlanPlanningItemV2[] = periods.filter((period) => !period.archived).map((period) => ({
    id: period.id,
    title: period.title,
    level: period.level,
    focus: period.focus,
    progress: period.progress,
    startsAt: period.startsAt?.toISOString() ?? null,
    endsAt: period.endsAt?.toISOString() ?? null,
  }));
  const calendar: PlanStudioEventV2[] = events.filter((event) => !event.archived).map((event) => ({
    id: event.id,
    title: event.title,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt?.toISOString() ?? null,
    allDay: event.allDay,
    source: event.source,
  }));
  return <PlanPlanningStudioV2 events={calendar} planning={planning} />;
}
