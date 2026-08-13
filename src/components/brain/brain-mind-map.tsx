'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BadgeDollarSign, BookOpen, Briefcase, Dumbbell, HeartPulse, Lightbulb, Maximize2, Target } from 'lucide-react';
import type { BrainMapDomain } from '@/lib/intelligence/brain-connections';

const ICONS: Record<string, typeof Target> = {
  goals: Target,
  fitness: Dumbbell,
  finance: BadgeDollarSign,
  work: Briefcase,
  ideas: Lightbulb,
  wellness: HeartPulse,
  memories: BookOpen,
};

// Positions on a 0-100 coordinate plane, matching the reference's radial layout.
const POSITIONS: Record<string, { x: number; y: number }> = {
  fitness: { x: 50, y: 10 },
  goals: { x: 20, y: 27 },
  finance: { x: 80, y: 27 },
  work: { x: 12, y: 60 },
  ideas: { x: 88, y: 60 },
  memories: { x: 26, y: 90 },
  wellness: { x: 74, y: 90 },
};

export function BrainMindMap({ domains }: { domains: BrainMapDomain[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-medium text-[#2B2420]">Your Mind Map</p>
        <button type="button" onClick={() => setExpanded((v) => !v)} className="flex items-center gap-1.5 rounded-full border border-[#F1E7E3] px-3 py-1.5 text-[11px] font-medium text-[#8A8078] hover:bg-[#FDF8F6]">
          <Maximize2 size={12} />{expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Desktop / tablet radial map */}
      <div className={`relative mx-auto mt-6 hidden w-full sm:block ${expanded ? 'aspect-[3/2] max-w-[720px]' : 'aspect-[16/10] max-w-[620px]'}`}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {domains.map((domain) => {
            const pos = POSITIONS[domain.id];
            if (!pos) return null;
            return <line key={domain.id} x1={50} y1={50} x2={pos.x} y2={pos.y} stroke="#EBD6D3" strokeWidth={0.4} />;
          })}
        </svg>

        <Link href="/brain" className="absolute flex h-[88px] w-[88px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[#FBE4E8] text-[#B15A68] shadow-[0_6px_20px_rgba(201,114,126,.18)]" style={{ left: '50%', top: '50%' }}>
          <span className="glow-display text-[20px]">You</span>
        </Link>

        {domains.map((domain) => {
          const pos = POSITIONS[domain.id];
          if (!pos) return null;
          const Icon = ICONS[domain.id] ?? Target;
          return (
            <Link
              key={domain.id}
              href={domain.href}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11.5px] font-medium text-[#4A4440] shadow-[0_4px_14px_rgba(80,60,55,.06)] transition hover:-translate-y-[calc(50%+2px)] hover:border-[#C9727E] hover:text-[#B15A68]"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              title={`${domain.count} in ${domain.label}`}
            >
              <Icon size={13} className="text-[#C9727E]" />{domain.label}
            </Link>
          );
        })}
      </div>

      {/* Mobile: stacked "You" + scrollable domain strip */}
      <div className="mt-6 sm:hidden">
        <div className="mx-auto flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-[#FBE4E8] text-[#B15A68]">
          <span className="glow-display text-[16px]">You</span>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {domains.map((domain) => {
            const Icon = ICONS[domain.id] ?? Target;
            return (
              <Link key={domain.id} href={domain.href} className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11.5px] font-medium text-[#4A4440]">
                <Icon size={13} className="text-[#C9727E]" />{domain.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-[#F1E7E3] pt-4">
        <Link href="/brain/connections" className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#8A8078] hover:text-[#4A4440]">View as List</Link>
        <Link href="/memory" title="Save a memory and link it to a project — the one place Glow OS lets you create a real connection by hand" className="flex items-center gap-2 rounded-full bg-[#C9727E] px-4 py-2 text-[11.5px] font-medium text-white hover:bg-[#B15A68]">Add Connection</Link>
      </div>
    </div>
  );
}
