import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';

const tasks = [
  { title: 'Send proposal', note: 'Share the draft before the afternoon call.' },
  { title: 'Book salon appointment', note: 'Reserve a slot for the next few days.' },
  { title: 'Draft weekend plan', note: 'Choose one outing and one reset activity.' },
];

export default function TasksPage() {
  return (
    <AppShell>
      <SectionPage eyebrow="Tasks" title="What deserves your attention" description="A calm, focused list that protects your energy and keeps your priorities visible.">
        <Card className="space-y-3">
          {tasks.map((task) => (
            <div key={task.title} className="flex items-center justify-between rounded-[20px] border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{task.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{task.note}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Ready</span>
            </div>
          ))}
        </Card>
      </SectionPage>
    </AppShell>
  );
}
