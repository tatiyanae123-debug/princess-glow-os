import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { db } from '@/db';
import { lifeModes } from '@/db/schema/adaptive-os';
import { activateGlowIntelligenceAction } from '@/app/actions/intelligence-activation';
import { CheckCircle2, DatabaseZap, ShieldCheck, Sparkles } from 'lucide-react';

export const dynamic='force-dynamic';

async function isActive(){try{await db.select({id:lifeModes.id}).from(lifeModes).limit(1);return true;}catch{return false;}}

export default async function IntelligenceSettingsPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const active=await isActive();
  return <AppShell><div className="mx-auto max-w-4xl space-y-5">
    <header className="rounded-[24px] border border-[#e4d7cf] bg-[linear-gradient(120deg,#f8ece7,#fffaf6_58%,#eee8da)] p-6 sm:p-8"><div className="flex items-center gap-2 text-[#9f6972]"><DatabaseZap size={17}/><p className="text-[9px] font-bold uppercase tracking-[.2em]">Glow Intelligence Activation</p></div><h1 className="glow-display mt-2 text-[38px] leading-none text-[#382d29] sm:text-[48px]">Turn on the connected brain.</h1><p className="mt-3 max-w-2xl text-[10px] leading-5 text-[#806d66]">This activates the idempotent database tables already defined by migrations 0008 and 0009. It does not replace Auth.js, Neon, Drizzle, or existing Glow OS data.</p></header>
    <section className={`rounded-[22px] border p-5 ${active?'border-emerald-200 bg-emerald-50/70':'border-amber-200 bg-amber-50/70'}`}><div className="flex items-start gap-3">{active?<CheckCircle2 size={22} className="mt-0.5 text-emerald-700"/>:<Sparkles size={22} className="mt-0.5 text-amber-700"/>}<div><p className="text-sm font-semibold text-stone-900">{active?'Adaptive intelligence schema is active':'Activation required'}</p><p className="mt-1 text-xs leading-5 text-stone-600">{active?'Life Modes, rules, Inbox, Focus Sessions, relationships, maintenance forecasts, Universal Intake artifacts and Glow Notices can now persist in Neon.':'The new routes are installed, but the production database needs the idempotent schema activation before they can persist data.'}</p></div></div></section>
    {!active?<form action={activateGlowIntelligenceAction} className="rounded-[22px] border border-stone-200 bg-white/75 p-5 shadow-sm"><div className="flex items-center gap-2"><ShieldCheck size={16} className="text-stone-700"/><p className="text-[9px] font-bold uppercase tracking-[.16em] text-stone-500">Explicit confirmation</p></div><p className="mt-3 text-xs leading-5 text-stone-600">Type <strong>ACTIVATE</strong> below. Glow will run only CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS statements for the intelligence layer.</p><div className="mt-4 flex flex-col gap-2 sm:flex-row"><input name="confirmation" required placeholder="ACTIVATE" className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-rose-300"/><button type="submit" className="rounded-xl bg-stone-950 px-5 py-3 text-xs font-medium text-white hover:bg-rose-950">Activate Glow Intelligence</button></div></form>:<section className="grid gap-3 sm:grid-cols-3"><Link href="/intake" className="rounded-[18px] border border-stone-200 bg-white/70 p-4 text-sm text-stone-800">Open Universal Intake →</Link><Link href="/inbox" className="rounded-[18px] border border-stone-200 bg-white/70 p-4 text-sm text-stone-800">Open Glow Inbox →</Link><Link href="/today" className="rounded-[18px] border border-stone-200 bg-white/70 p-4 text-sm text-stone-800">Open Adaptive Today →</Link></section>}
  </div></AppShell>;
}
