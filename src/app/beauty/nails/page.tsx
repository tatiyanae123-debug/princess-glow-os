import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { BeautySpecialtyRoom } from '@/components/beauty/beauty-specialty-room';

export const dynamic='force-dynamic';
export default async function NailsBeautyPage(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return <AppShell><BeautySpecialtyRoom kind="Nails"/></AppShell>}
