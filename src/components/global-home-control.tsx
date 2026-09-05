'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Permanent Glow OS Home anchor for routes that do not own a stronger local
 * navigation authority.
 *
 * /today has its own single TodayNavigationAuthority, which permanently owns
 * Glow OS / Today / Ask Glow above every Today room. Keeping this fallback out
 * of /today prevents duplicate or competing navigation layers.
 *
 * Permanent rule: Glow OS = Home.
 */
export function GlobalHomeControl() {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/home' || pathname === '/sign-in' || pathname === '/today') {
    return null;
  }

  return (
    <Link
      href="/home"
      aria-label="Glow OS Home"
      data-global-glow-home-control="true"
      className="fixed left-[max(14px,env(safe-area-inset-left))] top-[max(14px,env(safe-area-inset-top))] z-[30000] inline-flex min-h-11 items-center gap-2 rounded-full border border-white/85 bg-white/78 px-3.5 py-2.5 text-[13px] font-semibold tracking-[-0.01em] text-neutral-800 shadow-[0_14px_45px_rgba(70,60,70,0.14),inset_0_1px_0_rgba(255,255,255,0.98)] backdrop-blur-2xl transition duration-200 hover:-translate-y-0.5 hover:bg-white/92 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500/35"
    >
      <span
        aria-hidden="true"
        className="h-5 w-5 rounded-full border border-white/95 bg-[radial-gradient(circle_at_30%_24%,_#fff_0%,_#fff_20%,_#eee8ff_43%,_#f7e7dd_67%,_rgba(255,255,255,0.62)_100%)] shadow-[0_5px_16px_rgba(126,111,148,0.20),inset_0_1px_3px_rgba(255,255,255,0.95)]"
      />
      <span>Glow OS</span>
    </Link>
  );
}
