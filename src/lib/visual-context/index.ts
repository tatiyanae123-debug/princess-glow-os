'use client';

import { useMemo } from 'react';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export type VisualContext = {
  timeOfDay: TimeOfDay;
  weeklyTheme: string;
  season: Season;
};

const WEEKLY_THEMES = [
  'Sunday Reset',
  'Monday Maintenance',
  'Tuesday Performance',
  'Wednesday Midweek Reset',
  'Thursday Hair Treatment',
  'Friday Beauty & Social',
  'Saturday Recovery & Creative',
];

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getSeason(month: number): Season {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

export function useVisualContext(): VisualContext {
  return useMemo(() => {
    const now = new Date();
    return {
      timeOfDay: getTimeOfDay(now.getHours()),
      weeklyTheme: WEEKLY_THEMES[now.getDay()],
      season: getSeason(now.getMonth()),
    };
  }, []);
}
