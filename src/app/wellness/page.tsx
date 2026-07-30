import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';

const wellness = [
  { title: 'Sleep', detail: 'Protect your evening wind-down and stay consistent.' },
  { title: 'Movement', detail: 'A light walk can restore energy without pressure.' },
  { title: 'Breath', detail: 'Take a few minutes to soften the nervous system.' },
];

export default function WellnessPage() {
  return (
    <AppShell>
      <SectionPage eyebrow="Wellness" title="Energy that feels supported" description="Let wellness be practical, restorative, and deeply personal.">
        <Card className="grid gap-3 md:grid-cols-3">
          {wellness.map((item) => (
            <div key={item.title} className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
            </div>
          ))}
        </Card>
      </SectionPage>
    </AppShell>
  );
}
