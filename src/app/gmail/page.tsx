import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { GmailMessageActions } from '@/components/gmail/gmail-message-actions';
import { getRecentInboxMessages } from '@/lib/google/gmail-client';
import { gmailActionInsight, safeGmailSummary } from '@/lib/gmail/intelligence';
import { CalendarDays, Mail, Pencil, Sparkles, Star, TriangleAlert } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function GmailPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const result=await getRecentInboxMessages(session.user.id);
  const rows=result.ok?result.messages.map(message=>({message,insight:gmailActionInsight(message)})):[];
  const important=rows.filter(row=>row.insight.priority!=='low').slice(0,5);
  const followUps=rows.filter(row=>row.insight.route==='tasks'||row.insight.priority==='high').slice(0,5);
  const calendar=rows.filter(row=>row.insight.route==='calendar').slice(0,4);
  const high=rows.filter(row=>row.insight.priority==='high').length;

  return <AppShell><SectionPage eyebrow="Gmail" title="Gmail" description="Stay on top of what matters and keep your inbox working for you.">
    {!result.ok?<Card><div className="flex items-center gap-2"><TriangleAlert size={15} className="text-[#C69A52]"/><h2 className="glow-display text-[18px]">Gmail needs attention</h2></div><p className="mt-2 text-[11.5px] text-[#8A8078]">Connection state: {result.reason.replaceAll('_',' ')}.</p><a href="/connections" className="mt-4 inline-flex rounded-full bg-[#2B2420] px-4 py-2.5 text-[11px] text-white">Open Connections</a></Card>:
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_.85fr_.72fr]">
        <Card className="xl:row-span-2"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Mail size={15} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Priority Inbox</h2></div><span className="text-[10px] text-[#C9727E]">{result.unreadCount} unread</span></div><div className="mt-3 divide-y divide-[#F1E7E3]">{rows.length?rows.slice(0,7).map(({message,insight})=><article key={message.id} className="py-3"><div className="flex items-start justify-between gap-2"><div className="min-w-0 flex-1"><p className="truncate text-[11.5px] font-medium">{message.subject}</p><p className="truncate text-[9.5px] text-[#9A9088]">{message.from}</p></div><span className={`rounded-full px-2 py-1 text-[8.5px] ${insight.priority==='high'?'bg-[#FBE4E8] text-[#B15A68]':'bg-[#F1E8D9] text-[#9A7A3D]'}`}>{insight.priority}</span></div><p className="mt-2 line-clamp-2 text-[10.5px] leading-4 text-[#7D746F]">{safeGmailSummary(message)}</p><GmailMessageActions messageId={message.id} threadId={message.threadId} subject={message.subject} from={message.from} snippet={message.snippet}/></article>):<p className="py-8 text-center text-[11px] text-[#9A9088]">No recent inbox messages returned.</p>}</div></Card>
        <Card><div className="flex items-center gap-2"><Star size={14} className="text-[#C69A52]"/><h2 className="glow-display text-[18px]">Important</h2></div><div className="mt-4 space-y-3">{important.length?important.map(({message,insight})=><div key={message.id} className="border-b border-[#F4ECE8] pb-3 last:border-0"><p className="line-clamp-1 text-[11px] font-medium">{message.subject}</p><p className="mt-1 line-clamp-2 text-[9.5px] text-[#9A9088]">{insight.rationale}</p></div>):<p className="text-[11px] text-[#9A9088]">Nothing flagged as important.</p>}</div></Card>
        <Card><div className="flex items-center gap-2"><Pencil size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Quick Compose</h2></div><p className="mt-3 text-[11px] leading-4 text-[#8A8078]">Open Gmail’s real compose window. Glow does not send messages automatically.</p><a href="https://mail.google.com/mail/?view=cm&fs=1" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-full bg-[#D86F83] px-4 py-2.5 text-[11px] text-white">New Message ↗</a></Card>
        <Card><div className="flex items-center gap-2"><CalendarDays size={14} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Upcoming Conversations</h2></div><div className="mt-4 space-y-3">{calendar.length?calendar.map(({message})=><div key={message.id}><p className="line-clamp-1 text-[11px] font-medium">{message.subject}</p><p className="text-[9.5px] text-[#9A9088]">Calendar-related message</p></div>):<p className="text-[11px] text-[#9A9088]">No calendar-related messages in the recent sample.</p>}</div></Card>
        <Card><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Follow-Up Reminders</h2></div><div className="mt-4 space-y-3">{followUps.length?followUps.map(({message,insight})=><div key={message.id} className="flex items-start gap-2"><span className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded-[4px] border border-[#D8CEC8]"/><div><p className="line-clamp-1 text-[11px] font-medium">{message.subject}</p><p className="line-clamp-2 text-[9.5px] text-[#9A9088]">{insight.rationale}</p></div></div>):<p className="text-[11px] text-[#9A9088]">No follow-ups detected.</p>}</div></Card>
      </section>
      <section className="grid gap-4 lg:grid-cols-2"><Card className="bg-[linear-gradient(145deg,#FFF,#FFF7F5)]"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Glow Email Insights</h2></div><p className="glow-display mt-4 text-[18px] italic leading-6 text-[#4A4440]">{high?`${high} recent message${high===1?'':'s'} deserve faster attention.`:'Your recent inbox looks relatively calm.'}</p><p className="mt-2 text-[10px] text-[#9A9088]">Read-only Gmail access remains unchanged.</p></Card><Card><h2 className="glow-display text-[18px]">This Week at a Glance</h2><div className="mt-4 grid grid-cols-3 gap-3 text-center">{[['Recent',rows.length],['Priority',high],['Calendar',calendar.length]].map(([label,value])=><div key={String(label)} className="rounded-[12px] bg-[#FDF8F6] p-3"><p className="glow-display text-[22px]">{value}</p><p className="text-[9px] uppercase tracking-[.1em] text-[#9A9088]">{label}</p></div>)}</div></Card></section>
    </div>}
  </SectionPage></AppShell>;
}
