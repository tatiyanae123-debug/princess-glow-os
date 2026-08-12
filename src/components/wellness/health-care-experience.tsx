'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Droplets, Moon, Activity, Smile, Sparkles, SunMedium } from 'lucide-react';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { Dialog } from '@/components/ui/dialog';
import { WellnessEntryForm } from '@/components/wellness/wellness-entry-form';
import type { WellnessEntry } from '@/lib/types';

const MOOD_SCORE: Record<string, number> = { great: 5, good: 4, okay: 3, low: 2, rough: 1 };
const ENERGY_SCORE: Record<string, number> = { high: 4, medium: 3, low: 2, exhausted: 1 };
const STRESS_LABEL = ['—', 'Calm', 'Light', 'Moderate', 'High', 'Overwhelmed'];

const CARE_CARDS = [
  { slot: 'care:hydrate', title: 'Hydrate & Refresh', detail: 'Drink a glass of water with lemon.', href: '/wellness' },
  { slot: 'care:wind-down', title: 'Wind Down', detail: 'Try a 10-min screen-free wind down.', href: '/routines' },
  { slot: 'care:move', title: 'Move Gently', detail: 'A 20-min walk or stretch will boost your energy.', href: '/fitness' },
  { slot: 'care:journal', title: 'Journal it Out', detail: 'Reflect and release with a quick check-in.', href: '/notes' },
];

export function HealthCareExperience({ entries }: { entries: WellnessEntry[] }) {
  const [intentionOpen, setIntentionOpen] = useState(false);
  const latest = entries[0] ?? null;

  const weekly = useMemo(() => {
    const last7 = entries.slice(0, 7).reverse();
    return last7.map((entry) => {
      const mood = entry.mood ? MOOD_SCORE[entry.mood] : null;
      const energy = entry.energy ? ENERGY_SCORE[entry.energy] : null;
      const scores = [mood, energy].filter((v): v is number => v != null);
      return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 2.5;
    });
  }, [entries]);

  const trendUp = weekly.length >= 2 ? weekly[weekly.length - 1] >= weekly[0] : true;
  const insight = latest
    ? latest.stressLevel != null && latest.stressLevel >= 4
      ? "Stress is elevated. Choose one grounding action before adding more to your plate."
      : "You're showing up for yourself consistently. Your sleep and hydration are supporting your energy and mood."
    : 'Log your first check-in to start seeing real patterns here.';

  const points = weekly.length > 1
    ? weekly.map((value, index) => `${(index / (weekly.length - 1)) * 100},${100 - (value / 5) * 100}`).join(' ')
    : '0,50 100,50';

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[22px] border border-[#F1E7E3]">
            <EditableRoomImage slot="wellness:hero" label="Health & Care hero" className="min-h-[200px] sm:min-h-[240px]">
              <div className="relative z-10 flex h-full flex-col justify-end bg-[linear-gradient(0deg,rgba(24,18,17,.5),transparent_60%)] p-6">
                <h1 className="glow-display text-[32px] leading-none text-white sm:text-[38px]">Health &amp; Care</h1>
                <p className="mt-2 text-[12.5px] text-white/85">Nourish your body. Calm your mind. Glow every day.</p>
              </div>
            </EditableRoomImage>
          </div>

          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <p className="text-[13px] font-medium text-[#2B2420]">Today at a glance</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-[14px] border border-[#F1E7E3] p-3">
                <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#4A4440]"><Droplets size={12} className="text-[#C9727E]" />Hydration</div>
                <p className="glow-display mt-2 text-[18px] text-[#2B2420]">{latest?.waterGlasses ?? '—'}<span className="text-[10px] text-[#9A9088]"> glasses</span></p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#F4ECE8]"><div className="h-full rounded-full bg-[#C9727E]" style={{ width: `${Math.min(100, ((latest?.waterGlasses ?? 0) / 8) * 100)}%` }} /></div>
                <p className="mt-1 text-[9.5px] text-[#9A9088]">{latest?.waterGlasses != null ? (latest.waterGlasses >= 6 ? 'Keep sipping' : 'Log more water') : 'Not logged'}</p>
              </div>
              <div className="rounded-[14px] border border-[#F1E7E3] p-3">
                <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#4A4440]"><Moon size={12} className="text-[#7C6B9C]" />Sleep</div>
                <p className="glow-display mt-2 text-[18px] text-[#2B2420]">{latest?.sleepHours != null ? `${latest.sleepHours}h` : '—'}</p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#F4ECE8]"><div className="h-full rounded-full bg-[#7C6B9C]" style={{ width: `${Math.min(100, ((latest?.sleepHours ?? 0) / 8) * 100)}%` }} /></div>
                <p className="mt-1 text-[9.5px] text-[#9A9088]">{latest?.sleepHours != null ? (latest.sleepHours >= 7 ? 'Good recovery' : 'Rest more') : 'Not logged'}</p>
              </div>
              <div className="rounded-[14px] border border-[#F1E7E3] p-3">
                <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#4A4440]"><Activity size={12} className="text-[#9A6A3D]" />Stress</div>
                <p className="glow-display mt-2 text-[18px] capitalize text-[#2B2420]">{STRESS_LABEL[latest?.stressLevel ?? 0]}</p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#F4ECE8]"><div className="h-full rounded-full bg-[#9A6A3D]" style={{ width: `${Math.min(100, ((latest?.stressLevel ?? 0) / 5) * 100)}%` }} /></div>
                <p className="mt-1 text-[9.5px] text-[#9A9088]">{latest?.stressLevel != null ? (latest.stressLevel <= 2 ? 'Feeling balanced' : 'Ease the load') : 'Not logged'}</p>
              </div>
              <div className="rounded-[14px] border border-[#F1E7E3] p-3">
                <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#4A4440]"><Smile size={12} className="text-[#5A6E52]" />Mood</div>
                <p className="glow-display mt-2 text-[18px] capitalize text-[#2B2420]">{latest?.mood ?? '—'}</p>
                <p className="mt-1 text-[9.5px] text-[#9A9088]">{latest?.mood ? 'Logged today' : 'Check in'}</p>
              </div>
              <div className="rounded-[14px] border border-[#F1E7E3] p-3">
                <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#4A4440]"><Sparkles size={12} className="text-[#C9727E]" />Energy</div>
                <p className="glow-display mt-2 text-[18px] capitalize text-[#2B2420]">{latest?.energy ?? '—'}</p>
                <p className="mt-1 text-[9.5px] text-[#9A9088]">{latest?.energy === 'high' ? 'Great time to focus' : latest?.energy ? 'Pace yourself' : 'Check in'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <p className="text-[13px] font-medium text-[#2B2420]">Recommended care</p>
            <p className="mt-1 text-[11.5px] text-[#8A8078]">Simple rituals that support how you feel today.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {CARE_CARDS.map((card) => (
                <Link key={card.slot} href={card.href} className="group overflow-hidden rounded-[14px] border border-[#F1E7E3]">
                  <EditableRoomImage slot={card.slot} label={card.title} className="h-24" />
                  <div className="p-3">
                    <p className="text-[12px] font-medium text-[#2B2420]">{card.title}</p>
                    <p className="mt-1 text-[10.5px] leading-4 text-[#8A8078]">{card.detail}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[18px] border-none bg-[linear-gradient(120deg,#FBE4E8,#FDF6F1)] p-5 text-center">
            <p className="glow-display text-[16px] italic text-[#4A3238]">&ldquo;Caring for yourself is the most powerful glow.&rdquo;</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-1.5"><Sparkles size={13} className="text-[#C9727E]" /><p className="text-[12px] font-medium text-[#2B2420]">Your insight</p></div>
            <p className="mt-2 text-[12.5px] leading-5 text-[#4A4440]">{insight}</p>
          </div>

          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center justify-between"><p className="text-[12px] font-medium text-[#2B2420]">Weekly overview</p><span className="text-[10.5px] text-[#9A9088]">This week</span></div>
            <svg viewBox="0 0 100 40" className="mt-3 h-14 w-full" preserveAspectRatio="none">
              <polyline points={points.split(' ').map((p) => { const [x, y] = p.split(','); return `${x},${Number(y) * 0.4}`; }).join(' ')} fill="none" stroke="#C9727E" strokeWidth="2" />
            </svg>
            <p className="mt-2 text-[11px] text-[#8A8078]">{trendUp ? "You're on a consistent path this week. Keep going!" : 'This week has been lighter — be gentle with yourself.'}</p>
            <Link href="/briefings" className="mt-2 inline-block text-[11px] font-medium text-[#C9727E]">See full report →</Link>
          </div>

          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-1.5"><SunMedium size={13} className="text-[#C9727E]" /><p className="text-[12px] font-medium text-[#2B2420]">Daily intention</p></div>
            <p className="mt-2 text-[12.5px] italic leading-5 text-[#4A4440]">{latest?.notes ? latest.notes : 'Set an intention for today.'}</p>
            <button type="button" onClick={() => setIntentionOpen(true)} className="mt-2 text-[11px] font-medium text-[#C9727E]">Edit intention →</button>
          </div>
        </div>
      </div>

      <Dialog open={intentionOpen} onClose={() => setIntentionOpen(false)} title="Today's check-in">
        <WellnessEntryForm entry={latest && new Date(latest.entryDate).toDateString() === new Date().toDateString() ? latest : null} onSaved={() => setIntentionOpen(false)} onCancel={() => setIntentionOpen(false)} />
      </Dialog>
    </div>
  );
}
