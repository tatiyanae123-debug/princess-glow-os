import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { Palette, BellRing, Focus, SlidersHorizontal, ArrowUpRight } from 'lucide-react';

const settings=[
  {title:'Theme',value:'Editorial warm',Icon:Palette,note:'Change visual themes from the command rail or Customize control.'},
  {title:'Notifications',value:'Gentle',Icon:BellRing,note:'Keep signals useful and quiet rather than turning Glow into another noisy app.'},
  {title:'Focus mode',value:'Enabled',Icon:Focus,note:'Reduce visual competition when you are executing one important thing.'},
];

export default function SettingsPage(){
  return <AppShell><SectionPage eyebrow="Settings" title="A space that supports you" description="Fine-tune the environment so the system feels calm, quiet, and personal.">
    <div className="space-y-4">
      <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#eee9e5,#f7f1ec)] p-5"><SlidersHorizontal size={54} strokeWidth={.75} className="absolute right-5 top-3 text-[#7e756d]/15"/><p className="glow-eyebrow">Dressing room</p><p className="glow-display mt-2 text-[24px] text-[#4a413a]">Edit the world without disturbing what works.</p><p className="mt-2 max-w-2xl text-[9px] leading-4 text-[#7c7169]">Appearance, focus and notification preferences should change the experience while your data architecture stays stable underneath.</p></Card>
      <div className="grid gap-3 md:grid-cols-3">{settings.map(({title,value,Icon,note})=><Card key={title} className="p-5"><Icon size={18} className="text-[#8b746c]"/><p className="glow-display mt-4 text-[16px] text-[#4a413a]">{title}</p><p className="mt-1 text-[8px] uppercase tracking-[.12em] text-[#9b897f]">{value}</p><p className="mt-3 text-[8px] leading-4 text-[#7e726a]">{note}</p></Card>)}</div>
      <Card className="grid gap-3 sm:grid-cols-3"><Link href="/connections" className="rounded-[7px] border border-[#e5dbd4] bg-[#faf5f0] p-4"><p className="glow-display text-[14px] text-[#4b423b]">Connections</p><p className="mt-1 text-[8px] text-[#867970]">Control external services.</p><span className="mt-3 inline-flex items-center gap-1 text-[7px] text-[#77655d]">Open <ArrowUpRight size={8}/></span></Link><Link href="/import" className="rounded-[7px] border border-[#e5dbd4] bg-[#faf5f0] p-4"><p className="glow-display text-[14px] text-[#4b423b]">Import</p><p className="mt-1 text-[8px] text-[#867970]">Bring more information into Glow.</p><span className="mt-3 inline-flex items-center gap-1 text-[7px] text-[#77655d]">Open <ArrowUpRight size={8}/></span></Link><Link href="/dashboard" className="rounded-[7px] border border-[#e5dbd4] bg-[#f4e5e5] p-4"><p className="glow-display text-[14px] text-[#4b423b]">Command Center</p><p className="mt-1 text-[8px] text-[#867970]">Return to your editorial home.</p><span className="mt-3 inline-flex items-center gap-1 text-[7px] text-[#77655d]">Return <ArrowUpRight size={8}/></span></Link></Card>
    </div>
  </SectionPage></AppShell>;
}
