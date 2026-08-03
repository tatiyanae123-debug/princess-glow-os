import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const entries = await getFinanceEntriesByUser(session.user.id);

  const income = entries.filter((e) => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0);
  const expenses = entries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0);
  const savings = entries.filter((e) => e.type === 'saving').reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <AppShell>
      <SectionPage eyebrow="Finance" title="Your wealth in one clear view" description="A calmer relationship with money begins with honest visibility and gentle structure.">
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
        {entries.length > 0 && (
          <Card className="space-y-2 mt-4">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Recent entries</p>
            {entries.slice(0, 8).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-[16px] border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{entry.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{entry.category} · {entry.entryDate}</p>
                </div>
                <span className={`text-sm font-semibold ${entry.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {entry.type === 'income' ? '+' : '−'}${Number(entry.amount).toLocaleString('en', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </Card>
        )}
        {entries.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">No entries yet. Add your first financial record.</p>
        )}
      </SectionPage>
    </AppShell>
  );
}
