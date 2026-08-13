import Link from 'next/link';
import {ROOM_UPGRADES} from '@/lib/intelligence/room-upgrades';
export function SpecialUpgradeGrid({room}:{room:string}){const xs=ROOM_UPGRADES[room]??[];return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{xs.map((x,i)=><Link key={x.id} href={`/upgrade/${room}/${x.id}`} className="rounded-2xl border border-[#EDE1DC] bg-white p-4 hover:bg-[#FFF7F6]"><p className="text-[9px] text-[#B66D77]">{i+1}/10</p><p className="mt-2 text-sm font-semibold">{x.label}</p><p className="mt-1 text-[10px] leading-4 text-[#8B7C74]">{x.description}</p></Link>)}</div>}
