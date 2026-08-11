'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell, CloudSun, LocateFixed, Plus, RefreshCw, Sparkles, UploadCloud } from 'lucide-react';

type Reminder={id:string;title:string;rawText:string};
type WeatherState={status:'idle'|'loading'|'ready'|'error';temperature?:number;weather?:string;message?:string};

function weatherLabel(code:number){
  if(code===0)return 'Clear';
  if([1,2,3].includes(code))return 'Partly cloudy';
  if([45,48].includes(code))return 'Foggy';
  if(code>=51&&code<=67)return 'Rain';
  if(code>=71&&code<=77)return 'Snow';
  if(code>=80&&code<=82)return 'Showers';
  if(code>=95)return 'Storms';
  return 'Weather';
}

export function DashboardLifeSignals({reminders}:{reminders:Reminder[]}){
  const [weather,setWeather]=useState<WeatherState>({status:'idle'});

  function loadWeather(){
    if(!navigator.geolocation){setWeather({status:'error',message:'Location is not available on this device.'});return;}
    setWeather({status:'loading'});
    navigator.geolocation.getCurrentPosition(async position=>{
      try{
        const {latitude,longitude}=position.coords;
        const response=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`,{cache:'no-store'});
        if(!response.ok)throw new Error('weather');
        const data=await response.json() as {current?:{temperature_2m?:number;weather_code?:number}};
        const temperature=data.current?.temperature_2m;
        const code=data.current?.weather_code;
        setWeather({status:'ready',temperature,weather:typeof code==='number'?weatherLabel(code):'Current weather'});
      }catch{setWeather({status:'error',message:'Weather could not refresh right now.'});}
    },()=>setWeather({status:'error',message:'Allow location to show local weather.'}),{enableHighAccuracy:false,timeout:8000,maximumAge:15*60*1000});
  }

  useEffect(()=>{
    const seen=window.localStorage.getItem('glow-weather-enabled');
    if(seen==='yes')loadWeather();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  function enableWeather(){window.localStorage.setItem('glow-weather-enabled','yes');loadWeather();}

  return <section className="grid gap-3 md:grid-cols-3">
    <div className="rounded-[18px] border border-[#e5d8d0] bg-white/72 p-4 shadow-[0_10px_30px_rgba(84,62,52,.05)]">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[#9f6870]"><Bell size={14}/><p className="text-[8px] font-bold uppercase tracking-[.16em]">Reminders</p></div><Link href="/inbox" className="text-[8px] text-[#9b7c74]">View all</Link></div>
      <div className="mt-3 space-y-2">{reminders.length?reminders.slice(0,3).map(item=><Link href="/inbox" key={item.id} className="block rounded-xl bg-[#f8efeb] px-3 py-2.5"><p className="text-[9px] font-medium text-[#4d403b]">{item.title}</p><p className="mt-1 line-clamp-1 text-[8px] text-[#8c7770]">{item.rawText}</p></Link>):<p className="rounded-xl bg-[#f8efeb] px-3 py-4 text-[9px] text-[#8c7770]">No captured reminders are waiting.</p>}</div>
      <Link href="/intake" className="mt-3 inline-flex items-center gap-1 text-[8px] text-[#9f6870]"><Plus size={10}/>Add reminder</Link>
    </div>

    <div className="rounded-[18px] border border-[#dbe2e3] bg-[linear-gradient(145deg,#f5faf9,#eef4f6)] p-4 shadow-[0_10px_30px_rgba(84,62,52,.05)]">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[#667f86]"><CloudSun size={15}/><p className="text-[8px] font-bold uppercase tracking-[.16em]">Weather Context</p></div>{weather.status==='ready'?<button type="button" onClick={loadWeather} className="text-[#728a90]" aria-label="Refresh weather"><RefreshCw size={12}/></button>:null}</div>
      {weather.status==='ready'?<div className="mt-5"><p className="glow-display text-[32px] text-[#3f4b4e]">{Math.round(weather.temperature??0)}°</p><p className="mt-1 text-[9px] text-[#728187]">{weather.weather}</p><p className="mt-4 text-[8px] leading-4 text-[#839197]">Glow can use weather as context for outfits, errands, workouts and schedule decisions.</p></div>:<div className="mt-5"><p className="text-[9px] leading-4 text-[#78878c]">{weather.status==='loading'?'Finding your local weather…':weather.message??'Turn on local weather to make your Dashboard, Closet and planning more context-aware.'}</p><button type="button" onClick={enableWeather} disabled={weather.status==='loading'} className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#657b82] px-3 py-2 text-[8px] text-white disabled:opacity-50"><LocateFixed size={10}/>Use local weather</button></div>}
    </div>

    <div className="rounded-[18px] border border-[#ead6d8] bg-[linear-gradient(145deg,#fbefef,#fff8f4)] p-4 shadow-[0_10px_30px_rgba(84,62,52,.05)]">
      <div className="flex items-center gap-2 text-[#a36d76]"><Sparkles size={14}/><p className="text-[8px] font-bold uppercase tracking-[.16em]">Understand Anything</p></div>
      <p className="glow-display mt-4 text-[19px] text-[#493a36]">Add it once. Glow decides where it belongs.</p><p className="mt-2 text-[9px] leading-4 text-[#7d6962]">Text, photo, screenshot, PDF, receipt, schedule, recipe, product, outfit, reminder, document or link.</p>
      <Link href="/intake" className="mt-4 inline-flex items-center gap-1 rounded-full bg-[#6b4c51] px-4 py-2 text-[8px] text-white"><UploadCloud size={10}/>Open Universal Intake</Link>
    </div>
  </section>;
}
