import { AppShell } from '@/components/app-shell';
import { sectionContent } from '@/lib/sections';

export default function MoneyPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500">{sectionContent.money.title}</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">{sectionContent.money.blurb}</h2>
          <p className="mt-3 text-slate-600">Bring calm to your finances with a simple, honest view.</p>
        </section>
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            {['Savings', 'Spending', 'Upcoming'].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{item}</p>
                <p className="mt-2 text-sm text-slate-600">Check in weekly and stay grounded.</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
