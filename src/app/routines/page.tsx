import { AppShell } from '@/components/app-shell';
import { sectionContent } from '@/lib/sections';

export default function RoutinesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500">{sectionContent.routines.title}</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">{sectionContent.routines.blurb}</h2>
          <p className="mt-3 text-slate-600">Design repeatable rituals that feel elegant and easy to maintain.</p>
        </section>
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <div className="space-y-3">
            {['Morning: tea, stretch, and plan', 'Midday: reset and nourish', 'Evening: tidy, reflect, and rest'].map((routine) => (
              <div key={routine} className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">
                {routine}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
