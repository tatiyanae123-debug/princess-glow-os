import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch5FinanceView } from '@/components/finance/batch5-finance-view';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getFinanceGoals } from '@/lib/data/completion-v1';
export const dynamic='force-dynamic';
export default async function Page(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');const [entries,goals]=await Promise.all([getFinanceEntriesByUser(session.user.id),getFinanceGoals(session.user.id)]);return <AppShell><Batch5FinanceView mode="overview" entries={entries} goals={goals}/></AppShell>}
