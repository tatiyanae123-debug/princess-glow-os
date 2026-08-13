import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { MasterImporter } from '@/components/importer/master-importer';
import { UploadedImporter } from '@/components/importer/uploaded-importer';
import { Card } from '@/components/ui/card';
import { getImportBatchesByUser } from '@/lib/importer/confirm';
import { CalendarDays, File, FileImage, FileSpreadsheet, Link2, NotebookPen, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

const SOURCES = [
  { label: 'Files & Documents', sub: 'Word, Docs, TXT and more', icon: File },
  { label: 'Notes', sub: 'Bring notes into Glow', icon: NotebookPen },
  { label: 'CSV / Spreadsheets', sub: 'Import CSV or Excel', icon: FileSpreadsheet },
  { label: 'Calendar', sub: 'Calendar and ICS data', icon: CalendarDays },
  { label: 'Photos', sub: 'JPG, PNG, HEIC and more', icon: FileImage },
  { label: 'App Connections', sub: 'Use connected sources', icon: Link2 },
];

export default async function ImportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const batches = await getImportBatchesByUser(session.user.id);
  const recent = [...batches].slice(0, 5);

  return (
    <AppShell>
      <SectionPage eyebrow="Import Center" title="Import" description="Bring your content into Glow OS and keep everything in one beautifully organized space.">
        <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <Card>
              <h2 className="glow-display text-[20px] text-[#2B2420]">Quick Import</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {SOURCES.map(({ label, sub, icon: Icon }) => (
                  <div key={label} className="min-w-0 rounded-[16px] border border-[#F1E7E3] bg-[#FFFEFD] p-4 text-center">
                    <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#FDF3F2] text-[#9A6C61]"><Icon size={18}/></span>
                    <p className="glow-display mt-3 text-[14px] text-[#2B2420]">{label}</p>
                    <p className="mt-1 text-[10px] leading-4 text-[#9A9088]">{sub}</p>
                  </div>
                ))}
              </div>
            </Card>

            <UploadedImporter />
            <MasterImporter initialBatches={batches} />
          </div>

          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between"><h2 className="glow-display text-[18px]">Recent Imports</h2><span className="text-[10px] text-[#C9727E]">View all</span></div>
              <div className="mt-4 space-y-3">
                {recent.length === 0 ? <p className="text-[11px] text-[#9A9088]">No imports yet.</p> : recent.map((batch, index) => (
                  <div key={batch.id ?? index} className="flex items-start gap-3 border-b border-[#F4ECE8] pb-3 last:border-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#FDF3F2] text-[#C9727E]"><File size={14}/></span>
                    <div className="min-w-0 flex-1"><p className="truncate text-[11.5px] font-medium text-[#3A332E]">Import batch {index + 1}</p><p className="mt-0.5 text-[10px] text-[#9A9088]">Saved in Glow OS</p></div>
                    <span className="rounded-full bg-[#E4EBDD] px-2 py-1 text-[9px] text-[#5A6E52]">Completed</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="bg-[linear-gradient(145deg,#FFF9F6,#F7EDE7)]">
              <div className="flex items-center gap-2 text-[#C9727E]"><Sparkles size={14}/><p className="text-[10px] font-semibold uppercase tracking-[.12em]">Glow Tip</p></div>
              <p className="glow-display mt-5 text-[20px] leading-7 text-[#3A332E]">Import and organize</p>
              <p className="mt-2 text-[11px] leading-5 text-[#8A8078]">After importing, use Rooms, tags, and connections to keep everything easy to find.</p>
            </Card>
          </div>
        </div>

        <Card className="grid gap-4 bg-[linear-gradient(90deg,#FFF,#FFF8F5)] lg:grid-cols-[180px_1fr_280px] lg:items-center">
          <div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><span className="glow-display text-[18px]">Glow Insight</span></div>
          <p className="glow-display text-[17px] italic text-[#4A4440]">“Every new idea starts with something you bring in.”</p>
          <p className="text-right text-[10.5px] text-[#9A9088]">{batches.length} import batch{batches.length === 1 ? '' : 'es'} in history</p>
        </Card>
      </SectionPage>
    </AppShell>
  );
}
