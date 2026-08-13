import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { MasterImporter } from '@/components/importer/master-importer';
import { UploadedImporter } from '@/components/importer/uploaded-importer';
import { Card } from '@/components/ui/card';
import { getImportBatchesByUser } from '@/lib/importer/confirm';
import { FileInput, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ImportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const batches = await getImportBatchesByUser(session.user.id);
  return (
    <AppShell>
      <SectionPage eyebrow="Master Importer" title="Bring in your Glow OS system" description="Upload or choose source material, preview everything, organize the selection, review it, then confirm. Nothing is written before the final confirmation.">
        <div className="space-y-4">
          <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#FDF8F6,#F1E8D9)]">
            <FileInput size={54} strokeWidth={0.75} className="absolute right-5 top-4 text-[#9A7A3D]/22" />
            <p className="glow-eyebrow">Intake desk</p>
            <p className="glow-display mt-2 text-[24px] text-[#2B2420]">Bring information in without rebuilding it by hand.</p>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-[#8A8078]"><ShieldCheck size={12} />Upload · preview · organize · review · confirm · {batches.length} import batch{batches.length === 1 ? '' : 'es'} in history</div>
          </Card>
          <UploadedImporter />
          <MasterImporter initialBatches={batches} />
        </div>
      </SectionPage>
    </AppShell>
  );
}
