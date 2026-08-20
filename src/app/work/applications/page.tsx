import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch6ApplicationsView } from '@/components/batch6/work-create-reference';
import { getTasksByUser } from '@/lib/data/tasks';
import { getNotesByUser } from '@/lib/data/notes';

export const dynamic='force-dynamic';
export default async function ApplicationsPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [tasks,notes]=await Promise.all([getTasksByUser(session.user.id),getNotesByUser(session.user.id)]);
  return <AppShell><Batch6ApplicationsView tasks={tasks} notes={notes}/></AppShell>;
}
