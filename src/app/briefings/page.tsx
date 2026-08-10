import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { generateBriefingAction } from '@/app/actions/completion-v1';
import { getBriefings } from '@/lib/data/completion-v1';
import { Coffee, MoonStar, Newspaper, Sun } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function BriefingsPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const briefings=await getBriefings(session.user.id);
  const cards=[['Morning Brief','Schedule, unfinished work, focus score, and recommended next actions.','morning',Sun,'#f3e5cf'],['Evening Recap','Review unfinished work and use current context to prepare tomorrow.','evening',MoonStar,'#e6e1eb'],['Weekly Review','Capture a weekly context snapshot for patterns and next-week planning.','weekly',Newspaper,'#e8e4d8']] as const;
  return <AppShell><SectionPage eyebrow="Briefings" title="Start informed. End prepared." description="Generate in-app morning briefs, evening recaps, and weekly reviews from your real Glow OS context.">
    <div className="space-y-4">
      <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#f5ecdf,#f8f1ea)] p-5"><Coffee size={52} strokeWidth={.8} className="absolute right-5 top-3 text-[#8a7764]/16"/><p className="glow-eyebrow">The Glow Daily</p><p className="glow-display mt-2 text-[24px] text-[#4b4034]">A personal paper about the day you are actually living.</p><p className="mt-2 text-[9px] text-[#7e7064]">{briefings.length} briefing{briefings.length===1?'':'s'} saved in your archive.</p></Card>
      <div className="grid gap-3 sm:grid-cols-3">{cards.map(([title,description,kind,Icon,wash])=><Card key={kind} className="relative overflow-hidden p-5" style={{background:`linear-gradient(145deg,rgba(255,252,248,.82),${wash})`}}><Icon size={30} strokeWidth={1} className="text-[#8c786b]"/><h2 className="glow-display mt-4 text-[17px] text-[#4b4034]">{title}</h2><p className="mt-2 min-h-[48px] text-[8px] leading-4 text-[#7e7064]">{description}</p><form action={generateBriefingAction.bind(null,kind)} className="mt-4"><button className="rounded-[6px] bg-[#443a32] px-3 py-2 text-[8px] text-white">Generate {kind}</button></form></Card>)}</div>
      <Card className="p-0 overflow-hidden"><div className="border-b border-[#e8dfd3] px-5 py-4"><p className="glow-eyebrow">Archive</p><h2 className="glow-display mt-1 text-[19px] text-[#4b4034]">Briefing history</h2></div>{briefings.length===0?<p className="p-8 text-center text-[9px] text-[#86796d]">No briefings generated yet.</p>:<div className="divide-y divide-[#eee6dc]">{briefings.map((b,index)=>{const content=b.content as {dailyBrief?:string;focusScore?:number;unfinishedTasks?:number;overdueTasks?:number;todaysEvents?:number};return <article key={b.id} className={`p-5 ${index===0?'bg-[#faf4ec]':''}`}><div className="flex justify-between gap-3"><div><p className="glow-display text-[15px] capitalize text-[#4d4236]">{b.kind} · {b.periodKey}</p><p className="mt-1 text-[7px] text-[#9a8a7d]">{b.generatedAt.toLocaleString()}</p></div><span className="text-[7px] uppercase tracking-[.12em] text-[#9a8a7d]">Glow Daily</span></div>{content.dailyBrief?<p className="glow-display mt-3 max-w-3xl text-[13px] leading-5 text-[#66594f]">{content.dailyBrief}</p>:null}<p className="mt-3 text-[7px] text-[#998a7e]">Focus {content.focusScore??'—'} · {content.unfinishedTasks??0} unfinished · {content.overdueTasks??0} overdue · {content.todaysEvents??0} events</p></article>;})}</div>}</Card>
    </div>
  </SectionPage></AppShell>;
}
