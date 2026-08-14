import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { GoalsRouteExperience } from '@/components/goals/goals-route-experience';
import { getGoalsByUser } from '@/lib/data/goals';

export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const goals = await getGoalsByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Goals" title="Ambition that feels grounded" description="Let your goals stay visible and aligned with your daily life.">
        <GoalsRouteExperience initialGoals={goals} />
      </SectionPage>
    </AppShell>
  );
}
