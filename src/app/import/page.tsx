import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { MasterImporter } from '@/components/importer/master-importer';
import { UploadedImporter } from '@/components/importer/uploaded-importer';
import { getImportBatchesByUser } from '@/lib/importer/confirm';

export const dynamic='force-dynamic';

const destinations=[
  {label:'Source Migration Review',href:'/brain/migration-review',cue:'Source → canonical object'},
  {label:'Import Review',href:'/brain/import-review',cue:'What changed'},
  {label:'Imported Knowledge',href:'/brain/imported',cue:'Provenance and relationships'},
];

export default async function ImportPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const batches=await getImportBatchesByUser(session.user.id);

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Create · Import"
        title="Import"
        question="What is this source actually saying, where should it go, and what must remain attributable?"
        climate="create"
        destinations={destinations}
        aside={<div><small className="text-[11px] uppercase tracking-[.14em] text-[#92758a]">Import history</small><p className="mt-2 font-serif text-[28px] text-[#534657]">{batches.length}</p><p className="text-[12px] text-[#827684]">confirmed or reviewed import batches</p></div>}
      >
        <div className="space-y-9">
          <section><p className="text-[11px] uppercase tracking-[.16em] text-[#92758a]">Source intake</p><h2 className="mt-2 font-serif text-[27px] text-[#514653]">Preview before anything becomes Glow truth</h2><p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#817581]">Upload or choose source material, preview it, organize the selection, review the proposed transformation, then confirm. Source provenance remains attached.</p></section>
          <UploadedImporter />
          <section className="border-t border-[#e4dbe5] pt-8"><MasterImporter initialBatches={batches}/></section>
        </div>
      </CanonicalDomainRoom>
    </AppShell>
  );
}
