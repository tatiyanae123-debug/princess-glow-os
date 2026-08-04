import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { WellnessEntryManager } from '@/components/wellness/wellness-entry-manager';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';

export const dynamic = 'force-dynamic';

export default async function WellnessPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const entries = await getWellnessEntriesByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Wellness" title="Energy that feels supported" description="Let wellness be practical, restorative, and deeply personal.">
        <WellnessEntryManager initialEntries={entries} />
      </SectionPage>
    </AppShell>
  );
}
