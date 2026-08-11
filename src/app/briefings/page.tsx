import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { generateExpandedBriefingAction, type BriefingKind } from '@/app/actions/briefings';
import { getBriefings } from '@/lib/data/completion-v1';
import { CalendarDays, Coffee, MoonStar, Newspaper, Sparkles, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

type BriefingCard = {
  title: string;
  description: string;
  kind: BriefingKind;
  icon: LucideIcon;
  wash: string;
};

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
  recommendations?: Array<{ id?: string; title: string; reason?: string; href?: string; priority?: string }>;
  attentionSignals?: Array<{ id?: string; label: string; detail?: string; href?: string; level?: string }>;
  patterns?: Array<{ id?: string; title: string; detail?: string; href?: string }>;
  activeGoals?: Array<{ id?: string; title: string }>;
  targetDate?: string;
};

const cards: BriefingCard[] = [
  { title: 'Morning Brief', description: 'Start with schedule pressure, unfinished work, habits, reminders, focus score, and the best next moves.', kind: 'morning', icon: Sun, wash: '#f3e5cf' },
  { title: 'Evening Recap', description: 'Close loops, review carryover, and see what should be finished, moved, or protected before the day ends.', kind: 'evening', icon: MoonStar, wash: '#e6e1eb' },
  { title: 'Tomorrow Brief', description: 'Preview tomorrow using tomorrow’s calendar context, open work, routines, reminders, and recommendations.', kind: 'tomorrow', icon: CalendarDays, wash: '#e8eee5' },
  { title: 'Weekly Review', description: 'Capture the current weekly pressure picture, goal context, patterns, and next-week planning signals.', kind: 'weekly', icon: Newspaper, wash: '#e8e4d8' },
  { title: 'Monthly Report', description: 'Take a higher-level checkpoint across goals, task load, focus, risks, and what deserves more or less attention.', kind: 'monthly', icon: Sparkles, wash: '#f0e5e0' },
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

  return (
    <AppShell>
      <SectionPage
        eyebrow="Briefings"
        title="Start informed. End prepared."
        description="Generate morning, evening, tomorrow, weekly, and monthly reports from your real Glow OS context, then keep them as a personal archive."
      >
        <div className="space-y-4">
          <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#f5ecdf,#f8f1ea)] p-5">
            <Coffee size={52} strokeWidth={0.8} className="absolute right-5 top-3 text-[#8a7764]/16" />
            <p className="glow-eyebrow">The Glow Daily</p>
            <p className="glow-display mt-2 max-w-3xl text-[24px] text-[#4b4034]">A personal paper about the life you are actually living.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[8px] text-[#7e7064]">
              <span className="rounded-full border border-[#dfd2c3] bg-white/55 px-3 py-1.5">{briefings.length} saved</span>
              <span className="rounded-full border border-[#dfd2c3] bg-white/55 px-3 py-1.5">5 report types</span>
              {latestContent?.focusScore !== undefined ? <span className="rounded-full border border-[#dfd2c3] bg-white/55 px-3 py-1.5">Latest focus {latestContent.focusScore}/100</span> : null}
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map(({ title, description, kind, icon: Icon, wash }) => (
              <Card key={kind} className="relative overflow-hidden p-5" style={{ background: `linear-gradient(145deg,rgba(255,252,248,.82),${wash})` }}>
                <Icon size={30} strokeWidth={1} className="text-[#8c786b]" />
                <h2 className="glow-display mt-4 text-[17px] text-[#4b4034]">{title}</h2>
                <p className="mt-2 min-h-[64px] text-[8px] leading-4 text-[#7e7064]">{description}</p>
                <form action={generateExpandedBriefingAction.bind(null, kind)} className="mt-4">
                  <button className="rounded-[6px] bg-[#443a32] px-3 py-2 text-[8px] text-white">Generate {kindLabel(kind)}</button>
                </form>
              </Card>
            ))}
          </div>

          {latest ? (
            <Card className="grid gap-5 bg-[linear-gradient(145deg,#faf5ed,#f7f1e8)] p-5 lg:grid-cols-[1.1fr_.9fr]">
              <div>
                <p className="glow-eyebrow">Latest intelligence</p>
                <h2 className="glow-display mt-2 text-[21px] text-[#4b4034]">{kindLabel(latest.kind)} · {latest.periodKey}</h2>
                <p className="glow-display mt-3 text-[14px] leading-6 text-[#66594f]">{latestContent?.summary ?? latestContent?.dailyBrief ?? 'Your latest briefing is ready.'}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[7px] uppercase tracking-[.08em] text-[#8d7d70]">
                  <span>{latestContent?.unfinishedTasks ?? 0} open tasks</span><span>·</span>
                  <span>{latestContent?.overdueTasks ?? 0} overdue</span><span>·</span>
                  <span>{latestContent?.todaysEvents ?? 0} events</span><span>·</span>
                  <span>{latestContent?.openAppleReminders ?? 0} reminders</span>
                </div>
              </div>
              <div className="rounded-[10px] border border-[#e3d8ca] bg-white/45 p-4">
                <p className="glow-eyebrow">Best next moves</p>
                {latestContent?.recommendations?.length ? (
                  <div className="mt-3 space-y-2">
                    {latestContent.recommendations.slice(0, 3).map((item, index) => (
                      <Link key={item.id ?? `${item.title}-${index}`} href={item.href ?? '/today'} className="block rounded-[8px] border border-[#e6ddd2] bg-white/60 p-3">
                        <p className="text-[9px] font-medium text-[#54483d]">{item.title}</p>
                        {item.reason ? <p className="mt-1 text-[7px] leading-4 text-[#897b70]">{item.reason}</p> : null}
                      </Link>
                    ))}
                  </div>
                ) : <p className="mt-3 text-[8px] text-[#897b70]">Generate a new briefing to refresh your next moves.</p>}
              </div>
            </Card>
          ) : null}

          <Card className="overflow-hidden p-0">
            <div className="border-b border-[#e8dfd3] px-5 py-4">
              <p className="glow-eyebrow">Archive</p>
              <h2 className="glow-display mt-1 text-[19px] text-[#4b4034]">Briefing history</h2>
            </div>
            {briefings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="glow-display text-[16px] text-[#5a4d41]">Your briefing archive is empty.</p>
                <p className="mt-2 text-[8px] text-[#86796d]">Generate a Morning Brief above to create the first real snapshot of your Glow OS context.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#eee6dc]">
                {briefings.map((briefing, index) => {
                  const content = briefing.content as BriefingContent;
                  return (
                    <article key={briefing.id} className={`p-5 ${index === 0 ? 'bg-[#faf4ec]' : ''}`}>
                      <div className="flex flex-wrap justify-between gap-3">
                        <div>
                          <p className="glow-display text-[15px] text-[#4d4236]">{kindLabel(briefing.kind)} · {briefing.periodKey}</p>
                          <p className="mt-1 text-[7px] text-[#9a8a7d]">{briefing.generatedAt.toLocaleString()}</p>
                        </div>
                        <span className="text-[7px] uppercase tracking-[.12em] text-[#9a8a7d]">Glow Daily</span>
                      </div>
                      <p className="glow-display mt-3 max-w-4xl text-[13px] leading-5 text-[#66594f]">{content.summary ?? content.dailyBrief ?? 'Briefing snapshot saved.'}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[7px] text-[#998a7e]">
                        <span>Focus {content.focusScore ?? '—'}</span><span>·</span>
                        <span>{content.unfinishedTasks ?? 0} unfinished</span><span>·</span>
                        <span>{content.overdueTasks ?? 0} overdue</span><span>·</span>
                        <span>{content.todaysEvents ?? 0} events</span>
                        {content.habitsTotal !== undefined ? <><span>·</span><span>{content.habitsCompleted ?? 0}/{content.habitsTotal} habits</span></> : null}
                      </div>
                      {content.attentionSignals?.length ? (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {content.attentionSignals.slice(0, 2).map((signal, signalIndex) => (
                            <Link key={signal.id ?? `${signal.label}-${signalIndex}`} href={signal.href ?? '/today'} className="rounded-[8px] border border-[#eadfd4] bg-white/50 p-3">
                              <p className="text-[8px] font-medium text-[#5a4c40]">{signal.label}</p>
                              {signal.detail ? <p className="mt-1 text-[7px] leading-4 text-[#8b7c70]">{signal.detail}</p> : null}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </SectionPage>
    </AppShell>
  );
}
