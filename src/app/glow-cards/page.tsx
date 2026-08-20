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
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1180px] space-y-5 pb-10">
        <header className="rounded-[28px] border border-[#eee5ea] bg-[linear-gradient(135deg,#fffafd_0%,#f7edf5_45%,#edf5f7_100%)] px-5 py-6 shadow-[0_16px_46px_rgba(72,54,76,.08)] sm:px-7">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#927b91]">Glow visual engine</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="glow-display text-[38px] leading-none text-[#262126] sm:text-[46px]">Glow Cards</h1>
              <p className="mt-3 max-w-[720px] text-[13px] leading-6 text-[#6f666f]">Turn your live routines and fitness plan into beautiful, ready-to-save checklists. Pick a card below and Glow generates it from your actual system.</p>
            </div>
            <Link href="/routines" className="rounded-full border border-white/90 bg-white/80 px-4 py-2.5 text-[11px] font-medium text-[#504851] shadow-sm">Edit routines</Link>
          </div>
        </header>

        <section aria-label="Choose a Glow card" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {OPTIONS.map((option) => (
            <Link
              key={option.kind}
              href={`/glow-cards?kind=${option.kind}`}
              className={`min-h-[92px] rounded-[18px] border px-3.5 py-3 transition ${selected.kind === option.kind ? 'border-[#d8afbe] bg-[#faeef3] shadow-[0_8px_26px_rgba(139,91,112,.10)]' : 'border-[#ece7eb] bg-white hover:bg-[#fcfafb]'}`}
            >
              <p className="text-[12px] font-semibold leading-5 text-[#302b31]">{option.label}</p>
              <p className="mt-1 text-[10px] leading-4 text-[#7b737c]">{option.note}</p>
            </Link>
          ))}
        </section>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <section className="overflow-hidden rounded-[30px] border border-[#e8e1e6] bg-white p-3 shadow-[0_20px_54px_rgba(62,48,66,.10)] sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#987f94]">Generated now</p>
                <h2 className="glow-display mt-1 text-[26px] text-[#2a252b]">{selected.label}</h2>
                <p className="mt-1 text-[11px] text-[#827983]">{today}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={src} target="_blank" rel="noreferrer" className="rounded-full bg-[#2b272c] px-4 py-2.5 text-[11px] font-medium text-white">Open full-size</a>
                <a href={`${src}&download=1`} download className="rounded-full border border-[#dfd8de] bg-white px-4 py-2.5 text-[11px] font-medium text-[#4f484f]">Save image</a>
              </div>
            </div>

            <div className="rounded-[24px] bg-[linear-gradient(145deg,#faf3f8,#edf5f6_58%,#f7f0e8)] p-3 sm:p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${selected.label} generated Glow card`}
                className="mx-auto block h-auto w-full max-w-[620px] rounded-[22px] bg-white shadow-[0_18px_55px_rgba(68,54,72,.14)]"
              />
            </div>
          </section>

          <Card className="overflow-hidden border-[#e9e4e8] bg-white p-0 shadow-[0_12px_36px_rgba(66,52,68,.06)]">
            <div className="border-b border-[#eee9ed] bg-[#fcfafb] px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#9a8797]">Checklist source</p>
              <h2 className="mt-1 text-[15px] font-semibold text-[#302b31]">What this card is using</h2>
            </div>
            <div className="max-h-[650px] space-y-2 overflow-y-auto p-4">
              {items.map((item, index) => (
                <div key={`${index}-${item}`} className="flex items-start gap-3 rounded-[13px] border border-[#eee9ed] bg-white px-3 py-3">
                  <span className="mt-[2px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#d9c4d1] bg-[#fbf4f8] text-[9px] font-semibold text-[#866b7e]">{index + 1}</span>
                  <p className="text-[11px] leading-5 text-[#514a52]">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
