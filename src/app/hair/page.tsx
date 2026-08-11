import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createHairLogAction } from '@/app/actions/completion-v1';
import { getHairLogs, getTimelineEvents } from '@/lib/data/completion-v1';
import { CalendarDays, Camera, Droplets, PackageOpen, Scissors, Sparkles, ThermometerSun, Waves } from 'lucide-react';

export const dynamic = 'force-dynamic';

type HairView = 'ritual' | 'calendar' | 'shelf' | 'journey';
type HairPageProps = { searchParams?: Promise<{ view?: string }> };

const fieldClass = 'w-full border px-4 py-3 text-[10px]';
const dayMs = 86400000;

function isWash(eventType: string) {
  return /wash|shampoo|clarif|cleanse/i.test(eventType);
}

function isTreatment(eventType: string) {
  return /treat|mask|bond|protein|deep condition|scalp|oil/i.test(eventType);
}

function averageInterval(dates: Date[], fallbackDays: number) {
  if (dates.length < 2) return fallbackDays;
  const intervals = dates.slice(0, 6).map((date, index) => index < dates.length - 1 ? Math.max(1, Math.round((date.getTime() - dates[index + 1].getTime()) / dayMs)) : null).filter((value): value is number => value != null);
  if (!intervals.length) return fallbackDays;
  return Math.max(1, Math.round(intervals.reduce((sum, value) => sum + value, 0) / intervals.length));
}

function addDays(date: Date | undefined, days: number) {
  const next = new Date(date ?? new Date());
  next.setDate(next.getDate() + days);
  return next;
}

function formatForecast(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default async function HairPage({ searchParams }: HairPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const params = searchParams ? await searchParams : undefined;
  const requestedView = params?.view;
  const view: HairView = requestedView === 'calendar' || requestedView === 'shelf' || requestedView === 'journey' ? requestedView : 'ritual';
  const [logs, timeline] = await Promise.all([getHairLogs(session.user.id), getTimelineEvents(session.user.id)]);
  const last = logs[0] ?? null;
  const washLogs = logs.filter((log) => isWash(log.eventType));
  const treatmentLogs = logs.filter((log) => isTreatment(log.eventType));
  const washInterval = averageInterval(washLogs.map((log) => log.occurredAt), 7);
  const treatmentInterval = averageInterval(treatmentLogs.map((log) => log.occurredAt), 14);
  const nextWash = addDays(washLogs[0]?.occurredAt, washInterval);
  const nextTreatment = addDays(treatmentLogs[0]?.occurredAt, treatmentInterval);
  const heatCount30 = logs.filter((log) => log.heatUsed && Date.now() - log.occurredAt.getTime() <= 30 * dayMs).length;
  const productCounts = new Map<string, number>();
  logs.forEach((log) => log.products?.split(/[,;+]/).map((item) => item.trim()).filter(Boolean).forEach((product) => productCounts.set(product, (productCounts.get(product) ?? 0) + 1)));
  const shelf = Array.from(productCounts.entries()).sort((a, b) => b[1] - a[1]);
  const photoJourney = timeline.filter((event) => event.imageUrl && (/hair/i.test(event.category) || /hair/i.test(event.title) || event.relatedEntityType === 'hair'));
  const forecastReason = washLogs.length >= 2 ? `Based on your last ${Math.min(washLogs.length, 6)} wash entries, your current wash rhythm averages about every ${washInterval} days.` : 'Glow will learn your personal wash rhythm as you add more wash days.';

  return <AppShell><SectionPage eyebrow="Hair Intelligence" title="Run your hair care like a living maintenance calendar" description="Track wash days, treatments, products, heat, results, photo progress, and forecasts so the next hair action stays visible before maintenance becomes overdue.">
    <section className="grid gap-3 md:grid-cols-[1.25fr_.75fr]">
      <Card className="relative min-h-[190px] overflow-hidden bg-[linear-gradient(145deg,#efe0d8,#dcc2b7)] p-5"><Waves size={72} strokeWidth={.7} className="absolute right-7 top-1/2 -translate-y-1/2 text-[#8f665d]/18"/><div className="relative max-w-[68%]"><p className="glow-eyebrow">Maintenance studio</p><h2 className="glow-display mt-2 text-[27px] leading-8 text-[#493733]">{last?.nextAction ?? 'Plan the next hair ritual'}</h2><p className="mt-3 text-[9px] leading-4 text-[#795f58]">{last ? `Last logged: ${last.eventType} on ${last.occurredAt.toLocaleDateString()}.` : 'Start with your next wash, treatment, trim, or protective-style maintenance entry.'}</p></div></Card>
      <Card className="bg-[linear-gradient(145deg,#f7efeb,#eee2db)] p-5"><p className="glow-display text-[17px] text-[#493733]">Forecast snapshot</p><div className="mt-4 space-y-3 text-[9px] text-[#765f59]"><div className="flex items-center justify-between"><span className="flex items-center gap-1"><Droplets size={11}/>Next wash</span><strong>{formatForecast(nextWash)}</strong></div><div className="flex items-center justify-between"><span className="flex items-center gap-1"><Sparkles size={11}/>Next treatment</span><strong>{formatForecast(nextTreatment)}</strong></div><div className="flex items-center justify-between"><span className="flex items-center gap-1"><ThermometerSun size={11}/>Heat / 30 days</span><strong>{heatCount30}</strong></div><div className="flex items-center justify-between"><span>Timeline entries</span><strong>{logs.length}</strong></div></div></Card>
    </section>

    <nav className="mt-4 flex flex-wrap gap-2" aria-label="Hair workspace views">
      {([
        ['ritual', 'Ritual + history', Waves],
        ['calendar', 'Wash + treatment calendar', CalendarDays],
        ['shelf', 'Product shelf', PackageOpen],
        ['journey', 'Photo journey', Camera],
      ] as const).map(([key, label, Icon]) => <Link key={key} href={`/hair?view=${key}`} className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[8px] font-medium transition ${view === key ? 'border-[#b69186] bg-[#f0dfd8] text-[#654a44]' : 'border-[#e3d6d0] bg-white/65 text-[#846e67] hover:bg-white'}`}><Icon size={11}/>{label}</Link>)}
    </nav>

    {view === 'ritual' ? <div className="mt-4 grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
      <Card className="paper-card"><form action={createHairLogAction} className="space-y-3"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#a6766e]"/><h2 className="glow-display text-[20px] text-[#493733]">Log hair care</h2></div><p className="text-[8px] leading-4 text-[#8b746d]">Use clear event names such as Wash day, Bond treatment, Scalp care, Trim, Protective style, or Silk press so forecasts can understand your rhythm.</p><input name="eventType" required placeholder="Wash day, bond treatment, trim…" className={fieldClass}/><input name="occurredAt" type="datetime-local" className={fieldClass}/><input name="style" placeholder="Style" className={fieldClass}/><input name="products" placeholder="Products used, separated by commas" className={fieldClass}/><label className="flex items-center gap-2 text-[9px] text-[#725d56]"><input name="heatUsed" type="checkbox"/>Heat used</label><textarea name="notes" rows={3} placeholder="Buildup, breakage, scalp, shedding, moisture, result" className={fieldClass}/><input name="nextAction" placeholder="Next required action" className={fieldClass}/><button className="rounded-[6px] bg-[#43322e] px-4 py-2 text-[9px] font-medium text-white">Save hair log</button></form></Card>
      <Card className="overflow-hidden p-0"><div className="border-b border-[#e7dad2] px-5 py-4"><p className="glow-eyebrow">History</p><h2 className="glow-display mt-1 text-[19px] text-[#493733]">Hair timeline</h2></div>{logs.length === 0 ? <div className="p-8 text-center"><p className="text-[9px] text-[#8d756e]">No hair care logged yet.</p><p className="mt-2 text-[8px] text-[#a08a83]">Log your next wash or treatment to start the maintenance timeline and unlock personalized forecasts.</p></div> : <div className="divide-y divide-[#ede2dc]">{logs.map((log, index) => <div key={log.id} className={`grid gap-3 px-5 py-4 sm:grid-cols-[48px_1fr_auto] ${index === 0 ? 'bg-[#f8ece7]/65' : ''}`}><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ead8cf] text-[#8d685f]"><Waves size={15}/></div><div><div className="flex flex-wrap items-center gap-2"><p className="glow-display text-[14px] text-[#4c3b36]">{log.eventType}</p><span className="text-[7px] text-[#9a837c]">{log.occurredAt.toLocaleDateString()}</span></div>{log.style ? <p className="mt-1 text-[8px] text-[#837069]">Style: {log.style}</p> : null}{log.products ? <p className="mt-1 text-[8px] text-[#837069]">Products: {log.products}</p> : null}{log.notes ? <p className="mt-2 text-[8px] leading-4 text-[#715d57]">{log.notes}</p> : null}{log.nextAction ? <p className="mt-2 rounded-[5px] bg-[#f1e3de] px-2.5 py-2 text-[8px] font-medium text-[#79524f]">Next: {log.nextAction}</p> : null}</div><span className={`self-start rounded-full px-2 py-1 text-[7px] ${log.heatUsed ? 'bg-[#f0d9ce] text-[#8b5c50]' : 'bg-[#eee7e3] text-[#7f6d67]'}`}>{log.heatUsed ? 'heat' : 'no heat'}</span></div>)}</div>}</Card>
    </div> : null}

    {view === 'calendar' ? <div className="mt-4 grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
      <Card className="paper-card"><p className="glow-eyebrow">Predictive maintenance</p><h2 className="glow-display mt-2 text-[21px] text-[#493733]">Your next ritual dates</h2><p className="mt-3 text-[8px] leading-4 text-[#7f6861]">{forecastReason}</p><div className="mt-5 space-y-3"><div className="rounded-[10px] bg-[#f2e4df] p-4"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[9px] text-[#70554e]"><Droplets size={13}/>Wash forecast</span><strong className="glow-display text-[18px] text-[#4f3b36]">{formatForecast(nextWash)}</strong></div><p className="mt-2 text-[8px] text-[#8d746d]">Current rhythm: about every {washInterval} days.</p></div><div className="rounded-[10px] bg-[#eee7e1] p-4"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-[9px] text-[#705f58]"><Sparkles size={13}/>Treatment forecast</span><strong className="glow-display text-[18px] text-[#4f433e]">{formatForecast(nextTreatment)}</strong></div><p className="mt-2 text-[8px] text-[#8d7b74]">Current rhythm: about every {treatmentInterval} days.</p></div></div></Card>
      <Card className="overflow-hidden p-0"><div className="border-b border-[#e7dad2] px-5 py-4"><p className="glow-eyebrow">Wash + treatment calendar</p><h2 className="glow-display mt-1 text-[19px] text-[#493733]">Recent maintenance cadence</h2></div>{washLogs.length + treatmentLogs.length === 0 ? <div className="p-8 text-center"><p className="text-[9px] text-[#8d756e]">No wash or treatment entries yet.</p><Link href="/hair?view=ritual" className="mt-3 inline-flex text-[8px] font-medium text-[#77544c]">Log the first ritual →</Link></div> : <div className="divide-y divide-[#ede2dc]">{logs.filter((log) => isWash(log.eventType) || isTreatment(log.eventType)).slice(0, 18).map((log) => <div key={log.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0e1dc] text-[#8a665e]">{isWash(log.eventType) ? <Droplets size={14}/> : <Sparkles size={14}/>}</span><div><p className="glow-display text-[14px] text-[#4d3c37]">{log.eventType}</p><p className="mt-1 text-[8px] text-[#8d766f]">{log.style || log.products || 'Maintenance entry'}</p></div></div><time className="text-[8px] text-[#927c75]">{log.occurredAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</time></div>)}</div>}</Card>
    </div> : null}

    {view === 'shelf' ? <div className="mt-4"><div className="mb-4 grid gap-3 sm:grid-cols-3"><Card className="p-4"><p className="text-[7px] uppercase tracking-[.14em] text-[#967f77]">Products tracked</p><p className="glow-display mt-1 text-[24px] text-[#4d3b36]">{shelf.length}</p></Card><Card className="p-4"><p className="text-[7px] uppercase tracking-[.14em] text-[#967f77]">Product mentions</p><p className="glow-display mt-1 text-[24px] text-[#4d3b36]">{shelf.reduce((sum, item) => sum + item[1], 0)}</p></Card><Card className="p-4"><p className="text-[7px] uppercase tracking-[.14em] text-[#967f77]">Most used</p><p className="glow-display mt-1 text-[16px] text-[#4d3b36]">{shelf[0]?.[0] ?? '—'}</p></Card></div>{shelf.length === 0 ? <Card className="paper-card text-center"><PackageOpen size={24} className="mx-auto text-[#a4867d]"/><p className="mt-3 text-[9px] text-[#826d66]">Your product shelf builds automatically from products entered in hair logs.</p><Link href="/hair?view=ritual" className="mt-3 inline-flex text-[8px] font-medium text-[#77544c]">Log products used →</Link></Card> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{shelf.map(([product, count], index) => <Card key={product} className="paper-card"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#efe3dd] text-[#8d6c63]"><PackageOpen size={14}/></span><span className="text-[7px] uppercase tracking-[.14em] text-[#9b857e]">#{String(index + 1).padStart(2, '0')}</span></div><h2 className="glow-display mt-4 text-[18px] text-[#4a3934]">{product}</h2><p className="mt-2 text-[8px] text-[#846f68]">Used in {count} logged hair {count === 1 ? 'ritual' : 'rituals'}.</p><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#eee3df]"><div className="h-full rounded-full bg-[#b89489]" style={{ width: `${Math.max(12, Math.round((count / Math.max(1, shelf[0][1])) * 100))}%` }}/></div></Card>)}</div>}</div> : null}

    {view === 'journey' ? <div className="mt-4 grid gap-4 lg:grid-cols-[.72fr_1.28fr]">
      <Card className="paper-card"><Camera size={22} className="text-[#9a7469]"/><p className="glow-eyebrow mt-4">Visual progress</p><h2 className="glow-display mt-2 text-[21px] text-[#493733]">Hair photo journey</h2><p className="mt-3 text-[8px] leading-4 text-[#7e6861]">Glow pulls hair-related images already captured in your Life Timeline into one visual journey. Use consistent lighting and angles when adding future hair memories for easier comparison.</p><Link href="/timeline" className="mt-5 inline-flex items-center gap-2 rounded-[6px] bg-[#493733] px-4 py-2 text-[8px] font-medium text-white"><Camera size={11}/>Open Life Timeline</Link></Card>
      <Card className="overflow-hidden p-0"><div className="border-b border-[#e7dad2] px-5 py-4"><p className="glow-eyebrow">Photo archive</p><h2 className="glow-display mt-1 text-[19px] text-[#493733]">Growth, styles + condition</h2></div>{photoJourney.length === 0 ? <div className="p-8 text-center"><p className="text-[9px] text-[#8d756e]">No hair photos are connected yet.</p><p className="mt-2 text-[8px] text-[#a08a83]">Add a hair-related image to Life Timeline and it will appear here automatically.</p></div> : <div className="grid gap-3 p-4 sm:grid-cols-2">{photoJourney.slice(0, 12).map((event) => <article key={event.id} className="overflow-hidden rounded-[10px] border border-[#eadfd9] bg-white/55"><div className="aspect-[4/3] overflow-hidden bg-[#eee3de]"><img src={event.imageUrl!} alt={event.title} className="h-full w-full object-cover"/></div><div className="p-3"><div className="flex items-center justify-between gap-2"><h3 className="glow-display text-[14px] text-[#4d3b36]">{event.title}</h3><span className="text-[7px] text-[#988179]">{event.occurredAt.toLocaleDateString()}</span></div>{event.summary ? <p className="mt-2 text-[8px] leading-4 text-[#7c6861]">{event.summary}</p> : null}</div></article>)}</div>}</Card>
    </div> : null}
  </SectionPage></AppShell>;
}
