import {
  VISUAL_PREFS_STORAGE_KEY,
  VISUAL_PREFS_VERSION,
  VisualPreferencesSchema,
  type VisualPreferences,
} from './types';

export function getDefaultPreferences(): VisualPreferences {
  return VisualPreferencesSchema.parse({ version: VISUAL_PREFS_VERSION });
}

export function loadVisualPreferences(): VisualPreferences {
  if (typeof window === 'undefined') return getDefaultPreferences();
  try {
    const raw = window.localStorage.getItem(VISUAL_PREFS_STORAGE_KEY);
    if (!raw) return getDefaultPreferences();
    const parsed: unknown = JSON.parse(raw);
    // Version check — discard stale data rather than trying to migrate
    if (typeof parsed !== 'object' || parsed === null || (parsed as Record<string, unknown>).version !== VISUAL_PREFS_VERSION) {
      window.localStorage.removeItem(VISUAL_PREFS_STORAGE_KEY);
      return getDefaultPreferences();
    }
    const result = VisualPreferencesSchema.safeParse(parsed);
    if (!result.success) {
      window.localStorage.removeItem(VISUAL_PREFS_STORAGE_KEY);
      return getDefaultPreferences();
    }
    return result.data;
  } catch {
    try {
      window.localStorage.removeItem(VISUAL_PREFS_STORAGE_KEY);
    } catch {
      // storage unavailable
    }
    return getDefaultPreferences();
  }
}

export function saveVisualPreferences(prefs: VisualPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(VISUAL_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage quota exceeded or unavailable — silently ignore
  }
}

export function clearVisualPreferences(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(VISUAL_PREFS_STORAGE_KEY);
  } catch {
    // ignore
  }
}
