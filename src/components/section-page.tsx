import { Card } from '@/components/ui/card';

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
      <Card className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-500">{eyebrow}</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
      </Card>
      {children}
    </div>
  );
}
