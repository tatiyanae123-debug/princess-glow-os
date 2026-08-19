import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { AppShell } from '@/components/app-shell';
import { db } from '@/db';
import { entityRelations } from '@/db/schema/adaptive-os';
import { glowEntities } from '@/db/schema/interconnected-os';
import { Filter, Home, Plus, Search } from 'lucide-react';

export const dynamic='force-dynamic';
const pos=[[50,8],[76,18],[84,43],[78,70],[50,83],[21,70],[15,43],[23,18]] as const;
function label(v:string){return v.replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase())}

export default async function GraphPage(){
 const s=await auth();if(!s?.user?.id)redirect('/sign-in');
 let entities;let relations;try{[entities,relations]=await Promise.all([db.select().from(glowEntities).where(eq(glowEntities.userId,s.user.id)).orderBy(desc(glowEntities.updatedAt)).limit(100),db.select().from(entityRelations).where(eq(entityRelations.userId,s.user.id)).orderBy(desc(entityRelations.createdAt)).limit(140)])}catch{return <AppShell><div className="batch2-card p-5 text-[10px]">Graph needs intelligence activation. <Link href="/settings/intelligence" className="text-[#b65369]">Activate →</Link></div></AppShell>}
 const typeCounts=entities.reduce<Record<string,number>>((a,e)=>(a[e.entityType]=(a[e.entityType]??0)+1,a),{});
 const nodes=Object.entries(typeCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
 const center=entities[0];
 return <AppShell><div className="batch2-page space-y-4">
  <header className="flex items-start justify-between gap-4"><div><p className="batch2-kicker">6. Graph</p><h1 className="batch2-title mt-3">Graph</h1><p className="batch2-subtitle">Everything in your life is connected.</p></div><div className="flex gap-2"><span className="batch2-btn">All⌄</span><Link href="/observations" className="batch2-btn"><Filter size={10}/>Filter</Link><Link href="/intake" className="batch2-btn"><Plus size={10}/></Link></div></header>
  <section className="batch2-card batch2-graph-stage">
   <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><g stroke="#e7dcd6" strokeWidth=".25">{nodes.map((_,i)=><line key={i} x1="50" y1="50" x2={pos[i][0]} y2={pos[i][1]}/>)}</g></svg>
   <Link href={center?`/search?q=${encodeURIComponent(center.title??center.entityType)}`:'/dashboard'} className="batch2-graph-center z-10"><div className="text-center text-white drop-shadow-sm"><p className="font-serif text-[16px]">{center?.title||'Your Life'}</p><p className="mt-1 text-[7px] uppercase tracking-[.12em] opacity-80">{center?label(center.entityType):'Glow Graph'}</p></div></Link>
   {nodes.map(([name,count],i)=><Link key={name} href={`/search?q=${encodeURIComponent(name)}`} className="batch2-node z-20" style={{left:`calc(${pos[i][0]}% - 44px)`,top:`calc(${pos[i][1]}% - 32px)`}}><span><span className="block text-[8px] font-medium">{label(name)}</span><span className="mt-1 block text-[7px] text-[#a0958e]">{count} connected</span></span></Link>)}
   {!nodes.length?<div className="absolute inset-0 grid place-items-center text-[9px] text-[#978b84]">Add notes, goals, tasks and memories to grow your graph.</div>:null}
   <div className="absolute bottom-3 left-3 flex gap-2"><Link href="/dashboard" className="batch2-btn p-2" aria-label="Home"><Home size={11}/></Link><Link href="/search" className="batch2-btn p-2" aria-label="Search"><Search size={11}/></Link></div>
   <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[8px] text-[#9b9089]"><span>{entities.length} objects</span><span>·</span><span>{relations.length} links</span><button className="batch2-btn p-2" aria-label="Zoom out">−</button><button className="batch2-btn p-2" aria-label="Zoom in">+</button></div>
  </section>
 </div></AppShell>;
}
