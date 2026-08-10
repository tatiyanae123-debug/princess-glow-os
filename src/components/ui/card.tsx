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
      className={cn('p-5 backdrop-blur-[2px]', className)}
      style={{
        borderRadius: 'var(--glow-radius)',
        border: '1px solid var(--glow-border)',
        background: 'linear-gradient(145deg,rgba(255,252,249,.86),rgba(249,241,235,.72))',
        boxShadow: 'var(--glow-shadow)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
