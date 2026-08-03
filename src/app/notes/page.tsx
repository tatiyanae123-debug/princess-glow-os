import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getNotesByUser } from '@/lib/data/notes';

export const dynamic = 'force-dynamic';

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const notes = await getNotesByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Notes" title="A place for beautiful ideas" description="Capture thoughts as they arrive and return to them later with ease.">
        <Card className="space-y-3">
          {notes.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400 dark:text-slate-500">No notes yet. Capture your first idea.</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="rounded-[20px] border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{note.title}</p>
                  {note.pinned && (
                    <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">Pinned</span>
                  )}
                </div>
                {note.content && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{note.content}</p>}
              </div>
            ))
          )}
        </Card>
      </SectionPage>
    </AppShell>
  );
}
