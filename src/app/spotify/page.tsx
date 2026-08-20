import { AppShell } from '@/components/app-shell';
import { Music2, Dumbbell, Sparkles, Brain, Home, ExternalLink } from 'lucide-react';

const modes = [
  { title:'Morning Glow', note:'Start soft and intentional.', query:'morning chill' },
  { title:'Workout', note:'High-energy music for training.', query:'workout' },
  { title:'Focus', note:'Low-distraction music for deep work.', query:'focus' },
  { title:'Beauty + Reset', note:'Music for beauty, hair and Sunday reset.', query:'self care' },
  { title:'Home + Cleaning', note:'Upbeat music for resetting your space.', query:'cleaning' },
  { title:'Wind Down', note:'A calmer night soundtrack.', query:'sleep chill' },
];

function spotifySearch(query:string){ return `https://open.spotify.com/search/${encodeURIComponent(query)}`; }

export default function SpotifyPage(){
  return <AppShell>
    <div className="mx-auto w-full max-w-[1280px] pb-16">
      <section className="overflow-hidden rounded-[30px] border border-[#e9e1de] bg-[radial-gradient(circle_at_15%_15%,rgba(244,213,219,.8),transparent_34%),linear-gradient(135deg,#fff,#f7f0ee)] p-6 shadow-[0_18px_58px_rgba(70,48,42,.07)] sm:p-8">
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[720px]">
            <div className="flex items-center gap-2 text-[#bd5d73]"><Music2 size={15}/><span className="text-[9px] font-semibold uppercase tracking-[.16em]">Connect · Music</span></div>
            <h1 className="mt-3 font-serif text-[38px] leading-[.98] text-[#2a2421] sm:text-[52px]">Music that follows your life.</h1>
            <p className="mt-4 max-w-[620px] text-[13px] leading-6 text-[#746963]">Use one Spotify home inside Glow OS, then jump directly into the soundtrack that matches what you are doing. The mini Spotify dock stays available on Dashboard and Fitness too.</p>
          </div>
          <a href="https://open.spotify.com/" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#1f1f1f] px-5 text-[12px] font-medium text-white"><Music2 size={16}/>Open My Spotify<ExternalLink size={13}/></a>
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modes.map((mode,index)=>{
          const Icon=index===1?Dumbbell:index===2?Brain:index===4?Home:Sparkles;
          return <a key={mode.title} href={spotifySearch(mode.query)} target="_blank" rel="noreferrer" className="group rounded-[24px] border border-[#eee5e2] bg-white p-5 shadow-[0_10px_36px_rgba(68,48,41,.045)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(68,48,41,.08)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f9e8eb] text-[#bd5d73]"><Icon size={17}/></div>
            <h2 className="mt-5 font-serif text-[23px] text-[#2d2724]">{mode.title}</h2>
            <p className="mt-1 text-[11.5px] leading-5 text-[#857a74]">{mode.note}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-[10.5px] font-medium text-[#af586c]">Open playlist search <ExternalLink size={11}/></span>
          </a>;
        })}
      </section>
    </div>
  </AppShell>;
}