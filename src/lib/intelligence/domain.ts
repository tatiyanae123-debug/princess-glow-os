import type { GlowDayMode } from '@/lib/day-mode';

export type Recommendation = {
  id: string;
  sourceType: 'task' | 'apple_reminder' | 'routine' | 'habit';
  sourceId: string;
  title: string;
  reason: string;
  score: number;
  estimatedMinutes: number;
  dueAt: Date | null;
};

export type ScheduleItem = Recommendation & { startAt: Date; endAt: Date };

export type ScheduleProposal = {
  id: string;
  mode: GlowDayMode;
  generatedAt: Date;
  fixedCommitments: { id: string; title: string; startAt: Date; endAt: Date | null }[];
  suggestions: ScheduleItem[];
};

export type LifeMemory = {
  id: string;
  title: string;
  category: string;
  source: string;
  summary: string | null;
  sourceDate: Date | null;
  privacyLevel: string;
};

export type ProjectContext = {
  id: string;
  title: string;
  area: string;
  status: string;
  priority: string;
  progress: number;
  nextAction: string | null;
  deadline: Date | null;
};
