'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AskGlowBridge() {
  const router = useRouter();

  useEffect(() => {
    window.setTimeout(() => document.dispatchEvent(new CustomEvent('glow:open')), 0);
    if (window.history.length > 1) router.back();
    else router.replace('/today');
  }, [router]);

  return <main className="grid min-h-screen place-items-center bg-white text-sm text-neutral-600">Opening Glow…</main>;
}
