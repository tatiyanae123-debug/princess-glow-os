import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { AppShell } from '@/components/app-shell';
import { UniversalIntakeForm } from '@/components/intake/universal-intake-form';
import { db } from '@/db';
import { universalIntakeArtifacts } from '@/db/schema/interconnected-os';
import { FileImage, FileText, Link2, Sparkles, UploadCloud } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function IntakePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  let artifacts;
  try {
    artifacts = await db.select().from(universalIntakeArtifacts).where(eq(universalIntakeArtifacts.userId, session.user.id)).orderBy(desc(universalIntakeArtifacts.createdAt)).limit(12);
  } catch {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl rounded-[20px] border border-[#F1E7E3] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#2B2420]">Universal Intake is installed and needs one-time intelligence activation.</p>
          <p className="mt-2 text-[12px] leading-5 text-[#8A8078]">Activation creates only the new idempotent Glow intelligence tables and keeps existing data untouched.</p>
          <Link href="/settings/intelligence" className="mt-4 inline-block rounded-full bg-[#2B2420] px-4 py-2.5 text-[12px] text-white">Activate Glow Intelligence →</Link>
        </div>
      </AppShell>
    );
  }
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <div className="flex items-center gap-2 text-[#C9727E]"><Sparkles size={18} /><p className="text-[11px] font-semibold uppercase tracking-[.16em]">Drop Anything Into Glow</p></div>
          <h1 className="glow-display mt-2 text-[38px] leading-none text-[#2B2420] sm:text-[42px]">Universal Intake</h1>
          <p className="mt-2 max-w-3xl text-[13px] leading-6 text-[#8A8078]">Paste a thought, upload a screenshot, image, PDF, text file, CSV, receipt, schedule, appointment card, list or document. Glow stores it once, classifies what it appears to be, and proposes the systems that should use it.</p>
        </header>
        <section className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
          <UniversalIntakeForm />
          <div className="space-y-4">
            <div className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">What Glow can recognize</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[['Appointments', FileText], ['Receipts', FileImage], ['Schedules', UploadCloud], ['Links & notes', Link2]].map(([label, Icon]) => {
                  const I = Icon as typeof FileText;
                  return <div key={String(label)} className="rounded-[14px] bg-[#FDF8F6] p-3"><I size={15} className="text-[#C9727E]" /><p className="mt-2 text-[11.5px] text-[#4A4440]">{String(label)}</p></div>;
                })}
              </div>
            </div>
            <div className="rounded-[20px] border border-[#F1E7E3] bg-[#2B2420] p-5 text-white">
              <p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#E4C9C0]">One input → many systems</p>
              <p className="glow-display mt-3 text-[18px]">Enter information once. Let relationships do the rest.</p>
              <p className="mt-2 text-[11px] leading-5 text-white/65">An appointment can belong to Calendar, Tasks, Finance, Beauty, Timeline and Memory without being re-entered six times.</p>
            </div>
          </div>
        </section>
        <section className="rounded-[20px] border border-[#F1E7E3] bg-white">
          <div className="flex items-center justify-between border-b border-[#F1E7E3] px-5 py-4"><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Recent Intake</p><span className="text-[11px] text-[#B5ACA5]">{artifacts.length}</span></div>
          <div className="divide-y divide-[#F1E7E3]">
            {artifacts.length ? artifacts.map((item) => (
              <div key={item.id} className="grid gap-2 px-5 py-4 md:grid-cols-[1fr_120px_1fr]">
                <div><p className="text-[13px] font-medium text-[#2B2420]">{item.detectedTitle || item.originalName || 'Untitled'}</p><p className="mt-1 text-[10.5px] text-[#8A8078]">{item.originalName || item.kind} · {Math.round(item.confidence * 100)}% confidence</p></div>
                <span className="h-fit rounded-full bg-[#FBE4E8] px-3 py-1 text-center text-[10px] font-semibold uppercase text-[#B15A68]">{item.detectedType || item.kind}</span>
                <div className="flex flex-wrap gap-1">{(item.proposedDestinations ?? []).map((destination) => <span key={destination} className="rounded-full bg-[#FDF8F6] px-2.5 py-1 text-[10px] text-[#8A8078]">{destination}</span>)}</div>
              </div>
            )) : <p className="p-8 text-center text-[12px] text-[#8A8078]">Nothing uploaded yet.</p>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
