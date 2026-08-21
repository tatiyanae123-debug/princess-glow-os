'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Heart,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';

type Tab = 'Today' | 'Looks' | 'Collection' | 'Learn' | 'Inspiration';
type Look = {
  name: string;
  minutes: number;
  vibe: string;
  image: string;
  steps: string[];
};
type RecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};
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

const looks: Look[] = [
  {
    name: 'Everyday Soft Glow',
    minutes: 12,
    vibe: 'Fresh · luminous · polished',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=82',
    steps: [
      'Hydrating skin prep',
      'Spot conceal + light base',
      'Cream blush high on cheeks',
      'Soft brown brows',
      'Curl lashes + mascara',
      'Pink nude gloss',
    ],
  },
  {
    name: 'Soft Romantic',
    minutes: 22,
    vibe: 'Pink · diffused · pretty',
    image:
      'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=900&q=82',
    steps: [
      'Prime and prep',
      'Sheer foundation',
      'Brighten inner under-eye',
      'Soft rose blush',
      'Champagne lid + brown lashline',
      'Mascara or half lash',
      'Pink liner + glossy lip',
    ],
  },
  {
    name: 'Date Night Glow',
    minutes: 30,
    vibe: 'Sculpted · glossy · evening',
    image:
      'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=900&q=82',
    steps: [
      'Grip primer',
      'Medium coverage base',
      'Conceal + cream contour',
      'Set center of face',
      'Bronzer + lifted blush',
      'Soft smoky eye',
      'Lashes + liner',
      'Glossy neutral lip',
      'Setting spray',
    ],
  },
  {
    name: '5 Minute Face',
    minutes: 5,
    vibe: 'Fast · awake · effortless',
    image:
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=900&q=82',
    steps: [
      'Conceal only where needed',
      'Brush brows upward',
      'Cream blush',
      'Mascara',
      'Lip balm or gloss',
    ],
  },
];

const products = [
  ['Base', 'Skin prep + complexion', 'Primer · tint · foundation · concealer'],
  ['Cheeks', 'Shape + color', 'Contour · bronzer · blush · highlight'],
  ['Eyes', 'Definition', 'Shadow · liner · mascara · lashes'],
  ['Lips', 'Finish the look', 'Liner · lipstick · gloss · balm'],
  ['Brows', 'Frame the face', 'Pencil · gel · pomade'],
  ['Tools', 'Application', 'Brushes · sponges · lash tools'],
] as const;

function Pill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c98494]/40 ${
        active
          ? 'bg-[#2f2927] text-white shadow-sm'
          : 'border border-[#eadfdd] bg-white/80 text-[#756b67] hover:bg-[#fff7f8]'
      }`}
    >
      {children}
    </button>
  );
}

export function MakeupStudio() {
  const [tab, setTab] = useState<Tab>('Today');
  const [minutes, setMinutes] = useState(20);
  const [energy, setEnergy] = useState('Normal');
  const [selected, setSelected] = useState<Look>(looks[1]);
  const [guided, setGuided] = useState(false);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<number[]>([]);
  const [rating, setRating] = useState('');
  const [note, setNote] = useState('');
  const [journalReady, setJournalReady] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('glow:makeup-journal');
      if (saved) {
        const value = JSON.parse(saved) as { rating?: string; note?: string };
        setRating(value.rating ?? '');
        setNote(value.note ?? '');
      }
    } catch {
      setVoiceStatus('Your saved journal could not be loaded on this device.');
    } finally {
      setJournalReady(true);
    }
  }, []);

  useEffect(() => {
    if (!journalReady) return;
    try {
      localStorage.setItem(
        'glow:makeup-journal',
        JSON.stringify({ rating, note, updatedAt: new Date().toISOString() }),
      );
    } catch {
      // Keep the page usable even if storage is unavailable or full.
    }
  }, [journalReady, note, rating]);

  const recommended = useMemo(() => {
    if (minutes <= 7 || energy === 'Low') return looks[3];
    if (minutes <= 15) return looks[0];
    if (minutes <= 25) return looks[1];
    return looks[2];
  }, [energy, minutes]);

  useEffect(() => {
    if (!guided) setSelected(recommended);
  }, [guided, recommended]);

  function speak(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoiceStatus('Read-aloud is not available in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.03;
    window.speechSynthesis.speak(utterance);
    setVoiceStatus('Glow is reading the current step aloud.');
  }

  function startVoice() {
    const browser = window as unknown as {
      webkitSpeechRecognition?: RecognitionCtor;
      SpeechRecognition?: RecognitionCtor;
    };
    const RecognitionApi =
      browser.SpeechRecognition ?? browser.webkitSpeechRecognition;

    if (!RecognitionApi) {
      setVoiceStatus(
        'Voice commands are not available here. You can still use the on-screen controls and read-aloud.',
      );
      return;
    }

    const recognition = new RecognitionApi();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    setListening(true);
    setVoiceStatus('Listening for next, repeat, back, or done.');

    recognition.onresult = (event: RecognitionEvent) => {
      const transcript = String(
        event.results?.[0]?.[0]?.transcript ?? '',
      ).toLowerCase();

      if (transcript.includes('next')) {
        setStep((current) => Math.min(selected.steps.length - 1, current + 1));
        setVoiceStatus('Moved to the next step.');
      } else if (
        transcript.includes('back') ||
        transcript.includes('previous')
      ) {
        setStep((current) => Math.max(0, current - 1));
        setVoiceStatus('Moved back one step.');
      } else if (
        transcript.includes('repeat') ||
        transcript.includes('what')
      ) {
        speak(selected.steps[step]);
      } else if (transcript.includes('done')) {
        setDone((current) =>
          current.includes(step) ? current : [...current, step],
        );
        setVoiceStatus('Marked this step done.');
      } else {
        setVoiceStatus(
          `I heard “${transcript || 'nothing'}.” Try next, repeat, back, or done.`,
        );
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setVoiceStatus('Voice listening stopped. You can try again or use the buttons.');
    };
    recognition.start();
  }

  function begin(look = selected) {
    setSelected(look);
    setGuided(true);
    setStep(0);
    setDone([]);
    setVoiceStatus('');
    window.setTimeout(
      () => speak(`Starting ${look.name}. Step one. ${look.steps[0]}`),
      100,
    );
  }

  if (guided) {
    const current = selected.steps[step];
    const progress = Math.round(((step + 1) / selected.steps.length) * 100);

    return (
      <div className="mx-auto max-w-4xl pb-28">
        <div className="overflow-hidden rounded-[30px] border border-[#eadfdd] bg-[radial-gradient(circle_at_top_left,#fff7fa_0,#fff_45%,#f7f2ef_100%)] shadow-[0_24px_80px_rgba(77,50,45,.08)]">
          <div className="flex items-center justify-between gap-4 border-b border-[#eee5e2] px-5 py-4 sm:px-7">
            <div>
              <p className="text-[9px] uppercase tracking-[.2em] text-[#ba7f8d]">
                Vanity mode · {progress}%
              </p>
              <h1 className="mt-1 font-serif text-2xl text-[#302927]">
                {selected.name}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setGuided(false)}
              className="shrink-0 rounded-full border border-[#e7ddda] bg-white px-4 py-2 text-[11px] text-[#756a66]"
            >
              Exit
            </button>
          </div>

          <div className="p-5 sm:p-8">
            <div
              className="mb-7 h-1.5 overflow-hidden rounded-full bg-[#eee6e3]"
              role="progressbar"
              aria-label="Makeup routine progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-[#c98494] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="rounded-[26px] border border-white/70 bg-white/75 p-6 text-center shadow-sm backdrop-blur sm:p-10">
              <p className="text-[10px] uppercase tracking-[.18em] text-[#a99690]">
                Step {step + 1} of {selected.steps.length}
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight text-[#342d2a] sm:text-4xl">
                {current}
              </h2>

              <div className="mt-7 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => speak(current)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#eadfdd] bg-white px-4 py-2 text-[12px]"
                >
                  <Volume2 size={14} />
                  Read aloud
                </button>
                <button
                  type="button"
                  onClick={startVoice}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] text-white ${
                    listening ? 'bg-[#8f6570]' : 'bg-[#c27d8d]'
                  }`}
                >
                  <Mic size={14} />
                  {listening ? 'Listening…' : 'Voice control'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDone((currentDone) =>
                      currentDone.includes(step)
                        ? currentDone.filter((item) => item !== step)
                        : [...currentDone, step],
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] ${
                    done.includes(step)
                      ? 'bg-[#e8f1e7] text-[#587055]'
                      : 'border border-[#eadfdd] bg-white'
                  }`}
                >
                  <Check size={14} />
                  {done.includes(step) ? 'Done' : 'Mark done'}
                </button>
              </div>

              {voiceStatus ? (
                <p
                  aria-live="polite"
                  className="mx-auto mt-4 max-w-xl text-[10px] leading-5 text-[#8a7d78]"
                >
                  {voiceStatus}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((currentStep) => Math.max(0, currentStep - 1))}
                className="inline-flex items-center gap-1 rounded-full border border-[#e9dfdc] bg-white px-4 py-2 text-[12px] disabled:opacity-35"
              >
                <ChevronLeft size={15} />
                Back
              </button>

              {step === selected.steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setDone(selected.steps.map((_, index) => index));
                    setGuided(false);
                    setTab('Today');
                  }}
                  className="rounded-full bg-[#2f2927] px-6 py-2.5 text-[12px] text-white"
                >
                  Finish look
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    const nextStep = Math.min(selected.steps.length - 1, step + 1);
                    setStep(nextStep);
                    window.setTimeout(() => speak(selected.steps[nextStep]), 80);
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-[#2f2927] px-5 py-2.5 text-[12px] text-white"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1450px] pb-28">
      <section className="overflow-hidden rounded-[28px] border border-[#eee5e2] bg-[radial-gradient(circle_at_15%_10%,rgba(255,231,238,.9),transparent_35%),radial-gradient(circle_at_90%_0%,rgba(241,230,250,.8),transparent_38%),linear-gradient(135deg,#fff,#fbf7f5)] px-5 py-6 shadow-[0_22px_70px_rgba(63,39,34,.07)] sm:px-7 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-[9px] uppercase tracking-[.22em] text-[#b77989]">
              Beauty / Makeup
            </p>
            <h1 className="mt-2 font-serif text-[36px] leading-none text-[#2f2927] sm:text-[46px]">
              Makeup Studio
            </h1>
            <p className="mt-3 max-w-2xl text-[12px] leading-6 text-[#817772]">
              Choose the right look, follow it hands-free, remember what worked,
              and connect makeup to the rest of your Glow routine.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/skincare"
              className="rounded-full border border-[#e8dedb] bg-white/80 px-4 py-2 text-[11px] text-[#716762]"
            >
              Skincare
            </Link>
            <Link
              href="/hair"
              className="rounded-full border border-[#e8dedb] bg-white/80 px-4 py-2 text-[11px] text-[#716762]"
            >
              Hair
            </Link>
            <Link
              href="/closet"
              className="rounded-full border border-[#e8dedb] bg-white/80 px-4 py-2 text-[11px] text-[#716762]"
            >
              Closet
            </Link>
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {(['Today', 'Looks', 'Collection', 'Learn', 'Inspiration'] as Tab[]).map(
            (item) => (
              <Pill key={item} active={tab === item} onClick={() => setTab(item)}>
                {item}
              </Pill>
            ),
          )}
        </div>
      </section>

      {tab === 'Today' ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
          <section className="rounded-[24px] border border-[#eee5e2] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[9px] uppercase tracking-[.18em] text-[#ba7e8d]">
                  Glow suggests
                </p>
                <h2 className="mt-1 font-serif text-2xl text-[#322b28]">
                  {recommended.name}
                </h2>
                <p className="mt-1 text-[11px] text-[#8a807b]">
                  {recommended.vibe}
                </p>
              </div>
              <button
                type="button"
                onClick={() => begin(recommended)}
                className="inline-flex items-center gap-2 rounded-full bg-[#2f2927] px-5 py-2.5 text-[12px] text-white"
              >
                <Play size={14} />
                Start look
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="relative h-64 overflow-hidden rounded-[20px] bg-[#f8f3f2]">
                <Image
                  src={recommended.image}
                  alt={`${recommended.name} makeup inspiration`}
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 35vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="rounded-[20px] bg-[#fff8fa] p-5">
                <div className="flex items-center gap-2 text-[11px] text-[#7b6d69]">
                  <Clock3 size={14} />
                  {recommended.minutes} minute routine
                </div>
                <div className="mt-4 space-y-2">
                  {recommended.steps.slice(0, 6).map((routineStep, index) => (
                    <div
                      key={routineStep}
                      className="flex items-start gap-2 text-[11px] text-[#625a57]"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[9px] text-[#ae7282]">
                        {index + 1}
                      </span>
                      {routineStep}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[24px] border border-[#eee5e2] bg-white p-5">
              <p className="text-[9px] uppercase tracking-[.18em] text-[#9e918c]">
                Make it fit today
              </p>
              <p className="mt-3 text-[11px] text-[#756b67]">Time available</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[5, 10, 20, 30].map((value) => (
                  <Pill
                    key={value}
                    active={minutes === value}
                    onClick={() => setMinutes(value)}
                  >
                    {value} min
                  </Pill>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-[#756b67]">Energy</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {['Low', 'Normal', 'High'].map((value) => (
                  <Pill
                    key={value}
                    active={energy === value}
                    onClick={() => setEnergy(value)}
                  >
                    {value}
                  </Pill>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#eee5e2] bg-[linear-gradient(145deg,#fff7f9,#f8f4fb)] p-5">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#b67888]" />
                <h3 className="font-serif text-lg">Ask Glow while you get ready</h3>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-[#7e7470]">
                Say “next,” “repeat,” “back,” or “done” in Vanity Mode. Glow can
                also read every step aloud.
              </p>
              <button
                type="button"
                onClick={startVoice}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] shadow-sm"
              >
                <Mic size={13} />
                {listening ? 'Listening…' : 'Try voice'}
              </button>
              {voiceStatus ? (
                <p aria-live="polite" className="mt-3 text-[10px] leading-5 text-[#8a7d78]">
                  {voiceStatus}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-[24px] border border-[#eee5e2] bg-white p-5 sm:p-6 xl:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[9px] uppercase tracking-[.18em] text-[#9c8f8a]">
                  After makeup
                </p>
                <h2 className="mt-1 font-serif text-xl">Makeup journal</h2>
              </div>
              <span className="text-[10px] text-[#aaa09b]">
                {journalReady ? 'Auto-saves on this device' : 'Loading saved notes…'}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['😍 Love it', '🙂 Good', '😐 Okay', '🙁 Didn’t work'].map((value) => (
                <Pill
                  key={value}
                  active={rating === value}
                  onClick={() => setRating(value)}
                >
                  {value}
                </Pill>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              aria-label="Makeup journal note"
              placeholder="Foundation separated, loved the blush placement, lip lasted all night…"
              className="mt-4 min-h-24 w-full resize-none rounded-[16px] border border-[#eee5e2] bg-[#fcfaf9] p-3 text-[12px] outline-none placeholder:text-[#b0a7a2] focus:border-[#d7b5bd]"
            />
          </section>
        </div>
      ) : null}

      {tab === 'Looks' ? (
        <section className="mt-4 rounded-[24px] border border-[#eee5e2] bg-white p-5 sm:p-6">
          <div>
            <p className="text-[9px] uppercase tracking-[.18em] text-[#b77a89]">
              Saved looks
            </p>
            <h2 className="mt-1 font-serif text-2xl">Your visual look library</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {looks.map((look) => (
              <article
                key={look.name}
                className="overflow-hidden rounded-[20px] border border-[#eee5e2] bg-white"
              >
                <div className="relative h-44 w-full">
                  <Image
                    src={look.image}
                    alt={`${look.name} makeup look`}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-lg">{look.name}</h3>
                      <p className="mt-1 text-[10px] text-[#958b86]">{look.vibe}</p>
                    </div>
                    <Heart size={15} aria-hidden="true" className="text-[#bb7c8b]" />
                  </div>
                  <button
                    type="button"
                    onClick={() => begin(look)}
                    className="mt-4 w-full rounded-full bg-[#2f2927] py-2 text-[11px] text-white"
                  >
                    Follow along · {look.minutes} min
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'Collection' ? (
        <section className="mt-4 rounded-[24px] border border-[#eee5e2] bg-white p-5 sm:p-6">
          <p className="text-[9px] uppercase tracking-[.18em] text-[#b77a89]">
            Virtual vanity
          </p>
          <h2 className="mt-1 font-serif text-2xl">Makeup collection</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(([name, detail, items]) => (
              <div
                key={name}
                className="rounded-[18px] border border-[#eee5e2] bg-[linear-gradient(145deg,#fff,#fbf7f7)] p-4"
              >
                <p className="text-[9px] uppercase tracking-[.14em] text-[#ba7e8d]">
                  {detail}
                </p>
                <h3 className="mt-1 font-serif text-xl">{name}</h3>
                <p className="mt-2 text-[11px] text-[#8d837e]">{items}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-[18px] bg-[#fff8fa] p-4 text-[11px] leading-5 text-[#796f6b]">
            Collection structure is ready for product, shade, open-date, expiration,
            price, favorite, and repurchase data. It stays visually grouped instead
            of becoming a spreadsheet wall.
          </div>
        </section>
      ) : null}

      {tab === 'Learn' ? (
        <section className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-[#eee5e2] bg-white p-5">
            <p className="text-[9px] uppercase tracking-[.18em] text-[#9b8f89]">
              Technique library
            </p>
            <h2 className="mt-1 font-serif text-2xl">Learn by face area</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                'Complexion',
                'Concealer',
                'Contour',
                'Blush',
                'Eyes',
                'Lashes',
                'Brows',
                'Lips',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[14px] border border-[#eee5e2] bg-[#fcfaf9] p-3 text-[11px]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-[#eee5e2] bg-[linear-gradient(145deg,#f9f3fb,#fff8f9)] p-5">
            <p className="text-[9px] uppercase tracking-[.18em] text-[#9b829f]">
              Tutorial importer
            </p>
            <h2 className="mt-1 font-serif text-2xl">Turn tutorials into routines</h2>
            <p className="mt-3 text-[11px] leading-5 text-[#7f7470]">
              YouTube, TikTok, screenshots, or notes can become ordered steps that
              open directly in Vanity Mode instead of sitting in a folder.
            </p>
            <Link
              href="/import"
              className="mt-5 inline-flex rounded-full bg-[#2f2927] px-4 py-2 text-[11px] text-white"
            >
              Import tutorial
            </Link>
          </div>
        </section>
      ) : null}

      {tab === 'Inspiration' ? (
        <section className="mt-4 rounded-[24px] border border-[#eee5e2] bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[9px] uppercase tracking-[.18em] text-[#b77a89]">
                Reference looks
              </p>
              <h2 className="mt-1 font-serif text-2xl">Inspiration → action</h2>
            </div>
            <button
              type="button"
              onClick={() => setTab('Looks')}
              className="rounded-full border border-[#eadfdd] px-4 py-2 text-[11px]"
            >
              Build from saved looks
            </button>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {looks.slice(0, 3).map((look) => (
              <button
                type="button"
                key={look.name}
                onClick={() => begin(look)}
                className="group overflow-hidden rounded-[18px] border border-[#eee5e2] text-left"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={look.image}
                    alt={`${look.name} inspiration`}
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                    className="object-cover transition group-hover:scale-[1.015]"
                  />
                </div>
                <div className="p-3">
                  <p className="font-serif text-lg">{look.name}</p>
                  <p className="mt-1 text-[10px] text-[#938984]">
                    Recreate with guided steps
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#eee5e2] bg-[#fcfaf9] px-4 py-3">
        <p className="text-[10px] text-[#8e8580]">
          Makeup connects to Skincare prep, Hair, Closet, Beauty, Import, and Glow voice.
        </p>
        <button
          type="button"
          onClick={() => {
            setTab('Today');
            setMinutes(20);
            setEnergy('Normal');
            setGuided(false);
            setStep(0);
            setDone([]);
            setVoiceStatus('');
          }}
          className="inline-flex items-center gap-1.5 text-[10px] text-[#756b67]"
        >
          <RotateCcw size={12} />
          Reset view
        </button>
      </div>
    </div>
  );
}
