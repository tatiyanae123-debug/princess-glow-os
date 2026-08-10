import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Button({ children, className, variant = 'primary', style, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'; }) {
  const base='inline-flex items-center justify-center rounded-[6px] px-3.5 py-2 text-[10px] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50';
  const variants:Record<string,string>={
    primary:'bg-[#3b302c] text-white hover:bg-[#664a4d] shadow-[0_4px_12px_rgba(66,45,39,.08)]',
    secondary:'border border-[var(--glow-border)] bg-white/35 text-[var(--glow-text-muted)] hover:bg-[#f3e6e3] hover:text-[#7d5158]',
    ghost:'bg-transparent text-[var(--glow-text-muted)] hover:bg-[#f3e6e3] hover:text-[#7d5158]',
  };
  return <button className={cn(base,variants[variant],className)} style={style} {...props}>{children}</button>;
}
