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

export const featuredPillars = [
  { title: 'Glow', description: 'A refined morning rhythm' },
  { title: 'Flow', description: 'Work that feels lighter' },
  { title: 'Restore', description: 'Care that holds you' },
];

export const todayHighlights = [
  { title: 'Morning reset', detail: 'Hydrate, stretch, and journal before the inbox opens.' },
  { title: 'Deep work', detail: 'Protect 90 minutes for your highest leverage task.' },
  { title: 'Evening glow', detail: 'Dim the lights and pre-prepare tomorrow’s essentials.' },
];

export const quickNotes = [
  'The goal is not to do everything, only what matters most.',
  'A calm plan beats a crowded calendar.',
  'Beauty is a ritual, not a chore.',
];

export const wellnessTracks = [
  { title: 'Energy', value: 'High' },
  { title: 'Focus', value: 'Deep' },
  { title: 'Sleep', value: 'On track' },
];

export const beautyRoutine = [
  'Cleanse and hydrate',
  'Apply SPF and lip balm',
  'Choose one soft, intentional outfit',
];

export const workFocus = [
  { title: 'Launch prep', detail: 'Outline the week’s priorities.' },
  { title: 'Client reply', detail: 'Send the follow-up before lunch.' },
];

export const moneySnapshot = [
  { title: 'Savings', value: '$2,340' },
  { title: 'Spending', value: '$480' },
  { title: 'Upcoming', value: '3 subscriptions' },
];

export const notesBundle = [
  'Reflect on one moment of gratitude.',
  'Write the next sentence of your idea.',
  'Leave space for spontaneity.',
];

export const settingsItems = [
  { title: 'Theme', value: 'Editorial warm' },
  { title: 'Notifications', value: 'Gentle' },
  { title: 'Focus mode', value: 'Enabled' },
];

export const sectionContent = {
  today: {
    title: 'Today',
    blurb: 'Create a calm, graceful landing place for your day.',
  },
  calendar: {
    title: 'Calendar',
    blurb: 'Shape the week around your priorities.',
  },
  tasks: {
    title: 'Tasks',
    blurb: 'Hold what matters without overload.',
  },
  habits: {
    title: 'Habits',
    blurb: 'Anchor identity through tiny wins.',
  },
  routines: {
    title: 'Routines',
    blurb: 'Design repeatable rituals that feel effortless.',
  },
  goals: {
    title: 'Goals',
    blurb: 'Keep your ambition visible and humane.',
  },
  wellness: {
    title: 'Wellness',
    blurb: 'Treat rest and nourishment as strategy.',
  },
  beauty: {
    title: 'Beauty',
    blurb: 'Maintain a tender, intentional care routine.',
  },
  work: {
    title: 'Work',
    blurb: 'Make your workday feel structured and light.',
  },
  money: {
    title: 'Money',
    blurb: 'Understand your flow with calm confidence.',
  },
  notes: {
    title: 'Notes',
    blurb: 'Capture ideas before they slip away.',
  },
  settings: {
    title: 'Settings',
    blurb: 'Shape the environment around the life you want.',
  },
};
