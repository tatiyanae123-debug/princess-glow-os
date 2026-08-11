'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Clock3, Heart, MoonStar, RefreshCw, Sparkles, SunMedium, WandSparkles } from 'lucide-react';

type Variant='Full'|'Normal'|'30 min'|'15 min'|'Emergency'|'Low Energy';

const VARIANTS:Record<Variant,{minutes:string;note:string}>={
  Full:{minutes:'45–60 min',note:'The complete ritual with every care step.'},
  Normal:{minutes:'30–40 min',note:'Your everyday sequence without unnecessary extras.'},
  '30 min':{minutes:'30 min',note:'Protect the highest-value steps and leave on time.'},
  '15 min':{minutes:'15 min',note:'A compact version for a busy day.'},
  Emergency:{minutes:'5–10 min',note:'Essentials only: body, face, hair, medicine and leave.'},
  'Low Energy':{minutes:'10–20 min',note:'Gentle minimums that preserve care without pressure.'},
};

const RITUALS=[
  {title:'Morning Ritual',subtitle:'Wake · hydrate · meds · skincare · hair · prepare',icon:SunMedium,href:'/routines'},
  {title:'Midday Reset',subtitle:'Water · posture · food · brain reset · next action',icon:RefreshCw,href:'/wellness'},
  {title:'Evening Wind-Down',subtitle:'Close loops · reset room · beauty · prepare tomorrow',icon:MoonStar,href:'/tomorrow'},
  {title:'Sunday Reset',subtitle:'Home · laundry · food · hair · finance · planning',icon:Sparkles,href:'/planning'},
];

export function RitualLibraryExperience(){
  const [variant,setVariant]=useState<Variant>('Normal');
  const selected=useMemo(()=>VARIANTS[variant],[variant]);
  return <section className="space-y-4">
    <div className="overflow-hidden rounded-[24px] border border-[#e5d6ce] bg-[linear-gradient(135deg,#fff9f4,#f4e4df_62%,#eee5d9)] shadow-[0_22px_65px_rgba(83,59,50,.08)]">
      <div className="grid gap-0 xl:grid-cols-[1.08fr_.92fr]">
        <div className="relative px-6 py-7 sm:px-8 sm:py-9">
          <div className="absolute right-7 top-6 h-24 w-24 rounded-full border-[16px] border-white/35"/>
          <p className="text-[8px] font-bold uppercase tracking-[.22em] text-[#a16c72]">Routines · The Ritual Library</p>
          <p className="glow-hand mt-2 text-[38px] leading-none text-[#a16c72]">enter the ritual</p>
          <h1 className="glow-display mt-5 max-w-2xl text-[38px] leading-[1.02] tracking-[-.035em] text-[#392e2a] sm:text-[50px]">Choose the version of care that fits the life you have today.</h1>
          <p className="mt-4 max-w-xl text-[10px] leading-5 text-[#78665f]">Routines are not another checklist. They are guided sequences that can become shorter when time or energy changes while preserving the purpose of the ritual.</p>
          <div className="mt-6 flex flex-wrap gap-2">{(Object.keys(VARIANTS) as Variant[]).map(item=><button key={item} type="button" onClick={()=>setVariant(item)} className={`rounded-full border px-3 py-2 text-[8px] transition ${variant===item?'border-[#bd7c85] bg-[#bd7c85] text-white':'border-[#dfcec5] bg-white/55 text-[#735e57] hover:bg-white'}`}>{item}</button>)}</div>
        </div>
        <div className="border-t border-white/70 bg-white/38 p-5 xl:border-l xl:border-t-0 sm:p-6">
          <div className="rounded-[20px] border border-white/80 bg-white/65 p-5 shadow-sm">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[#a16c72]"><WandSparkles size={15}/><p className="text-[8px] font-bold uppercase tracking-[.16em]">Adaptive version</p></div><span className="rounded-full bg-[#f4e6e3] px-2.5 py-1 text-[7px] text-[#8a6564]">{variant}</span></div>
            <p className="glow-display mt-5 text-[29px] text-[#443632]">{selected.minutes}</p>
            <p className="mt-2 text-[9px] leading-5 text-[#806c65]">{selected.note}</p>
            <div className="mt-5 space-y-2 border-t border-[#eee2dc] pt-4">{['Protect non-negotiables','Use current calendar context','Allow skip / replace / pause','Keep completion history'].map(item=><p key={item} className="flex items-center gap-2 text-[8px] text-[#685650]"><Heart size={10} className="text-[#c6848d]"/>{item}</p>)}</div>
            <Link href="/brain" className="mt-5 flex items-center justify-center gap-2 rounded-[11px] bg-[#322926] px-4 py-3 text-[9px] font-semibold text-white">Choose the right version for me <ArrowRight size={11}/></Link>
          </div>
        </div>
      </div>
    </div>

    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{RITUALS.map(({title,subtitle,icon:Icon,href})=><Link href={href} key={title} className="group rounded-[18px] border border-[#e7dad2] bg-[#fffaf6]/72 p-4 shadow-[0_12px_35px_rgba(80,59,50,.045)] transition hover:-translate-y-0.5 hover:bg-white"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1e0dc] text-[#a56e73]"><Icon size={15}/></div><p className="glow-display mt-4 text-[18px] text-[#443632]">{title}</p><p className="mt-2 text-[8px] leading-4 text-[#86716a]">{subtitle}</p><p className="mt-4 inline-flex items-center gap-1 text-[8px] font-medium text-[#a16870]">Enter <ArrowRight size={9} className="transition group-hover:translate-x-1"/></p></Link>)}</div>

    <div className="grid gap-3 lg:grid-cols-[1.25fr_.75fr]">
      <div className="rounded-[18px] border border-[#e6dad2] bg-white/55 p-5"><div className="flex items-center gap-2"><Clock3 size={14} className="text-[#a88070]"/><p className="text-[8px] font-bold uppercase tracking-[.17em] text-[#76615a]">Context engine</p></div><p className="glow-display mt-3 text-[19px] text-[#423530]">If you only have 27 minutes, Glow should not ask you to complete a 58-minute morning.</p><p className="mt-2 text-[9px] leading-5 text-[#806c65]">Calendar, energy, work time and your Personal Rules can determine which routine version is appropriate. The underlying routines below remain fully editable.</p></div>
      <div className="rounded-[18px] border border-[#dedfd6] bg-[linear-gradient(135deg,#f4f5ec,#eef0e5)] p-5"><p className="text-[8px] font-bold uppercase tracking-[.17em] text-[#78806d]">Connected rooms</p><div className="mt-4 flex flex-wrap gap-2">{[['Calendar','/calendar'],['Beauty','/beauty'],['Hair','/hair'],['Wellness','/wellness'],['Today','/today']].map(([label,href])=><Link key={href} href={href} className="rounded-full border border-white/80 bg-white/60 px-3 py-2 text-[8px] text-[#69705f]">{label}</Link>)}</div></div>
    </div>
  </section>;
}
