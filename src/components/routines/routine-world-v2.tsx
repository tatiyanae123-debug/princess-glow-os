'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Cloud,
  Flame,
  Heart,
  ListChecks,
  MoonStar,
  PackageCheck,
  Play,
  Search,
  Sparkles,
  Star,
  SunMedium,
  TimerReset,
  WandSparkles,
} from 'lucide-react';
import {
  CATEGORIES,
  CATEGORY_BY_ID,
  ENERGY_COPY,
  ROUTINE_BY_ID,
  ROUTINES,
  routineDurationForEnergy,
  routineStepsForEnergy,
  type EnergyMode,
  type RoutineCategory,
  type RoutineObject,
} from './routine-catalog';

const STORAGE = {
  energy: 'glow.routines.energy.v2',
  favorites: 'glow.routines.favorites.v2',
  recent: 'glow.routines.recent.v2',
  completed: 'glow.routines.completed.v2',
};

const glass = 'border border-white/85 bg-[linear-gradient(145deg,rgba(255,255,255,.84),rgba(250,247,244,.58))] shadow-[inset_0_1px_0_rgba(255,255,255,.96),0_18px_52px_rgba(74,58,48,.07)] backdrop-blur-2xl';
const pearl = 'before:pointer-events-none before:absolute before:inset-[1px] before:rounded-[inherit] before:bg-[radial-gradient(circle_at_22%_10%,rgba(255,255,255,.95),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(226,215,255,.22),transparent_25%),radial-gradient(circle_at_40%_92%,rgba(255,220,202,.22),transparent_28%)]';

const artIcon: Record<string, string> = {
  'daily-life':'☀️', planning:'🗒️', habits:'🌱', food:'🥣', wellness:'🪨', fitness:'🏋️', skincare:'🧴', hair:'〰️', makeup:'💄', beauty:'🫧', nails:'💅', brows:'〰', lashes:'〽️', smile:'🦷', fragrance:'🌸', home:'🛏️', digital:'💻', appointments:'🗓️', travel:'🧳', seasonal:'❄️',
};

const categoryToolsets: Record<string, { title: string; items: string[] }[]> = {
  skincare: [
    { title: 'Skincare Goals', items: ['Clearer, brighter skin','Stronger skin barrier','Even tone & texture','Consistent routine','Healthy glow'] },
    { title: 'Quick Links', items: ['Skin Inventory','Product Tracker','Treatment Schedule','Progress Photos','Shop Favorites'] },
    { title: 'Skincare Tools', items: ['Skincare Timer','Routine Builder','Ingredient Checker','Product Library','Skin Journal'] },
  ],
  planning: [
    { title: 'Today’s Planning Focus', items: ['Top 3','Time blocks','One protected focus block','Tomorrow Parking Lot'] },
    { title: 'Review', items: ['Planned vs actual','Capacity','Duration learning','Weekly reflection'] },
  ],
  hair: [
    { title: 'Hair State', items: ['Moisture check','Leave-out status','Style longevity','Next wash / repair'] },
    { title: 'Quick Links', items: ['Hair Inventory','Tool Cleaning','Wig + Extension Care','Progress'] },
  ],
  fitness: [
    { title: 'Today’s Training', items: ['Program day','Warm-up','Main lifts','Recovery'] },
    { title: 'Progress', items: ['Strength','Posture','Measurements','Monthly review'] },
  ],
  food: [
    { title: 'Use First', items: ['Fridge','Freezer','Pantry','Prepared meals'] },
    { title: 'This Week', items: ['Meal plan','Groceries','Meal prep','Low-energy backups'] },
  ],
};

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) as T : fallback; } catch { return fallback; }
}

function writeLocal(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function ObjectPortrait({ category, compact = false, label }: { category: RoutineCategory; compact?: boolean; label?: string }) {
  const symbol = artIcon[category.id] ?? category.art;
  return (
    <div className={`relative isolate flex items-center justify-center overflow-hidden ${compact ? 'h-24' : 'h-32'} rounded-[28px] border border-white/90 bg-[radial-gradient(circle_at_30%_16%,rgba(255,255,255,.98),rgba(255,255,255,.58)_34%,rgba(245,235,229,.55)_72%,rgba(255,255,255,.82))] shadow-[inset_0_0_34px_rgba(255,255,255,.88),0_12px_34px_rgba(85,62,49,.08)]`}>
      <span aria-hidden="true" className="absolute left-[10%] top-[12%] h-5 w-5 rounded-full border border-white/90 bg-white/35 shadow-[inset_0_0_12px_white,0_3px_12px_rgba(218,169,170,.2)]" />
      <span aria-hidden="true" className="absolute right-[9%] top-[22%] h-7 w-7 rounded-full border border-white/85 bg-[radial-gradient(circle_at_35%_25%,white,rgba(236,209,255,.35),rgba(255,205,190,.28))]" />
      <span aria-hidden="true" className="absolute bottom-[10%] left-[22%] h-3 w-3 rounded-full bg-white/65 shadow-[0_0_15px_rgba(173,209,255,.7)]" />
      <div aria-hidden="true" className="absolute inset-[13%] rounded-[46%_54%_43%_57%/55%_42%_58%_45%] border border-white/80 bg-white/16 shadow-[inset_0_0_28px_rgba(255,255,255,.88),0_9px_32px_rgba(125,95,78,.08)]" />
      <span className={`${compact ? 'text-[38px]' : 'text-[48px]'} relative drop-shadow-[0_8px_14px_rgba(79,60,49,.12)]`} aria-hidden="true">{symbol}</span>
      {label ? <span className="absolute bottom-2 left-3 right-3 truncate text-center text-[11px] font-medium text-[#4c403a]/75">{label}</span> : null}
    </div>
  );
}

function EnergySelector({ value, onChange, compact = false }: { value: EnergyMode; onChange: (value: EnergyMode) => void; compact?: boolean }) {
  return (
    <section className={`${glass} rounded-[26px] p-4`} aria-label="Energy mode">
      <div className="mb-3 flex items-center justify-between"><h2 className="glow-display text-[20px] text-[#302927]">Today’s Energy</h2><Sparkles size={15} className="text-[#a69287]" /></div>
      <div className={compact ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
        {(Object.keys(ENERGY_COPY) as EnergyMode[]).map((mode) => {
          const meta = ENERGY_COPY[mode];
          const selected = mode === value;
          return (
            <button key={mode} type="button" onClick={() => onChange(mode)} aria-pressed={selected} className={`group flex min-h-[52px] w-full items-center gap-3 rounded-[17px] border px-3 py-2.5 text-left transition ${selected ? 'border-white bg-white/82 shadow-[0_8px_24px_rgba(86,65,53,.08)]' : 'border-white/65 bg-white/34 hover:bg-white/55'}`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white/56 text-[18px]" style={{ color: meta.accent }}>{meta.symbol}</span>
              <span className="min-w-0 flex-1"><strong className="block text-[13px] font-medium text-[#403733]">{meta.label}</strong><small className="block truncate text-[11px] text-[#81736c]">{meta.helper}</small></span>
              <span className={`h-4 w-4 shrink-0 rounded-full border ${selected ? 'border-[#39322f] bg-[#39322f] shadow-[inset_0_0_0_4px_white]' : 'border-[#bcb0a8]'}`} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CategoryCard({ category, onOpen }: { category: RoutineCategory; onOpen: () => void }) {
  const count = category.routineIds.length;
  return (
    <button type="button" onClick={onOpen} className={`${glass} ${pearl} group relative min-w-0 rounded-[26px] p-3 text-left transition duration-300 hover:-translate-y-1 hover:shadow-[inset_0_1px_0_white,0_22px_58px_rgba(78,58,47,.11)]`}>
      <ObjectPortrait category={category} compact />
      <div className="relative mt-3 flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="text-[14px] font-semibold text-[#332d2a]">{category.title}</h3><p className="mt-0.5 text-[11px] text-[#8a7a72]">{count} routines</p></div><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/85 bg-white/45 text-[#8c7a70] transition group-hover:translate-x-0.5"><ArrowRight size={13}/></span></div>
      <p className="relative mt-2 text-[11px] leading-5 text-[#70635d]">{category.subtitle}</p>
    </button>
  );
}

function FilterBar({ query, setQuery, time, setTime, frequency, setFrequency, situation, setSituation }: { query: string; setQuery: (v:string)=>void; time:string; setTime:(v:string)=>void; frequency:string; setFrequency:(v:string)=>void; situation:string; setSituation:(v:string)=>void }) {
  const selectClass = 'h-10 rounded-full border border-white/90 bg-white/52 px-3 text-[12px] text-[#665a54] outline-none';
  return <div className={`${glass} rounded-[24px] p-3`}><div className="flex flex-wrap gap-2"><label className="relative min-w-[220px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#998a82]"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search routines, steps, life areas…" className="h-10 w-full rounded-full border border-white/90 bg-white/54 pl-9 pr-4 text-[12px] text-[#544a45] outline-none placeholder:text-[#a6968e]"/></label><select aria-label="Time of day" value={time} onChange={(e)=>setTime(e.target.value)} className={selectClass}><option>Any time</option>{['Morning','Between','Afternoon','Evening','Night'].map(v=><option key={v}>{v}</option>)}</select><select aria-label="Frequency" value={frequency} onChange={(e)=>setFrequency(e.target.value)} className={selectClass}><option>Any frequency</option>{['Daily','Weekly','Monthly','Quarterly','Seasonal','Yearly','As needed','Scheduled'].map(v=><option key={v}>{v}</option>)}</select><select aria-label="Situation" value={situation} onChange={(e)=>setSituation(e.target.value)} className={selectClass}><option>Any situation</option>{['Normal Day','Work Day','Home Day','Going Out','Travel','Sick','Recovery','Event Prep','Reset Day'].map(v=><option key={v}>{v}</option>)}</select></div></div>;
}

function LibraryWorld({ energy, setEnergy, openCategory, openRoutine, favorites, recent }: { energy:EnergyMode; setEnergy:(v:EnergyMode)=>void; openCategory:(id:string)=>void; openRoutine:(categoryId:string,routineId:string)=>void; favorites:string[]; recent:string[] }) {
  const [query,setQuery]=useState(''); const [time,setTime]=useState('Any time'); const [frequency,setFrequency]=useState('Any frequency'); const [situation,setSituation]=useState('Any situation');
  const filtered = useMemo(() => CATEGORIES.filter((category) => {
    if (!query.trim()) return true;
    const q=query.toLowerCase();
    return category.title.toLowerCase().includes(q) || category.routineIds.some((id)=>{ const routine=ROUTINE_BY_ID.get(id); return routine && `${routine.title} ${routine.subtitle} ${routine.lifeAreas.join(' ')}`.toLowerCase().includes(q); });
  }),[query]);
  const recentRoutines=recent.map((id)=>ROUTINE_BY_ID.get(id)).filter(Boolean).slice(0,5) as RoutineObject[];
  const favoriteRoutines=favorites.map((id)=>ROUTINE_BY_ID.get(id)).filter(Boolean).slice(0,4) as RoutineObject[];
  return <div className="space-y-5 pb-24 pt-20 sm:pt-24">
    <section className="relative overflow-hidden px-1 py-5 text-center sm:py-8"><span className="pointer-events-none absolute left-[10%] top-0 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.95),rgba(242,210,207,.22)_38%,transparent_70%)] blur-xl"/><span className="pointer-events-none absolute right-[14%] top-5 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.9),rgba(209,205,255,.26)_42%,transparent_72%)] blur-xl"/><p className="text-[11px] font-semibold uppercase tracking-[.28em] text-[#74655e]">Glow OS</p><h1 className="glow-display mt-2 text-[44px] leading-none text-[#241f1d] sm:text-[58px]">Routine Library</h1><p className="mx-auto mt-3 max-w-2xl text-[14px] leading-6 text-[#776a64]">Every routine. Every version. One living rhythm across your whole life.</p><p className="glow-hand mt-2 text-[28px] text-[#a39186]">Small routines. Big results.</p></section>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-4"><FilterBar query={query} setQuery={setQuery} time={time} setTime={setTime} frequency={frequency} setFrequency={setFrequency} situation={situation} setSituation={setSituation}/><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">{filtered.map((category)=><CategoryCard key={category.id} category={category} onOpen={()=>openCategory(category.id)}/>)}</div></div>
      <aside className="space-y-4"><EnergySelector value={energy} onChange={setEnergy}/><section className={`${glass} rounded-[26px] p-4`}><div className="flex items-center justify-between"><h2 className="glow-display text-[20px] text-[#302927]">Popular Routines</h2><span className="text-[11px] text-[#9a8a80]">Now</span></div><div className="mt-3 space-y-2">{['morning-routine','night-routine','everything-shower','sunday-reset','day-1-glutes-and-hamstrings'].map((id)=>{const routine=ROUTINE_BY_ID.get(id);if(!routine)return null;const category=CATEGORIES.find((c)=>c.routineIds.includes(id));return <button key={id} onClick={()=>category&&openRoutine(category.id,id)} className="flex w-full items-center justify-between rounded-[16px] border border-white/70 bg-white/38 px-3 py-3 text-left"><span><strong className="block text-[12px] font-medium text-[#514740]">{routine.title}</strong><small className="text-[10px] text-[#95847a]">{routineDurationForEnergy(routine.duration,energy)}</small></span><ArrowRight size={12}/></button>})}</div></section>{recentRoutines.length?<section className={`${glass} rounded-[26px] p-4`}><h2 className="glow-display text-[20px] text-[#302927]">Recently Viewed</h2><div className="mt-3 space-y-2">{recentRoutines.map((routine)=>{const category=CATEGORIES.find((c)=>c.routineIds.includes(routine.id));return <button key={routine.id} onClick={()=>category&&openRoutine(category.id,routine.id)} className="flex w-full items-center justify-between rounded-[15px] bg-white/34 px-3 py-2.5 text-left text-[11px] text-[#5d5049]"><span>{routine.title}</span><ArrowRight size={11}/></button>})}</div></section>:null}{favoriteRoutines.length?<section className={`${glass} rounded-[26px] p-4`}><div className="flex items-center gap-2"><Heart size={14} className="text-[#bd7e89]"/><h2 className="glow-display text-[20px] text-[#302927]">Favorites</h2></div><p className="mt-2 text-[11px] leading-5 text-[#817169]">Your saved rituals stay close without creating duplicate routine objects.</p></section>:null}</aside>
    </div>
  </div>;
}

function RoutineCard({ routine, category, energy, favorite, onFavorite, onOpen }: { routine:RoutineObject; category:RoutineCategory; energy:EnergyMode; favorite:boolean; onFavorite:()=>void; onOpen:()=>void }) {
  return <article className={`${glass} ${pearl} group relative rounded-[24px] p-3`}><button type="button" onClick={onOpen} className="block w-full text-left"><ObjectPortrait category={category} compact label={routine.title}/><div className="relative mt-3"><h3 className="text-[13px] font-semibold text-[#3c3430]">{routine.title}</h3><p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#7d6d65]">{routine.subtitle}</p><div className="mt-3 flex items-center gap-2 text-[10px] text-[#93837a]"><Clock3 size={11}/><span>{routineDurationForEnergy(routine.duration,energy)}</span></div></div></button><button type="button" onClick={onFavorite} aria-label={favorite?'Remove from favorites':'Add to favorites'} className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/85 bg-white/65 text-[#9b7d78]"><Heart size={14} fill={favorite?'currentColor':'none'}/></button></article>;
}

function CategoryWorld({ category, energy, setEnergy, openRoutine, favorites, toggleFavorite, goLibrary }: { category:RoutineCategory; energy:EnergyMode; setEnergy:(v:EnergyMode)=>void; openRoutine:(id:string)=>void; favorites:string[]; toggleFavorite:(id:string)=>void; goLibrary:()=>void }) {
  const [tab,setTab]=useState(category.tabs[0]??'All'); const [query,setQuery]=useState('');
  const routines=category.routineIds.map((id)=>ROUTINE_BY_ID.get(id)).filter(Boolean) as RoutineObject[];
  const filtered=routines.filter((routine)=>!query.trim()||`${routine.title} ${routine.subtitle}`.toLowerCase().includes(query.toLowerCase()));
  const modules=categoryToolsets[category.id]??[{title:'Today’s Routine Focus',items:routines.slice(0,4).map((r)=>r.title)},{title:'Quick Links',items:['Routine Calendar','Progress','Inventory / supplies','History']}];
  return <div className="space-y-5 pb-24 pt-20 sm:pt-24"><section className={`${glass} relative overflow-hidden rounded-[32px] p-5 sm:p-7`}><div className="absolute right-8 top-5 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.95),rgba(232,218,255,.24)_35%,rgba(255,219,201,.18)_55%,transparent_74%)] blur-xl"/><div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><button onClick={goLibrary} className="mb-4 inline-flex items-center gap-2 text-[12px] text-[#796a62]"><ArrowLeft size={13}/> Surface to Routine Library</button><p className="text-[11px] font-semibold uppercase tracking-[.2em] text-[#897268]">Routine World · {category.title}</p><h1 className="glow-display mt-2 text-[42px] leading-none text-[#282220] sm:text-[56px]">{category.title} Routines</h1><p className="mt-3 text-[14px] text-[#766963]">{category.subtitle}</p></div><div className="flex items-center gap-4"><div className="hidden sm:block"><ObjectPortrait category={category} compact/></div><p className="glow-hand max-w-[210px] text-[27px] leading-tight text-[#9f8d82]">{category.note}</p></div></div></section>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><div className="space-y-4"><div className={`${glass} rounded-[24px] p-3`}><div className="flex gap-2 overflow-x-auto pb-1">{category.tabs.map((item)=><button key={item} onClick={()=>setTab(item)} aria-pressed={tab===item} className={`shrink-0 rounded-full border px-4 py-2 text-[12px] transition ${tab===item?'border-white bg-white/88 text-[#403733] shadow-[0_6px_20px_rgba(75,56,45,.07)]':'border-white/65 bg-white/30 text-[#7e6f67]'}`}>{item}</button>)}</div><label className="relative mt-3 block"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b8a82]"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={`Search ${category.title.toLowerCase()} routines…`} className="h-10 w-full rounded-full border border-white/85 bg-white/48 pl-9 pr-4 text-[12px] outline-none"/></label></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{filtered.map((routine)=><RoutineCard key={routine.id} routine={routine} category={category} energy={energy} favorite={favorites.includes(routine.id)} onFavorite={()=>toggleFavorite(routine.id)} onOpen={()=>openRoutine(routine.id)}/>)}</div></div><aside className="space-y-4"><EnergySelector value={energy} onChange={setEnergy}/>{modules.map((module)=><section key={module.title} className={`${glass} rounded-[26px] p-4`}><h2 className="glow-display text-[20px] text-[#302927]">{module.title}</h2><div className="mt-3 space-y-2">{module.items.map((item)=><div key={item} className="flex items-center gap-2 rounded-[15px] border border-white/65 bg-white/34 px-3 py-2.5 text-[11px] text-[#62564f]"><span className="h-2 w-2 rounded-full" style={{background:category.accent}}/><span>{item}</span></div>)}</div></section>)}</aside></div>
  </div>;
}

const MORNING_COMPONENTS = ['wake-and-orient','morning-hydration','first-20','make-bed','morning-hygiene','morning-wellness','am-full-routine','morning-hair','daily-grooming','morning-food','supplements','daily-planning'];

function MorningWorld({ energy, setEnergy, openRoutine, goBack }: { energy:EnergyMode; setEnergy:(v:EnergyMode)=>void; openRoutine:(id:string)=>void; goBack:()=>void }) {
  const daily=CATEGORY_BY_ID.get('daily-life')!;
  const items=MORNING_COMPONENTS.map((id)=>ROUTINE_BY_ID.get(id)).filter(Boolean) as RoutineObject[];
  return <div className="space-y-5 pb-24 pt-20 sm:pt-24"><section className={`${glass} relative overflow-hidden rounded-[32px] p-5 sm:p-7`}><div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><div><button onClick={goBack} className="mb-4 inline-flex items-center gap-2 text-[12px] text-[#796a62]"><ArrowLeft size={13}/> Daily Life</button><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#91756a]">Daily Life · Morning</p><h1 className="glow-display mt-2 text-[44px] leading-none text-[#282220] sm:text-[58px]">Morning Routines</h1><p className="mt-3 max-w-xl text-[14px] leading-6 text-[#776963]">Start your day with clarity, care and intention. Glow adapts the depth without turning the morning into a maximal checklist.</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-white/85 bg-white/50 px-3 py-2 text-[11px] text-[#75665f]">Wake → hydrate → care → nourish → plan</span><span className="rounded-full border border-white/85 bg-white/50 px-3 py-2 text-[11px] text-[#75665f]">12 connected routine objects</span></div></div><div className="relative overflow-hidden rounded-[28px] border border-white/85 bg-[linear-gradient(135deg,rgba(251,238,222,.75),rgba(255,255,255,.82),rgba(236,228,247,.48))] p-6"><div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(255,204,116,.42),transparent_22%),radial-gradient(circle_at_20%_78%,rgba(236,211,255,.32),transparent_25%)]"/><div className="relative flex h-full min-h-[180px] flex-col justify-between"><span className="text-[58px]">🌅</span><p className="glow-hand self-end text-[30px] leading-tight text-[#9d897c]">A beautiful day begins with small intentional choices.</p></div></div></div></section><div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{items.map((routine)=><RoutineCard key={routine.id} routine={routine} category={daily} energy={energy} favorite={false} onFavorite={()=>{}} onOpen={()=>openRoutine(routine.id)}/>)}</div><aside className="space-y-4"><EnergySelector value={energy} onChange={setEnergy}/><section className={`${glass} rounded-[26px] p-4`}><h2 className="glow-display text-[20px]">Today’s Routine Focus</h2><div className="mt-3 space-y-2">{['Morning Routine','Hydration','Morning Skincare','Morning Hair'].map((item)=><div key={item} className="rounded-[15px] bg-white/38 px-3 py-2.5 text-[11px] text-[#5f534d]">{item}</div>)}</div></section></aside></div></div>;
}

function RoutinePlayer({ routine, category, energy, setEnergy, favorite, toggleFavorite, goBack }: { routine:RoutineObject; category:RoutineCategory; energy:EnergyMode; setEnergy:(v:EnergyMode)=>void; favorite:boolean; toggleFavorite:()=>void; goBack:()=>void }) {
  const [step,setStep]=useState(0); const [started,setStarted]=useState(false); const [completed,setCompleted]=useState(false);
  const steps=routineStepsForEnergy(routine,energy); const safeStep=Math.min(step,Math.max(0,steps.length-1));
  useEffect(()=>{setStep(0);setStarted(false);setCompleted(false)},[routine.id,energy]);
  return <div className="space-y-5 pb-24 pt-20 sm:pt-24"><section className={`${glass} relative overflow-hidden rounded-[34px]`}><div className="grid lg:grid-cols-[1.15fr_.85fr]"><div className="relative p-6 sm:p-8"><div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.97),rgba(228,217,255,.28)_37%,rgba(255,212,197,.18)_56%,transparent_74%)] blur-xl"/><button onClick={goBack} className="relative mb-5 inline-flex items-center gap-2 text-[12px] text-[#786961]"><ArrowLeft size={13}/> Surface to {category.title}</button><p className="relative text-[11px] font-semibold uppercase tracking-[.2em] text-[#91756c]">{category.title} · Routine Player</p><h1 className="glow-display relative mt-2 max-w-3xl text-[42px] leading-[1.02] text-[#292321] sm:text-[60px]">{routine.title}</h1><p className="relative mt-4 max-w-2xl text-[14px] leading-6 text-[#756860]">{routine.subtitle}</p><div className="relative mt-5 flex flex-wrap gap-2">{[routineDurationForEnergy(routine.duration,energy),routine.frequency,...routine.timeOfDay].map((item)=><span key={item} className="rounded-full border border-white/85 bg-white/50 px-3 py-2 text-[11px] text-[#75665f]">{item}</span>)}</div><div className="relative mt-6 flex items-center gap-3"><button type="button" onClick={()=>setStarted(true)} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#37312f] px-5 text-[13px] font-semibold text-white shadow-[0_10px_26px_rgba(55,49,47,.16)]"><Play size={14}/> {started?'Continue Routine':'Start Routine'}</button><button type="button" onClick={toggleFavorite} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/90 bg-white/60 text-[#a27777]" aria-label={favorite?'Remove favorite':'Add favorite'}><Heart size={16} fill={favorite?'currentColor':'none'}/></button></div></div><div className="border-t border-white/70 bg-white/24 p-5 lg:border-l lg:border-t-0"><ObjectPortrait category={category}/><div className="mt-4"><EnergySelector value={energy} onChange={setEnergy} compact/></div></div></div></section>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]"><section className={`${glass} rounded-[28px] p-5 sm:p-6`}><div className="flex items-center justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#92766c]">Exact routine order</p><h2 className="glow-display mt-1 text-[28px] text-[#342d2a]">Your routine right now</h2></div><div className="text-right"><span className="text-[12px] text-[#8d7b72]">{Math.min(safeStep+1,steps.length)} / {steps.length}</span><div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-[#e9e0db]"><div className="h-full rounded-full bg-[#b98284] transition-all" style={{width:`${steps.length?((safeStep+(completed?1:0))/steps.length)*100:0}%`}}/></div></div></div><div className="mt-5 space-y-2">{steps.map((item,index)=>{const active=started&&index===safeStep&&!completed;const done=completed||index<safeStep;return <button type="button" key={`${item}-${index}`} onClick={()=>{setStarted(true);setStep(index)}} className={`flex w-full items-start gap-3 rounded-[18px] border px-4 py-3 text-left transition ${active?'border-white bg-white/86 shadow-[0_10px_28px_rgba(85,63,51,.07)]':'border-white/70 bg-white/38'}`}><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${done?'bg-[#dfe9df] text-[#58705d]':'bg-[#f1e8e2] text-[#806a60]'}`}>{done?<Check size={14}/>:index+1}</span><span className="pt-1 text-[13px] leading-5 text-[#524842]">{item}</span></button>})}</div>{started&&!completed?<div className="mt-5 flex flex-wrap gap-2"><button type="button" disabled={safeStep===0} onClick={()=>setStep((v)=>Math.max(0,v-1))} className="rounded-full border border-white/90 bg-white/55 px-4 py-2.5 text-[12px] disabled:opacity-40">Previous</button><button type="button" onClick={()=>safeStep>=steps.length-1?setCompleted(true):setStep((v)=>v+1)} className="rounded-full bg-[#3b3431] px-5 py-2.5 text-[12px] font-semibold text-white">{safeStep>=steps.length-1?'Complete':'Next step'}</button></div>:null}{completed?<div className="mt-5 rounded-[20px] border border-[#d8e5d8] bg-[#f5faf5] p-4"><div className="flex items-center gap-2 text-[#58705d]"><Check size={16}/><strong className="text-[13px]">Routine completed</strong></div><p className="mt-1 text-[11px] text-[#708072]">Result and next-due information can now join the shared routine history.</p></div>:null}</section>
      <aside className="space-y-4"><section className={`${glass} rounded-[26px] p-4`}><h2 className="glow-display text-[21px] text-[#342d2a]">Routine Intelligence</h2><div className="mt-3 space-y-2">{['What is actually due today?','Products + tools needed','Where everything lives','Compatibility / what not to combine','Cleanup + put away','Result + next due'].map((item)=><div key={item} className="flex items-center gap-2 rounded-[14px] bg-white/36 px-3 py-2.5 text-[11px] text-[#60544e]"><Check size={12} className="text-[#789379]"/>{item}</div>)}</div></section><section className={`${glass} rounded-[26px] p-4`}><h2 className="glow-display text-[21px]">Details</h2><dl className="mt-3 space-y-3 text-[11px]"><div><dt className="font-semibold text-[#7d6c64]">Life areas</dt><dd className="mt-1 text-[#504641]">{routine.lifeAreas.join(' · ')}</dd></div><div><dt className="font-semibold text-[#7d6c64]">Next due</dt><dd className="mt-1 text-[#504641]">{routine.nextDue}</dd></div>{routine.avoid?.length?<div><dt className="font-semibold text-[#8d6666]">Protect / avoid</dt><dd className="mt-1 text-[#5b4d49]">{routine.avoid.join(' · ')}</dd></div>:null}</dl></section><a href={`/routines?category=${category.id}&routine=${routine.id}&focus=1`} className={`${glass} flex items-center justify-between rounded-[22px] px-4 py-3 text-[12px] text-[#514740]`}><span>Enter Focus Mode</span><ArrowRight size={13}/></a></aside></div>
  </div>;
}

export function RoutineWorldV2() {
  const router=useRouter(); const pathname=usePathname(); const params=useSearchParams();
  const categoryId=params.get('category'); const routineId=params.get('routine'); const sub=params.get('sub');
  const category=categoryId?CATEGORY_BY_ID.get(categoryId)??null:null; const routine=routineId?ROUTINE_BY_ID.get(routineId)??null:null;
  const [energy,setEnergyState]=useState<EnergyMode>('Medium'); const [favorites,setFavorites]=useState<string[]>([]); const [recent,setRecent]=useState<string[]>([]);
  useEffect(()=>{setEnergyState(readLocal(STORAGE.energy,'Medium'));setFavorites(readLocal(STORAGE.favorites,[]));setRecent(readLocal(STORAGE.recent,[]))},[]);
  const setEnergy=(value:EnergyMode)=>{setEnergyState(value);writeLocal(STORAGE.energy,value)};
  const navigate=(next:Record<string,string|null>)=>{const p=new URLSearchParams(params.toString());for(const [key,value] of Object.entries(next)){if(value===null)p.delete(key);else p.set(key,value)}router.push(`${pathname}${p.toString()?`?${p}`:''}`)};
  const openCategory=(id:string)=>navigate({category:id,routine:null,sub:null});
  const openRoutine=(catId:string,id:string)=>{const next=[id,...recent.filter((x)=>x!==id)].slice(0,12);setRecent(next);writeLocal(STORAGE.recent,next);navigate({category:catId,routine:id,sub:null})};
  const toggleFavorite=(id:string)=>{const next=favorites.includes(id)?favorites.filter((x)=>x!==id):[id,...favorites];setFavorites(next);writeLocal(STORAGE.favorites,next)};
  useEffect(()=>{const detail={left:category?{label:'Surface',event:'glow:routines-surface'}:{label:'Reverse the Current',event:'glow:reverse-current'},center:routine?{label:'Start routine',event:'glow:routine-start'}:{label:'World Fold',event:'glow:world-fold'},right:{label:'Edit routines',path:'/routines/manage/edit'}};document.dispatchEvent(new CustomEvent('glow:shell-actions',{detail}));return()=>document.dispatchEvent(new CustomEvent('glow:shell-actions-clear'))},[category,routine]);
  useEffect(()=>{const surface=()=>routine?navigate({routine:null}):category?navigate({category:null,sub:null}):null;document.addEventListener('glow:routines-surface',surface);return()=>document.removeEventListener('glow:routines-surface',surface)},[routine,category,params]);
  if(category?.id==='daily-life'&&sub==='morning') return <MorningWorld energy={energy} setEnergy={setEnergy} openRoutine={(id)=>openRoutine('daily-life',id)} goBack={()=>navigate({sub:null})}/>;
  if(category&&routine) return <RoutinePlayer routine={routine} category={category} energy={energy} setEnergy={setEnergy} favorite={favorites.includes(routine.id)} toggleFavorite={()=>toggleFavorite(routine.id)} goBack={()=>navigate({routine:null})}/>;
  if(category) return <CategoryWorld category={category} energy={energy} setEnergy={setEnergy} openRoutine={(id)=>category.id==='daily-life'&&id==='morning-routine'?navigate({sub:'morning'}):openRoutine(category.id,id)} favorites={favorites} toggleFavorite={toggleFavorite} goLibrary={()=>navigate({category:null,routine:null,sub:null})}/>;
  return <LibraryWorld energy={energy} setEnergy={setEnergy} openCategory={openCategory} openRoutine={openRoutine} favorites={favorites} recent={recent}/>;
}
