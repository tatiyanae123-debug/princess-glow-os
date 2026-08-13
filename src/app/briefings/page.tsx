import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { generateExpandedBriefingAction, type BriefingKind } from '@/app/actions/briefings';
import { getBriefings } from '@/lib/data/completion-v1';
import { CalendarDays, Coffee, Compass, Landmark, MoonStar, Newspaper, Sparkles, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const dynamic = 'force-dynamic';

type BriefingCard = {
  title: string;
  description: string;
  kind: BriefingKind;
  icon: LucideIcon;
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
  { title: 'Morning Brief', description: 'Start with schedule pressure, unfinished work, habits, reminders, focus score, and the best next moves.', kind: 'morning', icon: Sun },
  { title: 'Evening Debrief', description: 'Close loops, review carryover, and see what should be finished, moved, or protected before the day ends.', kind: 'evening', icon: MoonStar },
  { title: 'Tomorrow Brief', description: 'Preview tomorrow using tomorrow’s calendar context, open work, routines, reminders, and recommendations.', kind: 'tomorrow', icon: CalendarDays },
  { title: 'Weekly Debrief', description: 'Capture the current weekly pressure picture, goal context, patterns, and next-week planning signals.', kind: 'weekly', icon: Newspaper },
  { title: 'Monthly Debrief', description: 'Take a higher-level checkpoint across goals, task load, focus, risks, and what deserves more or less attention.', kind: 'monthly', icon: Sparkles },
  { title: 'Quarterly Review', description: 'Step back to see which goals and patterns should shape the next thirteen weeks.', kind: 'quarterly', icon: Compass },
  { title: 'Year Review', description: 'A yearly checkpoint marker for active goals and direction, not a full retrospective.', kind: 'year', icon: Landmark },
];

function kindLabel(kind: string) {
  return kind.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const THEME: Record<string, { icon: LucideIcon; wash: string; accent: string; emphasis: string }> = {
  morning: { icon: Sun, wash: 'linear-gradient(145deg,#FDF6F1,#F1E8D9)', accent: '#9A7A3D', emphasis: 'recommendations' },
  tomorrow: { icon: CalendarDays, wash: 'linear-gradient(145deg,#FDF6F1,#E4EBDD)', accent: '#5A6E52', emphasis: 'recommendations' },
  evening: { icon: MoonStar, wash: 'linear-gradient(145deg,#FDF6F1,#E9E4F2)', accent: '#7C6B9C', emphasis: 'attentionSignals' },
  weekly: { icon: Newspaper, wash: 'linear-gradient(145deg,#FDF6F1,#F1E8D9)', accent: '#9A7A3D', emphasis: 'patterns' },
  monthly: { icon: Sparkles, wash: 'linear-gradient(145deg,#FDF6F1,#FBE4E8)', accent: '#B15A68', emphasis: 'activeGoals' },
  quarterly: { icon: Compass, wash: 'linear-gradient(145deg,#FDF6F1,#E9E4F2)', accent: '#7C6B9C', emphasis: 'patterns' },
  year: { icon: Landmark, wash: 'linear-gradient(145deg,#FDF6F1,#F1E8D9)', accent: '#9A7A3D', emphasis: 'activeGoals' },
};

function themeFor(kind: string) {
  return THEME[kind] ?? THEME.morning;
}

function emphasisLabel(kind: string) {
  const emphasis = themeFor(kind).emphasis;
  if (emphasis === 'attentionSignals') return 'Carrying into tomorrow';
  if (emphasis === 'patterns') return 'Patterns this week';
  if (emphasis === 'activeGoals') return 'Goals in motion';
  return 'Best next moves';
}

type EmphasisItem = { id?: string; title: string; detail?: string; href?: string };

function pickEmphasis(kind: string, content?: BriefingContent): EmphasisItem[] {
  const emphasis = themeFor(kind).emphasis;
  if (emphasis === 'attentionSignals') return (content?.attentionSignals ?? []).map((s) => ({ id: s.id, title: s.label, detail: s.detail, href: s.href }));
  if (emphasis === 'patterns') return (content?.patterns ?? []).map((p) => ({ id: p.id, title: p.title, detail: p.detail, href: p.href }));
  if (emphasis === 'activeGoals') return (content?.activeGoals ?? []).map((g) => ({ id: g.id, title: g.title, href: '/goals' }));
  return (content?.recommendations ?? []).map((r) => ({ id: r.id, title: r.title, detail: r.reason, href: r.href }));
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
          <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#F1E8D9,#FDF6F1)]">
            <Coffee size={52} strokeWidth={0.8} className="absolute right-5 top-4 text-[#9A7A3D]/22" />
            <p className="glow-eyebrow">The Glow Daily</p>
            <p className="glow-display mt-2 max-w-3xl text-[24px] text-[#2B2420]">A personal paper about the life you are actually living.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#8A8078]">
              <span className="rounded-full border border-[#F1E7E3] bg-white/70 px-3 py-1.5">{briefings.length} saved</span>
              <span className="rounded-full border border-[#F1E7E3] bg-white/70 px-3 py-1.5">{cards.length} report types</span>
              {latestContent?.focusScore !== undefined ? <span className="rounded-full border border-[#F1E7E3] bg-white/70 px-3 py-1.5">Latest focus {latestContent.focusScore}/100</span> : null}
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ title, description, kind, icon: Icon }) => {
              const theme = themeFor(kind);
              return (
                <Card key={kind} className="relative overflow-hidden" style={{ background: theme.wash }}>
                  <Icon size={28} strokeWidth={1} style={{ color: theme.accent }} />
                  <h2 className="glow-display mt-4 text-[17px] text-[#2B2420]">{title}</h2>
                  <p className="mt-2 min-h-[64px] text-[11.5px] leading-4 text-[#8A8078]">{description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {kind === 'evening' ? (
                      <Link href="/briefings/evening" className="rounded-full bg-[#2B2420] px-3.5 py-2 text-[11px] font-medium text-white">Open Evening Debrief</Link>
                    ) : (
                      <form action={generateExpandedBriefingAction.bind(null, kind)}>
                        <button className="rounded-full bg-[#2B2420] px-3.5 py-2 text-[11px] font-medium text-white">Generate {kindLabel(kind)}</button>
                      </form>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          {latest ? (() => {
            const theme = themeFor(latest.kind);
            const Icon = theme.icon;
            const emphasisItems = pickEmphasis(latest.kind, latestContent);
            return (
              <Card className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]" style={{ background: theme.wash }}>
                <div>
                  <div className="flex items-center gap-2"><Icon size={16} style={{ color: theme.accent }} /><p className="glow-eyebrow">Latest intelligence</p></div>
                  <h2 className="glow-display mt-2 text-[21px] text-[#2B2420]">{kindLabel(latest.kind)} · {latest.periodKey}</h2>
                  <p className="glow-display mt-3 text-[14px] leading-6 text-[#4A4440]">{latestContent?.summary ?? latestContent?.dailyBrief ?? 'Your latest briefing is ready.'}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[10.5px] uppercase tracking-[.06em] text-[#8A8078]">
                    <span>{latestContent?.unfinishedTasks ?? 0} open tasks</span><span>·</span>
                    <span>{latestContent?.overdueTasks ?? 0} overdue</span><span>·</span>
                    <span>{latestContent?.todaysEvents ?? 0} events</span><span>·</span>
                    <span>{latestContent?.openAppleReminders ?? 0} reminders</span>
                  </div>
                </div>
                <div className="rounded-[14px] border border-[#F1E7E3] bg-white/70 p-4">
                  <p className="glow-eyebrow">{emphasisLabel(latest.kind)}</p>
                  {emphasisItems.length ? (
                    <div className="mt-3 space-y-2">
                      {emphasisItems.slice(0, 3).map((item, index) => (
                        <Link key={item.id ?? `${item.title}-${index}`} href={item.href ?? '/today'} className="block rounded-[12px] border border-[#F1E7E3] bg-white/80 p-3">
                          <p className="text-[12px] font-medium text-[#2B2420]">{item.title}</p>
                          {item.detail ? <p className="mt-1 text-[10.5px] leading-4 text-[#8A8078]">{item.detail}</p> : null}
                        </Link>
                      ))}
                    </div>
                  ) : <p className="mt-3 text-[11.5px] text-[#8A8078]">Generate a new briefing to refresh this view.</p>}
                </div>
              </Card>
            );
          })() : null}

          <Card className="overflow-hidden p-0">
            <div className="border-b border-[#F1E7E3] px-5 py-4">
              <p className="glow-eyebrow">Archive</p>
              <h2 className="glow-display mt-1 text-[19px] text-[#2B2420]">Briefing history</h2>
            </div>
            {briefings.length === 0 ? (
              <div className="p-8 text-center">
                <p className="glow-display text-[16px] text-[#2B2420]">Your briefing archive is empty.</p>
                <p className="mt-2 text-[11.5px] text-[#8A8078]">Generate a Morning Brief above to create the first real snapshot of your Glow OS context.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1E7E3]">
                {briefings.map((briefing, index) => {
                  const content = briefing.content as BriefingContent;
                  const theme = themeFor(briefing.kind);
                  const Icon = theme.icon;
                  const items = pickEmphasis(briefing.kind, content);
                  return (
                    <article key={briefing.id} className={`p-5 ${index === 0 ? 'bg-[#FDF8F6]' : ''}`}>
                      <div className="flex flex-wrap justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Icon size={13} style={{ color: theme.accent }} />
                          <div>
                            <p className="glow-display text-[15px] text-[#2B2420]">{kindLabel(briefing.kind)} · {briefing.periodKey}</p>
                            <p className="mt-1 text-[10.5px] text-[#B5ACA5]">{briefing.generatedAt.toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-[.1em]" style={{ color: theme.accent }}>{emphasisLabel(briefing.kind)}</span>
                      </div>
                      <p className="glow-display mt-3 max-w-4xl text-[13px] leading-5 text-[#4A4440]">{content.summary ?? content.dailyBrief ?? 'Briefing snapshot saved.'}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[10.5px] text-[#8A8078]">
                        <span>Focus {content.focusScore ?? '—'}</span><span>·</span>
                        <span>{content.unfinishedTasks ?? 0} unfinished</span><span>·</span>
                        <span>{content.overdueTasks ?? 0} overdue</span><span>·</span>
                        <span>{content.todaysEvents ?? 0} events</span>
                        {content.habitsTotal !== undefined ? <><span>·</span><span>{content.habitsCompleted ?? 0}/{content.habitsTotal} habits</span></> : null}
                      </div>
                      {items.length ? (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {items.slice(0, 2).map((item, itemIndex) => (
                            <Link key={item.id ?? `${item.title}-${itemIndex}`} href={item.href ?? '/today'} className="rounded-[12px] border border-[#F1E7E3] bg-[#FDF8F6] p-3">
                              <p className="text-[11.5px] font-medium text-[#2B2420]">{item.title}</p>
                              {item.detail ? <p className="mt-1 text-[10.5px] leading-4 text-[#8A8078]">{item.detail}</p> : null}
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
