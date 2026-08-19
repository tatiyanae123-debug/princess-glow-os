import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch2Journal } from '@/components/notes/batch2-journal';
import { getNotesByUser } from '@/lib/data/notes';

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const notes = await getNotesByUser(session.user.id);
  return <AppShell><Batch2Journal initialNotes={notes} /></AppShell>;
}
