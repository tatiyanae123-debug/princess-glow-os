import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { RoutineManager } from '@/components/routines/routine-manager';
import { getRoutinesByUser } from '@/lib/data/routines';

export const dynamic = 'force-dynamic';

export default async function RoutineManagementPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const routines = await getRoutinesByUser(session.user.id);

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Life · Routines · Manage"
        title="Routine Studio"
        question="Create, edit, and maintain the real routine objects that power Today, Beauty, Fitness, and the rest of Glow."
        climate="wellness"
        destinations={[
          { label: 'Routine World', href: '/routines', cue: 'Browse your routines' },
          { label: 'Today Systems', href: '/living/today-systems', cue: 'See today’s routine projection' },
          { label: 'Midday Reset', href: '/living/midday-reset', cue: 'Open routine execution' },
        ]}
      >
        <RoutineManager initialRoutines={routines} />
      </CanonicalDomainRoom>
    </AppShell>
  );
}
