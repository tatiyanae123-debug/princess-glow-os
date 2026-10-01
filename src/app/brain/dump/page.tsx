import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { addInboxItemFormAction } from '@/app/actions/adaptive-os';
import { getInbox } from '@/lib/intelligence/adaptive-os';
import { Inbox, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BrainDumpPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const items = await getInbox(session.user.id);
  const recent = items.slice(0, 6);

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Brain · Capture"
        title="Brain Dump"
        question="Get it out exactly as it arrives. Glow preserves the raw thought first, then helps route it without erasing the original."
        climate="brain"
        destinations={[
          { label: 'Brain', href: '/brain', cue: 'Connected knowledge' },
          { label: 'Notes', href: '/notes', cue: 'Developed thoughts' },
          { label: 'Inbox', href: '/inbox', cue: 'Review and route captures' },
          { label: 'Memory', href: '/memory', cue: 'Long-term context' },
        ]}
      >
        <div className="grid gap-4 md:grid-cols-[1.25fr_.75fr]">
          <section className="editorial-surface p-4 sm:p-5">
            <div className="flex items-center gap-2"><Sparkles size={13} className="text-[#8c7da0]"/><p className="glow-eyebrow">Universal capture</p></div>
            <form action={addInboxItemFormAction} className="mt-4">
              <textarea
                name="rawText"
                rows={11}
                required
                autoFocus
                placeholder="Type anything exactly as it is in your head…"
                className="w-full resize-y rounded-[18px] border border-white/80 bg-white/58 p-4 text-[11px] leading-6 text-[#463c37] outline-none placeholder:text-[#aa9d95]"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xl text-[7.5px] leading-4 text-[#8a7d75]">Your original capture remains intact. Glow can later suggest Task, Note, Goal, Project, Reminder, Person, Shopping, or Calendar destinations.</p>
                <button className="rounded-full bg-[#332d2a] px-5 py-2.5 text-[8px] font-medium text-white">Save raw capture</button>
              </div>
            </form>
          </section>

          <section className="editorial-surface p-4 sm:p-5">
            <div className="flex items-center gap-2"><Inbox size={13} className="text-[#8a7a72]"/><div><p className="glow-eyebrow">Recently captured</p><p className="glow-display text-[18px] text-[#463c37]">Still unprocessed</p></div></div>
            <div className="mt-4 space-y-2">
              {recent.length ? recent.map((item) => (
                <a key={item.id} href="/inbox" className="block rounded-[12px] bg-white/42 p-3">
                  <p className="line-clamp-2 text-[8px] leading-4 text-[#5c5049]">{item.rawText}</p>
                  <p className="mt-1 text-[6.5px] uppercase tracking-[.12em] text-[#a09289]">{item.status}</p>
                </a>
              )) : Array.from({ length: 4 }, (_, index) => <div key={index} className="rounded-[12px] border border-dashed border-[#ddd1c9] p-3 text-[7px] italic text-[#9b8d84]">Open capture slot</div>)}
            </div>
          </section>
        </div>
      </CanonicalDomainRoom>
    </AppShell>
  );
}
