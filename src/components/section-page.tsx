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
      <header className="reference-page-heading pt-1 sm:pt-2">
        <p className="glow-eyebrow text-[#C9727E]">{eyebrow}</p>
        <h1 className="glow-display mt-1 text-[42px] leading-[1.02] tracking-[-.025em] text-[#2B2420] sm:text-[54px] lg:text-[60px]">{title}</h1>
        <p className="mt-2 max-w-3xl text-[13px] leading-5 text-[#8A8078] sm:text-[14px]">{description}</p>
      </header>
      {children}
    </div>
  );
}
