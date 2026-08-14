import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { navItems } from '@/lib/navigation';
import { Sparkles } from 'lucide-react';

export const dynamic='force-dynamic';

const groups=[
  {title:'Today',paths:['/dashboard','/today','/briefings']},
  {title:'Life',paths:['/calendar','/tasks','/reminders','/timeline','/goals','/planning','/tomorrow']},
  {title:'Mind',paths:['/brain','/concierge','/memory','/observations','/graph','/notes']},
  {title:'Wellness',paths:['/wellness','/fitness','/food','/maintenance','/habits','/routines']},
  {title:'Beauty',paths:['/beauty','/beauty/lab','/hair']},
  {title:'Money',paths:['/finance/brain','/finance','/goals']},
  {title:'Work + Create',paths:['/projects','/creative-studio','/work']},
  {title:'Home + World',paths:['/home','/world','/closet']},
  {title:'Tools + Modes',paths:['/focus','/intake','/inbox','/rules']},
  {title:'System',paths:['/gmail','/connections','/import','/notices','/resources','/settings']},
];
const byHref=new Map(navItems.map(item=>[item.href,item]));

export default function AllRoomsPage(){
  return <AppShell><div className="space-y-5">
    <header><p className="glow-eyebrow text-[#C9727E]">Your World</p><h1 className="glow-display mt-1 text-[42px] leading-[1.02] tracking-[-.025em] sm:text-[54px] lg:text-[60px]">All Rooms</h1><p className="mt-2 text-[13px] text-[#8A8078]">Every part of your life, beautifully connected.</p></header>
    <div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#FDF3F2] px-3 py-2 text-[10.5px] text-[#C9727E]">All</span><span className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#8A8078]">Life</span><span className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#8A8078]">Mind</span><span className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#8A8078]">Wellness</span><span className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#8A8078]">Money</span><span className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#8A8078]">Home</span><span className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#8A8078]">Work</span><span className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#8A8078]">Create</span></div>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{groups.map(group=><Card key={group.title}><h2 className="glow-display text-[18px]">{group.title}</h2><div className="mt-4 space-y-1">{group.paths.map(path=>byHref.get(path)).filter(Boolean).map(item=>{const Icon=item!.icon;return <Link key={item!.href} href={item!.href} className="flex items-center gap-3 rounded-[10px] px-2 py-2.5 hover:bg-[#FDF8F6]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDF3F2] text-[#C9727E]"><Icon size={13}/></span><div className="min-w-0 flex-1"><p className="text-[11.5px] font-medium text-[#3A332E]">{item!.label}</p><p className="truncate text-[9.5px] text-[#9A9088]">{item!.description}</p></div><span className="text-[#C9727E]">→</span></Link>})}</div></Card>)}</section>
    <section className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
      <Card><h2 className="glow-display text-[18px]">Life Support</h2><div className="mt-4 space-y-3">{['/home','/concierge','/connections','/gmail','/reminders'].map(path=>byHref.get(path)).filter(Boolean).map(item=><Link key={item!.href} href={item!.href} className="flex justify-between text-[11px]"><span>{item!.label}</span><span className="text-[#C9727E]">Open</span></Link>)}</div></Card>
      <Card><h2 className="glow-display text-[18px]">Core Rooms</h2><p className="mt-4 text-[11px] leading-5 text-[#8B7C74]">The rooms you use most stay in the compact sidebar. Everything else stays here so the interface remains calm instead of becoming crowded.</p><div className="mt-3 flex flex-wrap gap-2">{['/dashboard','/brain','/planning','/wellness','/beauty','/finance'].map(path=>byHref.get(path)).filter(Boolean).map(item=><Link key={item!.href} href={item!.href} className="rounded-full border border-[#F1E7E3] px-3 py-2 text-[10px]">{item!.label}</Link>)}</div></Card>
      <Card><h2 className="glow-display text-[18px]">System Principle</h2><p className="mt-4 text-[11px] leading-5 text-[#8B7C74]">Rooms are different views of the same life data. Calendar events, tasks, routines, finances, notes and memories should stay connected across the entire system.</p></Card>
    </section>
    <Card className="grid gap-4 bg-[linear-gradient(90deg,#FFF,#FFF7F5)] lg:grid-cols-[160px_1fr_auto] lg:items-center"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><span className="glow-display text-[18px]">Glow Insight</span></div><p className="glow-display text-[17px] italic text-[#4A4440]">Everything has a home. Every room shares the same intelligence.</p><span className="glow-display text-[24px] text-[#C9727E]">{navItems.length}</span></Card>
  </div></AppShell>;
}
