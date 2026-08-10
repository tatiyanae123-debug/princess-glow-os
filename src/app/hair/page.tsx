import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createHairLogAction } from '@/app/actions/completion-v1';
import { getHairLogs } from '@/lib/data/completion-v1';
import { Sparkles, Waves, Scissors } from 'lucide-react';

export const dynamic='force-dynamic';
const fieldClass='w-full border px-4 py-3 text-[10px]';

export default async function HairPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const logs=await getHairLogs(session.user.id);
  const last=logs[0]??null;
  return <AppShell><SectionPage eyebrow="Hair Intelligence" title="Keep your hair routine visible" description="Track wash days, treatments, styling, heat, buildup, wig maintenance, trims, breakage notes, and the next action.">
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1.25fr_.75fr]"><Card className="relative overflow-hidden bg-[linear-gradient(145deg,#efe0d8,#dcc2b7)] p-5"><Waves size={58} strokeWidth={.8} className="absolute right-5 top-3 text-[#8f665d]/20"/><p className="glow-eyebrow">Maintenance studio</p><p className="glow-display mt-2 text-[25px] text-[#493733]">{last?.nextAction ?? 'Plan the next hair ritual'}</p><p className="mt-2 text-[9px] leading-4 text-[#795f58]">{last?`Last logged: ${last.eventType} on ${last.occurredAt.toLocaleDateString()}.`:'Start logging wash days and treatments so Glow can keep the next action visible.'}</p></Card><Card className="p-5"><p className="glow-display text-[16px] text-[#493733]">Hair timeline</p><div className="mt-4 flex items-center justify-between"><div><p className="text-[7px] uppercase tracking-[.12em] text-[#967d75]">Entries</p><p className="glow-display mt-1 text-[25px] text-[#4d3d38]">{logs.length}</p></div><Scissors size={26} className="text-[#a77b70]"/></div></Card></div>
      <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
        <Card className="paper-card"><form action={createHairLogAction} className="space-y-3"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#a6766e]"/><h2 className="glow-display text-[20px] text-[#493733]">Log hair care</h2></div><input name="eventType" required placeholder="Wash, bond treatment, scalp care, trim…" className={fieldClass}/><input name="occurredAt" type="datetime-local" className={fieldClass}/><input name="style" placeholder="Style" className={fieldClass}/><input name="products" placeholder="Products used" className={fieldClass}/><label className="flex items-center gap-2 text-[9px] text-[#725d56]"><input name="heatUsed" type="checkbox"/>Heat used</label><textarea name="notes" rows={3} placeholder="Buildup, breakage, scalp, result" className={fieldClass}/><input name="nextAction" placeholder="Next required action" className={fieldClass}/><button className="rounded-[6px] bg-[#43322e] px-4 py-2 text-[9px] font-medium text-white">Save hair log</button></form></Card>
        <Card className="p-0 overflow-hidden"><div className="border-b border-[#e7dad2] px-5 py-4"><p className="glow-eyebrow">History</p><h2 className="glow-display mt-1 text-[19px] text-[#493733]">Hair timeline</h2></div>{logs.length===0?<p className="p-8 text-center text-[9px] text-[#8d756e]">No hair care logged yet.</p>:<div className="divide-y divide-[#ede2dc]">{logs.map((log,index)=><div key={log.id} className={`grid gap-3 px-5 py-4 sm:grid-cols-[48px_1fr] ${index===0?'bg-[#f8ece7]/65':''}`}><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ead8cf] text-[#8d685f]"><Waves size={15}/></div><div><div className="flex flex-wrap items-center justify-between gap-2"><p className="glow-display text-[14px] text-[#4c3b36]">{log.eventType}</p><span className="text-[7px] text-[#9a837c]">{log.occurredAt.toLocaleDateString()}</span></div>{log.style?<p className="mt-1 text-[8px] text-[#837069]">Style: {log.style}</p>:null}{log.notes?<p className="mt-2 text-[8px] leading-4 text-[#715d57]">{log.notes}</p>:null}{log.nextAction?<p className="mt-2 rounded-[5px] bg-[#f1e3de] px-2.5 py-2 text-[8px] font-medium text-[#79524f]">Next: {log.nextAction}</p>:null}</div></div>)}</div>}</Card>
      </div>
    </div>
  </SectionPage></AppShell>;
}
