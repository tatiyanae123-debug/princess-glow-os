'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { roomExperienceFor } from '@/lib/glow-world/room-experience';
import { pageManifestFor } from '@/lib/glow-world/page-manifest';
import { wave2RuntimeContext } from '@/lib/glow/wave-2-runtime';

/**
 * Global Core bridge. Compatibility entries resolve into the one canonical
 * Glow Current + Glow Presence runtime. Wave 2 also publishes one shared
 * Today/Planning/Routines runtime contract here instead of forking pages.
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
    const wave2 = wave2RuntimeContext(pathname);

    const publishContext = () => {
      document.documentElement.dataset.glowCanonicalWorld = world;
      document.documentElement.dataset.glowCanonicalRoom = room;
      document.documentElement.dataset.glowCanonicalPage = pageId;
      document.documentElement.dataset.glowCanonicalFamily = family;
      if (wave2) {
        document.documentElement.dataset.glowCompletionFamily = wave2.family;
        document.documentElement.dataset.glowCompletionSurface = wave2.surface;
      } else {
        delete document.documentElement.dataset.glowCompletionFamily;
        delete document.documentElement.dataset.glowCompletionSurface;
      }
      document.dispatchEvent(new CustomEvent('glow:context', {
        detail: { label: room, type: 'location', id: pageId, route: currentPath, world, family, completion: wave2 },
      }));
    };

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

    publishContext();
    if (wave2) document.dispatchEvent(new CustomEvent('glow:wave-2-context', { detail: wave2 }));
    document.dispatchEvent(new CustomEvent('glow:global-core-ready', {
      detail: { currentPath, world, room, pageId, family, completion: wave2 },
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
      delete document.documentElement.dataset.glowCompletionFamily;
      delete document.documentElement.dataset.glowCompletionSurface;
    };
  }, [pathname, search]);

  return null;
}
