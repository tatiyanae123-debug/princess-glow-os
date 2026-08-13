import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createObservationAction, setObservationStatusAction } from '@/app/actions/completion-v1';
import { getObservations } from '@/lib/data/completion-v1';
import { Eye, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full rounded-lg border border-[#F1E7E3] px-3.5 py-2.5 text-[12px] text-[#2B2420] placeholder:text-[#B5ACA5] focus:border-[#7C6B9C] focus:outline-none';

export default async function ObservationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const items = await getObservations(session.user.id);
  const active = items.filter((item) => item.status === 'active').length;
  return (
    <AppShell>
      <SectionPage eyebrow="Intelligent observations" title="Notice patterns without judgment" description="Every observation carries evidence, a time window, and a confidence score. You stay in control.">
        <div className="space-y-4">
          <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#E9E4F2,#FDF6F1)]">
            <Eye size={54} strokeWidth={0.75} className="absolute right-5 top-4 text-[#7C6B9C]/22" />
            <p className="glow-eyebrow">Pattern studio</p>
            <p className="glow-display mt-2 text-[24px] text-[#2B2420]">Glow notices. You decide what matters.</p>
            <p className="mt-2 text-[12px] leading-5 text-[#8A8078]">{active} active observation{active === 1 ? '' : 's'} are currently in view.</p>
          </Card>
          <div className="grid gap-4 lg:grid-cols-[.72fr_1.28fr]">
            <Card>
              <form action={createObservationAction} className="space-y-3">
                <div className="flex items-center gap-2"><Sparkles size={14} className="text-[#7C6B9C]" /><h2 className="glow-display text-[20px] text-[#2B2420]">Add an observation</h2></div>
                <input name="category" required placeholder="Category" className={fieldClass} />
                <input name="title" required placeholder="Observation title" className={fieldClass} />
                <textarea name="evidence" required rows={4} placeholder="Evidence used" className={fieldClass} />
                <input name="timeWindow" required placeholder="Time window, e.g. past 4 weeks" className={fieldClass} />
                <button className="rounded-full bg-[#7C6B9C] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-[#655682]">Save observation</button>
              </form>
            </Card>
            <Card className="overflow-hidden p-0">
              <div className="border-b border-[#F1E7E3] px-5 py-4"><p className="glow-eyebrow">Glow Notices</p><h2 className="glow-display mt-1 text-[19px] text-[#2B2420]">Pattern feed</h2></div>
              {items.length === 0 ? (
                <p className="p-8 text-center text-[12px] text-[#8A8078]">No observations yet.</p>
              ) : (
                <div className="divide-y divide-[#F1E7E3]">
                  {items.map((item, index) => (
                    <div key={item.id} className={`p-4 ${index === 0 && item.status === 'active' ? 'bg-[#F5F2F9]' : ''}`}>
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="glow-display text-[14px] text-[#2B2420]">{item.title}</p>
                          <p className="mt-1 text-[11px] leading-4 text-[#8A8078]">{item.evidence}</p>
                        </div>
                        <span className="h-fit rounded-full bg-[#E9E4F2] px-2.5 py-1 text-[10px] uppercase text-[#7C6B9C]">{item.status}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-[10.5px] text-[#B5ACA5]">{item.timeWindow} · confidence {Math.round(item.confidence * 100)}%</p>
                        <form action={setObservationStatusAction.bind(null, item.id, item.status === 'dismissed' ? 'active' : 'dismissed')}>
                          <button className="rounded-full border border-[#F1E7E3] px-3 py-1.5 text-[10.5px] text-[#8A8078] hover:bg-[#FDF8F6]">{item.status === 'dismissed' ? 'Restore' : 'Dismiss'}</button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </SectionPage>
    </AppShell>
  );
}
