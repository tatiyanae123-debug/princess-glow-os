'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type DashboardVisualPreferences,
  type VisualPreference,
  DEFAULT_PREFERENCES,
} from '@/lib/visual-preferences/types';

const STORAGE_KEY = 'glow-visual-prefs-v1';

function loadPrefs(): DashboardVisualPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_PREFERENCES);
    const parsed = JSON.parse(raw) as DashboardVisualPreferences;
    if (parsed.version !== DEFAULT_PREFERENCES.version) return structuredClone(DEFAULT_PREFERENCES);
    return { ...DEFAULT_PREFERENCES, ...parsed, visuals: parsed.visuals ?? {} };
  } catch {
    return structuredClone(DEFAULT_PREFERENCES);
  }
}

function savePrefs(prefs: DashboardVisualPreferences): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore quota errors
  }
}

export function useVisualPreferences() {
  const [prefs, setPrefs] = useState<DashboardVisualPreferences>(DEFAULT_PREFERENCES);
  const objectUrls = useRef<string[]>([]);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  // Revoke any object URLs on unmount
  useEffect(() => {
    const urls = objectUrls.current;
    return () => { urls.forEach((u) => URL.revokeObjectURL(u)); };
  }, []);

  const updateVisual = useCallback((visual: VisualPreference) => {
    setPrefs((prev) => {
      const next = {
        ...prev,
        visuals: { ...prev.visuals, [visual.visualId]: visual },
      };
      savePrefs(next);
      return next;
    });
  }, []);

  const removeVisualImage = useCallback((visualId: string) => {
    setPrefs((prev) => {
      const existing = prev.visuals[visualId];
      if (!existing) return prev;
      const next: DashboardVisualPreferences = {
        ...prev,
        visuals: {
          ...prev.visuals,
          [visualId]: { ...existing, imageUrl: undefined, mode: 'none' },
        },
      };
      savePrefs(next);
      return next;
    });
  }, []);

  const restoreVisualDefault = useCallback((visualId: string) => {
    setPrefs((prev) => {
      const visuals = { ...prev.visuals };
      delete visuals[visualId];
      const next = { ...prev, visuals };
      savePrefs(next);
      return next;
    });
  }, []);

  const setThemeId = useCallback((themeId: DashboardVisualPreferences['themeId']) => {
    setPrefs((prev) => {
      const next = { ...prev, themeId };
      savePrefs(next);
      return next;
    });
  }, []);

  const setBackgroundImage = useCallback((url: string | undefined) => {
    setPrefs((prev) => {
      const next = { ...prev, backgroundImage: url };
      savePrefs(next);
      return next;
    });
  }, []);

  const createObjectUrl = useCallback((file: File): string => {
    const url = URL.createObjectURL(file);
    objectUrls.current.push(url);
    return url;
  }, []);

  const resetAll = useCallback(() => {
    objectUrls.current.forEach((u) => URL.revokeObjectURL(u));
    objectUrls.current = [];
    const fresh = structuredClone(DEFAULT_PREFERENCES);
    setPrefs(fresh);
    savePrefs(fresh);
  }, []);

  const setAutomaticVisuals = useCallback((automaticVisuals: boolean) => {
    setPrefs((prev) => { const next = { ...prev, automaticVisuals }; savePrefs(next); return next; });
  }, []);

  const setSuggestionMode = useCallback((suggestionMode: boolean) => {
    setPrefs((prev) => { const next = { ...prev, suggestionMode }; savePrefs(next); return next; });
  }, []);

  return {
    prefs,
    updateVisual,
    removeVisualImage,
    restoreVisualDefault,
    setThemeId,
    setBackgroundImage,
    createObjectUrl,
    resetAll,
    setAutomaticVisuals,
    setSuggestionMode,
  };
}
