'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useGlow } from '@/lib/context/glow-provider';

export type OperatingAreaGroup = {
  id?: string;
  title: string;
  description: string;
  items: { label: string; href: string; description: string; priority?: 'essential' | 'normal' | 'bonus' }[];
};

export function OperatingAreaPage({
  eyebrow,
  title,
  description,
  question,
  groups,
}: {
  eyebrow: string;
  title: string;
  description: string;
  question: string;
  groups: OperatingAreaGroup[];
}) {
  const { productivityMode, productivityModeInfo } = useGlow();

  const modeMessage = productivityMode === 'very-productive'
    ? 'Full-capacity view is active. Glow can surface stretch work and useful extras without treating them as requirements.'
    : productivityMode === 'normal'
      ? 'Balanced view is active. Glow keeps the core plan visible and protects breathing room.'
      : productivityMode === 'low'
        ? 'Low-capacity view is active. Glow is reducing this area to essentials and safe next steps.'
        : 'Recovery view is active. Glow is protecting this area from nonessential pressure and showing only what truly needs attention.';

  return (
    <div className="glow-v4-page mx-auto w-full max-w-[1320px] pb-20">
      <section className="glow-v4-card-hero overflow-hidden bg-[radial-gradient(circle_at_80%_10%,rgba(247,217,223,.78),transparent_32%),linear-gradient(140deg,#fffdfb,#fbf2ef_58%,#f4eee5)]">
        <div className="max-w-3xl">
          <p className="glow-v4-eyebrow">{eyebrow}</p>
          <h1 className="glow-v4-title mt-4">{title}</h1>
          <p className="glow-v4-copy mt-5">{description}</p>
        </div>
        <div className="mt-8 grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-[18px] border border-white/80 bg-white/75 p-5 backdrop-blur-xl">
            <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#aa777f]">Focus question</p>
            <p className="mt-2 font-serif text-[24px] leading-tight text-[#332d29]">{question}</p>
          </div>
          <div className="rounded-[18px] border border-white/80 bg-white/75 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-2"><Sparkles size={14} className="text-[#bd6678]"/><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#aa777f]">{productivityModeInfo.label}</p></div>
            <p className="mt-2 text-[11.5px] leading-5 text-[#786f69]">{modeMessage}</p>
          </div>
        </div>
      </section>

      <div className="glow-v4-section">
        {groups.map((group) => (
          <section key={group.title} id={group.id} className="scroll-mt-24">
            <div className="mb-5 max-w-2xl">
              <h2 className="font-serif text-[30px] leading-none text-[#302a27]">{group.title}</h2>
              <p className="mt-2 text-[12px] leading-5 text-[#837a74]">{group.description}</p>
            </div>
            <div className="glow-v4-card-grid md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-glow-priority={item.priority ?? 'normal'}
                  className="glow-v4-card-standard group flex min-h-[168px] flex-col justify-between transition hover:-translate-y-0.5 hover:border-[#e3d5d0] hover:shadow-[0_18px_45px_rgba(69,47,39,.07)]"
                >
                  <div>
                    <p className="font-serif text-[22px] leading-tight text-[#302a27]">{item.label}</p>
                    <p className="mt-2 text-[11.5px] leading-5 text-[#837a74]">{item.description}</p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1 text-[11px] font-medium text-[#b95f72]">Open <ArrowRight size={12} className="transition group-hover:translate-x-0.5"/></span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
