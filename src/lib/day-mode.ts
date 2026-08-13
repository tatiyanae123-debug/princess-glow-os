export type GlowDayMode = 'most-productive' | 'productive' | 'bare-minimum' | 'clear-schedule';

export const GLOW_DAY_MODES = {
  'most-productive': { label: 'Most Productive', maxSuggestions: 10, maxBlockMinutes: 120, bufferMinutes: 5 },
  productive: { label: 'Productive', maxSuggestions: 7, maxBlockMinutes: 90, bufferMinutes: 10 },
  'bare-minimum': { label: 'Bare Minimum', maxSuggestions: 3, maxBlockMinutes: 30, bufferMinutes: 20 },
  'clear-schedule': { label: 'Clear Schedule', maxSuggestions: 0, maxBlockMinutes: 0, bufferMinutes: 30 },
} as const;

export const GLOW_DAY_MODE_ORDER: GlowDayMode[] = ['most-productive', 'productive', 'bare-minimum', 'clear-schedule'];

export function getGlowDayMode(mode: GlowDayMode = 'productive') {
  return GLOW_DAY_MODES[mode];
}
