import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import {
  createLifeMemoryAction,
  setLifeMemoryArchivedAction,
  setLifeMemoryPinnedAction,
  updateLifeMemoryAction,
} from '@/app/actions/intelligence-expansion';
import { getAllLifeMemoriesByUser, getProjectsByUser } from '@/lib/data/user-scope';
import { Archive, BookMarked, Link2, LockKeyhole, Pencil, Pin, Search, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full border border-[#ddd1c2] bg-white/70 px-4 py-3 text-[10px] text-[#51463b] outline-none focus:border-[#9a8670]';
const buttonClass = 'rounded-[6px] bg-[#453a31] px-4 py-2 text-[9px] text-white';

type MemoryPageProps = {
  searchParams: Promise<{ q?: string; category?: string; privacy?: string }>;
};

export default async function MemoryPage({ searchParams }: MemoryPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [{ q = '', category = 'all', privacy = 'all' }, memories, projects] = await Promise.all([
    searchParams,
    getAllLifeMemoriesByUser(session.user.id),
    getProjectsByUser(session.user.id),
  ]);

  const normalizedQuery = q.trim().toLowerCase();
  const categories = Array.from(new Set(memories.map((memory) => memory.category))).sort();
  const activeMemories = memories
    .filter((memory) => !memory.archived)
    .filter((memory) => category === 'all' || memory.category === category)
    .filter((memory) => privacy === 'all' || memory.privacyLevel === privacy)
    .filter((memory) => {
      if (!normalizedQuery) return true;
      return [memory.title, memory.summary, memory.category, memory.relatedArea]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    })
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.getTime() - a.createdAt.getTime());
  const archivedMemories = memories.filter((memory) => memory.archived);
  const projectNameById = new Map(projects.map((project) => [project.id, project.title]));
  const filtersActive = Boolean(normalizedQuery || category !== 'all' || privacy !== 'all');

  return (
    <AppShell>
      <SectionPage
        eyebrow="Life Memory"
        title="A searchable, correctable archive for your life"
        description="Capture what Glow OS should remember, keep sensitive context private, connect memories to projects, and correct the record whenever life changes."
      >
        <div className="space-y-4">
          <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#f2eadc,#f7f0e8)] p-5">
            <BookMarked size={55} strokeWidth={0.75} className="absolute right-5 top-3 text-[#8a7764]/16" />
            <p className="glow-eyebrow">Private archive</p>
            <p className="glow-display mt-2 text-[24px] text-[#4b4034]">Your life deserves a memory shelf you can trust.</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[8px] text-[#7d7064]">
              <span className="flex items-center gap-1"><LockKeyhole size={10} />{memories.filter((memory) => !memory.archived).length} active</span>
              <span className="flex items-center gap-1"><Pin size={10} />{memories.filter((memory) => memory.pinned && !memory.archived).length} pinned</span>
              <span className="flex items-center gap-1"><Archive size={10} />{archivedMemories.length} archived</span>
            </div>
          </Card>

          <Card className="paper-card">
            <form method="get" className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
              <label className="relative">
                <Search size={13} className="absolute left-3 top-3.5 text-[#8c7a68]" />
                <input name="q" defaultValue={q} placeholder="Search memories, areas, notes…" className={`${fieldClass} pl-9`} />
              </label>
              <select name="category" defaultValue={category} className={fieldClass}>
                <option value="all">All categories</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <select name="privacy" defaultValue={privacy} className={fieldClass}>
                <option value="all">All privacy</option>
                <option value="private">Private</option>
                <option value="sensitive">Sensitive</option>
              </select>
              <button type="submit" className={buttonClass}>Search archive</button>
            </form>
          </Card>

          <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
            <Card className="paper-card self-start">
              <form action={createLifeMemoryAction} className="space-y-3">
                <div>
                  <p className="glow-eyebrow">Private by default</p>
                  <h2 className="glow-display mt-1 text-[20px] text-[#4b4034]">Add a memory</h2>
                </div>
                <input name="title" required placeholder="Title" className={fieldClass} />
                <input name="category" placeholder="Category, e.g. travel, career, beauty" className={fieldClass} />
                <textarea name="summary" placeholder="What should Glow OS remember?" rows={5} className={fieldClass} />
                <input name="relatedArea" placeholder="Related area, person, or theme" className={fieldClass} />
                <select name="relatedProjectId" defaultValue="" className={fieldClass}>
                  <option value="">No connected project</option>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
                </select>
                <select name="privacyLevel" defaultValue="private" className={fieldClass}>
                  <option value="private">Private</option>
                  <option value="sensitive">Sensitive</option>
                </select>
                <label className="flex items-center gap-2 text-[8px] text-[#6f6155]">
                  <input type="checkbox" name="pinned" /> Pin this memory to the top
                </label>
                <button type="submit" className={buttonClass}>Save memory</button>
              </form>
            </Card>

            <div className="space-y-4">
              <Card className="overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-[#e9dfd1] px-5 py-4">
                  <div>
                    <p className="glow-eyebrow">Memory shelf</p>
                    <h2 className="glow-display mt-1 text-[19px] text-[#4b4034]">Searchable life archive</h2>
                  </div>
                  <span className="text-[7px] text-[#958679]">{activeMemories.length} shown</span>
                </div>

                {activeMemories.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-[10px] font-medium text-[#625448]">{filtersActive ? 'No memories match these filters.' : 'No active memories yet.'}</p>
                    <p className="mt-2 text-[8px] text-[#86796d]">{filtersActive ? 'Clear the search or adjust the category/privacy filter.' : 'Add the first memory so Glow OS can remember real context without inventing it.'}</p>
                    {filtersActive ? <a href="/memory" className="mt-3 inline-block text-[8px] underline underline-offset-4">Clear filters</a> : null}
                  </div>
                ) : (
                  <div className="divide-y divide-[#eee5da]">
                    {activeMemories.map((memory) => (
                      <article key={memory.id} className="p-5">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {memory.pinned ? <span className="inline-flex items-center gap-1 rounded-full bg-[#eadfce] px-2 py-1 text-[7px] text-[#665749]"><Pin size={8} />Pinned</span> : null}
                              <span className="rounded-full bg-[#efe7da] px-2 py-1 text-[7px] text-[#7c6c5e]">{memory.category}</span>
                              <span className="inline-flex items-center gap-1 text-[7px] text-[#8d7d6f]"><ShieldCheck size={8} />{memory.privacyLevel}</span>
                            </div>
                            <p className="glow-display mt-2 text-[16px] text-[#4d4236]">{memory.title}</p>
                            {memory.summary ? <p className="mt-2 text-[8px] leading-4 text-[#786b60]">{memory.summary}</p> : null}
                            <div className="mt-3 flex flex-wrap gap-3 text-[7px] text-[#96887c]">
                              <span>{memory.source}</span>
                              {memory.relatedArea ? <span className="inline-flex items-center gap-1"><Link2 size={8} />{memory.relatedArea}</span> : null}
                              {memory.relatedProjectId ? <span>Project: {projectNameById.get(memory.relatedProjectId) ?? 'Connected project'}</span> : null}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <form action={setLifeMemoryPinnedAction.bind(null, memory.id, !memory.pinned)}>
                              <button type="submit" className="rounded border border-[#dfd3c5] px-2 py-1 text-[7px] text-[#6f6155]">{memory.pinned ? 'Unpin' : 'Pin'}</button>
                            </form>
                            <form action={setLifeMemoryArchivedAction.bind(null, memory.id, true)}>
                              <button type="submit" className="rounded border border-[#dfd3c5] px-2 py-1 text-[7px] text-[#6f6155]">Archive</button>
                            </form>
                          </div>
                        </div>

                        <details className="mt-4 rounded border border-[#e8ded2] bg-[#fbf7f1]/70 p-3">
                          <summary className="flex cursor-pointer list-none items-center gap-2 text-[8px] font-medium text-[#645649]"><Pencil size={10} />Correct or reconnect this memory</summary>
                          <form action={updateLifeMemoryAction.bind(null, memory.id)} className="mt-3 grid gap-3 sm:grid-cols-2">
                            <input name="title" required defaultValue={memory.title} className={fieldClass} />
                            <input name="category" defaultValue={memory.category} className={fieldClass} />
                            <textarea name="summary" defaultValue={memory.summary ?? ''} rows={4} className={`${fieldClass} sm:col-span-2`} />
                            <input name="relatedArea" defaultValue={memory.relatedArea ?? ''} placeholder="Related area, person, or theme" className={fieldClass} />
                            <select name="relatedProjectId" defaultValue={memory.relatedProjectId ?? ''} className={fieldClass}>
                              <option value="">No connected project</option>
                              {projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
                            </select>
                            <select name="privacyLevel" defaultValue={memory.privacyLevel} className={fieldClass}>
                              <option value="private">Private</option>
                              <option value="sensitive">Sensitive</option>
                            </select>
                            <div className="sm:col-span-2"><button type="submit" className={buttonClass}>Save correction</button></div>
                          </form>
                        </details>
                      </article>
                    ))}
                  </div>
                )}
              </Card>

              {archivedMemories.length > 0 ? (
                <Card className="overflow-hidden p-0">
                  <div className="border-b border-[#e9dfd1] px-5 py-3"><p className="glow-eyebrow">Archived memories</p></div>
                  <div className="divide-y divide-[#eee5da]">
                    {archivedMemories.map((memory) => (
                      <div key={memory.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div>
                          <p className="text-[9px] font-medium text-[#5d5044]">{memory.title}</p>
                          <p className="text-[7px] text-[#97897d]">{memory.category} · {memory.privacyLevel}</p>
                        </div>
                        <form action={setLifeMemoryArchivedAction.bind(null, memory.id, false)}>
                          <button type="submit" className="text-[7px] text-[#7c6e61] underline underline-offset-4">Restore</button>
                        </form>
                      </div>
                    ))}
                  </div>
                </Card>
              ) : null}
            </div>
          </div>
        </div>
      </SectionPage>
    </AppShell>
  );
}
