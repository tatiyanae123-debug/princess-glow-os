export type PlanningView = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'books' | 'bucket-list';

export interface WeeklyTask {
  id: string;
  text: string;
  completed: boolean;
  date?: string;
}

export interface GymSession {
  id: string;
  date: string;
  label: string;
  completed: boolean;
}

export interface WeeklyFocus {
  title: string;
  goals: string[];
}

export interface WeeklyReflection {
  wins: string;
  lessons: string;
  nextWeek: string;
}

export interface CustomHabit {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  goal: number;
  section: 'daily' | 'devotional';
}

export interface HabitLog {
  habitId: string;
  date: string;
}

export interface CreditCard {
  id: string;
  name: string;
  balance: number;
  originalBalance: number;
  limit: number;
  color: string;
}

export interface QuarterlyGoal {
  id: string;
  quarterKey: string;
  category: 'Finance' | 'Health' | 'Business' | 'Personal';
  text: string;
  completed: boolean;
}

export interface Achievement {
  id: string;
  quarterKey: string;
  text: string;
  achievedAt: string;
}

export interface ParkingLotItem {
  id: string;
  quarterKey: string;
  text: string;
}

export interface TrackedBook {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  status: 'want-to-read' | 'currently-reading' | 'finished';
  quarterKey?: string;
  finishedAt?: string;
}

export interface BucketListItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
  category?: 'Travel' | 'Experience' | 'Career' | 'Personal' | 'Health' | 'Creative' | 'Financial';
}

export interface YearReflection {
  vision: string;
  nonNegotiables: string;
  focus: string;
  change: string;
}

export interface YearlyGoal {
  id: string;
  year: number;
  category: 'Finance' | 'Health' | 'Business' | 'Personal' | 'Creative' | 'Relationships';
  text: string;
  completed: boolean;
}
