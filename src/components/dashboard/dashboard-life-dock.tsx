import Link from 'next/link';
import { BellRing, CalendarDays, FileUp, Inbox, Mail, Sparkles } from 'lucide-react';
import { LiveWeatherCard } from '@/components/dashboard/live-weather-card';
import type { LivingDashboardData } from '@/lib/dashboard/types';

export type DashboardReminder={id:string;title:string;rawText:string;href?:string;source?:string};

function statusLabel(status:LivingDashboardData['googleCalendar']['status']){
  if(status==='connected') return 'Connected';
  if(status==='not_connected') return 'Not connected';
  if(status==='insufficient_scope') return 'Needs permission';
  if(status==='revoked') return 'Reconnect';
  return 'Needs attention';
}

export function DashboardLifeDock({data,reminders=[]}:{data:LivingDashboardData;reminders?:DashboardReminder[]}){
  const taskFallback=data.topPriorityTasks.slice(0,3).map(item=>({id:item.id,title:item.title,rawText:item.dueDate?`Due ${new Date(item.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}`:'Keep visible today',href:'/tasks',source:'Tasks'}));
  const visible=reminders.length?reminders:taskFallback;
  return <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr_.8fr]">
    <div className="overflow-hidden rounded-[14px] border border-[#eaded6] bg-[#fffaf6]/78 shadow-[0_12px_36px_rgba(91,62,53,.045)]">
      <div className="flex items-center justify-between border-b border-[#eee3dc] px-4 py-3"><div className="flex items-center gap-2"><BellRing size={14} className="text-[#b97882]"/><h2 className="text-[8px] font-bold uppercase tracking-[.15em] text-[#6d5952]">Reminders + Tasks</h2></div><Link href="/reminders" className="text-[8px] text-[#9b6b71]">Open Reminders</Link></div>
      <div className="divide-y divide-[#f0e6e0] px-4">
        {visible.length?visible.map((item,index)=><Link href={item.href??'/tasks'} key={`${item.source??'item'}-${item.id}`} className="flex items-start gap-3 py-3"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${index===0?'bg-[#cf7e88]':'bg-[#d6b9ad]'}`}/><div className="min-w-0"><div className="flex items-center gap-1.5"><p className="truncate text-[9px] font-medium text-[#4a3b35]">{item.title}</p>{item.source?<span className="rounded-full bg-[#f3e8e7] px-1.5 py-0.5 text-[6px] text-[#9b6b71]">{item.source}</span>:null}</div><p className="mt-1 line-clamp-1 text-[7px] text-[#927d75]">{item.rawText}</p></div></Link>):<div className="py-6 text-center"><p className="text-[9px] text-[#806d65]">No reminders need attention.</p><div className="mt-2 flex justify-center gap-3"><Link href="/reminders" className="text-[8px] text-[#a06b72]">Apple Reminders</Link><Link href="/intake" className="text-[8px] text-[#a06b72]">Add reminder →</Link></div></div>}
      </div>
    </div>

    <LiveWeatherCard />

    <div className="rounded-[14px] border border-[#ead8d5] bg-[linear-gradient(145deg,#faeceb,#fff8f4)] p-4 shadow-[0_12px_36px_rgba(91,62,53,.04)]">
      <div className="flex items-center gap-2 text-[#b7747e]"><Sparkles size={15}/><p className="text-[8px] font-bold uppercase tracking-[.15em]">Glow Intake</p></div>
      <p className="glow-display mt-4 text-[19px] text-[#493734]">Put anything into Glow.</p>
      <p className="mt-2 text-[8px] leading-4 text-[#826c65]">Paste text, add a photo, upload a screenshot, PDF, receipt, recipe, outfit, reminder, schedule or file. Glow stores it once and proposes the rooms that should use it.</p>
      <div className="mt-4 grid grid-cols-2 gap-2"><Link href="/intake" className="flex items-center justify-center gap-1 rounded-[9px] bg-[#d18a95] px-3 py-2.5 text-[8px] font-medium text-white"><FileUp size={11}/>Add Anything</Link><Link href="/inbox" className="flex items-center justify-center gap-1 rounded-[9px] border border-[#e4cfcd] bg-white/65 px-3 py-2.5 text-[8px] text-[#745b56]"><Inbox size={11}/>Glow Inbox</Link></div>
    </div>

    <div className="xl:col-span-3 grid gap-2 sm:grid-cols-3">
      <Link href="/calendar" className="flex items-center gap-3 rounded-[12px] border border-[#eadfd8] bg-white/55 px-4 py-3"><CalendarDays size={14} className="text-[#a87872]"/><div><p className="text-[8px] font-medium text-[#594741]">Calendar</p><p className="text-[7px] text-[#948078]">{statusLabel(data.googleCalendar.status)} · {data.todaySchedule.events.length} local events today</p></div></Link>
      <Link href="/gmail" className="flex items-center gap-3 rounded-[12px] border border-[#eadfd8] bg-white/55 px-4 py-3"><Mail size={14} className="text-[#a87872]"/><div><p className="text-[8px] font-medium text-[#594741]">Gmail</p><p className="text-[7px] text-[#948078]">{statusLabel(data.gmailInbox.status)} · {data.gmailInbox.unreadCount} unread</p></div></Link>
      <Link href="/reminders" className="flex items-center gap-3 rounded-[12px] border border-[#eadfd8] bg-white/55 px-4 py-3"><BellRing size={14} className="text-[#a87872]"/><div><p className="text-[8px] font-medium text-[#594741]">Apple Reminders</p><p className="text-[7px] text-[#948078]">Imported safely · understood across Glow rooms</p></div></Link>
    </div>
  </section>;
}
