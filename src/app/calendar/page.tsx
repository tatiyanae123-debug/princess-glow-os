import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PlanCalendarReference, type PlanCalendarEvent } from '@/components/plan/plan-calendar-reference';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const events = await getCalendarEventsByUser(session.user.id);
  const items: PlanCalendarEvent[] = events.filter((event) => !event.archived).map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    startAt: event.startAt.toISOString(),
    endAt: event.endAt?.toISOString() ?? null,
    location: event.location,
    allDay: event.allDay,
    color: event.color,
    source: event.source,
  }));

  return <PlanCalendarReference events={items} />;
}
