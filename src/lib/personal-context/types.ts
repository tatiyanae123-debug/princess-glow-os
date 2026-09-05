export type PersonalTask = {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
};

export type PersonalEvent = {
  id: string;
  source: 'google' | 'glow';
  title: string;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  location: string | null;
  htmlLink: string | null;
};

export type PersonalRoutine = {
  id: string;
  name: string;
  description: string | null;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
};

export type PersonalHabit = {
  id: string;
  name: string;
  description: string | null;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';
};

export type PersonalNote = {
  id: string;
  title: string;
  content: string | null;
  pinned: boolean;
  updatedAt: string;
};

export type PersonalGoal = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  progress: number;
  targetDate: string | null;
};

export type PersonalWellness = {
  entryDate: string;
  mood: string | null;
  energy: string | null;
  sleepHours: number | null;
  waterGlasses: number | null;
  notes: string | null;
} | null;

export type PersonalContextData = {
  ok: true;
  user: {
    name: string | null;
    email: string | null;
  };
  tasks: PersonalTask[];
  activeTask: PersonalTask | null;
  events: PersonalEvent[];
  todayEvents: PersonalEvent[];
  tomorrowEvents: PersonalEvent[];
  routines: PersonalRoutine[];
  habits: PersonalHabit[];
  notes: PersonalNote[];
  goals: PersonalGoal[];
  wellness: PersonalWellness;
  sourceStatus: {
    googleCalendar: 'connected' | 'not_connected' | 'insufficient_scope' | 'revoked' | 'error';
  };
};

export type PersonalContextResponse =
  | PersonalContextData
  | { ok: false; reason: 'not_signed_in' | 'error' };
