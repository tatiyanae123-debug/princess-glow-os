import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { FitnessStudio } from '@/components/fitness/fitness-studio';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';

export const dynamic = 'force-dynamic';

export default async function FitnessPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [events, wellness] = await Promise.all([
    getCalendarEventsByUser(session.user.id),
    getWellnessEntriesByUser(session.user.id),
  ]);

  return <AppShell><FitnessStudio events={events} wellness={wellness} /></AppShell>;
}
