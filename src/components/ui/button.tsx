import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900',
    secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
  };

  return (
    <button
      className={cn('inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition', variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
