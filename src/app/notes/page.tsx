import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { NoteManager } from '@/components/notes/note-manager';
import { getNotesByUser } from '@/lib/data/notes';

export const dynamic = 'force-dynamic';

const destinations = [
  { label: 'Memory', href: '/memory', cue: 'Long-term context' },
  { label: 'Thoughts', href: '/brain/thoughts', cue: 'Raw fragments' },
  { label: 'Ideas', href: '/brain/ideas', cue: 'Possibilities taking shape' },
  { label: 'Insights', href: '/brain/insights', cue: 'Evidence becoming meaning' },
  { label: 'Timeline', href: '/timeline', cue: 'History in sequence' },
  { label: 'Decisions', href: '/brain/decisions', cue: 'Reasons and outcomes' },
];

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const notes = await getNotesByUser(session.user.id);

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Brain · Notes"
        title="Notes"
        question="What do I want to think through, preserve, or connect?"
        climate="brain"
        destinations={destinations}
      >
        <NoteManager initialNotes={notes} />
      </CanonicalDomainRoom>
    </AppShell>
  );
}
