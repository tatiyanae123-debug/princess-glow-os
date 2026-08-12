import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { MasterImporter } from '@/components/importer/master-importer';
import { Card } from '@/components/ui/card';
import { getImportBatchesByUser } from '@/lib/importer/confirm';
import { FileInput, ShieldCheck } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function ImportPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const batches=await getImportBatchesByUser(session.user.id);
  return <AppShell><SectionPage eyebrow="Master Importer" title="Bring in your Glow OS system" description="Preview everything before anything is created. Nothing is written until you confirm.">
    <div className="space-y-4">
      <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#eeeae5,#f7f1ec)] p-5"><FileInput size={54} strokeWidth={.75} className="absolute right-5 top-3 text-[#7e756d]/15"/><p className="glow-eyebrow">Intake desk</p><p className="glow-display mt-2 text-[24px] text-[#4a413a]">Bring information in without rebuilding it by hand.</p><div className="mt-3 flex items-center gap-2 text-[8px] text-[#7c7169]"><ShieldCheck size={10}/>Preview first · confirm second · write last · {batches.length} import batch{batches.length===1?'':'es'} in history</div></Card>
      <MasterImporter initialBatches={batches}/>
    </div>
  </SectionPage></AppShell>;
}
