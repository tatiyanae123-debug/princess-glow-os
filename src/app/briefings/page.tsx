import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { generateExpandedBriefingAction, type BriefingKind } from '@/app/actions/briefings';
import { getBriefings } from '@/lib/data/completion-v1';
import { CalendarDays, Clock3 } from 'lucide-react';

export const dynamic='force-dynamic';
const image='https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80';
const pastImages=['https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=500&q=70','https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=500&q=70','https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=70','https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=500&q=70'];
const kinds:[string,BriefingKind,string][]=[['Morning Brief','morning','Tomorrow · 7:00 AM'],['Weekly Brief','weekly','Sunday · 6:00 PM'],['Monthly Brief','monthly','1st of month · 9:00 AM']];
function routeFor(kind:string){return kind==='evening'?'/briefings/evening':kind==='morning'?'/briefings/morning':'/briefings'}

export default async function BriefingsPage(){
 const s=await auth();if(!s?.user?.id)redirect('/sign-in');const all=await getBriefings(s.user.id);const recent=all.slice(0,4);
 return <AppShell><div className="batch2-page space-y-4">
  <header><p className="batch2-kicker">8. Briefings</p><h1 className="batch2-title mt-3">Briefings</h1><p className="batch2-subtitle">Stay prepared and informed.</p></header>
  <nav className="batch2-tabs"><Link href="/briefings/morning" className="active">Morning Brief</Link><form action={generateExpandedBriefingAction.bind(null,'weekly')}><button>Weekly Brief</button></form><form action={generateExpandedBriefingAction.bind(null,'monthly')}><button>Monthly Brief</button></form></nav>
  <section className="batch2-brief-grid">
   <div className="batch2-card batch2-brief-feature"><div className="p-5"><p className="batch2-mini">Next Briefing</p><h2 className="mt-4 font-serif text-[24px] leading-tight">Morning Brief</h2><p className="mt-1 text-[9px]">Tomorrow</p><p className="mt-5 flex items-center gap-2 text-[8px] text-[#8e837c]"><Clock3 size={10}/>7:00 AM</p><Link href="/briefings/morning" className="batch2-btn batch2-btn-primary mt-7">Open Briefing</Link></div><div className="bg-cover bg-center" style={{backgroundImage:`linear-gradient(180deg,rgba(255,255,255,.05),rgba(55,38,30,.08)),url(${image})`}}/></div>
   <div className="batch2-card p-4"><h2 className="font-serif text-[15px]">This Week</h2><div className="mt-3 space-y-2">{kinds.map(([label,kind,when])=><div key={kind} className="batch2-row flex items-center gap-3 px-3 py-2.5"><CalendarDays size={12} className="text-[#8b756d]"/><div className="min-w-0 flex-1"><p className="text-[8.5px] font-medium">{label}</p><p className="batch2-mini mt-1">{when}</p></div>{kind==='morning'?<Link href="/briefings/morning" className="text-[7.5px] text-[#b65369]">Open</Link>:<form action={generateExpandedBriefingAction.bind(null,kind)}><button className="text-[7.5px] text-[#b65369]">Generate</button></form>}</div>)}</div></div>
  </section>
  <section><h2 className="mb-3 font-serif text-[15px]">Past Briefings</h2><div className="batch2-past">{recent.length?recent.map((b,i)=><Link href={routeFor(b.kind)} key={b.id} className="batch2-card overflow-hidden"><div className="h-[120px] bg-cover bg-center" style={{backgroundImage:`url(${pastImages[i%pastImages.length]})`}}/><div className="p-3"><p className="text-[8px] font-medium capitalize">{b.kind.replaceAll('_',' ')}</p><p className="batch2-mini mt-1">{b.generatedAt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p></div></Link>):Array.from({length:4}).map((_,i)=><div key={i} className="batch2-card overflow-hidden"><div className="h-[120px] bg-cover bg-center" style={{backgroundImage:`url(${pastImages[i]})`}}/><div className="p-3"><p className="text-[8px] font-medium">Briefings will appear here</p><p className="batch2-mini mt-1">No saved brief yet</p></div></div>)}</div></section>
 </div></AppShell>;
}
