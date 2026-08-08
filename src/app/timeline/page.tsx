import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createTimelineEventAction } from '@/app/actions/completion-v1';
import { getTimelineEvents } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

export default async function TimelinePage() {
  const session = await auth(); if (!session?.user?.id) redirect('/sign-in');
  const events = await getTimelineEvents(session.user.id);
  const groups = new Map<string, typeof events>();
  for (const event of events) { const key=event.occurredAt.toLocaleDateString('en-US',{month:'long',year:'numeric'}); groups.set(key,[...(groups.get(key)??[]),event]); }
  return <AppShell><SectionPage eyebrow="Life Timeline" title="See your life as a connected story" description="Capture milestones, jobs, trips, projects, achievements, decisions, beauty or fitness progress, and memories in one chronological view.">
    <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
      <Card><form action={createTimelineEventAction} className="space-y-3"><h2 className="text-xl font-semibold">Add timeline event</h2><input name="title" required placeholder="What happened?" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="category" required placeholder="Category: career, travel, project…" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="occurredAt" required type="datetime-local" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><textarea name="summary" rows={4} placeholder="What should you remember?" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Add to timeline</button></form></Card>
      <Card className="space-y-6"><h2 className="text-xl font-semibold">Your timeline</h2>{events.length===0?<p className="text-sm text-slate-500">Your timeline is empty. Add a meaningful event to begin.</p>:[...groups.entries()].map(([label,items])=><section key={label}><p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</p><div className="space-y-3 border-l border-slate-200 pl-4 dark:border-slate-800">{items.map(event=><div key={event.id} className="relative rounded-2xl bg-slate-50 p-4 dark:bg-slate-900"><span className="absolute -left-[21px] top-5 h-2.5 w-2.5 rounded-full bg-slate-900 dark:bg-white"/><div className="flex justify-between gap-3"><p className="font-semibold">{event.title}</p><span className="text-xs text-slate-400">{event.occurredAt.toLocaleDateString()}</span></div><p className="mt-1 text-xs uppercase tracking-[0.15em] text-slate-400">{event.category}</p>{event.summary&&<p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{event.summary}</p>}</div>)}</div></section>)}</Card>
    </div>
  </SectionPage></AppShell>;
}
