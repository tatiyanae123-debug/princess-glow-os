import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { createObservationAction, setObservationStatusAction } from '@/app/actions/completion-v1';
import { getObservations } from '@/lib/data/completion-v1';
import { Eye, Plus } from 'lucide-react';

export const dynamic='force-dynamic';
const fieldClass='w-full rounded-[8px] border border-[#eee4e0] px-3 py-2 text-[9px] outline-none focus:border-[#c7687a]';

export default async function ObservationsPage({searchParams}:{searchParams:Promise<{observationId?:string}>}){
 const s=await auth();if(!s?.user?.id)redirect('/sign-in');
 const [items,params]=await Promise.all([getObservations(s.user.id),searchParams]);
 const selected=params.observationId??null;const tabs=['All','Work','Wellness','Money','Beauty','Productivity','Relationships'];
 return <AppShell><div className="batch2-page space-y-4">
  <header><p className="batch2-kicker">5. Observations</p><h1 className="batch2-title mt-3">Observations</h1><p className="batch2-subtitle">Insights and patterns discovered by Glow.</p></header>
  <nav className="batch2-tabs">{tabs.map((t,i)=><span key={t} className={i===0?'active':''}>{t}</span>)}</nav>
  <div className="batch2-observation-list">{items.length?items.map(item=><article id={`observation-${item.id}`} key={item.id} className={`batch2-card batch2-observation ${selected===item.id?'ring-2 ring-[#f1d3d9]':''}`}><span className="grid h-8 w-8 place-items-center rounded-[7px] border border-[#eee4e0] text-[#9d756e]"><Eye size={12}/></span><div><Link href={`/observations?observationId=${encodeURIComponent(item.id)}`} className="text-[9.5px] font-medium">{item.title}</Link><p className="batch2-mini mt-2">Evidence: {item.evidence}</p><p className="batch2-mini mt-1">Confidence: {Math.round(item.confidence*100)}% · {item.timeWindow}</p></div><div className="flex items-center gap-2"><Link href={`/observations?observationId=${encodeURIComponent(item.id)}`} className="batch2-btn">View</Link><form action={setObservationStatusAction.bind(null,item.id,item.status==='dismissed'?'active':'dismissed')}><button className="batch2-btn">{item.status==='dismissed'?'Restore':'Dismiss'}</button></form></div></article>):<div className="batch2-card p-10 text-center text-[9px] text-[#91857e]">Glow has not saved any observations yet.</div>}</div>
  <details className="batch2-card"><summary className="flex cursor-pointer list-none items-center justify-center gap-2 p-4 text-[9px] text-[#b65369]"><Plus size={11}/>Add Observation</summary><form action={createObservationAction} className="mx-auto max-w-xl space-y-2 border-t border-[#eee6e2] p-4"><input name="category" required placeholder="Category" className={fieldClass}/><input name="title" required placeholder="Observation title" className={fieldClass}/><textarea name="evidence" required rows={3} placeholder="Evidence used" className={fieldClass}/><input name="timeWindow" required placeholder="Time window" className={fieldClass}/><button className="batch2-btn batch2-btn-primary">Save observation</button></form></details>
 </div></AppShell>;
}
