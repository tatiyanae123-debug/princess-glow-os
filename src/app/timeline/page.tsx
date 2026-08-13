import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createTimelineEventAction } from '@/app/actions/completion-v1';
import { getFitnessSessions, getHairLogs, getTimelineEvents } from '@/lib/data/completion-v1';
import { Camera, Clock3, Dumbbell, Scissors, Sparkles } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full rounded-lg border border-[#F1E7E3] px-3.5 py-2.5 text-[12px] text-[#2B2420] placeholder:text-[#B5ACA5] focus:border-[#C9727E] focus:outline-none';

type StoryEvent = {
  id: string;
  title: string;
  category: string;
  occurredAt: Date;
  summary: string | null;
  imageUrl?: string | null;
  source: 'manual' | 'fitness' | 'hair';
};

function joinDetails(parts: Array<string | null | undefined>) { return parts.filter(Boolean).join(' · '); }

export default async function TimelinePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const [events, fitnessSessions, hairLogs] = await Promise.all([
    getTimelineEvents(session.user.id),
    getFitnessSessions(session.user.id),
    getHairLogs(session.user.id),
  ]);

  const story: StoryEvent[] = [
    ...events.map((event) => ({
      id: `timeline-${event.id}`,
      title: event.title,
      category: event.category,
      occurredAt: event.occurredAt,
      summary: event.summary,
      imageUrl: event.imageUrl,
      source: 'manual' as const,
    })),
    ...fitnessSessions.map((sessionItem) => ({
      id: `fitness-${sessionItem.id}`,
      title: `${sessionItem.workoutType} workout`,
      category: 'fitness progress',
      occurredAt: sessionItem.occurredAt,
      summary: joinDetails([
        sessionItem.durationMinutes ? `${sessionItem.durationMinutes} min` : null,
        sessionItem.energy ? `energy ${sessionItem.energy}/5` : null,
        sessionItem.soreness ? `soreness ${sessionItem.soreness}/5` : null,
        sessionItem.notes,
      ]) || 'Automatically captured from Fitness.',
      source: 'fitness' as const,
    })),
    ...hairLogs.map((log) => ({
      id: `hair-${log.id}`,
      title: log.style ? `${log.eventType}: ${log.style}` : log.eventType,
      category: 'hair journey',
      occurredAt: log.occurredAt,
      summary: joinDetails([
        log.products ? `Products: ${log.products}` : null,
        log.heatUsed ? 'Heat used' : null,
        log.notes,
        log.nextAction ? `Next: ${log.nextAction}` : null,
      ]) || 'Automatically captured from Hair.',
      source: 'hair' as const,
    })),
  ].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

  const groups = new Map<string, StoryEvent[]>();
  for (const event of story) { const key = event.occurredAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); groups.set(key, [...(groups.get(key) ?? []), event]); }
  const automaticCount = fitnessSessions.length + hairLogs.length;
  const latest = story[0];

  return (
    <AppShell>
      <SectionPage eyebrow="Life Timeline" title="See your life as a connected story" description="Capture milestones and memories while Glow OS automatically threads meaningful fitness and hair activity into one chronological life story.">
        <div className="space-y-4">
          <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#F1E8D9,#FBE4E8)]">
            <Camera size={54} strokeWidth={0.75} className="absolute right-5 top-4 text-[#9A7A3D]/22" />
            <p className="glow-eyebrow">Life gallery</p>
            <p className="glow-display mt-2 text-[24px] text-[#2B2420]">Moments become a story when you can see the thread.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#8A8078]">
              <span className="rounded-full border border-[#F1E7E3] bg-white/70 px-3 py-1.5">{story.length} total moments</span>
              <span className="rounded-full border border-[#F1E7E3] bg-white/70 px-3 py-1.5">{automaticCount} automatic captures</span>
              <span className="rounded-full border border-[#F1E7E3] bg-white/70 px-3 py-1.5">{events.length} saved memories</span>
            </div>
            {latest ? <p className="mt-3 text-[11px] text-[#8A8078]">Latest thread: <span className="font-medium text-[#2B2420]">{latest.title}</span> · {latest.occurredAt.toLocaleDateString()}</p> : null}
          </Card>
          <div className="grid gap-4 lg:grid-cols-[.68fr_1.32fr]">
            <div className="space-y-4">
              <Card>
                <form action={createTimelineEventAction} className="space-y-3">
                  <div className="flex items-center gap-2"><Sparkles size={13} className="text-[#C9727E]" /><h2 className="glow-display text-[20px] text-[#2B2420]">Add timeline event</h2></div>
                  <input name="title" required placeholder="What happened?" className={fieldClass} />
                  <input name="category" required placeholder="Category: career, travel, project…" className={fieldClass} />
                  <input name="occurredAt" required type="datetime-local" className={fieldClass} />
                  <textarea name="summary" rows={4} placeholder="What should you remember?" className={fieldClass} />
                  <button className="rounded-full bg-[#C9727E] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-[#B15A68]">Add to timeline</button>
                </form>
              </Card>
              <Card>
                <p className="glow-eyebrow">Automatic captures</p>
                <h2 className="glow-display mt-1 text-[18px] text-[#2B2420]">Your story keeps building itself</h2>
                <p className="mt-2 text-[11.5px] leading-4 text-[#8A8078]">Fitness sessions and hair logs are folded into this view automatically. They remain owned by their original workspace, so Timeline never duplicates or mutates those records.</p>
                <div className="mt-4 grid gap-2">
                  <div className="flex items-center justify-between rounded-[12px] border border-[#F1E7E3] bg-[#FDF8F6] px-3 py-2.5"><span className="inline-flex items-center gap-2 text-[11px] text-[#4A4440]"><Dumbbell size={12} />Fitness</span><span className="text-[11px] text-[#8A8078]">{fitnessSessions.length} captured</span></div>
                  <div className="flex items-center justify-between rounded-[12px] border border-[#F1E7E3] bg-[#FDF8F6] px-3 py-2.5"><span className="inline-flex items-center gap-2 text-[11px] text-[#4A4440]"><Scissors size={12} />Hair</span><span className="text-[11px] text-[#8A8078]">{hairLogs.length} captured</span></div>
                </div>
              </Card>
            </div>
            <Card className="overflow-hidden p-0">
              <div className="border-b border-[#F1E7E3] px-5 py-4"><p className="glow-eyebrow">Gallery wall</p><h2 className="glow-display mt-1 text-[19px] text-[#2B2420]">Your chronological life story</h2></div>
              {story.length === 0 ? (
                <div className="p-8 text-center"><p className="text-[13px] text-[#8A8078]">Your timeline is empty.</p><p className="mt-2 text-[11px] text-[#B5ACA5]">Add a meaningful event, log a workout, or record a hair ritual to begin your story.</p></div>
              ) : (
                <div className="p-5">
                  {[...groups.entries()].map(([label, items]) => (
                    <section key={label} className="mb-6 last:mb-0">
                      <p className="glow-display mb-3 text-[14px] italic text-[#8A8078]">{label}</p>
                      <div className="relative space-y-3 border-l border-[#F1E7E3] pl-5">
                        {items.map((event, index) => (
                          <div key={event.id} className={`relative overflow-hidden rounded-[14px] border border-[#F1E7E3] p-4 ${index % 2 === 0 ? 'bg-[#FDF8F6]' : 'bg-[#FDF3F2]'}`}>
                            <span className="absolute -left-[25px] top-5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#C9727E]" />
                            {event.imageUrl ? <Image src={event.imageUrl} alt="" width={640} height={320} unoptimized className="mb-3 h-32 w-full rounded-[10px] object-cover" /> : null}
                            <div className="flex justify-between gap-3">
                              <p className="glow-display text-[14px] text-[#2B2420]">{event.title}</p>
                              <span className="inline-flex shrink-0 items-center gap-1 text-[10px] text-[#B5ACA5]"><Clock3 size={9} />{event.occurredAt.toLocaleDateString()}</span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <p className="text-[10px] uppercase tracking-[.1em] text-[#B5ACA5]">{event.category}</p>
                              <span className="rounded-full border border-[#F1E7E3] bg-white px-2 py-0.5 text-[9px] uppercase tracking-[.08em] text-[#9A9088]">{event.source === 'manual' ? 'Saved memory' : 'Auto capture'}</span>
                            </div>
                            {event.summary ? <p className="mt-2 text-[11px] leading-4 text-[#8A8078]">{event.summary}</p> : null}
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </SectionPage>
    </AppShell>
  );
}
