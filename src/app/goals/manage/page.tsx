import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { GoalManager } from '@/components/goals/goal-manager';
import { getGoalsByUser } from '@/lib/data/goals';

export const dynamic = 'force-dynamic';

export default async function GoalsManagementPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const goals = await getGoalsByUser(session.user.id);
  return (
    <AppShell>
      <SectionPage eyebrow="Goals" title="Manage goal objects" description="Create, edit, update progress, and maintain the same goals shown in the Plan horizon landscape.">
        <GoalManager initialGoals={goals} />
      </SectionPage>
    </AppShell>
  );
}
