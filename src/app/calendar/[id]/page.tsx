import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { CalendarEventDetailWorkspace } from '@/components/calendar/calendar-event-detail-workspace';
import { getCalendarEventById } from '@/lib/data/calendar-events';

export const dynamic = 'force-dynamic';

export default async function CalendarEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const { id } = await params;
  const event = await getCalendarEventById(id, session.user.id);
  if (!event || event.archived) notFound();

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Plan · Calendar · Event"
        title={event.title}
        question="One event, one identity. Edit the real calendar object and let the rest of Glow reconcile around it."
        climate="plan"
        destinations={[
          { label: 'Calendar', href: '/calendar', cue: 'Return to time' },
          { label: 'Day Flow', href: '/living/day-flow', cue: 'See it in context' },
          { label: 'Planning Studio', href: '/living/planning-studio', cue: 'Rebalance the horizon' },
        ]}
      >
        <CalendarEventDetailWorkspace event={event} />
      </CanonicalDomainRoom>
    </AppShell>
  );
}
