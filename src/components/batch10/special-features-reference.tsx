'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  AlertCircle, ChevronRight, Circle, FileText, Filter, Mail, Plus, Search, Sparkles, UploadCloud,
} from 'lucide-react';
import { EditableRoomImage } from '@/components/media/editable-room-image';

const photo=(id:string)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=88`;
const ROOM_PHOTOS=[
 ['Planning Room','/planning','photo-1497366754035-f200968a6e72','Plan your life','Life'],
 ['Calendar Room','/calendar','photo-1494438639946-1ebd1d20bf85','Time is your tool','Life'],
 ['Routines Room','/routines','photo-1600607687939-ce8a6c25118c','Daily rhythms','Life'],
 ['Habit Room','/habits','photo-1497250681960-ef046c08a56e','Build consistency','Wellness'],
 ['Fitness Studio','/fitness','photo-1534438327276-14e5300c3a48','Move your body','Wellness'],
 ['Wellness Garden','/wellness','photo-1441974231531-c6227db76b6e','Nourish your mind','Wellness'],
 ['Food Kitchen','/food','photo-1498837167922-ddd27525d352','Fuel your body','Wellness'],
 ['Beauty Atelier','/beauty','photo-1522335789203-aabd1fc54bc9','Enhance your glow','Wellness'],
 ['Hair Salon','/hair','photo-1522337660859-02fbefca4702','Care for your hair','Wellness'],
 ['Closet Wardrobe','/closet','photo-1551488831-00ddcb6c6bd3','Dress with intention','Home'],
 ['Finance Vault','/finance','photo-1486406146926-c627a92ad1ab','Build wealth','Money'],
 ['Goals Destination','/goals','photo-1500530855697-b586d89ba3ee','Build your future','Life'],
 ['Brain Center','/brain','photo-1446776811953-b23d57bd21aa','Your second brain','Mind'],
 ['Memory Archive','/memory','photo-1494438639946-1ebd1d20bf85','All that matters','Mind'],
 ['Timeline','/timeline','photo-1500534623283-312aade485b7','Your life story','Mind'],
 ['Projects','/projects','photo-1497215728101-856f4ea42174','Build what matters','Work'],
 ['Creative Studio','/creative-studio','photo-1494438639946-1ebd1d20bf85','Make and create','Create'],
] as const;

type Reminder={id:string;title:string;notes:string|null;listName:string;dueAt:string|null;completed:boolean;domain:string;urgency:string};
type GmailRow={id:string;threadId?:string;from:string;subject:string;snippet?:string;date?:string|null;priority?:string};
type ImportRow={id?:string|null;category?:string|null;summary?:string|null;status?:string|null;createdAt?:Date|string|null};
type HomeTask={id:string;title:string;dueDate?:Date|null};
type HomeEvent={id:string;title:string;startAt:Date};
type HomeMetrics={openTasks:number;upcomingEvents:number;focusMinutesToday:number;workouts7d:number};

function Head({index,title,sub,action}:{index:string;title:string;sub:string;action?:React.ReactNode}){
 return <header className="b10-head"><div><p className="b10-eyebrow">{index}</p><h1>{title}</h1><p>{sub}</p></div>{action}</header>;
}
function Card({children,className=''}:{children:React.ReactNode;className?:string}){return <section className={`b10-card ${className}`}>{children}</section>}
function dateTime(value:string|null){if(!value)return'';const d=new Date(value);return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
function formatMinutes(value:number){if(value<60)return`${value}m`;const h=Math.floor(value/60);const m=value%60;return m?`${h}h ${m}m`:`${h}h`}

export function Batch10RemindersView({reminders}:{reminders:Reminder[]}){
 const [tab,setTab]=useState<'all'|'today'|'scheduled'|'attention'>('today');
 const today=new Date().toDateString();
 const filtered=useMemo(()=>reminders.filter(r=>{
  if(tab==='all')return !r.completed;
  if(tab==='today')return !r.completed&&Boolean(r.dueAt)&&new Date(r.dueAt as string).toDateString()===today;
  if(tab==='scheduled')return !r.completed&&Boolean(r.dueAt);
  return !r.completed&&(r.urgency==='overdue'||r.urgency==='today');
 }),[reminders,tab,today]);
 const completed=reminders.filter(r=>r.completed).length;
 const labels:{key:typeof tab;label:string}[]=[{key:'all',label:'All'},{key:'today',label:'Today'},{key:'scheduled',label:'Scheduled'},{key:'attention',label:'Needs Attention'}];
 return <div className="b10-root b10-reminders"><Head index="1. REMINDERS" title="Reminders" sub="Never forget what matters." action={<Link href="/intake?type=reminder" className="b10-primary"><Plus size={12}/> Capture Reminder</Link>}/>
  <div className="b10-tabs">{labels.map(x=><button key={x.key} onClick={()=>setTab(x.key)} className={tab===x.key?'active':''} aria-pressed={tab===x.key}>{x.label}</button>)}</div>
  <div className="b10-date-row"><strong>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</strong><span>{tab==='today'?'Today':'Showing'} <b>{filtered.length}</b></span><span>Completed <b>{completed}</b></span></div>
  <Card className="b10-reminder-list">{filtered.length?filtered.map(r=><Link key={r.id} href={`/search?q=${encodeURIComponent(r.title)}`} className="b10-reminder-row"><Circle size={13}/><span className="b10-reminder-title">{r.title}</span><span className="b10-reminder-time">{dateTime(r.dueAt)||r.listName}</span>{(r.urgency==='overdue'||r.urgency==='today')?<AlertCircle size={12} aria-label="Needs attention"/>:<span className="b10-reminder-spacer"/>}</Link>):<div className="b10-empty">No reminders in this view.</div>}</Card>
  <div className="b10-editorial-strip"><span>Small reminders. Big impact.</span><EditableRoomImage slot="batch10:reminders:strip" label="Reminders editorial" fallbackUrl={photo('photo-1499209974431-9dddcece7f88')} className="b10-strip-image"/></div>
 </div>;
}

export function Batch10GmailView({rows,selectedId}:{rows:GmailRow[];selectedId?:string|null}){
 const selected=rows.find(r=>r.id===selectedId)??rows[0];
 return <div className="b10-root b10-gmail"><Head index="2. GMAIL" title="Gmail" sub="Recent connected inbox messages." action={<a href="https://mail.google.com/mail/?view=cm&fs=1" target="_blank" rel="noreferrer" className="b10-primary">Compose in Gmail</a>}/>
  <div className="b10-tabs"><span className="active">Recent</span><span className="b10-disabled-tab" title="Gmail label metadata is not loaded in this bounded inbox view">Social</span><span className="b10-disabled-tab">Promotions</span><span className="b10-disabled-tab">Updates</span><Link href="/gmail" className="ml-auto"><Filter size={11}/> Refresh</Link></div>
  <div className="b10-mail-layout"><Card className="b10-mail-list">{rows.length?rows.slice(0,10).map(r=><Link key={r.id} href={`/gmail?messageId=${encodeURIComponent(r.id)}`} className={selected?.id===r.id?'selected':''}><span className="b10-mail-dot"/><div><strong>{r.from}</strong><small>{r.subject}</small></div><span>{r.date||''}</span></Link>):<div className="b10-empty">No recent Gmail messages are available from the connected inbox.</div>}</Card>
   <Card className="b10-mail-reader">{selected?<><div className="b10-mail-reader-head"><div><strong>{selected.subject}</strong><small>{selected.from}</small></div><span className="b10-mail-priority">{selected.priority||'Email'}</span></div><div className="b10-mail-visual"><Mail size={28}/><span>Message preview</span></div><p>{selected.snippet||'No message snippet is available in the bounded Gmail preview.'}</p><Link href={`#gmail-actions-${encodeURIComponent(selected.id)}`} className="b10-primary b10-reply">Message Actions</Link></>:<div className="b10-empty">Select an email to preview it.</div>}</Card>
  </div><a href="https://mail.google.com" target="_blank" rel="noreferrer" className="b10-view-all">Open full Gmail inbox <ChevronRight size={12}/></a>
 </div>;
}

export function Batch10ImportView({recent}:{recent:ImportRow[]}){
 const [category,setCategory]=useState('All');
 const categories=['All','Files','Calendar','Tasks','Notes','Contacts'];
 const filtered=useMemo(()=>recent.filter(r=>category==='All'||`${r.category??''} ${r.summary??''}`.toLowerCase().includes(category.toLowerCase().replace(/s$/,''))),[recent,category]);
 return <div className="b10-root b10-import"><Head index="3. IMPORT" title="Import" sub="Bring supported information into Glow OS." action={<a href="#import-tools" className="b10-primary"><Plus size={12}/> New Import</a>}/>
  <div className="b10-tabs">{categories.map(x=><button key={x} type="button" onClick={()=>setCategory(x)} className={category===x?'active':''} aria-pressed={category===x}>{x}</button>)}</div>
  <a href="#import-tools" className="b10-dropzone"><UploadCloud size={35}/><strong>Open import tools</strong><span>Select supported files and review them below</span><small>Glow shows supported formats in the real importer before commit.</small></a>
  <h2 className="b10-section-title">Recent Imports</h2><Card className="b10-import-list">{filtered.length?filtered.slice(0,8).map((r,i)=><div key={r.id||i}><span className="b10-file-icon"><FileText size={13}/></span><div><strong>{r.summary||r.category||'Imported batch'}</strong><small>{r.createdAt?new Date(r.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'Imported'}</small></div><span>{r.status||r.category||'Ready'}</span></div>):<div className="b10-empty">No imports in this view.</div>}</Card>
  <div className="b10-editorial-strip"><span>Import once. Organize with review.</span><EditableRoomImage slot="batch10:import:strip" label="Import editorial" fallbackUrl={photo('photo-1497215728101-856f4ea42174')} className="b10-strip-image"/></div>
 </div>;
}

export function Batch10AllRoomsView(){
 const [category,setCategory]=useState('All');
 const categories=['All','Life','Mind','Wellness','Money','Home','Work','Create'];
 const rooms=ROOM_PHOTOS.filter(r=>category==='All'||r[4]===category);
 return <div className="b10-root b10-rooms"><Head index="5. ALL ROOMS" title="All Rooms" sub="Every part of your world. Connected." action={<Link href="/settings" className="b10-soft">Customize Rooms</Link>}/><div className="b10-tabs">{categories.map(x=><button key={x} type="button" onClick={()=>setCategory(x)} className={category===x?'active':''} aria-pressed={category===x}>{x}</button>)}</div><div className="b10-room-grid">{rooms.map(([title,href,id,sub])=><Link key={title} href={href} className="b10-room"><EditableRoomImage slot={`batch10:room:${title}`} label={title} fallbackUrl={photo(id)} className="b10-room-img"/><strong>{title}</strong><span>{sub}</span></Link>)}<Link href="/settings" className="b10-room b10-room-add"><Plus size={28}/><strong>Customize Rooms</strong><span>Manage your world</span></Link></div></div>;
}

export function Batch10HomeSummaryView({tasks,events,metrics}:{tasks:HomeTask[];events:HomeEvent[];metrics:HomeMetrics}){
 const top=tasks.slice(0,3);const upcoming=events.slice(0,4);
 const cards=[['Open Tasks',metrics.openTasks,'Current'],['Upcoming',metrics.upcomingEvents,'Future events'],['Focus Time',formatMinutes(metrics.focusMinutesToday),'Today'],['Workouts',metrics.workouts7d,'Last 7 days']] as const;
 return <div className="b10-root b10-home"><Head index="8. HOME DASHBOARD (SUMMARY VIEW)" title="Home" sub="Everything you need. Right now." action={<Link href="/intake" className="b10-soft"><Plus size={12}/> Quick Add</Link>}/><div className="b10-home-top"><Card className="b10-home-greeting"><div><h2>Welcome home ♡</h2><p>Your current priorities and upcoming plans, together.</p></div><EditableRoomImage slot="batch10:home:greeting" label="Home sunrise" fallbackUrl={photo('photo-1500530855697-b586d89ba3ee')} className="b10-home-sunrise"/></Card><Card><h2>Today’s Focus</h2><p>Protect your peace. Prioritize what moves you forward.</p><ol>{top.length?top.map((t,i)=><li key={t.id}><span>{i+1}.</span><Link href={`/tasks?taskId=${encodeURIComponent(t.id)}`}>{t.title}</Link></li>):<li><span>1.</span><Link href="/tasks">Choose your top priority</Link></li>}</ol></Card></div><div className="b10-home-metrics">{cards.map(([a,b,c])=><Card key={a}><small>{a}</small><strong>{b}</strong><span>{c}</span></Card>)}</div><div className="b10-home-bottom"><Card><h2>Upcoming Events</h2>{upcoming.length?upcoming.map(e=><Link href={`/calendar?eventId=${encodeURIComponent(e.id)}`} key={e.id} className="b10-home-event"><span>{e.startAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span><strong>{e.title}</strong><small>{e.startAt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</small></Link>):<div className="b10-empty">No upcoming events.</div>}<Link href="/calendar" className="b10-view-all">View full calendar <ChevronRight size={12}/></Link></Card><Card className="b10-affirmation"><small>Daily Affirmation</small><p>I am becoming the best version of myself every single day.</p><EditableRoomImage slot="batch10:home:affirmation" label="Affirmation editorial" fallbackUrl={photo('photo-1499209974431-9dddcece7f88')} className="b10-affirmation-img"/></Card></div><button type="button" onClick={()=>document.dispatchEvent(new CustomEvent('glow:search-open'))} className="b10-voice"><Search size={13}/><span>Ask Glow or search your world...</span><Sparkles size={14}/></button></div>;
}
