import { AppShell } from '@/components/app-shell';
import { sectionContent } from '@/lib/sections';

export default function TasksPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500">{sectionContent.tasks.title}</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">{sectionContent.tasks.blurb}</h2>
          <p className="mt-3 text-slate-600">A curated list of what deserves your attention today.</p>
        </section>
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <div className="space-y-3">
            {['Send proposal', 'Book salon appointment', 'Draft weekend plan'].map((task) => (
              <div key={task} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="text-slate-700">{task}</span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-700">Ready</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
