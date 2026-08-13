import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { buildBrainConnections } from '@/lib/intelligence/brain-connections';
import { ArrowLeft, ArrowUpRight, Clock3, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

const BASIS_LABEL: Record<string, string> = {
  stored: 'Stored relationship',
  inferred: 'Inferred by rule',
  system: 'Same connected system',
};

function recencyLabel(date: Date | null) {
  if (!date) return 'No date on record';
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default async function BrainConnectionDetailPage({ params }: { params: Promise<{ type: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const { type: typeId } = await params;
  const connections = await buildBrainConnections(session.user.id);
  const type = connections.types.find((t) => t.id === typeId);
  if (!type) notFound();

  return (
    <AppShell>
      <div className="space-y-4">
        <Link href="/brain/connections" className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#8A8078] hover:text-[#4A4440]"><ArrowLeft size={13} />Back to Active Connections</Link>

        <div className="rounded-[20px] border border-[#F1E7E3] bg-white p-6 sm:p-7">
          <p className="glow-eyebrow">{BASIS_LABEL[type.basis]}</p>
          <h1 className="glow-display mt-2 text-[32px] leading-none text-[#2B2420] sm:text-[36px]">{type.label}</h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-5 text-[#8A8078]">{type.rule}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={type.hrefA} className="rounded-full border border-[#F1E7E3] bg-[#FDF8F6] px-3.5 py-2 text-[11.5px] font-medium text-[#4A4440] hover:bg-[#FBE4E8]">Open {type.domainA} →</Link>
            <Link href={type.hrefB} className="rounded-full border border-[#F1E7E3] bg-[#FDF8F6] px-3.5 py-2 text-[11.5px] font-medium text-[#4A4440] hover:bg-[#FBE4E8]">Open {type.domainB} →</Link>
          </div>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white">
          <div className="flex items-center justify-between border-b border-[#F1E7E3] px-5 py-4">
            <p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Evidence</p>
            <span className="text-[11px] text-[#B5ACA5]">{type.instances.length} instance{type.instances.length === 1 ? '' : 's'}</span>
          </div>
          {type.instances.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[13px] text-[#2B2420]">No active instances of this connection yet.</p>
              <p className="mt-2 text-[11.5px] text-[#8A8078]">This will populate automatically once your {type.domainA} and {type.domainB} records line up under the rule above.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F1E7E3]">
              {type.instances.map((instance) => (
                <article key={instance.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="glow-display text-[15px] text-[#2B2420]">{instance.title}</p>
                      <p className="mt-1.5 text-[12px] leading-5 text-[#4A4440]">{instance.detail}</p>
                      <p className="mt-2 flex items-center gap-1.5 text-[10.5px] text-[#B5ACA5]"><Clock3 size={11} />{recencyLabel(instance.occurredAt)}</p>
                    </div>
                    <Link href={instance.href} className="flex shrink-0 items-center gap-1 rounded-full border border-[#F1E7E3] bg-[#FDF8F6] px-3 py-1.5 text-[10.5px] font-medium text-[#C9727E] hover:bg-[#FBE4E8]">Open <ArrowUpRight size={11} /></Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-[16px] border border-[#F1E7E3] bg-[#FDF8F6] p-4 text-[11px] leading-4 text-[#8A8078]">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#5A6E52]" />
          {type.basis === 'stored' ? 'This connection reads a value that is already stored on your record — nothing here is guessed.' : type.basis === 'system' ? 'These two rooms already draw from the same underlying data, so this reflects real shared state rather than a computed guess.' : 'This connection is computed with a deterministic rule from real records. It reflects a pattern, not a proven cause — treat it as a starting point, not a conclusion.'}
        </div>
      </div>
    </AppShell>
  );
}
