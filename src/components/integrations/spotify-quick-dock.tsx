'use client';

import { ExternalLink, Music2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

const SPOTIFY_HOME='https://open.spotify.com/';
const WORKOUT_SEARCH='https://open.spotify.com/search/workout';

export function SpotifyQuickDock(){
  const pathname=usePathname();
  const show=pathname==='/dashboard'||pathname.startsWith('/dashboard/')||pathname==='/fitness'||pathname.startsWith('/fitness/');
  if(!show)return null;
  const workout=pathname.startsWith('/fitness');
  return <div className="fixed bottom-[86px] right-4 z-[82] flex items-center gap-2 rounded-full border border-white/70 bg-white/95 p-1.5 shadow-[0_12px_36px_rgba(55,38,43,.16)] backdrop-blur-xl sm:right-5">
    <a href={SPOTIFY_HOME} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1f1f1f] px-4 text-[12px] font-medium text-white" aria-label="Open Spotify"><Music2 size={16}/>Spotify</a>
    {workout?<a href={WORKOUT_SEARCH} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-[11px] text-[#5d5651] hover:bg-[#f7eeed]">Workout music<ExternalLink size={13}/></a>:null}
  </div>;
}
