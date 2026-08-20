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
import { Camera, FlaskConical, Sparkles } from 'lucide-react';

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

        <Card className="overflow-hidden border-[#eadfe7] bg-[linear-gradient(135deg,#fffafd,#f5ebf1)] p-0">
          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2"><Sparkles size={14} className="text-[#9a748d]"/><p className="glow-eyebrow">Guided facial ritual</p></div>
              <h2 className="glow-display mt-2 text-[22px] text-[#2B2420]">Gua Sha</h2>
              <p className="mt-2 max-w-2xl text-[12px] leading-5 text-[#81757d]">Open a timed, spoken step-by-step player with Quick, Full, and Slow modes, left/right side tracking, technique cues, and a post-routine comfort check-in.</p>
            </div>
            <Link href="/beauty/gua-sha" className="inline-flex items-center justify-center rounded-full bg-[#3b3038] px-5 py-3 text-[12px] font-medium text-white">Open Gua Sha</Link>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="border-b border-[#F1E7E3] px-5 py-4">
            <p className="glow-eyebrow">Maintenance forecast</p>
            <h2 className="glow-display mt-1 text-[19px] text-[#2B2420]">What needs attention next</h2>
          </div>
          <div className="space-y-3 p-5">
            {expiringProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="rounded-[12px] bg-[#FDF3F2] p-3">
                <p className="text-[10px] uppercase tracking-[.08em] text-[#B15A68]">Expiration watch</p>
                <p className="glow-display mt-1 text-[14px] text-[#2B2420]">{product.name}</p>
                <p className="mt-1 text-[11px] text-[#8A8078]">{product.expiresAt ? `Due ${dayLabel(product.expiresAt)}` : 'Review date'}</p>
              </div>
            ))}
            {products.filter((product) => product.repurchase === 'yes').slice(0, 2).map((product) => (
              <div key={`repurchase-${product.id}`} className="rounded-[12px] bg-[#FDF8F6] p-3">
                <p className="text-[10px] uppercase tracking-[.08em] text-[#8A8078]">Repurchase</p>
                <p className="glow-display mt-1 text-[14px] text-[#2B2420]">{product.name}</p>
              </div>
            ))}
            {maintenanceCount === 0 ? <p className="py-4 text-center text-[12px] text-[#8A8078]">Nothing urgent. Your cabinet is currently clear.</p> : null}
            <Link href="/beauty/lab" className="inline-flex items-center gap-2 rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#4A4440] hover:bg-[#FDF8F6]"><FlaskConical size={11} />Open Beauty Lab</Link>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-[#F1E7E3] px-5 py-4">
            <div>
              <p className="glow-eyebrow">Progress journal</p>
              <h2 className="glow-display mt-1 text-[19px] text-[#2B2420]">Compare what your skin is telling you</h2>
            </div>
            <Link href="/beauty/lab" className="rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#4A4440] hover:bg-[#FDF8F6]">Log response</Link>
          </div>
          {reactionNotes.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-[12px] text-[#8A8078]">No response notes yet. Add reactions in Beauty Lab so Glow can build a useful progress history.</p>
            </div>
          ) : (
            <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-4">
              {reactionNotes.map((product) => (
                <div key={product.id} className="border-b border-r border-[#F1E7E3] p-4">
                  <div className="mb-3 h-20 rounded-[12px] bg-[linear-gradient(145deg,#FBE4E8,#FDF3F2)] p-3">
                    <Camera size={18} strokeWidth={0.9} className="text-[#C9727E]/70" />
                  </div>
                  <p className="glow-display text-[14px] text-[#2B2420]">{product.name}</p>
                  <p className="mt-2 line-clamp-3 text-[11px] leading-4 text-[#8A8078]">{product.reaction}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div>
          <div className="mb-3">
            <p className="glow-eyebrow">Ritual editor</p>
            <h2 className="glow-display mt-1 text-[22px] text-[#2B2420]">Morning + evening routine</h2>
          </div>
          <BeautyRoutineManager initialRoutines={routines} />
        </div>
      </div>
    </AppShell>
  );
}
