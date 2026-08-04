import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { HabitManager } from '@/components/habits/habit-manager';
import { getHabitsByUser } from '@/lib/data/habits';

export const dynamic = 'force-dynamic';

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const habits = await getHabitsByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Habits" title="Tiny rituals that compound" description="The smallest daily actions create the strongest sense of care and consistency.">
        <HabitManager initialHabits={habits} />
      </SectionPage>
    </AppShell>
  );
}
