import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { generateBriefingAction } from '@/app/actions/completion-v1';
import { getBriefings } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

export default async function BriefingsPage() {
  const session = await auth(); if (!session?.user?.id) redirect('/sign-in');
  const briefings = await getBriefings(session.user.id);
  return <AppShell><SectionPage eyebrow="Briefings" title="Start informed. End prepared." description="Generate in-app morning briefs, evening recaps, and weekly reviews from your real Glow OS context.">
    <div className="grid gap-4 sm:grid-cols-3">
      <Card><h2 className="font-semibold">Morning Brief</h2><p className="mt-2 text-sm text-slate-500">Schedule, unfinished work, focus score, and recommended next actions.</p><form action={generateBriefingAction.bind(null,'morning')} className="mt-4"><button className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-slate-900">Generate morning</button></form></Card>
      <Card><h2 className="font-semibold">Evening Recap</h2><p className="mt-2 text-sm text-slate-500">Review unfinished work and use current context to prepare tomorrow.</p><form action={generateBriefingAction.bind(null,'evening')} className="mt-4"><button className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-slate-900">Generate evening</button></form></Card>
      <Card><h2 className="font-semibold">Weekly Review</h2><p className="mt-2 text-sm text-slate-500">Capture a weekly context snapshot for patterns and next-week planning.</p><form action={generateBriefingAction.bind(null,'weekly')} className="mt-4"><button className="rounded-xl bg-slate-900 px-3 py-2 text-sm text-white dark:bg-white dark:text-slate-900">Generate weekly</button></form></Card>
    </div>
    <Card className="mt-5 space-y-3"><h2 className="text-xl font-semibold">Briefing history</h2>{briefings.length===0?<p className="text-sm text-slate-500">No briefings generated yet.</p>:briefings.map(b=>{const content=b.content as {dailyBrief?:string;focusScore?:number;unfinishedTasks?:number;overdueTasks?:number;todaysEvents?:number;recommendations?:Array<{message?:string}>};return <div key={b.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex justify-between gap-3"><p className="font-semibold capitalize">{b.kind} · {b.periodKey}</p><span className="text-xs text-slate-400">{b.generatedAt.toLocaleString()}</span></div>{content.dailyBrief&&<p className="mt-2 text-sm">{content.dailyBrief}</p>}<p className="mt-2 text-xs text-slate-400">Focus {content.focusScore??'—'} · {content.unfinishedTasks??0} unfinished · {content.overdueTasks??0} overdue · {content.todaysEvents??0} events</p></div>})}</Card>
  </SectionPage></AppShell>;
}
