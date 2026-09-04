import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PlanTimeObservatory } from '@/components/calendar/plan-time-observatory';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const events = await getCalendarEventsByUser(session.user.id);

  return <PlanTimeObservatory initialEvents={events} />;
}
