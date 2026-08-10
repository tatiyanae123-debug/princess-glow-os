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
    <div className="space-y-5">
      <div className="flex flex-col gap-2 border-b border-[var(--glow-border)] px-1 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="glow-eyebrow">{eyebrow}</p>
          <h1 className="glow-display mt-1 text-[25px] leading-none tracking-[-.025em] text-[var(--glow-text)]">{title}</h1>
        </div>
        <div className="max-w-xl text-right">
          <p className="text-[9px] leading-4 text-[var(--glow-text-muted)]">{description}</p>
          <p className="glow-hand mt-1 text-[21px] leading-none text-[var(--room-accent,#9d6f73)]">today&apos;s chapter</p>
        </div>
      </div>
      {children}
    </div>
  );
}
