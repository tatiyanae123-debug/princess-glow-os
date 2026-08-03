import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';

export const dynamic = 'force-dynamic';

export default async function MoneyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const entries = await getFinanceEntriesByUser(session.user.id);

  const income = entries.filter((e) => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0);
  const expenses = entries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0);
  const savings = entries.filter((e) => e.type === 'saving').reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <AppShell>
      <SectionPage eyebrow="Finance" title="A calm view of your money" description="Financial clarity should feel reassuring, not intense.">
        <Card className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="font-medium text-slate-900 dark:text-slate-100">Income</p>
            <p className="mt-2 text-xl font-semibold text-emerald-600 dark:text-emerald-400">${income.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="font-medium text-slate-900 dark:text-slate-100">Expenses</p>
            <p className="mt-2 text-xl font-semibold text-rose-600 dark:text-rose-400">${expenses.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="font-medium text-slate-900 dark:text-slate-100">Savings</p>
            <p className="mt-2 text-xl font-semibold text-amber-600 dark:text-amber-400">${savings.toLocaleString('en', { minimumFractionDigits: 2 })}</p>
          </div>
        </Card>
        {entries.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">No entries yet. Add your first financial record.</p>
        )}
      </SectionPage>
    </AppShell>
  );
}
