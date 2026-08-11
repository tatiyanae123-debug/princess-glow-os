'use client';

import { useEffect, useState } from 'react';
import { CloudSun, LocateFixed, RefreshCw } from 'lucide-react';

type WeatherState={status:'idle'|'loading'|'ready'|'error';temperature?:number;condition?:string;message?:string};

function label(code:number){
  if(code===0)return 'Clear';
  if([1,2,3].includes(code))return 'Partly cloudy';
  if([45,48].includes(code))return 'Foggy';
  if(code>=51&&code<=67)return 'Rain';
  if(code>=71&&code<=77)return 'Snow';
  if(code>=80&&code<=82)return 'Showers';
  if(code>=95)return 'Storms';
  return 'Current conditions';
}

export function LocalWeatherCard(){
  const [weather,setWeather]=useState<WeatherState>({status:'idle'});

  function load(){
    if(!navigator.geolocation){setWeather({status:'error',message:'Location is not available on this device.'});return;}
    setWeather({status:'loading'});
    navigator.geolocation.getCurrentPosition(async ({coords})=>{
      try{
        const response=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`,{cache:'no-store'});
        if(!response.ok)throw new Error('weather');
        const data=await response.json() as {current?:{temperature_2m?:number;weather_code?:number}};
        if(typeof data.current?.temperature_2m!=='number')throw new Error('weather');
        setWeather({status:'ready',temperature:data.current.temperature_2m,condition:typeof data.current.weather_code==='number'?label(data.current.weather_code):'Current conditions'});
      }catch{setWeather({status:'error',message:'Weather could not refresh right now.'});}
    },()=>setWeather({status:'error',message:'Allow location to show local weather.'}),{timeout:8000,maximumAge:15*60*1000});
  }

  useEffect(()=>{
    if(window.localStorage.getItem('glow-weather-enabled')==='yes')load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  function enable(){window.localStorage.setItem('glow-weather-enabled','yes');load();}

  return <div className="rounded-[14px] border border-[#dfe5df] bg-[linear-gradient(145deg,#f6f7ef,#eef3ef)] p-4 shadow-[0_12px_36px_rgba(91,62,53,.04)]">
    <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[#768875]"><CloudSun size={17}/><p className="text-[8px] font-bold uppercase tracking-[.15em]">Weather Context</p></div>{weather.status==='ready'?<button type="button" onClick={load} aria-label="Refresh local weather" className="text-[#728274]"><RefreshCw size={12}/></button>:null}</div>
    {weather.status==='ready'?<><p className="glow-display mt-4 text-[30px] text-[#3d463e]">{Math.round(weather.temperature??0)}°</p><p className="mt-1 text-[9px] font-medium text-[#657266]">{weather.condition}</p><p className="mt-3 text-[8px] leading-4 text-[#718074]">Live local context for outfits, travel time, errands, workouts and your day plan.</p></>:<><p className="glow-display mt-4 text-[19px] text-[#3d463e]">Weather-aware planning</p><p className="mt-2 text-[8px] leading-4 text-[#718074]">{weather.status==='loading'?'Finding your local conditions…':weather.message??'Enable local weather when you want Glow to use it as planning context.'}</p><button type="button" disabled={weather.status==='loading'} onClick={enable} className="mt-4 inline-flex items-center gap-1 rounded-full border border-[#d2ddd1] bg-white/55 px-3 py-2 text-[8px] text-[#667466] disabled:opacity-50"><LocateFixed size={10}/>Use local weather</button></>}
  </div>;
}
