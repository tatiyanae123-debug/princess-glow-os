import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { MasterImporter } from '@/components/importer/master-importer';
import { getImportBatchesByUser } from '@/lib/importer/confirm';

export const dynamic = 'force-dynamic';

export default async function ImportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const batches = await getImportBatchesByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage
        eyebrow="Master Importer"
        title="Bring in your Glow OS system"
        description="Preview everything before anything is created. Nothing is written until you confirm."
      >
        <MasterImporter initialBatches={batches} />
      </SectionPage>
    </AppShell>
  );
}
