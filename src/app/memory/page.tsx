import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createLifeMemoryAction, setLifeMemoryArchivedAction } from '@/app/actions/intelligence-expansion';
import { getLifeMemoriesByUser } from '@/lib/data/user-scope';

export const dynamic = 'force-dynamic';

export default async function MemoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const memories = await getLifeMemoriesByUser(session.user.id);
  const activeMemories = memories.filter((memory) => !memory.archived);
  const archivedMemories = memories.filter((memory) => memory.archived);

  return (
    <AppShell>
      <SectionPage eyebrow="Life Memory" title="A private memory layer for your life" description="Capture facts, milestones, decisions, preferences, and context that Glow OS should remember without inventing details.">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <form action={createLifeMemoryAction} className="space-y-3">
              <div><p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Private by default</p><h2 className="mt-2 text-lg font-semibold">Add a memory</h2></div>
              <input name="title" required placeholder="Title" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <input name="category" placeholder="Category, e.g. travel, career, beauty" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <input name="relatedArea" placeholder="Related area or project" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <textarea name="summary" placeholder="What should Glow OS remember?" rows={5} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Save memory</button>
            </form>
          </Card>

          <div className="space-y-5">
            <Card className="space-y-3">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">Memory timeline</h2><span className="text-xs text-slate-500">{activeMemories.length} active</span></div>
              {activeMemories.length === 0 ? <p className="text-sm text-slate-500">No active memories yet. Glow OS will not invent any.</p> : activeMemories.map((memory) => (
                <div key={memory.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-medium">{memory.title}</p><p className="mt-1 text-xs text-slate-400">{memory.source} · {memory.privacyLevel}</p></div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800">{memory.category}</span>
                  </div>
                  {memory.summary && <p className="mt-2 text-sm text-slate-500">{memory.summary}</p>}
                  <form action={setLifeMemoryArchivedAction.bind(null, memory.id, true)} className="mt-3"><button type="submit" className="text-xs font-medium text-slate-500 underline underline-offset-4">Archive</button></form>
                </div>
              ))}
            </Card>

            {archivedMemories.length > 0 && <Card className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Archived memories</h2>
              {archivedMemories.map((memory) => (
                <div key={memory.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                  <div><p className="text-sm font-medium">{memory.title}</p><p className="text-xs text-slate-400">{memory.category}</p></div>
                  <form action={setLifeMemoryArchivedAction.bind(null, memory.id, false)}><button type="submit" className="text-xs font-medium underline underline-offset-4">Restore</button></form>
                </div>
              ))}
            </Card>}
          </div>
        </div>
      </SectionPage>
    </AppShell>
  );
}
