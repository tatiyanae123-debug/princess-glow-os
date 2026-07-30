'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { applyTheme } from '@/lib/visual/themes';
import {
  clearVisualPreferences,
  getDefaultPreferences,
  loadVisualPreferences,
  saveVisualPreferences,
} from '@/lib/visual/preferences';
import type {
  BackgroundPreference,
  ImagePreference,
  ThemeId,
  VisualPreferences,
  WidgetPreference,
} from '@/lib/visual/types';

// ── Save status ───────────────────────────────────────────────────────────────

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ── Context shape ─────────────────────────────────────────────────────────────

export type CustomizationContextValue = {
  isCustomizing: boolean;
  prefs: VisualPreferences;
  isLoading: boolean;
  saveStatus: SaveStatus;
  toggleCustomizing: () => void;
  updateTheme: (theme: ThemeId) => void;
  updateBackground: (patch: Partial<BackgroundPreference>) => void;
  updateProfileImage: (patch: Partial<ImagePreference>) => void;
  updateDashboardBanner: (patch: Partial<ImagePreference>) => void;
  updateWidgetPref: (widgetId: string, patch: Partial<WidgetPreference>) => void;
  updateReducedMotion: (value: boolean) => void;
  updateShowDecorativeImages: (value: boolean) => void;
  resetPrefs: () => void;
};

export const CustomizationContext = createContext<CustomizationContextValue | null>(null);

export function useCustomization(): CustomizationContextValue | null {
  return useContext(CustomizationContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────

const SAVED_BANNER_MS = 1500;

export function CustomizationProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<VisualPreferences>(getDefaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const loaded = loadVisualPreferences();
    setPrefs(loaded);
    applyTheme(loaded.theme);
    setIsLoading(false);
  }, []);

  // Persist and show save feedback
  const persist = useCallback((next: VisualPreferences) => {
    setSaveStatus('saving');
    try {
      saveVisualPreferences(next);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), SAVED_BANNER_MS);
  }, []);

  const patch = useCallback(
    (fn: (current: VisualPreferences) => VisualPreferences) => {
      setPrefs((current) => {
        const next = fn(current);
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const toggleCustomizing = useCallback(() => setIsCustomizing((v) => !v), []);

  const updateTheme = useCallback(
    (theme: ThemeId) => {
      applyTheme(theme);
      patch((p) => ({ ...p, theme }));
    },
    [patch],
  );

  const updateBackground = useCallback(
    (update: Partial<BackgroundPreference>) => {
      patch((p) => ({ ...p, background: { ...p.background, ...update } }));
    },
    [patch],
  );

  const updateProfileImage = useCallback(
    (update: Partial<ImagePreference>) => {
      patch((p) => ({ ...p, profileImage: { ...p.profileImage, ...update } }));
    },
    [patch],
  );

  const updateDashboardBanner = useCallback(
    (update: Partial<ImagePreference>) => {
      patch((p) => ({ ...p, dashboardBanner: { ...p.dashboardBanner, ...update } }));
    },
    [patch],
  );

  const updateWidgetPref = useCallback(
    (widgetId: string, update: Partial<WidgetPreference>) => {
      patch((p) => {
        const existing: WidgetPreference = p.widgets[widgetId] ?? { visible: true, accentColor: 'default', size: 'default' };
        return {
          ...p,
          widgets: {
            ...p.widgets,
            [widgetId]: { ...existing, ...update },
          },
        };
      });
    },
    [patch],
  );

  const updateReducedMotion = useCallback(
    (value: boolean) => patch((p) => ({ ...p, reducedMotion: value })),
    [patch],
  );

  const updateShowDecorativeImages = useCallback(
    (value: boolean) => patch((p) => ({ ...p, showDecorativeImages: value })),
    [patch],
  );

  const resetPrefs = useCallback(() => {
    clearVisualPreferences();
    const defaults = getDefaultPreferences();
    setPrefs(defaults);
    applyTheme(defaults.theme);
    setSaveStatus('idle');
  }, []);

  return (
    <CustomizationContext.Provider
      value={{
        isCustomizing,
        prefs,
        isLoading,
        saveStatus,
        toggleCustomizing,
        updateTheme,
        updateBackground,
        updateProfileImage,
        updateDashboardBanner,
        updateWidgetPref,
        updateReducedMotion,
        updateShowDecorativeImages,
        resetPrefs,
      }}
    >
      {children}
    </CustomizationContext.Provider>
  );
}
