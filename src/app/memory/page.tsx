import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createLifeMemoryAction, setLifeMemoryArchivedAction } from '@/app/actions/intelligence-expansion';
import { getLifeMemoriesByUser } from '@/lib/data/user-scope';
import { Archive, BookMarked, LockKeyhole } from 'lucide-react';

export const dynamic='force-dynamic';
const fieldClass='w-full border px-4 py-3 text-[10px]';

export default async function MemoryPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const memories=await getLifeMemoriesByUser(session.user.id);
  const activeMemories=memories.filter((memory)=>!memory.archived);
  const archivedMemories=memories.filter((memory)=>memory.archived);

  return <AppShell><SectionPage eyebrow="Life Memory" title="A private memory layer for your life" description="Capture facts, milestones, decisions, preferences, and context that Glow OS should remember without inventing details.">
    <div className="space-y-4">
      <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#f2eadc,#f7f0e8)] p-5"><BookMarked size={55} strokeWidth={.75} className="absolute right-5 top-3 text-[#8a7764]/16"/><p className="glow-eyebrow">Private archive</p><p className="glow-display mt-2 text-[24px] text-[#4b4034]">Your life deserves a memory shelf.</p><div className="mt-3 flex items-center gap-2 text-[8px] text-[#7d7064]"><LockKeyhole size={10}/>{activeMemories.length} active memories · {archivedMemories.length} archived</div></Card>
      <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
        <Card className="paper-card"><form action={createLifeMemoryAction} className="space-y-3"><div><p className="glow-eyebrow">Private by default</p><h2 className="glow-display mt-1 text-[20px] text-[#4b4034]">Add a memory</h2></div><input name="title" required placeholder="Title" className={fieldClass}/><input name="category" placeholder="Category, e.g. travel, career, beauty" className={fieldClass}/><input name="relatedArea" placeholder="Related area or project" className={fieldClass}/><textarea name="summary" placeholder="What should Glow OS remember?" rows={5} className={fieldClass}/><button type="submit" className="rounded-[6px] bg-[#453a31] px-4 py-2 text-[9px] text-white">Save memory</button></form></Card>
        <div className="space-y-4"><Card className="p-0 overflow-hidden"><div className="flex items-center justify-between border-b border-[#e9dfd1] px-5 py-4"><div><p className="glow-eyebrow">Memory shelf</p><h2 className="glow-display mt-1 text-[19px] text-[#4b4034]">Active archive</h2></div><span className="text-[7px] text-[#958679]">{activeMemories.length} active</span></div>{activeMemories.length===0?<p className="p-8 text-center text-[9px] text-[#86796d]">No active memories yet. Glow OS will not invent any.</p>:<div className="grid gap-0 sm:grid-cols-2">{activeMemories.map((memory,index)=><div key={memory.id} className={`border-b border-r border-[#eee5da] p-4 ${index%2===0?'bg-[#fbf6ef]/55':''}`}><div className="flex items-start justify-between gap-2"><div><p className="glow-display text-[14px] text-[#4d4236]">{memory.title}</p><p className="mt-1 text-[7px] text-[#96887c]">{memory.source} · {memory.privacyLevel}</p></div><span className="rounded-full bg-[#efe7da] px-2 py-1 text-[7px] text-[#7c6c5e]">{memory.category}</span></div>{memory.summary?<p className="mt-3 line-clamp-3 text-[8px] leading-4 text-[#786b60]">{memory.summary}</p>:null}<form action={setLifeMemoryArchivedAction.bind(null,memory.id,true)} className="mt-3"><button type="submit" className="inline-flex items-center gap-1 text-[7px] text-[#7d6e61] underline underline-offset-4"><Archive size={8}/>Archive</button></form></div>)}</div>}</Card>
        {archivedMemories.length>0?<Card className="p-0 overflow-hidden"><div className="border-b border-[#e9dfd1] px-5 py-3"><p className="glow-eyebrow">Archived memories</p></div><div className="divide-y divide-[#eee5da]">{archivedMemories.map((memory)=><div key={memory.id} className="flex items-center justify-between gap-3 px-5 py-3"><div><p className="text-[9px] font-medium text-[#5d5044]">{memory.title}</p><p className="text-[7px] text-[#97897d]">{memory.category}</p></div><form action={setLifeMemoryArchivedAction.bind(null,memory.id,false)}><button type="submit" className="text-[7px] text-[#7c6e61] underline underline-offset-4">Restore</button></form></div>)}</div></Card>:null}</div>
      </div>
    </div>
  </SectionPage></AppShell>;
}
