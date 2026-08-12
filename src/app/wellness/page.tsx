import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { WellnessEntryManager } from '@/components/wellness/wellness-entry-manager';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getNotesByUser } from '@/lib/data/notes';
import { getRoutinesByUser } from '@/lib/data/routines';

export const dynamic = 'force-dynamic';

export default async function WellnessPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [entries, notes, routines] = await Promise.all([
    getWellnessEntriesByUser(session.user.id),
    getNotesByUser(session.user.id),
    getRoutinesByUser(session.user.id),
  ]);

  return (
    <AppShell><WellnessEntryManager initialEntries={entries} notes={notes} routines={routines} /></AppShell>
  );
}
