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
    <div className={cn('glow-matter-surface relative p-5', className)} style={style}>
      {children}
    </div>
  );
}
