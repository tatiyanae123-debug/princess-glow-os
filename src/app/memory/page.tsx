import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createLifeMemoryAction } from '@/app/actions/intelligence-expansion';
import { getLifeMemoriesByUser } from '@/lib/data/user-scope';

export const dynamic = 'force-dynamic';

export default async function MemoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const memories = await getLifeMemoriesByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Life Memory" title="A private memory layer for your life" description="Capture structured memories now. Automatic extraction from goals, trips, notes, and milestones can be added later.">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Card>
            <form action={createLifeMemoryAction} className="space-y-3">
              <h2 className="text-lg font-semibold">Add a memory</h2>
              <input name="title" required placeholder="Title" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <input name="category" placeholder="Category, e.g. travel" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <input name="relatedArea" placeholder="Related area" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <textarea name="summary" placeholder="What should Glow OS remember?" rows={5} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Save memory</button>
            </form>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold">Memory timeline</h2>
            {memories.length === 0 ? <p className="text-sm text-slate-500">No memories yet. Glow OS will not invent any.</p> : memories.map((memory) => (
              <div key={memory.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{memory.title}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800">{memory.category}</span>
                </div>
                {memory.summary && <p className="mt-2 text-sm text-slate-500">{memory.summary}</p>}
                <p className="mt-2 text-xs text-slate-400">{memory.source} · {memory.privacyLevel}</p>
              </div>
            ))}
          </Card>
        </div>
      </SectionPage>
    </AppShell>
  );
}
