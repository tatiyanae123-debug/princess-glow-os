import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { workoutForDate, workoutWeek } from '@/lib/personal-os/source-of-truth';

export const dynamic = 'force-dynamic';

export default async function PersonalFitnessPlanPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const today = workoutForDate(new Date());

  return (
    <AppShell>
      <div className="mx-auto max-w-[1180px] space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="glow-eyebrow">2026 source of truth</p>
            <h1 className="glow-display mt-2 text-[42px] text-[#1C1C1E]">Your Workout System</h1>
            <p className="mt-2 max-w-[650px] text-[13px] leading-6 text-[#6E6E73]">The weekly split from your uploaded 2026 body recomposition plan, kept separate from workout logs so your plan and your history do not get mixed together.</p>
          </div>
          <Link href="/fitness" className="rounded-full border border-[#E6E6E6] px-4 py-2.5 text-[12px]">Workout history</Link>
        </header>

        <Card className="border-[#E9D9DD] bg-[#FDF9FA] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#B86F7D]">Today · Day {today.day}</p>
          <h2 className="glow-display mt-2 text-[30px]">{today.name}</h2>
          <p className="mt-2 text-[13px] leading-6 text-[#6E6E73]">{today.purpose}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {today.exercises.map((exercise) => <div key={exercise} className="rounded-[12px] border border-[#EEE5E7] bg-white px-4 py-3 text-[12px]">{exercise}</div>)}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/glow-cards?kind=workout" className="rounded-full bg-[#1C1C1E] px-4 py-2.5 text-[12px] text-white">Make today&apos;s workout card</Link>
          </div>
        </Card>

        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-[17px] font-semibold">Weekly split</h2><Link href="/glow-cards?kind=week" className="text-[12px] text-[#B86F7D]">Generate weekly visual →</Link></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workoutWeek.map((item) => <Card key={item.day} className="p-5"><p className="text-[10px] uppercase tracking-[.13em] text-[#8A8A8F]">Day {item.day}</p><h3 className="glow-display mt-2 text-[21px]">{item.name}</h3><p className="mt-2 text-[11px] leading-5 text-[#6E6E73]">{item.purpose}</p><div className="mt-4 space-y-1.5">{item.exercises.map((exercise) => <p key={exercise} className="text-[11px] text-[#454549]">• {exercise}</p>)}</div></Card>)}
          </div>
        </section>

        <Card className="p-5">
          <h2 className="text-[16px] font-semibold">Non-negotiables from the plan</h2>
          <p className="mt-3 text-[12px] leading-6 text-[#5F5F64]">Daily movement, hydration, protein, posture awareness, deep-core engagement, steps and sleep consistency. Weekly: 2–3 glute sessions, 2 upper-body sessions, 1 cardio/core day, mobility and recovery. Monthly: progress photos, measurements, strength tracking, glute progression review and recovery audit.</p>
        </Card>
      </div>
    </AppShell>
  );
}
