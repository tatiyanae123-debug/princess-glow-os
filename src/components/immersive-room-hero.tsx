'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, CalendarDays, CheckCircle2, CircleDollarSign, Sparkles, Star, WandSparkles } from 'lucide-react';
import { getSystemRoom } from '@/lib/intelligence/system-registry';

const roomArt: Record<string,{script:string;headline:string;note:string;tiles:string[];accent:string;wash:string;motif:string}> = {
  tasks:{script:'the execution desk',headline:'Turn intention into finished actions.',note:'Your day becomes a curated desk of priorities, timing, dependencies and next moves.',tiles:['Top 3','Next action','Waiting on','Someday'],accent:'#b88386',wash:'#f3e2df',motif:'checklist'},
  calendar:{script:'the time gallery',headline:'See the shape of your life in time.',note:'Appointments, routines, meals, beauty, work and recovery become one visual rhythm.',tiles:['Today','This week','Open blocks','Conflicts'],accent:'#8da5ad',wash:'#e7efef',motif:'calendar'},
  planning:{script:'the strategy studio',headline:'Build the week before it builds you.',note:'Today, week, month, quarter and year connect into one editorial planning surface.',tiles:['Today','Week','Month','Quarter'],accent:'#b49b72',wash:'#f0e8d8',motif:'planner'},
  habits:{script:'the growth garden',headline:'Let consistency become something you can see.',note:'Your habits bloom into a living visual garden instead of another scoreboard.',tiles:['Streaks','This week','Strongest','Needs care'],accent:'#879a7d',wash:'#e7ede1',motif:'garden'},
  fitness:{script:'the body studio',headline:'Train for the life you actually have today.',note:'Energy, soreness, time and recovery shape the workout instead of a rigid plan.',tiles:['Workout','Recovery','Steps','Progress'],accent:'#879da8',wash:'#e3eaed',motif:'movement'},
  wellness:{script:'the sanctuary',headline:'Protect your energy before it disappears.',note:'Sleep, hydration, mood, recovery and resets live together in a quiet wellness room.',tiles:['Energy','Hydration','Sleep','Reset'],accent:'#8fa18c',wash:'#e8eee5',motif:'wellness'},
  food:{script:'the nourishment kitchen',headline:'Plan, shop, prep and eat in one flow.',note:'Meals, recipes, groceries, pantry and food intelligence become one connected kitchen.',tiles:['Meal plan','Groceries','Pantry','Use soon'],accent:'#b08b74',wash:'#f1e7dc',motif:'kitchen'},
  beauty:{script:'the vanity room',headline:'Make your beauty routine feel like a ritual.',note:'Today, tonight, maintenance and progress are arranged like a private beauty editorial.',tiles:['AM','PM','Maintenance','Progress'],accent:'#c28f98',wash:'#f3e3e7',motif:'vanity'},
  'beauty-lab':{script:'the product laboratory',headline:'Know exactly what you own and how it behaves.',note:'Ingredients, reactions, expiration, cost and repurchase history become visible at a glance.',tiles:['Shelf','Expiring','Favorites','Reactions'],accent:'#c39c74',wash:'#f1eadf',motif:'lab'},
  hair:{script:'the hair atelier',headline:'See your entire hair cycle, not just wash day.',note:'Styles, products, scalp, ends, heat, growth and maintenance form one visual lifecycle.',tiles:['Current style','Next wash','Products','Growth'],accent:'#aa8c73',wash:'#efe5dc',motif:'hair'},
  finance:{script:'the money room',headline:'Make money feel calm, visible and intentional.',note:'Spending, budgets, bills and savings become a private editorial money journal.',tiles:['Spent','Budget','Upcoming','Savings'],accent:'#7f9c89',wash:'#e5eee8',motif:'money'},
  'financial-brain':{script:'the money intelligence center',headline:'Turn numbers into decisions.',note:'Forecasts, scenarios, subscriptions and purchase choices become understandable next moves.',tiles:['Cash flow','Savings','Scenarios','Signals'],accent:'#769786',wash:'#e3ede7',motif:'forecast'},
  goals:{script:'the dream gallery',headline:'Make the future visible enough to move toward it.',note:'Vision, milestones, habits, projects and next actions stay connected to each goal.',tiles:['On track','Milestones','Next step','Vision'],accent:'#9b8aa9',wash:'#ece6ef',motif:'gallery'},
  projects:{script:'the creative war room',headline:'Move every project toward its next real milestone.',note:'Files, decisions, blockers, tasks and momentum live together like a creative studio wall.',tiles:['Active','Blocked','Next action','Milestones'],accent:'#9e89a6',wash:'#ede6ef',motif:'studio'},
  brain:{script:'the intelligence chamber',headline:'Ask once. Let Glow connect the whole system.',note:'Brain reasons across tasks, calendar, routines, food, goals, memory and everything else.',tiles:['Ask Glow','Build my day','Lighten today','What matters'],accent:'#9c84ad',wash:'#eee7f1',motif:'intelligence'},
  concierge:{script:'the service desk',headline:'Turn intelligence into approved action.',note:'Glow prepares plans, proposals and changes so you do less manual coordination.',tiles:['Prepare','Schedule','Organize','Execute'],accent:'#9c84ad',wash:'#eee7f1',motif:'concierge'},
  observations:{script:'the pattern observatory',headline:'Notice what your life is trying to tell you.',note:'Useful patterns surface with evidence, confidence and one clear action.',tiles:['New','Important','Snoozed','Resolved'],accent:'#bd8a8e',wash:'#f1e3e3',motif:'signals'},
  memory:{script:'the digital archive',headline:'Let Glow remember what matters.',note:'Decisions, lessons, photos, projects and personal context become one searchable private archive.',tiles:['Recent','People','Projects','Lessons'],accent:'#b29978',wash:'#efe8dc',motif:'archive'},
  timeline:{script:'the river of your life',headline:'See your story unfold across time.',note:'Events, projects, achievements, beauty, fitness and memories become a visual life timeline.',tiles:['Today','Year','Milestones','Lifetime'],accent:'#ad8d92',wash:'#efe3e3',motif:'timeline'},
  briefings:{script:'your personal newspaper',headline:'Read the story of what matters today.',note:'Morning, midday, night and weekly intelligence are distilled into an editorial briefing.',tiles:['Morning','Midday','Tonight','Week'],accent:'#b79a72',wash:'#f0e8d9',motif:'newspaper'},
  closet:{script:'the dressing room',headline:'Turn your wardrobe into a living style system.',note:'Outfits, laundry, weather, favorites and cost-per-wear become one visual closet.',tiles:['Today','Favorites','Laundry','Packing'],accent:'#ba8e94',wash:'#f1e3e5',motif:'wardrobe'},
  gmail:{script:'the correspondence desk',headline:'See only the messages that deserve your attention.',note:'Email becomes actions, appointments, projects and follow-ups instead of inbox noise.',tiles:['Reply','Action','Orders','Waiting'],accent:'#8ca3ad',wash:'#e6edef',motif:'mail'},
  world:{script:'my universe',headline:'Walk through your life as connected rooms.',note:'Every Glow OS system becomes a place you can enter instead of another flat software page.',tiles:['Home','Body','Studio','Future'],accent:'#9d907f',wash:'#ece8e1',motif:'world'},
  home:{script:'the home room',headline:'Keep your physical world soft, clear and cared for.',note:'Rooms, resets, supplies and maintenance become one calm household command center.',tiles:['Reset','Supplies','Rooms','Maintenance'],accent:'#9c8b79',wash:'#eee8df',motif:'home'},
  connections:{script:'the digital dock',headline:'See exactly how your world is connected.',note:'Calendar, reminders, Gmail and future services show sync health, permissions and data flow.',tiles:['Connected','Syncing','Attention','Private'],accent:'#829eaa',wash:'#e4ecef',motif:'network'},
  notes:{script:'the thought studio',headline:'Capture first. Organize second.',note:'Notes, ideas and brain dumps can stay expressive while Glow makes them searchable and useful.',tiles:['Brain dump','Ideas','Pinned','Recent'],accent:'#b39876',wash:'#eee6dc',motif:'paper'},
  import:{script:'the intake portal',headline:'Bring your outside world into Glow safely.',note:'Files, screenshots, notes and lists are previewed, classified and routed before anything changes.',tiles:['Preview','Classify','Approve','Undo'],accent:'#879faa',wash:'#e5edf0',motif:'portal'},
  settings:{script:'the control room',headline:'Design Glow OS from inside Glow OS.',note:'Appearance, behavior, privacy, rooms and widgets become customizable without touching code.',tiles:['Appearance','Behavior','Privacy','Rooms'],accent:'#9b8d80',wash:'#ece7e1',motif:'controls'},
};

export function ImmersiveRoomHero(){
  const pathname=usePathname();
  if(pathname==='/dashboard'||pathname==='/') return null;
  const room=getSystemRoom(pathname);
  if(!room) return null;
  const art=roomArt[room.key] ?? {script:room.atmosphere,headline:room.purpose,note:'Everything in this room is connected to the rest of Glow OS.',tiles:room.capabilities.slice(0,4),accent:'#ad8b86',wash:'#f0e5df',motif:'room'};
  return <section className="mb-5 overflow-hidden rounded-[20px] border border-white/70 bg-[#fbf7f3] shadow-[0_20px_60px_rgba(82,60,50,.07)]">
    <div className="grid min-h-[300px] xl:grid-cols-[1.15fr_.85fr]">
      <div className="relative overflow-hidden px-6 py-6 sm:px-8 sm:py-8" style={{background:`linear-gradient(135deg,#fffaf7 0%,${art.wash} 100%)`}}>
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border-[28px] border-white/35"/>
        <div className="absolute bottom-[-70px] left-[40%] h-44 w-44 rounded-full bg-white/30"/>
        <p className="text-[8px] font-bold uppercase tracking-[.22em]" style={{color:art.accent}}>{room.label}</p>
        <p className="glow-hand mt-2 text-[34px] leading-none" style={{color:art.accent}}>{art.script}</p>
        <h1 className="glow-display mt-5 max-w-[720px] text-[34px] leading-[1.03] tracking-[-.03em] text-[#342a27] sm:text-[46px]">{art.headline}</h1>
        <p className="mt-4 max-w-[650px] text-[10px] leading-5 text-[#75645e]">{art.note}</p>
        <div className="mt-7 flex flex-wrap gap-2">{room.connected.slice(0,4).map((key)=><Link key={key} href={key==='financial-brain'?'/finance/brain':key==='beauty-lab'?'/beauty/lab':`/${key}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/55 px-3 py-2 text-[8px] font-medium text-[#685852] backdrop-blur hover:bg-white/85">Open {key.replaceAll('-',' ')}<ArrowUpRight size={9}/></Link>)}</div>
      </div>
      <div className="relative min-h-[270px] overflow-hidden border-t border-white/70 xl:border-l xl:border-t-0" style={{background:`linear-gradient(155deg,${art.wash},#fffaf7)`}}>
        <div className="absolute left-[8%] top-[12%] h-[46%] w-[38%] rotate-[-4deg] rounded-[14px] border border-white/80 bg-white/55 shadow-[0_20px_35px_rgba(90,67,57,.08)]"/>
        <div className="absolute right-[9%] top-[16%] h-[36%] w-[36%] rotate-[5deg] rounded-[50%_45%_48%_42%] border border-white/80 bg-white/45"/>
        <div className="absolute bottom-[12%] left-[24%] h-[35%] w-[50%] rounded-[14px] border border-white/75 bg-white/60 shadow-[0_18px_30px_rgba(90,67,57,.07)]"/>
        <div className="absolute inset-x-6 bottom-6 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">{art.tiles.slice(0,4).map((tile,index)=><div key={tile} className="rounded-[12px] border border-white/80 bg-white/68 px-3 py-3 backdrop-blur"><div className="mb-1 flex items-center gap-1.5" style={{color:art.accent}}>{index===0?<Star size={11}/>:index===1?<CheckCircle2 size={11}/>:index===2?<CalendarDays size={11}/>:<CircleDollarSign size={11}/>}<span className="text-[7px] font-bold uppercase tracking-[.12em]">{String(index+1).padStart(2,'0')}</span></div><p className="glow-display text-[12px] text-[#403431]">{tile}</p></div>)}</div>
        <WandSparkles size={38} className="absolute right-6 top-5 opacity-35" style={{color:art.accent}}/>
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eadfd8] bg-white/55 px-5 py-3">
      <div className="flex items-center gap-2"><Sparkles size={11} style={{color:art.accent}}/><p className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#78645e]">Glow Intelligence</p><span className="text-[8px] text-[#9a8882]">This room should think, adapt and connect instead of behaving like a static page.</span></div>
      <Link href="/brain" className="rounded-full px-4 py-2 text-[8px] font-semibold text-white" style={{background:art.accent}}>Do it for me</Link>
    </div>
  </section>;
}
