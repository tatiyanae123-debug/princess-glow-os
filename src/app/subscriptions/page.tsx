import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { ReferenceFinanceView } from '@/components/finance/reference-finance-view';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
export const dynamic='force-dynamic';
export default async function SubscriptionsPage(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');const entries=await getFinanceEntriesByUser(session.user.id);return <AppShell><ReferenceFinanceView mode="subscriptions" entries={entries}/></AppShell>}
