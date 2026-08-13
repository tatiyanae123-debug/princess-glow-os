import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { buildBrainConnections } from '@/lib/intelligence/brain-connections';
import { ArrowLeft, ArrowRight, Link2, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

const BASIS_LABEL: Record<string, string> = {
  stored: 'Stored relationship',
  inferred: 'Inferred by rule',
  system: 'Same connected system',
};
const BASIS_TONE: Record<string, string> = {
  stored: 'bg-[#E4EBDD] text-[#5A6E52]',
  inferred: 'bg-[#F1E8D9] text-[#9A7A3D]',
  system: 'bg-[#E9E4F2] text-[#7C6B9C]',
};

export default async function BrainConnectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const connections = await buildBrainConnections(session.user.id);

  return (
    <AppShell>
      <div className="space-y-4">
        <Link href="/brain" className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#8A8078] hover:text-[#4A4440]"><ArrowLeft size={13} />Back to Brain</Link>

        <div className="rounded-[20px] border border-[#F1E7E3] bg-white p-6 sm:p-7">
          <div className="flex items-center gap-2 text-[#C9727E]"><Link2 size={16} /><p className="text-[11px] font-semibold uppercase tracking-[.16em]">Active Connections</p></div>
          <h1 className="glow-display mt-2 text-[32px] leading-none text-[#2B2420] sm:text-[36px]">Every real link Glow currently sees.</h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-5 text-[#8A8078]">{connections.totalInstances} active connection{connections.totalInstances === 1 ? '' : 's'} across {connections.activeTypeCount} connection type{connections.activeTypeCount === 1 ? '' : 's'}. An &ldquo;active connection&rdquo; is one concrete link between two real records — a stored relationship, a deterministic rule match, or two rooms drawing from the same underlying data.</p>
        </div>

        <div className="space-y-3">
          {connections.types.map((type) => (
            <Link key={type.id} href={`/brain/connections/${type.id}`} className="block rounded-[18px] border border-[#F1E7E3] bg-white p-5 transition hover:border-[#C9727E]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="glow-display text-[19px] text-[#2B2420]">{type.label}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[.06em] ${BASIS_TONE[type.basis]}`}>{BASIS_LABEL[type.basis]}</span>
                  </div>
                  <p className="mt-2 max-w-xl text-[11.5px] leading-4 text-[#8A8078]">{type.rule}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right"><p className="glow-display text-[24px] text-[#C9727E]">{type.instances.length}</p><p className="text-[10px] uppercase tracking-[.08em] text-[#B5ACA5]">active</p></div>
                  <ArrowRight size={15} className="text-[#B5ACA5]" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-[16px] border border-[#F1E7E3] bg-[#FDF8F6] p-4 text-[11px] leading-4 text-[#8A8078]">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#5A6E52]" />
          Glow never invents a relationship. Every connection above is either a value stored directly in your data, a deterministic rule applied to two real records, or two rooms that already share the same underlying table.
        </div>
      </div>
    </AppShell>
  );
}
