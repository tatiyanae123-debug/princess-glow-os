'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { BrainCircuit, CalendarDays, CheckCircle2, Dumbbell, Heart, Home, ListChecks, Menu, Moon, NotebookTabs, Search, Settings, Sparkles, Utensils, WandSparkles, X } from 'lucide-react';

const NAV = [
  ['Dashboard', '/dashboard', Home], ['Morning Brief', '/briefings/morning', NotebookTabs], ['Evening Debrief', '/briefings/evening', Moon], ['Calendar', '/calendar', CalendarDays], ['Tasks', '/tasks', ListChecks], ['Routines', '/routines', Sparkles], ['Habits', '/habits', CheckCircle2], ['Wellness', '/wellness', Heart], ['Fitness', '/fitness', Dumbbell], ['Food', '/food', Utensils], ['Beauty', '/beauty', WandSparkles], ['Hair', '/hair', Sparkles], ['Brain', '/brain', BrainCircuit], ['Concierge', '/concierge', Sparkles], ['Memory', '/memory', NotebookTabs], ['Timeline', '/timeline', Sparkles], ['All Rooms', '/all-rooms', Sparkles],
] as const;

function Side({ name, image, onClose }: { name: string; image?: string | null; onClose?: () => void }) {
  const pathname = usePathname();
  return <aside className="ir-sidebar">
    <div className="ir-brand"><Sparkles size={18} /><span>Glow OS</span>{onClose ? <button type="button" onClick={onClose} aria-label="Close navigation"><X size={16} /></button> : null}</div>
    <nav>{NAV.map(([label, href, Icon]) => <Link key={href} href={href} onClick={onClose} className={pathname === href || pathname.startsWith(`${href}/`) ? 'active' : ''}><Icon size={14} /><span>{label}</span></Link>)}</nav>
    <div className="ir-side-bottom">
      <Link href="/settings?section=profile" className="ir-profile">
        {image ? <>{/* Arbitrary OAuth/avatar hosts cannot safely be allowlisted for next/image. */}{/* eslint-disable-next-line @next/next/no-img-element */}<img src={image} alt="Profile" /></> : <span>{name.slice(0, 1).toUpperCase()}</span>}
        <div><strong>{name}</strong><small>View Profile</small></div>
      </Link>
      <Link href="/settings" className="ir-more"><Settings size={15} /></Link>
    </div>
  </aside>;
}

export function ImmersiveRoomChrome({ name, image }: { name: string; image?: string | null }) {
  const [open, setOpen] = useState(false);
  return <><div className="ir-desktop-side"><Side name={name} image={image} /></div><button type="button" className="ir-mobile-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={17} /><span>Glow OS</span></button>{open ? <><button type="button" className="ir-scrim" onClick={() => setOpen(false)} aria-label="Close navigation" /><div className="ir-drawer"><Side name={name} image={image} onClose={() => setOpen(false)} /></div></> : null}</>;
}

export function ImmersiveTopControls({ searchHref = '/search' }: { searchHref?: string }) {
  function customize() { document.querySelector<HTMLButtonElement>('.glow-customize-fab')?.click(); }
  return <div className="ir-top-controls"><Link href={searchHref} aria-label="Search"><Search size={16} /></Link><Link href="/memory" aria-label="Memory"><NotebookTabs size={16} /></Link><button type="button" onClick={customize} aria-label="Customize"><Settings size={16} /></button></div>;
}

export function OpenGlowCommand({ label = 'Ask Glow anything...' }: { label?: string }) {
  function open() { document.dispatchEvent(new CustomEvent('glow:open-conversation')); }
  return <button type="button" className="ir-command-trigger" onClick={open}><span>{label}</span><span className="ir-command-mic">●</span></button>;
}

export function QuickAddGlow({ module, label }: { module: string; label: string }) {
  function add() { document.dispatchEvent(new CustomEvent('glow:quick-add', { detail: { module } })); }
  return <button type="button" onClick={add}>{label}</button>;
}
