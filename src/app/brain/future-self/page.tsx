import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { DomainEvolutionStudio } from '@/components/knowledge/domain-evolution-studio';
export const dynamic='force-dynamic';
export default async function FutureSelfPage(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return <AppShell><DomainEvolutionStudio mode="identity"/></AppShell>}
