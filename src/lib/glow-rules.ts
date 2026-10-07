'use client';

import { useEffect, useState } from 'react';

export type GlowRules = {
  maxPriorities: 3;
  morningStart: number;
  morningEnd: number;
  betweenEnd: number;
  eveningEnd: number;
  nightEnd: number;
  defaultGetReadyMinutes: number;
  interviewGetReadyMinutes: number;
  preferredWorkoutWindow: 'evening' | 'morning' | 'flexible';
  nightRoutineTime: string;
  businessHoursCutoff: string;
  dashboardDensity: 'calm' | 'balanced' | 'dense';
  notificationSensitivity: 'essential' | 'balanced' | 'proactive';
  planningStyle: 'next-action' | 'overview';
};

export const DEFAULT_GLOW_RULES: GlowRules = {
  maxPriorities: 3,
  morningStart: 5,
  morningEnd: 10,
  betweenEnd: 16,
  eveningEnd: 20.5,
  nightEnd: 23,
  defaultGetReadyMinutes: 45,
  interviewGetReadyMinutes: 60,
  preferredWorkoutWindow: 'evening',
  nightRoutineTime: '20:30',
  businessHoursCutoff: '16:30',
  dashboardDensity: 'calm',
  notificationSensitivity: 'essential',
  planningStyle: 'next-action',
};

const KEY='glow:personal-rules:v1';

export function useGlowRules(){
  const [rules,setRules]=useState<GlowRules>(DEFAULT_GLOW_RULES);
  useEffect(()=>{
    try{
      const raw=window.localStorage.getItem(KEY);
      if(raw)setRules({...DEFAULT_GLOW_RULES,...JSON.parse(raw)});
    }catch{}
  },[]);
  function save(next:GlowRules){
    setRules(next);
    try{window.localStorage.setItem(KEY,JSON.stringify(next))}catch{}
  }
  function reset(){save(DEFAULT_GLOW_RULES)}
  return {rules,save,reset};
}

export function gettingReadyMinutesFor(title:string|undefined,rules:GlowRules){
  if(title&&/interview/i.test(title))return rules.interviewGetReadyMinutes;
  return rules.defaultGetReadyMinutes;
}
