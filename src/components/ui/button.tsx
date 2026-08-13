import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Button({ children, className, variant = 'primary', style, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'; }) {
  const base='inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-[11px] font-medium outline-none transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#E9BFC5] focus-visible:ring-offset-2 active:scale-[.985] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';
  const variants:Record<string,string>={
    primary:'bg-[#C9727E] text-white shadow-[0_4px_14px_rgba(201,114,126,.14)] hover:-translate-y-0.5 hover:bg-[#B15A68] hover:shadow-[0_8px_20px_rgba(201,114,126,.18)]',
    secondary:'border border-[var(--glow-border)] bg-white/70 text-[var(--glow-text-muted)] hover:-translate-y-0.5 hover:bg-[#FDF3F2] hover:text-[#7d5158]',
    ghost:'bg-transparent text-[var(--glow-text-muted)] hover:bg-[#FDF3F2] hover:text-[#7d5158]',
  };
  return <button className={cn(base,variants[variant],className)} style={style} {...props}>{children}</button>;
}
