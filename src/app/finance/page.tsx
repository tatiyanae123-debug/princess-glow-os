import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';

export default function FinancePage() {
  return (
    <AppShell>
      <SectionPage eyebrow="Finance" title="Your wealth in one clear view" description="A calmer relationship with money begins with honest visibility and gentle structure.">
        <Card className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="font-medium text-slate-900 dark:text-slate-100">Savings</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">A stable cushion for soft, intentional growth.</p>
          </div>
          <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="font-medium text-slate-900 dark:text-slate-100">Spending</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Keep comfort spending within the weekly plan.</p>
          </div>
          <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="font-medium text-slate-900 dark:text-slate-100">Upcoming</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Review bills and subscriptions before the weekend.</p>
          </div>
        </Card>
      </SectionPage>
    </AppShell>
  );
}
