import type { ThemeId } from '@/lib/themes';

export type VisualMode = 'photo' | 'illustration' | 'icon' | 'none';

export type ImagePosition = {
  x: number; // percent offset 0–100
  y: number; // percent offset 0–100
  zoom: number; // 1.0 – 3.0
};

export type VisualPreference = {
  visualId: string;
  mode: VisualMode;
  imageUrl?: string;
  position?: ImagePosition;
  locked?: boolean;
  allowDynamicUpdates?: boolean;
};

export type DashboardVisualPreferences = {
  version: number;
  themeId: ThemeId;
  backgroundImage?: string;
  automaticVisuals: boolean;
  suggestionMode: boolean;
  disableDecorativeImagery?: boolean;
  visuals: Record<string, VisualPreference>;
};

export const DEFAULT_PREFERENCES: DashboardVisualPreferences = {
  version: 1,
  themeId: 'modern-princess',
  automaticVisuals: false,
  suggestionMode: true,
  visuals: {},
};

export const DEFAULT_IMAGE_POSITION: ImagePosition = { x: 50, y: 50, zoom: 1 };
