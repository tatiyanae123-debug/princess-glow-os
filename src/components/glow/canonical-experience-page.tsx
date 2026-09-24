import Link from 'next/link';
import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { CanonicalExperienceSpec } from '@/lib/glow-world/canonical-experiences';
import { CanonicalDomainRoom, type CanonicalDomainClimate } from './canonical-domain-room';

export function CanonicalExperiencePage({ spec }: { spec: CanonicalExperienceSpec }) {
  const climate = spec.climate as CanonicalDomainClimate;

  return (
    <CanonicalDomainRoom
      eyebrow={spec.eyebrow}
      title={spec.title}
      question={spec.question}
      climate={climate}
      destinations={[
        { label: spec.parentLabel, href: spec.parentHref, cue: 'Return to the parent system' },
        { label: 'Search', href: '/search', cue: 'Find connected Glow objects' },
        { label: 'Shakti', href: '/ask-glow', cue: 'Use current workspace context' },
      ]}
    >
      <div data-canonical-experience={spec.path} data-enclosure={spec.enclosure} className="space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-[13px] border border-white/78 bg-white/38 px-3 py-2">
          <Link href={spec.parentHref} className="inline-flex items-center gap-1.5 text-[8px] text-[#806f67]">
            <ArrowLeft size={10} /> {spec.parentLabel}
          </Link>
          <span className="rounded-full bg-white/48 px-2.5 py-1 text-[6.5px] uppercase tracking-[.14em] text-[#9b8b82]">{spec.enclosure} workspace</span>
        </div>

        <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3" aria-label={`${spec.title} structure`}>
          {spec.sections.map((section, index) => (
            <article key={section} className="min-h-[110px] rounded-[15px] border border-white/80 bg-white/43 p-3.5 shadow-[0_10px_28px_rgba(72,56,48,.035)] backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[radial-gradient(circle,#fff,#eee7f5_58%,#e3eeee)] text-[7px] text-[#756b7e]">{String(index + 1).padStart(2, '0')}</span>
                <ChevronRight size={10} className="mt-2 text-[#ae9f96]" />
              </div>
              <h2 className="glow-display mt-3 text-[15px] text-[#413833]">{section}</h2>
              <p className="mt-1 text-[7.5px] leading-4 text-[#8b7e76]">This area is reserved for real connected Glow objects and actions from this system.</p>
            </article>
          ))}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[15px] border border-white/78 bg-[linear-gradient(145deg,rgba(255,255,255,.50),rgba(242,238,245,.34))] p-3.5">
          <div>
            <p className="glow-eyebrow">Workspace intelligence</p>
            <p className="mt-1 text-[8px] text-[#766a63]">Shakti receives this page’s real route and object context. Nothing here is promoted to reality until the underlying action succeeds.</p>
          </div>
          <Link href="/ask-glow" className="inline-flex items-center gap-1.5 rounded-full bg-[#342e2b] px-4 py-2 text-[8px] text-white">
            <Sparkles size={10} /> Ask Shakti
          </Link>
        </div>
      </div>
    </CanonicalDomainRoom>
  );
}
