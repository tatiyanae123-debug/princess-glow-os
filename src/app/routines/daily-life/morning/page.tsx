import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { RoutineMorningWorld } from '@/components/routines/routine-morning-world';

export const dynamic = 'force-dynamic';

export default async function MorningRoutinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return <RoutineMorningWorld />;
}
