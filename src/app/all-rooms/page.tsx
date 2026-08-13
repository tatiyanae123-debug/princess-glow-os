import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { navItems } from '@/lib/navigation';
import { Sparkles } from 'lucide-react';

export const dynamic='force-dynamic';

const groups=[
  {title:'Daily',paths:['/dashboard','/today','/planning','/tasks','/calendar','/routines','/habits']},
  {title:'Health & Care',paths:['/fitness','/wellness','/food','/beauty','/beauty/lab','/hair','/maintenance']},
  {title:'Growth & Planning',paths:['/goals','/projects','/finance','/finance/brain','/work']},
  {title:'Intelligence',paths:['/brain','/concierge','/observations','/memory','/timeline','/briefings']},
  {title:'Life & Support',paths:['/home','/closet','/notes','/gmail','/reminders','/connections']},
  {title:'System',paths:['/import','/resources','/settings','/intake','/inbox','/rules']},
];
const byHref=new Map(navItems.map(item=>[item.href,item]));

export default function AllRoomsPage(){
  return <AppShell><div className="space-y-5">
    <header><p className="glow-eyebrow text-[#C9727E]">All Rooms</p><h1 className="glow-display mt-1 text-[42px] leading-[1.02] tracking-[-.025em] sm:text-[54px] lg:text-[60px]">All Rooms</h1><p className="mt-2 text-[13px] text-[#8A8078]">Explore every part of your Glow OS world.</p></header>
    <div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#FDF3F2] px-3 py-2 text-[10.5px] text-[#C9727E]">All Rooms</span><span className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#8A8078]">Favorites</span><span className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#8A8078]">Recently Visited</span><span className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#8A8078]">All Categories</span></div>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{groups.map(group=><Card key={group.title}><h2 className="glow-display text-[18px]">{group.title}</h2><div className="mt-4 space-y-1">{group.paths.map(path=>byHref.get(path)).filter(Boolean).map(item=>{const Icon=item!.icon;return <Link key={item!.href} href={item!.href} className="flex items-center gap-3 rounded-[10px] px-2 py-2.5 hover:bg-[#FDF8F6]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FDF3F2] text-[#C9727E]"><Icon size={13}/></span><div className="min-w-0 flex-1"><p className="text-[11.5px] font-medium text-[#3A332E]">{item!.label}</p><p className="truncate text-[9.5px] text-[#9A9088]">{item!.description}</p></div><span className="text-[#C9727E]">→</span></Link>})}</div></Card>)}</section>
    <section className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr]">
      <Card><h2 className="glow-display text-[18px]">Life Support</h2><div className="mt-4 space-y-3">{['/home','/concierge','/connections','/gmail','/reminders'].map(path=>byHref.get(path)).filter(Boolean).map(item=><Link key={item!.href} href={item!.href} className="flex justify-between text-[11px]"><span>{item!.label}</span><span className="text-[#C9727E]">Open</span></Link>)}</div></Card>
      <Card><h2 className="glow-display text-[18px]">Recent Rooms</h2><p className="mt-4 text-[11px] leading-5 text-[#8A8078]">Recent-visit persistence is not stored yet, so this section links to the rooms most central to the current V3 system rather than pretending to know your browsing history.</p><div className="mt-3 flex flex-wrap gap-2">{['/dashboard','/brain','/planning','/wellness'].map(path=>byHref.get(path)).filter(Boolean).map(item=><Link key={item!.href} href={item!.href} className="rounded-full border border-[#F1E7E3] px-3 py-2 text-[10px]">{item!.label}</Link>)}</div></Card>
      <Card><h2 className="glow-display text-[18px]">Favorites</h2><p className="mt-4 text-[11px] leading-5 text-[#8A8078]">Room favorites are not a stored preference yet. Use All Rooms as the complete, honest navigation index until that capability is added.</p></Card>
    </section>
    <Card className="grid gap-4 bg-[linear-gradient(90deg,#FFF,#FFF7F5)] lg:grid-cols-[160px_1fr_auto] lg:items-center"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><span className="glow-display text-[18px]">Glow Insight</span></div><p className="glow-display text-[17px] italic text-[#4A4440]">Everything has a home. When your spaces are in order, your mind gets to be free.</p><span className="glow-display text-[24px] text-[#C9727E]">{navItems.length}</span></Card>
  </div></AppShell>;
}
