import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { prepareTomorrowFormAction } from '@/app/actions/adaptive-os';
import { buildTomorrowBrief } from '@/lib/intelligence/tomorrow';
import { CalendarDays, CheckCircle2, Clock3, Crown, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TomorrowPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const brief = await buildTomorrowBrief(session.user.id);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <div className="flex items-center gap-2 text-[#C9727E]"><Crown size={17} /><p className="text-[11px] font-semibold uppercase tracking-[.16em]">Prepare Tomorrow</p></div>
          <h1 className="glow-display mt-2 text-[38px] leading-none text-[#2B2420] sm:text-[42px]">{brief.dateLabel}</h1>
          <p className="mt-2 text-[13px] text-[#8A8078]">{brief.summary}</p>
        </header>
        <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-[20px] border border-[#F1E7E3] bg-[linear-gradient(135deg,#FDF8F6,#FBE4E8)] p-6">
            <p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#C9727E]">Tomorrow&apos;s Top Three</p>
            <div className="mt-4 space-y-3">
              {brief.topThree.length ? brief.topThree.map((item, i) => (
                <div key={item} className="flex items-center gap-3 rounded-[14px] bg-white/75 p-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2B2420] text-[11px] text-white">{i + 1}</span><p className="text-[13px] text-[#2B2420]">{item}</p></div>
              )) : <p className="text-[13px] text-[#8A8078]">No priority tasks are pressing tomorrow.</p>}
            </div>
            <div className="mt-5 rounded-[14px] bg-[#2B2420] p-4 text-white">
              <div className="flex items-center gap-2 text-[#E4C9C0]"><Clock3 size={13} /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em]">Suggested wake target</p></div>
              <p className="glow-display mt-2 text-[26px]">{brief.wakeTarget}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
              <div className="flex items-center gap-2"><CalendarDays size={14} className="text-[#4A6A7C]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Commitments</p></div>
              <div className="mt-3 space-y-2">
                {[...brief.events.map((e) => ({ title: e.title, time: e.time })), ...brief.work].map((item, i) => (
                  <div key={`${item.title}-${i}`} className="rounded-[12px] bg-[#FDF8F6] p-3"><p className="text-[12px] font-medium text-[#2B2420]">{item.title}</p><p className="mt-1 text-[10.5px] text-[#8A8078]">{item.time}</p></div>
                ))}
                {!brief.events.length && !brief.work.length ? <p className="text-[12px] text-[#8A8078]">No fixed commitments.</p> : null}
              </div>
            </div>
            <div className="rounded-[18px] border border-[#F1E8D9] bg-[#FDF6F1] p-5">
              <div className="flex items-center gap-2 text-[#9A7A3D]"><Sparkles size={14} /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em]">Prep Tonight</p></div>
              <div className="mt-3 space-y-2">
                {brief.prepTonight.length ? brief.prepTonight.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-[12px] text-[#4A4440]"><CheckCircle2 size={13} className="text-[#9A7A3D]" />{item}</div>
                )) : <p className="text-[12px] text-[#8A8078]">Nothing special needs preparation.</p>}
              </div>
            </div>
          </div>
        </section>
        <div className="flex flex-wrap gap-2">
          <form action={prepareTomorrowFormAction}><button type="submit" className="rounded-full bg-[#C9727E] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-[#B15A68]">Save Tomorrow Brief</button></form>
          <Link href="/today" className="rounded-full border border-[#F1E7E3] bg-white px-4 py-2.5 text-[12px] text-[#8A8078] hover:bg-[#FDF8F6]">Back to Today</Link>
          <Link href="/planning" className="rounded-full bg-[#2B2420] px-4 py-2.5 text-[12px] text-white">Open Plan</Link>
        </div>
      </div>
    </AppShell>
  );
}
