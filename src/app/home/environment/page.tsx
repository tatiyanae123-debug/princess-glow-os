import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { LifeProtocolStudio } from '@/components/knowledge/life-protocol-studio';
export const dynamic='force-dynamic';
export default async function EnvironmentPage(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return <AppShell><LifeProtocolStudio mode="environment"/></AppShell>}
