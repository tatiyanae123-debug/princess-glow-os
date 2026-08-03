import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { HabitCard } from '@/components/ui/habit-card';
import { getHabitsByUser } from '@/lib/data/habits';

export const dynamic = 'force-dynamic';

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const habits = await getHabitsByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Habits" title="Tiny rituals that compound" description="The smallest daily actions create the strongest sense of care and consistency.">
        {habits.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">No habits yet. Add your first habit to start tracking.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                name={habit.name}
                progress={0}
                streak={0}
                note={habit.description ?? `${habit.frequency} · target ${habit.targetCount}×`}
              />
            ))}
          </div>
        )}
      </SectionPage>
    </AppShell>
  );
}
