import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { SettingsControlCenter } from '@/components/settings/settings-control-center';

export const dynamic = 'force-dynamic';

const destinations = [
  { label: 'Profile', href: '/settings/profile', cue: 'Identity and defaults' },
  { label: 'Appearance + Accessibility', href: '/settings/appearance-accessibility', cue: 'See and use Glow comfortably' },
  { label: 'Notifications', href: '/settings/notifications', cue: 'When Glow can interrupt' },
  { label: 'Data + Privacy', href: '/settings/data-privacy', cue: 'Boundaries and history' },
  { label: 'Permissions', href: '/settings/permissions', cue: 'Explicit access' },
  { label: 'Integrations', href: '/settings/integrations', cue: 'Connected services' },
  { label: 'Calendar Connections', href: '/settings/calendar-connections', cue: 'Time sources and write access' },
  { label: 'Routine Defaults', href: '/settings/routine-defaults', cue: 'Adaptive behavior' },
  { label: 'Ask Glow', href: '/settings/ask-glow', cue: 'Context and action permissions' },
  { label: 'Import + Export', href: '/settings/import-export', cue: 'Move data safely' },
  { label: 'Account', href: '/settings/account', cue: 'Authentication and sessions' },
];

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Global Utility · Settings"
        title="Settings"
        question="How should Glow behave, what may it access, and how should this world adapt to me?"
        climate="settings"
        destinations={destinations}
      >
        <SettingsControlCenter />
      </CanonicalDomainRoom>
    </AppShell>
  );
}
