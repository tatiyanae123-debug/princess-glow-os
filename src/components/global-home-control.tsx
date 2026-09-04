'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function GlobalHomeControl() {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/sign-in' || pathname === '/dashboard' || pathname === '/today') {
    return null;
  }

  return (
    <Link
      href="/dashboard"
      aria-label="Go to Glow OS Home"
      className="fixed left-4 top-4 z-[120] inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/70 px-3 py-2 text-xs font-medium text-slate-700 shadow-[0_12px_38px_rgba(15,23,42,0.10)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white"
    >
      <Home size={15} strokeWidth={1.65} />
      <span>Home</span>
    </Link>
  );
}
