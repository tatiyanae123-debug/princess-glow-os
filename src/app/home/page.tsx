import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch7HomeView } from '@/components/batch7/home-world-reference';
import { getTasksByUser } from '@/lib/data/tasks';

export const dynamic='force-dynamic';
export default async function HomePage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const tasks=(await getTasksByUser(session.user.id)).filter(t=>t.status!=='done'&&t.status!=='cancelled');
 const words=['home','clean','laundry','plant','tidy','reset','house','room','grocery','bed','window'];
 const homeTasks=tasks.filter(t=>words.some(w=>`${t.title} ${t.description??''}`.toLowerCase().includes(w)));
 return <AppShell><Batch7HomeView tasks={homeTasks}/></AppShell>;
}
