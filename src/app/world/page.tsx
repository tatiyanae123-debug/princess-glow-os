import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import type { LivingDashboardData } from '@/lib/dashboard/types';
import { ArrowUpRight, CircleDot, Flower2, Globe2, Sparkles } from 'lucide-react';

type Room = { title:string; href:string; description:string; wash:string; signal:(data:LivingDashboardData|null)=>string };

const rooms:Room[]=[
  {title:'Home',href:'/home',description:'Your environment, resets, appointments, and household systems.',wash:'#E4EBDD',signal:()=> 'Open your home systems'},
  {title:'Brain',href:'/brain',description:'Context, recommendations, connections, and reflection.',wash:'#E9E4F2',signal:(data)=>data?`${data.notesSummary.pinnedCount} pinned note${data.notesSummary.pinnedCount===1?'':'s'} in context`:'Open Glow Brain'},
  {title:'Fitness',href:'/fitness',description:'Workouts, energy, soreness, equipment, and recovery context.',wash:'#FBE4E8',signal:(data)=>data?.workoutOfTheDay.exercises.length?`${data.workoutOfTheDay.exercises.length} exercises in today’s workout`:'Plan your next movement'},
  {title:'Beauty',href:'/beauty',description:'Your routines, schedule, products, and beauty system.',wash:'#FBE4E8',signal:(data)=>data?.beautyToday.length?`${data.beautyToday.length} beauty item${data.beautyToday.length===1?'':'s'} for today`:'Open Beauty'},
  {title:'Beauty Lab',href:'/beauty/lab',description:'Product testing, reactions, ingredients, expiration, and repurchase decisions.',wash:'#FDF3F2',signal:()=> 'Open product intelligence'},
  {title:'Planning',href:'/planning',description:'Planning layers, reflection, priorities, and knowledge.',wash:'#F1E8D9',signal:(data)=>data?`${data.todayOverview.activeGoals} active goal${data.todayOverview.activeGoals===1?'':'s'} shaping the plan`:'Open your planning layers'},
  {title:'Financial Brain',href:'/finance/brain',description:'Spending context, goals, savings direction, and financial planning.',wash:'#F1E8D9',signal:(data)=>data?`${data.projectStatus.averageGoalProgress}% average goal progress`:'Open Financial Brain'},
  {title:'Timeline',href:'/timeline',description:'Memories, milestones, plans, and meaningful experiences over time.',wash:'#FDF8F6',signal:(data)=>data?`${data.todayOverview.eventsToday} event${data.todayOverview.eventsToday===1?'':'s'} today`:'Explore your timeline'},
  {title:'Tasks',href:'/tasks',description:'Your actionable work, care tasks, follow-ups, and priorities.',wash:'#FBE4E8',signal:(data)=>data?`${data.projectStatus.activeTaskCount} active task${data.projectStatus.activeTaskCount===1?'':'s'} across Glow OS`:'Review tasks'},
  {title:'Projects',href:'/projects',description:'Career moves, creative work, deadlines, and project desks.',wash:'#F1E8D9',signal:(data)=>data?`${data.projectStatus.goalsInProgress} goal${data.projectStatus.goalsInProgress===1?'':'s'} in progress`:'Open projects'},
  {title:'Memory',href:'/memory',description:'Facts, milestones, preferences, decisions, and private context.',wash:'#F1E8D9',signal:(data)=>data?`${data.notesSummary.recentNotes.length} recent note${data.notesSummary.recentNotes.length===1?'':'s'} nearby`:'Open your life archive'},
  {title:'Connections',href:'/connections',description:'Google, Apple Reminders, and your private digital bridges.',wash:'#FDF8F6',signal:(data)=>{if(!data)return'Review connection health';const connected=[data.googleCalendar.status==='connected',data.gmailInbox.status==='connected'].filter(Boolean).length;return`${connected}/2 Google bridges connected`; }},
];

export const dynamic='force-dynamic';

async function getWorldData(userId:string):Promise<LivingDashboardData|null>{if(!process.env.DATABASE_URL)return null;try{const{getLivingDashboardData}=await import('@/lib/dashboard/living-dashboard');return await getLivingDashboardData(userId)}catch{return null}}

export default async function WorldPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const data=await getWorldData(session.user.id);
  const liveSignals=data?[`${data.todayOverview.tasksDueToday} due today`,`${data.todayOverview.eventsToday} calendar event${data.todayOverview.eventsToday===1?'':'s'}`,`${data.habitSummary.completedToday}/${data.habitSummary.totalHabits} habits complete`,`${data.projectStatus.goalsInProgress} goals moving`]:['Live room data will appear when your connected data is available'];
  return <AppShell><SectionPage eyebrow="Life World" title="Walk through the systems of your life" description="Every room below opens the real Glow OS system named on the card. No conceptual room silently redirects to a different product area."><div className="space-y-4">
    <section className="relative min-h-[240px] overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-[linear-gradient(130deg,#E4EBDD,#FDF6F1)] p-6"><Flower2 size={110} strokeWidth={0.65} className="absolute -bottom-4 left-5 text-[#5A6E52]/22"/><Globe2 size={90} strokeWidth={0.65} className="absolute right-8 top-5 text-[#5A6E52]/16"/><div className="relative ml-auto max-w-[72%] text-right"><p className="glow-eyebrow">My Universe</p><h2 className="glow-display mt-2 text-[31px] leading-9 text-[#2B2420]">Your life is not a menu. It is a place.</h2><p className="mt-3 text-[12px] leading-5 text-[#8A8078]">Move through the systems Glow OS actually has today. Each destination keeps the same signed-in V3 shell and opens the matching functional room.</p><span className="glow-hand mt-4 inline-block text-[27px] text-[#5A6E52]">welcome home</span></div></section>
    <section className="rounded-[16px] border border-[#F1E7E3] bg-white p-4"><div className="flex flex-wrap items-center gap-2 text-[11px] text-[#4A4440]"><span className="inline-flex items-center gap-1 font-semibold uppercase tracking-[.1em] text-[#5A6E52]"><CircleDot size={11}/> Live world status</span>{liveSignals.map(signal=><span key={signal} className="rounded-full border border-[#F1E7E3] bg-[#FDF8F6] px-2.5 py-1">{signal}</span>)}</div></section>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{rooms.map((room,index)=><Link key={room.title} href={room.href} className="group relative min-h-[190px] overflow-hidden rounded-[18px] border border-[#F1E7E3] p-5 transition hover:-translate-y-1" style={{background:`linear-gradient(145deg,#fff,${room.wash})`}}><div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/60"><Sparkles size={13} className="text-[#C9727E]"/></div><p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Room {String(index+1).padStart(2,'0')}</p><h2 className="glow-display mt-4 text-[21px] text-[#2B2420]">{room.title}</h2><p className="mt-2 max-w-[85%] text-[11px] leading-4 text-[#8A8078]">{room.description}</p><div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/70 px-2.5 py-1 text-[10px] font-medium text-[#4A4440]"><span className="h-1.5 w-1.5 rounded-full bg-[#5A6E52]"/>{room.signal(data)}</div><p className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">Enter room <ArrowUpRight size={11}/></p></Link>)}</div>
  </div></SectionPage></AppShell>;
}
