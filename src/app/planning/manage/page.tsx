import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { PlanningHub } from '@/components/planning/planning-hub';
import { BuildMyDay } from '@/components/planning/build-my-day';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { archivePlanningPeriodAction, createPlanningPeriodAction, updatePlanningPeriodAction } from '@/app/actions/completion-v1';
import { getPlanningPeriods } from '@/lib/data/completion-v1';

export const dynamic='force-dynamic';
const field='w-full rounded-[8px] border border-[#e4d9d1] bg-white px-3 py-2.5 text-[10px]';

export default async function PlanningManagementPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const periods=await getPlanningPeriods(session.user.id);
  return <AppShell><SectionPage eyebrow="Planning Studio" title="Commit and maintain planning layers" description="The studio can simulate freely. This deeper workspace is where persistent planning records are created and edited.">
    <div className="space-y-5"><BuildMyDay/><div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]"><Card className="p-5"><form action={createPlanningPeriodAction} className="space-y-3"><h2 className="glow-display text-[20px] text-[#463833]">Create planning layer</h2><select name="level" defaultValue="week" className={field}><option value="today">Today</option><option value="week">Week</option><option value="quarter">Quarter</option><option value="year">Year</option><option value="book">Book</option><option value="bucket">Bucket list</option></select><input name="title" required placeholder="Title" className={field}/><textarea name="focus" rows={4} placeholder="Focus or intention" className={field}/><div className="grid gap-3 sm:grid-cols-2"><input name="startsAt" type="date" className={field}/><input name="endsAt" type="date" className={field}/></div><button className="rounded-[8px] bg-[#3d302c] px-4 py-2 text-[9px] text-white">Save layer</button></form></Card><div className="space-y-3">{periods.map((period)=><Card key={period.id} className="p-4"><form action={updatePlanningPeriodAction.bind(null,period.id)} className="space-y-3"><div><h3 className="glow-display text-[17px] text-[#473a35]">{period.title}</h3><p className="text-[8px] uppercase tracking-[.12em] text-[#9a847c]">{period.level}</p></div><textarea name="focus" defaultValue={period.focus??''} rows={2} className={field}/><textarea name="reflection" defaultValue={period.reflection??''} rows={2} placeholder="Reflection" className={field}/><div className="grid gap-3 sm:grid-cols-3"><input name="progress" type="number" min="0" max="100" defaultValue={period.progress} className={field}/><input name="startsAt" type="date" defaultValue={period.startsAt?period.startsAt.toISOString().slice(0,10):''} className={field}/><input name="endsAt" type="date" defaultValue={period.endsAt?period.endsAt.toISOString().slice(0,10):''} className={field}/></div><div className="flex gap-2"><button className="rounded-[8px] bg-[#3d302c] px-3 py-2 text-[8px] text-white">Save</button><button formAction={archivePlanningPeriodAction.bind(null,period.id)} className="rounded-[8px] border border-[#e0d2ca] px-3 py-2 text-[8px]">Archive</button></div></form></Card>)}</div></div><PlanningHub/></div>
  </SectionPage></AppShell>;
}
