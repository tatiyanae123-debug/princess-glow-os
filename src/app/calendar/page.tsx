import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { EventManager } from '@/components/calendar/event-manager';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const events = await getCalendarEventsByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Calendar" title="A beautifully paced week" description="Keep your commitments visible without letting the schedule feel crowded.">
        <EventManager initialEvents={events} />
      </SectionPage>
    </AppShell>
  );
}
