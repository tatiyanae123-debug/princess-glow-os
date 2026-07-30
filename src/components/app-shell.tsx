'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu } from 'lucide-react';
import { sections } from '@/lib/sections';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentPath = pathname?.split('/').filter(Boolean)[0] || 'today';

  return (
    <div className="min-h-screen bg-transparent px-3 py-4 text-slate-800 sm:px-4 lg:px-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[36px] border border-white/70 bg-white/70 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur xl:flex-row xl:p-4">
        <aside className="flex flex-col justify-between rounded-[28px] bg-slate-900 p-4 text-white xl:w-72 xl:p-6">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Princess Glow</p>
                <h1 className="mt-2 text-2xl font-semibold">Life OS</h1>
              </div>
              <button className="rounded-full border border-white/20 p-2 text-slate-300 xl:hidden">
                <Menu size={18} />
              </button>
            </div>

            <nav className="mt-8 space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = currentPath === section.slug;
                return (
                  <Link
                    key={section.slug}
                    href={`/${section.slug}`}
                    className={`flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition ${
                      isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} />
                      {section.title}
                    </span>
                    <ArrowUpRight size={16} />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-8 rounded-[24px] border border-white/10 bg-white/10 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Tonight’s note</p>
            <p className="mt-2 leading-6">Leave the day feeling softer than you found it.</p>
          </div>
        </aside>

        <main className="flex-1 rounded-[28px] bg-[linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(250,247,242,0.92))] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
