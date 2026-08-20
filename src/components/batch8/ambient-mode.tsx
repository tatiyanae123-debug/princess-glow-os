'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CirclePause, CirclePlay, Lightbulb, SlidersHorizontal, Speaker, TimerReset, Waves } from 'lucide-react';
import { EditableRoomImage } from '@/components/media/editable-room-image';

type Mode = 'Focus' | 'Relax' | 'Sleep' | 'Energize' | 'Create';
const MODES: Record<Mode,{frequency:number;gain:number;label:string}> = {
  Focus:{frequency:174,gain:.025,label:'Warm Focus'},
  Relax:{frequency:136.1,gain:.022,label:'Lavender Sunset'},
  Sleep:{frequency:110,gain:.018,label:'Night Drift'},
  Energize:{frequency:220,gain:.024,label:'Golden Rise'},
  Create:{frequency:196,gain:.022,label:'Studio Flow'},
};
const BG='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=88';

export function AmbientMode(){
  const [mode,setMode]=useState<Mode>('Relax');
  const [playing,setPlaying]=useState(false);
  const [minutes,setMinutes]=useState(60);
  const [remaining,setRemaining]=useState(60*60);
  const audio=useRef<AudioContext|null>(null);
  const oscillator=useRef<OscillatorNode|null>(null);
  const gain=useRef<GainNode|null>(null);

  const stopSound=useCallback(()=>{
    try{oscillator.current?.stop()}catch{}
    oscillator.current?.disconnect();gain.current?.disconnect();oscillator.current=null;gain.current=null;
    if(audio.current){void audio.current.close();audio.current=null}
    setPlaying(false);
  },[]);
  const startSound=useCallback(async()=>{
    try{oscillator.current?.stop()}catch{}
    oscillator.current?.disconnect();gain.current?.disconnect();oscillator.current=null;gain.current=null;
    if(audio.current){void audio.current.close();audio.current=null}
    const Ctx=window.AudioContext || (window as typeof window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
    if(!Ctx)return;
    const ctx=new Ctx();const osc=ctx.createOscillator();const g=ctx.createGain();const filter=ctx.createBiquadFilter();
    osc.type='sine';osc.frequency.value=MODES[mode].frequency;filter.type='lowpass';filter.frequency.value=420;g.gain.value=MODES[mode].gain;
    osc.connect(filter);filter.connect(g);g.connect(ctx.destination);osc.start();audio.current=ctx;oscillator.current=osc;gain.current=g;setPlaying(true);
  },[mode]);
  useEffect(()=>()=>{try{oscillator.current?.stop()}catch{}oscillator.current?.disconnect();gain.current?.disconnect();if(audio.current)void audio.current.close()},[]);
  useEffect(()=>{setRemaining(minutes*60)},[minutes]);
  useEffect(()=>{if(!playing)return;const t=window.setInterval(()=>setRemaining(v=>{if(v<=1){window.clearInterval(t);stopSound();return minutes*60}return v-1}),1000);return()=>window.clearInterval(t)},[playing,minutes,stopSound]);
  useEffect(()=>{if(playing)void startSound()},[mode,playing,startSound]);
  const mm=Math.floor(remaining/60);const ss=String(remaining%60).padStart(2,'0');

  return <div className="b8-page b8-ambient">
    <header className="b8-head"><div><p className="b8-eyebrow">8. AMBIENT MODE</p><h1>Ambient Mode</h1><p>Your world. Your vibe.</p></div><Link className="b8-icon-link" href="/settings"><SlidersHorizontal size={14}/></Link></header>
    <section className="b8-ambient-stage">
      <EditableRoomImage slot="batch8:ambient:hero" label="Ambient room" fallbackUrl={BG} className="b8-ambient-image"/>
      <div className="b8-ambient-tabs">{(Object.keys(MODES) as Mode[]).map(x=><button type="button" key={x} onClick={()=>setMode(x)} className={mode===x?'active':''}>{x}</button>)}</div>
      <div className="b8-player"><small>{mode}</small><h2>{MODES[mode].label}</h2><p>Generated ambient tone · no external audio stream</p><div className="b8-wave" aria-hidden="true">{Array.from({length:28},(_,i)=><i key={i} style={{height:`${8+((i*13)%30)}px`}}/>)}</div><div className="b8-player-actions"><button type="button" onClick={()=>playing?stopSound():void startSound()} aria-label={playing?'Pause ambient sound':'Play ambient sound'}>{playing?<CirclePause size={36}/>:<CirclePlay size={36}/>}</button></div></div>
    </section>
    <div className="b8-ambient-controls">
      <div><Speaker size={15}/><span>Sound</span><strong>{playing?'On':'Off'}</strong></div><div><Lightbulb size={15}/><span>Light</span><strong>Warm</strong></div><div><Waves size={15}/><span>Scene</span><strong>{mode}</strong></div><label><TimerReset size={15}/><span>Timer</span><select value={minutes} onChange={e=>setMinutes(Number(e.target.value))}><option value={15}>15 min</option><option value={30}>30 min</option><option value={60}>60 min</option></select><strong>{mm}:{ss}</strong></label>
    </div>
    <section className="b8-ambient-quote"><p>Rest is productive.<br/>You are not behind.<br/>You are becoming.</p><EditableRoomImage slot="batch8:ambient:quote" label="Lavender candles" fallbackUrl="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=85" className="b8-ambient-quote-image"/></section>
  </div>;
}
