import {
  Activity,
  CalendarDays,
  CheckSquare,
  HeartPulse,
  Home as HomeIcon,
  LayoutGrid,
  NotebookText,
  Settings as SettingsIcon,
  Sparkles,
  Target,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

export const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid, description: 'Plan the day with elegance' },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays, description: 'Shape the week' },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare, description: 'Focus on what matters' },
  { label: 'Habits', href: '/habits', icon: Activity, description: 'Build steady rituals' },
  { label: 'Beauty', href: '/beauty', icon: Sparkles, description: 'Keep the routine refined' },
  { label: 'Wellness', href: '/wellness', icon: HeartPulse, description: 'Protect your energy' },
  { label: 'Finance', href: '/finance', icon: Wallet, description: 'Stay financially calm' },
  { label: 'Goals', href: '/goals', icon: Target, description: 'Move your ambitions forward' },
  { label: 'Home', href: '/home', icon: HomeIcon, description: 'Care for your space' },
  { label: 'Notes', href: '/notes', icon: NotebookText, description: 'Capture ideas beautifully' },
  { label: 'Settings', href: '/settings', icon: SettingsIcon, description: 'Tune your environment' },
];

export const dashboardTasks = [
  { title: 'Finish vendor comparison', note: 'Share the shortlist before lunch.', priority: 'High', time: '09:30' },
  { title: 'Prep beauty kit', note: 'Pack SPF and serum for tonight.', priority: 'Medium', time: '18:00' },
  { title: 'Review weekly budget', note: 'Check subscriptions and adjust spending.', priority: 'Low', time: '20:30' },
] as const;

export const upcomingEvents = [
  { title: 'Dermatology consult', time: '14:00', location: 'West Avenue Clinic' },
  { title: 'Dinner with friends', time: '19:30', location: 'Golden Hour' },
  { title: 'Creative block', time: '21:00', location: 'Studio desk' },
] as const;

export const habits = [
  { name: 'Hydration', progress: 82, streak: 14, note: 'Two more glasses to complete the day.' },
  { name: 'Movement', progress: 64, streak: 8, note: 'A 20-minute walk would feel great.' },
  { name: 'Skincare', progress: 100, streak: 21, note: 'Routine is already locked in.' },
] as const;

export const quickActions = [
  { title: 'Start ritual', description: 'Begin your morning reset', icon: Sparkles },
  { title: 'Capture note', description: 'Add a fleeting idea', icon: NotebookText },
  { title: 'Review finances', description: 'Check this week’s balance', icon: Wallet },
] as const;
