import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { AppShell } from '@/components/app-shell';
import { UniversalIntakeForm } from '@/components/intake/universal-intake-form';
import { db } from '@/db';
import { universalIntakeArtifacts } from '@/db/schema/interconnected-os';
import { FileImage, FileText, Link2, Mic, NotebookPen, ScanLine, Sparkles, UploadCloud } from 'lucide-react';

export const dynamic='force-dynamic';
export default async function IntakePage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');let artifacts;
 try{artifacts=await db.select().from(universalIntakeArtifacts).where(eq(universalIntakeArtifacts.userId,session.user.id)).orderBy(desc(universalIntakeArtifacts.createdAt)).limit(12)}catch{return <AppShell><div className="b8-intake-page rounded-[8px] border border-[#eee5e1] bg-white p-5"><p className="text-[11px] font-semibold">Universal Intake needs one-time intelligence activation.</p><Link href="/settings/intelligence" className="mt-3 inline-block text-[9px] text-[#8e495a]">Activate Glow Intelligence →</Link></div></AppShell>}
 const actions=[
  {Icon:UploadCloud,label:'Upload',enabled:true},
  {Icon:NotebookPen,label:'Type / Paste',enabled:true},
  {Icon:Link2,label:'Link',enabled:true},
  {Icon:FileImage,label:'Photo',enabled:true},
  {Icon:Mic,label:'Voice',enabled:false},
  {Icon:ScanLine,label:'Scan',enabled:false},
 ];
 return <AppShell><div className="b8-intake-page space-y-3">
  <header><p className="b8-eyebrow">2. UNIVERSAL INTAKE</p><h1>Add Anything</h1><p className="mt-1 text-[10px] text-[#8A8078]">One place to capture, classify, and review incoming information.</p></header>
  <section className="rounded-[8px] border border-[#eee5e1] bg-white p-3">
   <a href="#intake-workspace" className="block rounded-[7px] border border-dashed border-[#ddd0ca] bg-[#fffdfc] px-4 py-5"><p className="font-serif text-[14px] text-[#4b423d]">Add anything to Glow OS…</p><p className="mt-1 text-[8px] text-[#9A9088]">Type, paste, or upload a supported file.</p></a>
   <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">{actions.map(({Icon,label,enabled})=>enabled?<a href="#intake-workspace" key={label} className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-[6px] border border-[#eee5e1] bg-[#fbf8f6] text-[7.5px] text-[#675e59]"><Icon size={12}/>{label}</a>:<button type="button" disabled key={label} title={`${label} capture is not connected yet`} className="relative flex min-h-[44px] cursor-not-allowed flex-col items-center justify-center gap-1 rounded-[6px] border border-[#eee5e1] bg-[#fbf8f6] text-[7.5px] text-[#aaa19b] opacity-70"><Icon size={12}/>{label}<span className="absolute right-1 top-1 text-[6px] uppercase tracking-[.08em]">Soon</span></button>)}</div>
  </section>
  <section><div className="flex items-center justify-between"><h2 className="font-serif text-[13px]">Recent Captures</h2><span className="text-[8px] text-[#9A9088]">{artifacts.length} recent</span></div><div className="mt-2 overflow-hidden rounded-[8px] border border-[#eee5e1] bg-white divide-y divide-[#eee7e2]">{artifacts.length?artifacts.slice(0,6).map(item=><div key={item.id} className="grid grid-cols-[28px_1fr_80px_70px] items-center gap-2 px-3 py-2.5"><span className="grid h-7 w-7 place-items-center rounded-[6px] bg-[#f8efef] text-[#8e495a]"><FileText size={11}/></span><div className="min-w-0"><p className="truncate text-[9px] font-medium">{item.detectedTitle||item.originalName||'Untitled'}</p><p className="truncate text-[7.5px] text-[#9A9088]">{item.originalName||item.kind}</p></div><span className="truncate text-[7.5px] text-[#7b706a]">{item.detectedType||item.kind}</span><span className="text-right text-[7px] text-[#9A9088]">{Math.round(item.confidence*100)}%</span></div>):<p className="px-3 py-8 text-center text-[9px] text-[#9A9088]">Nothing captured yet.</p>}</div></section>
  <section id="intake-workspace" className="scroll-mt-24"><UniversalIntakeForm/></section>
  <div className="flex items-center justify-between rounded-[8px] border border-[#eee5e1] bg-[linear-gradient(90deg,#fff,#f7ede8)] px-3 py-2"><div><p className="font-serif text-[10px]">Glow proposes where it belongs.</p><p className="text-[8px] text-[#8A8078]">You review routing before information is written into other systems.</p></div><Sparkles size={12} className="text-[#8e495a]"/></div>
 </div></AppShell>
}
