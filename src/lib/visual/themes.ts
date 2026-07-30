import type { ThemeId } from './types';

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  description: string;
  preview: string; // CSS background for the swatch
  vars: Record<string, string>;
};

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  princess: {
    id: 'princess',
    name: 'Princess',
    description: 'Soft rose and cream tones',
    preview: 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 100%)',
    vars: {
      '--glow-accent': '351 85% 67%',
      '--glow-accent-soft': '351 100% 95%',
      '--glow-accent-text': '351 85% 45%',
      '--glow-gradient': 'linear-gradient(135deg, #fff5f7 0%, #fdf2f8 100%)',
      '--glow-surface': 'rgba(255,255,255,0.90)',
    },
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    description: 'Purple and teal aurora glow',
    preview: 'linear-gradient(135deg, #f5f3ff 0%, #ecfdf5 100%)',
    vars: {
      '--glow-accent': '267 75% 65%',
      '--glow-accent-soft': '267 100% 97%',
      '--glow-accent-text': '267 75% 45%',
      '--glow-gradient': 'linear-gradient(135deg, #f5f3ff 0%, #ecfdf5 100%)',
      '--glow-surface': 'rgba(255,255,255,0.90)',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep navy with gold accents',
    preview: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    vars: {
      '--glow-accent': '45 93% 47%',
      '--glow-accent-soft': '45 100% 96%',
      '--glow-accent-text': '45 93% 35%',
      '--glow-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      '--glow-surface': 'rgba(15,23,42,0.90)',
    },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    description: 'Sage green and warm sand',
    preview: 'linear-gradient(135deg, #f0fdf4 0%, #fefce8 100%)',
    vars: {
      '--glow-accent': '152 60% 42%',
      '--glow-accent-soft': '152 60% 95%',
      '--glow-accent-text': '152 60% 30%',
      '--glow-gradient': 'linear-gradient(135deg, #f0fdf4 0%, #fefce8 100%)',
      '--glow-surface': 'rgba(255,255,255,0.90)',
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and amber glow',
    preview: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)',
    vars: {
      '--glow-accent': '25 95% 60%',
      '--glow-accent-soft': '25 100% 96%',
      '--glow-accent-text': '25 95% 40%',
      '--glow-gradient': 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)',
      '--glow-surface': 'rgba(255,255,255,0.90)',
    },
  },
};

export function applyTheme(themeId: ThemeId): void {
  if (typeof document === 'undefined') return;
  const theme = THEMES[themeId];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
}

export function clearThemeVars(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const sampleVars = ['--glow-accent', '--glow-accent-soft', '--glow-accent-text', '--glow-gradient', '--glow-surface'];
  for (const key of sampleVars) {
    root.style.removeProperty(key);
  }
}
