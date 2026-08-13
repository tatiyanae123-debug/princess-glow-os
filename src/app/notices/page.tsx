import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { applyGlowNoticeAction, dismissGlowNoticeAction, setGlowNoticeFeedbackAction, snoozeGlowNoticeAction } from '@/app/actions/glow-notices';
import { ensureGlowNotices } from '@/lib/intelligence/glow-notices';
import { BellRing, Check, Clock3, Sparkles, ThumbsDown, ThumbsUp, WandSparkles, X } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NoticesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  let notices;
  try {
    notices = await ensureGlowNotices(session.user.id);
  } catch {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl rounded-[20px] border border-[#F1E7E3] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#2B2420]">Glow Notices need intelligence activation.</p>
          <Link href="/settings/intelligence" className="mt-3 inline-block text-[12px] font-medium text-[#C9727E]">Activate intelligence →</Link>
        </div>
      </AppShell>
    );
  }
  const now = new Date();
  const active = notices.filter((n) => n.status === 'active' || (n.status === 'snoozed' && n.snoozedUntil && n.snoozedUntil <= now));
  const history = notices.filter((n) => !active.some((a) => a.id === n.id)).slice(0, 8);
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-5">
        <header>
          <div className="flex items-center gap-2 text-[#C9727E]"><BellRing size={18} /><p className="text-[11px] font-semibold uppercase tracking-[.16em]">What Glow noticed</p></div>
          <h1 className="glow-display mt-2 text-[38px] leading-none text-[#2B2420] sm:text-[40px]">Glow Notices</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#8A8078]">Evidence-based patterns from across your systems. Review the evidence and confidence, apply the safe next step, snooze or dismiss, and teach Glow what was useful.</p>
        </header>
        <section className="space-y-3">
          {active.length ? active.map((n) => {
            const feedback = typeof n.actionPayload?.feedback === 'string' ? n.actionPayload.feedback : null;
            return (
              <article key={n.id} className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
                <div className="flex flex-col gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Sparkles size={13} className="text-[#C9727E]" />
                      <span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">{n.domain}</span>
                      <span className="rounded-full bg-[#FDF3F2] px-2.5 py-1 text-[10px] font-semibold text-[#B15A68]">{Math.round(n.confidence * 100)}% confidence</span>
                    </div>
                    <h2 className="glow-display mt-2 text-[21px] text-[#2B2420]">{n.title}</h2>
                    <div className="mt-3 rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Evidence</p>
                      <p className="mt-1 text-[11.5px] leading-5 text-[#4A4440]">{n.evidence}</p>
                    </div>
                    {n.recommendation ? <p className="mt-2 rounded-[14px] bg-[#FDF3F2] p-3 text-[11.5px] leading-5 text-[#4A4440]"><strong>Glow suggests:</strong> {n.recommendation}</p> : null}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      <form action={applyGlowNoticeAction.bind(null, n.id)}><button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-[#2B2420] px-3.5 py-2 text-[11px] font-semibold text-white"><WandSparkles size={12} />Apply</button></form>
                      <form action={snoozeGlowNoticeAction.bind(null, n.id)}><button type="submit" title="Snooze 24 hours" className="inline-flex items-center gap-1.5 rounded-full border border-[#F1E8D9] bg-[#FDF6F1] px-3.5 py-2 text-[11px] text-[#9A7A3D]"><Clock3 size={12} />Snooze</button></form>
                      <form action={dismissGlowNoticeAction.bind(null, n.id)}><button type="submit" title="Dismiss" className="inline-flex items-center gap-1.5 rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#8A8078]"><X size={12} />Dismiss</button></form>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[.1em] text-[#B5ACA5]">Was this useful?</span>
                      <form action={setGlowNoticeFeedbackAction.bind(null, n.id, 'helpful')}><button type="submit" aria-label="Mark helpful" className={`rounded-full border p-2 ${feedback === 'helpful' ? 'border-[#5A6E52] bg-[#E4EBDD] text-[#5A6E52]' : 'border-[#E4EBDD] bg-[#F3F6F0] text-[#5A6E52]'}`}><ThumbsUp size={12} /></button></form>
                      <form action={setGlowNoticeFeedbackAction.bind(null, n.id, 'not_helpful')}><button type="submit" aria-label="Mark not helpful" className={`rounded-full border p-2 ${feedback === 'not_helpful' ? 'border-[#C9727E] bg-[#FBE4E8] text-[#B15A68]' : 'border-[#F1E7E3] bg-white text-[#B15A68]'}`}><ThumbsDown size={12} /></button></form>
                      {feedback ? <Check size={12} className="text-[#5A6E52]" /> : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          }) : (
            <div className="rounded-[20px] border border-[#E4EBDD] bg-[#F3F6F0] p-8 text-center">
              <p className="glow-display text-[20px] text-[#2B2420]">Nothing needs your attention.</p>
              <p className="mt-2 text-[11.5px] text-[#8A8078]">Glow will add a notice when cross-system evidence is strong enough to be useful.</p>
            </div>
          )}
        </section>
        {history.length ? (
          <section className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
            <p className="text-[10.5px] font-semibold uppercase tracking-[.14em] text-[#8A8078]">Recent decisions</p>
            <div className="mt-3 space-y-2">
              {history.map((n) => (
                <div key={n.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F1E7E3] pt-2 first:border-t-0 first:pt-0">
                  <div><p className="text-[11.5px] font-semibold text-[#2B2420]">{n.title}</p><p className="text-[10px] text-[#B5ACA5]">{n.domain} · {Math.round(n.confidence * 100)}% confidence</p></div>
                  <span className="rounded-full bg-[#FDF8F6] px-2.5 py-1 text-[10px] uppercase tracking-[.08em] text-[#8A8078]">{n.status}</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        <Link href="/observations" className="inline-flex text-[12px] font-medium text-[#C9727E]">Open full Observations workspace →</Link>
      </div>
    </AppShell>
  );
}
