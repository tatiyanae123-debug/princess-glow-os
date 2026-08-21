'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, CirclePause, Droplets, FileImage, Hand, HeartPulse, Play, RotateCcw, ShieldCheck, Sparkles, Upload, Video, Volume2 } from 'lucide-react';

type Step = { title: string; instruction: string; reps?: string; cue?: string };
type Routine = { name: string; time: string; purpose: string; description: string; steps: Step[] };

const routines: Routine[] = [
  {
    name: 'Daily hands ritual', time: '12–15 min', purpose: 'Calm + release',
    description: 'The complete Lémore-inspired follow-along, using only clean hands.',
    steps: [
      { title: 'Prepare clean skin + hands', instruction: 'Apply facial serum or oil for slip. Hands absorb more product than a tool, so begin with about two pumps if that suits your product. Mix with water in a wet palm, then gently press into face, neck, and chest. Add more product or water whenever the glide stops feeling smooth.', cue: 'Never massage dry or tugging skin.' },
      { title: 'Open the neck', instruction: 'Place one hand on the collarbone. With the other, glide upward along one section of the neck to its edge. Move to the section beside it, then repeat on the other side.', reps: '3 swipes per section', cue: 'Breathe slowly.' },
      { title: 'Under the chin', instruction: 'Place hands under the chin and glide outward and upward to the edge of the jaw, then gently wiggle. Repeat on both sides.', reps: '3 each side' },
      { title: 'Define the jawline', instruction: 'Place thumbs at the chin and lower the chin slightly to create gentle resistance. Glide the thumbs across the jaw toward the ears. Wiggle at the edge.', reps: '3 passes' },
      { title: 'Release the masseters', instruction: 'Make soft fists and place the flat knuckle area over the masseter muscles. Massage gently up and down. Unhinge or relax the jaw as you release tension from talking, eating, grinding, or clenching.', cue: 'No hard digging.' },
      { title: 'Sweep the lower face', instruction: 'Place hands at the center of the lower face and glide outward to the edges. Finish with a small wiggle.', reps: '2 passes' },
      { title: 'Posture reset', instruction: 'Roll the shoulders a few times. Sit or stand tall, open the chest, relax the shoulders, and lengthen the neck.' },
      { title: 'Under the cheekbone', instruction: 'Place hands beneath the cheeks, glide outward under the cheekbone, and wiggle at the edge.', reps: '3 passes' },
      { title: 'Cheekbone divot release', instruction: 'Make fists and settle the knuckles into the divot beneath the cheekbone. Open the mouth gently, massage, move up and down, then sweep upward.' },
      { title: 'Sides of the nose', instruction: 'Place hands beside the nose and sweep upward and outward toward the edges of the face.', reps: '3 passes' },
      { title: 'Under eyes', instruction: 'Use very light pressure under the eyes. Sweep outward to the edge and gently wiggle.', reps: '3 passes', cue: 'Feather-light pressure only.' },
      { title: 'Upper eyes', instruction: 'Place fingers along the upper orbital area and sweep outward. Wiggle gently at the edge.', reps: '3 passes', cue: 'Breathe and soften your face.' },
      { title: 'Eyebrows', instruction: 'Follow the eyebrows from the inner brow outward to the edge.' },
      { title: 'Temple release', instruction: 'Make soft fists and massage the temples back and forth or in circles, just as gently as the jaw release.' },
      { title: 'Forehead lift', instruction: 'With the same soft fists, begin at the center of the forehead. Travel upward and then out toward both sides.', reps: '3 passes' },
      { title: 'Begin the drainage return', instruction: 'Sit tall again. Repeat the face sweeps on the way down with one fewer pass: sides of the face, then under eyes, upper eye area, cheeks, and lower cheeks from the center of the lips outward. Wiggle at each outer edge.', reps: '2 passes per area' },
      { title: 'Jaw + chin return', instruction: 'Sweep the jawline from center to the sides and wiggle. Then glide under the chin to each side and wiggle.', reps: '2 jaw passes; 1–2 each chin side' },
      { title: 'Bring it toward the heart', instruction: 'From beneath the ears and sides of the neck, sweep gently down the neck toward the collarbones and chest. Repeat on both sides.' },
      { title: 'Tap in circulation', instruction: 'With soft finger pads, tap lightly across forehead, around the eyes, whole face, cheeks, nose, upper lip, lips, and chin. Cup one hand and tap down each side of the neck, come back up, then gently tap the chest.' },
      { title: 'Hydrate + close', instruction: 'Drink a cup of water. Notice how your jaw, neck, scalp, breath, and skin feel before leaving the ritual.' },
    ],
  },
  {
    name: 'Simple anti-tension flow', time: '8–10 min', purpose: 'Easy 10-rep sequence',
    description: 'A repeatable knuckle routine for mornings, nights, or when your tool is unavailable.',
    steps: [
      { title: 'Prep after skincare', instruction: 'Wash hands. After skincare, spread moisturizer or face oil across the hands. Keep enough product on the skin for every movement to slide smoothly.', cue: 'Stop and reapply before the skin tugs.' },
      { title: 'Back of ears to shoulders', instruction: 'Using the knuckles, start behind the ears and slide down to the shoulders.', reps: '10 times' },
      { title: 'Front of neck', instruction: 'Use two knuckles. Begin just above the collarbone and glide upward to the jawline.', reps: '10 times' },
      { title: 'Under chin sweep', instruction: 'With the same two knuckles, begin beneath the chin and glide outward across the underside of the jaw.', reps: '10 times' },
      { title: 'Whole neck', instruction: 'Use all knuckles to work smoothly across the neck. Reapply oil or moisturizer if needed.', reps: '10 times' },
      { title: 'Jawline to ears', instruction: 'Place two knuckles at the chin and swipe upward along the jaw to the ears. At the end, press softly beneath the ear for a moment.', reps: '10 times', cue: 'Use light pressure to avoid marks.' },
      { title: 'Chin to temples', instruction: 'Place all knuckles at the chin and massage upward across the face. End by holding softly at the temples for a few seconds.', reps: '10 times' },
      { title: 'Cheek sweep', instruction: 'Place hands beside the nose and glide outward across the cheeks.', reps: '10 times', cue: 'Do not scrape hard.' },
      { title: 'Under-eye glide', instruction: 'Use one finger. Begin beside the nose and glide upward and outward toward the temples.', reps: '10 times', cue: 'Extra gentle here.' },
      { title: 'Brow-bone release', instruction: 'Place two knuckles near the center and slide outward, following the brow bone.', reps: '10 times' },
      { title: 'Forehead to temples', instruction: 'Place knuckles in the middle of the forehead and slide outward and slightly down toward the temples.', reps: '10 times' },
      { title: 'Close the ritual', instruction: 'Relax the jaw and shoulders. Notice whether you feel calmer and more prepared for the day or for sleep.' },
    ],
  },
  {
    name: '10-minute de-puff', time: '10 min', purpose: 'Swelling + sinus + TMJ comfort',
    description: 'A whole-head flow that begins at the chest and includes posture, face, neck, and scalp.',
    steps: [
      { title: 'Clean + assess', instruction: 'Wash hands. Gently feel the face for tenderness or swelling, especially around the eyes and sinuses. Notice jaw or TMJ tension. Feel the scalp and check whether it moves freely or feels tight.', cue: 'Assessment is information, not a reason to press harder.' },
      { title: 'Arm swings + belly breathing', instruction: 'Move the arms freely to warm the upper body. Pair the movement with slow, deep belly breathing.' },
      { title: 'Open toward the armpits', instruction: 'If nails are long, use knuckles. With extremely gentle wave-like motions, guide the upper chest area toward the armpits.', reps: '3–5 light pulls' },
      { title: 'Collarbone wave', instruction: 'Apply body butter to the chest if desired. Around the collarbones, use a soft ocean-wave motion. Then wash hands again before touching the face, especially if acne-prone.', cue: 'Do not bring body butter onto acne-prone facial skin.' },
      { title: 'Neck, ears, nose + eyes', instruction: 'Use gentle presses to warm the sides of the neck, areas around the ears, sides of the nose, and eye area. Use comfortable hand positions and small circular motions around congested-feeling areas.' },
      { title: 'Choose facial slip', instruction: 'Wet hands and apply a face-safe glide product. The tutorial uses gel cleanser for acne-prone skin; facial oil or another compatible product can also be used. Comfort and smooth motion matter most.' },
      { title: 'Posture + anchor hand', instruction: 'Sit or stand tall. Use one hand to support posture or hold the skin comfortably while the other hand glides. Keep the neck long and shoulders relaxed.' },
      { title: 'Jawline with both fists', instruction: 'Use both soft fists to cover the jawline and glide outward, defining the path from center toward the ears.' },
      { title: 'Release the neck', instruction: 'Stretch and massage areas of neck tension. Keep the movement easy and restore upright posture before returning to the face.' },
      { title: 'L-shaped hand glide', instruction: 'Fold each hand into an L shape and glide across the face in broad, fluid movements.' },
      { title: 'Cheekbone contour', instruction: 'With very gentle knuckle pressure, follow beneath the cheekbones and glide outward.', cue: 'Gentler is better for this lymphatic-style flow.' },
      { title: 'Nose loop', instruction: 'Glide upward along the sides of the nose and bring the motion back around toward the outer face.' },
      { title: 'De-puff the eyes', instruction: 'Use very light circular motions around the eye area, travel outward, then return and softly press the inner corners.', reps: '2–3 inner-corner presses' },
      { title: 'Eyebrow massage', instruction: 'Massage along the eyebrows slowly, paying attention to expressive tension and any areas that feel tight.' },
      { title: 'Finishing face lift sweep', instruction: 'Repeat the broad upward-and-outward face sweep that feels most comfortable, then compare how awake and relaxed each side feels.' },
      { title: 'Forehead to ears', instruction: 'Massage the forehead from the center outward, always bringing the movement back toward the ears.' },
      { title: 'Scalp release', instruction: 'Let the hair down. Explore the scalp for tight spots or knots and massage them. If there are none, gently wiggle the scalp so it can move freely. Pair this with slow breathing and present-moment attention.' },
      { title: 'Wash + notice', instruction: 'Wash the face if you used cleanser or a rinse-off product. Notice comfort, tension, and temporary puffiness changes throughout the day rather than chasing a dramatic result.' },
    ],
  },
];

export function GuaShaStudio() {
  const [routineIndex, setRoutineIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(30);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [media, setMedia] = useState<Record<string, { url: string; type: 'image' | 'video'; name: string }>>({});
  const routine = routines[routineIndex];
  const step = routine.steps[stepIndex];
  const progress = Math.round(((stepIndex + (completed[`${routineIndex}-${stepIndex}`] ? 1 : 0)) / routine.steps.length) * 100);
  const stepKey = `${routineIndex}-${stepIndex}`;
  const stepMedia = media[stepKey];

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) { setRunning(false); return; }
    const id = window.setInterval(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearInterval(id);
  }, [running, seconds]);

  const numberedSteps = useMemo(() => routine.steps.map((item, index) => ({ ...item, number: index + 1 })), [routine]);
  function chooseRoutine(index: number) { setRoutineIndex(index); setStepIndex(0); setRunning(false); setSeconds(30); }
  function next() { setCompleted((all) => ({ ...all, [`${routineIndex}-${stepIndex}`]: true })); if (stepIndex < routine.steps.length - 1) { setStepIndex(stepIndex + 1); setRunning(false); setSeconds(30); } }
  function attachMedia(file: File | undefined) {
    if (!file) return;
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    const url = URL.createObjectURL(file);
    setMedia(current => {
      const previous = current[stepKey];
      if (previous?.url.startsWith('blob:')) URL.revokeObjectURL(previous.url);
      return { ...current, [stepKey]: { url, type, name: file.name } };
    });
  }

  return (
    <div className="gua-studio mx-auto max-w-[1400px] pb-24">
      <header className="relative overflow-hidden rounded-[28px] border border-[#eadfd9] bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,.98),rgba(250,236,235,.92)_40%,rgba(225,210,224,.82))] p-6 shadow-[0_22px_70px_rgba(98,69,82,.12)] sm:p-9">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
        <Link href="/beauty" className="relative inline-flex items-center gap-2 text-[11px] font-medium text-[#806b6c]"><ArrowLeft size={14}/>Beauty room</Link>
        <div className="relative mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div><p className="text-[10px] uppercase tracking-[.28em] text-[#a47b83]">Glow OS · guided ritual</p><h1 className="mt-3 font-serif text-[40px] leading-[.95] text-[#433638] sm:text-[64px]">Gua Sha Studio</h1><p className="mt-5 max-w-2xl text-[13px] leading-6 text-[#766366]">Hands-only facial massage made simple enough to follow without replaying a video. Choose what your face needs, then Glow walks you through one movement at a time.</p></div>
          <div className="rounded-[22px] border border-white/70 bg-white/55 p-5 backdrop-blur-xl"><div className="flex items-center gap-3"><Sparkles className="text-[#a26f7c]" size={19}/><div><p className="text-[10px] uppercase tracking-[.18em] text-[#9a7b80]">Today’s gentle choice</p><p className="mt-1 font-serif text-[20px] text-[#493a3c]">Daily hands ritual</p></div></div><p className="mt-3 text-[11px] leading-5 text-[#78666a]">Best when you want a full face, neck, posture, and hydration reset.</p></div>
        </div>
      </header>

      <section className="mt-5 grid gap-3 md:grid-cols-3">
        {routines.map((item, index) => <button key={item.name} onClick={() => chooseRoutine(index)} className={`rounded-[20px] border p-5 text-left transition ${routineIndex === index ? 'border-[#b88c95] bg-[#5c454a] text-white shadow-lg' : 'border-[#eadfd9] bg-white text-[#4d3e40] hover:-translate-y-0.5'}`}><div className="flex items-center justify-between"><Hand size={18}/><span className={`text-[9px] uppercase tracking-[.16em] ${routineIndex === index ? 'text-white/65' : 'text-[#a08388]'}`}>{item.time}</span></div><h2 className="mt-5 font-serif text-[21px]">{item.name}</h2><p className={`mt-1 text-[10px] ${routineIndex === index ? 'text-white/65' : 'text-[#8b7479]'}`}>{item.purpose}</p><p className={`mt-3 text-[10px] leading-5 ${routineIndex === index ? 'text-white/80' : 'text-[#756469]'}`}>{item.description}</p></button>)}
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-hidden rounded-[26px] border border-[#eadfd9] bg-white shadow-[0_20px_60px_rgba(87,61,72,.08)]">
          <div className="border-b border-[#eee5e0] p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.22em] text-[#a47d84]">Follow along · step {stepIndex + 1} of {routine.steps.length}</p><h2 className="mt-2 font-serif text-[30px] text-[#453638]">{step.title}</h2></div><div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e6d7d4] bg-[#faf2ef] font-serif text-[19px] text-[#664b50]">{seconds}s</div></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#eee5e1]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#be8b95,#8c748e)] transition-all" style={{ width: `${progress}%` }}/></div></div>
          <div className="min-h-[300px] p-6 sm:p-9"><p className="max-w-3xl text-[16px] leading-8 text-[#5f5053]">{step.instruction}</p>{step.reps && <div className="mt-6 inline-flex rounded-full bg-[#f7ece9] px-4 py-2 text-[11px] font-semibold text-[#815e66]">{step.reps}</div>}{step.cue && <div className="mt-6 flex max-w-2xl gap-3 rounded-[16px] border border-[#eadfd9] bg-[#fcf8f6] p-4"><HeartPulse size={17} className="mt-0.5 shrink-0 text-[#a36f79]"/><p className="text-[11px] leading-5 text-[#79666a]">{step.cue}</p></div>}
            <div className="mt-7 overflow-hidden rounded-[20px] border border-[#e8deda] bg-[#fcfaf8]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eee5e0] px-4 py-3"><div className="flex items-center gap-2"><FileImage size={15} className="text-[#9a7080]"/><div><p className="text-[9px] font-semibold uppercase tracking-[.15em] text-[#8e737a]">Step reference</p><p className="mt-0.5 text-[9px] text-[#958388]">Add the exact hand placement photo or video for this step.</p></div></div><label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#5b4449] px-4 py-2 text-[9px] text-white"><Upload size={12}/>Add photo or video<input type="file" accept="image/*,video/*" className="sr-only" onChange={event=>attachMedia(event.target.files?.[0])}/></label></div>
              {stepMedia ? <div className="p-4">{stepMedia.type==='video'?<video src={stepMedia.url} controls playsInline className="max-h-[420px] w-full rounded-[16px] bg-black object-contain"/>:<img src={stepMedia.url} alt={`Reference for ${step.title}`} className="max-h-[420px] w-full rounded-[16px] bg-[#f1e9e6] object-contain"/>}<div className="mt-3 flex items-center justify-between gap-3"><p className="truncate text-[9px] text-[#817176]">{stepMedia.name}</p><button type="button" onClick={()=>setMedia(current=>{const next={...current};if(next[stepKey]?.url.startsWith('blob:'))URL.revokeObjectURL(next[stepKey].url);delete next[stepKey];return next})} className="text-[9px] font-semibold text-[#9c596b]">Remove</button></div></div>:<div className="grid min-h-[130px] place-items-center p-6 text-center"><div><Video size={22} className="mx-auto text-[#c3adb5]"/><p className="mt-2 text-[10px] text-[#8d7d82]">No visual attached yet</p><p className="mt-1 text-[8px] text-[#aa999e]">Your reference stays attached to this routine step while this page is open.</p></div></div>}
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-3"><button onClick={() => { if (stepIndex > 0) setStepIndex(stepIndex - 1); setRunning(false); }} disabled={stepIndex === 0} className="inline-flex h-11 items-center gap-2 rounded-full border border-[#e4d7d2] px-4 text-[11px] text-[#6c585c] disabled:opacity-30"><ChevronLeft size={15}/>Back</button><button onClick={() => setRunning(!running)} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#5b4449] px-5 text-[11px] text-white">{running ? <CirclePause size={15}/> : <Play size={15}/>} {running ? 'Pause cue' : 'Start 30-sec cue'}</button><button onClick={() => { setSeconds(30); setRunning(false); }} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e4d7d2] text-[#6c585c]" aria-label="Reset timer"><RotateCcw size={14}/></button><button onClick={next} className="ml-auto inline-flex h-11 items-center gap-2 rounded-full bg-[#b37f8a] px-5 text-[11px] text-white">{stepIndex === routine.steps.length - 1 ? 'Complete ritual' : 'Done · next'}<ChevronRight size={15}/></button></div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[22px] border border-[#eadfd9] bg-[#fbf6f3] p-5"><div className="flex items-center gap-2"><ShieldCheck size={17} className="text-[#98717a]"/><h3 className="font-serif text-[18px] text-[#4c3b3e]">Before you begin</h3></div><ul className="mt-4 space-y-3 text-[10px] leading-5 text-[#766469]"><li>Clean hands and clean skin.</li><li>Use enough face-safe product for effortless glide.</li><li>Pressure stays light, especially near the eyes and front of neck.</li><li>No sharp pain, scraping, bruising, or strong redness.</li><li>Skip broken, sunburned, infected, or actively irritated skin.</li><li>Ask a clinician before massage after facial procedures, surgery, or with a condition affecting swelling or clotting.</li></ul></div>
          <div className="rounded-[22px] border border-[#e3dbe7] bg-[#f5f0f7] p-5"><div className="flex items-center gap-2"><Droplets size={17} className="text-[#88718f]"/><h3 className="font-serif text-[18px] text-[#4c3b50]">Glow connections</h3></div><div className="mt-4 space-y-2 text-[10px] text-[#716477]"><p>Beauty: schedule this before compatible skincare.</p><p>Wellness: log jaw, sinus, neck, and stress tension.</p><p>Habits: track a gentle daily streak without guilt.</p><p>Progress: compare comfort and puffiness, not facial worth.</p><p>Concierge: say “start my de-puff massage.”</p></div></div>
          <div className="rounded-[22px] border border-[#eadfd9] bg-white p-5"><div className="flex items-center justify-between"><h3 className="font-serif text-[18px] text-[#4c3b3e]">All steps</h3><Volume2 size={16} className="text-[#9b7a81]"/></div><div className="mt-4 max-h-[360px] space-y-1 overflow-y-auto pr-1">{numberedSteps.map((item, index) => <button key={item.title} onClick={() => { setStepIndex(index); setRunning(false); setSeconds(30); }} className={`flex w-full gap-3 rounded-[12px] p-3 text-left ${index === stepIndex ? 'bg-[#f3e6e4]' : 'hover:bg-[#faf6f4]'}`}><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#d9c6c3] text-[8px] text-[#80656a]">{item.number}</span><span className="text-[10px] leading-5 text-[#67565a]">{item.title}</span></button>)}</div></div>
        </aside>
      </section>

      <section className="mt-5 rounded-[22px] border border-[#eadfd9] bg-white p-6"><h2 className="font-serif text-[23px] text-[#49393c]">What Glow should remember</h2><p className="mt-2 max-w-4xl text-[11px] leading-6 text-[#756368]">Once daily is the tutorial creator’s suggested frequency, not a requirement. Glow should adapt the ritual to your time, skin comfort, energy, and products. These massages may feel relaxing and can temporarily change the appearance of puffiness; “detox,” permanent lifting, tightening, and anti-aging promises are not treated as guaranteed medical outcomes.</p></section>
    </div>
  );
}
