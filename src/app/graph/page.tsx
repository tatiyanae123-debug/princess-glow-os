import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { AppShell } from '@/components/app-shell';
import { db } from '@/db';
import { entityRelations } from '@/db/schema/adaptive-os';
import { glowEntities } from '@/db/schema/interconnected-os';
import { Network, Sparkles } from 'lucide-react';

export const dynamic='force-dynamic';
const C='rounded-[18px] border border-[#EEE3DE] bg-white p-4';
export default async function GraphPage(){
 const s=await auth(); if(!s?.user?.id)redirect('/sign-in');
 let entities;let relations;try{[entities,relations]=await Promise.all([
  db.select().from(glowEntities).where(eq(glowEntities.userId,s.user.id)).orderBy(desc(glowEntities.updatedAt)).limit(100),
  db.select().from(entityRelations).where(eq(entityRelations.userId,s.user.id)).orderBy(desc(entityRelations.createdAt)).limit(140)
 ])}catch{return <AppShell><div className={C}>Graph needs intelligence activation. <Link href="/settings/intelligence" className="text-[#C9727E]">Activate →</Link></div></AppShell>}
 const tc=count(entities.map(e=>e.entityType)),rc=count(relations.map(r=>r.relation));
 const types=Object.entries(tc).sort((a,b)=>b[1]-a[1]).slice(0,5),rels=Object.entries(rc).sort((a,b)=>b[1]-a[1]).slice(0,7);
 const connected=new Set(relations.flatMap(r=>[`${r.fromType}:${r.fromId}`,`${r.toType}:${r.toId}`])).size;
 const density=entities.length?Math.min(100,Math.round(relations.length/entities.length*100)):0;
 const stats=[['Entities',entities.length],['Relationships',relations.length],['Categories',Object.keys(tc).length],['Connected',connected],['Density',`${density}%`]];
 return <AppShell><div className="mx-auto max-w-[1240px] space-y-4">
  <header><div className="flex items-center gap-2"><Network size={16} className="text-[#C9727E]"/><h1 className="glow-display text-[46px] leading-none">Graph</h1><Sparkles size={14} className="text-[#D9A665]"/></div><p className="mt-2 text-[12px] text-[#92867E]">Visualize your patterns. Understand your progress. Elevate your day.</p></header>
  <div className="flex justify-between gap-2"><div className="flex gap-2"><b className="rounded-[10px] border border-[#EEE3DE] bg-white px-3 py-2 text-[10px] font-normal">Live graph</b><b className="rounded-[10px] border border-[#EEE3DE] bg-white px-3 py-2 text-[10px] font-normal">All categories</b></div><div className="flex gap-2"><Link href="/intake" className="rounded-[10px] bg-[#F7D9DE] px-3 py-2 text-[10px] text-[#9F5260]">+ Add Data</Link><Link href="/inbox" className="rounded-[10px] border border-[#EEE3DE] bg-white px-3 py-2 text-[10px]">Route Inbox</Link></div></div>
  <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{stats.map(([a,b])=><div key={a} className={C}><p className="text-[11px]">{a}</p><p className="glow-display mt-2 text-[27px]">{b}</p><div className="mt-3 h-1.5 rounded-full bg-[#F1E7E3]"><div className="h-full rounded-full bg-[#D78694]" style={{width:`${typeof b==='number'?Math.min(100,b*8):density}%`}}/></div></div>)}</section>
  <section className="grid gap-4 lg:grid-cols-2"><Panel title="Entity Overview" rows={types}/><Panel title="Relationship Mix" rows={rels}/></section>
  <section className="grid gap-4 lg:grid-cols-3"><div className={C}><h2 className="glow-display text-[16px]">Graph Snapshot</h2><div className="mt-4 flex items-center gap-5"><div className="grid h-28 w-28 place-items-center rounded-full" style={{background:`conic-gradient(#D78694 0 ${density}%,#E8E1D7 ${density}% 100%)`}}><div className="grid h-20 w-20 place-items-center rounded-full bg-white"><span className="glow-display text-[22px]">{density}%</span></div></div><p className="text-[10.5px] leading-6">{entities.length} entities<br/>{relations.length} links<br/>{connected} connected</p></div></div><Panel title="Top Categories" rows={types}/><Panel title="Connection Flow" rows={rels.slice(0,5)}/></section>
  <section className={`${C} flex flex-col gap-3 lg:flex-row lg:items-center`}><span className="glow-display flex items-center gap-2 text-[18px]"><Sparkles size={15} className="text-[#C9727E]"/>Glow Insight</span><p className="flex-1 glow-display text-[16px]">{rels[0]?`Your strongest connection pattern is “${rels[0][0].replaceAll('_',' ')},” with ${rels[0][1]} links.`:'Connect more rooms and Glow will surface your strongest pattern here.'}</p><Link href="/observations" className="text-[10.5px] text-[#C9727E]">View insights →</Link></section>
 </div></AppShell>;
}
function count(v:string[]){return v.reduce<Record<string,number>>((a,x)=>(a[x]=(a[x]??0)+1,a),{})}
function Panel({title,rows}:{title:string;rows:[string,number][]}){const m=Math.max(1,...rows.map(r=>r[1]));return <div className={C}><h2 className="glow-display text-[17px]">{title}</h2><div className="mt-4 space-y-3">{rows.length?rows.map(([n,v])=><div key={n}><div className="flex justify-between text-[10.5px]"><span className="capitalize">{n.replaceAll('_',' ')}</span><span>{v}</span></div><div className="mt-1 h-1.5 rounded-full bg-[#F1E7E3]"><div className="h-full rounded-full bg-[#9AAC8B]" style={{width:`${Math.round(v/m*100)}%`}}/></div></div>):<p className="text-[11px] text-[#92867E]">No data yet.</p>}</div></div>}
