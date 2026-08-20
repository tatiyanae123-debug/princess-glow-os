import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
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
  const imageSrc = `/api/glow/cards?kind=${encodeURIComponent(selected.kind)}`;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <AppShell>
      <div className="relative isolate mx-auto w-full max-w-[1180px] space-y-5 bg-white pb-24 text-[#2a252b] opacity-100 [filter:none]">
        <header className="rounded-[26px] border border-[#eadfe6] bg-white px-5 py-5 shadow-[0_12px_34px_rgba(62,48,66,.08)] sm:px-7 sm:py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#8d7487]">Glow visual engine</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="glow-display text-[38px] leading-none text-[#201d21] sm:text-[46px]">Glow Cards</h1>
              <p className="mt-3 max-w-[720px] text-[13px] leading-6 text-[#625b63]">Choose a visual below. The preview is rendered directly in Glow OS so it stays readable and responsive on iPad, then you can open or save the generated image version.</p>
            </div>
            <Link href="/routines" className="rounded-full border border-[#ded6dc] bg-white px-4 py-2.5 text-[11px] font-semibold text-[#423c43]">Edit routines</Link>
          </div>
        </header>

        <section aria-label="Choose a Glow card" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {OPTIONS.map((option) => (
            <Link
              key={option.kind}
              href={`/glow-cards?kind=${option.kind}`}
              className={`min-h-[88px] rounded-[17px] border px-3.5 py-3 ${selected.kind === option.kind ? 'border-[#cfa8b8] bg-[#f8eaf0]' : 'border-[#e6e0e5] bg-white'}`}
            >
              <p className="text-[12px] font-semibold leading-5 text-[#2e292f]">{option.label}</p>
              <p className="mt-1 text-[10px] leading-4 text-[#716a72]">{option.note}</p>
            </Link>
          ))}
        </section>

        <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[28px] border border-[#ddd5dc] bg-white p-3 shadow-[0_18px_50px_rgba(57,45,61,.12)] sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#8e7488]">Live preview</p>
                <h2 className="glow-display mt-1 text-[27px] text-[#211e22]">{selected.label}</h2>
                <p className="mt-1 text-[11px] text-[#726b73]">{today}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={imageSrc} target="_blank" rel="noreferrer" className="rounded-full bg-[#252126] px-4 py-2.5 text-[11px] font-semibold text-white">Open full-size</a>
                <a href={`${imageSrc}&download=1`} download className="rounded-full border border-[#d9d1d8] bg-white px-4 py-2.5 text-[11px] font-semibold text-[#423c43]">Save image</a>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[680px] overflow-hidden rounded-[26px] border border-[#eee7ec] bg-[linear-gradient(145deg,#fff9fc_0%,#f5edf4_42%,#eef5f6_72%,#f8f1ea_100%)] px-5 py-7 shadow-inner sm:px-8 sm:py-9">
              <div className="mb-6 border-b border-white/90 pb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#846d80]">Glow OS</p>
                <h3 className="glow-display mt-2 text-[34px] leading-tight text-[#242025] sm:text-[40px]">{selected.label}</h3>
                <p className="mt-1 text-[12px] text-[#716873]">{today}</p>
              </div>
              <div className="space-y-2.5">
                {items.map((item, index) => (
                  <div key={`${index}-${item}`} className="flex items-start gap-3 rounded-[14px] border border-white/90 bg-white/78 px-3.5 py-3 shadow-[0_4px_16px_rgba(79,61,82,.05)]">
                    <span className="mt-[1px] flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#cdb6c4] bg-[#fbf3f7] text-[10px] font-bold text-[#775f70]">✓</span>
                    <p className="text-[12px] leading-5 text-[#39343a]">{item}</p>
                  </div>
                ))}
              </div>
              <p className="glow-display mt-7 text-[18px] italic text-[#695f6b]">Calm is success. Consistency is the glow.</p>
            </div>
          </div>

          <aside className="rounded-[22px] border border-[#e2dbe1] bg-white p-4 shadow-[0_10px_30px_rgba(60,48,64,.07)]">
            <p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#8f7d8d]">Card details</p>
            <h2 className="mt-1 text-[15px] font-semibold text-[#2f2a30]">What this visual contains</h2>
            <p className="mt-2 text-[11px] leading-5 text-[#6b646c]">{items.length} checklist items pulled from your current Glow routine or fitness source of truth.</p>
            <div className="mt-4 space-y-2">
              {items.map((item, index) => (
                <div key={`detail-${index}-${item}`} className="rounded-[12px] border border-[#eee8ed] bg-[#fcfafb] px-3 py-2.5 text-[11px] leading-5 text-[#4f4950]">
                  <span className="mr-2 font-semibold text-[#8b7184]">{index + 1}.</span>{item}
                </div>
              ))}
            </div>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
