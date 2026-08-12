import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CalendarClock, CheckCircle2, Sparkles } from 'lucide-react';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { updateMaintenanceForecastStatus } from '@/app/actions/maintenance-forecasts';
import { refreshMaintenanceForecasts } from '@/lib/intelligence/maintenance-forecasts';

export const dynamic = 'force-dynamic';

export default async function MaintenancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  let forecasts;
  try {
    forecasts = await refreshMaintenanceForecasts(session.user.id);
  } catch {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl rounded-[22px] border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm font-semibold">Maintenance Forecasts need intelligence activation.</p>
          <Link href="/settings/intelligence" className="mt-3 inline-block text-xs text-amber-900">
            Activate intelligence →
          </Link>
        </div>
      </AppShell>
    );
  }

  const sorted = [...forecasts].sort(
    (a, b) => (a.dueAt?.getTime() ?? Infinity) - (b.dueAt?.getTime() ?? Infinity),
  );
  const urgentCount = sorted.filter((item) => item.urgency === 'high').length;
  const dueSoonCount = sorted.filter((item) => item.urgency === 'soon').length;
  const domains = new Set(sorted.map((item) => item.domain)).size;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-5">
        <header>
          <div className="flex items-center gap-2 text-[#a36d72]">
            <CalendarClock size={17} />
            <p className="text-[9px] font-bold uppercase tracking-[.2em]">Preventive care</p>
          </div>
          <h1 className="glow-display mt-2 text-[42px] leading-none text-[#392e2a]">Maintenance Forecasts</h1>
          <p className="mt-2 max-w-2xl text-[10px] leading-5 text-[#7e6b64]">
            Glow continuously refreshes product and care signals, keeps one current forecast per source, and clears stale generated warnings so maintenance stays useful instead of duplicating itself.
          </p>
        </header>

        <section className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-[16px] border border-[#e4d7cf] bg-white/72 p-4">
            <p className="text-[7px] font-bold uppercase tracking-[.15em] text-[#9b7771]">Active forecasts</p>
            <p className="glow-display mt-1 text-[25px] text-[#443832]">{sorted.length}</p>
          </div>
          <div className="rounded-[16px] border border-[#e4d7cf] bg-white/72 p-4">
            <p className="text-[7px] font-bold uppercase tracking-[.15em] text-[#9b7771]">Needs attention</p>
            <p className="glow-display mt-1 text-[25px] text-[#443832]">{urgentCount + dueSoonCount}</p>
            <p className="mt-1 text-[8px] text-[#8b7770]">{urgentCount} urgent · {dueSoonCount} soon</p>
          </div>
          <div className="rounded-[16px] border border-[#e4d7cf] bg-white/72 p-4">
            <p className="text-[7px] font-bold uppercase tracking-[.15em] text-[#9b7771]">Life areas watched</p>
            <p className="glow-display mt-1 text-[25px] text-[#443832]">{domains}</p>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {sorted.length ? (
            sorted.map((item) => (
              <article
                key={item.id}
                className={`rounded-[18px] border p-4 ${
                  item.urgency === 'high'
                    ? 'border-rose-200 bg-rose-50/70'
                    : item.urgency === 'soon'
                      ? 'border-amber-200 bg-amber-50/60'
                      : 'border-[#e4d7cf] bg-white/72'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[7px] font-bold uppercase tracking-[.15em] text-[#9b7771]">{item.domain}</span>
                  <span className="text-[7px] uppercase text-[#a18b84]">
                    {item.dueAt ? item.dueAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : item.urgency}
                  </span>
                </div>
                <h2 className="glow-display mt-2 text-[18px] text-[#443832]">{item.title}</h2>
                {item.recommendation ? <p className="mt-2 text-[9px] leading-4 text-[#7d6962]">{item.recommendation}</p> : null}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <form action={updateMaintenanceForecastStatus}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="resolved" />
                    <button className="inline-flex items-center gap-1 rounded-lg bg-[#40352f] px-3 py-2 text-[8px] text-white" type="submit">
                      <CheckCircle2 size={12} /> Done
                    </button>
                  </form>
                  <form action={updateMaintenanceForecastStatus}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="dismissed" />
                    <button className="rounded-lg border border-[#dfd1c9] bg-white/70 px-3 py-2 text-[8px] text-[#6d5952]" type="submit">
                      Dismiss
                    </button>
                  </form>
                  {item.domain === 'beauty' ? (
                    <Link href="/beauty/lab" className="text-[8px] font-semibold text-[#8f696c]">Open Beauty Lab →</Link>
                  ) : item.domain === 'hair' ? (
                    <Link href="/hair" className="text-[8px] font-semibold text-[#8f696c]">Open Hair →</Link>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full rounded-[20px] border border-emerald-100 bg-emerald-50/55 p-8 text-center">
              <Sparkles size={20} className="mx-auto text-emerald-700" />
              <p className="glow-display mt-2 text-[20px] text-[#3e493f]">Nothing is approaching maintenance yet.</p>
              <p className="mx-auto mt-2 max-w-md text-[9px] leading-4 text-[#667267]">Keep product dates and hair next actions current. Glow will surface the next preventive-care signal here automatically.</p>
              <Link href="/beauty/lab" className="mt-3 inline-block text-[8px] font-semibold text-emerald-800">Review Beauty Lab →</Link>
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-2">
          <Link href="/beauty/lab" className="rounded-lg border border-[#dfd1c9] bg-white/70 px-3 py-2 text-[8px] text-[#6d5952]">Beauty Lab</Link>
          <Link href="/hair" className="rounded-lg border border-[#dfd1c9] bg-white/70 px-3 py-2 text-[8px] text-[#6d5952]">Hair Studio</Link>
          <Link href="/calendar" className="rounded-lg bg-[#40352f] px-3 py-2 text-[8px] text-white">Schedule maintenance</Link>
        </div>
      </div>
    </AppShell>
  );
}
