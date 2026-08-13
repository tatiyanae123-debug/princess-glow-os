import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createTimelineEventAction } from '@/app/actions/completion-v1';
import { getFitnessSessions, getHairLogs, getTimelineEvents } from '@/lib/data/completion-v1';
import { CalendarDays, Dumbbell, Scissors, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass='w-full rounded-[12px] border border-[#F1E7E3] px-3 py-2.5 text-[12px] text-[#2B2420] outline-none focus:border-[#C9727E]';

type Story={id:string;title:string;category:string;occurredAt:Date;summary:string|null;source:'timeline'|'fitness'|'hair'};

export default async function TimelinePage(){
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  const [events,fitness,hair]=await Promise.all([getTimelineEvents(session.user.id),getFitnessSessions(session.user.id),getHairLogs(session.user.id)]);
  const story:Story[]=[
    ...events.map(e=>({id:`t-${e.id}`,title:e.title,category:e.category,occurredAt:e.occurredAt,summary:e.summary,source:'timeline' as const})),
    ...fitness.map(e=>({id:`f-${e.id}`,title:`${e.workoutType} workout`,category:'Fitness',occurredAt:e.occurredAt,summary:e.notes||`${e.durationMinutes??0} minutes`,source:'fitness' as const})),
    ...hair.map(e=>({id:`h-${e.id}`,title:e.style?`${e.eventType}: ${e.style}`:e.eventType,category:'Hair',occurredAt:e.occurredAt,summary:e.notes,source:'hair' as const})),
  ].sort((a,b)=>b.occurredAt.getTime()-a.occurredAt.getTime());
  const years=new Map<number,Story[]>(); story.forEach(item=>years.set(item.occurredAt.getFullYear(),[...(years.get(item.occurredAt.getFullYear())??[]),item]));
  const upcoming=story.filter(item=>item.occurredAt.getTime()>Date.now()).slice(0,4);

  return <AppShell><SectionPage eyebrow="Timeline" title="Timeline" description="Your life, beautifully mapped. Every moment shapes your story.">
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex gap-2"><span className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#8A8078]">All Events</span><span className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#8A8078]">Filter</span></div><details className="relative"><summary className="list-none rounded-full bg-[#D86F83] px-4 py-2.5 text-[11px] font-medium text-white">+ Add Event</summary><form action={createTimelineEventAction} className="absolute right-0 z-20 mt-2 w-[min(360px,82vw)] space-y-2 rounded-[16px] border border-[#F1E7E3] bg-white p-4 shadow-xl"><input name="title" required placeholder="What happened?" className={fieldClass}/><input name="category" required placeholder="Category" className={fieldClass}/><input name="occurredAt" required type="datetime-local" className={fieldClass}/><textarea name="summary" rows={4} placeholder="What should you remember?" className={fieldClass}/><button className="w-full rounded-full bg-[#2B2420] px-4 py-2.5 text-[11px] text-white">Add to Timeline</button></form></details></div>

      <Card className="p-0 overflow-hidden"><div className="p-5 sm:p-7">{story.length===0?<p className="py-10 text-center text-[12px] text-[#9A9088]">Your timeline is ready for its first moment.</p>:[...years.entries()].sort((a,b)=>b[0]-a[0]).map(([year,items])=><section key={year} className="grid gap-4 border-b border-[#F4ECE8] py-5 last:border-0 lg:grid-cols-[90px_1fr]"><p className="glow-display text-[22px] text-[#C9727E]">{year}</p><div className="relative space-y-3 border-l border-[#E8D7D3] pl-6">{items.map((item,index)=>{const Icon=item.source==='fitness'?Dumbbell:item.source==='hair'?Scissors:Sparkles;return <article key={item.id} className="relative grid gap-3 rounded-[14px] border border-[#F1E7E3] bg-[#FFFEFD] p-4 sm:grid-cols-[90px_1fr]"><span className="absolute -left-[31px] top-6 h-3 w-3 rounded-full border-2 border-white bg-[#D86F83]"/><div className={`flex h-[72px] items-center justify-center rounded-[10px] ${index%2?'bg-[#EEE3DC]':'bg-[#F6ECE7]'}`}><Icon size={22} className="text-[#B68D80]"/></div><div><div className="flex flex-wrap items-center justify-between gap-2"><p className="glow-display text-[15px] text-[#2B2420]">{item.title}</p><span className="text-[10px] text-[#B5ACA5]">{item.occurredAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></div><p className="mt-1 text-[9.5px] uppercase tracking-[.1em] text-[#C9727E]">{item.category}</p>{item.summary?<p className="mt-2 line-clamp-2 text-[11px] leading-4 text-[#8A8078]">{item.summary}</p>:null}</div></article>})}</div></section>)}</div></Card>

      <div className="grid gap-4 lg:grid-cols-3"><Card><div className="flex items-center gap-2"><CalendarDays size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Upcoming Events</h2></div><div className="mt-4 space-y-3">{upcoming.length?upcoming.map(item=><div key={item.id} className="flex gap-3 text-[11px]"><span className="text-[#C9727E]">{item.occurredAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span><span>{item.title}</span></div>):<p className="text-[11px] text-[#9A9088]">No future events yet.</p>}</div></Card><Card><h2 className="glow-display text-[18px]">Major Milestones</h2><p className="mt-4 text-[11.5px] leading-5 text-[#8A8078]">{events.length} saved timeline milestone{events.length===1?'':'s'}.</p><p className="mt-2 text-[11px] text-[#9A9088]">Fitness and Hair add context automatically without duplicating ownership.</p></Card><Card><h2 className="glow-display text-[18px]">Memory Highlights</h2><div className="mt-4 grid grid-cols-3 gap-2">{story.slice(0,6).map((item,index)=><div key={item.id} title={item.title} className={`aspect-square rounded-[10px] ${index%2?'bg-[#E9DDD4]':'bg-[#F2E8E1]'}`}/>)}</div></Card></div>

      <Card className="grid gap-4 bg-[linear-gradient(90deg,#FFF,#FFF7F5)] lg:grid-cols-[160px_1fr_auto] lg:items-center"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><span className="glow-display text-[18px]">Glow Insight</span></div><p className="glow-display text-[17px] italic text-[#4A4440]">Your story is not a list of dates. It is a pattern of growth, rituals, and meaningful change.</p><span className="text-[10px] text-[#9A9088]">{story.length} moments</span></Card>
    </div>
  </SectionPage></AppShell>;
}
