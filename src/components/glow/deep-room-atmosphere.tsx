'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getDeepRoomIdentity } from '@/lib/design/deep-room-manifest';

export function DeepRoomAtmosphere() {
  const pathname = usePathname();

  useEffect(() => {
    const room = getDeepRoomIdentity(pathname);
    const body = document.body;
    const keys = ['glowWorld','glowDomain','glowMaterial','glowEnclosure','glowRoom'] as const;

    if (!room) {
      keys.forEach((key) => delete body.dataset[key]);
      return;
    }

    body.dataset.glowWorld = room.world;
    body.dataset.glowDomain = room.domain;
    body.dataset.glowMaterial = room.material;
    body.dataset.glowEnclosure = room.enclosure;
    body.dataset.glowRoom = room.id;

    return () => keys.forEach((key) => delete body.dataset[key]);
  }, [pathname]);

  return null;
}
