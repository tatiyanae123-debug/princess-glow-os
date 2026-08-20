import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch8WorkoutModeView } from '@/components/batch8/system-special-reference';
import { getFitnessSessions } from '@/lib/data/completion-v1';

export const dynamic='force-dynamic';
export default async function WorkoutModePage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const sessions=await getFitnessSessions(session.user.id);
  return <AppShell><Batch8WorkoutModeView sessions={sessions}/></AppShell>;
}
