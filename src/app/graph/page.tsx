import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { AppShell } from '@/components/app-shell';
import { db } from '@/db';
import { entityRelations } from '@/db/schema/adaptive-os';
import { glowEntities } from '@/db/schema/interconnected-os';
import { Network, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GraphPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  let entities;
  let relations;
  try {
    [entities, relations] = await Promise.all([
      db.select().from(glowEntities).where(eq(glowEntities.userId, session.user.id)).orderBy(desc(glowEntities.updatedAt)).limit(60),
      db.select().from(entityRelations).where(eq(entityRelations.userId, session.user.id)).orderBy(desc(entityRelations.createdAt)).limit(80),
    ]);
  } catch {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl rounded-[20px] border border-[#F1E7E3] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#2B2420]">The Glow Relationship Graph needs intelligence activation.</p>
          <Link href="/settings/intelligence" className="mt-3 inline-block text-[12px] font-medium text-[#C9727E]">Activate intelligence →</Link>
        </div>
      </AppShell>
    );
  }
  const labels = new Map(entities.map((e) => [`${e.entityType}:${e.sourceId ?? e.id}`, e.title]));
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <div className="flex items-center gap-2 text-[#7C6B9C]"><Network size={18} /><p className="text-[11px] font-semibold uppercase tracking-[.16em]">Universal Intelligence Graph</p></div>
          <h1 className="glow-display mt-2 text-[40px] leading-none text-[#2B2420] sm:text-[42px]">Everything can understand everything else.</h1>
          <p className="mt-2 max-w-3xl text-[13px] leading-5 text-[#8A8078]">Glow stores relationships between captured information and the systems it creates. That lets a single appointment, purchase, project or memory become useful in more than one room without duplicate entry.</p>
        </header>
        <section className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center justify-between"><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Entities</p><span className="text-[10.5px] text-[#B5ACA5]">{entities.length}</span></div>
            <div className="mt-3 flex flex-wrap gap-2">
              {entities.length ? entities.map((entity) => (
                <span key={entity.id} className="rounded-full border border-[#F1E7E3] bg-[#FDF8F6] px-3 py-1.5 text-[11px] text-[#4A4440]">{entity.title}<span className="ml-1 text-[#B5ACA5]">· {entity.entityType}</span></span>
              )) : <p className="text-[12px] text-[#8A8078]">Use Universal Intake and route items to begin building the graph.</p>}
            </div>
          </div>
          <div className="rounded-[20px] border border-[#F1E7E3] bg-white">
            <div className="flex items-center justify-between border-b border-[#F1E7E3] px-4 py-3"><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Relationships</p><span className="text-[10.5px] text-[#B5ACA5]">{relations.length}</span></div>
            <div className="divide-y divide-[#F1E7E3]">
              {relations.length ? relations.map((rel) => (
                <div key={rel.id} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div><p className="text-[11.5px] font-medium text-[#2B2420]">{labels.get(`${rel.fromType}:${rel.fromId}`) ?? rel.fromType}</p><p className="text-[10px] text-[#B5ACA5]">{rel.fromType}</p></div>
                  <span className="rounded-full bg-[#E9E4F2] px-2.5 py-1 text-center text-[10px] font-semibold uppercase text-[#7C6B9C]">{rel.relation}</span>
                  <div className="sm:text-right"><p className="text-[11.5px] font-medium text-[#2B2420]">{labels.get(`${rel.toType}:${rel.toId}`) ?? rel.toType}</p><p className="text-[10px] text-[#B5ACA5]">{rel.toType}</p></div>
                </div>
              )) : (
                <div className="p-8 text-center"><Sparkles size={18} className="mx-auto text-[#7C6B9C]" /><p className="mt-2 text-[12px] text-[#8A8078]">Relationships appear when Glow routes intake or connects systems.</p></div>
              )}
            </div>
          </div>
        </section>
        <div className="flex gap-2">
          <Link href="/intake" className="rounded-full bg-[#2B2420] px-3.5 py-2 text-[11px] font-medium text-white">Add Anything</Link>
          <Link href="/inbox" className="rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#8A8078] hover:bg-[#FDF8F6]">Route Inbox</Link>
        </div>
      </div>
    </AppShell>
  );
}
