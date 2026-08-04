'use client';

import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const fieldBase =
  'w-full rounded-2xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[var(--glow-accent)]/30';

function fieldStyle(): React.CSSProperties {
  return {
    borderColor: 'var(--glow-border)',
    background: 'var(--glow-surface-muted)',
    color: 'var(--glow-text)',
  };
}

export function FieldWrapper({
  label,
  error,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium uppercase tracking-[0.15em]"
        style={{ color: 'var(--glow-text-muted)' }}
      >
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} style={fieldStyle()} {...props} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, 'min-h-[90px] resize-y', className)} style={fieldStyle()} {...props} />;
}

export function SelectInput({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBase, className)} style={fieldStyle()} {...props}>
      {children}
    </select>
  );
}
