import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { FinancialIntelligenceStudio } from '@/components/finance/financial-intelligence-studio';
import { FinanceEntryManager } from '@/components/finance/finance-entry-manager';
import { FinanceExactEntryEditor } from '@/components/finance/finance-exact-entry-editor';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getFinanceGoals } from '@/lib/data/completion-v1';
import { getGoalsByUser } from '@/lib/data/goals';
import { getProjectsByUser } from '@/lib/data/user-scope';

export const dynamic = 'force-dynamic';

export default async function FinancePage({ searchParams }: { searchParams: Promise<{ entryId?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const now = new Date();
  const [entries, financeGoals, lifeGoals, projects, params] = await Promise.all([
    getFinanceEntriesByUser(session.user.id),
    getFinanceGoals(session.user.id),
    getGoalsByUser(session.user.id),
    getProjectsByUser(session.user.id),
    searchParams,
  ]);
  const selected = params.entryId ? entries.find((entry) => entry.id === params.entryId) ?? null : null;

  return (
    <AppShell>
      <div className="space-y-6">
        {params.entryId && !selected ? <div role="status" className="rounded-[14px] border border-[#F7D1D8] bg-[#F7EEED] px-4 py-3 text-[11px] text-[#7B535C]">That finance record is no longer available.</div> : null}
        {selected ? <FinanceExactEntryEditor entry={selected} /> : null}
        <FinancialIntelligenceStudio entries={entries} financeGoals={financeGoals} projects={projects} lifeGoals={lifeGoals} nowIso={now.toISOString()} />
        <details id="finance-manager" className="rounded-[28px] border border-white/75 bg-white/58 p-5 shadow-[0_18px_70px_rgba(72,82,96,.08)] backdrop-blur-xl">
          <summary className="cursor-pointer glow-display text-[19px] text-[#30343A]">Finance records + management</summary>
          <div className="mt-5"><FinanceEntryManager initialEntries={entries} initialGoals={financeGoals} /></div>
        </details>
      </div>
    </AppShell>
  );
}
