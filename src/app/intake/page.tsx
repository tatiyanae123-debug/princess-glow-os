import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { AppShell } from '@/components/app-shell';
import { universalIntakeAction } from '@/app/actions/universal-intake';
import { db } from '@/db';
import { universalIntakeArtifacts } from '@/db/schema/interconnected-os';
import { FileImage, FileText, Link2, Sparkles, UploadCloud } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function IntakePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const artifacts = await db.select().from(universalIntakeArtifacts).where(eq(universalIntakeArtifacts.userId, session.user.id)).orderBy(desc(universalIntakeArtifacts.createdAt)).limit(12);
  return <AppShell><div className="mx-auto max-w-6xl space-y-5">
    <header><div className="flex items-center gap-2 text-rose-700"><Sparkles size={18}/><p className="text-[10px] font-bold uppercase tracking-[.2em]">Drop Anything Into Glow</p></div><h1 className="mt-2 text-4xl tracking-[-.04em] text-stone-950" style={{fontFamily:'var(--glow-font-display)'}}>Universal Intake</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">Paste a thought, upload a screenshot, image, PDF, text file, CSV, receipt, schedule, appointment card, list or document. Glow stores it once, classifies what it appears to be, and proposes the systems that should use it.</p></header>
    <section className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
      <form action={universalIntakeAction} className="rounded-[26px] border border-rose-200/70 bg-[linear-gradient(135deg,rgba(255,248,245,.96),rgba(249,228,232,.75))] p-6 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-rose-700">+ Add Anything</p>
        <textarea name="text" rows={6} placeholder="Paste anything here… a reminder, schedule, appointment, shopping list, project idea, receipt text, link, or brain dump." className="mt-4 w-full resize-none rounded-2xl border border-white/80 bg-white/70 p-4 text-sm text-stone-800 outline-none focus:border-rose-300"/>
        <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[.15em] text-stone-400"><span className="h-px flex-1 bg-stone-200"/>or upload<span className="h-px flex-1 bg-stone-200"/></div>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/55 px-5 py-8 text-center hover:bg-white/80"><UploadCloud className="text-rose-500"/><span className="mt-2 text-sm font-medium text-stone-800">Choose any file</span><span className="mt-1 text-[10px] text-stone-500">Images, PDFs, text, CSV, JSON and more · up to 3 MB</span><input name="file" type="file" className="sr-only"/></label>
        <input name="note" placeholder="Optional: tell Glow what this is or why it matters" className="mt-4 w-full rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-xs outline-none focus:border-rose-300"/>
        <button className="mt-4 w-full rounded-xl bg-stone-950 py-3 text-xs font-medium text-white hover:bg-rose-950" type="submit">Understand + Send to Glow Inbox</button>
      </form>
      <div className="space-y-4">
        <div className="rounded-[24px] border border-stone-200 bg-white/75 p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-500">What Glow can recognize</p><div className="mt-4 grid grid-cols-2 gap-2">{[['Appointments',FileText],['Receipts',FileImage],['Schedules',UploadCloud],['Links & notes',Link2]].map(([label,Icon])=>{const I=Icon as typeof FileText;return <div key={String(label)} className="rounded-xl bg-stone-50 p-3"><I size={15} className="text-rose-500"/><p className="mt-2 text-[10px] text-stone-700">{String(label)}</p></div>})}</div></div>
        <div className="rounded-[24px] border border-stone-200 bg-stone-950 p-5 text-white"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-rose-200">One input → many systems</p><p className="mt-3 text-lg" style={{fontFamily:'var(--glow-font-display)'}}>Enter information once. Let relationships do the rest.</p><p className="mt-2 text-[10px] leading-5 text-stone-300">An appointment can belong to Calendar, Tasks, Finance, Beauty, Timeline and Memory without being re-entered six times.</p></div>
      </div>
    </section>
    <section className="rounded-[24px] border border-stone-200 bg-white/70 shadow-sm"><div className="flex items-center justify-between border-b border-stone-200 px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Recent Intake</p><span className="text-[10px] text-stone-400">{artifacts.length}</span></div><div className="divide-y divide-stone-100">{artifacts.length?artifacts.map((item)=><div key={item.id} className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_120px_1fr]"><div><p className="text-sm font-medium text-stone-900">{item.detectedTitle||item.originalName||'Untitled'}</p><p className="mt-1 text-[9px] text-stone-500">{item.originalName||item.kind} · {Math.round(item.confidence*100)}% confidence</p></div><span className="h-fit rounded-full bg-rose-50 px-3 py-1 text-center text-[9px] font-bold uppercase text-rose-800">{item.detectedType||item.kind}</span><div className="flex flex-wrap gap-1">{(item.proposedDestinations??[]).map((destination)=><span key={destination} className="rounded-full bg-stone-100 px-2 py-1 text-[8px] text-stone-600">{destination}</span>)}</div></div>):<p className="p-8 text-center text-xs text-stone-500">Nothing uploaded yet.</p>}</div></section>
  </div></AppShell>;
}
