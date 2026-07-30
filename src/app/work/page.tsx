import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';

const workItems = [
  { title: 'Shape the next launch', detail: 'Keep work honest and achievable.' },
  { title: 'Reply to priority messages', detail: 'Respond with clarity and warmth.' },
];

export default function WorkPage() {
  return (
    <AppShell>
      <SectionPage eyebrow="Work" title="Make your workday feel structured and light" description="Create momentum with clarity, structure, and enough softness to sustain it.">
        <Card className="grid gap-3 md:grid-cols-2">
          {workItems.map((item) => (
            <div key={item.title} className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
            </div>
          ))}
        </Card>
      </SectionPage>
    </AppShell>
  );
}
