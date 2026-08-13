import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { db } from '@/db';
import { lifeModes } from '@/db/schema/adaptive-os';
import { activateGlowIntelligenceAction } from '@/app/actions/intelligence-activation';
import { CheckCircle2, DatabaseZap, ShieldCheck, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function isActive() {
  try {
    await db.select({ id: lifeModes.id }).from(lifeModes).limit(1);
    return true;
  } catch {
    return false;
  }
}

export default async function IntelligenceSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const active = await isActive();
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="rounded-[20px] border border-[#F1E7E3] bg-[linear-gradient(120deg,#FBE4E8,#FDF8F6_58%,#F1E8D9)] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-[#C9727E]"><DatabaseZap size={17} /><p className="text-[11px] font-semibold uppercase tracking-[.16em]">Glow Intelligence Activation</p></div>
          <h1 className="glow-display mt-2 text-[38px] leading-none text-[#2B2420] sm:text-[46px]">Turn on the connected brain.</h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-5 text-[#8A8078]">This activates the idempotent database tables already defined by migrations 0008 and 0009. It does not replace Auth.js, Neon, Drizzle, or existing Glow OS data.</p>
        </header>
        <section className={`rounded-[18px] border p-5 ${active ? 'border-[#E4EBDD] bg-[#F3F6F0]' : 'border-[#F1E8D9] bg-[#FDF6F1]'}`}>
          <div className="flex items-start gap-3">
            {active ? <CheckCircle2 size={22} className="mt-0.5 text-[#5A6E52]" /> : <Sparkles size={22} className="mt-0.5 text-[#9A7A3D]" />}
            <div>
              <p className="text-[13px] font-semibold text-[#2B2420]">{active ? 'Adaptive intelligence schema is active' : 'Activation required'}</p>
              <p className="mt-1 text-[12px] leading-5 text-[#8A8078]">{active ? 'Life Modes, rules, Inbox, Focus Sessions, relationships, maintenance forecasts, Universal Intake artifacts and Glow Notices can now persist in Neon.' : 'The new routes are installed, but the production database needs the idempotent schema activation before they can persist data.'}</p>
            </div>
          </div>
        </section>
        {!active ? (
          <form action={activateGlowIntelligenceAction} className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#4A4440]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Explicit confirmation</p></div>
            <p className="mt-3 text-[12px] leading-5 text-[#8A8078]">Type <strong className="text-[#2B2420]">ACTIVATE</strong> below. Glow will run only CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS statements for the intelligence layer.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input name="confirmation" required placeholder="ACTIVATE" className="min-w-0 flex-1 rounded-lg border border-[#F1E7E3] bg-[#FDF8F6] px-4 py-3 text-[13px] text-[#2B2420] outline-none focus:border-[#C9727E]" />
              <button type="submit" className="rounded-full bg-[#2B2420] px-5 py-3 text-[12px] font-medium text-white hover:bg-[#B15A68]">Activate Glow Intelligence</button>
            </div>
          </form>
        ) : (
          <section className="grid gap-3 sm:grid-cols-3">
            <Link href="/intake" className="rounded-[16px] border border-[#F1E7E3] bg-white p-4 text-[13px] text-[#2B2420] hover:bg-[#FDF8F6]">Open Universal Intake →</Link>
            <Link href="/inbox" className="rounded-[16px] border border-[#F1E7E3] bg-white p-4 text-[13px] text-[#2B2420] hover:bg-[#FDF8F6]">Open Glow Inbox →</Link>
            <Link href="/today" className="rounded-[16px] border border-[#F1E7E3] bg-white p-4 text-[13px] text-[#2B2420] hover:bg-[#FDF8F6]">Open Adaptive Today →</Link>
          </section>
        )}
      </div>
    </AppShell>
  );
}
