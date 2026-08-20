import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch10RemindersView } from '@/components/batch10/special-features-reference';
import { getAppleReminderConnection, getAppleRemindersByUser } from '@/lib/apple-reminders/service';
import { understandAppleReminder } from '@/lib/apple-reminders/intelligence';
import { BellRing, CalendarDays, CircleAlert, ListTodo, Sparkles } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function RemindersPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const userId=session.user.id;
  const [rows,connection]=await Promise.all([getAppleRemindersByUser(userId),getAppleReminderConnection(userId)]);
  const reminders=rows.map(row=>{
    const intelligence=understandAppleReminder({title:row.title,notes:row.notes,dueAt:row.dueAt,completed:row.completed});
    return {id:row.id,title:row.title,notes:row.notes,listName:row.listName,dueAt:row.dueAt?.toISOString()??null,completed:row.completed,lastSyncedAt:row.lastSyncedAt.toISOString(),...intelligence};
  });
  const now=new Date();const start=new Date(now);start.setHours(0,0,0,0);const end=new Date(now);end.setHours(23,59,59,999);const week=new Date(end);week.setDate(week.getDate()+7);
  const open=rows.filter(x=>!x.completed);const overdue=open.filter(x=>x.dueAt&&x.dueAt<start);const today=open.filter(x=>x.dueAt&&x.dueAt>=start&&x.dueAt<=end);const upcoming=open.filter(x=>x.dueAt&&x.dueAt>end&&x.dueAt<=week);const noDate=open.filter(x=>!x.dueAt);
  const listCounts=Array.from(open.reduce((m,x)=>m.set(x.listName,(m.get(x.listName)||0)+1),new Map<string,number>()).entries()).sort((a,b)=>b[1]-a[1]).slice(0,5);
  return <AppShell><div className="mx-auto max-w-[1180px] space-y-4 pb-24">
    <section className="rounded-[26px] border border-[#eadfdb] bg-[linear-gradient(135deg,#fff9f8,#f6ece9)] p-5 sm:p-7"><div className="flex items-start gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white shadow-sm"><BellRing size={19} className="text-[#b85d70]"/></span><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#b85d70]">Apple Reminders × Glow Intelligence</p><h1 className="mt-1 font-serif text-[34px] sm:text-[44px]">Reminder Command Center</h1><p className="mt-2 max-w-3xl text-[11px] leading-5 text-[#776d68]">Apple Reminders stays your fast capture app. Glow turns those reminders into context for Today, Morning Brief, planning, Attention Center, Glow Modes, Brain recommendations, and Concierge.</p></div></div></section>

    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Metric label="Overdue" value={overdue.length} icon={<CircleAlert size={14}/>}/><Metric label="Due Today" value={today.length} icon={<BellRing size={14}/>}/><Metric label="Next 7 Days" value={upcoming.length} icon={<CalendarDays size={14}/>}/><Metric label="No Date" value={noDate.length} icon={<ListTodo size={14}/>}/></section>

    <section className="grid gap-3 lg:grid-cols-[1.15fr_.85fr]"><div className="rounded-[20px] border border-[#eee5e1] bg-white p-4"><div className="flex items-center gap-2"><Sparkles size={15} className="text-[#b85d70]"/><h2 className="font-serif text-[20px]">How Glow uses reminders</h2></div><div className="mt-3 grid gap-2 sm:grid-cols-2 text-[10px] leading-5 text-[#746963]"><p className="rounded-xl bg-[#fcf8f6] p-3"><b>Today:</b> urgent and due-today reminders can surface beside tasks and events.</p><p className="rounded-xl bg-[#fcf8f6] p-3"><b>Glow Modes:</b> Low and Cancel Everything protect essential reminders while hiding low-value noise.</p><p className="rounded-xl bg-[#fcf8f6] p-3"><b>Brain + Attention:</b> reminder overload becomes a signal instead of another invisible list.</p><p className="rounded-xl bg-[#fcf8f6] p-3"><b>Planning:</b> dated reminders help Glow see workload before suggesting more work.</p></div><div className="mt-4 flex flex-wrap gap-2"><Link href="/today" className="rounded-full bg-[#c86679] px-4 py-2 text-[10px] text-white">Open Today</Link><Link href="/planning" className="rounded-full border border-[#eadfdb] px-4 py-2 text-[10px]">Plan around reminders</Link><Link href="/concierge" className="rounded-full border border-[#eadfdb] px-4 py-2 text-[10px]">Ask Glow</Link></div></div>
      <div className="rounded-[20px] border border-[#eee5e1] bg-white p-4"><h2 className="font-serif text-[20px]">Your reminder lists</h2><div className="mt-3 space-y-2">{listCounts.length?listCounts.map(([name,count])=><div key={name} className="flex items-center justify-between rounded-xl bg-[#faf6f4] px-3 py-2 text-[10px]"><span>{name}</span><b>{count}</b></div>):<p className="text-[10px] text-[#8a817b]">No open reminders have synced yet.</p>}</div><Link href="/connections#apple-reminders" className="mt-4 inline-flex text-[10px] text-[#874555]">{connection?.status==='connected'?'Review sync settings':'Set up Apple Reminders sync'} →</Link></div></section>

    <Batch10RemindersView reminders={reminders}/>
    <div className="flex flex-col gap-2 rounded-[12px] border border-[#ebe4df] bg-white px-4 py-3 text-[9px] leading-5 text-[#8a817b] sm:flex-row sm:items-center sm:justify-between"><span><b>Best setup:</b> capture quickly in Apple Reminders; let Glow read, rank, connect and surface them. Apple remains the source of truth for editing/completing until a safe two-way Apple bridge is available.</span><Link href="/connections#apple-reminders" className="shrink-0 text-[#874555]">Sync settings →</Link></div>
  </div></AppShell>;
}
function Metric({label,value,icon}:{label:string;value:number;icon:React.ReactNode}){return <div className="rounded-[18px] border border-[#eee5e1] bg-white p-4"><div className="flex items-center gap-2 text-[#b85d70]">{icon}<span className="text-[9px] uppercase tracking-[.12em] text-[#958881]">{label}</span></div><strong className="mt-2 block font-serif text-[28px] font-normal">{value}</strong></div>}
