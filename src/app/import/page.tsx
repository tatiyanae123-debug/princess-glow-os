import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch7ImportView } from '@/components/batch7/home-world-reference';
import { MasterImporter } from '@/components/importer/master-importer';
import { UploadedImporter } from '@/components/importer/uploaded-importer';
import { getImportBatchesByUser } from '@/lib/importer/confirm';

export const dynamic='force-dynamic';
export default async function ImportPage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const batches=await getImportBatchesByUser(session.user.id);
 return <AppShell><div className="space-y-4"><Batch7ImportView recent={batches}/><details id="import-tools" className="b7-card scroll-mt-24" open={batches.length===0}><summary className="cursor-pointer text-[10px] font-medium">Open import tools</summary><div className="mt-4 space-y-4"><UploadedImporter/><MasterImporter initialBatches={batches}/></div></details></div></AppShell>;
}
