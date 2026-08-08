import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { PlanningHub } from '@/components/planning/planning-hub';
import { BuildMyDay } from '@/components/planning/build-my-day';
import { SectionPage } from '@/components/section-page';

export const dynamic = 'force-dynamic';

export default async function PlanningPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  return (
    <AppShell>
      <SectionPage eyebrow="Planning" title="Your week, quarter, and year in one place" description="A personal planning space for the details of today and the direction of your life.">
        <div className="space-y-6">
          <BuildMyDay />
          <PlanningHub />
        </div>
      </SectionPage>
    </AppShell>
  );
}
