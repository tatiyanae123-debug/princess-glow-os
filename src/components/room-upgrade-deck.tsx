'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect,useState} from 'react';
import type {RoomUpgradeSet} from '@/lib/upgrades/types';
import {loadUpgradeSet,upgradeHref,upgradeKeyForPath} from '@/lib/upgrades/loader';

export function RoomUpgradeDeck(){
 const pathname=usePathname(),[set,setSet]=useState<RoomUpgradeSet|null>(null);
 useEffect(()=>{if(pathname.startsWith('/upgrades/')){setSet(null);return;}const key=upgradeKeyForPath(pathname);let active=true;if(!key){setSet(null);return;}loadUpgradeSet(key).then(v=>{if(active)setSet(v);}).catch(()=>{if(active)setSet(null);});return()=>{active=false;};},[pathname]);
 if(!set||set.upgrades.length!==10)return null;
 return <section className="mt-12 border-t border-[#EFE3DE] pt-8"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#C9727E]">Glow upgrades</p><h2 className="glow-display mt-1 text-[28px] text-[#2B2420]">Go deeper in {set.label}.</h2><p className="mt-2 max-w-2xl text-[12px] leading-5 text-[#8A8078]">Ten connected tools. Existing features open their real destination; new capabilities save into Glow.</p><div className="mt-5 grid gap-px overflow-hidden rounded-[22px] border border-[#EFE3DE] bg-[#EFE3DE] sm:grid-cols-2 xl:grid-cols-5">{set.upgrades.map((u,i)=><Link key={u.id} href={upgradeHref(set,u)} className="min-w-0 bg-[#FFFDFC] p-4 transition hover:bg-[#FCF3F1]"><span className="text-[9px] font-semibold text-[#C9727E]">{String(i+1).padStart(2,'0')}</span><h3 className="mt-4 text-[12px] font-medium text-[#342B27]">{u.label}</h3><p className="mt-1.5 text-[10px] leading-4 text-[#8E817A]">{u.description}</p></Link>)}</div></section>;
}
