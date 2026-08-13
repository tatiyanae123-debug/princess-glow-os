import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { FoodRoom } from '@/components/food/food-room';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';

export const dynamic = 'force-dynamic';

export default async function FoodPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const entries = await getFinanceEntriesByUser(session.user.id);
  const now = new Date();
  const monthEntries = entries.filter((entry) => {
    const date = new Date(`${entry.entryDate}T12:00:00`);
    return entry.category === 'food' && entry.type === 'expense' && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  });
  const foodSpendCents = Math.round(monthEntries.reduce((sum, entry) => sum + Number(entry.amount), 0) * 100);

  return (
    <AppShell>
      <SectionPage eyebrow="Food & Nutrition" title="Food & Nutrition" description="Nourish intentionally. Fuel beautifully.">
        <FoodRoom foodSpendCents={foodSpendCents} foodPurchaseCount={monthEntries.length} />
      </SectionPage>
    </AppShell>
  );
}
