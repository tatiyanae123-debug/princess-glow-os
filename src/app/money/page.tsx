import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';

const finance = [
  { title: 'Savings', detail: '$2,340 set aside for flexible, calm growth.' },
  { title: 'Spending', detail: 'Keep monthly comfort spending within the plan.' },
  { title: 'Upcoming', detail: 'Review subscriptions and renewals this week.' },
];

export default function MoneyPage() {
  return (
    <AppShell>
      <SectionPage eyebrow="Finance" title="A calm view of your money" description="Financial clarity should feel reassuring, not intense.">
        <Card className="grid gap-3 md:grid-cols-3">
          {finance.map((item) => (
            <div key={item.title} className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="font-medium text-slate-900 dark:text-slate-100">{item.title}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
            </div>
          ))}
        </Card>
      </SectionPage>
    </AppShell>
  );
}
