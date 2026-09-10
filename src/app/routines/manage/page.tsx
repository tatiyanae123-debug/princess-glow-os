import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { RoutineReferenceWorld } from '@/components/routines/routine-reference-world';

export const dynamic = 'force-dynamic';

export default async function RoutineManagementPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return <RoutineReferenceWorld />;
}
