'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Camera,
  Check,
  ChevronRight,
  CircleDot,
  Eye,
  FlaskConical,
  Heart,
  Image as ImageIcon,
  Lightbulb,
  Mic,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Target,
  WandSparkles,
} from 'lucide-react';

type Mode = 'Today' | 'Study Map' | 'Observations' | 'Experiments' | 'Playbook' | 'Evidence' | 'Progress' | 'Archive';
type Confidence = 'Trying' | 'Promising' | 'Works for me' | 'Retired';
type StudyArea = 'Face' | 'Skin' | 'Hair' | 'Makeup' | 'Brows + Lashes' | 'Smile' | 'Body + Grooming' | 'Style' | 'Color + Contrast' | 'Posture + Presence' | 'Photos + Angles' | 'Expression + Voice';

type StudyNote = {
  id: string;
  createdAt: string;
  area: StudyArea;
  title: string;
  detail: string;
  source: string;
  confidence: Confidence;
  evidence: string;
  archived: boolean;
};

type Experiment = {
  id: string;
  createdAt: string;
  area: StudyArea;
  title: string;
  change: string;
  measure: string;
  result: string;
  status: 'Planned' | 'Testing' | 'Complete';
};

type MemoryState = {
  notes: StudyNote[];
  experiments: Experiment[];
  focusAreas: StudyArea[];
  favoriteLook: string;
};

const STORAGE_KEY = 'glow:study-yourself-hotter:v1';
const MODES: Mode[] = ['Today', 'Study Map', 'Observations', 'Experiments', 'Playbook', 'Evidence', 'Progress', 'Archive'];
const AREAS: StudyArea[] = ['Face', 'Skin', 'Hair', 'Makeup', 'Brows + Lashes', 'Smile', 'Body + Grooming', 'Style', 'Color + Contrast', 'Posture + Presence', 'Photos + Angles', 'Expression + Voice'];
const CONFIDENCE: Confidence[] = ['Trying', 'Promising', 'Works for me', 'Retired'];
const DEFAULTS: MemoryState = { notes: [], experiments: [], focusAreas: ['Face', 'Hair', 'Makeup', 'Style'], favoriteLook: '' };

const areaDescriptions: Record<StudyArea, string> = {
  Face: 'Shape, balance, facial styling, massage, framing and what changes the overall impression.',
  Skin: 'Texture, glow, hydration, finish, prep and how skin affects the whole look.',
  Hair: 'Part, volume, length, shape, texture, color, framing and styling patterns.',
  Makeup: 'Placement, intensity, finishes, contrast, proportions, combinations and repeatable looks.',
  'Brows + Lashes': 'Shape, lift, density, direction, definition and eye framing.',
  Smile: 'Teeth, lips, lip shape, expression, smile styling and grooming observations.',
  'Body + Grooming': 'Body care, nails, fragrance, polish, grooming and finishing details.',
  Style: 'Silhouette, necklines, proportions, jewelry, shoes, bags and outfit formulas.',
  'Color + Contrast': 'Colors near the face, contrast level, metal tones, prints and visual harmony.',
  'Posture + Presence': 'Posture, movement, pacing, eye contact, confidence cues and how you carry a look.',
  'Photos + Angles': 'Lighting, camera height, pose, lens distance, expression and repeatable photo setups.',
  'Expression + Voice': 'Facial expression, warmth, voice, pacing, energy and social presentation.',
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeState(value: unknown): MemoryState {
  if (!value || typeof value !== 'object') return DEFAULTS;
  const raw = value as Partial<MemoryState>;
  const notes = Array.isArray(raw.notes)
    ? raw.notes.filter((item): item is StudyNote => Boolean(item && typeof item === 'object' && typeof (item as StudyNote).title === 'string')).slice(-300)
    : [];
  const experiments = Array.isArray(raw.experiments)
    ? raw.experiments.filter((item): item is Experiment => Boolean(item && typeof item === 'object' && typeof (item as Experiment).title === 'string')).slice(-120)
    : [];
  const focusAreas = Array.isArray(raw.focusAreas)
    ? raw.focusAreas.filter((area): area is StudyArea => AREAS.includes(area as StudyArea)).slice(0, 6)
    : DEFAULTS.focusAreas;
  return { notes, experiments, focusAreas: focusAreas.length ? focusAreas : DEFAULTS.focusAreas, favoriteLook: typeof raw.favoriteLook === 'string' ? raw.favoriteLook : '' };
}

function openGlow(prompt: string) {
  window.dispatchEvent(new CustomEvent('glow:open-conversation', { detail: { prompt } }));
}

export function StudyYourselfHotterStudio() {
  const [mode, setMode] = useState<Mode>('Today');
  const [memory, setMemory] = useState<MemoryState>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [areaFilter, setAreaFilter] = useState<StudyArea | 'All'>('All');
  const [search, setSearch] = useState('');
  const [draftArea, setDraftArea] = useState<StudyArea>('Face');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDetail, setDraftDetail] = useState('');
  const [draftSource, setDraftSource] = useState('Personal observation');
  const [draftEvidence, setDraftEvidence] = useState('');
  const [showCapture, setShowCapture] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMemory(normalizeState(JSON.parse(raw)));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memory)); } catch {}
  }, [memory, hydrated]);

  const activeNotes = memory.notes.filter((note) => !note.archived);
  const playbook = activeNotes.filter((note) => note.confidence === 'Works for me');
  const promising = activeNotes.filter((note) => note.confidence === 'Promising');
  const trying = activeNotes.filter((note) => note.confidence === 'Trying');
  const completedExperiments = memory.experiments.filter((item) => item.status === 'Complete');
  const inFlight = memory.experiments.filter((item) => item.status !== 'Complete');

  const visibleNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return memory.notes
      .filter((note) => mode === 'Archive' ? note.archived || note.confidence === 'Retired' : !note.archived)
      .filter((note) => areaFilter === 'All' || note.area === areaFilter)
      .filter((note) => !q || `${note.title} ${note.detail} ${note.source} ${note.evidence} ${note.area}`.toLowerCase().includes(q))
      .slice()
      .reverse();
  }, [memory.notes, mode, areaFilter, search]);

  const strongestAreas = useMemo(() => {
    return AREAS.map((area) => ({ area, count: playbook.filter((note) => note.area === area).length, promising: promising.filter((note) => note.area === area).length }))
      .sort((a, b) => (b.count * 2 + b.promising) - (a.count * 2 + a.promising));
  }, [playbook, promising]);

  function addStudyNote() {
    if (!draftTitle.trim() && !draftDetail.trim()) return;
    const title = draftTitle.trim() || draftDetail.trim().slice(0, 54);
    const note: StudyNote = {
      id: uid('note'),
      createdAt: new Date().toISOString(),
      area: draftArea,
      title,
      detail: draftDetail.trim(),
      source: draftSource.trim() || 'Personal observation',
      confidence: 'Trying',
      evidence: draftEvidence.trim(),
      archived: false,
    };
    setMemory((current) => ({ ...current, notes: [...current.notes, note].slice(-300) }));
    setDraftTitle('');
    setDraftDetail('');
    setDraftEvidence('');
    setShowCapture(false);
  }

  function updateNote(id: string, patch: Partial<StudyNote>) {
    setMemory((current) => ({ ...current, notes: current.notes.map((note) => note.id === id ? { ...note, ...patch } : note) }));
  }

  function startExperiment(note: StudyNote) {
    const experiment: Experiment = {
      id: uid('experiment'),
      createdAt: new Date().toISOString(),
      area: note.area,
      title: note.title,
      change: note.detail || `Test whether “${note.title}” improves the overall look.` ,
      measure: 'Compare the result in the same lighting/context and write what changed.',
      result: '',
      status: 'Testing',
    };
    setMemory((current) => ({ ...current, experiments: [...current.experiments, experiment].slice(-120) }));
    setMode('Experiments');
  }

  function updateExperiment(id: string, patch: Partial<Experiment>) {
    setMemory((current) => ({ ...current, experiments: current.experiments.map((item) => item.id === id ? { ...item, ...patch } : item) }));
  }

  function toggleFocus(area: StudyArea) {
    setMemory((current) => {
      const has = current.focusAreas.includes(area);
      const focusAreas = has ? current.focusAreas.filter((item) => item !== area) : [...current.focusAreas, area].slice(-6);
      return { ...current, focusAreas: focusAreas.length ? focusAreas : [area] };
    });
  }

  return <div className="mx-auto max-w-[1500px] space-y-5 pb-28 text-[#2f2929]">
    <section className="relative overflow-hidden rounded-[36px] border border-[#eadfdc] bg-[radial-gradient(circle_at_13%_7%,rgba(255,236,241,.95),transparent_31%),radial-gradient(circle_at_86%_10%,rgba(241,235,249,.92),transparent_34%),radial-gradient(circle_at_56%_100%,rgba(235,228,215,.7),transparent_42%),linear-gradient(140deg,#fffdfb_0%,#f9f3f1_47%,#f6f2f8_100%)] px-5 py-6 shadow-[0_28px_100px_rgba(66,44,45,.09)] sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border border-white/75 bg-white/20 blur-[1px]" />
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-3xl">
          <p className="text-[9px] uppercase tracking-[.28em] text-[#a56f7d]">Beauty Intelligence · Personal Study</p>
          <h1 className="mt-2 font-serif text-[40px] leading-[.98] text-[#2f2929] sm:text-[56px]">Study Yourself Hotter</h1>
          <p className="mt-4 max-w-2xl text-[12px] leading-6 text-[#796e6b]">A living laboratory for learning what makes you look and feel most attractive to yourself. Observe → compare → test → keep what works → build your personal playbook.</p>
          <p className="mt-3 text-[10px] leading-5 text-[#9a8f8b]">No universal “hotness score.” This page studies repeatable choices, context and your own results instead of turning appearance into one number.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setShowCapture(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#322b2b] px-5 py-3 text-[11px] text-white"><Sparkles size={14}/>Add study note</button>
          <button type="button" onClick={() => openGlow('Open Study Yourself Hotter with me. Help me analyze one appearance choice at a time, separate observation from assumption, suggest a simple comparison or experiment, and only promote something into my playbook when I say it works for me.')} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#dfd3cf] bg-white/75 px-5 py-3 text-[11px]"><Mic size={14}/>Study with Glow</button>
        </div>
      </div>
      <div className="relative mt-7 flex gap-2 overflow-x-auto pb-1">{MODES.map((item) => <button type="button" key={item} onClick={() => setMode(item)} aria-pressed={mode === item} className={`min-h-10 shrink-0 rounded-full px-4 text-[10px] transition ${mode === item ? 'bg-[#3a3131] text-white' : 'border border-[#e8dcda] bg-white/70 text-[#746967]'}`}>{item}</button>)}</div>
    </section>

    {mode === 'Today' && <div className="grid gap-4 xl:grid-cols-[1.18fr_.82fr]">
      <section className="rounded-[30px] border border-[#eadfdb] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.2em] text-[#ad7784]">Study focus · now</p><h2 className="mt-1 font-serif text-3xl">What are we learning about you?</h2></div><button type="button" onClick={() => setShowCapture(true)} className="rounded-full bg-[#f8eff1] px-4 py-2 text-[10px] text-[#9a6673]">Capture something you noticed</button></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Trying" value={`${trying.length}`} detail="ideas still being tested" />
          <Metric label="Promising" value={`${promising.length}`} detail="patterns worth repeating" />
          <Metric label="Works for me" value={`${playbook.length}`} detail="personal playbook rules" />
          <Metric label="Experiments" value={`${inFlight.length}`} detail="active comparisons" />
        </div>
        <div className="mt-6 rounded-[24px] bg-[linear-gradient(135deg,#fff6f7,#f7f3fb)] p-5">
          <div className="flex items-center gap-2"><WandSparkles size={15} className="text-[#aa7180]"/><p className="text-[9px] uppercase tracking-[.18em] text-[#9e7180]">Best next move</p></div>
          <h3 className="mt-2 font-serif text-2xl">Study one variable at a time.</h3>
          <p className="mt-2 max-w-2xl text-[12px] leading-6 text-[#756a68]">Change one thing, keep lighting/context as similar as practical, compare the result, then record what actually improved the look. This keeps the page from turning guesses into rules.</p>
          <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setMode('Experiments')} className="rounded-full bg-[#352e2e] px-4 py-2 text-[10px] text-white">Start a comparison</button><button type="button" onClick={() => openGlow('Help me choose one appearance variable to study today. Use my Study Yourself Hotter notes if available. Give me a simple A/B comparison and tell me what to keep constant.')} className="rounded-full border border-[#dfd3cf] bg-white px-4 py-2 text-[10px]">Ask Glow what to test</button></div>
        </div>
        <div className="mt-6"><p className="text-[9px] uppercase tracking-[.18em] text-[#a28d87]">Current focus areas</p><div className="mt-3 flex flex-wrap gap-2">{memory.focusAreas.map((area) => <button type="button" key={area} onClick={() => { setAreaFilter(area); setMode('Study Map'); }} className="rounded-full border border-[#eadfdb] bg-[#fbf8f7] px-4 py-2 text-[10px]">{area}</button>)}</div></div>
      </section>
      <div className="space-y-4">
        <section className="rounded-[30px] border border-[#eadfdb] bg-[linear-gradient(145deg,#fffaf8,#f8f3f6)] p-5"><div className="flex items-center gap-2"><Heart size={15} className="text-[#ae7482]"/><h3 className="font-serif text-xl">Personal playbook</h3></div>{playbook.length ? <div className="mt-4 space-y-2">{playbook.slice(-4).reverse().map((note) => <button type="button" key={note.id} onClick={() => { setAreaFilter(note.area); setMode('Playbook'); }} className="w-full rounded-[18px] bg-white/80 p-3 text-left"><div className="text-[9px] uppercase tracking-[.14em] text-[#ae8991]">{note.area}</div><div className="mt-1 text-[12px] font-medium">{note.title}</div></button>)}</div> : <p className="mt-4 text-[11px] leading-5 text-[#857a77]">Nothing is locked in yet. That is intentional. Your playbook should grow from things you actually test and choose.</p>}</section>
        <section className="rounded-[30px] border border-[#eadfdb] bg-white p-5"><div className="flex items-center gap-2"><Camera size={15} className="text-[#8e7a74]"/><h3 className="font-serif text-xl">Study rules</h3></div><div className="mt-4 space-y-2 text-[11px] leading-5 text-[#756c69]"><p>1. Separate a source&apos;s claim from your own result.</p><p>2. Compare similar lighting, angle and context when possible.</p><p>3. Keep one variable different at a time.</p><p>4. “Works for me” requires your confirmation.</p><p>5. Retire rules that stop feeling useful.</p></div></section>
      </div>
    </div>}

    {mode === 'Study Map' && <section className="rounded-[30px] border border-[#eadfdb] bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.2em] text-[#ad7784]">Study map</p><h2 className="mt-1 font-serif text-3xl">Everything that shapes the whole impression</h2><p className="mt-2 max-w-2xl text-[11px] leading-5 text-[#7d7270]">Tap an area to study it, add evidence, test a change or promote a result into your playbook.</p></div><div className="flex gap-2"><button type="button" onClick={() => setAreaFilter('All')} className="rounded-full border border-[#e5d9d6] px-3 py-2 text-[10px]">All areas</button><button type="button" onClick={() => setShowCapture(true)} className="rounded-full bg-[#352e2e] px-4 py-2 text-[10px] text-white">Add note</button></div></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{AREAS.map((area) => {
        const count = activeNotes.filter((note) => note.area === area).length;
        const works = playbook.filter((note) => note.area === area).length;
        const focused = memory.focusAreas.includes(area);
        return <article key={area} className={`rounded-[24px] border p-4 ${areaFilter === area ? 'border-[#d9b8c1] bg-[#fff7f9]' : 'border-[#eee3df] bg-[#fcfaf9]'}`}><button type="button" onClick={() => setAreaFilter(area)} className="w-full text-left"><div className="flex items-start justify-between gap-3"><div><p className="text-[9px] uppercase tracking-[.15em] text-[#a58e88]">{count} notes · {works} proven</p><h3 className="mt-1 font-serif text-xl">{area}</h3></div><ChevronRight size={15} className="text-[#b2959c]"/></div><p className="mt-3 text-[10px] leading-5 text-[#817572]">{areaDescriptions[area]}</p></button><button type="button" onClick={() => toggleFocus(area)} aria-pressed={focused} className={`mt-4 rounded-full px-3 py-1.5 text-[9px] ${focused ? 'bg-[#ead8dd] text-[#805661]' : 'border border-[#e5dad6]'}`}>{focused ? 'Current focus' : 'Add to focus'}</button></article>;
      })}</div>
      {areaFilter !== 'All' && <div className="mt-6 rounded-[26px] bg-[#faf7f6] p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.18em] text-[#a88a90]">Selected study area</p><h3 className="mt-1 font-serif text-2xl">{areaFilter}</h3><p className="mt-2 max-w-2xl text-[11px] leading-5 text-[#7c716e]">{areaDescriptions[areaFilter]}</p></div><button type="button" onClick={() => { setDraftArea(areaFilter); setShowCapture(true); }} className="rounded-full bg-white px-4 py-2 text-[10px]">Add finding</button></div><div className="mt-4 grid gap-2 md:grid-cols-2">{activeNotes.filter((note) => note.area === areaFilter).slice().reverse().slice(0, 8).map((note) => <NoteMini key={note.id} note={note} onOpen={() => setMode(note.confidence === 'Works for me' ? 'Playbook' : 'Observations')} />)}{!activeNotes.some((note) => note.area === areaFilter) && <p className="text-[11px] text-[#8a7f7b]">No observations here yet. Start with one specific thing you notice.</p>}</div></div>}
    </section>}

    {(mode === 'Observations' || mode === 'Playbook' || mode === 'Evidence' || mode === 'Archive') && <section className="rounded-[30px] border border-[#eadfdb] bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.2em] text-[#ad7784]">{mode}</p><h2 className="mt-1 font-serif text-3xl">{mode === 'Playbook' ? 'Your personal attraction playbook' : mode === 'Evidence' ? 'What supports each idea?' : mode === 'Archive' ? 'Retired and archived ideas' : 'Study observations'}</h2></div><button type="button" onClick={() => setShowCapture(true)} className="rounded-full bg-[#352e2e] px-4 py-2 text-[10px] text-white">Add finding</button></div>
      <div className="mt-5 flex flex-wrap gap-2"><div className="relative min-w-[220px] flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a4938d]"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your study..." className="w-full rounded-full border border-[#e7dcda] bg-[#fcfaf9] py-2.5 pl-9 pr-4 text-[11px] outline-none"/></div><select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value as StudyArea | 'All')} className="rounded-full border border-[#e7dcda] bg-white px-4 py-2.5 text-[10px]"><option value="All">All areas</option>{AREAS.map((area) => <option key={area}>{area}</option>)}</select></div>
      <div className="mt-6 space-y-3">{visibleNotes
        .filter((note) => mode === 'Playbook' ? note.confidence === 'Works for me' : mode === 'Evidence' ? Boolean(note.evidence) : true)
        .map((note) => <StudyNoteCard key={note.id} note={note} onUpdate={(patch) => updateNote(note.id, patch)} onExperiment={() => startExperiment(note)} />)}
        {!visibleNotes.filter((note) => mode === 'Playbook' ? note.confidence === 'Works for me' : mode === 'Evidence' ? Boolean(note.evidence) : true).length && <div className="rounded-[22px] bg-[#faf7f6] p-5 text-[11px] text-[#837875]">Nothing in this view yet.</div>}
      </div>
    </section>}

    {mode === 'Experiments' && <section className="rounded-[30px] border border-[#eadfdb] bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.2em] text-[#ad7784]">Experiments</p><h2 className="mt-1 font-serif text-3xl">Test, don’t guess.</h2><p className="mt-2 max-w-2xl text-[11px] leading-5 text-[#7d7270]">A/B comparisons keep internet advice, assumptions and personal preference from blending together.</p></div><button type="button" onClick={() => openGlow('Help me design a simple beauty or styling A/B test for Study Yourself Hotter. Change one variable only, keep the comparison fair, and give me a short result checklist.')} className="rounded-full bg-[#352e2e] px-4 py-2 text-[10px] text-white">Design a test with Glow</button></div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">{memory.experiments.slice().reverse().map((item) => <article key={item.id} className="rounded-[24px] border border-[#ece1de] bg-[#fcfaf9] p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[9px] uppercase tracking-[.16em] text-[#a88991]">{item.area} · {item.status}</p><h3 className="mt-1 font-serif text-xl">{item.title}</h3></div><FlaskConical size={16} className="text-[#aa7d88]"/></div><div className="mt-4 space-y-3 text-[11px] leading-5 text-[#746967]"><div><strong className="text-[#433b39]">Change</strong><p>{item.change}</p></div><div><strong className="text-[#433b39]">Compare</strong><p>{item.measure}</p></div></div><textarea value={item.result} onChange={(e) => updateExperiment(item.id, { result: e.target.value })} placeholder="What happened? What looked better, worse or simply different?" className="mt-4 min-h-24 w-full rounded-[18px] border border-[#e6dad7] bg-white p-3 text-[11px] outline-none"/><div className="mt-3 flex flex-wrap gap-2">{(['Planned','Testing','Complete'] as const).map((status) => <button type="button" key={status} onClick={() => updateExperiment(item.id, { status })} aria-pressed={item.status === status} className={`rounded-full px-3 py-1.5 text-[9px] ${item.status === status ? 'bg-[#ead8dd] text-[#805661]' : 'border border-[#e4d8d5]'}`}>{status}</button>)}</div></article>)}{!memory.experiments.length && <div className="rounded-[24px] bg-[#faf7f6] p-5 text-[11px] text-[#837875]">No experiments yet. Start from an observation and tap “Test this.”</div>}</div>
    </section>}

    {mode === 'Progress' && <section className="rounded-[30px] border border-[#eadfdb] bg-white p-5 sm:p-7">
      <div><p className="text-[9px] uppercase tracking-[.2em] text-[#ad7784]">Progress</p><h2 className="mt-1 font-serif text-3xl">How your personal formula is becoming clearer</h2></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Study notes" value={`${activeNotes.length}`} detail="active observations"/><Metric label="Completed tests" value={`${completedExperiments.length}`} detail="comparisons with a result"/><Metric label="Playbook rules" value={`${playbook.length}`} detail="confirmed by you"/><Metric label="Focus areas" value={`${memory.focusAreas.length}`} detail="what you are studying now"/></div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-[24px] bg-[#faf7f6] p-5"><p className="text-[9px] uppercase tracking-[.18em] text-[#a58d87]">Where your strongest personal evidence is forming</p><div className="mt-4 space-y-2">{strongestAreas.slice(0, 8).map(({ area, count, promising: p }) => <div key={area} className="flex items-center justify-between rounded-[16px] bg-white px-3 py-3 text-[11px]"><span>{area}</span><span className="text-[#a57b85]">{count} proven · {p} promising</span></div>)}</div></div><div className="rounded-[24px] bg-[linear-gradient(145deg,#fff6f8,#f7f3fb)] p-5"><p className="text-[9px] uppercase tracking-[.18em] text-[#a58d87]">Signature look memory</p><textarea value={memory.favoriteLook} onChange={(e) => setMemory((current) => ({ ...current, favoriteLook: e.target.value }))} placeholder="Describe the version of you that consistently feels most attractive: hair, makeup, outfit, posture, lighting, expression..." className="mt-4 min-h-40 w-full rounded-[18px] border border-white bg-white/80 p-4 text-[11px] leading-5 outline-none"/><p className="mt-3 text-[10px] text-[#887c78]">This is your own description, not a Glow-generated score.</p></div></div>
    </section>}

    <section className="rounded-[30px] border border-[#eadfdb] bg-[linear-gradient(135deg,#fffaf9,#f8f4f8)] p-5 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-start gap-3"><Brain className="mt-0.5 h-4 w-4 text-[#a97884]"/><div><p className="text-[9px] uppercase tracking-[.18em] text-[#a7818a]">Ask Glow · Study mode</p><p className="mt-1 max-w-2xl text-[11px] leading-5 text-[#766c69]">Turn a sentence, screenshot, video tip or personal observation into a clean study note, fair test or playbook update.</p></div></div><div className="flex flex-wrap gap-2">{['What should I study next?','Help me compare two looks','Turn this into an experiment','What actually works for me?'].map((prompt) => <button type="button" key={prompt} onClick={() => openGlow(`${prompt} Use my Study Yourself Hotter system. Separate observations from claims and do not turn something into a personal rule unless I confirm it works for me.`)} className="rounded-full border border-[#e3d7d4] bg-white px-4 py-2 text-[10px]">{prompt}</button>)}</div></div></section>

    <div className="flex justify-between gap-3 px-1"><Link href="/beauty" className="inline-flex items-center gap-1 text-[10px] text-[#8e7c77]">← Beauty Intelligence</Link><Link href="/beauty/gua-sha" className="inline-flex items-center gap-1 text-[10px] text-[#8e7c77]">Gua Sha Studio <ArrowRight size={11}/></Link></div>

    {showCapture && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#302628]/35 p-3 sm:items-center" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCapture(false); }}><div role="dialog" aria-modal="true" aria-label="Add Study Yourself Hotter note" className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[30px] border border-white/80 bg-[#fffdfb] p-5 shadow-[0_30px_100px_rgba(48,36,38,.25)] sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.2em] text-[#a57480]">Capture</p><h3 className="mt-1 font-serif text-2xl">Add to the study</h3><p className="mt-2 text-[10px] leading-5 text-[#857a76]">Raw observations enter as “Trying.” You can promote them later when you have enough personal evidence.</p></div><button type="button" onClick={() => setShowCapture(false)} className="rounded-full border border-[#e5d9d6] px-3 py-1.5 text-[10px]">Close</button></div><div className="mt-5 grid gap-3"><select value={draftArea} onChange={(e) => setDraftArea(e.target.value as StudyArea)} className="rounded-[16px] border border-[#e6dbd7] bg-white px-3 py-3 text-[11px]">{AREAS.map((area) => <option key={area}>{area}</option>)}</select><input value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="Short finding or idea" className="rounded-[16px] border border-[#e6dbd7] px-3 py-3 text-[11px] outline-none"/><textarea value={draftDetail} onChange={(e) => setDraftDetail(e.target.value)} placeholder="Every detail: what changed, placement, product, styling choice, context, why you noticed it..." rows={5} className="rounded-[16px] border border-[#e6dbd7] p-3 text-[11px] leading-5 outline-none"/><input value={draftSource} onChange={(e) => setDraftSource(e.target.value)} placeholder="Source: personal observation, video, person, article..." className="rounded-[16px] border border-[#e6dbd7] px-3 py-3 text-[11px] outline-none"/><textarea value={draftEvidence} onChange={(e) => setDraftEvidence(e.target.value)} placeholder="Evidence so far: photos, repeated compliments, same-light comparison, how it felt, or leave blank" rows={3} className="rounded-[16px] border border-[#e6dbd7] p-3 text-[11px] leading-5 outline-none"/><button type="button" onClick={addStudyNote} className="mt-1 rounded-full bg-[#352e2e] px-5 py-3 text-[11px] text-white">Save as Trying</button></div></div></div>}
  </div>;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-[22px] border border-[#eee3df] bg-[#fcfaf9] p-4"><p className="text-[9px] uppercase tracking-[.16em] text-[#a58e88]">{label}</p><div className="mt-2 font-serif text-3xl">{value}</div><p className="mt-1 text-[10px] text-[#8a7f7b]">{detail}</p></div>;
}

function NoteMini({ note, onOpen }: { note: StudyNote; onOpen: () => void }) {
  return <button type="button" onClick={onOpen} className="rounded-[18px] bg-white p-3 text-left"><p className="text-[9px] uppercase tracking-[.14em] text-[#a98991]">{note.confidence}</p><p className="mt-1 text-[11px] font-medium">{note.title}</p></button>;
}

function StudyNoteCard({ note, onUpdate, onExperiment }: { note: StudyNote; onUpdate: (patch: Partial<StudyNote>) => void; onExperiment: () => void }) {
  return <article className="rounded-[24px] border border-[#ece1de] bg-[#fcfaf9] p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div className="max-w-3xl"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white px-2.5 py-1 text-[9px] text-[#9e7a82]">{note.area}</span><span className="text-[9px] uppercase tracking-[.14em] text-[#aa8f89]">{note.confidence}</span></div><h3 className="mt-2 font-serif text-xl">{note.title}</h3>{note.detail && <p className="mt-2 text-[11px] leading-5 text-[#766c69]">{note.detail}</p>}<div className="mt-3 grid gap-2 text-[10px] text-[#918581] sm:grid-cols-2"><div><strong className="text-[#655b58]">Source</strong><p>{note.source}</p></div><div><strong className="text-[#655b58]">Evidence</strong><p>{note.evidence || 'Not recorded yet'}</p></div></div></div><div className="flex flex-wrap gap-2">{CONFIDENCE.map((status) => <button type="button" key={status} onClick={() => onUpdate({ confidence: status })} aria-pressed={note.confidence === status} className={`rounded-full px-3 py-1.5 text-[9px] ${note.confidence === status ? 'bg-[#ead8dd] text-[#805661]' : 'border border-[#e4d8d5] bg-white'}`}>{status}</button>)}</div></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={onExperiment} className="inline-flex items-center gap-1 rounded-full bg-[#352e2e] px-3 py-2 text-[9px] text-white"><FlaskConical size={11}/>Test this</button><button type="button" onClick={() => openGlow(`Study this idea with me: ${note.title}. Area: ${note.area}. Detail: ${note.detail}. Source: ${note.source}. Evidence so far: ${note.evidence || 'none'}. Help me separate claim from observation and design the fairest next test.`)} className="rounded-full border border-[#e3d7d4] bg-white px-3 py-2 text-[9px]">Ask Glow</button><button type="button" onClick={() => onUpdate({ archived: !note.archived })} className="rounded-full border border-[#e3d7d4] bg-white px-3 py-2 text-[9px]">{note.archived ? 'Restore' : 'Archive'}</button></div></article>;
}
