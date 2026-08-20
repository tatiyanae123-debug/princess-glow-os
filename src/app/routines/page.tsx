import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { RoutinesRouteExperience } from '@/components/routines/routines-route-experience';
import { getRoutinesByUser, getStepsByUser } from '@/lib/data/routines';
import { ensurePersonalOsInstalled } from '@/lib/personal-os/install';

export const dynamic = 'force-dynamic';

export default async function RoutinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  await ensurePersonalOsInstalled(session.user.id);
  const [routines, steps] = await Promise.all([
    getRoutinesByUser(session.user.id),
    getStepsByUser(session.user.id),
  ]);

  return (
    <AppShell>
      <RoutinesRouteExperience initialRoutines={routines} initialSteps={steps} />
    </AppShell>
  );
}
