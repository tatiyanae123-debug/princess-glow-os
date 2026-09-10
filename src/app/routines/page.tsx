import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { RoutineReferenceWorld } from '@/components/routines/routine-reference-world';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RoutinesPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const params = await searchParams;
  if (params.category === 'daily-life' && params.routine === 'morning-routine') {
    redirect('/routines/daily-life/morning');
  }

  return <RoutineReferenceWorld />;
}
