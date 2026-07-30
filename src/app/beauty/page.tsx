import { AppShell } from '@/components/app-shell';
import { sectionContent } from '@/lib/sections';

export default function BeautyPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500">{sectionContent.beauty.title}</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">{sectionContent.beauty.blurb}</h2>
          <p className="mt-3 text-slate-600">A self-care rhythm that supports your glow without making life feel heavy.</p>
        </section>
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <div className="space-y-3">
            {['Skincare', 'Hair', 'Wardrobe'].map((item) => (
              <div key={item} className="rounded-2xl bg-rose-50 px-4 py-3 text-slate-700">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
