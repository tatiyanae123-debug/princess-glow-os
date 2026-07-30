import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { HabitCard } from '@/components/ui/habit-card';

const habits = [
  { name: 'Hydration', progress: 82, streak: 14, note: 'Two more glasses to complete the day.' },
  { name: 'Movement', progress: 64, streak: 8, note: 'A walk would feel especially good before dinner.' },
  { name: 'Journal', progress: 70, streak: 11, note: 'A few honest lines keep the mind clear.' },
];

export default function HabitsPage() {
  return (
    <AppShell>
      <SectionPage eyebrow="Habits" title="Tiny rituals that compound" description="The smallest daily actions create the strongest sense of care and consistency.">
        <div className="grid gap-4 md:grid-cols-3">
          {habits.map((habit) => (
            <HabitCard key={habit.name} {...habit} />
          ))}
        </div>
      </SectionPage>
    </AppShell>
  );
}
