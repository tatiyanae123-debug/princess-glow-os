import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch7WorldView } from '@/components/batch7/home-world-reference';

export const dynamic='force-dynamic';
export default async function WorldPage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 let balance:number|null=null;
 if(process.env.DATABASE_URL){
  try{
   const{getLivingDashboardData}=await import('@/lib/dashboard/living-dashboard');
   const d=await getLivingDashboardData(session.user.id);
   balance=d.habitSummary.totalHabits?Math.round((d.habitSummary.completedToday/d.habitSummary.totalHabits)*100):null;
  }catch{balance=null}
 }
 return <AppShell><Batch7WorldView balance={balance}/></AppShell>;
}
