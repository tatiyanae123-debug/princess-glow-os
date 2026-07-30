import { AppShell } from '@/components/app-shell';
import { sectionContent } from '@/lib/sections';

export default function HabitsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500">{sectionContent.habits.title}</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">{sectionContent.habits.blurb}</h2>
          <p className="mt-3 text-slate-600">Small habits that create a durable sense of self-respect.</p>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {['Hydrate', 'Stretch', 'Journal'].map((habit) => (
            <div key={habit} className="rounded-[28px] border border-slate-200/70 bg-slate-50 p-5">
              <p className="font-semibold text-slate-900">{habit}</p>
              <p className="mt-2 text-sm text-slate-600">Keep it visible and easy.</p>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
