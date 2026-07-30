import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';

const notes = [
  'Write one sentence before you begin.',
  'Capture what feels alive.',
  'Leave space for the unexpected.',
];

export default function NotesPage() {
  return (
    <AppShell>
      <SectionPage eyebrow="Notes" title="A place for beautiful ideas" description="Capture thoughts as they arrive and return to them later with ease.">
        <Card className="space-y-3">
          {notes.map((note) => (
            <div key={note} className="rounded-[20px] border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
              {note}
            </div>
          ))}
        </Card>
      </SectionPage>
    </AppShell>
  );
}
