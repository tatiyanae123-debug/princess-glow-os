import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { BeautyIntelligenceStudio } from '@/components/beauty/beauty-intelligence-studio';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getBeautyProducts } from '@/lib/data/completion-v1';
import { getBeautyIntelligenceState } from '@/lib/data/advanced-beauty';

export const dynamic = 'force-dynamic';

const beautyKeywords = [
  'beauty', 'facial', 'skin', 'skincare', 'brow', 'brows', 'lash', 'lashes', 'nail', 'nails',
  'manicure', 'pedicure', 'wax', 'laser', 'derm', 'dermatology', 'esthetic', 'spa', 'makeup',
  'hair', 'shower', 'fragrance', 'gua sha',
];

function isBeautyEvent(title: string, description: string | null) {
  const haystack = `${title} ${description ?? ''}`.toLowerCase();
  return beautyKeywords.some((keyword) => haystack.includes(keyword));
}

export default async function BeautyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  const [routines, events, products, intelligence] = await Promise.all([
    getBeautyRoutinesByUser(userId),
    getCalendarEventsByUser(userId),
    getBeautyProducts(userId),
    getBeautyIntelligenceState(userId),
  ]);

  const now = new Date();
  const upcomingAppointments = events
    .filter((event) => event.startAt.getTime() >= now.getTime() && isBeautyEvent(event.title, event.description))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .slice(0, 5);

  return (
    <AppShell>
      <BeautyIntelligenceStudio
        routines={routines}
        products={products}
        upcomingAppointments={upcomingAppointments}
        intelligence={intelligence}
      />
    </AppShell>
  );
}
