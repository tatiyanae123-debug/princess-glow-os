import { AppShell } from '@/components/app-shell';
import { sectionContent } from '@/lib/sections';

export default function CalendarPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500">{sectionContent.calendar.title}</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">{sectionContent.calendar.blurb}</h2>
          <p className="mt-3 text-slate-600">A calm weekly view with space for rest, focus, and connection.</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200/70 bg-slate-900 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">This week</p>
            <div className="mt-4 space-y-3">
              {['Monday planning', 'Wednesday deep work', 'Friday dinner plans'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-3 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Flow note</p>
            <p className="mt-3 text-slate-600">Block your week around what matters most, then leave margin for delight.</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
