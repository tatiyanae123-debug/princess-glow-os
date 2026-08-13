'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {upgradesForRoom} from '@/lib/intelligence/room-upgrades';
import {getSystemRoom} from '@/lib/intelligence/system-registry';

function roomKey(path:string){
 if(path.startsWith('/upgrade/'))return null;
 if(path.startsWith('/briefings/evening'))return'evening-debrief';
 if(path.startsWith('/wellness/medications'))return'medications';
 if(path.startsWith('/brain/connections'))return'brain-connections';
 if(path.startsWith('/intake')||path.startsWith('/inbox'))return'intake';
 if(path.startsWith('/rules'))return'rules';
 if(path.startsWith('/search'))return'search';
 if(path.startsWith('/all-rooms'))return'all-rooms';
 if(path.startsWith('/notices'))return'notices';
 if(path.startsWith('/work'))return'work';
 if(path.startsWith('/graph'))return'graph';
 return getSystemRoom(path)?.key??null;
}

export function UpgradeDock(){
 const path=usePathname(),room=roomKey(path);if(!room)return null;const tools=upgradesForRoom(room);if(!tools.length)return null;
 return <section className="mt-10 overflow-hidden rounded-[26px] border border-[#EDE1DC] bg-[#FFFDFC]"><div className="border-b border-[#EFE4DF] px-5 py-5"><p className="glow-eyebrow">Glow Project Upgrade</p><h2 className="glow-display mt-1 text-2xl">10 upgrades for this room</h2></div><div className="grid sm:grid-cols-2 xl:grid-cols-5">{tools.map((tool,index)=><Link key={tool.id} href={tool.href??`/upgrade/${room}/${tool.id}`} className="min-w-0 border-b border-r border-[#F1E7E3] p-4 hover:bg-[#FFF7F6]"><p className="text-[9px] font-semibold text-[#B66D77]">{String(index+1).padStart(2,'0')}</p><h3 className="mt-2 text-sm font-semibold text-[#3A302C]">{tool.label}</h3><p className="mt-1 text-[10px] leading-4 text-[#8B7C74]">{tool.description}</p></Link>)}</div></section>;
}
