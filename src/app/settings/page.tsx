import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const settings = [
  { title: 'Theme', value: 'Editorial warm' },
  { title: 'Notifications', value: 'Gentle' },
  { title: 'Focus mode', value: 'Enabled' },
];

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <AppShell>
      <SectionPage eyebrow="Settings" title="A space that supports you" description="Fine-tune the environment so the system feels calm, quiet, and personal.">
        <Card className="space-y-3">
          {settings.map((item) => (
            <div key={item.title} className="flex items-center justify-between rounded-[20px] border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60">
              <span className="font-medium text-slate-900 dark:text-slate-100">{item.title}</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{item.value}</span>
            </div>
          ))}
        </Card>
      </SectionPage>
    </AppShell>
  );
}
