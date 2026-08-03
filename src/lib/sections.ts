import {
  Sparkles,
  CalendarRange,
  CheckSquare,
  Flame,
  Repeat2,
  Trophy,
  HeartPulse,
  Briefcase,
  Wallet,
  Notebook,
  Settings,
  Home,
} from 'lucide-react';

export type Section = {
  id: string;
  title: string;
  slug: string;
  icon: typeof Home;
  description: string;
};

export const sections: Section[] = [
  { id: 'today', title: 'Today', slug: 'today', icon: Home, description: 'Anchor the day with intention' },
  { id: 'calendar', title: 'Calendar', slug: 'calendar', icon: CalendarRange, description: 'Time blocks and events' },
  { id: 'tasks', title: 'Tasks', slug: 'tasks', icon: CheckSquare, description: 'The most important things' },
  { id: 'habits', title: 'Habits', slug: 'habits', icon: Flame, description: 'Small rituals that compound' },
  { id: 'routines', title: 'Routines', slug: 'routines', icon: Repeat2, description: 'Flow for the week' },
  { id: 'goals', title: 'Goals', slug: 'goals', icon: Trophy, description: 'Dreams and milestones' },
  { id: 'wellness', title: 'Wellness', slug: 'wellness', icon: HeartPulse, description: 'Mind, body, and calm' },
  { id: 'beauty', title: 'Beauty', slug: 'beauty', icon: Sparkles, description: 'Care and glow rituals' },
  { id: 'work', title: 'Work', slug: 'work', icon: Briefcase, description: 'Momentum and projects' },
  { id: 'money', title: 'Money', slug: 'money', icon: Wallet, description: 'Financial clarity' },
  { id: 'notes', title: 'Notes', slug: 'notes', icon: Notebook, description: 'Ideas and reflections' },
  { id: 'settings', title: 'Settings', slug: 'settings', icon: Settings, description: 'Personal preferences' },
];

