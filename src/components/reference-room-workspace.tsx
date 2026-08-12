'use client';

import { usePathname } from 'next/navigation';
import { Bell, Check, ChevronRight, Circle, Droplets, Heart, Leaf, Mic2, Plus, Search, Sparkles, Star } from 'lucide-react';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { blueprintForRoom, type ReferenceRoomBlueprint } from '@/lib/design/all-reference-room-blueprints';

function roomFor(pathname:string){
  if(pathname.startsWith('/beauty/lab')) return 'beauty-lab';
  if(pathname.startsWith('/finance/brain')) return 'financial-brain';
  if(pathname.startsWith('/tasks')) return 'tasks';
  if(pathname.startsWith('/calendar')) return 'calendar';
  if(pathname.startsWith('/planning')) return 'planning';
  if(pathname.startsWith('/routines')) return 'routines';
  if(pathname.startsWith('/habits')) return 'habits';
  if(pathname.startsWith('/fitness')) return 'fitness';
  if(pathname.startsWith('/wellness')) return 'wellness';
  if(pathname.startsWith('/food')) return 'food';
  if(pathname.startsWith('/beauty')) return 'beauty';
  if(pathname.startsWith('/hair')) return 'hair';
  if(pathname.startsWith('/finance')) return 'finance';
  if(pathname.startsWith('/goals')) return 'goals';
  if(pathname.startsWith('/projects')) return 'projects';
  if(pathname.startsWith('/briefings')) return 'briefings';
  if(pathname.startsWith('/inbox')) return 'inbox';
  if(pathname.startsWith('/notes')) return 'notes';
  if(pathname.startsWith('/settings')) return 'settings';
  if(pathname.startsWith('/world')) return 'world';
  if(pathname.startsWith('/brain')||pathname.startsWith('/concierge')||pathname.startsWith('/observations')||pathname.startsWith('/memory')||pathname.startsWith('/timeline')||pathname.startsWith('/intake')||pathname.startsWith('/rules')) return 'brain';
  if(pathname.startsWith('/today')) return 'dashboard';
  return 'dashboard';
}

const viewAction=(label:string)=>`view:${label.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`;
const actionFor=(label:string,room:string)=>{
  const v=label.toLowerCase();
  if(v.includes('task')) return v.includes('add')||v.includes('new')?'quick:task':'navigate:/tasks';
  if(v.includes('event')||v.includes('appointment')||v.includes('calendar')) return v.includes('add')||v.includes('new')?'quick:event':'navigate:/calendar';
  if(v.includes('habit')) return v.includes('add')||v.includes('new')?'quick:habit':'navigate:/habits';
  if(v.includes('routine')||v.includes('ritual')||v.includes('reset')) return v.includes('create')?'quick:routine':'navigate:/routines';
  if(v.includes('goal')) return v.includes('add')||v.includes('new')?'quick:goal':'navigate:/goals';
  if(v.includes('note')) return v.includes('new')||v.includes('add')?'quick:note':'navigate:/notes';
  if(v.includes('meal')||v.includes('grocer')||v.includes('pantry')||v.includes('recipe')||v.includes('nutrition')) return 'navigate:/food';
  if(v.includes('hair')||v.includes('wash')) return 'navigate:/hair';
  if(v.includes('beauty lab')||v.includes('ingredient')||v.includes('product')) return room==='beauty'?'navigate:/beauty/lab':'vault';
  if(v.includes('beauty')||v.includes('treatment')) return 'navigate:/beauty';
  if(v.includes('finance')||v.includes('budget')||v.includes('transaction')) return 'navigate:/finance';
  if(v.includes('forecast')||v.includes('scenario')||v.includes('purchase')) return 'navigate:/finance/brain';
  if(v.includes('project')) return 'navigate:/projects';
  if(v.includes('brief')) return 'navigate:/briefings';
  if(v.includes('ask glow')||v.includes('coach')||v.includes('focus')) return 'voice';
  return 'vault';
};

function PageHeader({spec,room}:{spec:ReferenceRoomBlueprint;room:string}){
  return <header className="room-page-header">
    <div>
      <p className="room-eyebrow">{room==='dashboard'?'TODAY':room==='beauty'?'BEAUTY':room==='hair'?'HAIR':room==='wellness'?'HEALTH & CARE':room==='finance'||room==='financial-brain'?'MONEY & GROWTH':room==='brain'||room==='briefings'||room==='inbox'?'GLOW':room==='world'?'LIFE WORLD':'PLAN'}</p>
      <h1>{spec.title}</h1>
      {spec.script?<p className="room-subtitle">{spec.script}</p>:null}
    </div>
    {spec.tabs.length?<nav className="room-tabs" aria-label={`${spec.title} views`}>{spec.tabs.map((tab,i)=><button type="button" key={tab} data-ref-action={viewAction(tab)} data-active={i===0?'true':'false'}>{tab}</button>)}</nav>:null}
  </header>;
}

function Panel({title,children,action}:{title?:string;children:React.ReactNode;action?:string}){
  return <section className="ref-card room-panel">{title?<div className="room-panel-head"><p className="room-panel-title">{title}</p>{action?<button type="button" data-ref-action={action}>View all <ChevronRight size={11}/></button>:null}</div>:null}{children}</section>;
}

function EditorialImage({slot,label,children,className=''}:{slot:string;label:string;children?:React.ReactNode;className?:string}){
  return <EditableRoomImage slot={slot} label={label} className={`room-photo ${className}`}>{children}</EditableRoomImage>;
}

function ProgressDots({done=5,total=7,color='#BF6578'}:{done?:number;total?:number;color?:string}){
  return <div className="room-dots">{Array.from({length:total}).map((_,i)=><span key={i} style={i<done?{background:color,borderColor:color}:undefined}/>)}</div>;
}

function MetricRow({items}:{items:[string,string][]}){
  return <div className="metric-row">{items.map(([label,value])=><div key={label} className="metric-cell"><p>{label}</p><strong>{value}</strong></div>)}</div>;
}

function Dashboard({spec}:{spec:ReferenceRoomBlueprint}){
  const cards=[['Top Priority','Finish Glow OS brand deck'],['Next Appointment','Hair Appointment'],["Today’s Routine",'Morning Glow Ritual'],['Important Alert','Bill due tomorrow']];
  return <div className="room-grid dashboard-grid">
    <section className="dashboard-main">
      <div className="dashboard-greeting"><h2>Good morning, <em>Tatiyana</em></h2><p>Here’s what matters today.</p></div>
      <p className="room-section-label">TODAY AT A GLANCE</p>
      <div className="at-glance-grid">{cards.map(([label,value],i)=><Panel key={label}><p className="room-mini-label">{label}</p><h3>{value}</h3><p className="room-muted">{i===0?'● High':i===1?'2:30 PM – 3:30 PM':i===2?'🌿 8 steps':'▲ Chase Sapphire'}</p></Panel>)}</div>
      <div className="dashboard-content-grid">
        <Panel title="MORNING BRIEF" action="navigate:/briefings"><blockquote>You’re in a powerful building season.</blockquote><p className="room-muted">Focus on deep work, nourish your body, and protect your energy. You’ve got this.</p><button type="button" data-ref-action="navigate:/briefings" className="room-primary-button">View Full Brief</button></Panel>
        <Panel title="TODAY’S SCHEDULE" action="navigate:/calendar"><ul className="clean-list"><li><span>9:00 AM</span>Deep Work Session</li><li><span>11:30 AM</span>Team Check-In</li><li><span>2:30 PM</span>Hair Appointment</li><li><span>4:00 PM</span>Content Planning</li></ul></Panel>
        <Panel title="TOP TASKS" action="navigate:/tasks"><ul className="check-list"><li><Circle size={11}/>Finish Glow OS brand deck</li><li><Circle size={11}/>Review campaign strategy</li><li><Check size={11}/>Workout – Glute Focus</li><li><Circle size={11}/>Reply to client email</li></ul></Panel>
      </div>
      <div className="dashboard-stat-strip"><div><p>WELLNESS</p><strong>Energy</strong><span>High</span></div><div><p>STEPS</p><strong>6,842</strong></div><div><p>HYDRATION</p><strong>6 / 8</strong><span>glasses</span></div><div><p>NUTRITION</p><strong>1,350</strong><span>cal / 2,000</span></div><div><p>SLEEP</p><strong>7h 32m</strong><span>Good</span></div><EditorialImage slot="dashboard:quote" label="Dashboard quote image" className="dashboard-quote"><div className="quote-overlay">Discipline today,<br/>freedom tomorrow.</div></EditorialImage></div>
    </section>
  </div>;
}

function Tasks(){
  const tasks=['Finish Glow OS brand deck','Review campaign strategy','Send proposal to client'];
  return <div className="tasks-layout"><section className="tasks-list">{tasks.map((task,i)=><button type="button" data-ref-action="vault" key={task} className="task-row"><Circle size={14}/><span><strong>{task}</strong><small>{i===0?'High Priority':i===1?'Due 10:00 AM':'Due 12:00 PM'}</small></span></button>)}<button type="button" data-ref-action="quick:task" className="text-action"><Plus size={13}/>Add new task</button></section><aside className="tasks-rail"><Panel title="FOCUS MODE"><p className="room-muted">See less. Do more.</p><button type="button" data-ref-action="voice" className="room-primary-button wide">Enter Focus Mode</button></Panel><Panel title="TASKS COMPLETED"><div className="progress-ring"><span>8<small>of 14</small></span></div><p className="progress-percent">57%</p><button type="button" data-ref-action="navigate:/tasks?view=insights" className="text-action">View analytics</button></Panel></aside></div>;
}

function Calendar(){
  const days=['MON 12','TUE 13','WED 14','THU 15','FRI 16','SAT 17','SUN 18'];
  const events=[{d:0,t:'Deep Work',top:58,h:58},{d:1,t:'Team Check-In',top:70,h:50},{d:2,t:'Hair Appointment',top:230,h:54},{d:3,t:'Content Day',top:58,h:130},{d:5,t:'Photoshoot',top:205,h:90},{d:6,t:'Pilates',top:85,h:42}];
  return <div className="calendar-shell"><div className="calendar-toolbar"><button type="button" data-ref-action="view:today">Today</button><span>‹</span><span>›</span><strong>May 12 – 18, 2025</strong><div className="calendar-mode"><button type="button" data-ref-action="view:day">Day</button><button type="button" data-ref-action="view:week" data-active="true">Week</button><button type="button" data-ref-action="view:month">Month</button></div></div><div className="calendar-body"><div className="week-grid"><div className="week-days">{days.map(day=><span key={day}>{day}</span>)}</div><div className="week-canvas">{events.map((event,i)=><button type="button" data-ref-action="vault" className="calendar-event" key={i} style={{left:`calc(${event.d} * 14.2857% + 3px)`,top:event.top,height:event.h,width:'calc(14.2857% - 6px)'}}>{event.t}</button>)}</div></div><aside className="calendar-side"><Panel title="MAY 2025"><div className="mini-calendar">{Array.from({length:35}).map((_,i)=><span key={i} className={i===16?'active':''}>{i<3?'':i-2}</span>)}</div></Panel><Panel title="UP NEXT"><p><strong>Hair Appointment</strong><br/><span className="room-muted">Today 2:30 PM</span></p><p><strong>Client Call</strong><br/><span className="room-muted">Fri, May 16 11:00 AM</span></p><button type="button" data-ref-action="quick:event" className="outlined-button"><Plus size={12}/>New Event</button></Panel></aside></div></div>;
}

function Planning(){
  return <div className="planning-grid"><Panel title="TOP THREE"><ol className="number-list"><li>Launch Glow OS brand deck</li><li>Hair appointment</li><li>Deep work on Terrain Design</li></ol><button type="button" data-ref-action="vault" className="text-action">Edit Top Three</button></Panel><Panel title="THIS WEEK"><ul className="clean-list compact"><li><span>May 14</span>Brand deck due</li><li><span>May 16</span>Client call</li><li><span>May 17</span>Photo shoot</li></ul><button type="button" data-ref-action="quick:task" className="text-action"><Plus size={12}/>Add item</button></Panel><Panel title="APPOINTMENTS"><ul className="clean-list compact"><li><span>May 14</span>Hair Appointment</li><li><span>May 16</span>Team Call</li><li><span>May 17</span>Pilates Class</li></ul><button type="button" data-ref-action="navigate:/calendar" className="text-action">View calendar</button></Panel><Panel title="DEADLINES"><ul className="plain-lines"><li>Glow OS brand deck <span>May 14</span></li><li>Terrain Design review <span>May 16</span></li></ul></Panel><Panel title="SUNDAY RESET"><ul className="check-list"><li><Circle size={11}/>Plan next week</li><li><Circle size={11}/>Review goals</li><li><Circle size={11}/>Prep meals</li></ul><button type="button" data-ref-action="navigate:/routines?view=reset" className="text-action">Start Reset</button></Panel><EditorialImage slot="planning:quote" label="Planning quote" className="planning-quote"><div className="quote-overlay dark">A well planned week<br/>creates a calm mind<br/>and a beautiful life.</div></EditorialImage></div>;
}

function Routines(){
  const steps=['Hydrate','Movement','Skincare','Meditate','Journal','Plan Day','Affirm'];
  return <div className="routine-layout"><EditorialImage slot="routines:hero" label="Morning ritual image" className="routine-hero"><div className="image-card-copy"><h2>Morning Glow Ritual</h2><p>45 min · 7 steps</p><p>A complete morning ritual to energize your body, focus your mind, and set the tone.</p><button type="button" data-ref-action="navigate:/routines?focus=1" className="room-primary-button">Continue Ritual</button></div></EditorialImage><p className="room-section-label">STEPS</p><div className="routine-steps">{steps.map((step,i)=><button type="button" data-ref-action="vault" key={step} className={i===2?'active':''}><span>{i<2?<Check size={12}/>:<Circle size={12}/>}</span><strong>{step}</strong><small>{i===2?'10 min':'5 min'}</small></button>)}</div><p className="room-section-label">OTHER ROUTINES</p><div className="photo-rail">{['Evening Wind Down','Weekly Reset Ritual','Self Care Sunday'].map((name,i)=><EditorialImage key={name} slot={`routines:other:${i}`} label={name}><button type="button" data-ref-action="vault" className="photo-label">{name}<small>{30+i*15} min</small></button></EditorialImage>)}</div></div>;
}

function Habits(){
  const habits=[['Drink 8 glasses of water',9],['Move my body',6],['Skincare morning',12],['Read 20 pages',3],['No phone first hour',5]] as const;
  return <div className="habit-layout"><EditorialImage slot="habits:garden" label="Habit garden" className="habit-garden"><div className="garden-stats"><p>GARDEN STATS</p><strong>7</strong><span>Active Habits</span><strong>23</strong><span>Total Streaks</span><strong>8</strong><span>Longest Streak (days)</span></div></EditorialImage><p className="room-section-label">TODAY’S HABITS</p><Panel>{habits.map(([habit,streak])=><button type="button" data-ref-action="vault" key={habit} className="habit-row"><Circle size={11}/><span>{habit}</span><ProgressDots done={Math.min(7,Math.ceil(streak/2))}/><small>{streak} day streak</small></button>)}</Panel></div>;
}

function Wellness(){
  const moods=['Amazing','Good','Okay','Low','Struggling'];
  return <div className="wellness-layout"><section><h2>How are you feeling today?</h2><div className="mood-row">{moods.map((m,i)=><button type="button" data-ref-action="vault" key={m} className={i===1?'active':''}><span>☺</span>{m}</button>)}</div><p className="room-section-label">Recommended for you</p><div className="wellness-actions">{[['Move','20 min Pilates'],['Breathe','5 min Meditation'],['Nourish','High-protein lunch'],['Reflect','Journal prompt']].map(([a,b])=><button type="button" data-ref-action="vault" key={a}><Leaf size={14}/><strong>{a}</strong><small>{b}</small></button>)}</div></section><EditorialImage slot="wellness:hero" label="Wellness botanical image" className="wellness-photo"><div className="quote-overlay dark">Small daily choices<br/>create big life shifts.</div></EditorialImage></div>;
}

function Food(){
  const meals=[['Breakfast','Greek yogurt bowl'],['Lunch','Salmon quinoa bowl'],['Dinner','Lemon pasta']];
  return <div className="food-layout"><p className="room-section-label">TODAY’S MEALS</p><div className="meal-grid">{meals.map(([type,name],i)=><Panel key={type}><p className="room-mini-label">{type}</p><EditorialImage slot={`food:${type}`} label={`${type} image`} className="meal-photo"/><strong>{name}</strong><small>{i===0?'8:00 AM':i===1?'12:30 PM':'6:20 PM'}</small><button type="button" data-ref-action="navigate:/food" className="text-action"><Plus size={11}/>Add Meal</button></Panel>)}</div><div className="food-bottom"><Panel title="WEEKLY PREVIEW"><div className="week-meals">{['M','T','W','T','F','S','S'].map((d,i)=><div key={`${d}-${i}`}><span>{d}</span><div className="mini-food-dot"/></div>)}</div></Panel><Panel title="GROCERY LIST"><ul className="check-list compact">{['Avocados','Salmon','Spinach','Blueberries','Quinoa'].map(x=><li key={x}><Circle size={10}/>{x}</li>)}</ul><button type="button" data-ref-action="navigate:/food?view=groceries" className="text-action">View all</button></Panel></div></div>;
}

function Beauty(){
  return <div className="beauty-layout"><p className="room-section-label">TODAY’S BEAUTY</p><div className="beauty-today">{[['AM','Hydrate & Protect','3 steps'],['Tonight','Treat & Repair','4 steps'],['Next Treatment','Hydrafacial','May 20']].map(([a,b,c])=><Panel key={a}><p className="room-mini-label">{a}</p><strong>{b}</strong><small>{c}</small></Panel>)}<EditorialImage slot="beauty:products" label="Beauty products" className="beauty-side-photo"/></div><p className="room-section-label">YOUR ROUTINE</p><div className="beauty-steps">{['Cleanse','Tone','Treat','Moisturize','SPF'].map((s,i)=><button type="button" data-ref-action="vault" key={s} className={i===0?'active':''}><span>{i+1}</span>{s}</button>)}</div><Panel title="BEAUTY CALENDAR"><div className="simple-calendar-line"><span>May 2025</span><span>＋ Week ‹ ›</span></div></Panel></div>;
}

function Hair(){
  return <div className="hair-layout"><section className="hair-main"><h2>Your Hair Right Now</h2><MetricRow items={[["Current Phase","Growth"],["Next Wash","Thursday"],["Current Style","Silk Press"],["Next Treatment","Deep Conditioning"]]}/><p className="room-section-label">Hair Lifecycle</p><div className="lifecycle">{['Rest','Wash','Treat','Style','Refresh'].map((x,i)=><button type="button" data-ref-action="vault" key={x} className={i===2?'active':''}>{x}</button>)}</div><p className="room-section-label">Today’s Plan</p><Panel><div className="hair-plan-row"><span className="avatar-dot"/>Deep Conditioning Treatment<button type="button" data-ref-action="vault" className="room-primary-button">View Plan</button></div></Panel></section><EditorialImage slot="hair:hero" label="Hair studio image" className="hair-photo"><div className="hair-quote">Healthy hair<br/>is a reflection<br/>of consistent<br/>care.</div></EditorialImage></div>;
}

function Finance(){
  const metrics:[string,string][]=[['Income','$8,450'],['Spent','$3,245'],['Saved','$2,890'],['Available','$2,315']];
  return <div className="finance-layout"><p className="room-muted">This Month &nbsp; May 1 – May 31</p><MetricRow items={metrics}/><div className="finance-bottom"><Panel title="TRANSACTIONS"><ul className="plain-lines"><li>Morning Matcha <span>− $6.50</span></li><li>Grocery Store <span>− $84.21</span></li><li>Client Payment <span className="positive">+ $1,200.00</span></li></ul></Panel><Panel title="SPENDING BREAKDOWN"><div className="donut"><span>$3,245<small>Total</small></span></div><ul className="legend"><li>Living 40%</li><li>Food 25%</li><li>Transport 16%</li><li>Shopping 10%</li></ul><button type="button" data-ref-action="navigate:/finance/brain" className="text-action">View full report</button></Panel></div></div>;
}

function Projects(){
  return <div className="projects-layout"><div className="room-panel-head"><p className="room-panel-title">ACTIVE PROJECTS</p><button type="button" data-ref-action="vault" className="outlined-button"><Plus size={11}/>New Project</button></div><div className="project-grid">{[['Glow OS','Brand & Platform','75%'],['Terrain Design','Luxury Home','40%'],['Creative Branding','Client Project','25%']].map(([a,b,c])=><Panel key={a}><strong>{a}</strong><small>{b}</small><div className="progress-bar"><span style={{width:c}}/></div><p>{c}</p></Panel>)}</div><p className="room-section-label">RECENT ACTIVITY</p><div className="activity-grid">{['Brand deck updated','Mood board added','Client feedback'].map(x=><Panel key={x}><strong>{x}</strong><small>2h ago</small></Panel>)}</div></div>;
}

function Glow(){
  return <div className="glow-layout"><div className="ask-glow"><span>Ask Glow anything...</span><Mic2 size={14}/><button type="button" data-ref-action="voice"><Sparkles size={14}/></button></div><div className="suggestion-chips">{['Morning Brief','What should I focus on?','Plan my day','Log a habit'].map(x=><button type="button" data-ref-action={actionFor(x,'brain')} key={x}>{x}</button>)}</div><nav className="inner-tabs">{['Briefings','Insights','Inbox','Memory'].map((x,i)=><button key={x} type="button" data-ref-action={i===0?'navigate:/briefings':i===2?'navigate:/inbox':viewAction(x)} className={i===0?'active':''}>{x}</button>)}</nav><div className="glow-content"><Panel title="Morning Brief"><strong>Good morning, Tatiyana.</strong><p className="room-muted">You have a productive day ahead. Focus on finishing your brand deck, move your body, and hydrate well.</p></Panel><EditorialImage slot="glow:hero" label="Glow editorial image" className="glow-photo"><div className="quote-overlay dark">Glow is here<br/>to simplify,<br/>support, and<br/>elevate your<br/>every day.</div></EditorialImage></div></div>;
}

function BeautyLab(){
  return <div className="lab-layout"><p className="room-section-label">MY SHELVES</p><div className="product-shelf">{['La Mer','The Ordinary','Kérastase','Tatcha'].map((x,i)=><Panel key={x}><EditorialImage slot={`beauty-lab:${i}`} label={`${x} product`} className="product-photo"/><strong>{x}</strong><small>{['Moisturizing Cream','Niacinamide 10%','Elixir Ultime Oil','The Essence'][i]}</small></Panel>)}<button type="button" data-ref-action="vault" className="add-product"><Plus size={20}/><span>Add Product</span></button></div><Panel title="PRODUCT SPOTLIGHT"><div className="spotlight"><EditorialImage slot="beauty-lab:spotlight" label="Product spotlight" className="spotlight-photo"/><div><strong>The Ordinary</strong><p>Niacinamide 10% + Zinc 1%</p><span className="tag">Hydrating</span> <span className="tag">Pure Care</span><p className="room-muted">94 match score</p><button type="button" data-ref-action="vault" className="text-action">View Details</button></div></div></Panel></div>;
}

function Goals(){
  return <div className="goals-layout"><p className="room-section-label">THIS SEASON · 3 PRIORITIES</p><div className="goals-main"> <div className="goal-stack">{[['Build Glow OS into a global brand','75%'],['Travel the world with purpose','40%'],['Financial freedom','60%']].map(([g,p])=><Panel key={g}><strong>{g}</strong><p className="room-muted">Why it matters: create freedom and impact</p><div className="progress-bar"><span style={{width:p}}/></div><small>{p}</small></Panel>)}</div><Panel title="VISION BOARD"><div className="vision-grid">{Array.from({length:4}).map((_,i)=><EditorialImage key={i} slot={`goals:vision:${i}`} label="Vision board image" className="vision-image"/>)}</div><button type="button" data-ref-action="navigate:/goals?view=vision-board" className="text-action">View Board</button></Panel></div><p className="room-section-label">UPCOMING MILESTONES</p><div className="milestone-row">{['Brand deck · May 14','Bali trip · Jun 1','First retreat · Jul 20','Investment goal · Dec 31'].map(x=><span key={x}>{x}</span>)}</div></div>;
}

function FinancialBrain(){
  return <div className="financial-brain-layout"><MetricRow items={[["Net Worth","$142,680"],["Freedom Date","Dec 2031"],["Monthly Surplus","$2,890"],["Financial Health","Great"]]}/><div className="brain-grid"><Panel title="CASH FLOW FORECAST"><div className="line-chart"><svg viewBox="0 0 500 130" preserveAspectRatio="none"><polyline points="0,88 45,73 90,80 135,62 180,71 225,55 270,66 315,49 360,58 405,38 455,45 500,24" fill="none" stroke="#BF6578" strokeWidth="2"/></svg></div><button type="button" data-ref-action="navigate:/finance/brain?view=forecast" className="text-action">Next 6 Months</button></Panel><Panel title="TOP RECOMMENDATION"><strong>Increase HYSA contribution</strong><p className="room-muted">You could earn additional interest by increasing your automatic transfer.</p><button type="button" data-ref-action="voice" className="room-primary-button">Review</button></Panel></div><p className="room-section-label">SCENARIO QUICK VIEW</p><div className="scenario-row">{[['Buy House','72% achievable'],['Quit Job','60% achievable'],['Early Retirement','55% achievable']].map(([a,b])=><Panel key={a}><strong>{a}</strong><small>{b}</small></Panel>)}</div></div>;
}

function Notes(){
  return <div className="notes-layout"><aside className="notes-books"><p className="room-section-label">NOTEBOOKS</p>{['Personal 28','Work 15','Ideas 9','Journal 12','Recipes 6','Travel 4'].map(x=><button type="button" data-ref-action="vault" key={x}>{x}</button>)}<button type="button" data-ref-action="quick:note" className="text-action"><Plus size={11}/>New Notebook</button></aside><section className="recent-notes"><p className="room-section-label">RECENT NOTES</p>{['Doctor questions','Glow OS brand messaging','Bali trip ideas','Weekly reflection','Content ideas'].map((x,i)=><button type="button" data-ref-action="vault" key={x} className={i===0?'active':''}><strong>{x}</strong><small>May {12-i}</small></button>)}</section><Panel title="NOTE PREVIEW"><strong>Doctor questions</strong><ul className="plain-bullets"><li>Bloodwork results</li><li>Hormone levels</li><li>Energy issues</li><li>Supplements</li></ul><p className="room-muted">Updated 1 hr ago</p><button type="button" data-ref-action="vault" className="text-action">Open Note</button></Panel></div>;
}

function Settings(){
  return <div className="settings-layout"><aside className="settings-nav">{['Profile','Appearance','Notifications','Connections','Privacy & Security','Data & Storage','About Glow OS'].map((x,i)=><button type="button" data-ref-action={viewAction(x)} key={x} className={i===0?'active':''}>{x}</button>)}</aside><section className="settings-content"><Panel title="PROFILE"><div className="profile-card"><span className="profile-big">T</span><div><strong>Tatiyana</strong><small>Entrepreneur · Creator · Dreamer</small></div><button type="button" data-ref-action="vault" className="text-action">Edit Profile</button></div></Panel><Panel title="PREFERENCES"><ul className="settings-lines"><li>Language <span>English (US) ›</span></li><li>Time Zone <span>(UTC-5) Eastern Time ›</span></li><li>Date Format <span>May 12, 2025 ›</span></li><li>Start Week On <span>Monday ›</span></li></ul></Panel></section></div>;
}

function Inbox(){
  const rows=['Client feedback received','Hair appointment reminder','Brand deck due tomorrow','New message from Sarah','Planche class booked'];
  return <div className="inbox-layout"><nav className="inner-tabs">{['All','Tasks','Messages','Reminders','System'].map((x,i)=><button type="button" data-ref-action={viewAction(x)} className={i===0?'active':''} key={x}>{x}</button>)}</nav><Panel>{rows.map((x,i)=><button type="button" data-ref-action="vault" key={x} className="inbox-row"><span className={`inbox-icon i${i}`}/><strong>{x}</strong><small>{i<2?'1h ago':i===2?'2h ago':'Yesterday'}</small></button>)}<button type="button" data-ref-action="navigate:/inbox" className="text-action align-right">View all inbox</button></Panel></div>;
}

function Briefings(){
  return <div className="briefings-layout"><nav className="inner-tabs">{['Morning Brief','Night Review','Weekly Brief'].map((x,i)=><button type="button" data-ref-action={viewAction(x)} className={i===0?'active':''} key={x}>{x}</button>)}</nav><div className="brief-card"><div><h2>Good morning, <em>Tatiyana</em> ☀</h2><p>Here are 5 things that matter today.</p><ol><li>Finish Glow OS brand deck</li><li>Hair appointment at 2:30 PM</li><li>Client call at 11:00 AM</li><li>Deep work session at 9:00 AM</li><li>Drink more water today</li></ol><button type="button" data-ref-action="voice" className="room-primary-button">Let’s go</button></div><EditorialImage slot="briefings:hero" label="Morning briefing image" className="brief-image"/></div></div>;
}

function LifeWorld(){
  return <div className="world-layout"><EditorialImage slot="world:hero" label="Life World home" className="world-hero"><div className="world-copy"><h2>Welcome Home,<br/>Tatiyana</h2><p>This is your space to dream, create, and live intentionally.</p><button type="button" data-ref-action="vault" className="room-primary-button">Enter Your World</button></div></EditorialImage><p className="room-section-label">RECENT SPACES</p><div className="world-spaces">{['My Office','Creative Studio','Dream Closet','Vision Room'].map((x,i)=><EditorialImage slot={`world:space:${i}`} label={x} key={x} className="world-space"><button type="button" data-ref-action="vault" className="photo-label">{x}</button></EditorialImage>)}</div></div>;
}

function Generic({spec,room}:{spec:ReferenceRoomBlueprint;room:string}){
  return <div className="generic-layout"><MetricRow items={spec.metrics}/><div className="generic-grid">{spec.primary.map((x,i)=><Panel key={x} title={x}><p className="room-muted">{spec.heroCopy}</p><button type="button" data-ref-action={actionFor(x,room)} className="text-action">Open <ChevronRight size={10}/></button></Panel>)}</div></div>;
}

function RoomBody({room,spec}:{room:string;spec:ReferenceRoomBlueprint}){
  switch(room){
    case 'dashboard':return <Dashboard spec={spec}/>;
    case 'tasks':return <Tasks/>;
    case 'calendar':return <Calendar/>;
    case 'planning':return <Planning/>;
    case 'routines':return <Routines/>;
    case 'habits':return <Habits/>;
    case 'wellness':return <Wellness/>;
    case 'food':return <Food/>;
    case 'beauty':return <Beauty/>;
    case 'beauty-lab':return <BeautyLab/>;
    case 'hair':return <Hair/>;
    case 'finance':return <Finance/>;
    case 'financial-brain':return <FinancialBrain/>;
    case 'projects':return <Projects/>;
    case 'brain':return <Glow/>;
    case 'goals':return <Goals/>;
    case 'notes':return <Notes/>;
    case 'settings':return <Settings/>;
    case 'inbox':return <Inbox/>;
    case 'briefings':return <Briefings/>;
    case 'world':return <LifeWorld/>;
    default:return <Generic spec={spec} room={room}/>;
  }
}

export function ReferenceRoomWorkspace(){
  const pathname=usePathname();
  const room=roomFor(pathname);
  const spec=blueprintForRoom(room);
  return <div className="reference-room pixel-room" data-reference-layout={spec.layout} style={{'--ref-accent':spec.accent,'--ref-soft':spec.soft} as React.CSSProperties}><PageHeader spec={spec} room={room}/><RoomBody room={room} spec={spec}/></div>;
}
