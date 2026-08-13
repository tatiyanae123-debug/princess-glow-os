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
        <div className="mx-auto max-w-4xl rounded-[20px] border border-[#F1E7E3] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#2B2420]">Maintenance Forecasts need intelligence activation.</p>
          <Link href="/settings/intelligence" className="mt-3 inline-block text-[12px] font-medium text-[#C9727E]">
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
          <div className="flex items-center gap-2 text-[#C9727E]">
            <CalendarClock size={17} />
            <p className="text-[11px] font-semibold uppercase tracking-[.16em]">Preventive care</p>
          </div>
          <h1 className="glow-display mt-2 text-[38px] leading-none text-[#2B2420] sm:text-[42px]">Maintenance Forecasts</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#8A8078]">
            Glow continuously refreshes product and care signals, keeps one current forecast per source, and clears stale generated warnings so maintenance stays useful instead of duplicating itself.
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[16px] border border-[#F1E7E3] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Active forecasts</p>
            <p className="glow-display mt-1 text-[25px] text-[#2B2420]">{sorted.length}</p>
          </div>
          <div className="rounded-[16px] border border-[#F1E7E3] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Needs attention</p>
            <p className="glow-display mt-1 text-[25px] text-[#2B2420]">{urgentCount + dueSoonCount}</p>
            <p className="mt-1 text-[10.5px] text-[#B5ACA5]">{urgentCount} urgent · {dueSoonCount} soon</p>
          </div>
          <div className="rounded-[16px] border border-[#F1E7E3] bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Life areas watched</p>
            <p className="glow-display mt-1 text-[25px] text-[#2B2420]">{domains}</p>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {sorted.length ? (
            sorted.map((item) => (
              <article
                key={item.id}
                className={`rounded-[18px] border p-4 ${
                  item.urgency === 'high'
                    ? 'border-[#F1E0D9] bg-[#FDF3F2]'
                    : item.urgency === 'soon'
                      ? 'border-[#F1E8D9] bg-[#FDF6F1]'
                      : 'border-[#F1E7E3] bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">{item.domain}</span>
                  <span className="text-[10px] uppercase text-[#B5ACA5]">
                    {item.dueAt ? item.dueAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : item.urgency}
                  </span>
                </div>
                <h2 className="glow-display mt-2 text-[18px] text-[#2B2420]">{item.title}</h2>
                {item.recommendation ? <p className="mt-2 text-[11.5px] leading-4 text-[#8A8078]">{item.recommendation}</p> : null}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <form action={updateMaintenanceForecastStatus}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="resolved" />
                    <button className="inline-flex items-center gap-1.5 rounded-full bg-[#2B2420] px-3.5 py-2 text-[11px] font-medium text-white" type="submit">
                      <CheckCircle2 size={13} /> Done
                    </button>
                  </form>
                  <form action={updateMaintenanceForecastStatus}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="status" value="dismissed" />
                    <button className="rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#8A8078] hover:bg-[#FDF8F6]" type="submit">
                      Dismiss
                    </button>
                  </form>
                  {item.domain === 'beauty' ? (
                    <Link href="/beauty/lab" className="text-[11px] font-medium text-[#C9727E]">Open Beauty Lab →</Link>
                  ) : item.domain === 'hair' ? (
                    <Link href="/hair" className="text-[11px] font-medium text-[#C9727E]">Open Hair →</Link>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full rounded-[20px] border border-[#E4EBDD] bg-[#F3F6F0] p-8 text-center">
              <Sparkles size={20} className="mx-auto text-[#5A6E52]" />
              <p className="glow-display mt-2 text-[20px] text-[#2B2420]">Nothing is approaching maintenance yet.</p>
              <p className="mx-auto mt-2 max-w-md text-[11.5px] leading-4 text-[#8A8078]">Keep product dates and hair next actions current. Glow will surface the next preventive-care signal here automatically.</p>
              <Link href="/beauty/lab" className="mt-3 inline-block text-[11px] font-medium text-[#5A6E52]">Review Beauty Lab →</Link>
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-2">
          <Link href="/beauty/lab" className="rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#8A8078] hover:bg-[#FDF8F6]">Beauty Lab</Link>
          <Link href="/hair" className="rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#8A8078] hover:bg-[#FDF8F6]">Hair Studio</Link>
          <Link href="/calendar" className="rounded-full bg-[#2B2420] px-3.5 py-2 text-[11px] text-white">Schedule maintenance</Link>
        </div>
      </div>
    </AppShell>
  );
}
