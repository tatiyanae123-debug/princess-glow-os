import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { AmbientMode } from '@/components/batch8/ambient-mode';

export const dynamic='force-dynamic';
export default async function AmbientModePage(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return <AppShell><AmbientMode/></AppShell>}
