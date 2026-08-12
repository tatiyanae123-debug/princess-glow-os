import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { ArrowUpRight, Flower2, Globe2, Sparkles } from 'lucide-react';

const rooms = [
  ['Home','/home','Your environment, resets, and household systems.','#e7eadf'],
  ['Mind','/brain','Context, recommendations, memory, and reflection.','#ebe2ec'],
  ['Fitness','/fitness','Workouts, energy, soreness, equipment, and recovery context.','#e2e8e8'],
  ['Beauty','/beauty/lab','Products, routines, reactions, expiration, and repurchase decisions.','#f1dfdf'],
  ['Learning','/planning','Books, reflection, planning, notes, and knowledge.','#eee5d9'],
  ['Finance','/finance/brain','Spending context, goals, savings direction, and financial planning.','#e5ebdf'],
  ['Travel','/timeline','Trips, memories, plans, and meaningful experiences over time.','#e7e3db'],
  ['Saint','/tasks','Care tasks, routines, appointments, and reminders.','#eee2dc'],
  ['Career','/projects','Career moves, applications, deadlines, and work projects.','#e8ddd1'],
  ['Creativity','/projects','Terrain Design, brands, content, and Creative Studio.','#eadbd0'],
  ['Memory','/memory','Facts, milestones, preferences, decisions, and private context.','#eee7d8'],
  ['Connections','/connections','Google, Apple Reminders, and your private digital bridges.','#e5e2de'],
] as const;

export const dynamic='force-dynamic';

export default async function WorldPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  return <AppShell><SectionPage eyebrow="Life World" title="Walk through the systems of your life" description="Every room opens a working Glow OS system. The interface feels like a world while the reliable application stays underneath.">
    <div className="space-y-4">
      <section className="relative min-h-[240px] overflow-hidden rounded-[12px] border border-[#dce2d5] bg-[linear-gradient(130deg,#eff1e8,#f6ece5)] p-6"><Flower2 size={110} strokeWidth={.65} className="absolute -bottom-4 left-5 text-[#89977d]/25"/><Globe2 size={90} strokeWidth={.65} className="absolute right-8 top-5 text-[#75816d]/16"/><div className="relative ml-auto max-w-[68%] text-right"><p className="glow-eyebrow">My Universe</p><h2 className="glow-display mt-2 text-[31px] leading-9 text-[#3f493b]">Your life is not a menu. It is a place.</h2><p className="mt-3 text-[9px] leading-5 text-[#707a6b]">Move through Beauty, Finance, Home, Creativity, Memory and the rest of your systems like connected rooms. Each room keeps its own atmosphere while sharing the same life underneath.</p><span className="glow-hand mt-4 inline-block text-[27px] text-[#77866f]">welcome home</span></div></section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{rooms.map(([title,href,description,wash],index)=><Link key={title} href={href} className="group relative min-h-[170px] overflow-hidden rounded-[10px] border border-[#ded9d0] p-5 shadow-[0_8px_25px_rgba(65,53,45,.04)] transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(65,53,45,.08)]" style={{background:`linear-gradient(145deg,rgba(255,252,248,.8),${wash})`}}><div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/30"><Sparkles size={13} className="text-[#8e7b71]"/></div><p className="text-[7px] font-semibold uppercase tracking-[.14em] text-[#918078]">Room {String(index+1).padStart(2,'0')}</p><h2 className="glow-display mt-4 text-[21px] text-[#453a35]">{title}</h2><p className="mt-2 max-w-[85%] text-[8px] leading-4 text-[#7c6e66]">{description}</p><p className="mt-4 inline-flex items-center gap-1 text-[8px] font-medium text-[#745c55]">Enter room <ArrowUpRight size={9}/></p></Link>)}</div>
    </div>
  </SectionPage></AppShell>;
}
