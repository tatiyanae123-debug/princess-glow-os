import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { NotesRouteExperience } from '@/components/notes/notes-route-experience';
import { RotatingIdeaSphere } from '@/components/brain/rotating-idea-sphere';
import { getNotesByUser } from '@/lib/data/notes';

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const notes = await getNotesByUser(session.user.id);

  return (
    <AppShell>
      <div className="space-y-4">
        <RotatingIdeaSphere
          notes={notes}
          title="Your Notes in Orbit"
          subtitle="Every note becomes part of a living 3D idea ball. It slowly rotates through your thoughts, and you can drag it with your finger, pause it, expand it, or tap any idea to open the exact note."
        />
        <NotesRouteExperience initialNotes={notes} />
      </div>
    </AppShell>
  );
}
