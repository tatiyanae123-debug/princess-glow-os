'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ArrowUpRight, ChevronRight, Focus, Layers3, Network, ShieldCheck, Sparkles, Waypoints, ZoomIn, MoonStar } from 'lucide-react';
import { getWorldArchitecture } from '@/lib/world-architecture';

const LIFE_LAYERS = [
  ['Events','/calendar'],['Health','/wellness'],['Money','/finance/brain'],['Work','/work'],['Beauty','/beauty'],['Relationships','/graph'],['Travel','/world'],['Projects','/projects'],['Mood','/wellness'],['Memories','/memory'],['Habits','/habits'],
] as const;

function daypart(hour:number){if(hour<6)return'night';if(hour<12)return'morning';if(hour<17)return'afternoon';if(hour<21)return'evening';return'night'}

export function ArchitecturalWorldFrameV2({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const room = getWorldArchitecture(pathname);
  const [clock,setClock]=useState<Date|null>(null);
  useEffect(()=>{setClock(new Date());const id=window.setInterval(()=>setClock(new Date()),60000);return()=>window.clearInterval(id)},[]);
  const period=daypart(clock?.getHours()??12);
  const ambient=params.get('ambient')==='1';
  const focusHref = `${pathname}?focus=1`;
  const ambientHref = ambient ? pathname : `${pathname}?ambient=1`;
  const dateLabel=useMemo(()=>clock?.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})??'',[clock]);
  const timeLabel=useMemo(()=>clock?.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})??'',[clock]);

  return (
    <div className="glow-world-frame" data-world={room.world} data-daypart={period} data-ambient={ambient?'true':'false'}>
      <section className="glow-world-context" aria-label={`${room.title} context`}>
        <div className="glow-world-context__copy">
          <div className="glow-world-context__meta"><p className="glow-world-context__eyebrow">{room.eyebrow}</p>{clock?<span>{dateLabel} · {timeLabel}</span>:null}</div>
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
            <Link href="/world"><ZoomIn size={13}/>World</Link>
            <Link href={ambientHref} aria-pressed={ambient}><MoonStar size={13}/>{ambient?'Exit Ambient':'Ambient'}</Link>
          </nav>
        </div>
        <aside className="glow-world-context__rail">
          <div className="glow-world-intelligence"><Sparkles size={14}/><span>{room.insight}</span></div>
          <nav className="glow-world-related" aria-label="Related rooms">
            {room.context.map(item => <Link key={item.href} href={item.href}>{item.label}<ChevronRight size={12}/></Link>)}
          </nav>
          <Link href="/connections" className="glow-world-trust"><ShieldCheck size={13}/><span>Data & privacy</span><ChevronRight size={12}/></Link>
        </aside>
      </section>

      {ambient?<section className="glow-ambient-panel" aria-label="Ambient mode"><p>Ambient Mode</p><strong>{timeLabel}</strong><span>{room.title}</span><small>{room.insight}</small><div><Link href="/today">Today</Link><Link href="/calendar">Calendar</Link><Link href={pathname}>Return to room</Link></div></section>:null}

      {!ambient?<>
        <section className="glow-life-layers" aria-label="Life layers">
          <div className="glow-life-layers__label"><Layers3 size={13}/><span>Life Layers</span></div>
          <div className="glow-life-layers__links">{LIFE_LAYERS.map(([label,href])=><Link key={label} href={href}>{label}</Link>)}</div>
        </section>
        <div className="glow-world-primary-canvas">{children}</div>
        <footer className="glow-world-depth-footer">
          <div><span>ZOOM</span><Link href="/graph">Object</Link><Link href="/all-rooms">Collection</Link><Link href={pathname}>Room</Link><Link href="/world">World</Link><Link href="/timeline">Timeline</Link></div>
          <div><span>NEXT</span><Link href="/brain">Ask Glow</Link><Link href="/search">Search everything</Link><Link href="/import">Add anything</Link></div>
        </footer>
      </>:null}
    </div>
  );
}
