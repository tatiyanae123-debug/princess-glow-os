import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';

export default function HomePage() {
  return (
    <AppShell>
      <SectionPage eyebrow="Home" title="A place that supports your rhythm" description="Turn your home life into a calm, welcoming system that feels effortless to maintain.">
        <Card className="grid gap-3 md:grid-cols-2">
          <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="font-medium text-slate-900 dark:text-slate-100">Tonight’s reset</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Clear surfaces, light a candle, and set the next day’s essentials by the door.</p>
          </div>
          <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <p className="font-medium text-slate-900 dark:text-slate-100">Domestic flow</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Keep one ritual for laundry, one for replenishing, and one for a peaceful evening reset.</p>
          </div>
        </Card>
      </SectionPage>
    </AppShell>
  );
}
