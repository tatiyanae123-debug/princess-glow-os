import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { FinancialPlanStudio } from '@/components/finance/financial-plan-studio';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
export const dynamic='force-dynamic';
export default async function FinancialPlanPage(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');const entries=await getFinanceEntriesByUser(session.user.id);return <AppShell><FinancialPlanStudio entries={entries}/></AppShell>}
