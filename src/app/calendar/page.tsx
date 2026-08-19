import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CalendarRouteExperience } from '@/components/calendar/calendar-route-experience';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const events = await getCalendarEventsByUser(session.user.id);

  return (
    <AppShell>
      <div className="batch1-calendar-reference">
        <CalendarRouteExperience initialEvents={events} />
      </div>
    </AppShell>
  );
}
