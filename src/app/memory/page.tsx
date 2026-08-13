import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createLifeMemoryAction, setLifeMemoryArchivedAction, setLifeMemoryPinnedAction } from '@/app/actions/intelligence-expansion';
import { getAllLifeMemoriesByUser, getProjectsByUser } from '@/lib/data/user-scope';
import { Archive, ArrowRight, BookMarked, Folder, Heart, Image as ImageIcon, Pin, Plus, Search, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full rounded-[12px] border border-[#F1E7E3] bg-white px-3.5 py-2.5 text-[12px] text-[#2B2420] placeholder:text-[#B5ACA5] outline-none focus:border-[#C9727E]';

export default async function MemoryPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const [{ q = '', category = 'all' }, memories, projects] = await Promise.all([searchParams, getAllLifeMemoriesByUser(session.user.id), getProjectsByUser(session.user.id)]);
  const query = q.trim().toLowerCase();
  const active = memories.filter((m) => !m.archived).filter((m) => category === 'all' || m.category === category).filter((m) => !query || `${m.title} ${m.summary ?? ''} ${m.category}`.toLowerCase().includes(query));
  const recent = [...active].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0,5);
  const pinned = active.filter((m) => m.pinned).slice(0,4);
  const categories = Array.from(new Set(memories.filter((m) => !m.archived).map((m) => m.category))).sort();
  const categoryCounts = categories.map((name) => ({ name, count: memories.filter((m) => !m.archived && m.category === name).length }));
  const projectMap = new Map(projects.map((p) => [p.id, p.title]));
  const related = active.filter((m) => m.relatedProjectId || m.relatedArea).slice(0,4);

  return (
    <AppShell>
      <SectionPage eyebrow="Memory" title="Memory" description="Your archive of meaningful moments, captured and cherished.">
        <div className="space-y-4">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2"><BookMarked size={15} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Recent Memories</h2></div>
              <details className="relative"><summary className="list-none rounded-full bg-[#D86F83] px-4 py-2.5 text-[11px] font-medium text-white">+ New Memory</summary><form action={createLifeMemoryAction} className="absolute right-0 z-20 mt-2 w-[min(360px,80vw)] space-y-2 rounded-[16px] border border-[#F1E7E3] bg-white p-4 shadow-xl"><input name="title" required placeholder="Memory title" className={fieldClass}/><input name="category" placeholder="Category" className={fieldClass}/><textarea name="summary" rows={4} placeholder="What should Glow remember?" className={fieldClass}/><select name="relatedProjectId" defaultValue="" className={fieldClass}><option value="">No project</option>{projects.map((p)=><option key={p.id} value={p.id}>{p.title}</option>)}</select><input type="hidden" name="privacyLevel" value="private"/><button className="w-full rounded-full bg-[#2B2420] px-4 py-2.5 text-[11px] text-white">Save Memory</button></form></details>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{recent.map((memory,index)=><article key={memory.id} className="overflow-hidden rounded-[14px] border border-[#F1E7E3] bg-[#FFFEFD]"><div className={`h-24 ${index%3===0?'bg-[linear-gradient(145deg,#E8D8CC,#F6EEE8)]':index%3===1?'bg-[linear-gradient(145deg,#D9D4C9,#F3EEE8)]':'bg-[linear-gradient(145deg,#E6D7CF,#F9F3EF)]'}`}/><div className="p-3"><p className="glow-display text-[13px] text-[#2B2420] line-clamp-1">{memory.title}</p><p className="mt-1 text-[9.5px] uppercase tracking-[.08em] text-[#C9727E]">{memory.category}</p><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#8A8078]">{memory.summary || 'Saved memory'}</p></div></article>)}</div>
          </Card>

          <section className="grid gap-4 xl:grid-cols-[1fr_.85fr_1fr]">
            <Card><div className="flex items-center gap-2"><Pin size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Saved Highlights</h2></div><div className="mt-4 space-y-3">{pinned.length? pinned.map((memory)=><div key={memory.id} className="flex items-start justify-between gap-2 border-b border-[#F4ECE8] pb-3"><div><p className="text-[11.5px] font-medium text-[#3A332E]">{memory.title}</p><p className="mt-1 text-[10px] text-[#9A9088]">{memory.summary || memory.category}</p></div><form action={setLifeMemoryPinnedAction.bind(null,memory.id,false)}><button className="text-[#C9727E]">♥</button></form></div>):<p className="text-[11px] text-[#9A9088]">Pin memories to keep them here.</p>}</div></Card>
            <Card><div className="flex items-center gap-2"><Folder size={14} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Memory Categories</h2></div><div className="mt-4 space-y-2">{categoryCounts.length? categoryCounts.map(({name,count})=><Link key={name} href={`/memory?category=${encodeURIComponent(name)}`} className="flex items-center justify-between rounded-[10px] px-2 py-2 text-[11.5px] hover:bg-[#FDF8F6]"><span className="capitalize text-[#4A4440]">{name}</span><span className="text-[#C9727E]">{count}</span></Link>):<p className="text-[11px] text-[#9A9088]">Categories appear as you save memories.</p>}</div></Card>
            <Card><div className="flex items-center justify-between"><div className="flex items-center gap-2"><ImageIcon size={14} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Photo Memories</h2></div><span className="text-[10px] text-[#C9727E]">View all photos →</span></div><div className="mt-4 grid grid-cols-3 gap-2">{recent.slice(0,6).map((memory,index)=><div key={memory.id} title={memory.title} className={`aspect-square rounded-[10px] ${index%2?'bg-[linear-gradient(145deg,#DED1C8,#F6EEE8)]':'bg-[linear-gradient(145deg,#E9DDD4,#D5C7BD)]'}`}/>)}</div></Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
            <Card><div className="flex items-center gap-2"><Heart size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Your Favorites</h2></div><div className="mt-4 space-y-3">{pinned.slice(0,3).map((m)=><div key={m.id}><p className="text-[11.5px] font-medium">{m.title}</p><p className="text-[10px] text-[#9A9088]">{m.category}</p></div>)}</div></Card>
            <Card><div className="flex items-center gap-2"><Archive size={14} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Related Memories</h2></div><div className="mt-4 space-y-3">{related.length?related.map((m)=><div key={m.id}><p className="text-[11.5px] font-medium">{m.title}</p><p className="text-[10px] text-[#9A9088]">{m.relatedProjectId ? projectMap.get(m.relatedProjectId) : m.relatedArea}</p></div>):<p className="text-[11px] text-[#9A9088]">Connected memories will appear here.</p>}</div></Card>
            <Card><form method="get" className="space-y-3"><div className="flex items-center gap-2"><Search size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Find a Memory</h2></div><input name="q" defaultValue={q} placeholder="Search memories…" className={fieldClass}/><button className="inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">Search archive <ArrowRight size={11}/></button></form></Card>
          </section>

          <Card className="grid gap-4 bg-[linear-gradient(90deg,#FFF,#FFF8F5)] lg:grid-cols-[180px_1fr_auto] lg:items-center"><div className="flex items-center gap-2"><Sparkles size={15} className="text-[#C9727E]"/><span className="glow-display text-[18px]">Glow Insight</span></div><p className="glow-display text-[17px] italic text-[#4A4440]">The best memories aren’t just stored. They’re linked, loved, and carried forward.</p><span className="text-[10px] text-[#9A9088]">{active.length} active · {memories.filter(m=>m.archived).length} archived</span></Card>

          <details className="rounded-[16px] border border-[#F1E7E3] bg-white p-4"><summary className="cursor-pointer text-[11px] font-medium text-[#8A8078]">Manage archive</summary><div className="mt-3 space-y-2">{active.map((m)=><div key={m.id} className="flex items-center justify-between gap-3 text-[11px]"><span>{m.title}</span><form action={setLifeMemoryArchivedAction.bind(null,m.id,true)}><button className="text-[#C9727E]">Archive</button></form></div>)}</div></details>
        </div>
      </SectionPage>
    </AppShell>
  );
}
