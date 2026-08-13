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
      className={cn('rounded-[18px] border border-[#F1E7E3] bg-white p-5', className)}
      style={style}
    >
      {children}
    </div>
  );
}
