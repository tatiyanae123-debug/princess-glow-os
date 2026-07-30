import { AppShell } from '@/components/app-shell';
import { beautyRoutine, featuredPillars, quickNotes, todayHighlights, wellnessTracks } from '@/lib/sections';

export default function TodayPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-rose-500">Daily ritual</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">A soft landing for the day ahead.</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Curate your priorities, protect your energy, and let the day feel intentional rather than crowded.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <p className="font-semibold">Today’s focus</p>
              <p className="mt-1">Finish one meaningful thing before noon.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200/70 bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Highlights</p>
            <div className="mt-4 space-y-3">
              {todayHighlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Pillars</p>
            <div className="mt-4 space-y-3">
              {featuredPillars.map((pillar) => (
                <div key={pillar.title} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{pillar.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Wellness snapshot</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {wellnessTracks.map((track) => (
                <div key={track.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{track.title}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{track.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">Beauty ritual</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {beautyRoutine.map((step) => (
                <li key={step} className="rounded-2xl bg-rose-50 px-4 py-3">{step}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Notes to keep close</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {quickNotes.map((note) => (
              <span key={note} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                {note}
              </span>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
