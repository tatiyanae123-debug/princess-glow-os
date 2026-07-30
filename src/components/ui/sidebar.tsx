'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, MoonStar, SunMedium } from 'lucide-react';
import { navItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    window.localStorage.setItem('theme', nextTheme);
    setTheme(nextTheme);
  };

  return (
    <aside className="flex h-full w-full flex-col justify-between rounded-[30px] border border-slate-200/80 bg-slate-950/95 p-5 text-slate-100 shadow-[0_25px_80px_rgba(15,23,42,0.22)] dark:border-slate-800 dark:bg-slate-950">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-400/20 text-rose-300">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">Princess Glow</p>
            <h2 className="text-lg font-semibold">Life OS</h2>
          </div>
        </div>

        <nav className="mt-8 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition',
                  active ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon size={16} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={toggleTheme}
        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-sm text-slate-200"
      >
        <span className="flex items-center gap-3">
          {theme === 'light' ? <SunMedium size={16} /> : <MoonStar size={16} />}
          {theme === 'light' ? 'Light mode' : 'Dark mode'}
        </span>
      </button>
    </aside>
  );
}
