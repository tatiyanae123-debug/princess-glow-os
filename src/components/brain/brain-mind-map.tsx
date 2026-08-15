'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BadgeDollarSign,
  BookOpen,
  Briefcase,
  CalendarDays,
  Dumbbell,
  HeartPulse,
  Lightbulb,
  Maximize2,
  Pencil,
  Plus,
  Sparkles,
  Target,
  Trash2,
  X,
} from 'lucide-react';
import type { BrainMapDomain } from '@/lib/intelligence/brain-connections';
import { useServerAction } from '@/lib/hooks/use-server-action';
import {
  createBrainMindMapLinkAction,
  deleteBrainMindMapLinkAction,
  getBrainMindMapLinksAction,
} from '@/app/actions/brain-mind-map';

const ICONS: Record<string, typeof Target> = {
  goals: Target,
  fitness: Dumbbell,
  finance: BadgeDollarSign,
  work: Briefcase,
  ideas: Lightbulb,
  wellness: HeartPulse,
  memories: BookOpen,
};

const POSITIONS: Record<string, { x: number; y: number }> = {
  fitness: { x: 50, y: 10 },
  goals: { x: 20, y: 27 },
  finance: { x: 80, y: 27 },
  work: { x: 12, y: 60 },
  ideas: { x: 88, y: 60 },
  memories: { x: 26, y: 90 },
  wellness: { x: 74, y: 90 },
};

const CUSTOM_DESTINATIONS = [
  { label: 'Tasks', href: '/tasks' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Projects', href: '/projects' },
  { label: 'Goals', href: '/goals' },
  { label: 'Beauty', href: '/beauty' },
  { label: 'Beauty Lab', href: '/beauty/lab' },
  { label: 'Hair', href: '/hair' },
  { label: 'Wellness', href: '/wellness' },
  { label: 'Fitness', href: '/fitness' },
  { label: 'Food & Nutrition', href: '/food' },
  { label: 'Finance', href: '/finance' },
  { label: 'Financial Brain', href: '/finance/brain' },
  { label: 'Work', href: '/work' },
  { label: 'Creative Studio', href: '/projects' },
  { label: 'Memory', href: '/memory' },
  { label: 'Timeline', href: '/timeline' },
  { label: 'Notes', href: '/notes' },
] as const;

type CustomMindMapLink = {
  id: string;
  label: string;
  href: string;
};

export function BrainMindMap({ domains }: { domains: BrainMapDomain[] }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedHref, setSelectedHref] = useState('/tasks');
  const [customLabel, setCustomLabel] = useState('');
  const [customLinks, setCustomLinks] = useState<CustomMindMapLink[]>([]);
  const loadLinks = useServerAction(getBrainMindMapLinksAction);
  const createLink = useServerAction(createBrainMindMapLinkAction);
  const deleteLink = useServerAction(deleteBrainMindMapLinkAction);

  useEffect(() => {
    loadLinks.run(undefined, (rows) => setCustomLinks(rows));
    // Server action identity is stable for this client module; this should only hydrate once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const destination = useMemo(
    () => CUSTOM_DESTINATIONS.find((item) => item.href === selectedHref) ?? CUSTOM_DESTINATIONS[0],
    [selectedHref],
  );

  function addConnection() {
    const label = customLabel.trim() || destination.label;
    createLink.run({ label, href: destination.href }, (created) => {
      if (!customLinks.some((item) => item.id === created.id)) {
        setCustomLinks((current) => [...current, created]);
      }
      setCustomLabel('');
      setAdding(false);
    });
  }

  function removeConnection(id: string) {
    deleteLink.run(id, () => {
      setCustomLinks((current) => current.filter((item) => item.id !== id));
    });
  }

  return (
    <div className="relative rounded-[20px] border border-[#F1E7E3] bg-white p-5 transition-shadow duration-300 hover:shadow-[0_14px_38px_rgba(70,48,42,.045)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[14px] font-medium text-[#2B2420]">Your Mind Map</p>
          <p className="mt-1 text-[10.5px] text-[#A79D96]">Your connected rooms and the shortcuts you choose to keep close.</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setEditing((value) => !value)} className="flex min-h-9 items-center gap-1.5 rounded-full border border-[#F1E7E3] px-3 py-1.5 text-[11px] font-medium text-[#8A8078] transition hover:-translate-y-0.5 hover:bg-[#FDF8F6]" aria-pressed={editing}>
            <Pencil size={12} />{editing ? 'Done' : 'Edit Map'}
          </button>
          <button type="button" onClick={() => setExpanded((value) => !value)} className="flex min-h-9 items-center gap-1.5 rounded-full border border-[#F1E7E3] px-3 py-1.5 text-[11px] font-medium text-[#8A8078] transition hover:-translate-y-0.5 hover:bg-[#FDF8F6]" aria-pressed={expanded}>
            <Maximize2 size={12} />{expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {loadLinks.isPending ? <p className="mt-3 text-[10.5px] text-[#A79D96]">Loading your saved map…</p> : null}
      {loadLinks.error ? <p className="mt-3 text-[10.5px] text-rose-500">{loadLinks.error}</p> : null}

      <div className={`relative mx-auto mt-6 hidden w-full sm:block ${expanded ? 'aspect-[3/2] max-w-[760px]' : 'aspect-[16/10] max-w-[640px]'}`}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
          {domains.map((domain) => {
            const pos = POSITIONS[domain.id];
            if (!pos) return null;
            return <line key={domain.id} x1={50} y1={50} x2={pos.x} y2={pos.y} stroke="#EBD6D3" strokeWidth={0.4} />;
          })}
        </svg>

        <div className="absolute flex h-[88px] w-[88px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[#F2D8DC] bg-[#FBE4E8] text-[#B15A68] shadow-[0_6px_20px_rgba(201,114,126,.14)]" style={{ left: '50%', top: '50%' }}>
          <span className="glow-display text-[20px]">You</span>
        </div>

        {domains.map((domain) => {
          const pos = POSITIONS[domain.id];
          if (!pos) return null;
          const Icon = ICONS[domain.id] ?? Target;
          return (
            <Link
              key={domain.id}
              href={domain.href}
              className="absolute flex min-h-10 -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11.5px] font-medium text-[#4A4440] shadow-[0_4px_14px_rgba(80,60,55,.05)] transition duration-300 hover:-translate-y-[calc(50%+3px)] hover:border-[#E7C5C7] hover:text-[#B15A68] hover:shadow-[0_10px_24px_rgba(80,60,55,.08)]"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              title={`${domain.count} in ${domain.label}`}
            >
              <Icon size={13} className="text-[#C9727E]" />{domain.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 sm:hidden">
        <div className="mx-auto flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full border border-[#F2D8DC] bg-[#FBE4E8] text-[#B15A68]">
          <span className="glow-display text-[16px]">You</span>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {domains.map((domain) => {
            const Icon = ICONS[domain.id] ?? Target;
            return (
              <Link key={domain.id} href={domain.href} className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11.5px] font-medium text-[#4A4440] transition active:scale-[.98]">
                <Icon size={13} className="text-[#C9727E]" />{domain.label}
              </Link>
            );
          })}
        </div>
      </div>

      {customLinks.length > 0 ? (
        <div className="mt-5 border-t border-[#F4ECE8] pt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#A79D96]">Your Added Connections</p>
            {editing ? <span className="text-[10px] text-[#C9727E]">Tap remove to edit</span> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {customLinks.map((item) => (
              <div key={item.id} className="group flex items-center rounded-full border border-[#F1E7E3] bg-[#FFFCFA]">
                <Link href={item.href} className="flex min-h-10 items-center gap-1.5 px-3.5 text-[11.5px] font-medium text-[#4A4440] transition hover:text-[#B15A68]">
                  <Sparkles size={12} className="text-[#C9727E]" />{item.label}
                </Link>
                {editing ? (
                  <button type="button" disabled={deleteLink.isPending} onClick={() => removeConnection(item.id)} className="mr-1 flex h-8 w-8 items-center justify-center rounded-full text-[#B5ACA5] transition hover:bg-[#FBE4E8] hover:text-[#B15A68] disabled:opacity-50" aria-label={`Remove ${item.label} from mind map`}>
                    <Trash2 size={12} />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          {deleteLink.error ? <p className="mt-2 text-[10.5px] text-rose-500">{deleteLink.error}</p> : null}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#F1E7E3] pt-4">
        <Link href="/brain/connections" className="flex min-h-10 items-center gap-1.5 text-[11.5px] font-medium text-[#8A8078] transition hover:text-[#4A4440]">View as List</Link>
        <button type="button" onClick={() => setAdding(true)} className="flex min-h-10 items-center gap-2 rounded-full bg-[#C9727E] px-4 py-2 text-[11.5px] font-medium text-white shadow-[0_6px_18px_rgba(201,114,126,.18)] transition hover:-translate-y-0.5 hover:bg-[#B15A68] active:translate-y-0 active:scale-[.98]">
          Add Connection <Plus size={14} />
        </button>
      </div>

      {adding ? (
        <div className="fixed inset-0 z-[130] flex items-end justify-center bg-[#2B2420]/20 p-0 backdrop-blur-[3px] sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="brain-add-connection-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setAdding(false); }}>
          <div className="w-full rounded-t-[28px] border border-[#F1E7E3] bg-[#FFFCFA] p-5 shadow-[0_30px_80px_rgba(55,38,32,.18)] sm:max-w-[520px] sm:rounded-[28px] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="glow-eyebrow">Mind Map</p>
                <h2 id="brain-add-connection-title" className="glow-display mt-1 text-[28px] leading-tight text-[#2B2420]">Add a connection</h2>
                <p className="mt-2 text-[12px] leading-5 text-[#8A8078]">Add a real Glow OS room to your personal map. This changes your map layout only; it does not invent a data relationship.</p>
              </div>
              <button type="button" onClick={() => setAdding(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F1E7E3] bg-white text-[#8A8078] transition hover:bg-[#FDF3F2]" aria-label="Close add connection">
                <X size={16} />
              </button>
            </div>

            <label className="mt-5 block text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]" htmlFor="brain-connection-room">Glow OS room</label>
            <select id="brain-connection-room" value={selectedHref} onChange={(event) => setSelectedHref(event.target.value)} className="mt-2 min-h-12 w-full rounded-[14px] border border-[#EDE2DD] bg-white px-3 text-[13px] text-[#2B2420] outline-none transition focus:border-[#DDAEB4] focus:ring-2 focus:ring-[#FBE4E8]">
              {CUSTOM_DESTINATIONS.map((item) => <option key={`${item.href}-${item.label}`} value={item.href}>{item.label}</option>)}
            </select>

            <label className="mt-4 block text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]" htmlFor="brain-connection-label">Label on your map</label>
            <input id="brain-connection-label" value={customLabel} onChange={(event) => setCustomLabel(event.target.value)} placeholder={destination.label} maxLength={40} className="mt-2 min-h-12 w-full rounded-[14px] border border-[#EDE2DD] bg-white px-3 text-[13px] text-[#2B2420] outline-none transition placeholder:text-[#B5ACA5] focus:border-[#DDAEB4] focus:ring-2 focus:ring-[#FBE4E8]" />

            {createLink.error ? <p className="mt-3 text-[10.5px] text-rose-500">{createLink.error}</p> : null}
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setAdding(false)} className="min-h-11 flex-1 rounded-full border border-[#EDE2DD] bg-white px-4 text-[12px] font-medium text-[#6F655E] transition hover:bg-[#FDF8F6]">Cancel</button>
              <button type="button" disabled={createLink.isPending} onClick={addConnection} className="min-h-11 flex-1 rounded-full bg-[#C9727E] px-4 text-[12px] font-medium text-white shadow-[0_6px_18px_rgba(201,114,126,.18)] transition hover:bg-[#B15A68] active:scale-[.98] disabled:opacity-50">{createLink.isPending ? 'Saving…' : 'Add to Mind Map'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
