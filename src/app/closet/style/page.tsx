import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { StyleIntelligenceStudio } from '@/components/closet/style-intelligence-studio';
import { getClosetItems } from '@/lib/data/completion-v1';
export const dynamic='force-dynamic';
export default async function StylePage(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');const items=await getClosetItems(session.user.id);return <AppShell><StyleIntelligenceStudio items={items}/></AppShell>}
