import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { AuditedApplicationsView } from '@/components/batch6/work-audited';
import { getTasksByUser } from '@/lib/data/tasks';
import { getNotesByUser } from '@/lib/data/notes';

export const dynamic='force-dynamic';
export default async function ApplicationsPage({searchParams}:{searchParams:Promise<{status?:string}>}){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [tasks,notes,params]=await Promise.all([getTasksByUser(session.user.id),getNotesByUser(session.user.id),searchParams]);
  return <AppShell><AuditedApplicationsView tasks={tasks} notes={notes} status={params.status}/></AppShell>;
}
