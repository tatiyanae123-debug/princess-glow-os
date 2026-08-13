'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronRight, Sparkles } from 'lucide-react';
import { getWorldArchitecture } from '@/lib/world-architecture';

export function ArchitecturalWorldLayer() {
  const pathname = usePathname();
  const room = getWorldArchitecture(pathname);

  return (
    <section className="glow-architectural-layer" data-world={room.world} data-metaphor={room.metaphor} aria-label={`${room.title} architectural context`}>
      <div className="glow-architectural-layer__topline">
        <div className="glow-architectural-layer__crumbs" aria-label="Current location">
          <Link href="/world">Glow World</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span>{room.title}</span>
        </div>
        <Link href="/world" className="glow-architectural-layer__world-link">
          Spaces <ArrowUpRight size={12} aria-hidden="true" />
        </Link>
      </div>

      <div className="glow-architectural-layer__body">
        <div className="glow-architectural-layer__hero">
          <p className="glow-architectural-layer__eyebrow">{room.eyebrow}</p>
          <h1>{room.title}</h1>
          <p className="glow-architectural-layer__statement">{room.statement}</p>
          <div className="glow-architectural-layer__actions">
            <Link href={room.actionHref} className="glow-architectural-layer__primary">{room.actionLabel}</Link>
            <Link href="/brain" className="glow-architectural-layer__secondary"><Sparkles size={14} aria-hidden="true" /> Ask Glow</Link>
          </div>
        </div>

        <aside className="glow-architectural-layer__rail" aria-label="Glow intelligence and connected places">
          <p className="glow-architectural-layer__rail-label">Glow intelligence</p>
          <p className="glow-architectural-layer__insight">{room.insight}</p>
          <div className="glow-architectural-layer__related">
            {room.context.map(item => (
              <Link key={item.href} href={item.href}>{item.label}<ArrowUpRight size={11} aria-hidden="true" /></Link>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
