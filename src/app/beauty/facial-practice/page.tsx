import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { FacialPracticeIntelligenceStudio } from '@/components/beauty/facial-practice-intelligence-studio';
export const dynamic='force-dynamic';
export default async function FacialPracticePage(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return <AppShell><FacialPracticeIntelligenceStudio/></AppShell>}
