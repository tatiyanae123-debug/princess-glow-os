'use client';

import { Check, ChevronRight, Dumbbell, Droplets, Heart, Home, Leaf, Plus, Search, Sparkles, Sun, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { HabitForm } from '@/components/habits/habit-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { logHabitAction } from '@/app/actions/habits';
import { buildHabitInsights } from '@/lib/habits/insights';
import type { Habit, HabitLog } from '@/lib/types';
import styles from './habits-reference.module.css';

type Mode = 'overview' | 'daily';
type Lens = 'all' | 'daily' | 'weekly' | 'monthly' | 'custom';
type GroupName = 'Health & Wellness' | 'Beauty & Self Care' | 'Productivity & Focus' | 'Home & Organization' | 'Mindset & Growth';

const groupOrder: GroupName[] = ['Health & Wellness','Beauty & Self Care','Productivity & Focus','Home & Organization','Mindset & Growth'];
const groupTone: Record<GroupName,string> = {
  'Health & Wellness':'aqua','Beauty & Self Care':'rose','Productivity & Focus':'violet','Home & Organization':'amber','Mindset & Growth':'mint',
};

function todayKey(){return new Date().toISOString().slice(0,10);}
function travel(path:string){document.dispatchEvent(new CustomEvent('glow:navigate',{detail:{path}}));}
function titleCase(value:string){return value.replace(/_/g,' ').replace(/\b\w/g,(c)=>c.toUpperCase());}
function inferGroup(habit:Habit):GroupName{
  const text=`${habit.name} ${habit.description??''}`.toLowerCase();
  if(/skin|beauty|makeup|hair|gua|facial|shower|body care/.test(text)) return 'Beauty & Self Care';
  if(/tidy|clean|laundry|room|home|grocery|organize|reset/.test(text)) return 'Home & Organization';
  if(/plan|task|focus|work|phone|review|email|study|project/.test(text)) return 'Productivity & Focus';
  if(/read|journal|affirm|meditat|mind|learn|gratitude|reflect/.test(text)) return 'Mindset & Growth';
  return 'Health & Wellness';
}
function habitGlyph(habit:Habit){
  const text=habit.name.toLowerCase();
  if(/water|hydrate/.test(text)) return <Droplets size={17}/>;
  if(/workout|fitness|gym|move/.test(text)) return <Dumbbell size={17}/>;
  if(/home|room|tidy|laundry|clean/.test(text)) return <Home size={17}/>;
  if(/skin|beauty|hair|makeup/.test(text)) return <Sparkles size={17}/>;
  if(/money|save|budget/.test(text)) return <WalletCards size={17}/>;
  if(/meditat|journal|affirm|read/.test(text)) return <Leaf size={17}/>;
  return <Heart size={17}/>;
}

export function HabitsReference({initialHabits,initialLogs,mode}:{initialHabits:Habit[];initialLogs:HabitLog[];mode:Mode}){
  const [habits,setHabits]=useState(initialHabits);
  const [logs,setLogs]=useState(initialLogs);
  const [lens,setLens]=useState<Lens>(mode==='daily'?'daily':'all');
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState<string|null>(null);
  const [dialogHabit,setDialogHabit]=useState<Habit|'new'|null>(null);
  const log=useServerAction(logHabitAction);
  const insights=useMemo(()=>buildHabitInsights(habits,logs),[habits,logs]);
  const today=todayKey();
  const loggedToday=useMemo(()=>new Set(logs.filter((item)=>item.loggedDate===today&&item.count>0).map((item)=>item.habitId)),[logs,today]);
  const completed=habits.filter((habit)=>loggedToday.has(habit.id)).length;
  const todayPercent=habits.length?Math.round(completed/habits.length*100):0;
  const average=habits.length?Math.round([...insights.values()].reduce((sum,item)=>sum+item.completionRate,0)/habits.length):0;
  const streaks=useMemo(()=>[...habits].sort((a,b)=>(insights.get(b.id)?.currentStreak??0)-(insights.get(a.id)?.currentStreak??0)).slice(0,4),[habits,insights]);

  const filtered=useMemo(()=>habits.filter((habit)=>{
    const matchesQuery=!query||`${habit.name} ${habit.description??''}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory=!category||inferGroup(habit)===category;
    const matchesLens=lens==='all'||lens==='monthly'||(lens==='daily'&&['daily','weekdays','weekends'].includes(habit.frequency))||(lens==='weekly'&&habit.frequency==='weekly')||(lens==='custom'&&habit.frequency==='custom');
    return matchesQuery&&matchesCategory&&matchesLens;
  }),[habits,query,category,lens]);

  const groups=useMemo(()=>groupOrder.map((name)=>({name,habits:filtered.filter((habit)=>inferGroup(habit)===name)})).filter((group)=>group.habits.length),[filtered]);

  const weekBars=useMemo(()=>{
    const days=Array.from({length:7},(_,index)=>{const date=new Date();date.setUTCDate(date.getUTCDate()-(6-index));return date.toISOString().slice(0,10);});
    return days.map((day)=>{const count=new Set(logs.filter((item)=>item.loggedDate===day&&item.count>0).map((item)=>item.habitId)).size;return habits.length?Math.round(count/habits.length*100):0;});
  },[logs,habits.length]);

  function handleLog(habit:Habit){
    if(loggedToday.has(habit.id)) return;
    log.run({habitId:habit.id,loggedDate:today,count:1},(saved)=>setLogs((current)=>current.some((item)=>item.id===saved.id)?current:[saved,...current]));
  }
  function handleSaved(habit:Habit){
    setHabits((current)=>current.some((item)=>item.id===habit.id)?current.map((item)=>item.id===habit.id?habit:item):[habit,...current]);
    setDialogHabit(null);
  }
  function openGlow(){document.dispatchEvent(new CustomEvent('glow:open'));}

  if(mode==='daily') return <DailyManager/>;
  return <Overview/>;

  function Overview(){
    return <main className={styles.habitsWorld} data-mode="overview" aria-label="Habits overview">
      <div className={styles.windowLight} aria-hidden="true"/><div className={styles.liquidA} aria-hidden="true"/><div className={styles.liquidB} aria-hidden="true"/>
      <header className={styles.overviewHero}>
        <div><p className={styles.eyebrow}>PLAN · HABITS</p><h1>Habits</h1><p>Consistency feels different here.</p></div>
        <div className={styles.heroTools}>
          <label className={styles.habitSearch}><Search size={16}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search habits…"/></label>
          <button type="button" onClick={()=>setDialogHabit('new')} className={styles.addPearl} aria-label="Add habit"><Plus size={25}/></button>
        </div>
      </header>

      <div className={styles.lenses} aria-label="Habit time lenses">{(['all','daily','weekly','monthly','custom'] as Lens[]).map((item)=><button key={item} type="button" className={lens===item?styles.lensActive:''} onClick={()=>setLens(item)}>{titleCase(item)}</button>)}</div>

      <section className={styles.patternHero}>
        <div className={styles.consistencyRing} style={{'--progress':`${average}%`} as React.CSSProperties}><strong>{average}%</strong><span>Habit Consistency<br/>This Week</span></div>
        <div className={styles.patternCopy}><em>Your patterns are taking shape.</em><p><i className={styles.dotA}/>{completed} / {habits.length} habits today</p><p><i className={styles.dotB}/>{habits.filter((h)=>h.frequency==='weekly').length} weekly habits</p><p><i className={styles.dotC}/>{habits.filter((h)=>h.frequency==='custom').length} custom rhythms</p></div>
        <div className={styles.patternMatter} aria-hidden="true"/>
        <blockquote>Discipline<br/>feels like freedom<br/>in the future.</blockquote>
      </section>

      <div className={styles.overviewGrid}>
        <section className={styles.todayList}>
          <div className={styles.sectionHead}><h2>Today&apos;s Habits</h2><span>{completed} / {habits.length} complete</span></div>
          {filtered.slice(0,8).map((habit)=><button key={habit.id} type="button" onClick={()=>loggedToday.has(habit.id)?setDialogHabit(habit):handleLog(habit)} className={styles.habitRow}>
            <span className={`${styles.check} ${loggedToday.has(habit.id)?styles.checked:''}`}>{loggedToday.has(habit.id)?<Check size={14}/>:null}</span>
            <span className={styles.rowGlyph}>{habitGlyph(habit)}</span><b>{habit.name}</b><small>{titleCase(habit.frequency)}</small><em>{inferGroup(habit).replace(' & Wellness','').replace(' & Self Care','').replace(' & Focus','').replace(' & Organization','').replace(' & Growth','')}</em><ChevronRight size={15}/>
          </button>)}
          {!filtered.length?<div className={styles.emptyState}>No habits match this lens. <button type="button" onClick={()=>{setQuery('');setCategory(null);setLens('all')}}>Show all</button></div>:null}
          <button type="button" onClick={()=>setDialogHabit('new')} className={styles.addHabitButton}><Plus size={15}/> Add Habit</button>
        </section>

        <section className={styles.streakCard}><div className={styles.sectionHead}><h2>Current Streaks</h2><button type="button" onClick={()=>travel('/habits/daily')}>View Daily</button></div><div className={styles.streakGrid}>{streaks.length?streaks.map((habit,index)=><button key={habit.id} type="button" onClick={()=>setDialogHabit(habit)}><span className={styles.streakOrb} data-index={index}/><strong>{insights.get(habit.id)?.currentStreak??0}</strong><small>{habit.name}</small></button>):<p className={styles.emptyCopy}>Log a habit to begin seeing streaks.</p>}</div></section>
        <blockquote className={styles.progressImage}>Progress<br/>over perfection.</blockquote>

        <section className={styles.insightsCard}><div className={styles.sectionHead}><h2>Habit Insights</h2><span>This Week</span></div><div className={styles.barChart}>{weekBars.map((value,index)=><div key={index}><i style={{height:`${Math.max(8,value)}%`}}/><span>{['M','T','W','T','F','S','S'][index]}</span></div>)}</div><div className={styles.insightPearl}><Sun size={18}/><span>{average>=70?'Your rhythm is holding.':'Your pattern is still forming.'}</span></div></section>

        <section className={styles.quickAdd}><h2>Quick Add</h2><button type="button" onClick={()=>setDialogHabit('new')}><Plus/>Custom Habit</button><button type="button" onClick={openGlow}><Sparkles/>Ask Shakti for a habit</button><button type="button" onClick={()=>travel('/routines')}><Plus/>From Routine</button></section>
      </div>

      <section className={styles.categoryPortals} aria-label="Habit categories">
        {[
          ['Health',Heart,'Health & Wellness'],['Beauty',Sparkles,'Beauty & Self Care'],['Fitness',Dumbbell,'Health & Wellness'],['Mindset',Leaf,'Mindset & Growth'],['Nutrition',Droplets,'Health & Wellness'],['Home',Home,'Home & Organization'],['Productivity',Sun,'Productivity & Focus'],['Finances',WalletCards,'Productivity & Focus'],
        ].map(([label,Icon,group])=>{const Glyph=Icon as typeof Heart;return <button key={label as string} type="button" onClick={()=>setCategory(group as string)}><span><Glyph size={22}/></span><b>{label as string}</b><ChevronRight size={14}/></button>})}
      </section>
      <button type="button" className={styles.dailyDive} onClick={()=>travel('/habits/daily')}>Live today&apos;s pattern <ChevronRight size={16}/></button>
      <Dialog open={dialogHabit!==null} onClose={()=>setDialogHabit(null)} title={dialogHabit==='new'?'Add habit':'Edit habit'}><HabitForm habit={dialogHabit==='new'?null:dialogHabit} onSaved={handleSaved} onCancel={()=>setDialogHabit(null)}/></Dialog>
    </main>;
  }

  function DailyManager(){
    return <main className={styles.habitsWorld} data-mode="daily" aria-label="Daily habit manager">
      <div className={styles.windowLight} aria-hidden="true"/><div className={styles.dailyMatter} aria-hidden="true"/>
      <header className={styles.dailyHero}><p className={styles.eyebrow}>PLAN · HABITS · DAILY</p><h1>Habits</h1><p>Small steps. A more aligned you.</p></header>
      <div className={styles.dailyLenses}>{(['daily','weekly','monthly','custom'] as Lens[]).map((item)=><button key={item} type="button" className={lens===item?styles.lensActive:''} onClick={()=>setLens(item)}>{titleCase(item)}</button>)}</div>
      <div className={styles.weekPearls}>{Array.from({length:7},(_,index)=>{const date=new Date();date.setDate(date.getDate()-date.getDay()+index);const isToday=date.toDateString()===new Date().toDateString();return <button key={index} type="button" className={isToday?styles.todayPearl:''}><span/><b>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][index]}</b><small>{date.getMonth()+1}/{date.getDate()}</small></button>})}</div>

      <div className={styles.dailyLayout}>
        <section className={styles.groupColumn}>{groups.length?groups.map((group)=><article key={group.name} className={styles.habitGroup} data-tone={groupTone[group.name]}><div className={styles.groupHead}><span className={styles.groupOrb}>{group.name==='Health & Wellness'?<Heart/>:group.name==='Beauty & Self Care'?<Sparkles/>:group.name==='Productivity & Focus'?<Sun/>:group.name==='Home & Organization'?<Home/>:<Leaf/>}</span><h2>{group.name}</h2><strong>{group.habits.filter((habit)=>loggedToday.has(habit.id)).length}/{group.habits.length} complete</strong><button type="button" onClick={()=>setCategory(group.name)} aria-label={`Focus ${group.name}`}><ChevronRight/></button></div><div className={styles.groupRows}>{group.habits.map((habit)=><button key={habit.id} type="button" onClick={()=>loggedToday.has(habit.id)?setDialogHabit(habit):handleLog(habit)}><span className={`${styles.check} ${loggedToday.has(habit.id)?styles.checked:''}`}>{loggedToday.has(habit.id)?<Check/>:null}</span><b>{habit.name}</b><small>{titleCase(habit.frequency)}</small></button>)}</div><button type="button" className={styles.groupAdd} onClick={()=>setDialogHabit('new')} aria-label={`Add habit to ${group.name}`}><Plus/></button></article>):<section className={styles.emptyGarden}><h2>Your habit garden is ready.</h2><p>Add one small rhythm you want Glow to help protect.</p><button type="button" onClick={()=>setDialogHabit('new')}><Plus/> Add first habit</button></section>}</section>

        <aside className={styles.dailyRail}>
          <section className={styles.streakFocus}><span>🔥</span><h2>Streak</h2><strong>{streaks[0]?insights.get(streaks[0].id)?.currentStreak??0:0}</strong><small>days</small><p>{streaks[0]?.name??'Your first streak starts with one check-in.'}</p></section>
          <blockquote className={styles.railQuote}>Progress<br/>looks good.</blockquote>
          <section className={styles.todayProgress}><h2>Today&apos;s Progress</h2><div className={styles.progressRing} style={{'--progress':`${todayPercent}%`} as React.CSSProperties}><strong>{completed} / {habits.length}</strong><span>{todayPercent}%</span></div>{groupOrder.map((group)=>{const items=habits.filter((habit)=>inferGroup(habit)===group);if(!items.length)return null;const done=items.filter((habit)=>loggedToday.has(habit.id)).length;return <div key={group}><span>{group.split(' & ')[0]}</span><b>{done}/{items.length}</b><i><em style={{width:`${Math.round(done/items.length*100)}%`}}/></i></div>})}</section>
          <section className={styles.weekMini}><h2>This Week</h2><div>{weekBars.map((value,index)=><i key={index} style={{height:`${Math.max(8,value)}%`}}><span>{['M','T','W','T','F','S','S'][index]}</span></i>)}</div></section>
        </aside>
      </div>

      <div className={styles.dailyTools}><section><h2>Habit Tools</h2><button type="button" onClick={()=>setDialogHabit('new')}><Plus/>Add Habit</button><button type="button" onClick={()=>travel('/routines')}><Sparkles/>Routines</button><button type="button" onClick={()=>travel('/habits')}><ChevronRight/>Overview</button></section><section><h2>Quick Add</h2><button type="button" onClick={()=>setDialogHabit('new')}><Plus/> Add a habit…</button></section><blockquote>Consistency doesn&apos;t change you overnight.<br/><em>It changes the shape of your days.</em></blockquote></div>
      <Dialog open={dialogHabit!==null} onClose={()=>setDialogHabit(null)} title={dialogHabit==='new'?'Add habit':'Edit habit'}><HabitForm habit={dialogHabit==='new'?null:dialogHabit} onSaved={handleSaved} onCancel={()=>setDialogHabit(null)}/></Dialog>
    </main>;
  }
}
