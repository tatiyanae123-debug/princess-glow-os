import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createFitnessSessionAction } from '@/app/actions/completion-v1';
import { getFitnessSessions } from '@/lib/data/completion-v1';
import { Activity, Dumbbell, HeartPulse, TimerReset } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FitnessPage() {
  const session=await auth(); if(!session?.user?.id) redirect('/sign-in');
  const sessions=await getFitnessSessions(session.user.id);
  const recent=sessions.slice(0,7);
  const minutes=recent.reduce((sum,s)=>sum+(s.durationMinutes??0),0);
  const avgEnergy=recent.length?Math.round(recent.reduce((sum,s)=>sum+(s.energy??0),0)/recent.length):0;

  return <AppShell><SectionPage eyebrow="Fitness Intelligence" title="Train around your real energy" description="Log workouts, time, energy, soreness, and equipment so Glow OS can make better schedule-aware recommendations.">
    <section className="grid gap-3 md:grid-cols-[1.3fr_.7fr]">
      <Card className="relative overflow-hidden min-h-[190px] bg-[linear-gradient(135deg,#e5e1de,#b9c2c2)] p-5"><div className="absolute right-0 top-0 h-full w-[42%] bg-[linear-gradient(145deg,#7d807d,#c5bbb2)] opacity-70"/><Dumbbell size={64} strokeWidth={.7} className="absolute right-[15%] top-1/2 -translate-y-1/2 text-white/55"/><div className="relative max-w-[54%]"><p className="glow-eyebrow">Today&apos;s movement</p><h2 className="glow-display mt-2 text-[27px] leading-8 text-[#354044]">Strong, steady, recovered.</h2><p className="mt-3 text-[9px] leading-4 text-[#5f6b6d]">Your training room should help you choose the right intensity, not pressure you into the wrong one.</p></div></Card>
      <Card className="bg-[linear-gradient(145deg,#edf0ed,#f7f1eb)] p-5"><p className="glow-display text-[17px] text-[#45514f]">Recovery snapshot</p><div className="mt-4 space-y-3"><div className="flex items-center justify-between text-[9px] text-[#6f7b79]"><span className="flex items-center gap-1"><TimerReset size={11}/>Recent minutes</span><strong className="text-[#3f4b49]">{minutes}</strong></div><div className="flex items-center justify-between text-[9px] text-[#6f7b79]"><span className="flex items-center gap-1"><Activity size={11}/>Sessions</span><strong className="text-[#3f4b49]">{recent.length}</strong></div><div className="flex items-center justify-between text-[9px] text-[#6f7b79]"><span className="flex items-center gap-1"><HeartPulse size={11}/>Avg. energy</span><strong className="text-[#3f4b49]">{avgEnergy || '—'}/10</strong></div></div></Card>
    </section>

    <div className="mt-4 grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
      <Card className="paper-card"><form action={createFitnessSessionAction} className="space-y-3"><p className="glow-eyebrow">Training log</p><h2 className="glow-display text-[20px] text-[#3d4746]">Log session</h2><input name="workoutType" required placeholder="Pilates, strength, walk…" className="w-full border px-4 py-3 text-[10px]"/><input name="occurredAt" type="datetime-local" className="w-full border px-4 py-3 text-[10px]"/><input name="durationMinutes" inputMode="numeric" placeholder="Minutes" className="w-full border px-4 py-3 text-[10px]"/><div className="grid grid-cols-2 gap-2"><input name="energy" inputMode="numeric" placeholder="Energy 1–10" className="border px-3 py-3 text-[10px]"/><input name="soreness" inputMode="numeric" placeholder="Soreness 1–10" className="border px-3 py-3 text-[10px]"/></div><input name="equipment" placeholder="Equipment" className="w-full border px-4 py-3 text-[10px]"/><textarea name="notes" rows={3} placeholder="Recovery / session notes" className="w-full border px-4 py-3 text-[10px]"/><button className="rounded-[6px] bg-[#3b4544] px-4 py-2 text-[9px] font-medium text-white">Save workout</button></form></Card>

      <Card className="p-0 overflow-hidden"><div className="border-b border-[#e1dddd] px-5 py-4"><p className="glow-eyebrow">Movement archive</p><h2 className="glow-display mt-1 text-[19px] text-[#3d4746]">Session history</h2></div>{sessions.length===0?<p className="p-8 text-center text-[9px] text-[#7f8987]">No workouts logged yet.</p>:<div className="divide-y divide-[#e6e1df]">{sessions.map((s,index)=><div key={s.id} className={`grid gap-3 px-5 py-4 md:grid-cols-[55px_1fr_auto] ${index===0?'bg-[#edf0ef]/65':''}`}><div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#cfd7d4] bg-white/45 text-[#6f7c79]"><Dumbbell size={16}/></div><div><div className="flex flex-wrap items-center gap-2"><p className="glow-display text-[14px] text-[#414b49]">{s.workoutType}</p><span className="text-[7px] text-[#8d9694]">{s.occurredAt.toLocaleDateString()}</span></div><p className="mt-1 text-[8px] text-[#78817f]">{s.durationMinutes??'—'} min · energy {s.energy??'—'} · soreness {s.soreness??'—'}</p>{s.notes?<p className="mt-2 text-[8px] leading-4 text-[#68716f]">{s.notes}</p>:null}</div><span className="self-start rounded-full bg-[#e7ece8] px-2 py-1 text-[7px] text-[#68756b]">session {String(index+1).padStart(2,'0')}</span></div>)}</div>}</Card>
    </div>
  </SectionPage></AppShell>;
}
