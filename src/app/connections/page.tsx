import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { GoogleConnectionCard } from '@/components/connections/google-connection-card';
import { AppleRemindersCard } from '@/components/connections/apple-reminders-card';
import { getConnectionsOverview } from '@/lib/data/connections';
import { getAppleReminderConnection } from '@/lib/apple-reminders/service';
import { ArrowUpRight, Link2, LockKeyhole } from 'lucide-react';

const shortcuts=[
  {name:'Instagram',description:'Open Instagram for content planning and publishing.',href:'https://www.instagram.com/'},
  {name:'Peacock',description:'Open Peacock. Login credentials are never stored in Glow OS.',href:'https://www.peacocktv.com/'},
  {name:'Hulu',description:'Open Hulu. Login credentials are never stored in Glow OS.',href:'https://www.hulu.com/'},
  {name:'BILH MyChart',description:'Open the general BILH MyChart sign-in page. Visit-specific links are not stored.',href:'https://mychart.bilh.org/MyChart-BILH/'},
];
export const dynamic='force-dynamic';

export default async function ConnectionsPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [overview,appleConnection]=await Promise.all([getConnectionsOverview(session.user.id),getAppleReminderConnection(session.user.id)]);
  return <AppShell><SectionPage eyebrow="Connections" title="Your private digital world" description="Connect services securely through OAuth and private bridges while keeping passwords outside Glow OS.">
    <div className="space-y-4">
      <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#eeeae5,#f7f0eb)] p-5"><Link2 size={52} strokeWidth={.8} className="absolute right-5 top-3 text-[#7e756d]/15"/><p className="glow-eyebrow">Digital dock</p><p className="glow-display mt-2 text-[24px] text-[#4b413b]">Bring services in without giving away the keys.</p><div className="mt-3 flex items-center gap-2 text-[8px] text-[#7b7069]"><LockKeyhole size={11}/>OAuth and approved bridges only. Passwords stay outside Glow OS.</div></Card>
      <div className="grid gap-4 lg:grid-cols-2"><GoogleConnectionCard overview={overview}/><AppleRemindersCard connection={appleConnection}/><Card className="space-y-3 lg:col-span-2"><div><p className="glow-eyebrow">Private shortcuts</p><p className="mt-1 text-[8px] leading-4 text-[#87776f]">Plain links, not live integrations. Glow OS never signs in, reads, or stores anything from these sites.</p></div><div className="grid gap-3 md:grid-cols-2">{shortcuts.map((shortcut)=><a key={shortcut.name} href={shortcut.href} target="_blank" rel="noopener noreferrer" className="group block rounded-[8px] border border-[#e4d9d1] bg-[#faf4ef] p-4 transition hover:-translate-y-0.5 hover:bg-white/70"><div className="flex items-center justify-between"><p className="glow-display text-[14px] text-[#4b403a]">{shortcut.name}</p><ArrowUpRight size={11} className="text-[#98847a]"/></div><p className="mt-2 text-[8px] leading-4 text-[#87776f]">{shortcut.description}</p></a>)}</div></Card></div>
    </div>
  </SectionPage></AppShell>;
}
