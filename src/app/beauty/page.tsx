import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { BeautyExperience } from '@/components/beauty/beauty-experience';
import { BeautyRoutineManager } from '@/components/beauty/beauty-routine-manager';
import { Card } from '@/components/ui/card';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getBeautyProducts } from '@/lib/data/completion-v1';
import { Camera, FlaskConical } from 'lucide-react';

export const dynamic = 'force-dynamic';

const beautyKeywords = [
  'beauty', 'facial', 'skin', 'skincare', 'brow', 'brows', 'lash', 'lashes', 'nail', 'nails',
  'manicure', 'pedicure', 'wax', 'laser', 'derm', 'dermatology', 'esthetic', 'spa', 'makeup',
];

function isBeautyEvent(title: string, description: string | null) {
  const haystack = `${title} ${description ?? ''}`.toLowerCase();
  return beautyKeywords.some((keyword) => haystack.includes(keyword));
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

export default async function BeautyPage() {
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

  const maintenanceCount = expiringProducts.length + products.filter((product) => product.repurchase === 'yes').length;

  return (
    <AppShell>
      <div className="space-y-6">
        <BeautyExperience routines={routines} products={products} upcomingAppointments={upcomingAppointments} />

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
    </AppShell>
  );
}
