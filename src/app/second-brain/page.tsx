import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SecondBrainStudio } from '@/components/brain/second-brain-studio';
import { getBrainState } from '@/lib/data/second-brain';

export const dynamic='force-dynamic';

export default async function SecondBrainPage(){
 const session=await auth();
 if(!session?.user?.id)redirect('/sign-in');
 const state=await getBrainState(session.user.id);
 return <AppShell><SecondBrainStudio initialState={state}/></AppShell>;
}
