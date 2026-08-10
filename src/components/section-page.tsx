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
    <div className="glow-editorial-page space-y-6">
      <header className="relative overflow-hidden rounded-[18px] border border-[var(--glow-border)] bg-[linear-gradient(135deg,rgba(255,252,249,.68),var(--room-wash,rgba(241,217,216,.42)))] px-5 py-6 shadow-[0_8px_28px_rgba(89,63,52,.045)] sm:px-7 sm:py-8">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-[var(--glow-border)] opacity-50" />
        <div className="absolute right-10 top-6 h-20 w-20 rounded-[60%_40%_58%_42%] bg-[var(--room-wash,rgba(231,199,181,.18))] blur-[1px]" />
        <div className="relative max-w-4xl">
          <p className="glow-eyebrow">{eyebrow}</p>
          <h1 className="glow-display mt-2 max-w-3xl text-4xl font-medium leading-[1.04] tracking-[-.035em] text-[var(--glow-text)] sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-6 text-[var(--glow-text-muted)]">{description}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="glow-hand text-[26px] leading-none text-[var(--room-accent,#9d6f73)]">your life, beautifully connected</span>
            <span className="hidden h-px flex-1 bg-[linear-gradient(90deg,var(--room-accent,#a57d74),transparent)] opacity-20 sm:block" />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
