'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BatteryMedium, BookOpen, Cloud, Droplets, Heart, Leaf, Moon, Pencil, Plus, Smile, Sparkles, Trash2, Waves, type LucideIcon } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { WellnessEntryForm } from '@/components/wellness/wellness-entry-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteWellnessEntryAction } from '@/app/actions/wellness-entries';
import type { Note, Routine, WellnessEntry } from '@/lib/types';

type Props = { initialEntries: WellnessEntry[]; notes: Note[]; routines: Routine[] };
const moodScore = { rough: 1, low: 2, okay: 3, good: 4, great: 5 } as const;
const energyScore = { exhausted: 1, low: 2, medium: 3, high: 5 } as const;
const wellnessTools: Array<{ name: string; detail: string; icon: LucideIcon; href: string; needsRoutine?: boolean; unavailable?: boolean }> = [
  { name: 'Breathing', detail: '3 min', icon: Waves, href: '/routines', needsRoutine: true },
  { name: 'Meditation', detail: '10 min', icon: Sparkles, href: '/routines', needsRoutine: true },
  { name: 'Journal', detail: 'Write freely', icon: Pencil, href: '/notes' },
  { name: 'Gratitude', detail: 'Capture a thought', icon: Heart, href: '/notes' },
  { name: 'Stretch', detail: 'Open routines', icon: Leaf, href: '/routines', needsRoutine: true },
  { name: 'Sound Bath', detail: 'Not connected', icon: Moon, href: '#tools', unavailable: true },
];

export function WellnessEntryManager({ initialEntries, notes, routines }: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [dialogEntry, setDialogEntry] = useState<WellnessEntry | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WellnessEntry | null>(null);
  const del = useServerAction((id: string) => deleteWellnessEntryAction(id));
  const latest = entries[0] ?? null;
  const sleepEntries = entries.filter((entry) => entry.sleepHours != null);
  const sleepAverage = sleepEntries.length >= 3 ? sleepEntries.reduce((sum, entry) => sum + (entry.sleepHours ?? 0), 0) / sleepEntries.length : null;
  const journalNotes = notes.filter((note) => /wellness|journal|reflect|gratitude|mood/i.test([note.title, note.content, ...(note.tags ?? [])].filter(Boolean).join(' ')));
  const resetRoutine = routines.find((routine) => /reset|wellness|evening|wind.?down|meditat|breath/i.test(`${routine.name} ${routine.description ?? ''}`));
  const focus = !latest ? 'Complete your check-in' : (latest.waterGlasses ?? 8) < 6 ? 'Hydration' : ['low', 'exhausted'].includes(latest.energy ?? '') ? 'Gentle rest' : 'Protect your peace';
  const insight = useMemo(() => {
    if (!latest) return 'There is not enough check-in history to identify a pattern yet.';
    if ((latest.waterGlasses ?? 8) < 6) return `Your latest check-in records ${latest.waterGlasses} glasses of water. A gentle hydration pause may fit today.`;
    if (['low', 'exhausted'].includes(latest.energy ?? '')) return `Your latest energy check-in is ${latest.energy}. Consider choosing a low-demand reset.`;
    if (sleepEntries.length < 3) return 'Sleep history is still limited. Three recorded nights are needed before showing an average.';
    return `Your latest check-in records ${latest.mood ?? 'no mood'} mood and ${latest.energy ?? 'no energy level'}.`;
  }, [latest, sleepEntries.length]);

  function handleSaved(entry: WellnessEntry) {
    setEntries((current) => [...current.filter((item) => item.id !== entry.id), entry].sort((a, b) => b.entryDate.localeCompare(a.entryDate)));
    setDialogEntry(null);
  }
  function handleDelete() { if (deleteTarget) del.run(deleteTarget.id, () => { setEntries((current) => current.filter((entry) => entry.id !== deleteTarget.id)); setDeleteTarget(null); }); }

  return <div className="wellness-page">
    <header className="wellness-heading"><div><h1>Wellness Sanctuary <Leaf /></h1><p>Your peace is your power.</p><small>Check in with yourself. Nourish your body, calm your mind, and protect your energy.</small></div><button onClick={() => setDialogEntry('new')}><Plus /> Check in</button></header>
    <nav className="wellness-tabs" aria-label="Wellness sections">{['Today','Check-In','Sleep','Stress','Energy','Tools','Journal','Insights'].map((tab, index) => <a key={tab} className={index === 0 ? 'active' : ''} href={`#${tab.toLowerCase().replace('-','')}`}>{tab}</a>)}</nav>
    <div className="wellness-layout"><main>
      <section className="sanctuary-hero" id="today"><div className="sanctuary-checkin"><span>HOW ARE YOU FEELING?</span><small>{latest ? `Latest · ${latest.entryDate}` : 'No check-in recorded'}</small><WellnessScale icon={<BatteryMedium />} label="Energy" score={latest?.energy ? energyScore[latest.energy] : 0} /><WellnessScale icon={<Cloud />} label="Stress" score={0} unavailable /><WellnessScale icon={<Smile />} label="Mood" score={latest?.mood ? moodScore[latest.mood] : 0} /><div className="checkin-value"><Moon /><b>Sleep</b><span>{latest?.sleepHours != null ? `${latest.sleepHours}h` : 'Not recorded'}</span></div><div className="checkin-value"><Droplets /><b>Hydration</b><span>{latest?.waterGlasses != null ? `${latest.waterGlasses} glasses` : 'Not recorded'}</span></div><button onClick={() => setDialogEntry(latest ?? 'new')}>{latest ? 'Update Check-In' : 'Check In Now'}</button></div><div className="sanctuary-image"><img src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1400&q=85" alt="Quiet sanctuary with candle and tea" /><blockquote>“Rest is productive.<br/>Peace is powerful.<br/>You are becoming.”</blockquote></div></section>
      <section className="wellness-tools" id="tools"><b>WELLNESS TOOLS</b><div>{wellnessTools.map((tool) => { const available = !tool.unavailable && (!tool.needsRoutine || Boolean(resetRoutine)); const Icon = tool.icon; return <Link className={!available ? 'unavailable' : ''} href={tool.href} key={tool.name}><Icon /><strong>{tool.name}</strong><small>{tool.detail}</small>{!available && <em>Setup needed</em>}</Link>; })}</div></section>
      <div className="wellness-lower">
        <section className="journal-paper" id="journal"><header><b>WELLNESS JOURNAL</b><Link href="/notes">Write <Pencil /></Link></header>{journalNotes[0] ? <><small>{journalNotes[0].title}</small><blockquote>{journalNotes[0].content || 'This note has no reflection text yet.'}</blockquote><time>{journalNotes[0].updatedAt.toLocaleDateString()}</time></> : <div className="wellness-empty"><BookOpen /><b>No reflection recorded</b><p>Write in the existing Notes room and tag it wellness or journal.</p></div>}</section>
        <section className="sleep-overview" id="sleep"><b>SLEEP OVERVIEW</b><div><Moon /><strong>{latest?.sleepHours != null ? `${latest.sleepHours}h` : '—'}<small>Latest recorded night</small></strong></div><div className="sleep-bands">{sleepEntries.slice(0,8).reverse().map((entry) => <i key={entry.id} style={{ opacity: Math.max(.25, Math.min(1, (entry.sleepHours ?? 0) / 9)) }}></i>)}</div><p>{sleepAverage != null ? `${sleepAverage.toFixed(1)}h average across ${sleepEntries.length} recorded nights.` : 'Limited data · record at least three nights for an average.'}</p></section>
        <section className="wellness-insights" id="insights"><b>WELLNESS INSIGHTS</b><div><Leaf /><p>{insight}</p></div><small>Informational only — not medical guidance.</small></section>
      </div>
      <section className="wellness-companion"><Sparkles /><div><b>AI WELLNESS COMPANION</b><p>{resetRoutine ? `${resetRoutine.name} is available as a gentle next step.` : 'A brief journal reflection or quiet pause can be a gentle next step.'}</p></div><Link href={resetRoutine ? '/routines' : '/notes'}>{resetRoutine ? 'Open Routine' : 'Journal'} <ArrowRight /></Link></section>
    </main><aside className="wellness-rail">
      <section><h2>TODAY&apos;S WELLNESS FOCUS</h2><strong>{focus}</strong><p>{!latest ? 'Begin with an honest, private check-in.' : 'Chosen only from your latest stored check-in.'}</p><button onClick={() => setDialogEntry(latest ?? 'new')}>{latest ? 'Review Check-In' : 'Start Check-In'}</button></section>
      <section><h2>CURRENT CHECK-IN</h2>{latest ? <div className="current-wellness"><span><Smile /> Mood <b>{latest.mood ?? '—'}</b></span><span><BatteryMedium /> Energy <b>{latest.energy ?? '—'}</b></span><span><Droplets /> Water <b>{latest.waterGlasses ?? '—'}</b></span></div> : <div className="wellness-empty"><Leaf /><b>No current check-in</b><p>Your sanctuary begins with real context.</p></div>}</section>
      <section><h2>WELLNESS HISTORY</h2><div className="wellness-ring" style={{ '--wellness-progress': `${Math.min(entries.length, 7) / 7 * 100}%` } as React.CSSProperties}><strong>{entries.length}<small>check-ins</small></strong></div><p>{entries.length < 2 ? 'More history is needed before a streak can be calculated.' : 'Check-in count shown. Consecutive streaks are not inferred.'}</p></section>
      <section><h2>SELF CARE IDEAS</h2>{['Take a quiet walk','Read a few pages','Take a warm bath','Choose a digital pause','Reflect for ten minutes'].map((idea) => <p className="self-care" key={idea}><Heart /> {idea}</p>)}<small>Optional, non-medical suggestions.</small></section>
    </aside></div>
    <Dialog open={dialogEntry !== null} onClose={() => setDialogEntry(null)} title={dialogEntry === 'new' ? 'Wellness check-in' : 'Update check-in'}><WellnessEntryForm entry={dialogEntry === 'new' ? null : dialogEntry} onSaved={handleSaved} onCancel={() => setDialogEntry(null)} /></Dialog>
    <ConfirmDialog open={deleteTarget !== null} title="Delete this check-in?" description={deleteTarget ? `The ${deleteTarget.entryDate} check-in will be removed.` : undefined} pending={del.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    {latest && <div className="wellness-record-actions"><button onClick={() => setDialogEntry(latest)}><Pencil /> Edit latest</button><button onClick={() => setDeleteTarget(latest)}><Trash2 /> Delete latest</button></div>}
  </div>;
}

function WellnessScale({ icon, label, score, unavailable = false }: { icon: React.ReactNode; label: string; score: number; unavailable?: boolean }) { return <div className="wellness-scale">{icon}<b>{label}</b><span>{[1,2,3,4,5].map((value) => <i className={value <= score ? 'filled' : ''} key={value}></i>)}</span>{unavailable && <small>Not stored</small>}</div>; }
