import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { StudyYourselfHotterStudioV2 } from '@/components/beauty/study-yourself-hotter-studio-v2';

export const dynamic = 'force-dynamic';

export default async function StudyYourselfHotterPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return <AppShell><StudyYourselfHotterStudioV2 /></AppShell>;
}
