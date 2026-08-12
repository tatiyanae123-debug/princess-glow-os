import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { SettingsControlCenter } from '@/components/settings/settings-control-center';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <AppShell>
      <SectionPage eyebrow="Settings" title="A space that supports you" description="Control appearance, personalization, Glow Brain behavior, notifications, privacy, and your local data preferences without changing Glow OS architecture.">
        <SettingsControlCenter />
      </SectionPage>
    </AppShell>
  );
}
