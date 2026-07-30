import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';

const beautyNotes = [
  { title: 'Skincare', detail: 'Cleanse, hydrate, and protect your barrier first.' },
  { title: 'Hair', detail: 'Choose one soft, polished style for tomorrow.' },
  { title: 'Wardrobe', detail: 'Keep one elegant outfit ready for the week ahead.' },
];

export default function BeautyPage() {
  return (
    <AppShell>
      <SectionPage eyebrow="Beauty" title="Care that feels luxurious" description="Treat beauty as an intentional ritual rather than an afterthought.">
        <Card className="space-y-3">
          {beautyNotes.map((note) => (
            <div key={note.title} className="rounded-[20px] border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="font-medium text-slate-900 dark:text-slate-100">{note.title}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{note.detail}</p>
            </div>
          ))}
        </Card>
      </SectionPage>
    </AppShell>
  );
}
