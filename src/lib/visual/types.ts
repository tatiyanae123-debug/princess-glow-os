import { z } from 'zod';

export const VISUAL_PREFS_VERSION = 2;
export const VISUAL_PREFS_STORAGE_KEY = 'glow-visual-prefs-v2';

// ── Image preference ─────────────────────────────────────────────────────────

export const ImagePreferenceSchema = z.object({
  src: z.string().nullable().default(null),
  zoom: z.number().min(1).max(3).default(1),
  offsetX: z.number().min(-50).max(50).default(0),
  offsetY: z.number().min(-50).max(50).default(0),
});
export type ImagePreference = z.infer<typeof ImagePreferenceSchema>;

// ── Widget preference ─────────────────────────────────────────────────────────

export const ACCENT_COLORS = ['rose', 'violet', 'sky', 'emerald', 'amber', 'default'] as const;
export type AccentColor = (typeof ACCENT_COLORS)[number];

export const WIDGET_SIZES = ['compact', 'default', 'expanded'] as const;
export type WidgetSize = (typeof WIDGET_SIZES)[number];

export const WidgetPreferenceSchema = z.object({
  visible: z.boolean().default(true),
  accentColor: z.enum(ACCENT_COLORS).default('default'),
  size: z.enum(WIDGET_SIZES).default('default'),
});
export type WidgetPreference = z.infer<typeof WidgetPreferenceSchema>;

// ── Theme ──────────────────────────────────────────────────────────────────────

export const THEME_IDS = ['princess', 'aurora', 'midnight', 'forest', 'sunset'] as const;
export const ThemeIdSchema = z.enum(THEME_IDS);
export type ThemeId = z.infer<typeof ThemeIdSchema>;

// ── Background ────────────────────────────────────────────────────────────────

export const BACKGROUND_TYPES = ['gradient', 'solid', 'gallery', 'upload'] as const;
export const BackgroundTypeSchema = z.enum(BACKGROUND_TYPES);
export type BackgroundType = z.infer<typeof BackgroundTypeSchema>;

export const BackgroundPreferenceSchema = z.object({
  type: BackgroundTypeSchema.default('gradient'),
  value: z.string().default(''),
  customImage: ImagePreferenceSchema.default({}),
  opacity: z.number().min(0.5).max(1).default(0.95),
});
export type BackgroundPreference = z.infer<typeof BackgroundPreferenceSchema>;

// ── Top-level preferences ────────────────────────────────────────────────────

export const VisualPreferencesSchema = z.object({
  version: z.literal(VISUAL_PREFS_VERSION),
  theme: ThemeIdSchema.default('princess'),
  background: BackgroundPreferenceSchema.default({}),
  profileImage: ImagePreferenceSchema.default({}),
  dashboardBanner: ImagePreferenceSchema.default({}),
  widgets: z.record(z.string(), WidgetPreferenceSchema).default({}),
  reducedMotion: z.boolean().default(false),
  showDecorativeImages: z.boolean().default(true),
});
export type VisualPreferences = z.infer<typeof VisualPreferencesSchema>;
