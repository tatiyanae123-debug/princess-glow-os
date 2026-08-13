'use client';

import {useEffect,useState} from 'react';
import {BellRing,Mail,MessageSquare,Smartphone,TimerReset} from 'lucide-react';

type Channel='in-app'|'browser'|'email'|'sms'|'apple-reminders'|'device-alarm';
type Settings={channels:Record<Channel,boolean>;leadMinutes:number;repeatUntilDone:boolean};
const KEY='glow-os:alert-center:v1';
const DEFAULT:Settings={channels:{'in-app':true,browser:false,email:false,sms:false,'apple-reminders':false,'device-alarm':false},leadMinutes:10,repeatUntilDone:false};
const CHANNELS:Array<{id:Channel;label:string;detail:string;ready:boolean}>=[
 {id:'in-app',label:'Glow in-app alarm',detail:'Shows inside Glow OS when the app is open.',ready:true},
 {id:'browser',label:'Browser notification',detail:'Uses device/browser notification permission.',ready:true},
 {id:'email',label:'Email',detail:'Requires an outbound email connector before delivery is real.',ready:false},
 {id:'sms',label:'Text message',detail:'Requires an SMS provider before delivery is real.',ready:false},
 {id:'apple-reminders',label:'Apple Reminders',detail:'Requires a write-capable Apple bridge; the current importer is not a silent write channel.',ready:false},
 {id:'device-alarm',label:'iPhone Clock alarm',detail:'Requires an Apple Shortcut or native-device bridge. A website cannot silently create Clock alarms.',ready:false},
];

export function AlertCenterClient(){
 const[settings,setSettings]=useState<Settings>(DEFAULT);const[message,setMessage]=useState('');
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw)setSettings({...DEFAULT,...JSON.parse(raw)})}catch{}},[]);
 function save(next:Settings){setSettings(next);localStorage.setItem(KEY,JSON.stringify(next));document.dispatchEvent(new CustomEvent('glow:alert-settings',{detail:next}))}
 async function toggle(id:Channel,ready:boolean){if(!ready){setMessage(`${CHANNELS.find(c=>c.id===id)?.label} needs a real connector or device bridge before Glow can turn it on.`);return}if(id==='browser'&&!settings.channels.browser&&'Notification'in window){const result=await Notification.requestPermission();if(result!=='granted'){setMessage('Browser notifications were not allowed on this device.');return}}save({...settings,channels:{...settings.channels,[id]:!settings.channels[id]}})}
 function test(){setMessage('Test alarm shown inside Glow OS.');if(settings.channels.browser&&'Notification'in window&&Notification.permission==='granted')new Notification('Glow OS reminder',{body:'This is a test notification from your Alert Center.'})}
 return <div className="space-y-5">
  <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{CHANNELS.map(channel=><button key={channel.id} type="button" onClick={()=>toggle(channel.id,channel.ready)} className={`rounded-[18px] border p-4 text-left ${settings.channels[channel.id]?'border-[#DDAEB4] bg-[#FDF3F2]':'border-[#F1E7E3] bg-white'}`}><div className="flex items-center justify-between"><p className="text-[11.5px] font-medium text-[#3A332E]">{channel.label}</p><span className={`rounded-full px-2 py-1 text-[8.5px] ${channel.ready?'bg-[#E4EBDD] text-[#5A6E52]':'bg-[#F1E8D9] text-[#9A7A3D]'}`}>{channel.ready?'available':'bridge needed'}</span></div><p className="mt-2 text-[10px] leading-4 text-[#8A8078]">{channel.detail}</p></button>)}</section>
  <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><div className="flex items-center gap-2"><TimerReset size={14} className="text-[#C9727E]"/><p className="text-[12px] font-medium">Default timing</p></div><label className="mt-4 block text-[10px] text-[#8A8078]">Alert before scheduled time</label><select value={settings.leadMinutes} onChange={e=>save({...settings,leadMinutes:Number(e.target.value)})} className="mt-2 w-full rounded-[12px] border border-[#F1E7E3] bg-white px-3 py-2.5 text-[11px]"><option value={0}>At time</option><option value={5}>5 minutes before</option><option value={10}>10 minutes before</option><option value={15}>15 minutes before</option><option value={30}>30 minutes before</option><option value={60}>1 hour before</option></select><label className="mt-4 flex items-center gap-2 text-[11px]"><input type="checkbox" checked={settings.repeatUntilDone} onChange={e=>save({...settings,repeatUntilDone:e.target.checked})}/>Repeat until marked done</label></div><div className="rounded-[18px] border border-[#F1E7E3] bg-[#FDF8F6] p-4"><div className="flex items-center gap-2"><BellRing size={14} className="text-[#C9727E]"/><p className="text-[12px] font-medium">Universal coverage</p></div><p className="mt-3 text-[10.5px] leading-5 text-[#7D746F]">This policy is intended for tasks, routines, meals, medication/supplements, workouts, appointments, beauty and hair care, maintenance, deadlines, follow-ups, travel and custom reminders.</p><button type="button" onClick={test} className="mt-4 rounded-full bg-[#2B2420] px-4 py-2.5 text-[10.5px] text-white">Test enabled alerts</button>{message?<p className="mt-3 text-[10px] leading-4 text-[#9A7A3D]">{message}</p>:null}</div></section>
 </div>
}
