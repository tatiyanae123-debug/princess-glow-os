import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Button({ children, className, variant = 'primary', style, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'; }) {
  const base='glow-matter-control inline-flex min-h-10 items-center justify-center px-3.5 py-2 text-[10px] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';
  const variants:Record<string,string>={
    primary:'glow-matter-control-primary text-[var(--glow-text)]',
    secondary:'glow-matter-control-secondary text-[var(--glow-text-muted)]',
    ghost:'glow-matter-control-ghost text-[var(--glow-text-muted)]',
  };
  return <button className={cn(base,variants[variant],className)} style={style} {...props}>{children}</button>;
}
