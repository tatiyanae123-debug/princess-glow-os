import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch6ProjectDeepDiveView } from '@/components/batch6/work-create-reference';
import { getProjectsByUser } from '@/lib/data/user-scope';
import { getTasksByUser } from '@/lib/data/tasks';
import { getNotesByUser } from '@/lib/data/notes';

export const dynamic='force-dynamic';
export default async function ProjectDeepDivePage({searchParams}:{searchParams:Promise<{projectId?:string}>}){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [projects,tasks,notes,params]=await Promise.all([getProjectsByUser(session.user.id),getTasksByUser(session.user.id),getNotesByUser(session.user.id),searchParams]);
  return <AppShell><Batch6ProjectDeepDiveView projects={projects} tasks={tasks} notes={notes} projectId={params.projectId}/></AppShell>;
}
