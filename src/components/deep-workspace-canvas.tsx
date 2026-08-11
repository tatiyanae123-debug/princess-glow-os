'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Layers3, Sparkles } from 'lucide-react';
import { getSystemRoom } from '@/lib/intelligence/system-registry';
import { DEEP_WORKSPACES } from '@/lib/workspaces/deep-workspace-blueprints';

export function DeepWorkspaceCanvas(){
  const pathname=usePathname();
  const room=getSystemRoom(pathname);
  if(!room||room.key==='dashboard'||room.key==='today') return null;
  const spec=DEEP_WORKSPACES[room.key];
  if(!spec) return null;
  return <section className="mb-6 overflow-hidden rounded-[20px] border border-[#e5d8d0] bg-[#fffaf6]/70 shadow-[0_14px_40px_rgba(84,62,52,.05)]">
    <div className="flex flex-col gap-3 border-b border-[#eadfd6] bg-[linear-gradient(110deg,rgba(249,239,234,.88),rgba(255,250,246,.7),rgba(241,231,218,.58))] px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="flex items-center gap-2 text-[#9a6d73]"><Layers3 size={13}/><p className="text-[8px] font-bold uppercase tracking-[.2em]">Deep Workspace</p></div><h2 className="glow-display mt-1 text-[23px] text-[#3e312d]">{spec.label}</h2><p className="mt-1 max-w-3xl text-[10px] leading-5 text-[#7d6962]">{spec.subtitle}</p></div>
      <div className="flex items-center gap-1 text-[8px] uppercase tracking-[.13em] text-[#9a837b]"><Sparkles size={10}/>purpose-built for this room</div>
    </div>
    <div className="grid gap-px bg-[#eadfd6] md:grid-cols-2 xl:grid-cols-4">{spec.modules.map((module,index)=><article key={module.title} className={`min-h-[150px] bg-[#fffaf6] p-4 ${index%2===1?'xl:bg-[#fdf6f2]':''}`}><p className="text-[7px] font-semibold uppercase tracking-[.14em] text-[#b17a81]">0{index+1}</p><h3 className="glow-display mt-2 text-[16px] leading-5 text-[#40342f]">{module.title}</h3><p className="mt-2 text-[9px] leading-4 text-[#806e67]">{module.description}</p>{module.href?<Link href={module.href} className="mt-4 inline-flex items-center gap-1 text-[8px] font-medium text-[#9c6069] transition hover:gap-2">{module.action??'Open'}<ArrowRight size={9}/></Link>:null}</article>)}</div>
  </section>;
}
