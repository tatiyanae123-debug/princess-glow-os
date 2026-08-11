'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { getSystemRoom } from '@/lib/intelligence/system-registry';
import { DEEP_WORKSPACES } from '@/lib/workspaces/deep-workspace-blueprints';
import { RoomExperienceStage } from '@/components/room-experience-stage';

export function DeepWorkspaceCanvas(){
  const pathname=usePathname();
  const room=getSystemRoom(pathname);
  if(!room||room.key==='dashboard'||room.key==='today') return null;
  const spec=DEEP_WORKSPACES[room.key];
  return <>
    <RoomExperienceStage roomKey={room.key}/>
    {spec?<details className="group mb-6 overflow-hidden rounded-[16px] border border-[#e7dbd3] bg-white/45">
      <summary className="cursor-pointer list-none px-4 py-3 text-[8px] font-semibold uppercase tracking-[.15em] text-[#8f7770]">Room map + connected tools</summary>
      <div className="grid gap-px border-t border-[#eadfd6] bg-[#eadfd6] md:grid-cols-2 xl:grid-cols-4">{spec.modules.map((item,index)=><article key={item.title} className={`min-h-[120px] bg-[#fffaf6] p-4 ${index%2===1?'xl:bg-[#fdf6f2]':''}`}><p className="text-[7px] font-semibold uppercase tracking-[.14em] text-[#b17a81]">0{index+1}</p><h3 className="glow-display mt-2 text-[15px] leading-5 text-[#40342f]">{item.title}</h3><p className="mt-2 text-[8px] leading-4 text-[#806e67]">{item.description}</p>{item.href?<Link href={item.href} className="mt-3 inline-flex items-center gap-1 text-[8px] font-medium text-[#9c6069]">{item.action??'Open'}<ArrowRight size={9}/></Link>:null}</article>)}</div>
    </details>:null}
  </>;
}
