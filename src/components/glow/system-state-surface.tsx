import type { ReactNode } from 'react';

type GlowSystemStateProps = {
  kind: 'loading' | 'error' | 'not-found';
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  reference?: string;
  role?: 'status' | 'alert';
};

export function GlowSystemState({
  kind,
  eyebrow,
  title,
  description,
  children,
  reference,
  role,
}: GlowSystemStateProps) {
  const titleId = `glow-system-state-${kind}-title`;
  const descriptionId = `glow-system-state-${kind}-description`;
  const live = role === 'alert' ? 'assertive' : role === 'status' ? 'polite' : undefined;

  return (
    <main
      data-glow-system-state={kind}
      className="glow-safe-area grid min-h-[var(--glow-viewport-height)] place-items-center bg-[var(--glow-bg)] px-4 py-8 text-[var(--glow-text)] sm:px-6"
      role={role}
      aria-live={live}
      aria-busy={kind === 'loading' ? true : undefined}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <section className="editorial-surface w-full max-w-xl overflow-hidden p-6 sm:p-8">
        <p className="glow-eyebrow">{eyebrow}</p>
        <h1 id={titleId} className="glow-display mt-3 text-[clamp(1.65rem,5vw,2.3rem)] leading-[1.05] tracking-[-.035em]">
          {title}
        </h1>
        <p id={descriptionId} className="mt-3 max-w-lg text-sm leading-6 text-[var(--glow-text-muted)]">
          {description}
        </p>
        {children ? <div className="mt-6">{children}</div> : null}
        {reference ? <p className="mt-5 text-xs text-[var(--glow-text-muted)] opacity-60">Reference: {reference}</p> : null}
      </section>
    </main>
  );
}
