import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { generateExpandedBriefingAction, type BriefingKind } from '@/app/actions/briefings';
import { getBriefings } from '@/lib/data/completion-v1';
import { ArrowRight, CalendarDays, Compass, History, Landmark, MoonStar, Newspaper, Sparkles, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

type BriefingContent = {
  dailyBrief?: string;
  summary?: string;
  focusScore?: number;
  unfinishedTasks?: number;
  overdueTasks?: number;
  todaysEvents?: number;
  openAppleReminders?: number;
  habitsCompleted?: number;
  habitsTotal?: number;
};

type BriefingNav = { title: string; subtitle: string; kind?: BriefingKind; href?: string; icon: LucideIcon };

const NAV: BriefingNav[] = [
  { title: 'Morning Brief', subtitle: 'Start the day with intention', kind: 'morning', icon: Sun },
  { title: 'Evening Debrief', subtitle: 'Reflect and close your day', href: '/briefings/evening', icon: MoonStar },
  { title: 'Weekly Debrief', subtitle: 'Review the week, realign, reset', kind: 'weekly', icon: Newspaper },
  { title: 'Monthly Debrief', subtitle: 'Zoom out and take inventory', kind: 'monthly', icon: CalendarDays },
  { title: 'Quarter Review', subtitle: 'Assess progress and recalibrate', kind: 'quarterly', icon: Compass },
  { title: 'Year Review', subtitle: 'Reflect on the year, envision ahead', kind: 'year', icon: Landmark },
  { title: 'History', subtitle: 'Browse past briefings', href: '#history', icon: History },
];

function kindLabel(kind: string) {
  return kind.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default async function BriefingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const briefings = await getBriefings(session.user.id);
  const latest = briefings[0];
  const latestContent = latest?.content as BriefingContent | undefined;
  const recent = briefings.slice(0, 3);

  return (
    <AppShell>
      <SectionPage eyebrow="Briefings" title="Briefings" description="Clarity in the morning. Reflection at night. Growth always.">
        <div className="space-y-4">
          <section className="grid gap-4 xl:grid-cols-[240px_1fr_300px]">
            <Card className="p-3">
              <div className="space-y-1">
                {NAV.map((item, index) => {
                  const Icon = item.icon;
                  const body = <div className={`flex items-start gap-3 rounded-[12px] px-3 py-3 ${index === 0 ? 'bg-[#FDF3F2]' : 'hover:bg-[#FDF8F6]'}`}><Icon size={18} className={index === 0 ? 'mt-0.5 text-[#C9727E]' : 'mt-0.5 text-[#9A7A6C]'}/><div><p className={`text-[12px] font-medium ${index === 0 ? 'text-[#B15A68]' : 'text-[#3A332E]'}`}>{item.title}</p><p className="mt-0.5 text-[10px] leading-4 text-[#9A9088]">{item.subtitle}</p></div></div>;
                  if (item.href) return <Link key={item.title} href={item.href}>{body}</Link>;
                  return <form key={item.title} action={generateExpandedBriefingAction.bind(null, item.kind as BriefingKind)}><button type="submit" className="w-full text-left">{body}</button></form>;
                })}
              </div>
            </Card>

            <Card className="overflow-hidden p-0">
              <div className="grid min-h-[420px] lg:grid-cols-[1.05fr_.95fr]">
                <div className="p-7 sm:p-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#C9727E]">Featured</p>
                  <h2 className="glow-display mt-2 text-[32px] text-[#2B2420]">{latest ? kindLabel(latest.kind) : 'Morning Brief'}</h2>
                  <p className="mt-2 flex items-center gap-2 text-[11px] text-[#9A9088]"><CalendarDays size={12}/>{latest ? latest.generatedAt.toLocaleString() : 'Ready when you are'}</p>
                  <p className="glow-display mt-6 text-[17px] text-[#3A332E]">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {session.user.name?.split(' ')[0] ?? 'Tatiyana'} ✨</p>
                  <p className="mt-3 max-w-md text-[12px] leading-5 text-[#7D746F]">{latestContent?.summary ?? latestContent?.dailyBrief ?? 'Today is a fresh canvas. Focus on what moves the needle, stay aligned with your priorities, and leave space for magic.'}</p>
                  <div className="mt-5 rounded-[14px] border border-[#F1E7E3] bg-[#FDF3F2] p-4"><p className="text-[10px] font-semibold text-[#C9727E]">Today’s Focus</p><p className="mt-2 text-[11.5px] text-[#4A4440]">Focus score {latestContent?.focusScore ?? '—'} · {latestContent?.unfinishedTasks ?? 0} open tasks · {latestContent?.todaysEvents ?? 0} events.</p></div>
                  <form action={generateExpandedBriefingAction.bind(null, 'morning')} className="mt-5"><button className="inline-flex items-center gap-2 rounded-[8px] bg-[#D76078] px-5 py-3 text-[12px] font-medium text-white">Open Brief <ArrowRight size={12}/></button></form>
                </div>
                <div className="min-h-[280px] bg-[radial-gradient(circle_at_58%_38%,rgba(255,255,255,.92)_0_18%,transparent_19%),linear-gradient(145deg,#EADCD0,#F5EEE8)]"/>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Briefing Summary</h2></div>
              <div className="mt-4 divide-y divide-[#F1E7E3]">
                {NAV.slice(0,6).map((item, index) => { const Icon = item.icon; return <div key={item.title} className="flex items-center gap-3 py-3"><span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FDF3F2] text-[#C9727E]"><Icon size={16}/></span><div className="min-w-0 flex-1"><p className="text-[11.5px] text-[#3A332E]">{item.title}</p><p className="text-[10px] text-[#9A9088]">{index === 0 && latest ? 'Latest generated' : index === 1 ? 'Pending' : 'Available'}</p></div></div>; })}
                <Link href="#history" className="flex items-center justify-between py-3 text-[11.5px] text-[#3A332E]"><span>History · {briefings.length} saved</span><ArrowRight size={12}/></Link>
              </div>
            </Card>
          </section>

          <Card id="history">
            <div className="grid gap-4 lg:grid-cols-[160px_1fr]">
              <div><p className="glow-display text-[17px]">Recent Completed Debriefs</p></div>
              <div className="grid gap-4 md:grid-cols-3">
                {recent.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">Your briefing archive is empty.</p> : recent.map((briefing, index) => {
                  const content = briefing.content as BriefingContent;
                  return <article key={briefing.id} className="grid grid-cols-[88px_1fr] gap-3"><div className={`rounded-[10px] ${index === 0 ? 'bg-[#E7D9CF]' : index === 1 ? 'bg-[#ECE3DA]' : 'bg-[#E3D7CD]'}`}/><div><p className="text-[11.5px] font-medium text-[#3A332E]">{kindLabel(briefing.kind)}</p><p className="mt-1 text-[9.5px] text-[#9A9088]">{briefing.generatedAt.toLocaleDateString()}</p><p className="mt-2 text-[10.5px] leading-4 text-[#7D746F] line-clamp-3">{content.summary ?? content.dailyBrief ?? 'Briefing snapshot saved.'}</p><span className="mt-2 inline-flex text-[10.5px] text-[#C9727E]">Review →</span></div></article>;
                })}
              </div>
            </div>
          </Card>

          <Card className="grid gap-4 overflow-hidden bg-[linear-gradient(90deg,#FFF,#FFF7F5)] lg:grid-cols-[230px_1fr_260px] lg:items-center"><div className="h-28 rounded-[14px] bg-[linear-gradient(145deg,#DCC8B8,#F1E6DC)]"/><div><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><span className="glow-display text-[18px]">Glow Insight</span></div><p className="glow-display mt-3 text-[20px] italic leading-7">“Reflection turns experience into wisdom. You don’t just move forward — you move with meaning.”</p></div><div className="rounded-[14px] bg-[#FDF3F2] p-4"><p className="text-[10px] font-semibold text-[#C9727E]">Your Briefing Rhythm</p><div className="mt-3 space-y-2 text-[10.5px] text-[#7D746F]"><p>This archive <span className="float-right">{briefings.length}</span></p><div className="h-1 rounded-full bg-white"><div className="h-full w-2/3 rounded-full bg-[#C9727E]"/></div></div></div></Card>
        </div>
      </SectionPage>
    </AppShell>
  );
}
