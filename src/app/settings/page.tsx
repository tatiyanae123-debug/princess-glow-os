import { AppShell } from '@/components/app-shell';
import { sectionContent, settingsItems } from '@/lib/sections';

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-500">{sectionContent.settings.title}</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-900">{sectionContent.settings.blurb}</h2>
          <p className="mt-3 text-slate-600">Tune the environment so the system feels supportive and calm.</p>
        </section>
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <div className="space-y-3">
            {settingsItems.map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="font-medium text-slate-900">{item.title}</span>
                <span className="text-sm text-slate-600">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
