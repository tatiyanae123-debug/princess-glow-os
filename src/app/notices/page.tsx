import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { dismissGlowNoticeAction, reviewGlowNoticeAction, snoozeGlowNoticeAction } from '@/app/actions/glow-notices';
import { ensureGlowNotices } from '@/lib/intelligence/glow-notices';
import { CheckCircle2, Clock3, Info, ShieldAlert, Sparkles, WandSparkles, X } from 'lucide-react';

export const dynamic='force-dynamic';
const tabs=['all','system','updates','security','account'] as const;
function bucket(domain:string,title:string){const text=`${domain} ${title}`.toLowerCase();if(/security|login|permission|privacy/.test(text))return'security';if(/account|subscription|billing/.test(text))return'account';if(/system|sync|integration|glow/.test(text))return'system';return'updates'}
function age(value:Date){const minutes=Math.max(0,Math.floor((Date.now()-value.getTime())/60000));if(minutes<1)return'now';if(minutes<60)return`${minutes}m`;const hours=Math.floor(minutes/60);if(hours<24)return`${hours}h`;const days=Math.floor(hours/24);return days<7?`${days}d`:value.toLocaleDateString('en-US',{month:'short',day:'numeric'})}

export default async function NoticesPage({searchParams}:{searchParams:Promise<{category?:string}>}){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 let notices;try{notices=await ensureGlowNotices(session.user.id)}catch{return <AppShell><div className="mx-auto max-w-[1180px] rounded-[8px] border border-[#ebe4df] bg-white p-5 text-[10px]">Notices need intelligence activation. <Link href="/settings/intelligence" className="text-[#874555]">Activate intelligence →</Link></div></AppShell>}
 const params=await searchParams;const selected=tabs.includes(params.category as typeof tabs[number])?params.category as typeof tabs[number]:'all';
 const now=new Date();const active=notices.filter(n=>n.status==='active'||(n.status==='snoozed'&&n.snoozedUntil&&n.snoozedUntil<=now));const filtered=active.filter(n=>selected==='all'||bucket(n.domain,n.title)===selected);
 const iconFor=(n:typeof notices[number])=>bucket(n.domain,n.title)==='security'?<ShieldAlert size={12}/>:bucket(n.domain,n.title)==='system'?<Clock3 size={12}/>:bucket(n.domain,n.title)==='account'?<Info size={12}/>:<Sparkles size={12}/>;
 return <AppShell><div className="b10-root b10-notices">
  <header className="b10-head"><div><p className="b10-eyebrow">6. NOTICES</p><h1>Notices</h1><p>Important updates and alerts.</p></div></header>
  <nav className="b10-tabs" aria-label="Notice groups">{tabs.map(tab=><Link key={tab} className={selected===tab?'active':''} href={tab==='all'?'/notices':`/notices?category=${tab}`}>{tab[0].toUpperCase()+tab.slice(1)}</Link>)}</nav>
  <section className="b10-card b10-notice-list">{filtered.length?filtered.map(n=><article key={n.id} className="b10-notice-row"><span className={`b10-notice-icon ${bucket(n.domain,n.title)}`}>{iconFor(n)}</span><div><strong>{n.title}</strong><p>{n.recommendation||n.evidence}</p></div><span className="b10-notice-age" title={`${Math.round(n.confidence*100)}% confidence`}>{age(n.createdAt)}</span><div className="b10-notice-actions"><form action={reviewGlowNoticeAction.bind(null,n.id)}><button title="Review" aria-label={`Review ${n.title}`}><WandSparkles size={10}/></button></form><form action={snoozeGlowNoticeAction.bind(null,n.id)}><button title="Snooze" aria-label={`Snooze ${n.title}`}><Clock3 size={10}/></button></form><form action={dismissGlowNoticeAction.bind(null,n.id)}><button title="Dismiss" aria-label={`Dismiss ${n.title}`}><X size={10}/></button></form></div></article>):<div className="b10-empty"><CheckCircle2 size={15}/>Nothing in this notice group needs your attention.</div>}</section>
  <div className="b10-notice-footer"><span>Stay informed. Stay in control.</span><Link href="/settings/intelligence">Notice settings →</Link></div>
 </div></AppShell>
}
