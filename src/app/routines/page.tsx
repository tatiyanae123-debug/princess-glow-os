import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { RoutinesExperience } from '@/components/routines/routines-experience';
import { getRoutinesByUser, getStepsByUser } from '@/lib/data/routines';

export const dynamic = 'force-dynamic';

export default async function RoutinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [routines, steps] = await Promise.all([
    getRoutinesByUser(session.user.id),
    getStepsByUser(session.user.id),
  ]);

  return (
    <AppShell>
      <RoutinesExperience initialRoutines={routines} initialSteps={steps} />
    </AppShell>
  );
}
