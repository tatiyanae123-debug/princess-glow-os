'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, BrainCircuit, BriefcaseBusiness, CalendarDays, CheckSquare2, CircleDollarSign, FolderKanban, Home, NotebookTabs, Palette, Search, Settings, Sparkles, Target, UserRoundSearch, WandSparkles } from 'lucide-react';

const groups = [
  { label: '', items: [
    ['Home','/dashboard',Home],['Dashboard','/today',Sparkles],['Calendar','/calendar',CalendarDays],['Tasks','/tasks',CheckSquare2],
  ]},
  { label: 'WORK + CREATE', items: [
    ['Projects','/projects',FolderKanban],['Creative Studio','/creative-studio',Palette],['Career & Work','/work',BriefcaseBusiness],['Applications','/work/applications',NotebookTabs],['Interviews','/work/interviews',UserRoundSearch],['Terrain Design','/projects/terrain-design',WandSparkles],
  ]},
  { label: 'MIND', items: [['Brain','/brain',BrainCircuit],['Goals','/goals',Target]] },
  { label: 'MONEY', items: [['Finance','/finance/overview',CircleDollarSign]] },
  { label: 'MORE', items: [['Notes','/notes',NotebookTabs],['Settings','/settings',Settings]] },
] as const;

function active(pathname:string, href:string){
  if(href==='/projects') return pathname==='/projects' || pathname.startsWith('/projects/deep-dive');
  if(href==='/work') return pathname==='/work';
  return pathname===href || pathname.startsWith(`${href}/`);
}

export function Batch6Sidebar(){
  const pathname=usePathname();
  return <aside className="b6-sidebar">
    <Link href="/dashboard" className="b6-sidebar-brand"><Sparkles size={14}/><span>GLOW OS</span></Link>
    <nav>{groups.map((group)=><div className="b6-sidebar-group" key={group.label||'main'}>{group.label?<p>{group.label}</p>:null}{group.items.map(([label,href,Icon])=><Link href={href} key={href} className={active(pathname,href)?'active':''}><Icon size={13}/><span>{label}</span></Link>)}</div>)}</nav>
    <div className="b6-sidebar-bottom"><Link href="/settings?section=profile"><span className="b6-avatar">T</span><span><strong>Tatiyana</strong><small>View Profile</small></span></Link><div><button type="button" onClick={()=>document.dispatchEvent(new CustomEvent('glow:search-open'))} aria-label="Search"><Search size={14}/></button><Link href="/notices" aria-label="Notifications"><Bell size={14}/></Link><Link href="/settings" aria-label="Settings"><Settings size={14}/></Link></div></div>
  </aside>;
}
