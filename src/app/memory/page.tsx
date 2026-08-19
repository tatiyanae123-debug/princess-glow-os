import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { createLifeMemoryAction, setLifeMemoryArchivedAction, setLifeMemoryPinnedAction } from '@/app/actions/intelligence-expansion';
import { getAllLifeMemoriesByUser, getProjectsByUser } from '@/lib/data/user-scope';
import { Filter, Pin, Search } from 'lucide-react';

export const dynamic='force-dynamic';
const fieldClass='w-full rounded-[8px] border border-[#eee4e0] bg-white px-3 py-2 text-[9px] outline-none focus:border-[#c7687a]';
const art=['linear-gradient(145deg,#e8e4df,#f8f4ef)','linear-gradient(145deg,#d9cfc2,#f4ece4)','linear-gradient(145deg,#eee7df,#d7c8bc)','linear-gradient(145deg,#dcc4b6,#f5e8df)','linear-gradient(145deg,#d2b89f,#efe2d6)','linear-gradient(145deg,#e7ded8,#fffaf6)'];

export default async function MemoryPage({searchParams}:{searchParams:Promise<{q?:string;category?:string;memoryId?:string}>}){
 const s=await auth();if(!s?.user?.id)redirect('/sign-in');
 const [params,memories,projects]=await Promise.all([searchParams,getAllLifeMemoriesByUser(s.user.id),getProjectsByUser(s.user.id)]);
 const q=(params.q??'').trim().toLowerCase();const category=params.category??'all';
 const active=memories.filter(m=>!m.archived).filter(m=>category==='all'||m.category===category).filter(m=>!q||`${m.title} ${m.summary??''} ${m.category}`.toLowerCase().includes(q));
 const selected=params.memoryId?memories.find(m=>m.id===params.memoryId)??null:null;
 const tabs=['Timeline','People','Places','Projects','Ideas','Documents'];
 return <AppShell><div className="batch2-page space-y-4">
  <header><p className="batch2-kicker">3. Memory</p><h1 className="batch2-title mt-3">Memory</h1><p className="batch2-subtitle">Your living archive of moments, people, and experiences.</p></header>
  <nav className="batch2-tabs">{tabs.map((tab,i)=><Link key={tab} href={i===3?'/projects':'/memory'} className={i===0?'active':''}>{tab}</Link>)}</nav>
  <div className="flex items-center justify-between"><h2 className="font-serif text-[15px]">{new Date().toLocaleDateString('en-US',{month:'long',year:'numeric'})}</h2><div className="flex gap-2"><form method="get" className="hidden items-center gap-1 rounded-[7px] border border-[#eee4e0] bg-white px-2 sm:flex"><Search size={10}/><input name="q" defaultValue={params.q??''} placeholder="Search" className="w-24 bg-transparent py-2 text-[8px] outline-none"/></form><details className="relative"><summary className="batch2-btn list-none cursor-pointer"><Filter size={10}/>Filter</summary><div className="absolute right-0 z-20 mt-2 w-44 rounded-[10px] border border-[#eee4e0] bg-white p-2 shadow-xl"><Link href="/memory" className="block rounded-[6px] px-2 py-1.5 text-[8px]">All</Link>{Array.from(new Set(memories.filter(m=>!m.archived).map(m=>m.category))).map(c=><Link key={c} href={`/memory?category=${encodeURIComponent(c)}`} className="block rounded-[6px] px-2 py-1.5 text-[8px] capitalize hover:bg-[#f9efee]">{c}</Link>)}</div></details><details className="relative"><summary className="batch2-btn batch2-btn-primary list-none cursor-pointer">+ New Memory</summary><form action={createLifeMemoryAction} className="absolute right-0 z-30 mt-2 w-[320px] space-y-2 rounded-[12px] border border-[#eee4e0] bg-white p-4 shadow-xl"><input name="title" required placeholder="Memory title" className={fieldClass}/><input name="category" placeholder="Category" className={fieldClass}/><textarea name="summary" rows={4} placeholder="What should Glow remember?" className={fieldClass}/><select name="relatedProjectId" defaultValue="" className={fieldClass}><option value="">No project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select><input type="hidden" name="privacyLevel" value="private"/><button className="batch2-btn batch2-btn-primary w-full">Save Memory</button></form></details></div></div>

  {params.memoryId&&!selected?<div className="batch2-card p-4 text-[9px] text-[#91857e]">That saved memory is no longer available.</div>:null}
  {selected?<section className="batch2-card p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="batch2-kicker">Selected memory</p><h2 className="mt-2 font-serif text-[18px]">{selected.title}</h2><p className="batch2-body mt-2 max-w-2xl">{selected.summary||'No summary was saved.'}</p></div><div className="flex gap-2"><form action={setLifeMemoryPinnedAction.bind(null,selected.id,!selected.pinned)}><button className="batch2-btn"><Pin size={10}/>{selected.pinned?'Unpin':'Pin'}</button></form><form action={setLifeMemoryArchivedAction.bind(null,selected.id,true)}><button className="batch2-btn">Archive</button></form></div></div></section>:null}

  <section className="batch2-memory-grid">{active.length?active.slice(0,6).map((m,i)=><Link href={`/memory?memoryId=${encodeURIComponent(m.id)}`} key={m.id} className="batch2-card batch2-memory-tile"><div className="batch2-memory-thumb" style={{background:art[i%art.length]}}/><div className="p-3"><p className="text-[9px] font-medium line-clamp-1">{m.title}</p><p className="batch2-mini mt-1">{m.createdAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})} · <span className="capitalize">{m.category}</span></p></div></Link>):Array.from({length:6}).map((_,i)=><div key={i} className="batch2-card batch2-memory-tile"><div className="batch2-memory-thumb" style={{background:art[i%art.length]}}/><div className="p-3"><p className="text-[9px] font-medium">Your memory will appear here</p><p className="batch2-mini mt-1">No saved item yet</p></div></div>)}</section>
  <Link href="/memory" className="batch2-btn flex w-full">View more memories</Link>
 </div></AppShell>;
}
