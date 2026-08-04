import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Button({
  children,
  className,
  variant = 'primary',
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const base = 'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<string, string> = {
    primary:   'bg-[var(--glow-accent)] text-white hover:opacity-90 shadow-sm',
    secondary: 'border border-[var(--glow-border)] bg-[var(--glow-surface-muted)] text-[var(--glow-text-muted)] hover:bg-[var(--glow-accent-soft)] hover:text-[var(--glow-accent)]',
    ghost:     'bg-transparent text-[var(--glow-text-muted)] hover:bg-[var(--glow-accent-soft)] hover:text-[var(--glow-accent)]',
  };

  return (
    <button
      className={cn(base, variants[variant], className)}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
