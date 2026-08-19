import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch5GoalsView } from '@/components/goals/batch5-goals-view';
import { getGoalsByUser } from '@/lib/data/goals';

export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const goals = await getGoalsByUser(session.user.id);
  return <AppShell><Batch5GoalsView goals={goals} /></AppShell>;
}
