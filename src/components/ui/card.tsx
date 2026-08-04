import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({
  className,
  children,
  style,
}: {
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn('p-5 backdrop-blur-sm', className)}
      style={{
        borderRadius: 'var(--glow-radius)',
        border: '1px solid var(--glow-border)',
        background: 'var(--glow-surface)',
        boxShadow: 'var(--glow-shadow)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
