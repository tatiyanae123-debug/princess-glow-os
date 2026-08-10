import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { GoogleConnectionCard } from '@/components/connections/google-connection-card';
import { AppleRemindersCard } from '@/components/connections/apple-reminders-card';
import { getConnectionsOverview } from '@/lib/data/connections';
import { getAppleReminderConnection } from '@/lib/apple-reminders/service';

const shortcuts = [
  { name: 'Instagram', description: 'Open Instagram for content planning and publishing.', href: 'https://www.instagram.com/' },
  { name: 'Peacock', description: 'Open Peacock. Login credentials are never stored in Glow OS.', href: 'https://www.peacocktv.com/' },
  { name: 'Hulu', description: 'Open Hulu. Login credentials are never stored in Glow OS.', href: 'https://www.hulu.com/' },
  { name: 'BILH MyChart', description: 'Open the general BILH MyChart sign-in page. Visit-specific links are not stored.', href: 'https://mychart.bilh.org/MyChart-BILH/' },
];

export const dynamic = 'force-dynamic';

export default async function ConnectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [overview, appleConnection] = await Promise.all([
    getConnectionsOverview(session.user.id),
    getAppleReminderConnection(session.user.id),
  ]);

  return (
    <AppShell>
      <SectionPage eyebrow="Connections" title="Your private digital world" description="Connect services securely through OAuth and private bridges while keeping passwords outside Glow OS.">
        <div className="grid gap-4 lg:grid-cols-2">
          <GoogleConnectionCard overview={overview} />
          <AppleRemindersCard connection={appleConnection} />

          <Card className="space-y-3 lg:col-span-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Private shortcuts</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Plain links, not live integrations — Glow OS never signs in, reads, or stores anything from these sites.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {shortcuts.map((shortcut) => (
                <a key={shortcut.name} href={shortcut.href} target="_blank" rel="noopener noreferrer" className="block rounded-[18px] border border-slate-200/70 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/60">
                  <p className="font-medium text-slate-900 dark:text-white">{shortcut.name}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{shortcut.description}</p>
                </a>
              ))}
            </div>
          </Card>
        </div>
      </SectionPage>
    </AppShell>
  );
}
