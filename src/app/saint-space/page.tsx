import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { AuditedSaintView } from '@/components/batch7/home-world-audited';
import { getTasksByUser } from '@/lib/data/tasks';

export const dynamic='force-dynamic';
export default async function SaintSpacePage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const all=await getTasksByUser(session.user.id);
 const words=['saint','dog','walk','vet','groom','pet','medication','breakfast','meal','treat'];
 const tasks=all.filter(t=>words.some(w=>`${t.title} ${t.description??''}`.toLowerCase().includes(w)));
 return <AppShell><AuditedSaintView tasks={tasks}/></AppShell>;
}
