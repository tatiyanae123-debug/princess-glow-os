'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  Heart,
  Moon,
  PackageOpen,
  Play,
  RotateCcw,
  Sparkles,
  Sun,
  Waves,
} from 'lucide-react';
import { RoutineStepPlayer } from '@/components/routines/routine-step-player';
import { createHairLogAction } from '@/app/actions/completion-v1';
import type { CalendarEvent, Goal, Routine, RoutineStep } from '@/lib/types';

type H = {
  id: string;
  eventType: string;
  occurredAt: Date;
  style: string | null;
  products: string | null;
  heatUsed: boolean;
  notes: string | null;
  nextAction: string | null;
};

type T = {
  id: string;
  title: string;
  occurredAt: Date;
  category: string;
  summary: string | null;
  imageUrl: string | null;
  relatedEntityType: string | null;
};

type MasterRoutine = {
  id: string;
  name: string;
  subtitle: string;
  cadence: string;
  minutes: string;
  icon: 'sun' | 'moon' | 'wash' | 'refresh' | 'oil';
  steps: { title: string; detail: string }[];
};

type HairTab = 'today' | 'routines' | 'week' | 'products' | 'journey';

const D = 86400000;
const F = 'w-full rounded-lg border border-[#EEE3DE] bg-white px-3 py-2 text-[11px] outline-none focus:border-[#C9727E]';
const wash = (s: string) => /wash|shampoo|clarif|cleanse/i.test(s);
const hair = (s: string) => /hair|wash day|scalp|silk press|braid|protective|detangle/i.test(s);
const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function nextScheduledWashDate(from = new Date()) {
  const result = new Date(from);
  result.setHours(12, 0, 0, 0);
  for (let offset = 0; offset <= 7; offset += 1) {
    const candidate = new Date(result);
    candidate.setDate(result.getDate() + offset);
    const day = candidate.getDay();
    if (day === 0 || day === 4) return candidate;
  }
  return result;
}

const masterRoutines: MasterRoutine[] = [
  {
    id: 'morning',
    name: 'Morning Hair Routine',
    subtitle: 'Polished, soft, blended, expensive-looking hair',
    cadence: 'Daily',
    minutes: '10–20 min',
    icon: 'sun',
    steps: [
      { title: 'Let hair settle', detail: 'Remove bonnet or scarf gently. Do not immediately brush through curls or texture.' },
      { title: 'Lightly rehydrate', detail: 'Mist mids and ends lightly with aloe vera juice + water, or plain water if hair is already moisturized. Focus on dryness, frizz and ends. Do not soak roots or oversaturate bundles.' },
      { title: 'Apply leave-in', detail: 'Use a small amount on mids, ends and dry areas. Avoid roots, scalp and the top of leave-out.' },
      { title: 'Seal moisture', detail: 'Use 2–3 drops maximum of jojoba oil, lightweight serum or hair oil on mids and ends. Avoid greasy buildup or overloading low-porosity hair.' },
      { title: 'Minoxidil, if using', detail: 'This step is only for when minoxidil is already part of your routine. Your Hair 2026 notes say to apply it to a clean, dry scalp, focus on edges, crown or thinning areas, let it dry fully before styling, and avoid scalp oil immediately before or after. Follow your product or prescriber directions.' },
      { title: 'Check leave-out + front', detail: 'Separate the front section. Check puffiness, frizz, blending and parting. Use a spoolie, edge brush or small comb. Brush forward, backward and downward for a natural blend.' },
      { title: 'Style main hair', detail: 'Straighten, wand curl, roller-set, layer curls, brush out curls, sleek or add soft volume while keeping movement and softness. Use heat protectant whenever you use heat.' },
      { title: 'Curl front pieces LAST', detail: 'Finish with bangs, face-framing pieces, leave-out or front layers. Create soft bends, movement and airy face framing, not tight, stiff or crunchy curls.' },
    ],
  },
  {
    id: 'night',
    name: 'Night Hair Routine',
    subtitle: 'Preserve style, reduce breakage and protect length',
    cadence: 'Nightly',
    minutes: '8–15 min',
    icon: 'moon',
    steps: [
      { title: 'Release tension', detail: 'Remove wig if wearing and take down tight styles. Keep tension low.' },
      { title: 'Detangle gently', detail: 'Use fingers first, then a wide-tooth comb if needed. Start at the ends and work upward slowly. Avoid dry, aggressive brushing.' },
      { title: 'Moisture seal', detail: 'Every night or every other night, lightly mist water or aloe mix, use a small amount of leave-in, then seal the ends with 2–3 drops of light oil.' },
      { title: 'Scalp care', detail: 'Massage with fingertips, not nails, for 3–5 minutes. Optional scalp serum or rosemary oil according to your routine.' },
      { title: 'Minoxidil, if it was not used earlier', detail: 'Your Hair 2026 notes place minoxidil once daily, morning or night, if it is already part of your routine. Apply only according to your product or prescriber directions and keep scalp oil separate from this step.' },
      { title: 'Secure loosely', detail: 'Choose 2 loose braids, twists, a low loose bun, loose wrap, flexi rod, pineapple or silk wrap. Avoid tight ponytails and high-tension styles.' },
      { title: 'Protect while sleeping', detail: 'Use a silk/satin scarf or bonnet and, when available, a satin pillowcase to reduce friction and preserve the style.' },
    ],
  },
  {
    id: 'sunday',
    name: 'Sunday Full Reset Wash',
    subtitle: 'Deep cleanse, treatment, moisture and complete reset',
    cadence: 'Sunday',
    minutes: '60–120 min',
    icon: 'wash',
    steps: [
      { title: 'Pre-shower oil', detail: 'Apply coconut oil to mid-lengths and ends for about 30 minutes before washing.' },
      { title: 'Detangle + section', detail: 'Detangle gently before the shower and separate into sections if needed.' },
      { title: 'Shampoo #1', detail: 'Cleanse buildup. Your notes name Pantene Volume when oily. Focus shampoo on the scalp rather than aggressively scrubbing the lengths.' },
      { title: 'Shampoo #2', detail: 'Target the result with L’Oréal gloss shampoo for shine or a repair/strengthening shampoo.' },
      { title: 'Hair mask', detail: 'Apply a bond-repair mask or deep conditioner from mid-lengths to ends for 5–10 minutes.' },
      { title: 'Condition + detangle', detail: 'Condition mids and ends and detangle gently from ends upward while the hair has slip.' },
      { title: 'Rinse gently', detail: 'Use warm-to-cool water and avoid extremely hot water.' },
      { title: 'Dry without friction', detail: 'Use a microfiber towel or cotton T-shirt. Squeeze and press instead of aggressively rubbing.' },
      { title: 'Post-shower care', detail: 'Apply leave-in conditioner, then heat protectant if heat styling. Blow dry or style as planned.' },
    ],
  },
  {
    id: 'thursday',
    name: 'Thursday Repair + Maintain',
    subtitle: 'Midweek cleanse, bond care and restyle',
    cadence: 'Thursday',
    minutes: '45–90 min',
    icon: 'refresh',
    steps: [
      { title: 'Bond treatment', detail: 'Apply bond treatment all over hair for about 10 minutes before showering.' },
      { title: 'Double shampoo', detail: 'Cleanse the scalp thoroughly using the two-shampoo maintenance approach in your routine.' },
      { title: 'Condition', detail: 'Use conditioner. Skip a heavy mask unless your hair actually needs it.' },
      { title: 'Detangle gently', detail: 'Detangle with fingers or a wide-tooth comb, working from the ends upward.' },
      { title: 'Dry gently', detail: 'Use a microfiber towel or cotton T-shirt and squeeze or press out water rather than rubbing.' },
      { title: 'Leave-in', detail: 'Apply leave-in conditioner through mids and ends.' },
      { title: 'Style or prep', detail: 'Restyle, refresh leave-out, or prep the hair for the next look. Add heat protectant first if heat is used.' },
    ],
  },
  {
    id: 'scalp-oil',
    name: 'Scalp Oiling Routine',
    subtitle: 'Separate treatment from daily ends oiling',
    cadence: '2–3× weekly max',
    minutes: '5 min + treatment time',
    icon: 'oil',
    steps: [
      { title: 'Use your scalp oil mix', detail: 'Saved mix: castor, pumpkin seed, jojoba, rosemary and coconut oils.' },
      { title: 'Keep it separate from minoxidil', detail: 'Your Hair 2026 notes say not to layer scalp oil over minoxidil or apply scalp oil immediately before or after it.' },
      { title: 'Section hair', detail: 'Create access to the scalp so product can be applied lightly and evenly.' },
      { title: 'Apply a small amount', detail: 'Keep application controlled rather than saturating the scalp.' },
      { title: 'Massage', detail: 'Massage with fingertips for 4–5 minutes.' },
      { title: 'Treatment window', detail: 'Your saved routine says to leave the oil on for 1–4 hours or overnight.' },
      { title: 'Wash out', detail: 'Cleanse afterward rather than leaving the scalp coated for days.' },
    ],
  },
];

const weeklyPlan = [
  ['Sunday', 'Full wash day · deep condition · blowout or reset style'],
  ['Monday', 'Light refresh · minoxidil if using'],
  ['Tuesday', 'Scalp massage without oil + hydration'],
  ['Wednesday', 'Light oil on ends + protective style'],
  ['Thursday', 'Repair wash · bond care · restyle'],
  ['Friday', 'Minoxidil if using · scalp massage'],
  ['Saturday', 'Optional scalp oil · prep for Sunday reset'],
] as const;

const doctrine = [
  'Hair should look soft, touchable, effortless and polished — never stiff, greasy or crunchy.',
  'Front pieces matter most. Finish face-framing hair last.',
  'Movement matters. Avoid helmet hair and overly sprayed styles.',
  'Low tension supports healthier hair. Avoid constant tight ponytails and aggressive slick-backs.',
  'Consistency matters more than intensity.',
  'Keep leave-out minimal and controlled.',
  'Never over-oil. Daily ends oiling is separate from scalp oiling.',
  'If minoxidil is part of your routine, keep it separate from scalp oil and use it according to product or prescriber directions.',
];

const routineProducts = [
  'Aloe vera + water',
  'Leave-in conditioner',
  'Jojoba oil',
  'Lightweight serum',
  'Argan oil',
  'Coconut oil',
  'Castor oil',
  'Pumpkin seed oil',
  'Rosemary oil',
  'Grape seed oil',
  'Onion oil',
  'Heat protectant',
  'Bond treatment',
  'Hair mask',
  'Pantene Volume',
  'L’Oréal gloss shampoo',
  'Minoxidil · if using',
] as const;

export function HairExperience({ logs, timeline, routines, routineSteps, events, goals }: { logs: H[]; timeline: T[]; routines: Routine[]; routineSteps: RoutineStep[]; events: CalendarEvent[]; goals: Goal[] }) {
  const [play, setPlay] = useState<Routine | null>(null);
  const [guided, setGuided] = useState<MasterRoutine | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [tab, setTab] = useState<HairTab>('today');
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const now = new Date();
  const w = logs.filter((x) => wash(x.eventType));
  const last = logs[0];
  const interval = w.length > 1 ? Math.max(1, Math.round((w[0].occurredAt.getTime() - w[1].occurredAt.getTime()) / D)) : null;
  const next = nextScheduledWashDate(now);
  const heat = logs.filter((x) => x.heatUsed && now.getTime() - x.occurredAt.getTime() < 30 * D).length;
  const hrs = routines.filter((x) => hair(x.name));
  const shelf = Object.entries(count(logs.flatMap((x) => x.products?.split(/[,;+]/).map((v) => v.trim()).filter(Boolean) ?? []))).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const hg = goals.filter((g) => /hair|scalp|growth|length|breakage|volume/i.test(`${g.title} ${g.description ?? ''}`) && g.status !== 'achieved' && g.status !== 'abandoned').slice(0, 3);
  const appts = events.filter((e) => e.startAt.getTime() >= now.getTime() && /hair|salon|trim|color|braid|stylist|blowout/i.test(`${e.title} ${e.description ?? ''}`)).sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).slice(0, 4);
  const photos = timeline.filter((x) => x.imageUrl && (/hair/i.test(x.category) || /hair/i.test(x.title))).slice(0, 6);
  const todayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const todayPlan = weeklyPlan.find(([day]) => day === todayName)?.[1] ?? 'Gentle handling · moisture check · protect at night';
  const todayRoutine = todayName === 'Sunday' ? masterRoutines[2] : todayName === 'Thursday' ? masterRoutines[3] : null;
  const suggestedRoutine = todayRoutine ?? (now.getHours() >= 18 ? masterRoutines[1] : masterRoutines[0]);
  const completedCount = guided ? guided.steps.filter((_, index) => completed[`${guided.id}-${index}`]).length : 0;

  const startGuided = (routine: MasterRoutine) => {
    setGuided(routine);
    setStepIndex(0);
    setCompleted({});
  };

  return (
    <div className="mx-auto max-w-[1240px] space-y-5 pb-10">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="glow-eyebrow">Beauty Intelligence · Hair</p>
          <h1 className="glow-display text-[44px] leading-none text-[#2B2420] sm:text-[54px]">Your Hair Studio <Sparkles className="inline text-[#D9A665]" size={16}/></h1>
          <p className="mt-2 text-[12px] text-[#92867E]">Decide → prepare → do → learn → remember.</p>
        </div>
        <div className="rounded-[18px] border border-[#F1E3DE] bg-[linear-gradient(135deg,#FFFDFC,#F8EEEC)] px-4 py-3 lg:max-w-[360px]">
          <p className="text-[9px] uppercase tracking-[.16em] text-[#A97A76]">Glow recommends today</p>
          <p className="glow-display mt-1 text-[17px] text-[#43352F]">{todayPlan}</p>
        </div>
      </header>

      <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Hair workspace">
        {([
          ['today', 'Today'],
          ['routines', 'My Routines'],
          ['week', 'Hair Calendar'],
          ['products', 'Products'],
          ['journey', 'Journey'],
        ] as const).map(([key, label]) => (
          <button type="button" key={key} aria-pressed={tab === key} onClick={() => setTab(key)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-[10px] transition ${tab === key ? 'border-[#C9727E] bg-[#F8E6E7] text-[#864D58]' : 'border-[#EEE3DE] bg-white text-[#8B7D75] hover:bg-[#FCF8F6]'}`}>{label}</button>
        ))}
      </nav>

      {tab === 'today' ? <>
        <section className="grid gap-4 lg:grid-cols-[1.4fr_.8fr]">
          <div className="relative overflow-hidden rounded-[28px] border border-[#EEDDD7] bg-[radial-gradient(circle_at_82%_18%,rgba(255,255,255,.86),transparent_28%),linear-gradient(135deg,#EADAD2,#F8EFEB_55%,#EFE0DC)] p-6 shadow-[0_22px_70px_rgba(94,65,56,.08)] sm:p-8">
            <Waves aria-hidden="true" className="absolute -right-6 bottom-0 text-[#B68F84]/15" size={180} strokeWidth={.5}/>
            <div className="relative max-w-[650px]">
              <p className="text-[9px] font-semibold uppercase tracking-[.18em] text-[#A0716B]">Hair · Today · {todayName}</p>
              <h2 className="glow-display mt-3 text-[30px] leading-tight text-[#3B2F2A] sm:text-[36px]">{suggestedRoutine.name}</h2>
              <p className="mt-2 text-[11px] leading-5 text-[#7F6B63]">{suggestedRoutine.subtitle}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-[9px] text-[#7A655E]"><Pill icon={<Clock3 size={11}/>} text={suggestedRoutine.minutes}/><Pill icon={<CalendarDays size={11}/>} text={suggestedRoutine.cadence}/><Pill icon={<Check size={11}/>} text={`${suggestedRoutine.steps.length} guided steps`}/></div>
              <button type="button" onClick={() => startGuided(suggestedRoutine)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#5B413A] px-5 py-3 text-[10px] font-medium text-white shadow-sm"><Play size={13}/>Start hair routine</button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <S l="Current Style" v={last?.style ?? 'Not logged'} s={last ? `Since ${fmt(last.occurredAt)}` : 'Add your current style'}/>
            <S l="Next Planned Wash" v={fmt(next)} s="Your Hair 2026 schedule: Sunday + Thursday"/>
            <S l="Heat Styling" v={`${heat} times`} s="Last 30 days"/>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <B t="Quick routines" subtitle="One tap opens the full detailed routine from your 2026 Hair System.">
            <div className="grid gap-2 sm:grid-cols-2">
              {masterRoutines.slice(0, 4).map((routine) => <RoutineButton key={routine.id} routine={routine} onClick={() => startGuided(routine)}/>) }
            </div>
          </B>
          <B t="Hair insight" subtitle="Glow combines your saved system with your actual logs.">
            <p className="glow-display text-[18px] leading-7 text-[#51413A]">{interval ? `Your logged wash rhythm is about every ${interval} days. Your imported plan anchors full resets to Sunday and maintenance to Thursday.` : 'Your imported plan anchors full resets to Sunday and maintenance to Thursday. As you log hair care, Glow will compare your real rhythm with the plan.'}</p>
            <div className="mt-4 rounded-[14px] bg-[#FAF4F1] p-3 text-[10px] leading-5 text-[#77655D]">Signature finish: soft movement, controlled leave-out and face-framing front pieces styled last.</div>
          </B>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <B t="Hair goals">{hg.length ? hg.map((g) => <div key={g.id} className="py-2"><div className="flex justify-between text-[10px]"><span>{g.title}</span><span>{g.progress}%</span></div><div className="mt-1.5 h-1.5 rounded-full bg-[#F1E7E3]"><div className="h-full rounded-full bg-[#C9727E]" style={{ width: `${Math.max(0, Math.min(100, g.progress))}%` }}/></div></div>) : <Empty text="Add a hair goal and Glow will track it here."/>}</B>
          <B t="Upcoming hair plans">{appts.length ? appts.map((a) => <div key={a.id} className="flex justify-between gap-2 border-b border-[#F2E9E5] py-2 text-[10px] last:border-0"><span>{a.title}<small className="block text-[#92867E]">{fmt(a.startAt)} · {a.startAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</small></span><span className="text-[#C9727E]">Upcoming</span></div>) : <Empty text="Hair appointments and calendar events will appear here."/>}</B>
          <B t="Hair doctrine">{doctrine.slice(0, 4).map((rule, i) => <div key={rule} className="flex gap-2 py-1.5 text-[10px] leading-5 text-[#6F5F58]"><span className="text-[#C9727E]">{i + 1}.</span><span>{rule}</span></div>)}</B>
        </section>
      </> : null}

      {tab === 'routines' ? <section className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {masterRoutines.map((routine) => <div key={routine.id} className="rounded-[20px] border border-[#EEDFD9] bg-white p-5 shadow-[0_10px_40px_rgba(80,55,46,.04)]"><div className="flex items-start justify-between gap-3"><RoutineIcon kind={routine.icon}/><span className="rounded-full bg-[#FAF1EE] px-2.5 py-1 text-[8px] text-[#9A6E68]">{routine.cadence}</span></div><h2 className="glow-display mt-4 text-[20px] text-[#43362F]">{routine.name}</h2><p className="mt-1 min-h-[36px] text-[10px] leading-5 text-[#86756E]">{routine.subtitle}</p><div className="mt-4 space-y-2">{routine.steps.slice(0, 3).map((step, i) => <div key={step.title} className="flex gap-2 text-[9px] text-[#75665F]"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#F7EBE8] text-[8px] text-[#B16A74]">{i + 1}</span><span>{step.title}</span></div>)}</div><button type="button" onClick={() => startGuided(routine)} className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-medium text-[#B2606E]">Open {routine.steps.length}-step guide <ChevronRight size={12}/></button></div>)}
        </div>
        {hrs.length ? <B t="Your live Glow routines" subtitle="These are routines already saved in your Glow database and remain fully editable.">{hrs.slice(0, 8).map((r) => <button type="button" key={r.id} onClick={() => setPlay(r)} className="flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left hover:bg-[#FAF7F5]"><span><b className="block text-[10.5px] font-medium">{r.name}</b><small className="text-[9px] text-[#92867E]">{routineSteps.filter((x) => x.routineId === r.id).length} saved steps</small></span><Play size={13}/></button>)}</B> : null}
        <B t="Non-negotiable hair rules">{doctrine.map((rule, i) => <div key={rule} className="grid grid-cols-[28px_1fr] gap-2 border-b border-[#F3EAE6] py-3 last:border-0"><span className="glow-display text-[18px] text-[#D39AA2]">{String(i + 1).padStart(2, '0')}</span><p className="text-[10px] leading-5 text-[#66564F]">{rule}</p></div>)}</B>
      </section> : null}

      {tab === 'week' ? <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <B t="Your weekly hair system" subtitle="The rhythm imported from Hair 2026.">
          <div className="space-y-2">{weeklyPlan.map(([day, plan]) => <div key={day} className={`grid grid-cols-[82px_1fr] gap-3 rounded-[14px] border p-3 ${day === todayName ? 'border-[#D9919C] bg-[#FCF0F1]' : 'border-[#F1E7E2] bg-[#FFFEFD]'}`}><div><p className="glow-display text-[14px] text-[#55423A]">{day}</p>{day === todayName ? <span className="text-[7px] uppercase tracking-[.12em] text-[#B25E6B]">Today</span> : null}</div><p className="text-[10px] leading-5 text-[#796860]">{plan}</p></div>)}</div>
        </B>
        <div className="space-y-4">
          <B t="Cadence map"><Cadence label="Daily" detail="Gentle handling · moisture check · scalp massage · night protection"/><Cadence label="Every 1–2 days" detail="Hydration refresh: water + aloe, pea-size leave-in, 2–3 drops jojoba on ends"/><Cadence label="Every ~3 days" detail="Refresh curls · redo blend · refresh leave-out"/><Cadence label="2–3× weekly max" detail="Scalp oil treatment, kept separate from minoxidil if minoxidil is in use"/><Cadence label="Weekly" detail="Sunday full reset · Thursday maintenance · deep treatment · scalp reset"/><Cadence label="Monthly" detail="Wash wig/extensions · trim split ends if needed · clarify if buildup exists"/></B>
          <B t="Wash rhythm"><div className="grid grid-cols-2 gap-2"><MiniStat label="Sunday" value="Full reset"/><MiniStat label="Thursday" value="Repair + maintain"/><MiniStat label="Last wash" value={w[0] ? fmt(w[0].occurredAt) : '—'}/><MiniStat label="Next planned" value={fmt(next)}/></div></B>
        </div>
      </section> : null}

      {tab === 'products' ? <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <B t="Routine product shelf" subtitle="Products and ingredients explicitly named in your imported Hair system.">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {routineProducts.map((p) => <div key={p} className="rounded-[14px] border border-[#F0E6E2] bg-[#FFFDFC] p-3"><span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#F7ECE8] text-[#B37370]"><Droplets size={13}/></span><p className="mt-2 text-[9px] leading-4 text-[#665650]">{p}</p></div>)}
          </div>
        </B>
        <B t="What you actually use" subtitle="This shelf learns from the products you enter in Hair logs.">
          {shelf.length ? <div className="grid grid-cols-2 gap-2">{shelf.map(([p, n]) => <div key={p} className="flex items-center gap-3 rounded-[12px] border border-[#F0E7E3] p-3"><span className="grid h-10 w-9 place-items-center rounded-[9px] bg-[#F5ECE8]"><PackageOpen size={13}/></span><div className="min-w-0"><p className="truncate text-[10px]">{p}</p><p className="text-[8px] text-[#92867E]">logged {n}×</p></div></div>)}</div> : <Empty text="Log products during routines and your personal shelf will build automatically."/>}
          <div className="mt-4 rounded-[14px] bg-[#F9F2EF] p-4"><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#9F716B]">Saved oil blend</p><p className="mt-2 text-[10px] leading-5 text-[#6E5D56]">Castor · pumpkin seed · jojoba · rosemary · coconut</p><p className="mt-3 text-[9px] font-semibold uppercase tracking-[.12em] text-[#9F716B]">Additional oil notes</p><p className="mt-2 text-[10px] leading-5 text-[#6E5D56]">Grape seed · onion · argan · castor. Hernan blend notes: black licorice + marigolds.</p></div>
        </B>
      </section> : null}

      {tab === 'journey' ? <section className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        <B t="Hair photo diary" subtitle="Build Day 1 → refresh → maintenance → removal comparisons.">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{photos.map((p) => <div key={p.id} className="relative h-40 overflow-hidden rounded-[14px] bg-[#F1E8E3] bg-cover bg-center" style={{ backgroundImage: `url(${p.imageUrl})` }}><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-3 pt-8 text-white"><p className="text-[9px]">{p.title}</p><p className="text-[8px] opacity-80">{fmt(p.occurredAt)}</p></div></div>)}<Link href="/timeline" className="grid h-40 place-items-center rounded-[14px] border border-dashed border-[#DDB8B2] text-center text-[9px] text-[#B56C76]"><span><Camera size={18} className="mx-auto mb-2"/>Add hair photo</span></Link></div>
        </B>
        <B t="Care history"><div className="space-y-2">{logs.slice(0, 10).map((x) => <Link key={x.id} href={`/hair?logId=${x.id}`} className="flex items-center justify-between rounded-[11px] border border-[#F1E8E4] px-3 py-2.5 hover:bg-[#FCF8F6]"><div><p className="text-[10px] font-medium">{x.eventType}</p><p className="text-[8px] text-[#92867E]">{x.style ?? x.products ?? 'Hair care log'}</p></div><span className="text-[8px] text-[#A5877E]">{fmt(x.occurredAt)}</span></Link>)}{!logs.length ? <Empty text="Your completed hair care will build a history here."/> : null}</div></B>
      </section> : null}

      <details className="rounded-[18px] border border-[#EEE3DE] bg-white p-4">
        <summary className="cursor-pointer text-[10px] font-medium text-[#C9727E]">+ Log hair care, style, products or result</summary>
        <form action={createHairLogAction} className="mt-3 grid gap-2 md:grid-cols-3">
          <input name="eventType" required placeholder="Wash, trim, treatment…" className={F}/>
          <input name="occurredAt" type="datetime-local" aria-label="Hair care date and time" className={F}/>
          <input name="style" placeholder="Style" className={F}/>
          <input name="products" placeholder="Products used, separated by commas" className={F}/>
          <input name="nextAction" placeholder="Next action" className={F}/>
          <label className="flex min-h-9 items-center gap-2 rounded-lg border border-[#EEE3DE] bg-white px-3 text-[10px]"><input name="heatUsed" type="checkbox"/> Heat used</label>
          <textarea name="notes" rows={3} placeholder="Scalp, dryness, buildup, breakage, shedding, moisture, result…" className={`${F} md:col-span-3`}/>
          <button type="submit" className="w-fit rounded-full bg-[#C9727E] px-4 py-2 text-[10px] text-white">Save hair log</button>
        </form>
      </details>

      {guided ? <div className="fixed inset-0 z-[90] grid place-items-end bg-[#3C2D28]/25 p-3 backdrop-blur-[3px] sm:place-items-center" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="guided-hair-title" className="max-h-[calc(100dvh-24px)] w-full max-w-[620px] overflow-y-auto rounded-[28px] border border-white/70 bg-[#FFFDFC] shadow-[0_30px_100px_rgba(49,33,28,.25)]"><div className="border-b border-[#F0E3DE] bg-[linear-gradient(135deg,#F8E9E7,#FFFDFC)] p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[8px] uppercase tracking-[.16em] text-[#AE7378]">Guided Hair · {guided.cadence}</p><h2 id="guided-hair-title" className="glow-display mt-1 text-[25px] text-[#40332D]">{guided.name}</h2><p className="mt-1 text-[9px] text-[#8C7770]">Step {stepIndex + 1} of {guided.steps.length} · {completedCount} completed · {guided.minutes}</p></div><button type="button" aria-label="Close guided hair routine" onClick={() => setGuided(null)} className="rounded-full border border-[#EADDD8] px-3 py-1.5 text-[9px] text-[#8F7770]">Close</button></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#C9727E] transition-all" style={{ width: `${((stepIndex + 1) / guided.steps.length) * 100}%` }}/></div></div></div><div className="p-5 sm:p-7"><div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#F6E3E5] glow-display text-[18px] text-[#A85E69]">{stepIndex + 1}</span><h3 className="glow-display text-[22px] text-[#433630]">{guided.steps[stepIndex].title}</h3></div><p className="mt-5 rounded-[16px] bg-[#FAF4F1] p-4 text-[11px] leading-6 text-[#6F5D56]">{guided.steps[stepIndex].detail}</p><label className="mt-5 flex cursor-pointer items-center gap-3 rounded-[14px] border border-[#F0E4DF] p-3 text-[10px] text-[#6D5C55]"><input type="checkbox" checked={!!completed[`${guided.id}-${stepIndex}`]} onChange={(e) => setCompleted((old) => ({ ...old, [`${guided.id}-${stepIndex}`]: e.target.checked }))}/><span>Mark this step complete</span></label><div className="mt-6 flex items-center justify-between gap-2"><button type="button" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => Math.max(0, i - 1))} className="rounded-full border border-[#E8DAD5] px-4 py-2.5 text-[10px] disabled:opacity-35">Back</button><button type="button" onClick={() => { if (stepIndex >= guided.steps.length - 1) { setGuided(null); setStepIndex(0); } else setStepIndex((i) => i + 1); }} className="rounded-full bg-[#5B413A] px-5 py-2.5 text-[10px] font-medium text-white">{stepIndex >= guided.steps.length - 1 ? 'Finish routine ✦' : 'Next step'}</button></div></div></div></div> : null}

      {play ? <RoutineStepPlayer routine={play} steps={routineSteps.filter((x) => x.routineId === play.id).sort((a, b) => a.order - b.order)} stats={[]} rules={[]} calendarEvents={events} context={{ locationMode: 'anywhere' }} onClose={() => setPlay(null)}/> : null}
    </div>
  );
}

function count(a: string[]) { return a.reduce<Record<string, number>>((o, x) => (o[x] = (o[x] ?? 0) + 1, o), {}); }
function S({ l, v, s }: { l: string; v: string; s: string }) { return <div className="rounded-[18px] border border-[#EEE3DE] bg-white p-4"><p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[#8F7B72]">{l}</p><p className="glow-display mt-2 text-[18px] text-[#43352F]">{v}</p><p className="mt-1 text-[9px] text-[#92867E]">{s}</p></div>; }
function B({ t, subtitle, children }: { t: string; subtitle?: string; children: React.ReactNode }) { return <div className="rounded-[20px] border border-[#EEE3DE] bg-white p-5 shadow-[0_10px_45px_rgba(77,52,43,.035)]"><h2 className="glow-display text-[17px] text-[#43362F]">{t}</h2>{subtitle ? <p className="mt-1 text-[9px] leading-4 text-[#94827A]">{subtitle}</p> : null}<div className="mt-4">{children}</div></div>; }
function Pill({ icon, text }: { icon: React.ReactNode; text: string }) { return <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3 py-1.5">{icon}{text}</span>; }
function Empty({ text }: { text: string }) { return <p className="rounded-[12px] bg-[#FAF6F4] p-3 text-[9px] leading-5 text-[#8B7971]">{text}</p>; }
function Cadence({ label, detail }: { label: string; detail: string }) { return <div className="border-b border-[#F2E9E5] py-3 last:border-0"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-[#B06A73]">{label}</p><p className="mt-1 text-[10px] leading-5 text-[#6F6059]">{detail}</p></div>; }
function MiniStat({ label, value }: { label: string; value: string }) { return <div className="rounded-[13px] bg-[#FAF4F1] p-3"><p className="text-[8px] uppercase tracking-[.1em] text-[#A1847A]">{label}</p><p className="glow-display mt-1 text-[15px] text-[#4D3C35]">{value}</p></div>; }
function RoutineButton({ routine, onClick }: { routine: MasterRoutine; onClick: () => void }) { return <button type="button" onClick={onClick} className="group flex items-center gap-3 rounded-[15px] border border-[#F0E5E0] bg-[#FFFDFC] p-3 text-left transition hover:-translate-y-px hover:border-[#DDB9B3] hover:shadow-sm"><RoutineIcon kind={routine.icon}/><span className="min-w-0 flex-1"><b className="block text-[10px] font-medium text-[#51423B]">{routine.name}</b><small className="mt-0.5 block truncate text-[8px] text-[#948078]">{routine.cadence} · {routine.steps.length} steps</small></span><ChevronRight className="text-[#C89B96] transition group-hover:translate-x-0.5" size={13}/></button>; }
function RoutineIcon({ kind }: { kind: MasterRoutine['icon'] }) { const Icon = kind === 'sun' ? Sun : kind === 'moon' ? Moon : kind === 'wash' ? Droplets : kind === 'refresh' ? RotateCcw : Heart; return <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[linear-gradient(145deg,#F8E7E5,#F6F0EC)] text-[#B56E76]"><Icon size={15}/></span>; }
