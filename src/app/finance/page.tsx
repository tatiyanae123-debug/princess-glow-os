import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { MoneyGrowthExperience } from '@/components/finance/money-growth-experience';
import { FinanceEntryManager } from '@/components/finance/finance-entry-manager';
import { FinanceExactEntryEditor } from '@/components/finance/finance-exact-entry-editor';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getFinanceGoals } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ entryId?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const [entries, goals, params] = await Promise.all([
    getFinanceEntriesByUser(session.user.id),
    getFinanceGoals(session.user.id),
    searchParams,
  ]);
  const selected = params.entryId ? entries.find((entry) => entry.id === params.entryId) ?? null : null;

  return (
    <AppShell>
      <div className="space-y-6">
        {params.entryId && !selected ? <div role="status" className="rounded-[14px] border border-[#F7D1D8] bg-[#F7EEED] px-4 py-3 text-[11px] text-[#7B535C]">That finance record is no longer available.</div> : null}
        {selected ? <FinanceExactEntryEditor entry={selected} /> : null}
        <MoneyGrowthExperience entries={entries} goals={goals} />
        <FinanceEntryManager initialEntries={entries} initialGoals={goals} />
      </div>
    </AppShell>
  );
}
