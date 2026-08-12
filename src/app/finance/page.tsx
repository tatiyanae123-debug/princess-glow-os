import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { MoneyGrowthExperience } from '@/components/finance/money-growth-experience';
import { FinanceEntryManager } from '@/components/finance/finance-entry-manager';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getFinanceGoals } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [entries, goals] = await Promise.all([
    getFinanceEntriesByUser(session.user.id),
    getFinanceGoals(session.user.id),
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        <MoneyGrowthExperience entries={entries} goals={goals} />
        <FinanceEntryManager initialEntries={entries} initialGoals={goals} />
      </div>
    </AppShell>
  );
}
