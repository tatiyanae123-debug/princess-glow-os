import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';

const goals = [
  { title: 'Create a signature offer', detail: 'Define one offer that feels clear and memorable.' },
  { title: 'Travel more intentionally', detail: 'Reserve one chapter of the year for rest and discovery.' },
];

export default function GoalsPage() {
  return (
    <AppShell>
      <SectionPage eyebrow="Goals" title="Ambition that feels grounded" description="Let your goals stay visible and aligned with your daily life.">
        <Card className="grid gap-3 md:grid-cols-2">
          {goals.map((goal) => (
            <div key={goal.title} className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="font-medium text-slate-900 dark:text-slate-100">{goal.title}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{goal.detail}</p>
            </div>
          ))}
        </Card>
      </SectionPage>
    </AppShell>
  );
}
