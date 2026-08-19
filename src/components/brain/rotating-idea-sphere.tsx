'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Pause, Play, Plus, Rotate3D, Sparkles, Trash2, X } from 'lucide-react';
import type { BrainMapDomain } from '@/lib/intelligence/brain-connections';
import { useServerAction } from '@/lib/hooks/use-server-action';
import {
  createBrainMindMapLinkAction,
  deleteBrainMindMapLinkAction,
  getBrainMindMapLinksAction,
} from '@/app/actions/brain-mind-map';

type IdeaNote = {
  id: string;
  title: string;
  content?: string | null;
};

type SphereNode = {
  id: string;
  label: string;
  href: string;
  kind: 'idea' | 'room' | 'custom';
  count?: number;
};

type CustomMindMapLink = {
  id: string;
  label: string;
  href: string;
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
  { label: 'Creative Studio', href: '/creative-studio' },
  { label: 'Memory', href: '/memory' },
  { label: 'Timeline', href: '/timeline' },
  { label: 'Notes', href: '/notes' },
] as const;

function fibonacciPoint(index: number, total: number) {
  const phi = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (index / Math.max(1, total - 1)) * 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = phi * index;
  return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
}

function rotatePoint(point: { x: number; y: number; z: number }, yaw: number, pitch: number) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const x1 = point.x * cy - point.z * sy;
  const z1 = point.x * sy + point.z * cy;
  const y2 = point.y * cp - z1 * sp;
  const z2 = point.y * sp + z1 * cp;
  return { x: x1, y: y2, z: z2 };
}

function compactTitle(title: string) {
  const clean = title.replace(/\s+/g, ' ').trim();
  return clean.length > 30 ? `${clean.slice(0, 29)}…` : clean;
}

export function RotatingIdeaSphere({
  notes,
  domains = [],
  allowConnections = false,
  title = 'Your 3D Mind Sphere',
  subtitle = 'Drag to rotate. Your ideas, notes and life rooms move together as one connected world.',
}: {
  notes: IdeaNote[];
  domains?: BrainMapDomain[];
  allowConnections?: boolean;
  title?: string;
  subtitle?: string;
}) {
  const [rotation, setRotation] = useState({ yaw: 0.35, pitch: -0.12 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'ideas' | 'rooms'>('all');
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ x: 0, y: 0, yaw: 0, pitch: 0 });
  const [customLinks, setCustomLinks] = useState<CustomMindMapLink[]>([]);
  const [adding, setAdding] = useState(false);
  const [selectedHref, setSelectedHref] = useState('/tasks');
  const [customLabel, setCustomLabel] = useState('');
  const loadLinks = useServerAction(getBrainMindMapLinksAction);
  const createLink = useServerAction(createBrainMindMapLinkAction);
  const deleteLink = useServerAction(deleteBrainMindMapLinkAction);

  useEffect(() => {
    if (!allowConnections) return;
    loadLinks.run(undefined, (rows) => setCustomLinks(rows));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowConnections]);

  useEffect(() => {
    if (!autoRotate || dragging) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      if (now - last > 28) {
        setRotation((current) => ({ ...current, yaw: current.yaw + 0.0065 }));
        last = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [autoRotate, dragging]);

  const allNodes = useMemo<SphereNode[]>(() => {
    const ideaNodes = notes.slice(0, 32).map((note) => ({
      id: `note-${note.id}`,
      label: compactTitle(note.title || 'Untitled idea'),
      href: `/notes?noteId=${encodeURIComponent(note.id)}`,
      kind: 'idea' as const,
    }));
    const roomNodes = domains.filter((domain) => domain.count > 0).map((domain) => ({
      id: `domain-${domain.id}`,
      label: domain.label,
      href: domain.href,
      kind: 'room' as const,
      count: domain.count,
    }));
    const customNodes = customLinks.map((item) => ({
      id: `custom-${item.id}`,
      label: item.label,
      href: item.href,
      kind: 'custom' as const,
    }));
    return [...ideaNodes, ...roomNodes, ...customNodes].slice(0, 42);
  }, [notes, domains, customLinks]);

  const visibleNodes = useMemo(() => {
    if (filter === 'ideas') return allNodes.filter((node) => node.kind === 'idea');
    if (filter === 'rooms') return allNodes.filter((node) => node.kind !== 'idea');
    return allNodes;
  }, [allNodes, filter]);

  const projected = useMemo(() => visibleNodes.map((node, index) => {
    const base = fibonacciPoint(index, Math.max(visibleNodes.length, 2));
    const p = rotatePoint(base, rotation.yaw, rotation.pitch);
    const depth = (p.z + 1) / 2;
    const perspective = 0.78 + depth * 0.32;
    return {
      ...node,
      x: 50 + p.x * 39 * perspective,
      y: 50 + p.y * 39 * perspective,
      z: p.z,
      scale: 0.72 + depth * 0.46,
      opacity: 0.38 + depth * 0.62,
    };
  }), [visibleNodes, rotation]);

  const selectedDestination = CUSTOM_DESTINATIONS.find((item) => item.href === selectedHref) ?? CUSTOM_DESTINATIONS[0];

  function pointerDown(event: React.PointerEvent<HTMLDivElement>) {
    setDragging(true);
    setAutoRotate(false);
    dragRef.current = { x: event.clientX, y: event.clientY, yaw: rotation.yaw, pitch: rotation.pitch };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    setRotation({
      yaw: dragRef.current.yaw + dx * 0.008,
      pitch: Math.max(-1.15, Math.min(1.15, dragRef.current.pitch - dy * 0.007)),
    });
  }

  function pointerUp(event: React.PointerEvent<HTMLDivElement>) {
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function addConnection() {
    if (!allowConnections) return;
    const label = customLabel.trim() || selectedDestination.label;
    createLink.run({ label, href: selectedDestination.href }, (created) => {
      setCustomLinks((current) => current.some((item) => item.id === created.id) ? current : [...current, created]);
      setCustomLabel('');
      setAdding(false);
    });
  }

  function removeConnection(id: string) {
    deleteLink.run(id, () => setCustomLinks((current) => current.filter((item) => item.id !== id)));
  }

  return (
    <section className={`overflow-hidden rounded-[22px] border border-[#eee3df] bg-[radial-gradient(circle_at_50%_42%,#fff_0%,#fdf8f7_44%,#f5eeec_100%)] ${expanded ? 'p-4 sm:p-6' : 'p-4 sm:p-5'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[#b85d72]"><Rotate3D size={15} /><span className="text-[10px] font-semibold uppercase tracking-[.14em]">Living idea system</span></div>
          <h2 className="glow-display mt-1 text-[26px] text-[#2b2420] sm:text-[31px]">{title}</h2>
          <p className="mt-1 max-w-2xl text-[11px] leading-5 text-[#8a8078]">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setAutoRotate((value) => !value)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#eaded9] bg-white/85 px-3 text-[10.5px] text-[#6f6660] transition hover:bg-white">
            {autoRotate ? <Pause size={12} /> : <Play size={12} />}{autoRotate ? 'Pause' : 'Rotate'}
          </button>
          <button type="button" onClick={() => setExpanded((value) => !value)} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#eaded9] bg-white/85 px-3 text-[10.5px] text-[#6f6660] transition hover:bg-white">
            <Maximize2 size={12} />{expanded ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full border border-[#eaded9] bg-white/75 p-1">
          {(['all', 'ideas', 'rooms'] as const).map((value) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-full px-3 py-1.5 text-[10px] capitalize transition ${filter === value ? 'bg-[#c9727e] text-white' : 'text-[#827872] hover:bg-[#f9efee]'}`}>{value}</button>
          ))}
        </div>
        <p className="text-[10px] text-[#a59a93]">{visibleNodes.length} orbiting {visibleNodes.length === 1 ? 'idea' : 'items'} · drag anywhere to turn the sphere</p>
      </div>

      <div
        className={`relative mx-auto mt-3 select-none touch-none overflow-hidden rounded-[24px] border border-white/80 bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,.95)_0%,rgba(249,235,238,.72)_24%,rgba(235,226,243,.46)_48%,rgba(236,243,230,.38)_67%,rgba(255,255,255,.15)_100%)] ${expanded ? 'h-[620px]' : 'h-[430px] sm:h-[500px]'}`}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        aria-label="Interactive rotating 3D idea sphere"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#dbc8ce]/55 shadow-[inset_0_0_65px_rgba(192,113,137,.11),0_18px_70px_rgba(86,61,75,.08)]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[54%] w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e8dce9]/70" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[35%] w-[35%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#dfe8da]/80" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[65] flex h-[108px] w-[108px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-white/90 bg-white/82 text-center shadow-[0_18px_60px_rgba(150,91,111,.18)] backdrop-blur-md">
          <Sparkles size={18} className="text-[#c9727e]" />
          <span className="glow-display mt-1 text-[18px] text-[#4d3b43]">Your Mind</span>
          <span className="text-[8px] uppercase tracking-[.12em] text-[#a48891]">living ideas</span>
        </div>

        {projected.map((node) => {
          const tone = node.kind === 'idea'
            ? 'border-[#f0d9df] bg-white/92 text-[#704d59]'
            : node.kind === 'custom'
              ? 'border-[#dfe8d9] bg-[#fbfdf9]/94 text-[#5f725a]'
              : 'border-[#e4dced] bg-[#fdfbff]/94 text-[#6e6281]';
          return (
            <Link
              key={node.id}
              href={node.href}
              onPointerDown={(event) => event.stopPropagation()}
              className={`absolute z-20 max-w-[148px] -translate-x-1/2 -translate-y-1/2 rounded-full border px-3 py-2 text-[10px] font-medium shadow-[0_8px_22px_rgba(66,47,57,.08)] backdrop-blur-sm transition hover:z-[80] hover:scale-110 hover:shadow-[0_12px_28px_rgba(66,47,57,.14)] ${tone}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                opacity: node.opacity,
                transform: `translate(-50%, -50%) scale(${node.scale})`,
                zIndex: Math.round(20 + (node.z + 1) * 25),
              }}
              title={node.count ? `${node.label} · ${node.count} connected items` : node.label}
            >
              <span className="block truncate">{node.label}</span>
              {node.count ? <span className="ml-1 text-[8px] text-[#a89cab]">{node.count}</span> : null}
            </Link>
          );
        })}

        {visibleNodes.length === 0 ? (
          <div className="absolute inset-x-6 bottom-8 text-center text-[11px] text-[#9b8f89]">Add a note or connection and it will appear in your sphere.</div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee4e0] pt-4">
        <div className="flex items-center gap-2 text-[10px] text-[#948983]"><span className="h-2 w-2 rounded-full bg-[#d98aa0]" />Notes & ideas <span className="h-2 w-2 rounded-full bg-[#a99bc3]" />Life rooms <span className="h-2 w-2 rounded-full bg-[#9db18f]" />Your connections</div>
        {allowConnections ? <button type="button" onClick={() => setAdding(true)} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#c9727e] px-4 text-[11px] font-medium text-white transition hover:bg-[#b15a68]"><Plus size={13} />Add Connection</button> : <Link href="/brain" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#eaded9] bg-white px-4 text-[11px] font-medium text-[#7d716b]">Open full Brain sphere</Link>}
      </div>

      {allowConnections && customLinks.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {customLinks.map((item) => <div key={item.id} className="flex items-center rounded-full border border-[#e2eadc] bg-[#fbfdf9]"><Link href={item.href} className="px-3 py-2 text-[10px] text-[#61705c]">{item.label}</Link><button type="button" onClick={() => removeConnection(item.id)} disabled={deleteLink.isPending} aria-label={`Remove ${item.label}`} className="mr-1 flex h-7 w-7 items-center justify-center rounded-full text-[#9aa594] hover:bg-[#edf3e8] disabled:opacity-50"><Trash2 size={11} /></button></div>)}
        </div>
      ) : null}

      {adding ? (
        <div className="fixed inset-0 z-[160] flex items-end justify-center bg-[#2b2420]/20 backdrop-blur-[3px] sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="sphere-add-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setAdding(false); }}>
          <div className="w-full rounded-t-[28px] border border-[#eee3df] bg-[#fffcfa] p-5 shadow-[0_30px_80px_rgba(55,38,32,.18)] sm:max-w-[520px] sm:rounded-[28px] sm:p-6">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#c9727e]">3D Mind Sphere</p><h3 id="sphere-add-title" className="glow-display mt-1 text-[28px] text-[#2b2420]">Add a room to your orbit</h3><p className="mt-2 text-[12px] leading-5 text-[#8a8078]">This saves the connection to your Glow account and adds it to the rotating sphere.</p></div><button type="button" onClick={() => setAdding(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#eee3df] bg-white text-[#887c75]" aria-label="Close"><X size={15} /></button></div>
            <label htmlFor="sphere-room" className="mt-5 block text-[10px] font-semibold uppercase tracking-[.1em] text-[#8a8078]">Glow OS room</label>
            <select id="sphere-room" value={selectedHref} onChange={(event) => setSelectedHref(event.target.value)} className="mt-2 min-h-12 w-full rounded-[14px] border border-[#e8ddd8] bg-white px-3 text-[13px] text-[#2b2420]">{CUSTOM_DESTINATIONS.map((item) => <option key={`${item.href}-${item.label}`} value={item.href}>{item.label}</option>)}</select>
            <label htmlFor="sphere-label" className="mt-4 block text-[10px] font-semibold uppercase tracking-[.1em] text-[#8a8078]">Label</label>
            <input id="sphere-label" value={customLabel} onChange={(event) => setCustomLabel(event.target.value)} placeholder={selectedDestination.label} maxLength={40} className="mt-2 min-h-12 w-full rounded-[14px] border border-[#e8ddd8] bg-white px-3 text-[13px] text-[#2b2420]" />
            {createLink.error ? <p className="mt-3 text-[11px] text-rose-500">{createLink.error}</p> : null}
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setAdding(false)} className="min-h-11 rounded-full border border-[#e8ddd8] px-4 text-[11px] text-[#80756f]">Cancel</button><button type="button" onClick={addConnection} disabled={createLink.isPending} className="min-h-11 rounded-full bg-[#c9727e] px-5 text-[11px] font-medium text-white disabled:opacity-50">{createLink.isPending ? 'Adding…' : 'Add to sphere'}</button></div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
