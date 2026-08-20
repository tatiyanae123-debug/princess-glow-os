import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch7WorldView } from '@/components/batch7/home-world-reference';

export const dynamic='force-dynamic';
export default async function WorldPage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 let signals:string[]=[];
 if(process.env.DATABASE_URL){try{const{getLivingDashboardData}=await import('@/lib/dashboard/living-dashboard');const d=await getLivingDashboardData(session.user.id);signals=[`${Math.round((d.habitSummary.totalHabits?d.habitSummary.completedToday/d.habitSummary.totalHabits:0)*100)}%`]}catch{signals=[]}}
 return <AppShell><Batch7WorldView signals={signals}/></AppShell>;
}
