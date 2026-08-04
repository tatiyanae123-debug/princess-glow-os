import {
  Activity,
  CalendarDays,
  CheckSquare,
  HeartPulse,
  Home as HomeIcon,
  LayoutGrid,
  Link2,
  NotebookText,
  PanelsTopLeft,
  Settings as SettingsIcon,
  Sparkles,
  Target,
  UploadCloud,
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
  { label: 'Planning', href: '/planning', icon: PanelsTopLeft, description: 'See your week, quarter, and year' },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays, description: 'Shape the week' },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare, description: 'Focus on what matters' },
  { label: 'Habits', href: '/habits', icon: Activity, description: 'Build steady rituals' },
  { label: 'Beauty', href: '/beauty', icon: Sparkles, description: 'Keep the routine refined' },
  { label: 'Wellness', href: '/wellness', icon: HeartPulse, description: 'Protect your energy' },
  { label: 'Finance', href: '/finance', icon: Wallet, description: 'Stay financially calm' },
  { label: 'Goals', href: '/goals', icon: Target, description: 'Move your ambitions forward' },
  { label: 'Home', href: '/home', icon: HomeIcon, description: 'Care for your space' },
  { label: 'Notes', href: '/notes', icon: NotebookText, description: 'Capture ideas beautifully' },
  { label: 'Connections', href: '/connections', icon: Link2, description: 'Connect your digital world' },
  { label: 'Import', href: '/import', icon: UploadCloud, description: 'Bring in the Glow OS master system' },
  { label: 'Settings', href: '/settings', icon: SettingsIcon, description: 'Tune your environment' },
];
