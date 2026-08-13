import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { AppShell } from '@/components/app-shell';
import { db } from '@/db';
import { resourceLibraryItems } from '@/db/schema/interconnected-os';
import { createResourceAction } from '@/app/actions/resources';
import { BookOpen, Clock3, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full rounded-lg border border-[#F1E7E3] px-3.5 py-2.5 text-[12px] text-[#2B2420] placeholder:text-[#B5ACA5] focus:border-[#C9727E] focus:outline-none';

export default async function ManageResourcesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  let items;
  try {
    items = await db.select().from(resourceLibraryItems).where(eq(resourceLibraryItems.userId, session.user.id)).orderBy(desc(resourceLibraryItems.updatedAt));
  } catch {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl rounded-[20px] border border-[#F1E7E3] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#2B2420]">Persistent Resources need intelligence activation.</p>
          <a href="/settings/intelligence" className="mt-3 inline-block text-[12px] font-medium text-[#C9727E]">Activate intelligence →</a>
        </div>
      </AppShell>
    );
  }
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <div className="flex items-center gap-2 text-[#C9727E]"><BookOpen size={17} /><p className="text-[11px] font-semibold uppercase tracking-[.16em]">Reference Library</p></div>
          <h1 className="glow-display mt-2 text-[38px] leading-none text-[#2B2420] sm:text-[40px]">Build reusable life playbooks.</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#8A8078]">Store resets, routine-order guides, travel checklists, workout alternatives and emergency versions once so every Glow system can reuse them.</p>
        </header>
        <div className="grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
          <form action={createResourceAction} className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center gap-2"><Plus size={14} className="text-[#C9727E]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">New playbook</p></div>
            <div className="mt-4 space-y-3">
              <input name="title" required placeholder="15-Minute Reset" className={fieldClass} />
              <input name="category" required placeholder="Reset, Beauty, Travel..." className={fieldClass} />
              <input name="durationMinutes" type="number" min={1} placeholder="Minutes" className={fieldClass} />
              <input name="tags" placeholder="reset, low-energy, evening" className={fieldClass} />
              <textarea name="content" rows={8} placeholder="Steps, instructions, products, rules or references..." className={fieldClass} />
              <button className="w-full rounded-full bg-[#C9727E] py-2.5 text-[12px] font-medium text-white hover:bg-[#B15A68]">Save to Library</button>
            </div>
          </form>
          <section className="space-y-3">
            {items.length ? items.map((item) => (
              <article key={item.id} className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#C9727E]">{item.category}</p>
                    <h2 className="glow-display mt-1 text-[19px] text-[#2B2420]">{item.title}</h2>
                    {item.content ? <p className="mt-2 whitespace-pre-wrap text-[11.5px] leading-5 text-[#4A4440]">{item.content}</p> : null}
                  </div>
                  {item.durationMinutes ? <span className="flex items-center gap-1 rounded-full bg-[#FDF8F6] px-2.5 py-1 text-[10.5px] text-[#8A8078]"><Clock3 size={10} />{item.durationMinutes}m</span> : null}
                </div>
                {item.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1">{item.tags.map((tag) => <span key={tag} className="rounded-full bg-[#FDF3F2] px-2.5 py-1 text-[10px] text-[#B15A68]">{tag}</span>)}</div>
                ) : null}
              </article>
            )) : (
              <div className="rounded-[18px] border border-dashed border-[#F1E7E3] p-8 text-center text-[12px] text-[#8A8078]">No custom playbooks yet. The built-in library still remains available on the Resources page.</div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
