'use client';

import { useEffect, useMemo, useState } from 'react';
import { BellRing, Clock3, History, TimerReset } from 'lucide-react';

type Channel='in-app'|'browser'|'email'|'sms'|'apple-reminders'|'device-alarm';
type HistoryEntry={id:string;title:string;body:string;createdAt:string;channel:'in-app'|'browser';status:'shown'|'missed-recovery'};
type Settings={channels:Record<Channel,boolean>;leadMinutes:number[];repeatUntilDone:boolean;snoozeMinutes:number;quietHours:{enabled:boolean;start:string;end:string};recoverMissed:boolean};
const KEY='glow-os:alert-center:v2';
const LEGACY_KEY='glow-os:alert-center:v1';
const HISTORY_KEY='glow-os:notification-history:v1';
const DEFAULT:Settings={channels:{'in-app':true,browser:false,email:false,sms:false,'apple-reminders':false,'device-alarm':false},leadMinutes:[10,0],repeatUntilDone:false,snoozeMinutes:10,quietHours:{enabled:false,start:'22:00',end:'07:00'},recoverMissed:true};
const LEADS=[60,30,15,10,5,0];
const CHANNELS:Array<{id:Channel;label:string;detail:string;ready:boolean}>=[
 {id:'in-app',label:'Glow in-app alert',detail:'Shows inside Glow OS while the app is open.',ready:true},
 {id:'browser',label:'Browser notification',detail:'Uses this device/browser notification permission.',ready:true},
 {id:'email',label:'Email',detail:'Not enabled until Glow has a real outbound email delivery connector.',ready:false},
 {id:'sms',label:'Text message',detail:'Not enabled until Glow has a real SMS delivery provider.',ready:false},
 {id:'apple-reminders',label:'Apple Reminders',detail:'Current Apple bridge imports reminders; it is not a silent write channel.',ready:false},
 {id:'device-alarm',label:'iPhone Clock alarm',detail:'A web app cannot silently create native Clock alarms without a Shortcut or native bridge.',ready:false},
];

function normalizeSettings(raw:unknown):Settings{
 if(!raw||typeof raw!=='object')return DEFAULT;
 const value=raw as Partial<Settings>&{leadMinutes?:number[]|number};
 const leads=Array.isArray(value.leadMinutes)?value.leadMinutes:typeof value.leadMinutes==='number'?[value.leadMinutes,0]:DEFAULT.leadMinutes;
 return {...DEFAULT,...value,leadMinutes:Array.from(new Set(leads.filter(item=>LEADS.includes(item)))).sort((a,b)=>b-a),quietHours:{...DEFAULT.quietHours,...value.quietHours},channels:{...DEFAULT.channels,...value.channels}};
}
function readHistory():HistoryEntry[]{try{const raw=JSON.parse(localStorage.getItem(HISTORY_KEY)??'[]');return Array.isArray(raw)?raw.slice(0,30):[]}catch{return[]}}
function inQuietHours(settings:Settings,date=new Date()){
 if(!settings.quietHours.enabled)return false;
 const now=date.getHours()*60+date.getMinutes();
 const [sh,sm]=settings.quietHours.start.split(':').map(Number);const [eh,em]=settings.quietHours.end.split(':').map(Number);
 const start=sh*60+sm;const end=eh*60+em;
 return start<=end?now>=start&&now<end:now>=start||now<end;
}

export function AlertCenterClient(){
 const[settings,setSettings]=useState<Settings>(DEFAULT);const[message,setMessage]=useState('');const[history,setHistory]=useState<HistoryEntry[]>([]);
 useEffect(()=>{try{const v2=localStorage.getItem(KEY);const legacy=localStorage.getItem(LEGACY_KEY);setSettings(normalizeSettings(JSON.parse(v2??legacy??'null')))}catch{setSettings(DEFAULT)}setHistory(readHistory())},[]);
 const quietNow=useMemo(()=>inQuietHours(settings),[settings]);
 function save(next:Settings){setSettings(next);localStorage.setItem(KEY,JSON.stringify(next));document.dispatchEvent(new CustomEvent('glow:alert-settings',{detail:next}))}
 function record(entry:Omit<HistoryEntry,'id'|'createdAt'>){const next=[{...entry,id:crypto.randomUUID(),createdAt:new Date().toISOString()},...history].slice(0,30);setHistory(next);localStorage.setItem(HISTORY_KEY,JSON.stringify(next))}
 async function toggle(id:Channel,ready:boolean){if(!ready){setMessage(`${CHANNELS.find(c=>c.id===id)?.label} needs a real connector or device bridge before Glow can turn it on.`);return}if(id==='browser'&&!settings.channels.browser&&'Notification'in window){const result=await Notification.requestPermission();if(result!=='granted'){setMessage('Browser notifications were not allowed on this device.');return}}save({...settings,channels:{...settings.channels,[id]:!settings.channels[id]}});setMessage('Alert channel updated.')}
 function toggleLead(minutes:number){const has=settings.leadMinutes.includes(minutes);const next=has?settings.leadMinutes.filter(item=>item!==minutes):[...settings.leadMinutes,minutes].sort((a,b)=>b-a);save({...settings,leadMinutes:next.length?next:[0]})}
 function test(){const title='Glow OS reminder';const body=quietNow?'Test alert recorded, but quiet hours are active.':'This is a test notification from your Alert Center.';record({title,body,channel:'in-app',status:quietNow?'missed-recovery':'shown'});if(!quietNow&&settings.channels.browser&&'Notification'in window&&Notification.permission==='granted'){new Notification(title,{body});record({title,body,channel:'browser',status:'shown'})}setMessage(body)}
 function clearHistory(){setHistory([]);localStorage.removeItem(HISTORY_KEY);setMessage('Notification history cleared.')}
 return <div className="space-y-5">
  <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{CHANNELS.map(channel=><button key={channel.id} type="button" onClick={()=>toggle(channel.id,channel.ready)} aria-pressed={settings.channels[channel.id]} className={`v3-depth-plane rounded-[18px] border p-4 text-left ${settings.channels[channel.id]?'border-[#DDAEB4] bg-[#FDF3F2]':'border-[#F1E7E3] bg-white'}`}><div className="flex items-center justify-between gap-2"><p className="text-[11.5px] font-medium text-[#3A332E]">{channel.label}</p><span className={`rounded-full px-2 py-1 text-[8.5px] ${channel.ready?'bg-[#E4EBDD] text-[#5A6E52]':'bg-[#F1E8D9] text-[#9A7A3D]'}`}>{channel.ready?'available':'bridge needed'}</span></div><p className="mt-2 text-[10px] leading-4 text-[#8A8078]">{channel.detail}</p></button>)}</section>

  <section className="grid gap-4 xl:grid-cols-3">
   <div className="v3-surface rounded-[18px] border border-[#F1E7E3] bg-white p-4"><div className="flex items-center gap-2"><TimerReset size={14} className="text-[#C9727E]"/><p className="text-[12px] font-medium">Multiple alert stages</p></div><p className="mt-2 text-[10px] leading-4 text-[#8A8078]">Choose more than one stage, such as 30 minutes, 10 minutes, and at time.</p><div className="mt-4 flex flex-wrap gap-2">{LEADS.map(minutes=><button key={minutes} type="button" aria-pressed={settings.leadMinutes.includes(minutes)} onClick={()=>toggleLead(minutes)} className={`min-h-9 rounded-full border px-3 text-[10px] font-medium ${settings.leadMinutes.includes(minutes)?'border-[#DDAEB4] bg-[#FAE6E7] text-[#A94D63]':'border-[#F1E7E3] bg-white text-[#776E69]'}`}>{minutes===0?'At time':`${minutes} min before`}</button>)}</div><label className="mt-4 flex items-center gap-2 text-[11px]"><input type="checkbox" checked={settings.repeatUntilDone} onChange={e=>save({...settings,repeatUntilDone:e.target.checked})}/>Escalate/repeat until marked done</label><label className="mt-3 block text-[10px] text-[#8A8078]">Default snooze</label><select value={settings.snoozeMinutes} onChange={e=>save({...settings,snoozeMinutes:Number(e.target.value)})} className="mt-2 w-full rounded-[12px] border border-[#F1E7E3] bg-white px-3 py-2.5 text-[11px]"><option value={5}>5 minutes</option><option value={10}>10 minutes</option><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>1 hour</option></select></div>

   <div className="v3-surface rounded-[18px] border border-[#F1E7E3] bg-white p-4"><div className="flex items-center gap-2"><Clock3 size={14} className="text-[#7C6B9C]"/><p className="text-[12px] font-medium">Quiet hours + recovery</p></div><label className="mt-4 flex items-center gap-2 text-[11px]"><input type="checkbox" checked={settings.quietHours.enabled} onChange={e=>save({...settings,quietHours:{...settings.quietHours,enabled:e.target.checked}})}/>Use quiet hours</label><div className="mt-3 grid grid-cols-2 gap-2"><label className="text-[9.5px] text-[#8A8078]">Starts<input type="time" value={settings.quietHours.start} onChange={e=>save({...settings,quietHours:{...settings.quietHours,start:e.target.value}})} className="mt-1 w-full rounded-[11px] border border-[#F1E7E3] px-2"/></label><label className="text-[9.5px] text-[#8A8078]">Ends<input type="time" value={settings.quietHours.end} onChange={e=>save({...settings,quietHours:{...settings.quietHours,end:e.target.value}})} className="mt-1 w-full rounded-[11px] border border-[#F1E7E3] px-2"/></label></div><label className="mt-4 flex items-center gap-2 text-[11px]"><input type="checkbox" checked={settings.recoverMissed} onChange={e=>save({...settings,recoverMissed:e.target.checked})}/>Surface missed alerts after quiet hours</label><p className={`mt-3 rounded-[10px] px-3 py-2 text-[10px] ${quietNow?'bg-[#F1E8D9] text-[#8C6E35]':'bg-[#E9F0E5] text-[#53654C]'}`}>{quietNow?'Quiet hours are active now.':'Alerts are currently allowed.'}</p></div>

   <div className="v3-surface rounded-[18px] border border-[#F1E7E3] bg-[#FDF8F6] p-4"><div className="flex items-center gap-2"><BellRing size={14} className="text-[#C9727E]"/><p className="text-[12px] font-medium">Delivery test</p></div><p className="mt-3 text-[10.5px] leading-5 text-[#7D746F]">Test only the channels that are genuinely available. Unsupported channels stay off instead of pretending to work.</p><button type="button" onClick={test} className="mt-4 rounded-full bg-[#2B2420] px-4 py-2.5 text-[10.5px] text-white">Test enabled alerts</button>{message?<p role="status" className="mt-3 text-[10px] leading-4 text-[#9A7A3D]">{message}</p>:null}</div>
  </section>

  <section className="v3-surface overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white"><div className="flex items-center justify-between border-b border-[#F1E7E3] px-4 py-3"><div className="flex items-center gap-2"><History size={14} className="text-[#C9727E]"/><p className="text-[12px] font-medium">Notification history</p></div><button type="button" onClick={clearHistory} disabled={!history.length} className="rounded-full px-3 py-1.5 text-[10px] font-medium text-[#8A8078] hover:bg-[#F7EEED] disabled:opacity-35">Clear</button></div><div className="divide-y divide-[#F4ECE8]">{history.length?history.map(item=><div key={item.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[1fr_auto]"><div><p className="text-[11px] font-medium text-[#3A332E]">{item.title}</p><p className="mt-1 text-[10px] text-[#8A8078]">{item.body}</p></div><div className="text-[9px] text-[#A79D96] sm:text-right"><p>{item.channel}</p><p>{new Date(item.createdAt).toLocaleString()}</p></div></div>):<p className="p-4 text-[10.5px] text-[#9A9088]">No alerts have been recorded on this device yet.</p>}</div></section>
 </div>
}
