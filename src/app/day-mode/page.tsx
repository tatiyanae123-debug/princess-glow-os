import {redirect} from 'next/navigation';
import {auth} from '@/auth';
import {AppShell} from '@/components/app-shell';
import {Card} from '@/components/ui/card';
import {BuildMyDayV3Client} from '@/components/planning/build-my-day-v3-client';
import {buildMyDayV3Action} from '@/app/actions/build-my-day-v3';
import {GLOW_DAY_MODE_ORDER,GLOW_DAY_MODES} from '@/lib/day-mode';

export const dynamic='force-dynamic';

export default async function DayModePage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const proposal=await buildMyDayV3Action('productive');
 return <AppShell><div className="mx-auto max-w-[1240px] space-y-5">
  <header><p className="glow-eyebrow text-[#C9727E]">Adaptive planning</p><h1 className="glow-display mt-1 text-[44px] leading-none text-[#2B2420] sm:text-[56px]">Day Mode</h1><p className="mt-3 max-w-[720px] text-[13px] leading-5 text-[#8A8078]">Tell Glow how much capacity today has. The planner changes how many blocks it suggests, how long they can be, and how much empty space it protects.</p></header>
  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{GLOW_DAY_MODE_ORDER.map(mode=>{const p=GLOW_DAY_MODES[mode];return <Card key={mode} className="rounded-[18px] border-[#F1E7E3] p-4"><p className="text-[10px] uppercase tracking-[.12em] text-[#A96C72]">{p.label}</p><p className="glow-display mt-3 text-[24px]">{p.maxSuggestions}</p><p className="text-[10px] text-[#9A9088]">max suggested blocks</p><p className="mt-3 text-[11px] leading-4 text-[#7D746F]">Up to {p.maxBlockMinutes} minutes per block · {p.bufferMinutes} minute buffers.</p></Card>})}</section>
  <Card className="rounded-[22px] border-[#F1E7E3] p-5"><BuildMyDayV3Client initialProposal={proposal}/></Card>
 </div></AppShell>
}
