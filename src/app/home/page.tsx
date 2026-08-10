import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getAppointmentsByUser } from '@/lib/data/appointments';
import { getImportantLinksByUser } from '@/lib/data/important-links';
import { Home as HomeIcon, CalendarDays, ExternalLink, Flower2 } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function HomePage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [appointments,links]=await Promise.all([getAppointmentsByUser(session.user.id),getImportantLinksByUser(session.user.id)]);
  return <AppShell><SectionPage eyebrow="Home" title="A place that supports your rhythm" description="Turn your home life into a calm, welcoming system that feels effortless to maintain.">
    <div className="space-y-4">
      <Card className="relative min-h-[190px] overflow-hidden bg-[linear-gradient(145deg,#ebeee4,#f6eee7)] p-5"><HomeIcon size={58} strokeWidth={.75} className="absolute right-5 top-3 text-[#74806b]/16"/><Flower2 size={80} strokeWidth={.65} className="absolute -bottom-4 left-3 text-[#8e9b81]/20"/><div className="relative ml-auto max-w-[72%]"><p className="glow-eyebrow">Living space</p><p className="glow-display mt-2 text-[25px] text-[#414b3d]">Your environment should make the next right thing easier.</p><p className="mt-2 text-[9px] leading-4 text-[#727d6e]">Appointments, important links and future home-maintenance systems live together instead of becoming scattered admin.</p></div></Card>
      <div className="grid gap-4 md:grid-cols-2"><Card className="p-0 overflow-hidden"><div className="flex items-center gap-2 border-b border-[#dfe4da] px-5 py-4"><CalendarDays size={13} className="text-[#74806b]"/><div><p className="glow-eyebrow">Coming home with you</p><h2 className="glow-display mt-1 text-[18px] text-[#414b3d]">Upcoming appointments</h2></div></div>{appointments.length===0?<p className="p-7 text-[9px] text-[#7d8778]">No appointments scheduled.</p>:<div className="divide-y divide-[#e6e9e2]">{appointments.slice(0,6).map((appt,index)=><div key={appt.id} className={`px-5 py-4 ${index===0?'bg-[#edf1e8]/60':''}`}><p className="glow-display text-[13px] text-[#465142]">{appt.title}</p><p className="mt-1 text-[7px] text-[#84907f]">{appt.startAt.toLocaleString('en',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}{appt.location?` · ${appt.location}`:''}</p></div>)}</div>}</Card><Card className="p-0 overflow-hidden"><div className="flex items-center gap-2 border-b border-[#e5ddd7] px-5 py-4"><ExternalLink size={13} className="text-[#7b7069]"/><div><p className="glow-eyebrow">Useful shelf</p><h2 className="glow-display mt-1 text-[18px] text-[#49413a]">Important links</h2></div></div>{links.length===0?<p className="p-7 text-[9px] text-[#857970]">No saved links yet.</p>:<div className="grid gap-2 p-4">{links.slice(0,8).map((link)=><a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-[7px] border border-[#e7ddd5] bg-[#faf5f0] px-3 py-3 text-[9px] font-medium text-[#705e56] hover:bg-white"><span>{link.title}</span><ExternalLink size={9}/></a>)}</div>}</Card></div>
    </div>
  </SectionPage></AppShell>;
}
