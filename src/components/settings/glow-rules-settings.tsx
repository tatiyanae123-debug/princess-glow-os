'use client';

import { useGlowRules } from '@/lib/glow-rules';

export function GlowRulesSettings(){
 const {rules,save,reset}=useGlowRules();
 const update=<K extends keyof typeof rules>(key:K,value:(typeof rules)[K])=>save({...rules,[key]:value});
 return <section style={{maxWidth:980,margin:'0 auto',padding:'36px 28px 90px',fontFamily:'Inter,system-ui,sans-serif',color:'#2a2422'}}>
   <header style={{marginBottom:28}}><p style={{fontSize:11,letterSpacing:'.12em',textTransform:'uppercase',color:'#8a7f7a'}}>My Glow</p><h1 style={{fontFamily:'Georgia,serif',fontSize:42,fontWeight:400,margin:'6px 0'}}>Personal Glow Rules</h1><p style={{maxWidth:650,color:'#736a66',lineHeight:1.6}}>These are confirmed preferences that control how the living dashboard behaves. They are separate from Glow recommendations and from source-backed facts.</p></header>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12}}>
    {[
      ['Daily priorities','Maximum major priorities visible','maxPriorities',String(rules.maxPriorities),'fixed'],
      ['Get ready','Default preparation minutes','defaultGetReadyMinutes',String(rules.defaultGetReadyMinutes),'number'],
      ['Interview prep','Preparation minutes for interviews','interviewGetReadyMinutes',String(rules.interviewGetReadyMinutes),'number'],
      ['Night routine','Preferred start time','nightRoutineTime',rules.nightRoutineTime,'time'],
      ['Business-hours tasks','Prioritize calls/admin before','businessHoursCutoff',rules.businessHoursCutoff,'time'],
    ].map(([title,desc,key,value,type])=><label key={key} style={{background:'#fff',border:'1px solid #ebe4e0',borderRadius:16,padding:16,display:'grid',gap:7}}>
      <strong style={{fontSize:13}}>{title}</strong><span style={{fontSize:11,color:'#7a716d'}}>{desc}</span>
      {type==='fixed'?<input value={value} disabled style={{height:40,border:'1px solid #eee7e3',borderRadius:10,padding:'0 10px',background:'#f8f5f2'}}/>:<input type={type} value={value} onChange={e=>update(key as keyof typeof rules,(type==='number'?Number(e.target.value):e.target.value) as never)} style={{height:40,border:'1px solid #ddd4cf',borderRadius:10,padding:'0 10px',background:'#fff'}}/>}
    </label>)}
    <label style={{background:'#fff',border:'1px solid #ebe4e0',borderRadius:16,padding:16,display:'grid',gap:7}}><strong style={{fontSize:13}}>Workout preference</strong><span style={{fontSize:11,color:'#7a716d'}}>When Glow looks for a workout window</span><select value={rules.preferredWorkoutWindow} onChange={e=>update('preferredWorkoutWindow',e.target.value as typeof rules.preferredWorkoutWindow)} style={{height:40,border:'1px solid #ddd4cf',borderRadius:10,padding:'0 10px'}}><option value="evening">Evening when possible</option><option value="morning">Morning when possible</option><option value="flexible">Flexible</option></select></label>
    <label style={{background:'#fff',border:'1px solid #ebe4e0',borderRadius:16,padding:16,display:'grid',gap:7}}><strong style={{fontSize:13}}>Dashboard density</strong><span style={{fontSize:11,color:'#7a716d'}}>How much Glow shows at once</span><select value={rules.dashboardDensity} onChange={e=>update('dashboardDensity',e.target.value as typeof rules.dashboardDensity)} style={{height:40,border:'1px solid #ddd4cf',borderRadius:10,padding:'0 10px'}}><option value="calm">Calm</option><option value="balanced">Balanced</option><option value="dense">Dense</option></select></label>
    <label style={{background:'#fff',border:'1px solid #ebe4e0',borderRadius:16,padding:16,display:'grid',gap:7}}><strong style={{fontSize:13}}>Notifications</strong><span style={{fontSize:11,color:'#7a716d'}}>How aggressively Glow interrupts</span><select value={rules.notificationSensitivity} onChange={e=>update('notificationSensitivity',e.target.value as typeof rules.notificationSensitivity)} style={{height:40,border:'1px solid #ddd4cf',borderRadius:10,padding:'0 10px'}}><option value="essential">Essential only</option><option value="balanced">Balanced</option><option value="proactive">Proactive</option></select></label>
   </div>
   <section style={{marginTop:18,background:'#fffaf8',border:'1px solid #eee0da',borderRadius:16,padding:16}}><strong style={{fontSize:12}}>Locked daily rhythm</strong><p style={{fontSize:12,color:'#706763',marginBottom:0}}>Morning 5–10 · Between 10–4 · Evening 4–8:30 · Night 8:30–11</p></section>
   <button type="button" onClick={reset} style={{marginTop:18,border:'1px solid #d9cfca',background:'#fff',borderRadius:999,padding:'10px 16px',cursor:'pointer'}}>Reset to my Glow defaults</button>
 </section>
}
