import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createTimelineEventAction } from '@/app/actions/completion-v1';
import { getTimelineEvents } from '@/lib/data/completion-v1';
import { Camera, Clock3, Sparkles } from 'lucide-react';

export const dynamic='force-dynamic';
const fieldClass='w-full border px-4 py-3 text-[10px]';

export default async function TimelinePage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const events=await getTimelineEvents(session.user.id);
  const groups=new Map<string,typeof events>();
  for(const event of events){const key=event.occurredAt.toLocaleDateString('en-US',{month:'long',year:'numeric'});groups.set(key,[...(groups.get(key)??[]),event]);}
  return <AppShell><SectionPage eyebrow="Life Timeline" title="See your life as a connected story" description="Capture milestones, jobs, trips, projects, achievements, decisions, beauty or fitness progress, and memories in one chronological view.">
    <div className="space-y-4">
      <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#f3ebdf,#f7f0e8)] p-5"><Camera size={54} strokeWidth={.75} className="absolute right-5 top-3 text-[#8a7764]/16"/><p className="glow-eyebrow">Life gallery</p><p className="glow-display mt-2 text-[24px] text-[#4b4034]">Moments become a story when you can see the thread.</p><p className="mt-2 text-[9px] text-[#7d7064]">{events.length} moment{events.length===1?'':'s'} currently live on your timeline.</p></Card>
      <div className="grid gap-5 lg:grid-cols-[.68fr_1.32fr]">
        <Card className="paper-card"><form action={createTimelineEventAction} className="space-y-3"><div className="flex items-center gap-2"><Sparkles size={13} className="text-[#92795e]"/><h2 className="glow-display text-[20px] text-[#4b4034]">Add timeline event</h2></div><input name="title" required placeholder="What happened?" className={fieldClass}/><input name="category" required placeholder="Category: career, travel, project…" className={fieldClass}/><input name="occurredAt" required type="datetime-local" className={fieldClass}/><textarea name="summary" rows={4} placeholder="What should you remember?" className={fieldClass}/><button className="rounded-[6px] bg-[#453a31] px-4 py-2 text-[9px] text-white">Add to timeline</button></form></Card>
        <Card className="p-0 overflow-hidden"><div className="border-b border-[#e8dfd3] px-5 py-4"><p className="glow-eyebrow">Gallery wall</p><h2 className="glow-display mt-1 text-[19px] text-[#4b4034]">Your timeline</h2></div>{events.length===0?<p className="p-8 text-center text-[9px] text-[#85786c]">Your timeline is empty. Add a meaningful event to begin.</p>:<div className="p-5">{[...groups.entries()].map(([label,items])=><section key={label} className="mb-6 last:mb-0"><p className="glow-display mb-3 text-[14px] italic text-[#75685b]">{label}</p><div className="relative space-y-3 border-l border-[#d8cdc0] pl-5">{items.map((event,index)=><div key={event.id} className={`relative rounded-[8px] border border-[#e8dfd5] p-4 ${index%2===0?'bg-[#faf5ed]':'bg-[#f5ece5]'}`}><span className="absolute -left-[25px] top-5 h-2.5 w-2.5 rounded-full border-2 border-[#f7f0e8] bg-[#98826c]"/><div className="flex justify-between gap-3"><p className="glow-display text-[14px] text-[#4b4034]">{event.title}</p><span className="inline-flex items-center gap-1 text-[7px] text-[#988a7d]"><Clock3 size={8}/>{event.occurredAt.toLocaleDateString()}</span></div><p className="mt-1 text-[7px] uppercase tracking-[.13em] text-[#9b897a]">{event.category}</p>{event.summary?<p className="mt-2 text-[8px] leading-4 text-[#75695e]">{event.summary}</p>:null}</div>)}</div></section>)}</div>}</Card>
      </div>
    </div>
  </SectionPage></AppShell>;
}
