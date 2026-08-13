import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { WorkScheduleManager } from '@/components/work/work-schedule-manager';
import { getWorkSchedulesByUser } from '@/lib/data/work-schedules';

export const dynamic = 'force-dynamic';

export default async function WorkPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const schedules = await getWorkSchedulesByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Work" title="Make your workday feel structured and light" description="Keep your recurring shifts visible so Glow OS can plan tasks, routines, and rest around real work hours.">
        <WorkScheduleManager initialSchedules={schedules.map((s) => ({ id: s.id, title: s.title, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, notes: s.notes }))} />
      </SectionPage>
    </AppShell>
  );
}
