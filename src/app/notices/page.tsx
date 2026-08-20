import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { dismissGlowNoticeAction, reviewGlowNoticeAction, snoozeGlowNoticeAction } from '@/app/actions/glow-notices';
import { ensureGlowNotices } from '@/lib/intelligence/glow-notices';
import { BellRing, CheckCircle2, Clock3, Sparkles, WandSparkles, X } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function NoticesPage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 let notices;try{notices=await ensureGlowNotices(session.user.id)}catch{return <AppShell><div className="b8-notices-page rounded-[8px] border border-[#eee5e1] bg-white p-5"><p className="font-medium">Notices need intelligence activation.</p><Link href="/settings/intelligence" className="mt-3 inline-block text-[10px] text-[#8e495a]">Activate intelligence →</Link></div></AppShell>}
 const now=new Date();const active=notices.filter(n=>n.status==='active'||(n.status==='snoozed'&&n.snoozedUntil&&n.snoozedUntil<=now));const important=active.filter(n=>n.confidence>=.8);const earlier=notices.filter(n=>!active.some(a=>a.id===n.id)).slice(0,8);
 return <AppShell><div className="b8-notices-page space-y-3">
  <header><p className="b8-eyebrow">2. NOTICES</p><h1>Notices</h1><p className="mt-1 text-[10px] text-[#8A8078]">Everything that needs your attention.</p></header>
  <nav className="b8-tabs" aria-label="Notice groups"><a className="active" href="#all">All</a><a href="#important">Important</a><Link href="/reminders">Reminders</Link><a href="#earlier">Updates</a><Link href="/settings/intelligence">System</Link></nav>
  <section id="important" className="rounded-[8px] border border-[#eee5e1] bg-white">
   <div className="flex items-center justify-between border-b border-[#eee7e2] px-3 py-2"><div className="flex items-center gap-2"><BellRing size={12} className="text-[#8e495a]"/><p className="text-[9px] font-semibold">Important</p></div><span className="text-[8px] text-[#9A9088]">{important.length}</span></div>
   <div className="divide-y divide-[#eee7e2]">{important.length?important.map(n=><article key={n.id} className="grid grid-cols-[28px_1fr_auto] items-center gap-2 px-3 py-3"><span className="grid h-7 w-7 place-items-center rounded-[6px] bg-[#f8efef] text-[#8e495a]"><Sparkles size={12}/></span><div className="min-w-0"><p className="truncate text-[9.5px] font-medium">{n.title}</p><p className="mt-0.5 truncate text-[8px] text-[#938982]">{n.domain} · {Math.round(n.confidence*100)}% confidence</p></div><div className="flex gap-1"><form action={reviewGlowNoticeAction.bind(null,n.id)}><button aria-label={`Review ${n.title}`} className="rounded-full border border-[#eee5e1] p-1.5 text-[#5A6E52]"><WandSparkles size={10}/></button></form><form action={snoozeGlowNoticeAction.bind(null,n.id)}><button aria-label={`Snooze ${n.title}`} className="rounded-full border border-[#eee5e1] p-1.5 text-[#9A7A3D]"><Clock3 size={10}/></button></form><form action={dismissGlowNoticeAction.bind(null,n.id)}><button aria-label={`Dismiss ${n.title}`} className="rounded-full border border-[#eee5e1] p-1.5 text-[#B15A68]"><X size={10}/></button></form></div></article>):<p className="px-3 py-7 text-center text-[9px] text-[#9A9088]">No high-confidence notices need attention.</p>}</div>
  </section>
  <section id="all" className="rounded-[8px] border border-[#eee5e1] bg-white">
   <div className="flex items-center justify-between border-b border-[#eee7e2] px-3 py-2"><p className="text-[9px] font-semibold">All active notices</p><span className="text-[8px] text-[#9A9088]">{active.length}</span></div>
   <div className="divide-y divide-[#eee7e2]">{active.length?active.map(n=><div key={n.id} className="grid grid-cols-[28px_1fr_80px] items-center gap-2 px-3 py-3"><span className="grid h-7 w-7 place-items-center rounded-[6px] bg-[#faf5f2] text-[#8e495a]"><BellRing size={11}/></span><div><p className="text-[9.5px] font-medium">{n.title}</p><p className="mt-0.5 text-[8px] text-[#938982]">{n.recommendation||n.evidence}</p></div><span className="justify-self-end rounded-full bg-[#f8efef] px-2 py-1 text-[7px] text-[#8e495a]">{n.status}</span></div>):<div className="flex items-center justify-center gap-2 py-8 text-[9px] text-[#75826f]"><CheckCircle2 size={12}/>Nothing needs your attention.</div>}</div>
  </section>
  <section id="earlier" className="rounded-[8px] border border-[#eee5e1] bg-white"><div className="border-b border-[#eee7e2] px-3 py-2"><p className="text-[9px] font-semibold">Earlier</p></div><div className="divide-y divide-[#eee7e2]">{earlier.length?earlier.map(n=><div key={n.id} className="flex items-center justify-between gap-3 px-3 py-2.5"><div><p className="text-[9px]">{n.title}</p><p className="text-[7.5px] text-[#9A9088]">{n.domain}</p></div><span className="text-[7px] uppercase tracking-[.08em] text-[#8A8078]">{n.status}</span></div>):<p className="px-3 py-6 text-center text-[9px] text-[#9A9088]">No earlier notices.</p>}</div></section>
  <div className="flex justify-between rounded-[8px] border border-[#eee5e1] bg-[linear-gradient(90deg,#fff,#f8f0ec)] px-3 py-2 text-[8px]"><span>Glow only surfaces notices when there is evidence.</span><Link href="/settings/intelligence" className="text-[#8e495a]">Notice settings →</Link></div>
 </div></AppShell>
}
