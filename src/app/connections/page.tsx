import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';

const shortcuts = [
  {
    name: 'Instagram',
    description: 'Open Instagram for content planning and publishing.',
    href: 'https://www.instagram.com/',
  },
  {
    name: 'Peacock',
    description: 'Open Peacock. Login credentials are never stored in Glow OS.',
    href: 'https://www.peacocktv.com/',
  },
  {
    name: 'Hulu',
    description: 'Open Hulu. Login credentials are never stored in Glow OS.',
    href: 'https://www.hulu.com/',
  },
  {
    name: 'BILH MyChart',
    description: 'Open the general BILH MyChart sign-in page. Visit-specific links are not stored.',
    href: 'https://mychart.bilh.org/MyChart-BILH/',
  },
];

export const dynamic = 'force-dynamic';

export default async function ConnectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <AppShell>
      <SectionPage
        eyebrow="Connections"
        title="Your private digital world"
        description="Connect services securely through OAuth and keep sensitive passwords outside Glow OS."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Google</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Calendar + Gmail</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Glow OS requests read-only access to your calendar and email. Sign out and sign back in with Google to approve the new permissions.
              </p>
            </div>
            <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
              Passwords are never requested or stored. Google can revoke access at any time.
            </div>
          </Card>

          <Card className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Private shortcuts</p>
            {shortcuts.map((shortcut) => (
              <a
                key={shortcut.name}
                href={shortcut.href}
                target="_blank"
                rel="noreferrer"
                className="block rounded-[18px] border border-slate-200/70 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/60"
              >
                <p className="font-medium text-slate-900 dark:text-white">{shortcut.name}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{shortcut.description}</p>
              </a>
            ))}
          </Card>
        </div>
      </SectionPage>
    </AppShell>
  );
}
