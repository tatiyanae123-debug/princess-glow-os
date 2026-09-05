import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { BeautyRoutineManager } from '@/components/beauty/beauty-routine-manager';
import { Card } from '@/components/ui/card';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getBeautyProducts } from '@/lib/data/completion-v1';
import { CalendarDays, Camera, Clock3, FlaskConical, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

const beautyKeywords = [
  'beauty', 'facial', 'skin', 'skincare', 'brow', 'brows', 'lash', 'lashes', 'nail', 'nails',
  'manicure', 'pedicure', 'wax', 'laser', 'derm', 'dermatology', 'esthetic', 'spa', 'makeup',
];

const BEAUTY_DESTINATIONS = [
  { label: 'Beauty Home', detail: 'Your command center', href: '/beauty' },
  { label: 'Makeup', detail: 'Looks · products · application', href: '/beauty/lab' },
  { label: 'Skincare', detail: 'Treatment Lab · inventory · progress', href: '/beauty/skincare' },
  { label: 'Wash Up', detail: 'Shower · hygiene · getting ready', href: '/routines' },
  { label: 'Facial Massage', detail: 'Gua sha · massage · movement', href: '/beauty/lab?view=facial-massage' },
  { label: 'Hair', detail: 'Care · wash · styling · maintenance', href: '/hair' },
  { label: 'Body Care', detail: 'Skin · hydration · sun · sweat', href: '/beauty/skincare?view=body-skin' },
  { label: 'Fragrance', detail: 'Scent wardrobe · layering · wear', href: '/beauty?studio=fragrance' },
  { label: 'Closet', detail: 'Wardrobe · outfits · ownership', href: '/closet' },
  { label: 'Fashion', detail: 'Style · expression · looks', href: '/closet?view=fashion' },
] as const;

function isBeautyEvent(title: string, description: string | null) {
  const haystack = `${title} ${description ?? ''}`.toLowerCase();
  return beautyKeywords.some((keyword) => haystack.includes(keyword));
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

export default async function BeautyPage({ searchParams }: { searchParams: Promise<{ studio?: string }> }) {
  const params = await searchParams;
  if (params.studio === 'skincare') redirect('/beauty/skincare');

  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [routines, events, products] = await Promise.all([
    getBeautyRoutinesByUser(session.user.id),
    getCalendarEventsByUser(session.user.id),
    getBeautyProducts(session.user.id),
  ]);

  const now = new Date();
  const upcomingAppointments = events
    .filter((event) => event.startAt.getTime() >= now.getTime() && isBeautyEvent(event.title, event.description))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .slice(0, 4);

  const expiringProducts = products
    .filter((product) => product.expiresAt && product.expiresAt.getTime() <= now.getTime() + 45 * 86400000)
    .sort((a, b) => (a.expiresAt?.getTime() ?? 0) - (b.expiresAt?.getTime() ?? 0));

  const reactionNotes = products
    .filter((product) => Boolean(product.reaction?.trim()))
    .slice(0, 4);

  const morningCount = routines.filter((routine) => routine.timeOfDay === 'morning').length;
  const eveningCount = routines.filter((routine) => routine.timeOfDay === 'evening' || routine.timeOfDay === 'night').length;
  const maintenanceCount = expiringProducts.length + products.filter((product) => product.repurchase === 'yes').length;

  return (
    <AppShell>
      <SectionPage eyebrow="Beauty" title="Your personal beauty world" description="Enter Beauty directly from the main Glow Current or through Life. Both paths open this same connected system and keep the same routines, inventory, history, and Glow context.">
        <div className="space-y-5">
          <section aria-label="Beauty rooms" className="rounded-[28px] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,.7),rgba(239,237,245,.46),rgba(247,238,232,.54))] p-4 shadow-[0_18px_50px_rgba(86,77,88,.08)] backdrop-blur-2xl sm:p-5">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="glow-eyebrow">Beauty · connected region</p>
                <h2 className="glow-display mt-1 text-[22px] text-[#493733]">Choose the room that matches what you are doing</h2>
              </div>
              <p className="max-w-md text-[8px] leading-4 text-[#806a64]">Beauty stays reachable from both the primary world navigation and Life. These are thresholds into one shared Beauty system, not duplicated apps.</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {BEAUTY_DESTINATIONS.map((destination) => (
                <Link key={destination.label} href={destination.href} className="group min-w-[150px] flex-1 rounded-[20px] border border-white/80 bg-white/38 px-4 py-4 shadow-[inset_0_1px_rgba(255,255,255,.9),0_8px_24px_rgba(80,72,80,.05)] transition hover:-translate-y-0.5 hover:bg-white/55">
                  <span className="mb-4 block h-7 w-7 rounded-full border border-white/90 bg-[radial-gradient(circle_at_32%_28%,#fff_0_12%,rgba(255,255,255,.55)_22%,rgba(218,226,255,.42)_48%,rgba(247,218,236,.25)_72%,rgba(255,255,255,.45))] shadow-[0_6px_16px_rgba(92,84,98,.12)]" />
                  <strong className="block text-[11px] font-medium text-[#443b3b]">{destination.label}</strong>
                  <small className="mt-1 block text-[7px] leading-3 text-[#8b7d79]">{destination.detail}</small>
                </Link>
              ))}
            </div>
          </section>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#f6e7e4,#f2ddd6)]">
              <Sparkles size={34} strokeWidth={0.8} className="absolute right-4 top-3 text-[#a66c75]/20" />
              <p className="glow-eyebrow">Daily ritual</p>
              <p className="glow-display mt-2 text-[25px] text-[#4a3835]">{routines.length}</p>
              <p className="mt-1 text-[8px] text-[#8a716b]">{morningCount} morning · {eveningCount} evening/night steps</p>
            </Card>
            <Card>
              <CalendarDays size={18} strokeWidth={1} className="text-[#9b6a73]" />
              <p className="glow-eyebrow mt-3">Appointments</p>
              <p className="glow-display mt-2 text-[25px] text-[#4a3835]">{upcomingAppointments.length}</p>
              <p className="mt-1 text-[8px] text-[#8a716b]">upcoming beauty-related calendar events</p>
            </Card>
            <Card>
              <Camera size={18} strokeWidth={1} className="text-[#9b6a73]" />
              <p className="glow-eyebrow mt-3">Response journal</p>
              <p className="glow-display mt-2 text-[25px] text-[#4a3835]">{reactionNotes.length}</p>
              <p className="mt-1 text-[8px] text-[#8a716b]">recent product response notes to compare over time</p>
            </Card>
            <Card>
              <Clock3 size={18} strokeWidth={1} className="text-[#9b6a73]" />
              <p className="glow-eyebrow mt-3">Maintenance</p>
              <p className="glow-display mt-2 text-[25px] text-[#4a3835]">{maintenanceCount}</p>
              <p className="mt-1 text-[8px] text-[#8a716b]">expiring or repurchase items needing attention</p>
            </Card>
          </div>

          <Card className="relative overflow-hidden border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,.78),rgba(235,241,249,.58))]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="glow-eyebrow">Skincare · Treatment Lab</p>
                <h2 className="glow-display mt-1 text-[20px] text-[#493733]">Inventory-driven skin intelligence</h2>
                <p className="mt-2 max-w-2xl text-[8px] leading-4 text-[#806a64]">Open the Treatment Lab where ownership, current routine, testing, compatibility, provider rules, and personal results stay separate and connected.</p>
              </div>
              <Link href="/beauty/skincare" className="rounded-full border border-white/80 bg-white/55 px-4 py-2.5 text-[8px] text-[#5f5550] shadow-[0_10px_25px_rgba(87,78,73,.08)]">Open Treatment Lab</Link>
            </div>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-[#eaded8] px-5 py-4">
                <div>
                  <p className="glow-eyebrow">Beauty calendar</p>
                  <h2 className="glow-display mt-1 text-[19px] text-[#493733]">Upcoming appointments</h2>
                </div>
                <Link href="/calendar" className="rounded-[6px] border border-[#dfd0c9] px-3 py-2 text-[8px] text-[#765e58]">Open calendar</Link>
              </div>
              {upcomingAppointments.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-[9px] text-[#87716a]">No upcoming beauty appointments found.</p>
                  <Link href="/calendar" className="mt-3 inline-block rounded-[6px] bg-[#4b3834] px-3 py-2 text-[8px] text-white">Schedule one</Link>
                </div>
              ) : (
                <div className="divide-y divide-[#eee2dc]">
                  {upcomingAppointments.map((event) => (
                    <div key={event.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="min-w-12 rounded-[8px] bg-[#f4e5e2] px-3 py-2 text-center">
                        <p className="glow-display text-[13px] text-[#6f5052]">{dayLabel(event.startAt)}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="glow-display text-[14px] text-[#4b3935]">{event.title}</p>
                        <p className="mt-1 text-[8px] text-[#8b746d]">{event.allDay ? 'All day' : event.startAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}{event.location ? ` · ${event.location}` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-0 overflow-hidden">
              <div className="border-b border-[#eaded8] px-5 py-4">
                <p className="glow-eyebrow">Maintenance forecast</p>
                <h2 className="glow-display mt-1 text-[19px] text-[#493733]">What needs attention next</h2>
              </div>
              <div className="space-y-3 p-5">
                {expiringProducts.slice(0, 3).map((product) => (
                  <div key={product.id} className="rounded-[8px] bg-[#fbf3ef] p-3">
                    <p className="text-[8px] uppercase tracking-[.1em] text-[#9d7d78]">Expiration watch</p>
                    <p className="glow-display mt-1 text-[14px] text-[#4c3935]">{product.name}</p>
                    <p className="mt-1 text-[8px] text-[#806a64]">{product.expiresAt ? `Due ${dayLabel(product.expiresAt)}` : 'Review date'}</p>
                  </div>
                ))}
                {products.filter((product) => product.repurchase === 'yes').slice(0, 2).map((product) => (
                  <div key={`repurchase-${product.id}`} className="rounded-[8px] bg-[#f5ece9] p-3">
                    <p className="text-[8px] uppercase tracking-[.1em] text-[#9d7d78]">Repurchase</p>
                    <p className="glow-display mt-1 text-[14px] text-[#4c3935]">{product.name}</p>
                  </div>
                ))}
                {maintenanceCount === 0 ? <p className="py-4 text-center text-[9px] text-[#8b746e]">Nothing urgent. Your cabinet is currently clear.</p> : null}
                <Link href="/beauty/lab" className="inline-flex items-center gap-2 rounded-[6px] border border-[#dfd0c9] px-3 py-2 text-[8px] text-[#765e58]"><FlaskConical size={11} />Open Beauty Lab</Link>
              </div>
            </Card>
          </div>

          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[#eaded8] px-5 py-4">
              <div>
                <p className="glow-eyebrow">Progress journal</p>
                <h2 className="glow-display mt-1 text-[19px] text-[#493733]">Compare what your skin is telling you</h2>
              </div>
              <Link href="/beauty/lab" className="rounded-[6px] border border-[#dfd0c9] px-3 py-2 text-[8px] text-[#765e58]">Log response</Link>
            </div>
            {reactionNotes.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-[9px] text-[#87716a]">No response notes yet. Add reactions in Beauty Lab so Glow can build a useful progress history.</p>
              </div>
            ) : (
              <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-4">
                {reactionNotes.map((product) => (
                  <div key={product.id} className="border-b border-r border-[#eee2dc] p-4">
                    <div className="mb-3 h-20 rounded-[8px] bg-[linear-gradient(145deg,#ead3ca,#f5e9e3)] p-3">
                      <Camera size={18} strokeWidth={0.9} className="text-[#9d7378]/70" />
                    </div>
                    <p className="glow-display text-[14px] text-[#4b3935]">{product.name}</p>
                    <p className="mt-2 line-clamp-3 text-[8px] leading-4 text-[#806a64]">{product.reaction}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div>
            <div className="mb-3">
              <p className="glow-eyebrow">Ritual editor</p>
              <h2 className="glow-display mt-1 text-[22px] text-[#493733]">Morning + evening routine</h2>
            </div>
            <BeautyRoutineManager initialRoutines={routines} />
          </div>
        </div>
      </SectionPage>
    </AppShell>
  );
}
