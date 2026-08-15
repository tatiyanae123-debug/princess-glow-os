import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { navItems } from '@/lib/navigation';
import { Sparkles } from 'lucide-react';

export const dynamic='force-dynamic';

const groups=[
  {title:'Today + Planning',paths:['/dashboard','/today','/briefings','/planning','/calendar','/tasks','/reminders','/routines','/habits','/timeline','/goals']},
  {title:'Mind',paths:['/brain','/concierge','/memory','/observations','/graph','/brain-connection','/notes','/knowledge']},
  {title:'Wellness',paths:['/wellness','/fitness','/workout-studio','/food','/maintenance','/sleep','/symptoms']},
  {title:'Beauty',paths:['/beauty','/beauty/lab','/beauty-progress','/hair','/hair-lifecycle','/beauty-calendar','/closet']},
  {title:'Money + Goals',paths:['/finance/brain','/finance','/spending','/subscriptions','/forecast','/transactions','/goals']},
  {title:'Work + Create',paths:['/work','/applications','/interviews','/interview-prep','/projects','/creative-studio']},
  {title:'Home + World',paths:['/home','/all-rooms','/world','/travel','/ambient']},
  {title:'Tools + System',paths:['/focus','/intake','/gmail','/import','/connections','/notices','/system-overview','/settings']},
];
const byHref=new Map(navItems.map(item=>[item.href,item]));

export default function AllRoomsPage(){
  return <AppShell><div className="space-y-5">
    <header className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="glow-eyebrow text-[#C9727E]">Home + World</p><h1 className="glow-display mt-1 text-[42px] leading-[1.02] tracking-[-.025em] sm:text-[54px] lg:text-[60px]">All Rooms</h1><p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#8A8078]">Every part of your life, connected. This directory mirrors the uploaded Glow OS reference system so each destination has one clear home.</p></div><Link href="/world" className="inline-flex h-10 items-center justify-center rounded-full border border-[#EEE2DE] bg-white px-4 text-[11px] font-medium text-[#B85C70]">Enter Life World →</Link></header>
    <div className="flex flex-wrap gap-2"><span className="rounded-full bg-[#FDF3F2] px-3 py-2 text-[10.5px] text-[#C9727E]">All Rooms</span>{groups.map(group=><span key={group.title} className="rounded-full border border-[#F1E7E3] bg-white px-3 py-2 text-[10.5px] text-[#8A8078]">{group.title}</span>)}</div>
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{groups.map(group=><Card key={group.title} className="min-h-[250px]"><h2 className="glow-display text-[18px]">{group.title}</h2><div className="mt-4 space-y-1">{group.paths.map(path=>byHref.get(path)).filter(Boolean).map(item=>{const Icon=item!.icon;return <Link key={`${group.title}-${item!.href}`} href={item!.href} className="flex items-center gap-3 rounded-[10px] px-2 py-2.5 hover:bg-[#FDF8F6]"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDF3F2] text-[#C9727E]"><Icon size={13}/></span><div className="min-w-0 flex-1"><p className="text-[11.5px] font-medium text-[#3A332E]">{item!.label}</p><p className="truncate text-[9.5px] text-[#9A9088]">{item!.description}</p></div><span className="text-[#C9727E]">→</span></Link>})}</div></Card>)}</section>
    <section className="grid gap-4 lg:grid-cols-3">
      <Card><h2 className="glow-display text-[18px]">How Glow Fits Together</h2><p className="mt-4 text-[11px] leading-5 text-[#8A8078]">Enter information once in its source room. Glow can then surface the same object on Home, Briefings, Timeline, Graph, Goals or another relevant view instead of making duplicate copies.</p></Card>
      <Card><h2 className="glow-display text-[18px]">Fast Modes</h2><div className="mt-4 flex flex-wrap gap-2">{['/focus','/workout-studio','/interview-prep','/ambient','/intake'].map(path=>byHref.get(path)).filter(Boolean).map(item=><Link key={item!.href} href={item!.href} className="rounded-full border border-[#F1E7E3] px-3 py-2 text-[10px] text-[#6F655F]">{item!.label}</Link>)}</div><p className="mt-4 text-[10.5px] leading-5 text-[#9A9088]">Modes change how you work temporarily. They do not create separate copies of your data.</p></Card>
      <Card><h2 className="glow-display text-[18px]">System Bridges</h2><div className="mt-4 space-y-3">{['/gmail','/import','/connections','/notices','/system-overview'].map(path=>byHref.get(path)).filter(Boolean).map(item=><Link key={item!.href} href={item!.href} className="flex justify-between text-[11px]"><span>{item!.label}</span><span className="text-[#C9727E]">Open</span></Link>)}</div></Card>
    </section>
    <Card className="grid gap-4 bg-[linear-gradient(90deg,#FFF,#FFF7F5)] lg:grid-cols-[160px_1fr_auto] lg:items-center"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><span className="glow-display text-[18px]">Glow Insight</span></div><p className="glow-display text-[17px] italic text-[#4A4440]">Home summarizes. Rooms manage. Brain understands. World connects.</p><span className="glow-display text-[24px] text-[#C9727E]">{navItems.length}</span></Card>
  </div></AppShell>;
}
