import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createFitnessSessionAction } from '@/app/actions/completion-v1';
import { getFitnessSessions } from '@/lib/data/completion-v1';
import { Activity, BarChart3, Dumbbell, HeartPulse, Library, Play, Sparkles, TimerReset } from 'lucide-react';

export const dynamic = 'force-dynamic';

type FitnessView = 'workout' | 'library' | 'progress' | 'recovery';

type FitnessPageProps = {
  searchParams?: Promise<{ view?: string }>;
};

const workoutLibrary = [
  { title: '20-minute reset', focus: 'Low-impact full body', duration: 20, equipment: 'Mat', energy: 'Low–medium' },
  { title: 'Strong lower body', focus: 'Glutes + legs', duration: 35, equipment: 'Dumbbells / bands', energy: 'Medium–high' },
  { title: 'Upper body sculpt', focus: 'Back + shoulders + arms', duration: 30, equipment: 'Dumbbells', energy: 'Medium' },
  { title: 'Recovery walk', focus: 'Circulation + nervous-system reset', duration: 25, equipment: 'None', energy: 'Low' },
  { title: 'Pilates core flow', focus: 'Core + posture + mobility', duration: 30, equipment: 'Mat', energy: 'Medium' },
  { title: 'Mobility restore', focus: 'Hips + spine + shoulders', duration: 15, equipment: 'Mat', energy: 'Low' },
];

function clampScore(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return null;
  return Math.max(1, Math.min(10, value));
}

function recoveryRecommendation(energy: number | null, soreness: number | null, daysSinceLast: number | null) {
  if (soreness != null && soreness >= 7) {
    return { level: 'Recover', title: 'Recovery-first day', detail: 'Keep intensity low. Choose mobility, an easy walk, or full rest and reassess tomorrow.' };
  }
  if (energy != null && energy <= 4) {
    return { level: 'Light', title: 'Protect your energy', detail: 'A short low-impact session is enough today. Aim for consistency rather than intensity.' };
  }
  if (daysSinceLast != null && daysSinceLast >= 4) {
    return { level: 'Restart', title: 'Easy re-entry', detail: 'You have had a longer gap. Start with a 20–30 minute moderate session before pushing load or volume.' };
  }
  if ((energy ?? 0) >= 7 && (soreness ?? 10) <= 4) {
    return { level: 'Ready', title: 'Good day to train', detail: 'Your recent signals support a normal or stronger session. Keep form and recovery quality ahead of volume.' };
  }
  return { level: 'Steady', title: 'Moderate training day', detail: 'Choose a normal session with room to scale down if your body feels heavier once you start.' };
}

export default async function FitnessPage({ searchParams }: FitnessPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const params = searchParams ? await searchParams : undefined;
  const requestedView = params?.view;
  const view: FitnessView = requestedView === 'library' || requestedView === 'progress' || requestedView === 'recovery' ? requestedView : 'workout';
  const sessions = await getFitnessSessions(session.user.id);
  const recent = sessions.slice(0, 7);
  const minutes = recent.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
  const avgEnergy = recent.length ? Math.round(recent.reduce((sum, item) => sum + (item.energy ?? 0), 0) / recent.length) : 0;
  const avgSoreness = recent.length ? Math.round(recent.reduce((sum, item) => sum + (item.soreness ?? 0), 0) / recent.length) : 0;
  const now = new Date();
  const lastSession = sessions[0];
  const daysSinceLast = lastSession ? Math.max(0, Math.floor((now.getTime() - lastSession.occurredAt.getTime()) / 86400000)) : null;
  const latestEnergy = clampScore(lastSession?.energy);
  const latestSoreness = clampScore(lastSession?.soreness);
  const recommendation = recoveryRecommendation(latestEnergy, latestSoreness, daysSinceLast);
  const last30 = sessions.filter((item) => now.getTime() - item.occurredAt.getTime() <= 30 * 86400000);
  const last7 = sessions.filter((item) => now.getTime() - item.occurredAt.getTime() <= 7 * 86400000);
  const prior7 = sessions.filter((item) => {
    const age = now.getTime() - item.occurredAt.getTime();
    return age > 7 * 86400000 && age <= 14 * 86400000;
  });
  const total30Minutes = last30.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
  const weeklyMinutes = last7.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
  const priorWeeklyMinutes = prior7.reduce((sum, item) => sum + (item.durationMinutes ?? 0), 0);
  const weeklyDelta = priorWeeklyMinutes > 0 ? Math.round(((weeklyMinutes - priorWeeklyMinutes) / priorWeeklyMinutes) * 100) : null;
  const workoutCounts = last30.reduce<Record<string, number>>((acc, item) => {
    const key = item.workoutType.trim().toLowerCase() || 'other';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const topWorkout = Object.entries(workoutCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return <AppShell><SectionPage eyebrow="Fitness Intelligence" title="Train around your real energy" description="Use workout mode, your movement library, progress history, and recovery signals together so Glow OS can recommend the right kind of training for today.">
    <section className="grid gap-3 md:grid-cols-[1.3fr_.7fr]">
      <Card className="relative min-h-[190px] overflow-hidden bg-[linear-gradient(135deg,#e5e1de,#b9c2c2)] p-5"><div className="absolute right-0 top-0 h-full w-[42%] bg-[linear-gradient(145deg,#7d807d,#c5bbb2)] opacity-70"/><Dumbbell size={64} strokeWidth={.7} className="absolute right-[15%] top-1/2 -translate-y-1/2 text-white/55"/><div className="relative max-w-[58%]"><p className="glow-eyebrow">Today&apos;s movement</p><h2 className="glow-display mt-2 text-[27px] leading-8 text-[#354044]">{recommendation.title}</h2><p className="mt-3 text-[9px] leading-4 text-[#5f6b6d]">{recommendation.detail}</p><span className="mt-4 inline-flex rounded-full bg-white/55 px-3 py-1 text-[8px] font-medium text-[#53605e]">{recommendation.level} recommendation</span></div></Card>
      <Card className="bg-[linear-gradient(145deg,#edf0ed,#f7f1eb)] p-5"><p className="glow-display text-[17px] text-[#45514f]">Recovery snapshot</p><div className="mt-4 space-y-3"><div className="flex items-center justify-between text-[9px] text-[#6f7b79]"><span className="flex items-center gap-1"><TimerReset size={11}/>Recent minutes</span><strong className="text-[#3f4b49]">{minutes}</strong></div><div className="flex items-center justify-between text-[9px] text-[#6f7b79]"><span className="flex items-center gap-1"><Activity size={11}/>Sessions</span><strong className="text-[#3f4b49]">{recent.length}</strong></div><div className="flex items-center justify-between text-[9px] text-[#6f7b79]"><span className="flex items-center gap-1"><HeartPulse size={11}/>Avg. energy</span><strong className="text-[#3f4b49]">{avgEnergy || '—'}/10</strong></div><div className="flex items-center justify-between text-[9px] text-[#6f7b79]"><span>Soreness</span><strong className="text-[#3f4b49]">{avgSoreness || '—'}/10</strong></div></div></Card>
    </section>

    <nav className="mt-4 flex flex-wrap gap-2" aria-label="Fitness workspace views">
      {([
        ['workout', 'Workout mode', Play],
        ['library', 'Library', Library],
        ['progress', 'Progress', BarChart3],
        ['recovery', 'Recovery', HeartPulse],
      ] as const).map(([key, label, Icon]) => <Link key={key} href={`/fitness?view=${key}`} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[8px] font-medium transition ${view === key ? 'border-[#87928f] bg-[#e8ecea] text-[#3f4b49]' : 'border-[#dedad8] bg-white/65 text-[#77817f] hover:bg-white'}`}><Icon size={11}/>{label}</Link>)}
    </nav>

    {view === 'workout' ? <div className="mt-4 grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
      <Card className="paper-card"><form action={createFitnessSessionAction} className="space-y-3"><p className="glow-eyebrow">Workout mode</p><h2 className="glow-display text-[20px] text-[#3d4746]">Log today&apos;s session</h2><p className="text-[8px] leading-4 text-[#78817f]">Record energy and soreness with every workout so Recovery can adjust future recommendations around your actual body signals.</p><input name="workoutType" required placeholder="Pilates, strength, walk…" className="w-full border px-4 py-3 text-[10px]"/><input name="occurredAt" type="datetime-local" className="w-full border px-4 py-3 text-[10px]"/><input name="durationMinutes" inputMode="numeric" placeholder="Minutes" className="w-full border px-4 py-3 text-[10px]"/><div className="grid grid-cols-2 gap-2"><input name="energy" inputMode="numeric" placeholder="Energy 1–10" className="border px-3 py-3 text-[10px]"/><input name="soreness" inputMode="numeric" placeholder="Soreness 1–10" className="border px-3 py-3 text-[10px]"/></div><input name="equipment" placeholder="Equipment" className="w-full border px-4 py-3 text-[10px]"/><textarea name="notes" rows={3} placeholder="Recovery / session notes" className="w-full border px-4 py-3 text-[10px]"/><button className="rounded-[6px] bg-[#3b4544] px-4 py-2 text-[9px] font-medium text-white">Save workout</button></form></Card>

      <Card className="overflow-hidden p-0"><div className="border-b border-[#e1dddd] px-5 py-4"><p className="glow-eyebrow">Movement archive</p><h2 className="glow-display mt-1 text-[19px] text-[#3d4746]">Session history</h2></div>{sessions.length === 0 ? <div className="p-8 text-center"><p className="text-[9px] text-[#7f8987]">No workouts logged yet.</p><p className="mt-2 text-[8px] text-[#99a19f]">Start with a short walk, Pilates flow, or strength session and log it here.</p></div> : <div className="divide-y divide-[#e6e1df]">{sessions.map((item, index) => <div key={item.id} className={`grid gap-3 px-5 py-4 md:grid-cols-[55px_1fr_auto] ${index === 0 ? 'bg-[#edf0ef]/65' : ''}`}><div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#cfd7d4] bg-white/45 text-[#6f7c79]"><Dumbbell size={16}/></div><div><div className="flex flex-wrap items-center gap-2"><p className="glow-display text-[14px] text-[#414b49]">{item.workoutType}</p><span className="text-[7px] text-[#8d9694]">{item.occurredAt.toLocaleDateString()}</span></div><p className="mt-1 text-[8px] text-[#78817f]">{item.durationMinutes ?? '—'} min · energy {item.energy ?? '—'} · soreness {item.soreness ?? '—'}</p>{item.equipment ? <p className="mt-1 text-[8px] text-[#8a9391]">Equipment: {item.equipment}</p> : null}{item.notes ? <p className="mt-2 text-[8px] leading-4 text-[#68716f]">{item.notes}</p> : null}</div><span className="self-start rounded-full bg-[#e7ece8] px-2 py-1 text-[7px] text-[#68756b]">session {String(index + 1).padStart(2, '0')}</span></div>)}</div>}</Card>
    </div> : null}

    {view === 'library' ? <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{workoutLibrary.map((workout) => <Card key={workout.title} className="paper-card"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9edeb] text-[#5d6966]"><Dumbbell size={14}/></span><span className="text-[7px] uppercase tracking-[.16em] text-[#919a97]">{workout.energy}</span></div><h2 className="glow-display mt-4 text-[18px] text-[#414b49]">{workout.title}</h2><p className="mt-2 text-[8px] leading-4 text-[#747e7b]">{workout.focus}</p><div className="mt-4 flex items-center justify-between border-t border-[#e5e0de] pt-3 text-[8px] text-[#7a8481]"><span>{workout.duration} min</span><span>{workout.equipment}</span></div><Link href={`/fitness?view=workout`} className="mt-4 inline-flex items-center gap-1 text-[8px] font-medium text-[#53615e]"><Play size={10}/>Open workout mode</Link></Card>)}</div> : null}

    {view === 'progress' ? <div className="mt-4 grid gap-4 lg:grid-cols-[.75fr_1.25fr]">
      <Card className="paper-card"><p className="glow-eyebrow">30-day progress</p><h2 className="glow-display mt-2 text-[21px] text-[#414b49]">Your movement trend</h2><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-[10px] bg-[#eef1ef] p-4"><p className="text-[7px] uppercase tracking-[.14em] text-[#89928f]">Sessions</p><p className="glow-display mt-1 text-[24px] text-[#46514f]">{last30.length}</p></div><div className="rounded-[10px] bg-[#f3eee9] p-4"><p className="text-[7px] uppercase tracking-[.14em] text-[#968d87]">Minutes</p><p className="glow-display mt-1 text-[24px] text-[#514944]">{total30Minutes}</p></div><div className="rounded-[10px] bg-[#eef1ef] p-4"><p className="text-[7px] uppercase tracking-[.14em] text-[#89928f]">This week</p><p className="glow-display mt-1 text-[24px] text-[#46514f]">{weeklyMinutes}</p><p className="mt-1 text-[7px] text-[#7e8986]">minutes</p></div><div className="rounded-[10px] bg-[#f3eee9] p-4"><p className="text-[7px] uppercase tracking-[.14em] text-[#968d87]">Week change</p><p className="glow-display mt-1 text-[24px] text-[#514944]">{weeklyDelta == null ? '—' : `${weeklyDelta > 0 ? '+' : ''}${weeklyDelta}%`}</p></div></div></Card>
      <Card className="paper-card"><p className="glow-eyebrow">Pattern insight</p><h2 className="glow-display mt-2 text-[21px] text-[#414b49]">What your history says</h2>{last30.length === 0 ? <p className="mt-5 text-[9px] leading-5 text-[#7b8582]">Log your first session to unlock training frequency, minutes, energy, soreness, and workout-pattern insights.</p> : <div className="mt-5 space-y-4 text-[9px] leading-5 text-[#6f7976]"><p><strong className="text-[#4b5754]">Most repeated movement:</strong> {topWorkout ?? '—'}.</p><p><strong className="text-[#4b5754]">Current pace:</strong> {last7.length} session{last7.length === 1 ? '' : 's'} in the last 7 days for {weeklyMinutes} total minutes.</p><p><strong className="text-[#4b5754]">Recovery pattern:</strong> recent average energy is {avgEnergy || '—'}/10 and soreness is {avgSoreness || '—'}/10.</p></div>}</Card>
    </div> : null}

    {view === 'recovery' ? <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <Card className="paper-card"><div className="flex items-start justify-between gap-4"><div><p className="glow-eyebrow">Recovery-aware recommendation</p><h2 className="glow-display mt-2 text-[23px] text-[#414b49]">{recommendation.title}</h2></div><Sparkles size={18} className="text-[#7c8985]"/></div><p className="mt-4 max-w-2xl text-[9px] leading-5 text-[#6f7976]">{recommendation.detail}</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-[10px] border border-[#e2dedb] p-4"><p className="text-[7px] uppercase tracking-[.14em] text-[#929a98]">Latest energy</p><p className="glow-display mt-1 text-[22px] text-[#46514f]">{latestEnergy ?? '—'}<span className="text-[10px]">/10</span></p></div><div className="rounded-[10px] border border-[#e2dedb] p-4"><p className="text-[7px] uppercase tracking-[.14em] text-[#929a98]">Latest soreness</p><p className="glow-display mt-1 text-[22px] text-[#46514f]">{latestSoreness ?? '—'}<span className="text-[10px]">/10</span></p></div><div className="rounded-[10px] border border-[#e2dedb] p-4"><p className="text-[7px] uppercase tracking-[.14em] text-[#929a98]">Days since training</p><p className="glow-display mt-1 text-[22px] text-[#46514f]">{daysSinceLast ?? '—'}</p></div></div></Card>
      <Card className="bg-[linear-gradient(145deg,#eef1ef,#f7f2ed)] p-5"><p className="glow-eyebrow">Choose today</p><h2 className="glow-display mt-2 text-[18px] text-[#45514f]">Suggested intensity</h2><p className="mt-4 text-[27px] font-light text-[#54605d]">{recommendation.level}</p><p className="mt-3 text-[8px] leading-4 text-[#78817f]">This guidance is generated from your latest logged energy, soreness, and time since your last workout. Update those signals after training to keep the recommendation useful.</p><Link href="/fitness?view=library" className="mt-5 inline-flex rounded-[6px] bg-[#45504e] px-4 py-2 text-[8px] font-medium text-white">Browse matching workouts</Link></Card>
    </div> : null}
  </SectionPage></AppShell>;
}
