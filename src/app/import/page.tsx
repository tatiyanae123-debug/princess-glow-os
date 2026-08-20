import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch10ImportView } from '@/components/batch10/special-features-reference';
import { MasterImporter } from '@/components/importer/master-importer';
import { UploadedImporter } from '@/components/importer/uploaded-importer';
import { getImportBatchesByUser } from '@/lib/importer/confirm';

export const dynamic='force-dynamic';
export default async function ImportPage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const batches=await getImportBatchesByUser(session.user.id);
 return <AppShell><div className="space-y-3"><Batch10ImportView recent={batches}/><section id="import-tools" className="mx-auto max-w-[1180px] scroll-mt-20 rounded-[8px] border border-[#ebe4df] bg-white p-4 shadow-[0_10px_28px_rgba(57,43,35,.045)]"><div className="mb-3"><p className="text-[8px] font-semibold uppercase tracking-[.1em] text-[#756d68]">Real Import Tools</p><p className="mt-1 text-[8px] text-[#978d87]">Preview, classify and confirm before anything is committed to Glow OS.</p></div><div className="space-y-4"><UploadedImporter/><MasterImporter initialBatches={batches}/></div></section></div></AppShell>;
}
