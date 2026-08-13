'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronRight, Focus, Network, Sparkles, Waypoints } from 'lucide-react';
import { getWorldArchitecture } from '@/lib/world-architecture';

export function ArchitecturalWorldFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const room = getWorldArchitecture(pathname);
  const focusHref = `${pathname}?focus=1`;

  return (
    <div className="glow-world-frame" data-world={room.world}>
      <section className="glow-world-context" aria-label={`${room.title} context`}>
        <div className="glow-world-context__copy">
          <p className="glow-world-context__eyebrow">{room.eyebrow}</p>
          <div className="glow-world-context__heading-row">
            <div>
              <h1 className="glow-world-context__title">{room.title}</h1>
              <p className="glow-world-context__statement">{room.statement}</p>
            </div>
            <Link className="glow-world-context__action" href={room.actionHref}>{room.actionLabel}<ArrowUpRight size={14}/></Link>
          </div>
          <nav className="glow-world-controls" aria-label="Spatial controls">
            <Link href={focusHref}><Focus size={13}/>Focus Room</Link>
            <Link href="/brain"><Sparkles size={13}/>Glow</Link>
            <Link href="/graph"><Network size={13}/>Relationships</Link>
            <Link href="/timeline"><Waypoints size={13}/>Timeline</Link>
            <Link href="/world">World<ArrowUpRight size={12}/></Link>
          </nav>
        </div>
        <aside className="glow-world-context__rail">
          <div className="glow-world-intelligence"><Sparkles size={14}/><span>{room.insight}</span></div>
          <nav className="glow-world-related" aria-label="Related rooms">
            {room.context.map(item => <Link key={item.href} href={item.href}>{item.label}<ChevronRight size={12}/></Link>)}
          </nav>
        </aside>
      </section>
      <div className="glow-world-primary-canvas">{children}</div>
    </div>
  );
}
