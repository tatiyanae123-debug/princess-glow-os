'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from '@/lib/themes/use-theme';
import { useVisualPreferences } from '@/lib/visual-preferences/use-visual-preferences';
import { useCustomizeMode } from '@/lib/customize/use-customize-mode';
import { useVisualContext, type VisualContext } from '@/lib/visual-context';
import { roomExperienceFor } from '@/lib/glow-world/room-experience';
import { pageManifestChainFor, pageManifestFor } from '@/lib/glow-world/page-manifest';
import type { ThemeId } from '@/lib/themes';
import type { DashboardVisualPreferences, VisualPreference, ImagePosition } from '@/lib/visual-preferences/types';

type GlowLocationContext = {
  pathname: string;
  search: string;
  currentPath: string;
  world: string;
  room: string;
  experience: string;
  pageId: string;
  pageLevel: string;
  family: string;
  designFamily: string;
  ancestry: ReturnType<typeof pageManifestChainFor>;
};

type GlowContextValue = {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  prefs: DashboardVisualPreferences;
  updateVisual: (visual: VisualPreference) => void;
  removeVisualImage: (visualId: string) => void;
  restoreVisualDefault: (visualId: string) => void;
  setBackgroundImage: (url: string | undefined) => void;
  createObjectUrl: (file: File) => string;
  resetAll: () => void;
  setAutomaticVisuals: (v: boolean) => void;
  setSuggestionMode: (v: boolean) => void;
  isCustomizing: boolean;
  hasPendingChanges: boolean;
  activateCustomize: () => void;
  saveCustomize: () => void;
  discardCustomize: () => void;
  markChanged: () => void;
  visualContext: VisualContext;
  locationContext: GlowLocationContext;
  getVisualPrefs: (id: string) => VisualPreference | undefined;
  getVisualSrc: (id: string, defaultSrc?: string) => string | undefined;
  getVisualPosition: (id: string) => ImagePosition | undefined;
};

const GlowContext = createContext<GlowContextValue | null>(null);

export function GlowProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const experience = roomExperienceFor(pathname);
  const manifest = pageManifestFor(pathname);
  const ancestry = pageManifestChainFor(pathname);
  const { themeId, setTheme } = useTheme();
  const {
    prefs, updateVisual, removeVisualImage, restoreVisualDefault,
    setBackgroundImage, createObjectUrl, resetAll, setAutomaticVisuals, setSuggestionMode,
  } = useVisualPreferences();
  const {
    isActive: isCustomizing, hasPendingChanges,
    activate: activateCustomize, save: saveCustomize,
    discard: discardCustomize, markChanged,
  } = useCustomizeMode();
  const visualContext = useVisualContext();

  const getVisualPrefs = (id: string) => prefs.visuals[id];
  const getVisualSrc = (id: string, defaultSrc?: string) => prefs.visuals[id]?.imageUrl ?? defaultSrc;
  const getVisualPosition = (id: string) => prefs.visuals[id]?.position;
  const locationContext: GlowLocationContext = {
    pathname,
    search,
    currentPath: search ? `${pathname}?${search}` : pathname,
    world: manifest?.world ?? experience.world,
    room: experience.room,
    experience: manifest?.id ?? experience.room,
    pageId: manifest?.id ?? 'unregistered',
    pageLevel: manifest?.level ?? 'unknown',
    family: manifest?.family ?? 'legacy-unregistered',
    designFamily: manifest?.designFamily ?? 'legacy-unregistered',
    ancestry,
  };

  const value: GlowContextValue = {
    themeId, setTheme,
    prefs, updateVisual, removeVisualImage, restoreVisualDefault,
    setBackgroundImage, createObjectUrl, resetAll, setAutomaticVisuals, setSuggestionMode,
    isCustomizing, hasPendingChanges, activateCustomize, saveCustomize, discardCustomize, markChanged,
    visualContext, locationContext,
    getVisualPrefs, getVisualSrc, getVisualPosition,
  };

  return <GlowContext.Provider value={value}>{children}</GlowContext.Provider>;
}

export function useGlow(): GlowContextValue {
  const ctx = useContext(GlowContext);
  if (!ctx) throw new Error('useGlow must be used inside GlowProvider');
  return ctx;
}
