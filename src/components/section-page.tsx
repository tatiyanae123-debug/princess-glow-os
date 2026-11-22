export function SectionPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-[var(--glow-border)] px-1 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="glow-eyebrow">{eyebrow}</p>
          <h1 className="glow-display mt-2 text-[34px] leading-[1.05] tracking-[-.025em] text-[var(--glow-text)] sm:text-[38px]">{title}</h1>
        </div>
        <div className="max-w-xl sm:text-right">
          <p className="text-[13px] leading-5 text-[var(--glow-text-muted)]">{description}</p>
          <p className="glow-hand mt-1 text-[21px] leading-none text-[var(--room-accent,#9d6f73)]" aria-hidden="true">today&apos;s chapter</p>
        </div>
      </header>
      {children}
    </div>
  );
}
