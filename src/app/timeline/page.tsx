import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { createTimelineEventAction } from '@/app/actions/completion-v1';
import { updateTimelineEventAction } from '@/app/actions/detail-records';
import { getFitnessSessions, getHairLogs, getTimelineEvents } from '@/lib/data/completion-v1';
import { Dumbbell, Filter, Scissors, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass='w-full rounded-[10px] border border-[#eadfdb] bg-white px-3 py-2.5 text-[11px] text-[#2B2420] outline-none focus:border-[#C9727E]';
type Story={id:string;rawId:string;title:string;category:string;occurredAt:Date;summary:string|null;source:'timeline'|'fitness'|'hair';href:string};
const dateTimeLocal=(value:Date)=>{const offset=value.getTimezoneOffset();return new Date(value.getTime()-offset*60000).toISOString().slice(0,16);};
const scene=['#f7e7e4','#efe6df','#e7ded5','#f6eeee','#eee3dd','#f4e7df'];

export default async function TimelinePage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }){
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  const [events,fitness,hair,params]=await Promise.all([getTimelineEvents(session.user.id),getFitnessSessions(session.user.id),getHairLogs(session.user.id),searchParams]);
  const selected=params.eventId?events.find((event)=>event.id===params.eventId)??null:null;
  const story:Story[]=[
    ...events.map(e=>({id:`t-${e.id}`,rawId:e.id,title:e.title,category:e.category,occurredAt:e.occurredAt,summary:e.summary,source:'timeline' as const,href:`/timeline?eventId=${encodeURIComponent(e.id)}`})),
    ...fitness.map(e=>({id:`f-${e.id}`,rawId:e.id,title:`${e.workoutType} workout`,category:'Fitness',occurredAt:e.occurredAt,summary:e.notes||`${e.durationMinutes??0} minutes`,source:'fitness' as const,href:`/fitness?sessionId=${encodeURIComponent(e.id)}`})),
    ...hair.map(e=>({id:`h-${e.id}`,rawId:e.id,title:e.style?`${e.eventType}: ${e.style}`:e.eventType,category:'Hair',occurredAt:e.occurredAt,summary:e.notes,source:'hair' as const,href:`/hair?logId=${encodeURIComponent(e.id)}`})),
  ].sort((a,b)=>b.occurredAt.getTime()-a.occurredAt.getTime());
  const years=new Map<number,Story[]>();story.forEach(item=>years.set(item.occurredAt.getFullYear(),[...(years.get(item.occurredAt.getFullYear())??[]),item]));
  const yearEntries=[...years.entries()].sort((a,b)=>b[0]-a[0]);
  const highlights=story.slice(0,4);
  const milestoneCount=events.length;

  return <AppShell><div className="batch1-timeline-reference space-y-4">
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-[9px] font-semibold uppercase tracking-[.14em] text-[#9b8d85]">7. Calendar — Timeline View</p><h1 className="glow-display mt-2 text-[42px] leading-none tracking-[-.03em] text-[#27211e]">Timeline</h1><p className="mt-2 text-[11px] text-[#8c8078]">Your life, in sequence.</p></div>
      <div className="flex items-center gap-2"><span className="rounded-full border border-[#e9dfdb] bg-white px-3 py-2 text-[9px]">Year</span><span className="rounded-full border border-[#e9dfdb] bg-white px-3 py-2 text-[9px]">All Time</span><span className="inline-flex items-center gap-1 rounded-full border border-[#e9dfdb] bg-white px-3 py-2 text-[9px]"><Filter size={11}/>Filter</span><details className="relative"><summary className="list-none rounded-full bg-[#bb536c] px-4 py-2 text-[9px] font-medium text-white">+ Add Event</summary><form action={createTimelineEventAction} className="absolute right-0 z-30 mt-2 w-[min(360px,84vw)] space-y-2 rounded-[14px] border border-[#eadfdb] bg-white p-4 shadow-xl"><input name="title" required placeholder="What happened?" className={fieldClass}/><input name="category" required placeholder="Category" className={fieldClass}/><input name="occurredAt" required type="datetime-local" className={fieldClass}/><textarea name="summary" rows={4} placeholder="What should you remember?" className={fieldClass}/><button type="submit" className="w-full rounded-full bg-[#2B2420] px-4 py-2.5 text-[11px] text-white">Add to Timeline</button></form></details></div>
    </header>

    {params.eventId&&!selected?<div role="status" className="rounded-[10px] border border-[#eadfdb] bg-[#fff8f7] px-4 py-3 text-[10px] text-[#7B535C]">That saved timeline event is no longer available.</div>:null}
    {selected?<Card className="border-[#c66b7d]"><div className="flex items-start justify-between gap-3"><div><p className="text-[8px] font-semibold uppercase tracking-[.13em] text-[#ba6575]">Selected timeline event</p><h2 className="glow-display mt-1 text-[20px] text-[#2B2420]">{selected.title}</h2></div><Link href="/timeline" className="text-[9px] text-[#C9727E]">Close</Link></div><form action={updateTimelineEventAction.bind(null,selected.id)} className="mt-4 grid gap-2 sm:grid-cols-2"><input name="title" required defaultValue={selected.title} className={fieldClass}/><input name="category" required defaultValue={selected.category} className={fieldClass}/><input name="occurredAt" type="datetime-local" required defaultValue={dateTimeLocal(selected.occurredAt)} className={fieldClass}/><input name="relatedEntityType" defaultValue={selected.relatedEntityType??''} placeholder="Related type" className={fieldClass}/><input name="relatedEntityId" defaultValue={selected.relatedEntityId??''} placeholder="Related record ID" className={fieldClass}/><textarea name="summary" rows={3} defaultValue={selected.summary??''} placeholder="What should you remember?" className={`${fieldClass} sm:col-span-2`}/><button type="submit" className="w-fit rounded-full bg-[#C9727E] px-4 py-2.5 text-[10px] text-white">Save timeline event</button></form></Card>:null}

    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_250px]">
      <Card className="overflow-hidden p-0">
        <div className="px-5 py-4"><div className="flex items-center justify-between"><p className="text-[9px] uppercase tracking-[.13em] text-[#958981]">Your life</p><p className="text-[9px] text-[#b46a78]">{story.length} moments</p></div></div>
        <div className="px-5 pb-5">
          {story.length===0?<p className="py-16 text-center text-[11px] text-[#9A9088]">Your timeline is ready for its first moment.</p>:yearEntries.map(([year,items])=><section key={year} className="grid grid-cols-[56px_1fr] gap-4 border-t border-[#f0e7e3] py-4 first:border-0"><div className="pt-2"><p className="glow-display text-[16px] text-[#302925]">{year}</p></div><div className="relative space-y-2 border-l border-[#e9cbd2] pl-6">{items.map((item,index)=>{const Icon=item.source==='fitness'?Dumbbell:item.source==='hair'?Scissors:Sparkles;return <Link href={item.href} key={item.id} className="group relative grid grid-cols-[56px_minmax(0,1fr)_58px] items-center gap-3 rounded-[9px] border border-transparent px-2 py-2 transition hover:border-[#efe3df] hover:bg-[#fff9f7]"><span className="absolute -left-[28px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-white bg-[#c8697d] shadow-[0_0_0_1px_#e8cbd1]"/><div className="flex h-[46px] items-center justify-center rounded-[7px]" style={{background:scene[index%scene.length]}}><Icon size={16} className="text-[#9f7b70]"/></div><div className="min-w-0"><p className="truncate text-[10px] font-medium text-[#352e2a]">{item.title}</p><p className="mt-1 text-[8px] uppercase tracking-[.09em] text-[#b56c79]">{item.category}</p>{item.summary?<p className="mt-1 line-clamp-1 text-[9px] text-[#8e837c]">{item.summary}</p>:null}</div><div className="text-right"><p className="text-[9px] text-[#5c534e]">{item.occurredAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p><p className="mt-1 text-[8px] text-[#b7ada7]">Open →</p></div></Link>})}</div></section>)}
        </div>
      </Card>

      <aside className="space-y-3">
        <Card className="p-4"><div className="flex items-center justify-between"><h2 className="glow-display text-[16px]">Highlights</h2><Link href="/memory" className="text-[8px] text-[#b65f70]">Memory →</Link></div><div className="mt-3 grid grid-cols-2 gap-2">{highlights.map((item,index)=><Link key={item.id} href={item.href} className="aspect-[4/3] rounded-[8px] border border-[#efe5e1]" style={{background:`linear-gradient(145deg,${scene[index%scene.length]},#fff)`}} title={item.title}/>)}</div></Card>
        <Card className="p-4"><h2 className="glow-display text-[16px]">Stats</h2><div className="mt-4 grid grid-cols-3 gap-2 text-center"><div><p className="glow-display text-[20px]">{yearEntries.length}</p><p className="text-[8px] text-[#9c918a]">Years</p></div><div><p className="glow-display text-[20px]">{milestoneCount}</p><p className="text-[8px] text-[#9c918a]">Milestones</p></div><div><p className="glow-display text-[20px]">{story.length}</p><p className="text-[8px] text-[#9c918a]">Events</p></div></div></Card>
        <Card className="bg-[linear-gradient(160deg,#fff,#faeeee)] p-4"><Sparkles size={13} className="text-[#bd6978]"/><h2 className="glow-display mt-3 text-[16px]">Explore Your Life</h2><p className="mt-2 text-[9px] leading-4 text-[#8d817a]">See patterns and key moments without losing the exact source record behind each one.</p></Card>
      </aside>
    </div>
  </div></AppShell>;
}
