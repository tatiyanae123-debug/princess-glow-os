import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        glow: {
          bg:              'var(--glow-bg)',
          sidebar:         'var(--glow-sidebar)',
          surface:         'var(--glow-surface)',
          'surface-muted': 'var(--glow-surface-muted)',
          border:          'var(--glow-border)',
          text:            'var(--glow-text)',
          'text-muted':    'var(--glow-text-muted)',
          accent:          'var(--glow-accent)',
          'accent-soft':   'var(--glow-accent-soft)',
        },
      },
      fontFamily: {
        display: ['var(--glow-font-display)', 'Georgia', 'serif'],
        body:    ['var(--glow-font-body)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: 'var(--glow-shadow)',
      },
      borderRadius: {
        glow: 'var(--glow-radius)',
      },
      keyframes: {
        'fade-in':    { from: { opacity: '0', transform: 'translateY(6px)' },   to: { opacity: '1', transform: 'translateY(0)' } },
        'scale-in':   { from: { opacity: '0', transform: 'scale(0.96)' },        to: { opacity: '1', transform: 'scale(1)' } },
        'slide-up':   { from: { opacity: '0', transform: 'translateY(16px)' },  to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-right':{ from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
      animation: {
        'fade-in':    'fade-in 0.35s ease both',
        'scale-in':   'scale-in 0.30s ease both',
        'slide-up':   'slide-up 0.40s ease both',
        'slide-right':'slide-right 0.30s ease both',
      },
    },
  },
  plugins: [],
} satisfies Config;
