import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { Batch6CreativeStudioView } from '@/components/batch6/work-create-reference';
import { getProjectsByUser } from '@/lib/data/user-scope';

export const dynamic='force-dynamic';
export default async function CreativeStudioPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const projects=await getProjectsByUser(session.user.id);
  return <AppShell><Batch6CreativeStudioView projects={projects}/></AppShell>;
}
