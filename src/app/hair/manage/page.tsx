import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { createHairLogAction } from '@/app/actions/completion-v1';
import { getHairLogs } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

const field = 'w-full rounded-[14px] border border-white/70 bg-white/35 px-4 py-3 text-[11px] text-[#4c4540] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.9)] placeholder:text-[#9c9189]';

export default async function HairManagePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const logs = await getHairLogs(session.user.id);

  return <main className="min-h-screen bg-[radial-gradient(circle_at_80%_10%,rgba(210,205,255,.35),transparent_25%),radial-gradient(circle_at_10%_80%,rgba(255,220,196,.35),transparent_28%),#eee8e1] p-4 text-[#332e2b]">
    <section className="mx-auto max-w-[1180px] rounded-[30px] border border-white/80 bg-white/35 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.95),0_24px_70px_rgba(101,78,66,.13)] backdrop-blur-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-[9px] uppercase tracking-[.18em] text-[#8c8179]">Hair Studio</p><h1 className="mt-1 text-[30px] font-semibold tracking-[-.035em]">Log Hair Care</h1><p className="mt-1 text-[11px] text-[#786f69]">Add only what is true. Hair Today and Private Salon update from this history.</p></div>
        <div className="flex gap-2"><Link href="/hair" className="rounded-full border border-white/75 bg-white/40 px-4 py-2 text-[10px]">Private Salon</Link><Link href="/hair/today" className="rounded-full border border-white/75 bg-white/40 px-4 py-2 text-[10px]">Hair Today</Link></div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
        <form action={createHairLogAction} className="space-y-3 rounded-[22px] border border-white/75 bg-white/28 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.9)]">
          <h2 className="text-[18px] font-semibold">New Hair entry</h2>
          <input name="eventType" required placeholder="Wash day, trim, scalp care, protective style…" className={field}/>
          <input name="occurredAt" type="datetime-local" className={field}/>
          <input name="style" placeholder="Current style" className={field}/>
          <input name="products" placeholder="Products used, separated by commas" className={field}/>
          <label className="flex items-center gap-2 rounded-[14px] border border-white/65 bg-white/25 px-4 py-3 text-[10px]"><input name="heatUsed" type="checkbox"/> Heat used</label>
          <textarea name="notes" rows={5} placeholder="Only log observed state. Example: frizz low, scalp comfortable, ends good, leave-out blend good." className={field}/>
          <input name="nextAction" placeholder="Next action, if one is actually needed" className={field}/>
          <button className="w-full rounded-full bg-[#3f3733] px-4 py-3 text-[10px] font-semibold text-white">Save Hair entry</button>
        </form>

        <section className="overflow-hidden rounded-[22px] border border-white/75 bg-white/28 shadow-[inset_0_1px_0_rgba(255,255,255,.9)]">
          <div className="border-b border-[#8e796d]/10 px-5 py-4"><h2 className="text-[18px] font-semibold">Hair History</h2><p className="text-[9px] text-[#8b8079]">This same history feeds Hair Studio, Hair Today, forecasts, and maintenance.</p></div>
          {logs.length ? <div className="divide-y divide-[#8e796d]/10">{logs.slice(0,30).map((log) => <article key={log.id} className="grid gap-2 px-5 py-4 sm:grid-cols-[92px_1fr_auto]"><time className="text-[9px] text-[#91867e]">{log.occurredAt.toLocaleDateString()}</time><div><h3 className="text-[13px] font-semibold">{log.eventType}</h3>{log.style ? <p className="mt-1 text-[9px] text-[#746a64]">Style · {log.style}</p> : null}{log.products ? <p className="mt-1 text-[9px] text-[#746a64]">Products · {log.products}</p> : null}{log.notes ? <p className="mt-2 text-[9px] leading-4 text-[#665d58]">{log.notes}</p> : null}{log.nextAction ? <p className="mt-2 rounded-[10px] bg-white/35 px-3 py-2 text-[9px]">Next · {log.nextAction}</p> : null}</div><span className="self-start rounded-full bg-white/35 px-2 py-1 text-[8px] text-[#776d66]">{log.heatUsed ? 'heat' : 'no heat'}</span></article>)}</div> : <div className="p-10 text-center text-[10px] text-[#8d827a]">No Hair entries yet. Your Hair Studio will stay quiet rather than inventing state.</div>}
        </section>
      </div>
    </section>
  </main>;
}
