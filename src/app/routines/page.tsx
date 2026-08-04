import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { RoutineManager } from '@/components/routines/routine-manager';
import { getRoutinesByUser } from '@/lib/data/routines';

export const dynamic = 'force-dynamic';

export default async function RoutinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const routines = await getRoutinesByUser(session.user.id);

  return (
    <AppShell>
      <RoutineManager initialRoutines={routines} />
    </AppShell>
  );
}
