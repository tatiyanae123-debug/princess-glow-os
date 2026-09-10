import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { RoutineWorldV2 } from '@/components/routines/routine-world-v2';

export const dynamic = 'force-dynamic';

export default async function RoutinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <AppShell>
      <RoutineWorldV2 />
    </AppShell>
  );
}
