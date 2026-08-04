import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { FinanceEntryManager } from '@/components/finance/finance-entry-manager';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const entries = await getFinanceEntriesByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Finance" title="Your wealth in one clear view" description="A calmer relationship with money begins with honest visibility and gentle structure.">
        <FinanceEntryManager initialEntries={entries} />
      </SectionPage>
    </AppShell>
  );
}
