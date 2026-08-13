'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {ArrowUpRight} from 'lucide-react';
import {useEffect,useState} from 'react';
import type {RoomUpgradeSet} from '@/lib/upgrades/types';
import {loadUpgradeSet,upgradeHref,upgradeKeyForPath} from '@/lib/upgrades/loader';

export function RoomUpgradeDeck(){
 const pathname=usePathname(),[set,setSet]=useState<RoomUpgradeSet|null>(null);
 useEffect(()=>{if(pathname.startsWith('/upgrades/')){setSet(null);return;}const key=upgradeKeyForPath(pathname);let active=true;if(!key){setSet(null);return;}loadUpgradeSet(key).then(v=>{if(active)setSet(v);}).catch(()=>{if(active)setSet(null);});return()=>{active=false;};},[pathname]);
 if(!set||set.upgrades.length!==10)return null;
 return <section id="glow-upgrades" className="mt-14 border-t border-[#EDE4DF] pt-10"><div className="grid gap-8 lg:grid-cols-[minmax(220px,.7fr)_minmax(0,1.8fr)]"><div><p className="text-[9px] font-semibold uppercase tracking-[.2em] text-[#A96C72]">Deep tools</p><h2 className="glow-display mt-2 text-[34px] leading-[1.05] text-[#2B2420]">Go deeper in {set.label}.</h2><p className="mt-4 max-w-[320px] text-[12px] leading-5 text-[#887D76]">These are working destinations. Existing features open their real page, relationship tools use Glow objects, and new records save back into the system.</p></div><div className="divide-y divide-[#EEE5E0] border-y border-[#EEE5E0]">{set.upgrades.map((u,i)=><Link key={u.id} href={upgradeHref(set,u)} className="group grid min-h-[74px] grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 px-1 py-3 transition hover:bg-white/55 sm:grid-cols-[46px_180px_minmax(0,1fr)_auto]"><span className="text-[9px] font-semibold tracking-[.12em] text-[#B68D86]">{String(i+1).padStart(2,'0')}</span><h3 className="text-[12px] font-medium text-[#342B27]">{u.label}</h3><p className="hidden text-[10.5px] leading-4 text-[#91857E] sm:block">{u.description}</p><ArrowUpRight size={13} className="text-[#A96C72] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/></Link>)}</div></div></section>;
}
