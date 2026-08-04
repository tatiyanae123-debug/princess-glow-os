'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useTheme } from '@/lib/themes/use-theme';
import { useVisualPreferences } from '@/lib/visual-preferences/use-visual-preferences';
import { useCustomizeMode } from '@/lib/customize/use-customize-mode';
import { useVisualContext, type VisualContext } from '@/lib/visual-context';
import type { ThemeId } from '@/lib/themes';
import type { DashboardVisualPreferences, VisualPreference, ImagePosition } from '@/lib/visual-preferences/types';

type GlowContextValue = {
  // Theme
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  // Visual prefs
  prefs: DashboardVisualPreferences;
  updateVisual: (visual: VisualPreference) => void;
  removeVisualImage: (visualId: string) => void;
  restoreVisualDefault: (visualId: string) => void;
  setBackgroundImage: (url: string | undefined) => void;
  createObjectUrl: (file: File) => string;
  resetAll: () => void;
  setAutomaticVisuals: (v: boolean) => void;
  setSuggestionMode: (v: boolean) => void;
  // Customize mode
  isCustomizing: boolean;
  hasPendingChanges: boolean;
  activateCustomize: () => void;
  saveCustomize: () => void;
  discardCustomize: () => void;
  markChanged: () => void;
  // Dynamic context
  visualContext: VisualContext;
  // Helper
  getVisualPrefs: (id: string) => VisualPreference | undefined;
  getVisualSrc: (id: string, defaultSrc?: string) => string | undefined;
  getVisualPosition: (id: string) => ImagePosition | undefined;
};

const GlowContext = createContext<GlowContextValue | null>(null);

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

  const getVisualPrefs = (id: string) => prefs.visuals[id];
  const getVisualSrc = (id: string, defaultSrc?: string) => prefs.visuals[id]?.imageUrl ?? defaultSrc;
  const getVisualPosition = (id: string) => prefs.visuals[id]?.position;

  const value: GlowContextValue = {
    themeId, setTheme,
    prefs, updateVisual, removeVisualImage, restoreVisualDefault,
    setBackgroundImage, createObjectUrl, resetAll, setAutomaticVisuals, setSuggestionMode,
    isCustomizing, hasPendingChanges, activateCustomize, saveCustomize, discardCustomize, markChanged,
    visualContext,
    getVisualPrefs, getVisualSrc, getVisualPosition,
  };

  return <GlowContext.Provider value={value}>{children}</GlowContext.Provider>;
}

export function useGlow(): GlowContextValue {
  const ctx = useContext(GlowContext);
  if (!ctx) throw new Error('useGlow must be used inside GlowProvider');
  return ctx;
}
