'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
 Bell, BrainCircuit, CalendarDays, CheckSquare2, CircleDollarSign, Dumbbell,
 Grid2X2, HeartPulse, Home, Mail, NotebookTabs, Pill, Settings, Sparkles,
 Utensils, WandSparkles, Waves, ChevronRight, type LucideIcon,
} from 'lucide-react';

const groups:{label?:string;items:{label:string;href:string;icon:LucideIcon;match?:string[]}[]}[]=[
 {items:[{label:'Home',href:'/home',icon:Home},{label:'Dashboard',href:'/dashboard',icon:Grid2X2},{label:'Calendar',href:'/calendar',icon:CalendarDays},{label:'Tasks',href:'/tasks',icon:CheckSquare2},{label:'Routines',href:'/routines',icon:Sparkles}]},
 {label:'MIND',items:[{label:'Brain',href:'/brain',icon:BrainCircuit},{label:'Memory',href:'/memory',icon:NotebookTabs},{label:'Concierge',href:'/concierge',icon:Sparkles}]},
 {label:'WELLNESS',items:[{label:'Wellness',href:'/wellness',icon:HeartPulse},{label:'Fitness',href:'/fitness',icon:Dumbbell},{label:'Food',href:'/food',icon:Utensils},{label:'Beauty',href:'/beauty',icon:WandSparkles}]},
 {label:'MONEY',items:[{label:'Finance',href:'/finance',icon:CircleDollarSign,match:['/finance','/money']},{label:'Financial Brain',href:'/finance/brain',icon:Waves}]},
 {label:'WORLD',items:[{label:'Life World',href:'/world',icon:Sparkles,match:['/world','/life-world']},{label:'All Rooms',href:'/all-rooms',icon:Grid2X2}]},
 {label:'MORE',items:[{label:'Notes',href:'/notes',icon:NotebookTabs},{label:'Gmail',href:'/gmail',icon:Mail},{label:'Reminders',href:'/reminders',icon:Bell},{label:'Settings',href:'/settings',icon:Settings}]},
];
function active(pathname:string,href:string,match?:string[]){const candidates=match??[href];return candidates.some(p=>pathname===p||pathname.startsWith(`${p}/`))}
export function Batch10Sidebar(){const pathname=usePathname();return <aside className="b10-sidebar"><Link href="/dashboard" className="b10-side-brand"><Sparkles size={14}/><span>GLOW OS</span></Link><nav>{groups.map((group,index)=><div className="b10-side-group" key={group.label??index}>{group.label?<p>{group.label}</p>:null}{group.items.map(({label,href,icon:Icon,match})=><Link className={active(pathname,href,match)?'active':''} href={href} key={href}><Icon size={13}/><span>{label}</span></Link>)}</div>)}</nav><div className="b10-side-profile"><span>T</span><div><strong>Tatiyana</strong><small>View Profile</small></div><ChevronRight size={12}/></div></aside>}
