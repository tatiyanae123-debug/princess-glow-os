import type { CSSProperties } from 'react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { getConnectionsOverview } from '@/lib/data/connections';
import { getAppleReminderConnection } from '@/lib/apple-reminders/service';
import { getTasksByUser } from '@/lib/data/tasks';
import { getFitnessSessions } from '@/lib/data/completion-v1';
import { getHabitsByUser, getHabitLogsForUser } from '@/lib/data/habits';
import { Check, CloudCog, Database, Dumbbell, ListChecks, RefreshCw, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';

export const dynamic='force-dynamic';
function dayKey(date:Date){return date.toISOString().slice(0,10)}
function clampBar(value:number){return Math.max(8,Math.min(100,value))}

export default async function SystemOverviewPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const userId=session.user.id;const end=new Date();const start=new Date();start.setDate(end.getDate()-6);
  const [overview,apple,tasks,sessions,habits,habitLogs]=await Promise.all([getConnectionsOverview(userId),getAppleReminderConnection(userId),getTasksByUser(userId),getFitnessSessions(userId),getHabitsByUser(userId),getHabitLogsForUser(userId,dayKey(start),dayKey(end))]);
  const completedTasks=tasks.filter(t=>t.status==='done');const recentSessions=sessions.filter(s=>s.occurredAt>=start);const activeHabits=habits.length;const habitPossible=Math.max(1,activeHabits*7);const habitRate=activeHabits?Math.min(100,Math.round((habitLogs.length/habitPossible)*100)):0;
  const googleHealthy=overview.connected&&overview.calendarState==='connected'&&overview.hasCalendarScope&&overview.hasGmailScope;const appleHealthy=apple?.status==='connected';const readyConnections=[googleHealthy,appleHealthy].filter(Boolean).length;const lastSync=overview.lastSync?.startedAt?new Date(overview.lastSync.startedAt):null;const syncReady=Boolean(lastSync);
  const activity=[['Tasks completed',completedTasks.length,clampBar(completedTasks.length*7)],['Workouts logged',recentSessions.length,clampBar(recentSessions.length*18)],['Habit completion',activeHabits?`${habitRate}%`:'—',activeHabits?clampBar(habitRate):8]] as const;
  const footprint=[tasks.length,sessions.length,habits.length,habitLogs.length];const footprintTotal=footprint.reduce((a,b)=>a+b,0);const footprintPct=footprintTotal?Math.min(100,Math.round((footprintTotal/Math.max(1,footprintTotal+20))*100)):0;
  const signalValues=[completedTasks.length*12,recentSessions.length*22,habitRate,readyConnections*40,tasks.length*3,sessions.length*4,habitLogs.length*2,(googleHealthy?55:15)+(appleHealthy?35:0)].map(clampBar);
  const systemCopy=readyConnections===2?'Core Glow data and both configured connection groups responded.':`Core Glow data responded. ${2-readyConnections} configured connection group${2-readyConnections===1?' needs':'s need'} attention.`;
  return <AppShell><div className="b9-system">
    <header className="b9-system-head"><div><p className="b9-system-kicker">8. SYSTEM HEALTH</p><h1>System Overview</h1><p className="b9-system-sub">Status from real Glow data and configured connections.</p></div><Link href="/settings" className="b8-soft-btn"><RefreshCw size={10}/>Settings</Link></header>
    <section className="b9-status-row">
      <article className="b9-status-card"><div><small>Data Sync</small><strong>{lastSync?`Recorded ${lastSync.toLocaleDateString('en-US',{month:'short',day:'numeric'})}`:'No sync recorded yet'}</strong></div><span className={syncReady?'b9-ok':'b9-warn'}>{syncReady?<Check size={11}/>:<TriangleAlert size={11}/>}</span></article>
      <article className="b9-status-card"><div><small>Connections</small><strong>{readyConnections}/2 ready</strong></div><span className={readyConnections===2?'b9-ok':'b9-warn'}>{readyConnections===2?<CloudCog size={11}/>:<TriangleAlert size={11}/>}</span></article>
      <article className="b9-status-card"><div><small>Data Layer</small><strong>Authenticated records available</strong></div><span className="b9-ok"><ShieldCheck size={11}/></span></article>
    </section>
    <section className="b9-system-grid">
      <article className="b9-panel"><div className="flex items-center justify-between"><h2>Activity Overview</h2><span className="text-[8px] text-[#8e847d]">Last 7 days where available</span></div><div className="b9-activity">{activity.map(([label,value,pct])=><div className="b9-activity-row" key={label}><span>{label}</span><div className="b9-track"><i style={{width:`${pct}%`}}/></div><strong>{value}</strong></div>)}</div><p className="b9-note mt-4">Glow does not invent device usage, backup status, cloud-storage percentages, or uptime metrics that the app cannot actually observe.</p></article>
      <article className="b9-panel"><div className="flex items-center gap-2"><Database size={12} className="text-[#7b3850]"/><h2>Data Footprint</h2></div><div className="b9-donut" style={{'--b9-pct':`${footprintPct}%`} as CSSProperties}><strong>{footprintTotal}</strong></div><p className="text-center text-[8px] text-[#8e847d]">records represented in this overview</p><div className="mt-3 grid gap-1 text-[8px]"><p className="flex justify-between"><span>Tasks</span><strong>{tasks.length}</strong></p><p className="flex justify-between"><span>Fitness sessions</span><strong>{sessions.length}</strong></p><p className="flex justify-between"><span>Habits</span><strong>{habits.length}</strong></p><p className="flex justify-between"><span>Habit logs</span><strong>{habitLogs.length}</strong></p></div></article>
    </section>
    <section className="b9-system-foot">
      <article className="b9-panel"><div className="b9-inline-status"><span className={readyConnections===2?'b9-ok':'b9-warn'}>{readyConnections===2?<Check size={11}/>:<TriangleAlert size={11}/>}</span><div><h2>System Status</h2><p className="b9-note">{systemCopy}</p></div></div><div className="mt-3 flex flex-wrap gap-2"><Link href="/connections" className="b8-soft-btn">Review connections</Link><Link href="/notices" className="b8-soft-btn">Open notices</Link><Link href="/settings/intelligence" className="b8-soft-btn">Intelligence controls</Link></div></article>
      <article className="b9-panel"><div className="flex items-center gap-2"><Sparkles size={12} className="text-[#7b3850]"/><h2>Live Signals</h2></div><div className="b9-spark">{signalValues.map((height,i)=><i key={i} style={{height:`${height}%`}}/>)}</div><div className="mt-2 grid gap-1 text-[8px]"><p className="flex items-center gap-1"><ListChecks size={10}/> {completedTasks.length} completed tasks</p><p className="flex items-center gap-1"><Dumbbell size={10}/> {recentSessions.length} recent workouts</p></div></article>
    </section>
  </div></AppShell>;
}
