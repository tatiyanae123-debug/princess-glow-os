'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowUpRight,Sparkles} from 'lucide-react';
import {usePersonalContext} from '@/lib/personal-context/use-personal-context';

const areas=[['Daily Life','/today'],['Personal Life','/life'],['Work + Money','/life'],['Creative World','/life-studio/projects'],['Goals + Projects','/goals'],['Learning + Brain','/life-studio'],['Archive','/life-studio'],['System + Templates','/life-studio']];
const modes=['Morning','Midday','Evening','Night'] as const;
type Mode=typeof modes[number];
const card={background:'#fff',border:'1px solid #EAE4DD',borderRadius:18,padding:22} as const;
const serif={fontFamily:'Georgia,serif',fontWeight:400} as const;
const caption={fontSize:11,letterSpacing:2,color:'#817873'} as const;
function timeMode(h:number):Mode{return h<10?'Morning':h<16?'Midday':h<21?'Evening':'Night'}
export function GlowHomeDashboard(){
 const personal=usePersonalContext();
 const data=personal.status==='ready'?personal.data:null;
 const [now,setNow]=useState<Date|null>(null);
 const [manualMode,setManualMode]=useState<Mode|null>(null);
 const [level,setLevel]=useState('Full');
 useEffect(()=>{const tick=()=>setNow(new Date());tick();const id=setInterval(tick,60000);return()=>clearInterval(id)},[]);
 const mode=manualMode??timeMode(now?.getHours()??9);
 const priorities=useMemo(()=>{if(!data)return[];const rank={urgent:0,high:1,medium:2,low:3};return [...data.tasks].filter(t=>t.status!=='done'&&t.status!=='cancelled').sort((a,b)=>rank[a.priority]-rank[b.priority]).slice(0,3)},[data]);
 const events=data?.todayEvents.slice(0,4)??[];
 const open=data?.tasks.filter(t=>t.status!=='done'&&t.status!=='cancelled').length;
 const goals=data?.goals.filter(g=>g.status!=='complete').length;
 const urgent=data?.tasks.filter(t=>t.priority==='urgent'&&t.status!=='done'&&t.status!=='cancelled').length;
 const name=data?.user.name?.trim().split(/\s+/)[0];
 return <main style={{minHeight:'100vh',background:'#F7F6F2',color:'#292929',padding:'clamp(20px,4vw,54px)',fontFamily:'Arial,sans-serif'}}><div style={{maxWidth:1180,margin:'auto'}}>
 <header style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'center',flexWrap:'wrap',marginBottom:28}}><div><div style={caption}>TATIYANA / PERSONAL OPERATING SYSTEM</div><h1 style={{...serif,fontSize:'clamp(36px,5vw,60px)',margin:'13px 0'}}>Welcome {name??'home'}. 🌷</h1><p style={{color:'#817873'}}>Your life, beautifully in motion. {now?.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p></div><button onClick={()=>document.dispatchEvent(new CustomEvent('glow:open'))} style={{border:0,borderRadius:30,padding:'13px 20px',background:'#292929',color:'white',cursor:'pointer'}}>Ask Glow ✦</button></header>
 <nav style={{display:'flex',gap:9,flexWrap:'wrap',marginBottom:22}}>{[['TODAY','/today'],['PLAN','/planning'],['LIFE','/life'],['PROJECTS','/life-studio/projects'],['BRAIN','/life-studio']].map(([n,p])=><Link key={n} href={p} style={{...card,padding:'12px 15px',fontSize:11,color:'#292929',textDecoration:'none'}}>{n}</Link>)}</nav>
 <section style={{...card,background:'#EAE4DD',marginBottom:16}}><div style={caption}>01 / YOUR DAILY EDIT</div><h2 style={{...serif,fontSize:35,marginBottom:10}}>Your next best move</h2><p style={{fontSize:17}}>{priorities[0]?.title??(data?'Choose one meaningful priority today.':'Your next action appears when your data is available.')}</p><p style={{fontSize:12,color:'#817873'}}>Based on your highest-priority unfinished task, not a generated appointment or invented activity.</p><Link href="/today?room=what-now" style={{fontSize:13,color:'#292929'}}>What Now? <ArrowUpRight size={14} style={{display:'inline'}}/></Link></section>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:16}}>
 <section style={card}><div style={caption}>02 / DAILY COMMAND CENTER</div><h2 style={{...serif,fontSize:26}}>Today’s focus</h2>{priorities.length?priorities.map((t,i)=><p key={t.id} style={{borderBottom:'1px solid #EAE4DD',paddingBottom:10,fontSize:13}}>{i+1}. {t.title}</p>):<p style={{fontSize:13,color:'#817873'}}>No unfinished priorities available.</p>}<Link href="/today?room=replan" style={{fontSize:12,color:'#292929'}}>Replan my day ↗</Link></section>
 <section style={card}><div style={caption}>03 / COMING UP</div><h2 style={{...serif,fontSize:26}}>Your schedule</h2>{events.length?events.map(e=><p key={e.id} style={{fontSize:13,borderBottom:'1px solid #EAE4DD',paddingBottom:10}}>{new Date(e.startAt).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})} · {e.title}</p>):<p style={{fontSize:13,color:'#817873'}}>No connected events for today.</p>}<Link href="/planning" style={{fontSize:12,color:'#292929'}}>Open planning ↗</Link></section>
 <section style={card}><div style={caption}>04 / DAILY RITUALS</div><h2 style={{...serif,fontSize:26}}>Your rhythm</h2><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{modes.map(m=><button key={m} onClick={()=>setManualMode(m)} style={{border:'1px solid #D8C4C5',borderRadius:30,padding:'8px 10px',background:mode===m?'#292929':'white',color:mode===m?'white':'#292929',cursor:'pointer',fontSize:11}}>{m}</button>)}</div><p style={{fontSize:13,color:'#817873'}}>Current view: {mode}</p><div style={{display:'flex',gap:6}}>{['Full','Quick','Minimum'].map(l=><button key={l} onClick={()=>setLevel(l)} style={{border:'1px solid #EAE4DD',borderRadius:9,padding:8,background:level===l?'#EAE4DD':'white',fontSize:11,cursor:'pointer'}}>{l}</button>)}</div><p style={{fontSize:12,color:'#817873'}}>{level} routine selected. Open your routine for real steps and tracking.</p><Link href="/routines" style={{fontSize:12,color:'#292929'}}>Open routines ↗</Link></section>
 <section style={card}><div style={caption}>05 / LIFE PULSE</div><h2 style={{...serif,fontSize:26}}>Your progress</h2><p style={{fontSize:14}}>Open tasks: <strong>{open??'—'}</strong></p><p style={{fontSize:14}}>Active goals: <strong>{goals??'—'}</strong></p><p style={{fontSize:11,color:'#817873'}}>Only counts from available Glow OS records.</p><Link href="/goals" style={{fontSize:12,color:'#292929'}}>Explore goals ↗</Link></section>
 <section style={card}><div style={caption}>06 / ATTENTION CENTER</div><h2 style={{...serif,fontSize:26}}>Needs your attention</h2><p style={{fontSize:13,color:'#817873'}}>{data?urgent?urgent+' urgent unfinished task(s) to review.':'No urgent unfinished tasks.':'Waiting for connected records.'}</p><Link href="/today" style={{fontSize:12,color:'#292929'}}>Review tasks ↗</Link></section>
 <section style={card}><div style={caption}>07 / LITTLE JOYS</div><h2 style={{...serif,fontSize:26}}>Something just for you</h2><p style={{fontSize:13,color:'#817873'}}>Make room for a small moment of joy today.</p><Link href="/life" style={{fontSize:12,color:'#292929'}}>Saint, beauty & personal life ↗</Link></section>
 </div>
 <section style={{marginTop:35}}><div style={caption}>08 / YOUR CONNECTED WORLDS</div><h2 style={{...serif,fontSize:32}}>The Personal Atlas</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>{areas.map(([name,path])=><Link key={name} href={path} style={{...card,textDecoration:'none',color:'#292929',display:'flex',justifyContent:'space-between',fontSize:14}}>{name}<ArrowUpRight size={16}/></Link>)}</div></section>
 <footer style={{marginTop:35,borderTop:'1px solid #EAE4DD',paddingTop:20,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:10}}><span style={{fontSize:11,color:'#817873'}}>Glow OS · An intentional life, in motion.</span><Link href="/life-studio" style={{fontSize:12,color:'#292929'}}>Explore Life Studio <Sparkles size={14} style={{display:'inline'}}/></Link></footer>
 </div></main>
}
