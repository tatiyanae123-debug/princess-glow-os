'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, BrainCircuit, BriefcaseBusiness, CalendarDays, CheckSquare2, CircleDollarSign, Dumbbell, Heart, Home, LayoutGrid, MemoryStick, Network, Search, Settings, Sparkles, Utensils, WandSparkles, Waves } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const GROUPS:{label?:string;items:{label:string;href:string;icon:LucideIcon}[]}[]=[
 {items:[{label:'Home',href:'/home',icon:Home},{label:'Dashboard',href:'/dashboard',icon:LayoutGrid},{label:'Calendar',href:'/calendar',icon:CalendarDays},{label:'Tasks',href:'/tasks',icon:CheckSquare2},{label:'Routines',href:'/routines',icon:Waves}]},
 {label:'MIND',items:[{label:'Brain',href:'/brain',icon:BrainCircuit},{label:'Memory',href:'/memory',icon:MemoryStick},{label:'Concierge',href:'/concierge',icon:Sparkles}]},
 {label:'WELLNESS',items:[{label:'Wellness',href:'/wellness',icon:Heart},{label:'Fitness',href:'/fitness',icon:Dumbbell},{label:'Food',href:'/food',icon:Utensils},{label:'Beauty',href:'/beauty',icon:WandSparkles}]},
 {label:'MONEY',items:[{label:'Finance',href:'/finance',icon:CircleDollarSign}]},
 {label:'WORLD',items:[{label:'Life World',href:'/world',icon:Sparkles}]},
 {label:'TOOLS',items:[{label:'Connections',href:'/connections',icon:Network},{label:'System Overview',href:'/system-overview',icon:BriefcaseBusiness},{label:'Settings',href:'/settings',icon:Settings}]},
];
function active(pathname:string,href:string){if(href==='/dashboard')return pathname==='/dashboard';return pathname===href||pathname.startsWith(`${href}/`)}

export function Batch9Sidebar(){
 const pathname=usePathname();
 function openSearch(){document.dispatchEvent(new CustomEvent('glow:search-open'))}
 return <aside className="flex min-h-screen w-full flex-col bg-white px-[13px] pb-[15px] pt-[16px] text-[#292421]">
  <Link href="/dashboard" className="flex h-10 items-center gap-2 px-1"><Sparkles size={15} className="text-[#7b3850]"/><span className="font-serif text-[13px] font-semibold tracking-[.08em]">GLOW OS</span></Link>
  <nav className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">{GROUPS.map((group,gi)=><div key={group.label??`group-${gi}`} className="mb-3">{group.label?<p className="mb-1.5 px-2 text-[7px] font-semibold tracking-[.15em] text-[#948a84]">{group.label}</p>:null}<div className="space-y-[2px]">{group.items.map(({label,href,icon:Icon})=>{const on=active(pathname,href);return <Link key={href} href={href} className={`flex min-h-[31px] items-center gap-2 rounded-[6px] px-2 text-[9px] ${on?'bg-[#f4e7e9] font-medium text-[#6f2943]':'text-[#3f3935] hover:bg-[#faf5f2]'}`}><Icon size={12.5} strokeWidth={1.45}/><span>{label}</span></Link>})}</div></div>)}</nav>
  <div className="border-t border-[#eee7e2] pt-2.5"><Link href="/settings?section=profile" className="flex items-center gap-2 rounded-[8px] px-1.5 py-2 hover:bg-[#faf5f2]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(145deg,#ead4da,#f5e8e7)] font-serif text-[11px] text-[#6f2943]">T</span><span className="min-w-0 flex-1"><span className="block text-[8.5px] font-medium">Tatiyana</span><span className="block text-[6.5px] text-[#9a8f88]">View Profile</span></span></Link><div className="mt-2 flex items-center justify-between border-t border-[#eee7e2] px-2 pt-2 text-[#625a55]"><button onClick={openSearch} type="button" aria-label="Search Glow" className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#faf5f2]"><Search size={13}/></button><Link href="/notices" aria-label="Notifications" className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#faf5f2]"><Bell size={13}/></Link><Link href="/settings" aria-label="Settings" className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#faf5f2]"><Settings size={13}/></Link></div></div>
 </aside>
}
