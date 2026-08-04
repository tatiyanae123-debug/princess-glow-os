'use client';

import { useCallback, useEffect, useState } from 'react';
import { applyTheme, type ThemeId } from '@/lib/themes';

const STORAGE_KEY = 'glow-theme-v1';
const DEFAULT_THEME: ThemeId = 'modern-princess';

export function useTheme() {
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null;
      const id: ThemeId = stored ?? DEFAULT_THEME;
      setThemeIdState(id);
      applyTheme(id);
    } catch {
      applyTheme(DEFAULT_THEME);
    }
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeIdState(id);
    applyTheme(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore storage errors
    }
  }, []);

  return { themeId, setTheme };
}
