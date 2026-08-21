import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { GlowNotesIntelligenceStudio } from '@/components/notes/glow-notes-intelligence-studio';
import { NotesLocalRecoveryPanel } from '@/components/notes/notes-local-recovery-panel';
import { NotesTranscriptIntelligence } from '@/components/notes/notes-transcript-intelligence';
import { getNotesByUser } from '@/lib/data/notes';

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const notes = await getNotesByUser(session.user.id);
  return <AppShell><div className="space-y-6"><NotesTranscriptIntelligence /><GlowNotesIntelligenceStudio initialNotes={notes} /><NotesLocalRecoveryPanel notes={notes} /></div></AppShell>;
}
