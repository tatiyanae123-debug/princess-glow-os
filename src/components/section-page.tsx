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
    <div className="glow-editorial-page space-y-7">
      <header className="relative overflow-hidden rounded-[30px] px-5 py-7 sm:px-7 sm:py-9">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_15%,rgba(241,217,216,.75),transparent_28%),radial-gradient(circle_at_88%_20%,rgba(201,187,150,.22),transparent_25%)]" />
        <div className="max-w-4xl">
          <p className="glow-eyebrow">{eyebrow}</p>
          <h1 className="glow-display mt-3 max-w-3xl text-4xl font-medium leading-[1.05] tracking-[-.035em] text-[var(--glow-text)] sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--glow-text-muted)]">{description}</p>
          <div className="mt-5 flex items-center gap-3">
            <span className="glow-hand text-2xl text-[#a06f72]">your life, beautifully connected</span>
            <span className="hidden h-px flex-1 bg-[linear-gradient(90deg,rgba(151,118,96,.24),transparent)] sm:block" />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
