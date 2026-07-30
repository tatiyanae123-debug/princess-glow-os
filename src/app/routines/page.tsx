import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';

const routines = [
  'Morning: tea, stretch, and plan',
  'Midday: reset and nourish',
  'Evening: tidy, reflect, and rest',
];

export default function RoutinesPage() {
  return (
    <AppShell>
      <SectionPage eyebrow="Routines" title="Design repeatable rituals that feel effortless" description="Repeatable rituals reduce decision fatigue and create a steady sense of ease throughout the day.">
        <Card className="space-y-3">
          {routines.map((routine) => (
            <div key={routine} className="rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              {routine}
            </div>
          ))}
        </Card>
      </SectionPage>
    </AppShell>
  );
}
