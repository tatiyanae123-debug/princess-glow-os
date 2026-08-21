'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Clock3, Eye, FlaskConical, Mic, Package, Play, RotateCcw, Search, Sparkles, Volume2, WandSparkles } from 'lucide-react';

type Tab = 'Today' | 'Looks' | 'Vanity' | 'Collection' | 'Learn';
type FaceArea = 'Complexion' | 'Brows' | 'Eyes' | 'Cheeks' | 'Lips';
type Journal = { rating: string; base: string; eyes: string; blush: string; lips: string; wear: string; note: string };
type JournalKey = Exclude<keyof Journal, 'note'>;
type JournalField = { label: string; key: JournalKey; options: string[] };
type LookStep = { title: string; detail: string; tool: string };
type Look = { name: string; minutes: number; finish: string; reason: string[]; steps: LookStep[] };
type RecognitionEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
};
type RecognitionCtor = new () => Recognition;

const EMPTY_JOURNAL: Journal = { rating: '', base: '', eyes: '', blush: '', lips: '', wear: '', note: '' };
const JOURNAL_FIELDS: JournalField[] = [
  { label: 'Rating', key: 'rating', options: ['Love it', 'Good', 'Okay', 'Didn’t work'] },
  { label: 'Base', key: 'base', options: ['Perfect', 'Cakey', 'Dry', 'Oily', 'Separated'] },
  { label: 'Eyes', key: 'eyes', options: ['Loved', 'Too dark', 'Uneven'] },
  { label: 'Blush', key: 'blush', options: ['Perfect', 'Too much', 'Wrong placement'] },
  { label: 'Lips', key: 'lips', options: ['Loved', 'Faded', 'Too dry'] },
  { label: 'Wear', key: 'wear', options: ['2 hr', '4 hr', '8 hr+'] },
];

const LOOKS: Look[] = [
  {
    name: 'Everyday Soft Glow', minutes: 12, finish: 'Fresh · luminous · polished',
    reason: ['Fast enough for a normal day', 'Soft definition without heavy powder', 'Easy to pair with most outfits'],
    steps: [
      { title: 'Hydrating prep', detail: 'Light moisturizer through cheeks and around the mouth.', tool: 'Hands' },
      { title: 'Spot conceal + light base', detail: 'Keep coverage thin and targeted.', tool: 'Sponge' },
      { title: 'Cream blush', detail: 'Place high and outward for a lifted finish.', tool: 'Blush brush' },
      { title: 'Soft brows', detail: 'Fill gaps, then brush upward.', tool: 'Brow pencil + gel' },
      { title: 'Mascara', detail: 'Curl first, then focus on the outer lashes.', tool: 'Curler + mascara' },
      { title: 'Pink nude gloss', detail: 'Line softly and blend inward before gloss.', tool: 'Lip liner' },
    ],
  },
  {
    name: 'Soft Romantic', minutes: 22, finish: 'Pink · diffused · evening-ready',
    reason: ['Works with soft pink and neutral outfits', 'Keeps dry areas luminous', 'Photographs well in evening light', 'Fits a medium get-ready window'],
    steps: [
      { title: 'Prime + hydrate', detail: 'Use gripping primer only where you need longevity.', tool: 'Hands' },
      { title: 'Sheer foundation', detail: 'Start in the center and diffuse outward.', tool: 'Damp sponge' },
      { title: 'Brighten under-eye', detail: 'Use a small amount at the inner and outer corners.', tool: 'Concealer brush' },
      { title: 'Rose blush', detail: 'Lift from apple toward upper cheekbone.', tool: 'Cream blush brush' },
      { title: 'Champagne eye', detail: 'Soft brown in crease, shimmer at center lid.', tool: 'Fluffy + flat brush' },
      { title: 'Half lash or mascara', detail: 'Keep the inner corner light.', tool: 'Lash tool' },
      { title: 'Pink glossy lip', detail: 'Neutral-pink liner, then gloss.', tool: 'Lip brush' },
    ],
  },
  {
    name: 'Date Night Glow', minutes: 30, finish: 'Sculpted · glossy · dimensional',
    reason: ['Stronger evening definition', 'Longer wear', 'More dimension in photos'],
    steps: [
      { title: 'Grip primer', detail: 'Press onto high-movement areas.', tool: 'Hands' },
      { title: 'Medium coverage base', detail: 'Build in thin layers.', tool: 'Sponge' },
      { title: 'Cream contour', detail: 'Keep placement lifted.', tool: 'Angled brush' },
      { title: 'Set center', detail: 'Powder only where needed.', tool: 'Small powder brush' },
      { title: 'Bronzer + blush', detail: 'Blend the edges together.', tool: 'Cheek brush' },
      { title: 'Soft smoky eye', detail: 'Keep the deepest shade close to lashes.', tool: 'Eye brushes' },
      { title: 'Lashes + liner', detail: 'Keep liner thin at the inner corner.', tool: 'Liner + lashes' },
      { title: 'Glossy neutral lip', detail: 'Slightly deepen the outer lip line.', tool: 'Lip liner' },
      { title: 'Setting spray', detail: 'Mist and press texture with a sponge if needed.', tool: 'Setting spray' },
    ],
  },
  {
    name: '5 Minute Face', minutes: 5, finish: 'Awake · easy · minimal',
    reason: ['Best when time or energy is low', 'Keeps only the highest-impact steps'],
    steps: [
      { title: 'Conceal', detail: 'Only redness and under-eye shadows.', tool: 'Finger or sponge' },
      { title: 'Brows', detail: 'Brush upward and lightly fill.', tool: 'Brow gel' },
      { title: 'Cream blush', detail: 'Tap cheeks and a tiny amount over the nose.', tool: 'Fingers' },
      { title: 'Mascara', detail: 'One clean coat.', tool: 'Mascara' },
      { title: 'Lip', detail: 'Balm, liner or gloss.', tool: 'Lip product' },
    ],
  },
];

const MODULES: Record<string, string[]> = {
  Base: ['Hydrating', 'Natural', 'Medium coverage', 'Full glam'],
  Eyes: ['Bare', 'Soft brown', 'Pink shimmer', 'Smoky', 'Winged'],
  Lash: ['Mascara', 'Half lash', 'Strip lash', 'Clusters'],
  Lip: ['Glossy nude', 'Pink', 'Brown nude', 'Red'],
};
const DRAWERS = ['Everyday Drawer', 'Full Glam', 'Lips', 'Eyes', 'Tools', 'Backups', 'Almost Empty', 'Expiring'];
const LIP_COMBOS = [
  ['Pink Nude', 'Rose liner → nude lipstick → clear gloss'],
  ['Brown Gloss', 'Brown liner → balm → caramel gloss'],
  ['Soft Rose', 'Pink-brown liner → rose lipstick'],
  ['Going Out Nude', 'Deep nude liner → satin nude → gloss center'],
] as const;
const LESSONS = [
  ['Blush School', '3 / 5'], ['Base School', '2 / 5'], ['Eye School', '1 / 5'], ['Lip School', '2 / 4'],
] as const;

function Pill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`min-h-10 rounded-full px-3.5 text-[11px] transition focus:outline-none focus:ring-2 focus:ring-[#e7c9d0] ${active ? 'bg-[#2f2927] text-white' : 'border border-[#eadfda] bg-white text-[#756b67]'}`}>{label}</button>;
}

function speak(text: string) {
  window.dispatchEvent(new CustomEvent('glow:speak', { detail: { text } }));
}

export function MakeupIntelligenceStudio() {
  const [tab, setTab] = useState<Tab>('Today');
  const [minutes, setMinutes] = useState(20);
  const [energy, setEnergy] = useState('Normal');
  const [guided, setGuided] = useState(false);
  const [look, setLook] = useState<Look>(LOOKS[1]);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');
  const [faceArea, setFaceArea] = useState<FaceArea>('Cheeks');
  const [blushPlacement, setBlushPlacement] = useState('Lifted');
  const [savedPlacement, setSavedPlacement] = useState('');
  const [builder, setBuilder] = useState<Record<string, string>>({ Base: 'Hydrating', Eyes: 'Pink shimmer', Lash: 'Half lash', Lip: 'Pink' });
  const [journal, setJournal] = useState<Journal>(EMPTY_JOURNAL);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('glow:makeup-intelligence');
      if (raw) {
        const parsed = JSON.parse(raw) as { journal?: Journal; savedPlacement?: string; builder?: Record<string, string> };
        if (parsed.journal) setJournal(parsed.journal);
        if (parsed.savedPlacement) setSavedPlacement(parsed.savedPlacement);
        if (parsed.builder) setBuilder(parsed.builder);
      }
    } catch {
      setVoiceStatus('Saved Makeup memory could not be read on this device.');
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('glow:makeup-intelligence', JSON.stringify({ journal, savedPlacement, builder, updatedAt: new Date().toISOString() }));
    } catch {
      setVoiceStatus('This browser blocked local Makeup memory. The current session is still usable.');
    }
  }, [builder, hydrated, journal, savedPlacement]);

  const recommended = useMemo(() => {
    if (minutes <= 7 || energy === 'Low') return LOOKS[3];
    if (minutes <= 15) return LOOKS[0];
    if (minutes <= 25) return LOOKS[1];
    return LOOKS[2];
  }, [energy, minutes]);

  useEffect(() => {
    if (!guided) setLook(recommended);
  }, [guided, recommended]);

  function begin(selected: Look = recommended) {
    setLook(selected);
    setStep(0);
    setDone([]);
    setVoiceStatus('');
    setGuided(true);
    window.setTimeout(() => speak(`Starting ${selected.name}. Step one. ${selected.steps[0].title}. ${selected.steps[0].detail}`), 80);
  }

  function readCurrent() {
    const current = look.steps[step];
    speak(`${current.title}. ${current.detail}. Use ${current.tool}.`);
  }

  function goNext() {
    setStep((current) => {
      const nextStep = Math.min(look.steps.length - 1, current + 1);
      const next = look.steps[nextStep];
      window.setTimeout(() => speak(`${next.title}. ${next.detail}`), 60);
      return nextStep;
    });
  }

  function startVoice() {
    const browser = window as unknown as { webkitSpeechRecognition?: RecognitionCtor; SpeechRecognition?: RecognitionCtor };
    const Ctor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Ctor) {
      setVoiceStatus('Voice recognition is not available here. Every on-screen control still works.');
      return;
    }
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    setListening(true);
    setVoiceStatus('Listening for next, back, repeat, done, tool, skip lashes, or faster.');
    recognition.onresult = (event) => {
      const heard = String(event.results?.[0]?.[0]?.transcript ?? '').toLowerCase().trim();
      setVoiceStatus(heard ? `Heard: ${heard}` : 'I did not catch that.');
      if (heard.includes('next')) goNext();
      else if (heard.includes('back') || heard.includes('previous')) setStep((value) => Math.max(0, value - 1));
      else if (heard.includes('repeat')) readCurrent();
      else if (heard.includes('done')) setDone((current) => current.includes(step) ? current : [...current, step]);
      else if (heard.includes('skip lashes')) {
        const nextIndex = look.steps.findIndex((item, index) => index > step && !/lash/i.test(item.title));
        setStep(nextIndex >= 0 ? nextIndex : Math.min(look.steps.length - 1, step + 1));
      } else if (heard.includes('brush') || heard.includes('tool')) speak(`Use ${look.steps[step].tool}.`);
      else if (heard.includes('faster')) {
        setMinutes(5);
        setLook(LOOKS[3]);
        setStep(0);
        speak('Switching to the five minute face.');
      } else setVoiceStatus(`I heard “${heard || 'nothing'}”. Try next, back, repeat, done, tool, skip lashes, or faster.`);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setVoiceStatus('I could not hear that. Tap the microphone and try again.');
    };
    try {
      recognition.start();
    } catch {
      setListening(false);
      setVoiceStatus('Voice control could not start. Use the on-screen controls and try again later.');
    }
  }

  function openGlow(prompt: string) {
    window.dispatchEvent(new CustomEvent('glow:beauty-context', { detail: { prompt } }));
    document.dispatchEvent(new CustomEvent('glow:open-conversation', { detail: { prompt } }));
  }

  function searchMemory() {
    const query = search.trim().toLowerCase();
    if (!query) return;
    if (query.includes('blush')) setSearchResult(savedPlacement ? `Your saved blush placement is ${savedPlacement}.` : 'You have not saved a blush placement yet.');
    else if (query.includes('lip')) setSearchResult('Your Lip Combo Library includes Pink Nude, Brown Gloss, Soft Rose and Going Out Nude.');
    else if (query.includes('replace') || query.includes('empty')) setSearchResult('Mascara is marked replace soon and Setting Spray is in Project Pan.');
    else setSearchResult('Continue with Glow for an answer using Beauty, Closet, Calendar and your saved memory.');
  }

  if (guided) {
    const current = look.steps[step];
    const progress = Math.round(((step + 1) / look.steps.length) * 100);
    return <div className="mx-auto max-w-4xl pb-28"><section className="overflow-hidden rounded-[32px] border border-[#eadfda] bg-[radial-gradient(circle_at_top,#fff4f8,#fff_48%,#f7f1ee)] shadow-[0_28px_90px_rgba(67,42,36,.09)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee4e0] px-5 py-4 sm:px-7"><div><p className="text-[9px] uppercase tracking-[.2em] text-[#b87989]">Vanity Mode · {progress}%</p><h1 className="mt-1 font-serif text-2xl text-[#302a27]">{look.name}</h1></div><button type="button" onClick={() => setGuided(false)} className="min-h-10 rounded-full border border-[#e8ddda] bg-white px-4 text-[11px]">Exit</button></div>
      <div className="p-5 sm:p-8">
        <div role="progressbar" aria-label="Makeup routine progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-2 overflow-hidden rounded-full bg-[#eee6e3]"><div className="h-full rounded-full bg-[#c98595] transition-all" style={{ width: `${progress}%` }} /></div>
        <div className="mt-7 rounded-[28px] border border-white bg-white/80 p-6 text-center shadow-sm backdrop-blur sm:p-10"><p className="text-[10px] uppercase tracking-[.18em] text-[#a7958f]">Step {step + 1} of {look.steps.length}</p><h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight text-[#332c29] sm:text-4xl">{current.title}</h2><p className="mx-auto mt-3 max-w-xl text-[12px] leading-6 text-[#756b66]">{current.detail}</p><div className="mx-auto mt-5 inline-flex rounded-full bg-[#faf4f4] px-4 py-2 text-[11px] text-[#8a6f73]">Tool: {current.tool}</div>
          <div className="mt-7 flex flex-wrap justify-center gap-2"><button type="button" onClick={readCurrent} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#eadfda] bg-white px-4 text-[11px]"><Volume2 size={14} aria-hidden="true" />Read aloud</button><button type="button" onClick={startVoice} disabled={listening} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#c17c8c] px-4 text-[11px] text-white disabled:opacity-60"><Mic size={14} aria-hidden="true" />{listening ? 'Listening…' : 'Voice control'}</button><button type="button" onClick={() => setDone((value) => value.includes(step) ? value.filter((item) => item !== step) : [...value, step])} aria-pressed={done.includes(step)} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[11px] ${done.includes(step) ? 'bg-[#ebf3e8] text-[#5e7359]' : 'border border-[#eadfda] bg-white'}`}><Check size={14} aria-hidden="true" />{done.includes(step) ? 'Done' : 'Mark done'}</button></div>
          {voiceStatus && <p className="mt-4 text-[10px] text-[#958884]" aria-live="polite">{voiceStatus}</p>}
        </div>
        <div className="mt-6 flex items-center justify-between gap-3"><button type="button" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[#eadfda] bg-white px-4 text-[11px] disabled:opacity-35"><ChevronLeft size={14} aria-hidden="true" />Back</button>{step === look.steps.length - 1 ? <button type="button" onClick={() => { setDone(look.steps.map((_, index) => index)); setGuided(false); setTab('Today'); setJournal((value) => ({ ...value, rating: value.rating || 'Love it' })); speak('Look complete.'); }} className="min-h-11 rounded-full bg-[#2f2927] px-6 text-[11px] text-white">Finish look ♡</button> : <button type="button" onClick={goNext} className="inline-flex min-h-11 items-center gap-1 rounded-full bg-[#2f2927] px-5 text-[11px] text-white">Next<ChevronRight size={14} aria-hidden="true" /></button>}</div>
      </div>
    </section></div>;
  }

  return <div className="mx-auto max-w-[1480px] space-y-4 pb-28">
    <section className="rounded-[30px] border border-[#eadfda] bg-[radial-gradient(circle_at_15%_0%,rgba(255,227,236,.92),transparent_34%),radial-gradient(circle_at_88%_5%,rgba(238,229,248,.86),transparent_35%),linear-gradient(135deg,#fff,#faf5f2)] px-5 py-6 shadow-[0_24px_80px_rgba(67,42,36,.08)] sm:px-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.22em] text-[#b87989]">Beauty · Makeup</p><h1 className="mt-2 font-serif text-[38px] leading-none text-[#302a27] sm:text-[48px]">Makeup Intelligence</h1><p className="mt-3 max-w-2xl text-[12px] leading-6 text-[#786d68]">Choose → build → follow → rate → remember. Your digital vanity adapts to time and energy.</p></div><button type="button" onClick={() => openGlow('Help me choose and adjust my makeup right now.')} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2f2927] px-5 py-3 text-[11px] text-white"><Mic size={14} aria-hidden="true" />Talk to Glow</button></div><nav className="mt-6 flex gap-2 overflow-x-auto pb-1" aria-label="Makeup sections">{(['Today', 'Looks', 'Vanity', 'Collection', 'Learn'] as Tab[]).map((item) => <button key={item} type="button" onClick={() => setTab(item)} aria-pressed={tab === item} className={`min-h-10 shrink-0 rounded-full px-4 text-[11px] ${tab === item ? 'bg-[#2f2927] text-white' : 'border border-[#eadfda] bg-white/80 text-[#756a65]'}`}>{item}</button>)}</nav></section>

    {tab === 'Today' && <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
      <section className="rounded-[28px] border border-[#eadfda] bg-white p-5 sm:p-7"><p className="text-[9px] uppercase tracking-[.18em] text-[#b87989]">Your Makeup Today</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><div><p className="text-[9px] uppercase tracking-[.13em] text-[#9d8e88]">Available time</p><div className="mt-2 flex flex-wrap gap-2">{[5, 12, 20, 30].map((value) => <Pill key={value} active={minutes === value} label={`${value} min`} onClick={() => setMinutes(value)} />)}</div></div><div><p className="text-[9px] uppercase tracking-[.13em] text-[#9d8e88]">Energy</p><div className="mt-2 flex flex-wrap gap-2">{['Low', 'Normal', 'High'].map((value) => <Pill key={value} active={energy === value} label={value} onClick={() => setEnergy(value)} />)}</div></div></div><div className="mt-6 rounded-[26px] bg-[linear-gradient(145deg,#fff4f7,#f8f2f8)] p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.15em] text-[#a57984]">Glow&apos;s pick</p><h2 className="mt-2 font-serif text-3xl text-[#332c29]">{recommended.name}</h2><p className="mt-1 text-[11px] text-[#877773]">{recommended.minutes} min · {recommended.finish}</p></div><Sparkles size={21} className="text-[#c17d8d]" aria-hidden="true" /></div><div className="mt-4 space-y-2">{recommended.reason.map((reason) => <p key={reason} className="flex items-start gap-2 text-[11px] text-[#6f6460]"><Check size={12} className="mt-0.5 shrink-0 text-[#8e9d85]" aria-hidden="true" />{reason}</p>)}</div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => begin()} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#c17c8c] px-5 text-[11px] text-white"><Play size={13} aria-hidden="true" />Start</button><button type="button" onClick={() => setMinutes(5)} className="min-h-11 rounded-full border border-[#eadfda] bg-white px-4 text-[11px]">Make faster</button></div></div></section>
      <section className="rounded-[28px] border border-[#eadfda] bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><Eye size={15} className="text-[#b87989]" aria-hidden="true" /><h2 className="font-serif text-2xl">Face planner</h2></div><div className="mt-4 flex flex-wrap gap-2">{(['Complexion', 'Brows', 'Eyes', 'Cheeks', 'Lips'] as FaceArea[]).map((area) => <Pill key={area} active={faceArea === area} label={area} onClick={() => setFaceArea(area)} />)}</div><div className="relative mx-auto mt-5 aspect-[4/5] max-w-[250px] rounded-[46%_46%_44%_44%] border border-[#eadbd7] bg-[radial-gradient(circle_at_50%_35%,#fff7f5,#f0ddd7)] shadow-inner"><div className="absolute left-[26%] top-[35%] h-2 w-9 rounded-full bg-[#735f5b]/60" /><div className="absolute right-[26%] top-[35%] h-2 w-9 rounded-full bg-[#735f5b]/60" /><div className={`absolute left-[18%] top-[58%] h-7 w-14 rounded-full bg-[#d88798]/40 ${faceArea === 'Cheeks' ? 'ring-2 ring-[#dca3b0]' : ''}`} /><div className={`absolute right-[18%] top-[58%] h-7 w-14 rounded-full bg-[#d88798]/40 ${faceArea === 'Cheeks' ? 'ring-2 ring-[#dca3b0]' : ''}`} /></div>{faceArea === 'Cheeks' && <div className="mt-4"><p className="text-[9px] uppercase tracking-[.14em] text-[#9d8e88]">Blush placement</p><div className="mt-2 flex flex-wrap gap-2">{['Lifted', 'Doll', 'Sun-kissed', 'Soft natural'].map((value) => <Pill key={value} active={blushPlacement === value} label={value} onClick={() => setBlushPlacement(value)} />)}</div><button type="button" onClick={() => setSavedPlacement(blushPlacement)} className="mt-3 rounded-full bg-[#2f2927] px-4 py-2 text-[10px] text-white">Save my blush placement</button>{savedPlacement && <p className="mt-2 text-[10px] text-[#8c7c76]">Saved: {savedPlacement}</p>}</div>}</section>
    </div>}

    {tab === 'Looks' && <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{LOOKS.map((item) => <article key={item.name} className="rounded-[24px] border border-[#eadfda] bg-white p-5"><p className="text-[9px] uppercase tracking-[.15em] text-[#a58f88]">{item.minutes} min</p><h2 className="mt-2 font-serif text-xl text-[#342d2a]">{item.name}</h2><p className="mt-2 text-[11px] leading-5 text-[#817570]">{item.finish}</p><button type="button" onClick={() => begin(item)} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[#2f2927] px-4 text-[10px] text-white">Recreate <ArrowRight size={11} aria-hidden="true" /></button></article>)}</section>}

    {tab === 'Vanity' && <div className="grid gap-4 lg:grid-cols-[1fr_.8fr]"><section className="rounded-[28px] border border-[#eadfda] bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><WandSparkles size={15} className="text-[#b87989]" aria-hidden="true" /><h2 className="font-serif text-2xl">Modular look builder</h2></div><div className="mt-5 space-y-5">{Object.entries(MODULES).map(([group, options]) => <div key={group}><p className="text-[9px] uppercase tracking-[.15em] text-[#9d8e88]">{group}</p><div className="mt-2 flex flex-wrap gap-2">{options.map((option) => <Pill key={option} active={builder[group] === option} label={option} onClick={() => setBuilder((current) => ({ ...current, [group]: option }))} />)}</div></div>)}</div><div className="mt-6 rounded-[20px] bg-[#faf6f5] p-4 text-[11px]">{Object.entries(builder).map(([key, value]) => `${key}: ${value}`).join(' · ')}</div></section><section className="rounded-[28px] border border-[#eadfda] bg-white p-5 sm:p-6"><p className="text-[9px] uppercase tracking-[.18em] text-[#a58f88]">Lip Combo Library</p><div className="mt-3 space-y-2">{LIP_COMBOS.map(([name, steps]) => <button key={name} type="button" onClick={() => speak(`${name}. ${steps}`)} className="w-full rounded-[18px] bg-[#faf7f5] p-4 text-left"><strong className="text-[11px]">{name}</strong><span className="mt-1 block text-[10px] leading-5 text-[#837670]">{steps}</span></button>)}</div></section></div>}

    {tab === 'Collection' && <div className="space-y-4"><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{DRAWERS.map((title) => <div key={title} className="rounded-[22px] border border-[#eadfda] bg-white p-4"><Package size={14} className="text-[#b87989]" aria-hidden="true" /><h3 className="mt-2 font-serif text-lg">{title}</h3></div>)}</section><section className="rounded-[24px] border border-[#eadfda] bg-[linear-gradient(145deg,#fff8fa,#f8f4fb)] p-5"><h2 className="font-serif text-2xl">Shade Intelligence</h2><p className="mt-2 text-[11px] leading-5 text-[#786d68]">Store undertone, depth, seasonal changes and known foundation matches so Glow can relate shades across brands.</p></section></div>}

    {tab === 'Learn' && <div className="grid gap-4 lg:grid-cols-[1fr_.8fr]"><section className="rounded-[28px] border border-[#eadfda] bg-white p-5 sm:p-6"><p className="text-[9px] uppercase tracking-[.18em] text-[#a58f88]">Beauty lessons</p><div className="mt-4 space-y-3">{LESSONS.map(([name, progress]) => <div key={name} className="rounded-[20px] bg-[#faf7f5] p-4"><div className="flex items-center justify-between gap-3"><h3 className="font-serif text-lg">{name}</h3><span className="text-[10px] text-[#a56f7c]">{progress}</span></div></div>)}</div><Link href="/import" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2f2927] px-5 text-[11px] text-white">Import a tutorial <ArrowRight size={12} aria-hidden="true" /></Link></section><section className="rounded-[28px] border border-[#eadfda] bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><FlaskConical size={15} className="text-[#b87989]" aria-hidden="true" /><h2 className="font-serif text-2xl">Makeup experiment</h2></div><p className="mt-3 text-[11px] leading-5 text-[#786d68]">Compare primer, base, placement or wear and save the winner into Beauty memory.</p><Link href="/beauty/lab" className="mt-5 inline-flex items-center gap-1 text-[11px] font-medium text-[#a46d7a]">Open Beauty Lab <ArrowRight size={11} aria-hidden="true" /></Link></section></div>}

    <section className="rounded-[26px] border border-[#eadfda] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[9px] uppercase tracking-[.16em] text-[#a58f88]">Makeup journal</p><p className="mt-1 text-[10px] text-[#8a7d78]">{hydrated ? 'Auto-saves on this device' : 'Loading saved notes…'}</p></div><Clock3 size={15} className="text-[#b87989]" aria-hidden="true" /></div><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{JOURNAL_FIELDS.map((field) => <div key={field.key}><p className="text-[9px] uppercase tracking-[.13em] text-[#9d8e88]">{field.label}</p><div className="mt-2 flex flex-wrap gap-2">{field.options.map((option) => <Pill key={option} active={journal[field.key] === option} label={option} onClick={() => setJournal((current) => ({ ...current, [field.key]: option }))} />)}</div></div>)}</div><label htmlFor="makeup-note" className="sr-only">Makeup journal note</label><textarea id="makeup-note" value={journal.note} onChange={(event) => setJournal((current) => ({ ...current, note: event.target.value }))} placeholder="Anything else Glow should remember?" className="mt-4 min-h-24 w-full rounded-[18px] border border-[#eadfda] p-4 text-[11px] outline-none focus:ring-2 focus:ring-[#ead0d6]" /></section>

    <section className="rounded-[26px] border border-[#eadfda] bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><Search size={15} className="text-[#b87989]" aria-hidden="true" /><h2 className="font-serif text-2xl">Search Makeup memory</h2></div><div className="mt-4 flex gap-2"><label htmlFor="makeup-memory-search" className="sr-only">Search Makeup memory</label><input id="makeup-memory-search" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') searchMemory(); }} placeholder="Which blush looked best?" className="min-h-11 flex-1 rounded-full border border-[#eadfda] px-4 text-[11px] outline-none focus:ring-2 focus:ring-[#ead0d6]" /><button type="button" onClick={searchMemory} aria-label="Search Makeup memory" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2f2927] text-white"><Search size={14} aria-hidden="true" /></button></div>{searchResult && <div className="mt-4 rounded-[18px] bg-[#faf7f5] p-4 text-[11px] leading-5 text-[#706560]">{searchResult}</div>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => { setMinutes(20); setEnergy('Normal'); setSearchResult(''); }} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#eadfda] px-4 text-[10px]"><RotateCcw size={12} aria-hidden="true" />Reset view</button><button type="button" onClick={() => openGlow(search || 'Help me with my makeup right now.')} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#2f2927] px-4 text-[10px] text-white"><Mic size={12} aria-hidden="true" />Continue with Glow</button></div></section>
  </div>;
}
