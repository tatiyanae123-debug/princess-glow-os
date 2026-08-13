import {redirect} from 'next/navigation';
import {auth} from '@/auth';
import {AppShell} from '@/components/app-shell';
import {AlertCenterClient} from '@/components/alerts/alert-center-client';
export const dynamic='force-dynamic';
export default async function AlertsPage(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return <AppShell><div className="mx-auto max-w-[1240px] space-y-5"><header><p className="glow-eyebrow text-[#C9727E]">Universal reminders</p><h1 className="glow-display mt-1 text-[44px] leading-none text-[#2B2420] sm:text-[56px]">Alert Center</h1><p className="mt-3 max-w-[760px] text-[13px] leading-5 text-[#8A8078]">Set reminder timing and delivery preferences for scheduled actions across Glow OS.</p></header><AlertCenterClient/></div></AppShell>}
