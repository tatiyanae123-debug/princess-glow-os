'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {upgradesForRoom} from '@/lib/intelligence/room-upgrades';
import {getSystemRoom} from '@/lib/intelligence/system-registry';

function key(path:string){
 if(path.startsWith('/upgrade/'))return null;
 const map:[string,string][]=[
  ['/briefings/evening','evening-debrief'],['/briefings/weekly','weekly-debrief'],['/briefings/monthly','monthly-debrief'],
  ['/wellness/medications','medications'],['/brain/connections','brain-connections'],['/creative-studio','creative-studio'],
  ['/reminders','reminders'],['/routines','routines'],['/today','dashboard'],['/tomorrow','planning'],['/maintenance','wellness'],
  ['/intake','intake'],['/inbox','intake'],['/rules','rules'],['/search','search'],['/all-rooms','all-rooms'],['/notices','notices'],['/work','work'],['/graph','graph']
 ];
 const hit=map.find(([prefix])=>path.startsWith(prefix));if(hit)return hit[1];
 const room=getSystemRoom(path);return room?.key==='today'?'dashboard':room?.key??null;
}

export function UpgradeDockV2(){const path=usePathname(),room=key(path);if(!room)return null;const tools=upgradesForRoom(room);if(!tools.length)return null;return <section className="mt-10 overflow-hidden rounded-[26px] border border-[#EDE1DC] bg-[#FFFDFC]"><div className="border-b border-[#EFE4DF] px-5 py-5"><p className="glow-eyebrow">Glow Project Upgrade</p><h2 className="glow-display mt-1 text-2xl">10 upgrades for this room</h2></div><div className="grid sm:grid-cols-2 xl:grid-cols-5">{tools.map((tool,index)=><Link key={tool.id} href={`/upgrade/${room}/${tool.id}`} className="min-w-0 border-b border-r border-[#F1E7E3] p-4 hover:bg-[#FFF7F6]"><p className="text-[9px] font-semibold text-[#B66D77]">{String(index+1).padStart(2,'0')}</p><h3 className="mt-2 text-sm font-semibold text-[#3A302C]">{tool.label}</h3><p className="mt-1 text-[10px] leading-4 text-[#8B7C74]">{tool.description}</p>{tool.href?<p className="mt-2 text-[9px] font-semibold uppercase tracking-[.1em] text-[#B58B89]">Native feature linked inside</p>:null}</Link>)}</div></section>}
