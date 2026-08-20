import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { GlowNotesIntelligenceStudio } from '@/components/notes/glow-notes-intelligence-studio';
import { getNotesByUser } from '@/lib/data/notes';

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const notes = await getNotesByUser(session.user.id);
  return <AppShell><GlowNotesIntelligenceStudio initialNotes={notes} /></AppShell>;
}
