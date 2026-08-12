'use client';

import { useState } from 'react';
import { CloudRain, CloudSun, LocateFixed, SunMedium, Wind } from 'lucide-react';

type WeatherState={temperature:number;apparent:number;wind:number;code:number}|null;

function description(code:number){
  if(code===0) return 'Clear';
  if([1,2,3].includes(code)) return 'Partly cloudy';
  if([45,48].includes(code)) return 'Foggy';
  if([51,53,55,56,57].includes(code)) return 'Drizzle';
  if([61,63,65,66,67,80,81,82].includes(code)) return 'Rain';
  if([71,73,75,77,85,86].includes(code)) return 'Snow';
  if([95,96,99].includes(code)) return 'Storms';
  return 'Current conditions';
}

export function LiveWeatherCard(){
  const [weather,setWeather]=useState<WeatherState>(null);
  const [status,setStatus]=useState<'idle'|'loading'|'error'>('idle');
  const [message,setMessage]=useState('Use your location when you want Glow to include weather in outfits, travel, workouts and errands.');

  async function load(){
    if(!navigator.geolocation){setStatus('error');setMessage('Location is not available on this device.');return;}
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(async(position)=>{
      try{
        const {latitude,longitude}=position.coords;
        const url=`https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;
        const response=await fetch(url);
        if(!response.ok) throw new Error('Weather request failed');
        const json=await response.json() as {current?:{temperature_2m?:number;apparent_temperature?:number;weather_code?:number;wind_speed_10m?:number}};
        const current=json.current;
        if(!current||typeof current.temperature_2m!=='number') throw new Error('Weather unavailable');
        setWeather({temperature:current.temperature_2m,apparent:current.apparent_temperature??current.temperature_2m,wind:current.wind_speed_10m??0,code:current.weather_code??0});
        setStatus('idle');
      }catch{
        setStatus('error');setMessage('Glow could not load weather right now. You can try again without changing any other settings.');
      }
    },()=>{setStatus('error');setMessage('Location permission was not granted. Weather stays off until you choose to allow it.');},{enableHighAccuracy:false,timeout:10000,maximumAge:15*60*1000});
  }

  const Icon=weather?(weather.code===0?SunMedium:[61,63,65,80,81,82].includes(weather.code)?CloudRain:CloudSun):CloudSun;
  return <div className="rounded-[14px] border border-[#dfe5df] bg-[linear-gradient(145deg,#f6f7ef,#eef3ef)] p-4 shadow-[0_12px_36px_rgba(91,62,53,.04)]">
    <div className="flex items-center gap-2 text-[#768875]"><Icon size={17}/><p className="text-[8px] font-bold uppercase tracking-[.15em]">Weather Context</p></div>
    {weather?<>
      <div className="mt-4 flex items-end justify-between gap-3"><div><p className="glow-display text-[31px] leading-none text-[#3d463e]">{Math.round(weather.temperature)}°F</p><p className="mt-2 text-[9px] text-[#657166]">{description(weather.code)}</p></div><div className="text-right text-[7px] leading-4 text-[#748075]"><p>Feels {Math.round(weather.apparent)}°</p><p className="flex items-center justify-end gap-1"><Wind size={9}/>{Math.round(weather.wind)} mph</p></div></div>
      <p className="mt-3 text-[8px] leading-4 text-[#718074]">Weather is ready to inform today’s outfit, travel, outdoor movement and errands.</p>
      <button type="button" onClick={load} disabled={status==='loading'} className="mt-3 inline-flex items-center gap-1 rounded-full border border-[#d2ddd1] bg-white/55 px-3 py-2 text-[8px] text-[#667466]"><LocateFixed size={10}/>{status==='loading'?'Refreshing…':'Refresh weather'}</button>
    </>:<>
      <p className="glow-display mt-4 text-[19px] text-[#3d463e]">Weather-aware planning</p>
      <p className="mt-2 text-[8px] leading-4 text-[#718074]">{message}</p>
      <button type="button" onClick={load} disabled={status==='loading'} className="mt-4 inline-flex items-center gap-1 rounded-full border border-[#d2ddd1] bg-white/55 px-3 py-2 text-[8px] text-[#667466]"><LocateFixed size={10}/>{status==='loading'?'Getting weather…':'Use my location'}</button>
    </>}
    <p className="mt-3 text-[6px] text-[#9aa499]">Weather data: Open-Meteo</p>
  </div>;
}
