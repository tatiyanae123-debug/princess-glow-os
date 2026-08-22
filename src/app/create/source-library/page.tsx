import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { GlowCorpusSystem } from '@/components/knowledge/glow-corpus-system';

export const dynamic='force-dynamic';
export default async function SourceLibraryPage(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return <AppShell><GlowCorpusSystem/></AppShell>}
