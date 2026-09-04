'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyAskGlowBridge() {
  const router = useRouter();

  useEffect(() => {
    try {
      window.sessionStorage.setItem('shakti:auto-open', '1');
    } catch {
      // Shakti can still be opened manually if storage is unavailable.
    }
    if (window.history.length > 1) router.back();
    else router.replace('/today');
  }, [router]);

  return <main className="grid min-h-screen place-items-center bg-white text-sm text-neutral-600">Opening Shakti…</main>;
}
