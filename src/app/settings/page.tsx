import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SettingsControlCenter } from '@/components/settings/settings-control-center';
import { getConnectionsOverview } from '@/lib/data/connections';
import packageInfo from '../../../package.json';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const connections = await getConnectionsOverview(session.user.id);
  return <AppShell><SettingsControlCenter
    profile={{ name: session.user.name ?? null, email: session.user.email ?? null, image: session.user.image ?? null }}
    connections={connections}
    version={packageInfo.version}
  /></AppShell>;
}
