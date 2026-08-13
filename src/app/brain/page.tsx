import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { BrainMindMap } from '@/components/brain/brain-mind-map';
import { BrainQuickCapture } from '@/components/brain/brain-quick-capture';
import { buildPersonalContext } from '@/lib/intelligence/context';
import { buildBrainConnections, buildBrainMapDomains } from '@/lib/intelligence/brain-connections';
import { getNotesByUser } from '@/lib/data/notes';
import { ArrowRight, Bookmark, Layers, Link2, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

function noteText(note: { title: string; content: string | null }) {
  return `${note.title} ${note.content ?? ''}`.trim();
}

function extractTags(note: { title: string; content: string | null }) {
  const matches = noteText(note).match(/(^|\s)#([a-z0-9][\w-]*)/gi) ?? [];
  return Array.from(new Set(matches.map((match) => match.trim().slice(1).toLowerCase())));
}

function recencyLabel(date: Date | null) {
  if (!date) return 'undated';
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function clarityLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs focus';
}

export default async function BrainPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const askedQuery = (await searchParams)?.q ?? '';

  let context: Awaited<ReturnType<typeof buildPersonalContext>> | null = null;
  try {
    context = await buildPersonalContext(userId);
  } catch (error) {
    console.error('[Glow OS] Brain context unavailable', error);
  }

  if (!context) {
    return (
      <AppShell>
        <section className="mx-auto max-w-4xl rounded-[20px] border border-[#F1E7E3] bg-white p-6">
          <p className="glow-eyebrow">Glow Brain</p>
          <h1 className="glow-display mt-2 text-[30px] text-[#2B2420]">Your connected intelligence.</h1>
          <p className="mt-3 text-[12.5px] leading-5 text-[#8A8078]">Glow Brain is available, but one connected data source could not be read right now. Your other rooms still work.</p>
          <div className="mt-5 flex gap-2">
            <Link href="/dashboard" className="rounded-full bg-[#C9727E] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-[#B15A68]">Command Center</Link>
            <Link href="/connections" className="rounded-full border border-[#F1E7E3] px-4 py-2.5 text-[12px] text-[#8A8078] hover:bg-[#FDF8F6]">Connections</Link>
          </div>
        </section>
      </AppShell>
    );
  }

  const [connections, domains, notes] = await Promise.all([
    buildBrainConnections(userId),
    buildBrainMapDomains(userId),
    getNotesByUser(userId),
  ]);

  const weekAgo = Date.now() - 7 * 86400000;
  const newThisWeek = notes.filter((n) => n.createdAt.getTime() >= weekAgo).length;

  const tagCounts = new Map<string, number>();
  notes.forEach((note) => extractTags(note).forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)));
  const topCategories = Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCategoryCount = topCategories[0]?.[1] ?? 1;

  const recentNotes = [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 3);

  const recentConnections = connections.types
    .flatMap((type) => type.instances.map((instance) => ({ ...instance, domainB: type.domainB })))
    .sort((a, b) => (b.occurredAt?.getTime() ?? 0) - (a.occurredAt?.getTime() ?? 0))
    .slice(0, 3);

  const focusedDomains = [...domains].filter((d) => d.count > 0).sort((a, b) => b.count - a.count).slice(0, 3);
  const brainInsight = focusedDomains.length
    ? `You're most focused on ${focusedDomains.map((d) => d.label).join(', ')} right now.`
    : 'Start capturing across your rooms and Glow will show you where your focus really is.';

  const clarityScore = context.focusScore;

  return (
    <AppShell>
      <div className="space-y-4">
        {askedQuery ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[16px] border border-[#F1E7E3] bg-[#FDF3F2] px-4 py-3 text-[12px] text-[#4A4440]">
            <span>You asked: &ldquo;{askedQuery}&rdquo;</span>
            <Link href={`/search?q=${encodeURIComponent(askedQuery)}`} className="font-medium text-[#C9727E]">See matching results →</Link>
          </div>
        ) : null}

        <div className="grid gap-4 overflow-hidden rounded-[20px] border border-[#F1E7E3] bg-white p-6 sm:p-8 lg:grid-cols-[1.1fr_.9fr]">
          <div className="flex flex-col justify-center">
            <h1 className="glow-display text-[54px] leading-[1] text-[#2B2420] sm:text-[64px]">Brain</h1>
            <p className="mt-2 text-[15px] text-[#4A4440]">Your connected intelligence.</p>
            <p className="glow-display mt-4 text-[15px] italic text-[#8A8078]">&ldquo;Clarity connects everything.&rdquo;</p>
          </div>
          <EditableRoomImage slot="brain:hero" label="Brain hero" className="min-h-[160px] overflow-hidden rounded-[16px] sm:min-h-[210px]" />
        </div>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBE4E8] text-[#B15A68]"><Sparkles size={14} /></span><p className="text-[11.5px] text-[#8A8078]">Total Ideas</p></div>
            <p className="glow-display mt-2 text-[26px] text-[#2B2420]">{notes.length}</p>
            <p className="mt-1 text-[10.5px] text-[#B5ACA5]">+{newThisWeek} this week</p>
          </div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1E8D9] text-[#9A7A3D]"><Link2 size={14} /></span><p className="text-[11.5px] text-[#8A8078]">Connections</p></div>
            <p className="glow-display mt-2 text-[26px] text-[#2B2420]">{connections.totalInstances}</p>
            <p className="mt-1 text-[10.5px] text-[#B5ACA5]">Active</p>
          </div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E9E4F2] text-[#7C6B9C]"><Layers size={14} /></span><p className="text-[11.5px] text-[#8A8078]">Categories</p></div>
            <p className="glow-display mt-2 text-[26px] text-[#2B2420]">{tagCounts.size}</p>
            <p className="mt-1 text-[10.5px] text-[#B5ACA5]">Note tags</p>
          </div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E4EBDD] text-[#5A6E52]"><Sparkles size={14} /></span><p className="text-[11.5px] text-[#8A8078]">Clarity Score</p></div>
            <p className="glow-display mt-2 text-[26px] text-[#2B2420]">{clarityScore}%</p>
            <p className="mt-1 text-[10.5px] text-[#B5ACA5]">{clarityLabel(clarityScore)}</p>
          </div>
        </section>

        <BrainMindMap domains={domains} />

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center gap-1.5"><Sparkles size={14} className="text-[#C9727E]" /><p className="text-[12.5px] font-medium text-[#2B2420]">Brain Insight</p></div>
            <p className="mt-3 max-w-sm text-[13px] leading-5 text-[#4A4440]">{brainInsight}</p>
            <Link href="/brain/insights" className="mt-4 inline-flex items-center gap-1 text-[11.5px] font-medium text-[#C9727E]">See full intelligence report <ArrowRight size={11} /></Link>
          </div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center justify-between"><p className="text-[12.5px] font-medium text-[#2B2420]">Recent Connections</p><Link href="/brain/connections" className="text-[11px] font-medium text-[#C9727E]">View all</Link></div>
            <div className="mt-3 space-y-2.5">
              {recentConnections.length === 0 ? (
                <p className="text-[12px] text-[#8A8078]">No connections yet — Glow will surface them as you use more of your rooms.</p>
              ) : recentConnections.map((instance) => (
                <Link key={instance.id} href={instance.href} className="flex items-center justify-between gap-2 rounded-[12px] px-1 py-1.5 hover:bg-[#FDF8F6]">
                  <span className="flex min-w-0 items-center gap-2 text-[12px] text-[#2B2420]"><ArrowRight size={12} className="shrink-0 text-[#C9727E]" /><span className="truncate">{instance.title}</span></span>
                  <span className="shrink-0 text-[10.5px] text-[#B5ACA5]">{recencyLabel(instance.occurredAt)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <BrainQuickCapture />
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center justify-between"><p className="text-[12.5px] font-medium text-[#2B2420]">Top Categories</p><Link href="/notes" className="text-[#B5ACA5]">⋯</Link></div>
            <div className="mt-3 space-y-2.5">
              {topCategories.length === 0 ? (
                <p className="text-[12px] text-[#8A8078]">Tag a note with #category to see it here.</p>
              ) : topCategories.map(([tag, count]) => (
                <div key={tag}>
                  <div className="flex items-center justify-between text-[11.5px]"><span className="capitalize text-[#4A4440]">{tag}</span><span className="text-[#B5ACA5]">{count}</span></div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#F4ECE8]"><div className="h-full rounded-full bg-[#C9727E]" style={{ width: `${(count / maxCategoryCount) * 100}%` }} /></div>
                </div>
              ))}
            </div>
            <Link href="/notes" className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">View All Categories <ArrowRight size={10} /></Link>
          </div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center justify-between"><p className="text-[12.5px] font-medium text-[#2B2420]">Recent Notes</p><Link href="/notes" className="text-[#B5ACA5]">⋯</Link></div>
            <div className="mt-3 space-y-3">
              {recentNotes.length === 0 ? (
                <p className="text-[12px] text-[#8A8078]">Capture your first thought to see it here.</p>
              ) : recentNotes.map((note) => (
                <Link key={note.id} href="/notes" className="flex items-start gap-2">
                  <Bookmark size={13} className="mt-0.5 shrink-0 text-[#C9727E]" />
                  <span><span className="block text-[12px] text-[#2B2420]">{note.title}</span><span className="text-[10.5px] text-[#B5ACA5]">{recencyLabel(note.updatedAt)}</span></span>
                </Link>
              ))}
            </div>
            <Link href="/notes" className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">View All Notes <ArrowRight size={10} /></Link>
          </div>
        </section>

        <div className="grid gap-4 overflow-hidden rounded-[20px] border border-[#F1E7E3] bg-[#FDF3F2] p-6 sm:grid-cols-[1fr_220px] sm:items-center">
          <div>
            <div className="flex items-center gap-1.5 text-[#B15A68]"><Sparkles size={13} /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em]">Glow Reminder</p></div>
            <p className="glow-display mt-2 text-[19px] italic text-[#2B2420]">Your brain is for having ideas, not holding them.</p>
          </div>
          <EditableRoomImage slot="brain:reminder" label="Brain reminder" className="min-h-[90px] overflow-hidden rounded-[14px]" />
        </div>
      </div>
    </AppShell>
  );
}
