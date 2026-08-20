import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch6TerrainStudioView } from '@/components/batch6/work-create-reference';
import { getProjectsByUser } from '@/lib/data/user-scope';
import { getNotesByUser } from '@/lib/data/notes';

export const dynamic='force-dynamic';
export default async function TerrainDesignStudioPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [projects,notes]=await Promise.all([getProjectsByUser(session.user.id),getNotesByUser(session.user.id)]);
  return <AppShell><Batch6TerrainStudioView projects={projects} notes={notes}/></AppShell>;
}
