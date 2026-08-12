'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleUserRound } from 'lucide-react';
import { navItems } from '@/lib/navigation';

export function EditorialSidebar() {
  const pathname = usePathname();
  return (
    <aside className="editorial-sidebar">
      <div className="editorial-brand"><strong>GLOW OS</strong><span>PRINCESS COMMAND CENTER</span></div>
      <div className="editorial-profile"><CircleUserRound /><div><strong>Princess</strong><small>Glow OS member</small><span>● &nbsp; On Track</span></div></div>
      <nav>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return <Link key={item.href} href={item.href} className={active ? 'active' : ''}><Icon />{item.label === 'Tasks' ? 'Tasks & Planner' : item.label}</Link>;
        })}
      </nav>
      <Link className="all-rooms" href="/world">View all rooms &nbsp; ⊙</Link>
    </aside>
  );
}
