import { AppShell } from '@/components/app-shell';
import { sectionContent } from '@/lib/sections';

export default function NotesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500">{sectionContent.notes.title}</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">{sectionContent.notes.blurb}</h2>
          <p className="mt-3 text-slate-600">A place for ideas, reflections, and soft imperatives.</p>
        </section>
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <div className="space-y-3">
            {['Write one sentence before you begin.', 'Capture what feels alive.', 'Leave space for the unexpected.'].map((note) => (
              <div key={note} className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">
                {note}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
