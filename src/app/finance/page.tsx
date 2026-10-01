import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { FinanceEntryManager } from '@/components/finance/finance-entry-manager';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getFinanceGoals } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

const destinations = [
  { label: 'Baseline', href: '/finance/baseline', cue: 'What is true now' },
  { label: 'Spending', href: '/finance/spending', cue: 'Money movement' },
  { label: 'Recurring Bills', href: '/finance/recurring-bills', cue: 'Obligations over time' },
  { label: 'Debt', href: '/finance/debt', cue: 'Liabilities and scenarios' },
  { label: 'Savings', href: '/finance/savings', cue: 'Future capacity' },
  { label: 'Purchase Studio', href: '/finance/purchase-decision', cue: 'Preview before buying' },
  { label: 'Calendar', href: '/finance/calendar', cue: 'Dates that affect money' },
  { label: 'Learning', href: '/finance/learning', cue: 'Understand the why' },
];

export default async function FinancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [entries, goals] = await Promise.all([
    getFinanceEntriesByUser(session.user.id),
    getFinanceGoals(session.user.id),
  ]);

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Life · Money"
        title="Money"
        question="What is true about my money, what is already committed, and what changes next?"
        climate="money"
        destinations={destinations}
      >
        <FinanceEntryManager initialEntries={entries} initialGoals={goals} />
      </CanonicalDomainRoom>
    </AppShell>
  );
}
