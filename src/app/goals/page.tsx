import { AppShell } from '@/components/app-shell';
import { sectionContent } from '@/lib/sections';

export default function GoalsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500">{sectionContent.goals.title}</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">{sectionContent.goals.blurb}</h2>
          <p className="mt-3 text-slate-600">Keep your larger vision visible and supported by small daily steps.</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          {['Create a signature offer', 'Travel more intentionally'].map((goal) => (
            <div key={goal} className="rounded-[28px] border border-slate-200/70 bg-slate-50 p-5">
              <p className="font-semibold text-slate-900">{goal}</p>
              <p className="mt-2 text-sm text-slate-600">Choose one action that moves it forward this week.</p>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
