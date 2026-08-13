import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { applyGlowNoticeAction, dismissGlowNoticeAction, setGlowNoticeFeedbackAction, snoozeGlowNoticeAction } from '@/app/actions/glow-notices';
import { ensureGlowNotices } from '@/lib/intelligence/glow-notices';
import { BellRing, Check, Clock3, Pin, Sparkles, ThumbsDown, ThumbsUp, WandSparkles, X } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function NoticesPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  let notices;
  try{notices=await ensureGlowNotices(session.user.id)}catch{return <AppShell><div className="mx-auto max-w-4xl rounded-[20px] border border-[#F1E7E3] bg-white p-6"><p className="glow-display text-[20px]">Notices need intelligence activation.</p><Link href="/settings/intelligence" className="mt-3 inline-block text-[12px] text-[#C9727E]">Activate intelligence →</Link></div></AppShell>}
  const now=new Date();
  const active=notices.filter(n=>n.status==='active'||(n.status==='snoozed'&&n.snoozedUntil&&n.snoozedUntil<=now));
  const pinned=active.filter(n=>n.confidence>=.8).slice(0,4);
  const history=notices.filter(n=>!active.some(a=>a.id===n.id)).slice(0,8);

  return <AppShell><div className="space-y-5">
    <header><p className="glow-eyebrow text-[#C9727E]">Notices</p><h1 className="glow-display mt-1 text-[42px] leading-[1.02] tracking-[-.025em] sm:text-[54px] lg:text-[60px]">Notices</h1><p className="mt-2 text-[13px] text-[#8A8078]">Stay informed. Never miss what matters.</p></header>

    <section className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
      <Card><div className="flex items-center justify-between"><div className="flex items-center gap-2"><BellRing size={15} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Unread Notices</h2></div><span className="text-[10px] text-[#C9727E]">{active.length}</span></div><div className="mt-4 divide-y divide-[#F1E7E3]">{active.length?active.map(n=><article key={n.id} className="py-4"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#C9727E]"/><p className="text-[11.5px] font-medium text-[#3A332E]">{n.title}</p></div><p className="mt-1 pl-4 text-[10px] text-[#9A9088]">{n.domain} · {Math.round(n.confidence*100)}% confidence</p><p className="mt-2 pl-4 text-[10.5px] leading-4 text-[#7D746F] line-clamp-2">{n.recommendation||n.evidence}</p></div><div className="flex gap-1"><form action={applyGlowNoticeAction.bind(null,n.id)}><button title="Apply" className="rounded-full border border-[#F1E7E3] p-2 text-[#5A6E52]"><WandSparkles size={11}/></button></form><form action={snoozeGlowNoticeAction.bind(null,n.id)}><button title="Snooze" className="rounded-full border border-[#F1E7E3] p-2 text-[#9A7A3D]"><Clock3 size={11}/></button></form><form action={dismissGlowNoticeAction.bind(null,n.id)}><button title="Dismiss" className="rounded-full border border-[#F1E7E3] p-2 text-[#B15A68]"><X size={11}/></button></form></div></div></article>):<p className="py-8 text-center text-[11.5px] text-[#9A9088]">Nothing needs your attention.</p>}</div></Card>
      <Card><div className="flex items-center gap-2"><Pin size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Pinned</h2></div><div className="mt-4 space-y-4">{pinned.length?pinned.map(n=><div key={n.id} className="rounded-[12px] bg-[#FFF8F5] p-3"><p className="text-[11.5px] font-medium">{n.title}</p><p className="mt-1 text-[9.5px] text-[#9A9088]">{n.domain}</p></div>):<p className="text-[11px] text-[#9A9088]">High-confidence active notices appear here.</p>}</div></Card>
    </section>

    <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr_.65fr]">
      <Card><h2 className="glow-display text-[18px]">All Notices</h2><div className="mt-4 divide-y divide-[#F1E7E3]">{notices.slice(0,10).map(n=><div key={n.id} className="flex items-center justify-between gap-3 py-3"><div><p className="text-[11px] font-medium text-[#3A332E]">{n.title}</p><p className="text-[9.5px] text-[#9A9088]">{n.domain}</p></div><span className="rounded-full bg-[#FDF8F6] px-2 py-1 text-[8.5px] uppercase tracking-[.08em] text-[#8A8078]">{n.status}</span></div>)}</div></Card>
      <Card><h2 className="glow-display text-[18px]">Preferences</h2><div className="mt-4 space-y-4 text-[11px]"><p className="flex justify-between"><span>Smart notices</span><span className="text-[#5A6E52]">On</span></p><p className="flex justify-between"><span>Confidence display</span><span className="text-[#5A6E52]">On</span></p><p className="flex justify-between"><span>Feedback learning</span><span className="text-[#5A6E52]">On</span></p></div><Link href="/settings/intelligence" className="mt-5 inline-flex text-[10.5px] text-[#C9727E]">Manage preferences →</Link></Card>
      <Card className="min-h-[240px] bg-[linear-gradient(145deg,#EBDDD3,#FAF3EE)]"><div className="flex h-full flex-col justify-end"><Sparkles size={18} className="text-[#C9727E]"/><p className="glow-display mt-3 text-[17px] italic leading-6 text-[#4A4440]">Glow only surfaces a notice when there is enough evidence to make it useful.</p></div></Card>
    </section>

    {history.length?<Card><h2 className="glow-display text-[18px]">Recent Decisions</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{history.map(n=><div key={n.id} className="rounded-[12px] border border-[#F1E7E3] p-3"><p className="text-[11px] font-medium">{n.title}</p><div className="mt-2 flex items-center justify-between"><span className="text-[9px] text-[#9A9088]">{n.status}</span><div className="flex gap-1"><form action={setGlowNoticeFeedbackAction.bind(null,n.id,'helpful')}><button className="rounded-full p-1.5 text-[#5A6E52]"><ThumbsUp size={11}/></button></form><form action={setGlowNoticeFeedbackAction.bind(null,n.id,'not_helpful')}><button className="rounded-full p-1.5 text-[#B15A68]"><ThumbsDown size={11}/></button></form>{typeof n.actionPayload?.feedback==='string'?<Check size={11} className="mt-1.5 text-[#5A6E52]"/>:null}</div></div></div>)}</div></Card>:null}
  </div></AppShell>;
}
