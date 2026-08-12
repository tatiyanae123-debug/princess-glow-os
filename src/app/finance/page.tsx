import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { FinanceEntryManager } from '@/components/finance/finance-entry-manager';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getGoalsByUser } from '@/lib/data/goals';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [entries, goals] = await Promise.all([getFinanceEntriesByUser(session.user.id), getGoalsByUser(session.user.id)]);

  return (
    <AppShell><FinanceEntryManager initialEntries={entries} goals={goals} /></AppShell>
  );
}
