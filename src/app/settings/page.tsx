import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { UtilityFrame } from '@/components/system-reference/utility-frame';
import { AppearanceReference } from '@/components/settings/appearance-reference';

export const dynamic='force-dynamic';

export default async function SettingsPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  return <AppShell><UtilityFrame title="Appearance" backHref="/home" backLabel="Home"><AppearanceReference/></UtilityFrame></AppShell>;
}
