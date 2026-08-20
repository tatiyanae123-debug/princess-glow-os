import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { visualCardItems } from '@/lib/personal-os/source-of-truth';

export const dynamic = 'force-dynamic';

const OPTIONS = [
  { kind: 'morning', label: 'Morning Ritual', note: 'Your complete morning checklist.' },
  { kind: 'midday', label: 'Midday Reset', note: 'A calm reset for the middle of the day.' },
  { kind: 'night', label: 'Night Ritual', note: 'Close the day and prepare tomorrow.' },
  { kind: 'sunday', label: 'Sunday Reset', note: 'Home, beauty, admin, planning and recovery.' },
  { kind: 'workout', label: 'Today’s Workout', note: 'The workout assigned by your 2026 split.' },
  { kind: 'week', label: 'Weekly Fitness Schedule', note: 'All seven training days in one visual.' },
] as const;

export default async function GlowCardsPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const params = await searchParams;
  const selected = OPTIONS.find((option) => option.kind === params.kind) ?? OPTIONS[0];
  const items = visualCardItems(selected.kind);
  const src = `/api/glow/cards?kind=${encodeURIComponent(selected.kind)}`;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1200px] space-y-6">
        <header>
          <p className="glow-eyebrow">Visual engine</p>
          <h1 className="glow-display mt-2 text-[42px]">Glow Cards</h1>
          <p className="mt-2 max-w-[700px] text-[13px] leading-6 text-[#6E6E73]">Turn the live routines and fitness plan into ready-to-save visual checklists. These cards are generated from Glow OS data instead of being manually designed each time.</p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <Card className="p-4">
            <h2 className="text-[14px] font-semibold">Choose a visual</h2>
            <div className="mt-4 space-y-2">
              {OPTIONS.map((option) => <Link key={option.kind} href={`/glow-cards?kind=${option.kind}`} className={`block rounded-[13px] border px-4 py-3 transition ${selected.kind === option.kind ? 'border-[#D7B3BD] bg-[#F8EFF1]' : 'border-[#ECECEC] hover:bg-[#FAFAFA]'}`}><p className="text-[12px] font-medium">{option.label}</p><p className="mt-1 text-[10px] leading-4 text-[#77777B]">{option.note}</p></Link>)}
            </div>
          </Card>

          <div className="space-y-3">
            <div className="overflow-hidden rounded-[28px] border border-[#E9E5E7] bg-[#FAFAFA] p-3 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${selected.label} generated Glow card`} className="mx-auto h-auto w-full max-w-[560px] rounded-[22px]" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a href={src} target="_blank" rel="noreferrer" className="rounded-full bg-[#1C1C1E] px-4 py-2.5 text-[12px] text-white">Open full-size image</a>
              <a href={`${src}&download=1`} download className="rounded-full border border-[#E3E3E3] px-4 py-2.5 text-[12px]">Save image</a>
              <Link href="/routines" className="rounded-full border border-[#E3E3E3] px-4 py-2.5 text-[12px]">Edit routines</Link>
            </div>
          </div>
        </div>

        <Card className="p-5">
          <h2 className="text-[15px] font-semibold">What this card is using</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">{items.map((item) => <div key={item} className="rounded-[11px] bg-[#FAFAFA] px-3 py-2.5 text-[11px] text-[#55555A]">{item}</div>)}</div>
        </Card>
      </div>
    </AppShell>
  );
}
