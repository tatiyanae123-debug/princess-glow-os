import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PlanGoalsReferenceV4, type PlanGoalItem } from '@/components/plan/plan-goals-reference-v4';
import { getGoalsByUser } from '@/lib/data/goals';

export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const goals = await getGoalsByUser(session.user.id);
  const items: PlanGoalItem[] = goals.filter((goal) => !goal.archived).map((goal) => ({
    id: goal.id,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    status: goal.status,
    targetDate: goal.targetDate?.toISOString() ?? null,
    progress: goal.progress,
  }));
  return <PlanGoalsReferenceV4 goals={items} />;
}
