'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { roomExperienceFor } from '@/lib/glow-world/room-experience';
import { pageManifestFor } from '@/lib/glow-world/page-manifest';

/**
 * Wave 1 Global Core bridge.
 *
 * This is deliberately small. It does not create a second shell, assistant,
 * search surface, or navigation runtime. It translates legacy/global entry
 * events into the one canonical Glow Current + Glow Presence runtime while
 * attaching the current page identity to intelligence requests.
 */
export function GlobalCoreBridge() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    const experience = roomExperienceFor(pathname);
    const manifest = pageManifestFor(pathname);
    const currentPath = search ? `${pathname}?${search}` : pathname;
    const world = manifest?.world ?? experience.world;
    const room = experience.room;
    const pageId = manifest?.id ?? 'unregistered';
    const family = manifest?.family ?? 'legacy-unregistered';

    const publishContext = () => {
      document.documentElement.dataset.glowCanonicalWorld = world;
      document.documentElement.dataset.glowCanonicalRoom = room;
      document.documentElement.dataset.glowCanonicalPage = pageId;
      document.documentElement.dataset.glowCanonicalFamily = family;
      document.dispatchEvent(new CustomEvent('glow:context', {
        detail: {
          label: room,
          type: 'location',
          id: pageId,
          route: currentPath,
          world,
          family,
        },
      }));
    };

    // Every Ask Glow / Shakti entry receives current location context before
    // GlowPresence handles the same event. Existing page-local buttons remain
    // compatible without owning a second intelligence implementation.
    const contextualizeGlowOpen = () => publishContext();

    const openSearch = (event: Event) => {
      const detail = (event as CustomEvent<{ query?: string }>).detail;
      const query = detail?.query?.trim();
      const path = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
      document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } }));
    };

    const openShakti = (event: Event) => {
      const detail = (event as CustomEvent<{ prefill?: string }>).detail;
      publishContext();
      document.dispatchEvent(new CustomEvent('glow:open', { detail }));
    };

    const openWorldFold = () => document.dispatchEvent(new CustomEvent('glow:world-fold'));
    const reverseCurrent = () => document.dispatchEvent(new CustomEvent('glow:reverse-current'));

    document.addEventListener('glow:open', contextualizeGlowOpen, { capture: true });
    document.addEventListener('glow:search', openSearch as EventListener);
    document.addEventListener('glow:shakti', openShakti as EventListener);
    document.addEventListener('glow:open-worlds', openWorldFold);
    document.addEventListener('glow:back', reverseCurrent);

    document.dispatchEvent(new CustomEvent('glow:global-core-ready', {
      detail: { currentPath, world, room, pageId, family },
    }));

    return () => {
      document.removeEventListener('glow:open', contextualizeGlowOpen, { capture: true });
      document.removeEventListener('glow:search', openSearch as EventListener);
      document.removeEventListener('glow:shakti', openShakti as EventListener);
      document.removeEventListener('glow:open-worlds', openWorldFold);
      document.removeEventListener('glow:back', reverseCurrent);
      delete document.documentElement.dataset.glowCanonicalWorld;
      delete document.documentElement.dataset.glowCanonicalRoom;
      delete document.documentElement.dataset.glowCanonicalPage;
      delete document.documentElement.dataset.glowCanonicalFamily;
    };
  }, [pathname, search]);

  return null;
}
