import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, asc, eq, gte } from 'drizzle-orm';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { UtilityFrame, styles as shell } from '@/components/system-reference/utility-frame';
import { db } from '@/db';
import { calendarEvents } from '@/db/schema/calendar-events';
import { tasks } from '@/db/schema/tasks';
import { appleReminders } from '@/db/schema/intelligence-expansion';
import { aiProposals } from '@/db/schema/completion-v1';
import { Bell, CalendarDays, CheckCircle2, FileText, Luggage, MapPin, Plane, Settings, Sparkles, Ticket, UsersRound } from 'lucide-react';
import styles from './concierge-journey.module.css';

export const dynamic='force-dynamic';
const TRAVEL=/\b(travel|trip|journey|flight|airport|hotel|airbnb|train|depart|arrival|vacation|packing|luggage|boarding|reservation|itinerary|tour|museum|day trip)\b/i;
const PACK=/\b(pack|packing|luggage|suitcase|toiletr|carry.?on)\b/i;
const BOOK=/\b(book|booking|confirm|flight|hotel|airbnb|train|reservation|ticket)\b/i;
const EXPERIENCE=/\b(tour|museum|dinner|restaurant|experience|day trip|wellness|shopping|culture|explore)\b/i;
function eventText(item:{title:string;description:string|null;location:string|null}){return `${item.title} ${item.description??''} ${item.location??''}`}
function taskText(item:{title:string;description:string|null}){return `${item.title} ${item.description??''}`}
function dateShort(date:Date){return date.toLocaleDateString('en-US',{month:'short',day:'numeric'})}
function dateRange(items:{startAt:Date}[]){if(!items.length)return'No dates linked';const first=items[0].startAt;const last=items.at(-1)?.startAt??first;return first.toDateString()===last.toDateString()?dateShort(first):`${dateShort(first)} – ${dateShort(last)}`}

export default async function ConciergePage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');const userId=session.user.id;const now=new Date();
  const [eventRows,taskRows,reminderRows,proposalRows]=await Promise.all([
    db.select().from(calendarEvents).where(and(eq(calendarEvents.userId,userId),eq(calendarEvents.archived,false),gte(calendarEvents.startAt,now))).orderBy(asc(calendarEvents.startAt)).limit(80),
    db.select().from(tasks).where(eq(tasks.userId,userId)).limit(100),
    db.select().from(appleReminders).where(eq(appleReminders.userId,userId)).orderBy(asc(appleReminders.dueAt)).limit(80),
    db.select().from(aiProposals).where(eq(aiProposals.userId,userId)).limit(40),
  ]);
  const travelEvents=eventRows.filter(item=>TRAVEL.test(eventText(item))).slice(0,18);
  const activeTasks=taskRows.filter(item=>!item.archived&&item.status!=='done'&&item.status!=='cancelled');
  const travelTasks=activeTasks.filter(item=>TRAVEL.test(taskText(item)));
  const travelReminders=reminderRows.filter(item=>!item.completed&&TRAVEL.test(`${item.title} ${item.notes??''}`));
  const first=travelEvents[0];
  const cluster=first?travelEvents.filter(item=>Math.abs(item.startAt.getTime()-first.startAt.getTime())<=21*86400000):[];
  const journeyTitle=first?.title??'No journey in view';
  const prepare=travelTasks.filter(item=>!PACK.test(taskText(item))&&!BOOK.test(taskText(item)));
  const pack=travelTasks.filter(item=>PACK.test(taskText(item)));
  const booking=[...travelTasks.filter(item=>BOOK.test(taskText(item))),...travelEvents.filter(item=>BOOK.test(eventText(item)))];
  const experiences=travelEvents.filter(item=>EXPERIENCE.test(eventText(item)));
  const pendingProposals=proposalRows.filter(item=>item.status==='pending').length;
  const modules=[
    {title:'Prepare',note:'Documents, details, and travel tasks',status:`${prepare.length} linked`,href:'/tasks',icon:<FileText size={18}/>},
    {title:'Pack',note:'Packing and luggage actions',status:`${pack.length} linked`,href:'/tasks',icon:<Luggage size={18}/>},
    {title:'Book & Confirm',note:'Flights, stays, trains, and confirmations',status:`${booking.length} linked`,href:'/calendar',icon:<Ticket size={18}/>},
    {title:'Schedule',note:'Upcoming travel-linked calendar moments',status:`${travelEvents.length} linked`,href:'/calendar',icon:<CalendarDays size={18}/>},
    {title:'Experiences',note:'Culture, dining, wellness, and exploration',status:`${experiences.length} linked`,href:'/calendar',icon:<MapPin size={18}/>},
    {title:'Reminders',note:'Travel reminders imported into Glow',status:`${travelReminders.length} linked`,href:'/reminders',icon:<Bell size={18}/>},
  ];
  const rail=[
    {label:'Journey',href:'/concierge',active:true,icon:<span className={shell.railDot}><Plane size={15}/></span>},
    {label:'Approvals',href:'/concierge/approvals',icon:<span className={shell.railDot}><CheckCircle2 size={15}/></span>},
    {label:'Calendar',href:'/calendar',icon:<span className={shell.railDot}><CalendarDays size={15}/></span>},
    {label:'People',href:'/today?room=people',icon:<span className={shell.railDot}><UsersRound size={15}/></span>},
    {label:'Settings',href:'/settings',icon:<span className={shell.railDot}><Settings size={15}/></span>},
  ];
  return <AppShell><UtilityFrame title="Concierge · Journey" rail={rail}>
    <header className={styles.header}><div><span className={styles.kicker}>Concierge</span><h1>{journeyTitle}</h1><p>{first?'A living journey assembled from your real calendar, tasks, and reminders.':'When travel appears in your connected life, Glow will gather it here without inventing a trip.'}</p><div className={styles.chips}><span className={shell.capsule}><CalendarDays size={12}/>{dateRange(cluster)}</span><span className={shell.capsule}><UsersRound size={12}/>Travelers not modeled</span><span className={shell.capsule}><MapPin size={12}/>{first?.location??'Route not linked'}</span></div></div><div className={styles.headerActions}><Link href="/concierge/approvals" className={shell.btn}>Approvals {pendingProposals?`· ${pendingProposals}`:''}</Link><Link href="/ask-glow" className={`${shell.btn} ${shell.btnPrimary}`}><Sparkles size={13}/>Ask Glow</Link></div></header>
    <section className={styles.scene}><div className={styles.orbit}/><div className={styles.orbit2}/><div className={styles.orbit3}/>{modules.map(module=><Link key={module.title} href={module.href} className={`${shell.well} ${styles.module}`}><span className={styles.moduleIcon}>{module.icon}</span><div><strong>{module.title}</strong><p>{module.note}</p></div><span className={styles.moduleStatus}>{module.status} ›</span></Link>)}<div className={styles.center}><div className={styles.centerCopy}><span className={shell.pearlSm} style={{margin:'0 auto 12px'}}/><h2>{journeyTitle}</h2><p>{dateRange(cluster)}</p><p>{first?.location?'Place context is linked from Calendar.':'No trip image, route, or destination is being fabricated.'}</p></div></div><aside className={`${shell.well} ${styles.glowNote}`}><span className={shell.pearl}/><div><strong>Glow</strong><p className={shell.sectionNote}>I can help coordinate what is already connected. Price or availability monitoring runs only when you explicitly schedule it.</p></div></aside></section>
    <section className={`${shell.glass} ${styles.timeline}`}><div className={styles.timelineHead}><div><span className={styles.kicker}>Journey timeline</span><p className={shell.sectionNote}>Real upcoming travel signals, ordered in time.</p></div><Link href="/calendar" className={shell.btn}>View full calendar →</Link></div>{travelEvents.length?<div className={styles.timelineFlow}>{travelEvents.slice(0,6).map((item,index)=><article key={item.id} className={styles.stop} style={{'--stop':['#8ab9ea','#e9bd73','#ad86e6','#82c9a3','#ecab78','#77aee0'][index%6]} as React.CSSProperties}><strong>{dateShort(item.startAt)} · {item.title}</strong><p>{item.location??item.description??'Calendar travel signal'}</p></article>)}</div>:<div className={styles.emptyTimeline}>No upcoming calendar events currently provide enough evidence to form a journey timeline.</div>}</section>
  </UtilityFrame></AppShell>;
}
