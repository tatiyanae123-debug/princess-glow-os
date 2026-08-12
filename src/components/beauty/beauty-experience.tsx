import Link from 'next/link';
import { CalendarClock, CheckCircle2, Flame, Heart, MoonStar, Sparkles, SunMedium } from 'lucide-react';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import type { BeautyRoutine } from '@/lib/types';

type BeautyProductLite = { id: string; name: string; category: string; repurchase: string | null; expiresAt: Date | null };
type EventLite = { id: string; title: string; startAt: Date; location: string | null };

function dayLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function BeautyExperience({
  routines,
  products,
  upcomingAppointments,
}: {
  routines: BeautyRoutine[];
  products: BeautyProductLite[];
  upcomingAppointments: EventLite[];
}) {
  const am = routines.filter((r) => r.timeOfDay === 'morning').sort((a, b) => a.stepOrder - b.stepOrder);
  const pm = routines.filter((r) => r.timeOfDay === 'evening' || r.timeOfDay === 'night').sort((a, b) => a.stepOrder - b.stepOrder);
  const nextTreatment = upcomingAppointments[0] ?? null;
  const favorites = products.filter((product) => product.repurchase === 'yes').slice(0, 4);
  const now = new Date();
  const monthDays = Array.from({ length: 42 }, (_, index) => {
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const start = new Date(first);
    start.setDate(start.getDate() - ((first.getDay() + 6) % 7));
    return new Date(start.getTime() + index * 86400000);
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
        <div className="flex flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#C9727E]">Beauty</p>
          <h1 className="glow-display mt-2 text-[38px] leading-[1.05] text-[#2B2420] sm:text-[44px]">Glow is<br />a system.</h1>
          <p className="mt-3 max-w-md text-[13px] text-[#8A8078]">Curate your rituals. Track your glow. Become your best, every day.</p>
        </div>
        <div className="overflow-hidden rounded-[20px] border border-[#F1E7E3]">
          <EditableRoomImage slot="beauty:hero" label="Beauty hero" className="min-h-[200px] sm:min-h-[240px]" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#9A9088]"><SunMedium size={13} className="text-[#C9727E]" />AM Steps</div>
          <p className="glow-display mt-2 text-[26px] text-[#2B2420]">{am.length}</p>
        </div>
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#9A9088]"><MoonStar size={13} className="text-[#7C6B9C]" />PM Steps</div>
          <p className="glow-display mt-2 text-[26px] text-[#2B2420]">{pm.length}</p>
        </div>
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#9A9088]"><Sparkles size={13} className="text-[#C9727E]" />Products Tracked</div>
          <p className="glow-display mt-2 text-[26px] text-[#2B2420]">{products.length}</p>
        </div>
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#9A9088]"><CalendarClock size={13} className="text-[#C9727E]" />Next Treatment</div>
          <p className="glow-display mt-2 truncate text-[16px] text-[#2B2420]">{nextTreatment?.title ?? 'None scheduled'}</p>
          {nextTreatment ? <p className="text-[10.5px] text-[#9A9088]">{dayLabel(nextTreatment.startAt)}</p> : <Link href="/calendar" className="text-[10.5px] font-medium text-[#C9727E]">Schedule one</Link>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4 lg:col-span-1">
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#2B2420]"><SunMedium size={14} className="text-[#C9727E]" />AM Routine</div>
          <p className="text-[10.5px] text-[#9A9088]">Rise. Protect. Glow.</p>
          <div className="mt-3 space-y-2.5">
            {am.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">No AM steps yet.</p> : am.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <span className="min-w-0 flex-1"><span className="block text-[12px] font-medium text-[#3A332E]">{step.name}</span>{step.products?.length ? <span className="block truncate text-[10px] text-[#9A9088]">{step.products.join(', ')}</span> : null}</span>
                <CheckCircle2 size={13} className="shrink-0 text-[#C9BFB9]" />
              </div>
            ))}
          </div>
          <Link href="/beauty/lab" className="mt-3 inline-block text-[11px] font-medium text-[#C9727E]">View full routine →</Link>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4 lg:col-span-1">
          <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#2B2420]"><MoonStar size={14} className="text-[#7C6B9C]" />PM Routine</div>
          <p className="text-[10.5px] text-[#9A9088]">Reset. Restore. Replenish.</p>
          <div className="mt-3 space-y-2.5">
            {pm.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">No PM steps yet.</p> : pm.map((step) => (
              <div key={step.id} className="flex items-center gap-2">
                <span className="min-w-0 flex-1"><span className="block text-[12px] font-medium text-[#3A332E]">{step.name}</span>{step.products?.length ? <span className="block truncate text-[10px] text-[#9A9088]">{step.products.join(', ')}</span> : null}</span>
                <CheckCircle2 size={13} className="shrink-0 text-[#C9BFB9]" />
              </div>
            ))}
          </div>
          <Link href="/beauty/lab" className="mt-3 inline-block text-[11px] font-medium text-[#C9727E]">View full routine →</Link>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4 lg:col-span-1">
          <p className="text-[13px] font-medium text-[#2B2420]">Beauty Calendar</p>
          <p className="mt-1 text-[10.5px] text-[#9A9088]">{now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
          <div className="mt-2 grid grid-cols-7 gap-y-1 text-center text-[9px]">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="text-[#B5ACA5]">{d}</span>)}
            {monthDays.filter((d) => d.getMonth() === now.getMonth()).map((day) => {
              const hasEvent = upcomingAppointments.some((event) => event.startAt.toDateString() === day.toDateString());
              const isToday = day.toDateString() === now.toDateString();
              return <span key={day.toISOString()} className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full ${isToday ? 'bg-[#C9727E] text-white' : hasEvent ? 'bg-[#FBE4E8] text-[#B15A68]' : 'text-[#4A4440]'}`}>{day.getDate()}</span>;
            })}
          </div>
          {nextTreatment ? (
            <div className="mt-3 rounded-[10px] bg-[#FDFAF8] p-2.5">
              <p className="text-[10.5px] font-medium text-[#2B2420]">{nextTreatment.title}</p>
              <p className="text-[10px] text-[#9A9088]">{nextTreatment.startAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}{nextTreatment.location ? ` – ${nextTreatment.location}` : ''}</p>
            </div>
          ) : null}
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4 lg:col-span-1">
          <div className="flex items-center justify-between"><div className="flex items-center gap-1.5 text-[13px] font-medium text-[#2B2420]"><Heart size={13} className="text-[#C9727E]" />Favorite Products</div><Link href="/beauty/lab" className="text-[10.5px] font-medium text-[#C9727E]">View all</Link></div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {favorites.length === 0 ? <p className="col-span-2 text-[11.5px] text-[#9A9088]">Mark products to repurchase in Beauty Lab.</p> : favorites.map((product) => (
              <div key={product.id} className="rounded-[10px] border border-[#F1E7E3] p-2">
                <div className="h-10 rounded-[6px] bg-[linear-gradient(145deg,#F1E0D9,#EAD9CE)]" />
                <p className="mt-1.5 truncate text-[10.5px] font-medium text-[#3A332E]">{product.name}</p>
                <p className="truncate text-[9.5px] text-[#9A9088]">{product.category}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-[#FDF8F6] p-5">
        <div className="flex items-center gap-1.5"><Flame size={14} className="text-[#C9727E]" /><p className="text-[12px] font-medium text-[#2B2420]">Glow Insight</p></div>
        <p className="glow-display mt-2 text-[16px] text-[#2B2420]">Your skin thrives on consistency.</p>
        <p className="mt-1 max-w-xl text-[12px] leading-5 text-[#8A8078]">{am.length + pm.length > 0 ? `You're tracking ${am.length + pm.length} routine steps across AM and PM. Keep it up — consistency shows.` : 'Add your first routine step to start building your glow history.'}</p>
      </div>
    </div>
  );
}
