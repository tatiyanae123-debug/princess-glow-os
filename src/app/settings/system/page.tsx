import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { UtilityFrame } from '@/components/system-reference/utility-frame';
import { SettingsControlCenter } from '@/components/settings/settings-control-center';

export const dynamic='force-dynamic';

export default async function SystemSettingsPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  return <AppShell><UtilityFrame title="Glow OS Controls" backHref="/settings" backLabel="Appearance"><div style={{padding:'22px 4px'}}><SettingsControlCenter/></div></UtilityFrame></AppShell>;
}
