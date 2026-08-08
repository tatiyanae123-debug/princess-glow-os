import {
  Activity,
  BrainCircuit,
  CalendarDays,
  CheckSquare,
  FolderKanban,
  Globe2,
  HeartPulse,
  Home as HomeIcon,
  LayoutGrid,
  LibraryBig,
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
  { label: 'Brain', href: '/brain', icon: BrainCircuit, description: 'See what matters next' },
  { label: 'Concierge', href: '/concierge', icon: BrainCircuit, description: 'Propose changes with approval' },
  { label: 'Planning', href: '/planning', icon: PanelsTopLeft, description: 'Connect today, week, quarter, and year' },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays, description: 'Shape the week' },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare, description: 'Focus on what matters' },
  { label: 'Habits', href: '/habits', icon: Activity, description: 'Build steady rituals' },
  { label: 'Observations', href: '/observations', icon: HeartPulse, description: 'Notice evidence-based patterns' },
  { label: 'Beauty', href: '/beauty', icon: Sparkles, description: 'Keep the routine refined' },
  { label: 'Beauty Lab', href: '/beauty/lab', icon: Sparkles, description: 'Track products and reactions' },
  { label: 'Hair', href: '/hair', icon: Sparkles, description: 'Track hair care and next actions' },
  { label: 'Fitness', href: '/fitness', icon: Activity, description: 'Train around energy and recovery' },
  { label: 'Wellness', href: '/wellness', icon: HeartPulse, description: 'Protect your energy' },
  { label: 'Finance', href: '/finance', icon: Wallet, description: 'Stay financially calm' },
  { label: 'Financial Brain', href: '/finance/brain', icon: Wallet, description: 'Track goals and direction' },
  { label: 'Goals', href: '/goals', icon: Target, description: 'Move your ambitions forward' },
  { label: 'Projects', href: '/projects', icon: FolderKanban, description: 'Run projects and Creative Studio' },
  { label: 'Memory', href: '/memory', icon: LibraryBig, description: 'Build your private life memory' },
  { label: 'Timeline', href: '/timeline', icon: CalendarDays, description: 'See your life story over time' },
  { label: 'Briefings', href: '/briefings', icon: NotebookText, description: 'Morning, evening, and weekly reviews' },
  { label: 'Closet', href: '/closet', icon: HomeIcon, description: 'Know what you own and wear' },
  { label: 'World', href: '/world', icon: Globe2, description: 'Enter your Life World' },
  { label: 'Home', href: '/home', icon: HomeIcon, description: 'Care for your space' },
  { label: 'Notes', href: '/notes', icon: NotebookText, description: 'Capture ideas beautifully' },
  { label: 'Connections', href: '/connections', icon: Link2, description: 'Connect your digital world' },
  { label: 'Import', href: '/import', icon: UploadCloud, description: 'Bring in the Glow OS master system' },
  { label: 'Settings', href: '/settings', icon: SettingsIcon, description: 'Tune your environment' },
];
