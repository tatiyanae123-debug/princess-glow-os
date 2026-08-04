export type ThemeId =
  | 'modern-princess'
  | 'minimal-cream'
  | 'luxury-noir'
  | 'soft-nature'
  | 'blush-editorial'
  | 'dark'
  | 'seasonal'
  | 'low-stimulation';

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  description: string;
  colorScheme: 'light' | 'dark';
  tokens: {
    bg: string;
    sidebar: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    text: string;
    textMuted: string;
    accent: string;
    accentSoft: string;
    shadow: string;
    radius: string;
    fontDisplay: string;
    fontBody: string;
  };
};

export const THEMES: ThemeDefinition[] = [
  {
    id: 'modern-princess',
    name: 'Modern Princess',
    description: 'Warm cream, champagne gold, and blush. Luxurious and feminine.',
    colorScheme: 'light',
    tokens: {
      bg:          '#fdf8f5',
      sidebar:     '#0f0a0d',
      surface:     'rgba(255,255,255,0.90)',
      surfaceMuted:'rgba(250,245,242,0.80)',
      border:      'rgba(210,185,175,0.40)',
      text:        '#1a1014',
      textMuted:   '#7a6570',
      accent:      '#c9956a',
      accentSoft:  'rgba(201,149,106,0.12)',
      shadow:      '0 20px 60px rgba(60,20,40,0.08)',
      radius:      '24px',
      fontDisplay: "'Playfair Display', Georgia, serif",
      fontBody:    "'Inter', system-ui, sans-serif",
    },
  },
  {
    id: 'minimal-cream',
    name: 'Minimal Cream',
    description: 'Clean ivory with warm stone accents. Quiet and refined.',
    colorScheme: 'light',
    tokens: {
      bg:          '#fafaf8',
      sidebar:     '#1c1c1a',
      surface:     'rgba(255,255,255,0.95)',
      surfaceMuted:'rgba(248,248,246,0.80)',
      border:      'rgba(200,200,195,0.40)',
      text:        '#1a1a18',
      textMuted:   '#717170',
      accent:      '#8c7c6a',
      accentSoft:  'rgba(140,124,106,0.10)',
      shadow:      '0 20px 60px rgba(0,0,0,0.05)',
      radius:      '20px',
      fontDisplay: "'Playfair Display', Georgia, serif",
      fontBody:    "'Inter', system-ui, sans-serif",
    },
  },
  {
    id: 'luxury-noir',
    name: 'Luxury Noir',
    description: 'Deep black with champagne gold. Dramatic and powerful.',
    colorScheme: 'dark',
    tokens: {
      bg:          '#0a0a0c',
      sidebar:     '#050507',
      surface:     'rgba(18,18,22,0.90)',
      surfaceMuted:'rgba(14,14,18,0.80)',
      border:      'rgba(255,215,150,0.12)',
      text:        '#f0ead8',
      textMuted:   '#7a7060',
      accent:      '#d4a85a',
      accentSoft:  'rgba(212,168,90,0.12)',
      shadow:      '0 20px 60px rgba(0,0,0,0.40)',
      radius:      '24px',
      fontDisplay: "'Playfair Display', Georgia, serif",
      fontBody:    "'Inter', system-ui, sans-serif",
    },
  },
  {
    id: 'soft-nature',
    name: 'Soft Nature',
    description: 'Sage greens, warm linen, and earthy tones. Grounding and calm.',
    colorScheme: 'light',
    tokens: {
      bg:          '#f4f0eb',
      sidebar:     '#1a1f18',
      surface:     'rgba(255,253,248,0.90)',
      surfaceMuted:'rgba(240,238,232,0.80)',
      border:      'rgba(160,180,140,0.30)',
      text:        '#1a1f18',
      textMuted:   '#6a7060',
      accent:      '#7a9a5a',
      accentSoft:  'rgba(122,154,90,0.12)',
      shadow:      '0 20px 60px rgba(30,40,20,0.07)',
      radius:      '22px',
      fontDisplay: "'Playfair Display', Georgia, serif",
      fontBody:    "'Inter', system-ui, sans-serif",
    },
  },
  {
    id: 'blush-editorial',
    name: 'Blush Editorial',
    description: 'Dusty rose and editorial red. Bold yet romantic.',
    colorScheme: 'light',
    tokens: {
      bg:          '#fdf0f0',
      sidebar:     '#1a0f12',
      surface:     'rgba(255,250,250,0.92)',
      surfaceMuted:'rgba(252,240,242,0.80)',
      border:      'rgba(220,170,170,0.35)',
      text:        '#1a0f12',
      textMuted:   '#7a5560',
      accent:      '#c46070',
      accentSoft:  'rgba(196,96,112,0.10)',
      shadow:      '0 20px 60px rgba(80,20,30,0.07)',
      radius:      '24px',
      fontDisplay: "'Playfair Display', Georgia, serif",
      fontBody:    "'Inter', system-ui, sans-serif",
    },
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Warm dark tones with gold accents. Elegant eveningwear.',
    colorScheme: 'dark',
    tokens: {
      bg:          '#0d0d12',
      sidebar:     '#070709',
      surface:     'rgba(20,20,28,0.92)',
      surfaceMuted:'rgba(16,16,24,0.80)',
      border:      'rgba(255,255,255,0.08)',
      text:        '#e8e4dc',
      textMuted:   '#706c68',
      accent:      '#b89a6a',
      accentSoft:  'rgba(184,154,106,0.12)',
      shadow:      '0 20px 60px rgba(0,0,0,0.45)',
      radius:      '24px',
      fontDisplay: "'Playfair Display', Georgia, serif",
      fontBody:    "'Inter', system-ui, sans-serif",
    },
  },
  {
    id: 'seasonal',
    name: 'Seasonal',
    description: 'Warm amber, harvest tones, and spice. Changes with the season.',
    colorScheme: 'light',
    tokens: {
      bg:          '#f7f0e8',
      sidebar:     '#12100e',
      surface:     'rgba(255,252,246,0.90)',
      surfaceMuted:'rgba(245,238,225,0.80)',
      border:      'rgba(200,160,110,0.35)',
      text:        '#1a150e',
      textMuted:   '#7a6a50',
      accent:      '#c47a3a',
      accentSoft:  'rgba(196,122,58,0.12)',
      shadow:      '0 20px 60px rgba(60,30,10,0.08)',
      radius:      '22px',
      fontDisplay: "'Playfair Display', Georgia, serif",
      fontBody:    "'Inter', system-ui, sans-serif",
    },
  },
  {
    id: 'low-stimulation',
    name: 'Low Stimulation',
    description: 'Near-neutral grays and soft whites. Gentle on the eyes.',
    colorScheme: 'light',
    tokens: {
      bg:          '#f5f4f2',
      sidebar:     '#18181a',
      surface:     'rgba(252,251,249,0.95)',
      surfaceMuted:'rgba(245,244,242,0.85)',
      border:      'rgba(190,188,184,0.35)',
      text:        '#282828',
      textMuted:   '#787876',
      accent:      '#8a8880',
      accentSoft:  'rgba(138,136,128,0.10)',
      shadow:      '0 12px 40px rgba(0,0,0,0.04)',
      radius:      '18px',
      fontDisplay: "'Playfair Display', Georgia, serif",
      fontBody:    "'Inter', system-ui, sans-serif",
    },
  },
];

export function getTheme(id: ThemeId): ThemeDefinition {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function applyTheme(id: ThemeId): void {
  const theme = getTheme(id);
  const root = document.documentElement;
  root.setAttribute('data-theme', id);
  root.style.setProperty('--glow-bg',           theme.tokens.bg);
  root.style.setProperty('--glow-sidebar',       theme.tokens.sidebar);
  root.style.setProperty('--glow-surface',       theme.tokens.surface);
  root.style.setProperty('--glow-surface-muted', theme.tokens.surfaceMuted);
  root.style.setProperty('--glow-border',        theme.tokens.border);
  root.style.setProperty('--glow-text',          theme.tokens.text);
  root.style.setProperty('--glow-text-muted',    theme.tokens.textMuted);
  root.style.setProperty('--glow-accent',        theme.tokens.accent);
  root.style.setProperty('--glow-accent-soft',   theme.tokens.accentSoft);
  root.style.setProperty('--glow-shadow',        theme.tokens.shadow);
  root.style.setProperty('--glow-radius',        theme.tokens.radius);
  root.style.setProperty('--glow-font-display',  theme.tokens.fontDisplay);
  root.style.setProperty('--glow-font-body',     theme.tokens.fontBody);
  root.style.colorScheme = theme.colorScheme;
}
