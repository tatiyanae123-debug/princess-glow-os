'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { navItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useGlow } from '@/lib/context/glow-provider';
import { THEMES } from '@/lib/themes';

export function Sidebar() {
  const pathname = usePathname();
  const { themeId, setTheme, isCustomizing } = useGlow();

  return (
    <aside
      className="flex h-full w-full flex-col justify-between p-5 lg:min-h-[calc(100vh-3rem)] animate-slide-right"
      style={{
        background: 'var(--glow-sidebar)',
        borderRadius: 'var(--glow-radius)',
        boxShadow: 'var(--glow-shadow)',
      }}
    >
      {/* Brand */}
      <div>
        <div className="flex items-center gap-3 pb-6">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}
          >
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] opacity-50 text-white">Princess Glow</p>
            <h2
              className="text-lg font-semibold text-white"
              style={{ fontFamily: 'var(--glow-font-display)' }}
            >
              Life OS
            </h2>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-200',
                  active
                    ? 'text-white font-medium'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                )}
                style={active ? { background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' } : {}}
              >
                <Icon
                  size={15}
                  className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                />
                <span className="truncate">{item.label}</span>
                {active && (
                  <span
                    className="ml-auto h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--glow-accent)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Theme selector */}
      <div className="mt-6 space-y-2">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 px-1">Visual theme</p>
        <div className="grid grid-cols-4 gap-1.5">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              title={t.name}
              onClick={() => setTheme(t.id)}
              disabled={isCustomizing}
              className={cn(
                'h-7 w-full rounded-xl border transition-all duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2',
                themeId === t.id ? 'ring-2 ring-white/60' : 'opacity-60 hover:opacity-100'
              )}
              style={{ background: t.tokens.accent, borderColor: 'transparent' }}
              aria-label={`Switch to ${t.name} theme`}
              aria-pressed={themeId === t.id}
            />
          ))}
        </div>
        <p className="text-[11px] text-white/30 px-1">
          {THEMES.find((t) => t.id === themeId)?.name}
        </p>
      </div>
    </aside>
  );
}
