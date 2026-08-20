'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useTheme } from '@/lib/themes/use-theme';
import { useVisualPreferences } from '@/lib/visual-preferences/use-visual-preferences';
import { useCustomizeMode } from '@/lib/customize/use-customize-mode';
import { useVisualContext, type VisualContext } from '@/lib/visual-context';
import type { ThemeId } from '@/lib/themes';
import type { DashboardVisualPreferences, VisualPreference, ImagePosition } from '@/lib/visual-preferences/types';

export type ProductivityMode = 'very-productive' | 'normal' | 'low' | 'cancel-everything';

export const PRODUCTIVITY_MODES: Record<ProductivityMode, {
  label: string;
  shortLabel: string;
  description: string;
  density: 'expanded' | 'balanced' | 'quiet' | 'essential';
}> = {
  'very-productive': {
    label: 'Very Productive Day',
    shortLabel: 'Very Productive',
    description: 'Full-capacity planning, focus blocks, stretch work, full routines, and optional extras.',
    density: 'expanded',
  },
  normal: {
    label: 'Normal Productive Day',
    shortLabel: 'Normal',
    description: 'Balanced priorities, breathing room, standard routines, and one optional extra.',
    density: 'balanced',
  },
  low: {
    label: 'Low Productive Day',
    shortLabel: 'Low',
    description: 'One priority, essential commitments, minimum routines, care, and safe-to-move work.',
    density: 'quiet',
  },
  'cancel-everything': {
    label: 'Cancel Everything Day',
    shortLabel: 'Recovery',
    description: 'Protection and recovery: only truly necessary commitments, care, and reviewed carry-forward.',
    density: 'essential',
  },
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
  productivityMode: ProductivityMode;
  productivityModeInfo: (typeof PRODUCTIVITY_MODES)[ProductivityMode];
  setProductivityMode: (mode: ProductivityMode) => void;
  getVisualPrefs: (id: string) => VisualPreference | undefined;
  getVisualSrc: (id: string, defaultSrc?: string) => string | undefined;
  getVisualPosition: (id: string) => ImagePosition | undefined;
};

const GlowContext = createContext<GlowContextValue | null>(null);
const MODE_STORAGE_KEY = 'glow-os:productivity-mode:v1';
const MODE_COOKIE_KEY = 'glow-os-productivity-mode';

function readModeCookie(): ProductivityMode | null {
  const pair = document.cookie.split('; ').find((item) => item.startsWith(`${MODE_COOKIE_KEY}=`));
  if (!pair) return null;
  const mode = decodeURIComponent(pair.split('=').slice(1).join('=')) as ProductivityMode;
  return mode in PRODUCTIVITY_MODES ? mode : null;
}

function writeModeCookie(mode: ProductivityMode) {
  document.cookie = `${MODE_COOKIE_KEY}=${encodeURIComponent(mode)}; path=/; max-age=31536000; samesite=lax`;
}

export function GlowProvider({ children }: { children: ReactNode }) {
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
  const [productivityMode, setProductivityModeState] = useState<ProductivityMode>('normal');

  useEffect(() => {
    const cookieMode = readModeCookie();
    const stored = window.localStorage.getItem(MODE_STORAGE_KEY) as ProductivityMode | null;
    if (cookieMode) setProductivityModeState(cookieMode);
    else if (stored && stored in PRODUCTIVITY_MODES) setProductivityModeState(stored);
  }, []);

  useEffect(() => {
    const syncFromServerCookie = () => {
      const cookieMode = readModeCookie();
      if (!cookieMode) return;
      setProductivityModeState((current) => current === cookieMode ? current : cookieMode);
    };

    const interval = window.setInterval(syncFromServerCookie, 2000);
    window.addEventListener('focus', syncFromServerCookie);
    window.addEventListener('pageshow', syncFromServerCookie);
    document.addEventListener('visibilitychange', syncFromServerCookie);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', syncFromServerCookie);
      window.removeEventListener('pageshow', syncFromServerCookie);
      document.removeEventListener('visibilitychange', syncFromServerCookie);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(MODE_STORAGE_KEY, productivityMode);
    document.documentElement.dataset.productivityMode = productivityMode;
    document.documentElement.dataset.glowDensity = PRODUCTIVITY_MODES[productivityMode].density;
    document.dispatchEvent(new CustomEvent('glow:productivity-mode-changed', { detail: { mode: productivityMode } }));
  }, [productivityMode]);

  const setProductivityMode = (mode: ProductivityMode) => {
    writeModeCookie(mode);
    setProductivityModeState(mode);
  };
  const getVisualPrefs = (id: string) => prefs.visuals[id];
  const getVisualSrc = (id: string, defaultSrc?: string) => prefs.visuals[id]?.imageUrl ?? defaultSrc;
  const getVisualPosition = (id: string) => prefs.visuals[id]?.position;

  const value: GlowContextValue = {
    themeId, setTheme,
    prefs, updateVisual, removeVisualImage, restoreVisualDefault,
    setBackgroundImage, createObjectUrl, resetAll, setAutomaticVisuals, setSuggestionMode,
    isCustomizing, hasPendingChanges, activateCustomize, saveCustomize, discardCustomize, markChanged,
    visualContext,
    productivityMode,
    productivityModeInfo: PRODUCTIVITY_MODES[productivityMode],
    setProductivityMode,
    getVisualPrefs, getVisualSrc, getVisualPosition,
  };

  return <GlowContext.Provider value={value}>{children}</GlowContext.Provider>;
}

export function useGlow(): GlowContextValue {
  const ctx = useContext(GlowContext);
  if (!ctx) throw new Error('useGlow must be used inside GlowProvider');
  return ctx;
}
