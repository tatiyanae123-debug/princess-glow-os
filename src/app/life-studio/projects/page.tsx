'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Plus, Trash2 } from 'lucide-react';

type Milestone={id:string;name:string;done:boolean};
type Venture={name:string;subtitle:string;url:string;milestones:Milestone[];notes:string};
const initial:Venture[]=[
 {name:'Skincare + Scalp Brand',subtitle:'Product innovation · Brand development',url:'https://app.notion.com/p/Skincare-and-Scalp-Brand-3f37115f807081b48b04c6dc9075c25a',milestones:['Organize product concepts','Review formulation research','Build manufacturer shortlist','Plan packaging engineering','Define next prototype'].map((name,i)=>({id:'skin'+i,name,done:false})),notes:''},
 {name:'MIDNIGHT GLOW',subtitle:'Influencer development · Content strategy',url:'https://app.notion.com/p/Influencer-Development-MIDNIGHT-GLOW-Project-Portal-3f87115f807081d0a6b9cbdad0f1138a',milestones:['Clarify creator identity','Organize content pillars','Build filming workflow','Plan brand outreach','Review performance and learnings'].map((name,i)=>({id:'glow'+i,name,done:false})),notes:''}
];
export default function ProjectObservatory(){
 const [projects,setProjects]=useState<Venture[]>(initial);
 const [active,setActive]=useState(0);
 const [draft,setDraft]=useState('');
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem('glow-project-observatory-v2');if(raw){const data=JSON.parse(raw);if(Array.isArray(data)&&data.length===2)setProjects(data);}}catch{}setLoaded(true)},[]);
 useEffect(()=>{if(loaded)try{localStorage.setItem('glow-project-observatory-v2',JSON.stringify(projects))}catch{}},[projects,loaded]);
 const update=(fn:(p:Venture)=>Venture)=>setProjects(old=>old.map((p,i)=>i===active?fn(p):p));
 const current=projects[active];const done=current.milestones.filter(m=>m.done).length;const progress=current.milestones.length?Math.round(done/current.milestones.length*100):0;
 const card={background:'#fff',border:'1px solid #EAE4DD',borderRadius:18,padding:22};
 return <main style={{minHeight:'100vh',background:'#F7F6F2',color:'#292929',fontFamily:'Arial,sans-serif',padding:'clamp(20px,5vw,60px)'}}><div style={{maxWidth:1050,margin:'auto'}}>
  <Link href="/life-studio" style={{display:'inline-flex',alignItems:'center',gap:8,fontSize:12,color:'#817873',marginBottom:30}}><ArrowLeft size={15}/> Life Studio</Link>
  <div style={{fontSize:11,letterSpacing:3,color:'#918781'}}>LIFE OS / PROJECTS</div><h1 style={{fontFamily:'Georgia,serif',fontWeight:400,fontSize:'clamp(36px,5vw,58px)',margin:'12px 0'}}>The Project Observatory</h1><p style={{color:'#817873',lineHeight:1.7,maxWidth:650}}>One focused workspace for your two featured ventures. Your Notion portals remain the authoritative project archives.</p>
  <div style={{display:'flex',gap:10,flexWrap:'wrap',margin:'28px 0'}}>{projects.map((p,i)=><button key={p.name} onClick={()=>setActive(i)} style={{padding:'13px 18px',borderRadius:40,border:'1px solid #D8C4C5',background:i===active?'#292929':'#fff',color:i===active?'#fff':'#292929',cursor:'pointer'}}>{p.name}</button>)}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:16}}>
   <section style={card}><div style={{fontSize:11,letterSpacing:2,color:'#918781'}}>PROJECT BRIEF</div><h2 style={{fontFamily:'Georgia,serif',fontWeight:400,fontSize:29}}>{current.name}</h2><p style={{fontSize:13,color:'#817873'}}>{current.subtitle}</p><a href={current.url} target="_blank" rel="noreferrer" style={{display:'inline-flex',gap:7,alignItems:'center',color:'#292929',fontSize:12,marginTop:16}}>Open original Notion portal <ArrowUpRight size={14}/></a><div style={{marginTop:32,display:'flex',justifyContent:'space-between',fontSize:12}}><span>Milestone progress</span><strong>{progress}%</strong></div><div style={{height:8,background:'#EAE4DD',borderRadius:30,marginTop:10,overflow:'hidden'}}><div style={{width:progress+'%',height:'100%',background:'#BCA8A8',transition:'width .2s'}}/></div><p style={{fontSize:11,color:'#918781'}}>{done} of {current.milestones.length} milestones complete</p></section>
   <section style={card}><div style={{fontSize:11,letterSpacing:2,color:'#918781'}}>EXECUTION</div><h2 style={{fontFamily:'Georgia,serif',fontWeight:400,fontSize:26}}>Milestones</h2>{current.milestones.map(m=><div key={m.id} style={{display:'flex',alignItems:'center',gap:10,borderBottom:'1px solid #F0ECE8',padding:'10px 0'}}><input type="checkbox" checked={m.done} onChange={()=>update(p=>({...p,milestones:p.milestones.map(x=>x.id===m.id?{...x,done:!x.done}:x)}))}/><span style={{flex:1,fontSize:13,textDecoration:m.done?'line-through':'none'}}>{m.name}</span><button onClick={()=>update(p=>({...p,milestones:p.milestones.filter(x=>x.id!==m.id)}))} aria-label={'Delete '+m.name} style={{border:0,background:'transparent',cursor:'pointer',color:'#918781'}}><Trash2 size={14}/></button></div>)}<form onSubmit={e=>{e.preventDefault();if(!draft.trim())return;update(p=>({...p,milestones:[...p.milestones,{id:String(Date.now()),name:draft.trim(),done:false}]}));setDraft('')}} style={{display:'flex',gap:8,marginTop:16}}><input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Add milestone" aria-label="New milestone" style={{flex:1,minWidth:0,border:'1px solid #EAE4DD',borderRadius:8,padding:10}}/><button type="submit" style={{border:0,borderRadius:8,padding:10,background:'#292929',color:'white'}} aria-label="Add milestone"><Plus size={17}/></button></form></section>
  </div>
  <section style={{...card,marginTop:16}}><div style={{fontSize:11,letterSpacing:2,color:'#918781'}}>PROJECT THINKING</div><h2 style={{fontFamily:'Georgia,serif',fontWeight:400,fontSize:26}}>Decisions & next steps</h2><textarea value={current.notes} onChange={e=>update(p=>({...p,notes:e.target.value}))} placeholder="Record next decisions, blockers, research questions, or meeting notes…" style={{width:'100%',minHeight:140,border:'1px solid #EAE4DD',borderRadius:12,padding:15,fontFamily:'inherit',resize:'vertical'}}/><p style={{fontSize:11,color:'#918781'}}>Changes save in this browser only, not in Notion. Avoid confidential information here.</p></section>
 </div></main>
}
