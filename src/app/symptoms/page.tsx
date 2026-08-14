import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { ReferenceWellnessView } from '@/components/wellness/reference-wellness-view';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
export const dynamic='force-dynamic';
export default async function SymptomsPage(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');const entries=await getWellnessEntriesByUser(session.user.id);return <AppShell><ReferenceWellnessView mode="symptoms" entries={entries}/></AppShell>}
