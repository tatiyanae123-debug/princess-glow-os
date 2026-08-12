'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Restores the last view/tab a user had open on a given room (e.g. Calendar's
 * ?view=month, Tasks' ?view=upcoming) so returning to a room feels like
 * walking back into the same room, per the Glow OS context-memory rule.
 */
export function ReferenceRoomInteractions() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`glow:last-view:${pathname}`);
      const current = new URLSearchParams(window.location.search).get('view');
      if (saved && !current) {
        router.replace(`${pathname}?view=${encodeURIComponent(saved)}`);
      }
    } catch {
      /* local storage unavailable */
    }
  }, [pathname, router]);

  return null;
}
