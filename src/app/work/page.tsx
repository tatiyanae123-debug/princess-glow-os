import { AppShell } from '@/components/app-shell';
import { sectionContent } from '@/lib/sections';

export default function WorkPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500">{sectionContent.work.title}</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">{sectionContent.work.blurb}</h2>
          <p className="mt-3 text-slate-600">Create momentum with clarity, structure, and enough softness to sustain it.</p>
        </section>
        <section className="grid gap-4 md:grid-cols-2">
          {['Shape the next launch', 'Reply to priority messages'].map((item) => (
            <div key={item} className="rounded-[28px] border border-slate-200/70 bg-slate-50 p-5">
              <p className="font-semibold text-slate-900">{item}</p>
              <p className="mt-2 text-sm text-slate-600">Keep work honest and achievable.</p>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
