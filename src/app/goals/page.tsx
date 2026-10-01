import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { GoalManager } from '@/components/goals/goal-manager';
import { getGoalsByUser } from '@/lib/data/goals';

export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const goals = (await getGoalsByUser(session.user.id)).filter((goal) => !goal.archived);

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Plan · Goals"
        title="Goals"
        question="Distant tomorrows, made visible. Every goal here is a real canonical Glow object with editable progress, dates, and status."
        climate="plan"
        destinations={[
          { label: 'Moving Forward', href: '/living/moving-forward', cue: 'See active progress' },
          { label: 'Projects', href: '/projects', cue: 'Connected work' },
          { label: 'What Now?', href: '/living/what-now', cue: 'Turn direction into action' },
        ]}
      >
        <GoalManager initialGoals={goals} />
      </CanonicalDomainRoom>
    </AppShell>
  );
}
