import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const events = await getCalendarEventsByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Calendar" title="A beautifully paced week" description="Keep your commitments visible without letting the schedule feel crowded.">
        {events.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">No events yet. Add your first event to start shaping the week.</p>
        ) : (
          <Card className="grid gap-3 md:grid-cols-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{event.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {event.allDay
                    ? event.startAt.toLocaleDateString('en', { month: 'short', day: 'numeric' })
                    : event.startAt.toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
                {event.description && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{event.description}</p>}
                {event.location && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{event.location}</p>}
              </div>
            ))}
          </Card>
        )}
      </SectionPage>
    </AppShell>
  );
}
