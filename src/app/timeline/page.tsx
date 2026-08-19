import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { createTimelineEventAction } from '@/app/actions/completion-v1';
import { getFitnessSessions, getHairLogs, getTimelineEvents } from '@/lib/data/completion-v1';
import { Plus } from 'lucide-react';

export const dynamic='force-dynamic';
const field='w-full rounded-[8px] border border-[#eee4e0] px-3 py-2 text-[9px] outline-none';
type Story={id:string;title:string;category:string;occurredAt:Date;href:string};
const thumbs=['linear-gradient(145deg,#e8ddd4,#fff8f3)','linear-gradient(145deg,#ead7c8,#c2a58d)','linear-gradient(145deg,#d4c1ae,#e9ddd2)','linear-gradient(145deg,#b8aa9a,#e8ddd2)'];

export default async function TimelinePage(){
 const s=await auth();if(!s?.user?.id)redirect('/sign-in');
 const [events,fitness,hair]=await Promise.all([getTimelineEvents(s.user.id),getFitnessSessions(s.user.id),getHairLogs(s.user.id)]);
 const story:Story[]=[...events.map(e=>({id:`t-${e.id}`,title:e.title,category:e.category,occurredAt:e.occurredAt,href:`/timeline?eventId=${encodeURIComponent(e.id)}`})),...fitness.map(e=>({id:`f-${e.id}`,title:`${e.workoutType} workout`,category:'Fitness',occurredAt:e.occurredAt,href:`/fitness?sessionId=${encodeURIComponent(e.id)}`})),...hair.map(e=>({id:`h-${e.id}`,title:e.style?`${e.eventType}: ${e.style}`:e.eventType,category:'Hair',occurredAt:e.occurredAt,href:`/hair?logId=${encodeURIComponent(e.id)}`}))].sort((a,b)=>a.occurredAt.getTime()-b.occurredAt.getTime());
 const years=Array.from(new Set(story.map(s=>s.occurredAt.getFullYear()))).sort();const year=years.at(-1)??new Date().getFullYear();const current=story.filter(s=>s.occurredAt.getFullYear()===year);const markers=(current.length?current:story.slice(-6)).slice(-7);const monthItems=[...story].sort((a,b)=>b.occurredAt.getTime()-a.occurredAt.getTime()).slice(0,4);
 return <AppShell><div className="batch2-page space-y-4">
  <header className="flex items-start justify-between gap-4"><div><p className="batch2-kicker">4. Timeline</p><h1 className="batch2-title mt-3">Timeline</h1><p className="batch2-subtitle">Your life, beautifully visualized.</p></div><div className="flex gap-2"><span className="batch2-btn">Zoom</span><span className="batch2-btn">Month⌄</span><details className="relative"><summary className="batch2-btn list-none cursor-pointer"><Plus size={10}/>Event</summary><form action={createTimelineEventAction} className="absolute right-0 z-30 mt-2 w-[300px] space-y-2 rounded-[12px] border border-[#eee4e0] bg-white p-4 shadow-xl"><input name="title" required placeholder="What happened?" className={field}/><input name="category" required placeholder="Category" className={field}/><input name="occurredAt" required type="datetime-local" className={field}/><textarea name="summary" rows={3} placeholder="What should you remember?" className={field}/><button className="batch2-btn batch2-btn-primary w-full">Add to Timeline</button></form></details></div></header>
  <nav className="flex items-center justify-center gap-9 border-y border-[#eee6e2] py-3 text-[8px]">{years.slice(-4).map(y=><span key={y} className={y===year?'border-b border-[#b65369] pb-2 text-[#9f4d60]':''}>{y}</span>)}<span>All Time</span></nav>
  <section className="batch2-card batch2-timeline-hero">
   <div className="absolute inset-x-0 top-[46%] z-10 h-px bg-white/55"/>
   <div className="absolute inset-x-[5%] top-[20%] z-20 flex justify-between gap-2">{markers.map((item,i)=><Link key={item.id} href={item.href} className="group relative flex w-[13%] flex-col items-center text-center"><div className={`h-[115px] w-px ${i%2?'mt-[25px]':'mt-[70px]'} bg-[#b4576c]/55`}/><span className="-mt-1 h-2.5 w-2.5 rounded-full bg-[#b65369] ring-4 ring-white/75"/><div className="mt-2 max-w-[90px]"><p className="text-[7px] font-medium text-[#4d433e] line-clamp-2">{item.title}</p><p className="mt-1 text-[6.5px] text-[#8d817a]">{item.occurredAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p></div></Link>)}</div>
   {!markers.length?<div className="absolute inset-0 z-20 grid place-items-center text-[9px] text-white/85">Your timeline is ready for its first moment.</div>:null}
  </section>
  <section><h2 className="mb-3 font-serif text-[15px]">{new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{monthItems.length?monthItems.map((item,i)=><Link href={item.href} key={item.id} className="batch2-card overflow-hidden"><div className="h-[115px]" style={{background:thumbs[i%thumbs.length]}}/><div className="p-3"><p className="text-[8px] font-medium line-clamp-1">{item.title}</p><p className="batch2-mini mt-1">{item.occurredAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p></div></Link>):Array.from({length:4}).map((_,i)=><div key={i} className="batch2-card overflow-hidden"><div className="h-[115px]" style={{background:thumbs[i]}}/><div className="p-3 text-[8px] text-[#958a83]">Your moments will appear here.</div></div>)}</div></section>
 </div></AppShell>;
}
