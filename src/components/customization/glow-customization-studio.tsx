'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Check, ImagePlus, Palette, RotateCcw, SlidersHorizontal, X } from 'lucide-react';

const KEY = 'glow:customization:v3';
const DB_NAME = 'glow-customization-images';
const STORE = 'images';

type FontChoice = 'serif' | 'system' | 'soft';
type Prefs = {
  accent: string;
  surface: string;
  background: string;
  text: string;
  radius: number;
  density: number;
  fontScale: number;
  shadow: number;
  font: FontChoice;
};
type ColorKey = 'accent' | 'surface' | 'background' | 'text';

const DEFAULTS: Prefs = {
  accent: '#c7657a',
  surface: '#ffffff',
  background: '#fffdfb',
  text: '#2a2522',
  radius: 12,
  density: 1,
  fontScale: 1,
  shadow: 1,
  font: 'soft',
};

const COLORS: Array<{ label: string; key: ColorKey }> = [
  { label: 'Accent', key: 'accent' },
  { label: 'Surface', key: 'surface' },
  { label: 'Background', key: 'background' },
  { label: 'Text', key: 'text' },
];

function fontStacks(font: FontChoice) {
  if (font === 'serif') return { body: "Georgia, Cambria, 'Times New Roman', serif", display: "Georgia, Cambria, 'Times New Roman', serif" };
  if (font === 'system') return { body: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", display: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
  return { body: "'Inter', 'Avenir Next', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", display: "'Playfair Display', Georgia, serif" };
}

function apply(p: Prefs) {
  const root = document.documentElement;
  const r = root.style;
  const fonts = fontStacks(p.font);

  r.setProperty('--glow-user-accent', p.accent);
  r.setProperty('--glow-user-surface', p.surface);
  r.setProperty('--glow-user-bg', p.background);
  r.setProperty('--glow-user-text', p.text);
  r.setProperty('--glow-user-radius', `${p.radius}px`);
  r.setProperty('--glow-user-density', String(p.density));
  r.setProperty('--glow-user-font-scale', String(p.fontScale));
  r.setProperty('--glow-user-shadow', String(p.shadow));
  r.setProperty('--glow-user-font', fonts.body);

  r.setProperty('--glow-accent', p.accent);
  r.setProperty('--room-accent', p.accent);
  r.setProperty('--glow-surface', p.surface);
  r.setProperty('--glow-bg', p.background);
  r.setProperty('--glow-text', p.text);
  r.setProperty('--glow-radius', `${p.radius}px`);
  r.setProperty('--glow-font-body', fonts.body);
  r.setProperty('--glow-font-display', fonts.display);
  r.setProperty('--b6-plum', p.accent);

  r.fontSize = `${16 * p.fontScale}px`;
  root.dataset.glowCustomized = 'true';
}

function request<T>(req: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function openImageDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getStoredImage(key: string) {
  const db = await openImageDb();
  try {
    return await request(db.transaction(STORE, 'readonly').objectStore(STORE).get(key)) as Blob | undefined;
  } finally {
    db.close();
  }
}

async function putStoredImage(key: string, blob: Blob) {
  const db = await openImageDb();
  try {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, key);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

async function clearRoomImages(pathname: string) {
  const db = await openImageDb();
  try {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const keys = await request(store.getAllKeys());
    keys.filter((key) => String(key).startsWith(`${pathname}::`)).forEach((key) => store.delete(key));
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

function stableImageKey(img: HTMLImageElement, index: number, pathname: string) {
  const existing = img.dataset.glowCustomKey;
  if (existing?.startsWith(`${pathname}::`)) return existing;
  const explicit = img.dataset.glowImageKey?.trim();
  const alt = img.alt?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  const id = explicit || alt || `image-${index}`;
  const key = `${pathname}::${id}::${index}`;
  img.dataset.glowCustomKey = key;
  return key;
}

function validHex(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value);
}

function imageAtPoint(event: MouseEvent) {
  const target = event.target as HTMLElement | null;
  const direct = target?.closest('img') as HTMLImageElement | null;
  if (direct) return direct;

  const editableHost = target?.closest('[data-glow-editable-image]');
  const hosted = editableHost?.querySelector('img') as HTMLImageElement | null;
  if (hosted) return hosted;

  const stacked = document.elementsFromPoint(event.clientX, event.clientY);
  return (stacked.find((element) => element instanceof HTMLImageElement) as HTMLImageElement | undefined) ?? null;
}

export function GlowCustomizationStudio() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [status, setStatus] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const target = useRef<HTMLImageElement | null>(null);
  const urls = useRef(new Map<string, string>());
  const hydration = useRef(new Set<string>());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const next = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
      setPrefs(next);
      apply(next);
    } catch {
      apply(DEFAULTS);
    }
  }, []);

  useEffect(() => {
    apply(prefs);
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* local privacy/quota */ }
  }, [prefs]);

  useEffect(() => {
    let stopped = false;
    const activeUrls = urls.current;
    const activeHydration = hydration.current;

    const hydrate = async (img: HTMLImageElement, index: number) => {
      const key = stableImageKey(img, index, pathname);
      const known = activeUrls.get(key);
      if (known) {
        if (img.src !== known) img.src = known;
        img.dataset.glowUserReplaced = 'true';
        return;
      }
      if (activeHydration.has(key)) return;
      activeHydration.add(key);
      try {
        const blob = await getStoredImage(key);
        if (!blob || stopped) return;
        const url = URL.createObjectURL(blob);
        activeUrls.set(key, url);
        img.src = url;
        img.dataset.glowUserReplaced = 'true';
      } catch {
        // IndexedDB can be unavailable in strict/private browser contexts.
      } finally {
        activeHydration.delete(key);
      }
    };

    const scan = () => Array.from(document.images).forEach((img, index) => { void hydrate(img, index); });
    scan();
    const observer = new MutationObserver(scan);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });

    return () => {
      stopped = true;
      observer.disconnect();
      activeUrls.forEach((url) => URL.revokeObjectURL(url));
      activeUrls.clear();
      activeHydration.clear();
    };
  }, [pathname]);

  useEffect(() => {
    if (!imageMode) return;
    const handler = (event: MouseEvent) => {
      const img = imageAtPoint(event);
      if (!img) return;
      event.preventDefault();
      event.stopPropagation();
      target.current = img;
      input.current?.click();
    };
    document.addEventListener('click', handler, true);
    document.documentElement.dataset.glowImageEdit = 'true';
    return () => {
      document.removeEventListener('click', handler, true);
      delete document.documentElement.dataset.glowImageEdit;
    };
  }, [imageMode]);

  const style = useMemo(() => ({ accentColor: prefs.accent }), [prefs.accent]);

  async function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const img = target.current;
    event.target.value = '';
    if (!file || !img || !file.type.startsWith('image/')) return;

    const index = Array.from(document.images).indexOf(img);
    const key = stableImageKey(img, Math.max(0, index), pathname);
    try {
      await putStoredImage(key, file);
      const previous = urls.current.get(key);
      if (previous) URL.revokeObjectURL(previous);
      const url = URL.createObjectURL(file);
      urls.current.set(key, url);
      img.src = url;
      img.dataset.glowUserReplaced = 'true';
      setStatus('Image replaced and saved');
      setImageMode(false);
      window.setTimeout(() => setStatus(''), 2400);
    } catch {
      setStatus('Could not save that image. Try a smaller file.');
      window.setTimeout(() => setStatus(''), 3200);
    }
  }

  function setColor(key: ColorKey, value: string) {
    if (!validHex(value)) return;
    setPrefs((current) => ({ ...current, [key]: value }));
  }

  async function reset() {
    setPrefs(DEFAULTS);
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    try { await clearRoomImages(pathname); } catch { /* ignore */ }
    urls.current.forEach((url) => URL.revokeObjectURL(url));
    urls.current.clear();
    setStatus('Styles reset. Room images restored.');
    window.setTimeout(() => window.location.reload(), 500);
  }

  return <>
    <button type="button" className="glow-customize-fab" onClick={() => setOpen(true)} aria-label="Customize Glow OS"><Palette size={16} /></button>

    {imageMode ? <div className="glow-image-edit-bar"><ImagePlus size={14} /><span>Tap any image to replace it</span><button type="button" onClick={() => setImageMode(false)}><X size={14} />Cancel</button></div> : null}
    {status ? <div className="glow-customize-toast"><Check size={13} />{status}</div> : null}

    {open ? <div className="glow-customize-panel" style={style}>
      <div className="glow-customize-head"><div><strong>Customize Glow OS</strong><span>Every control below updates the live room.</span></div><button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={15} /></button></div>

      <div className="glow-customize-grid">{COLORS.map(({ label, key }) => <label key={key}>
        <span>{label}</span>
        <input
          type="color"
          value={prefs[key]}
          aria-label={`${label} color`}
          onInput={(event) => setColor(key, event.currentTarget.value)}
          onChange={(event) => setColor(key, event.currentTarget.value)}
        />
        <small>{prefs[key].toUpperCase()}</small>
      </label>)}</div>

      <label className="glow-customize-range"><span>Corner radius</span><input type="range" min="4" max="28" value={prefs.radius} onInput={(e) => setPrefs({ ...prefs, radius: +e.currentTarget.value })} onChange={(e) => setPrefs({ ...prefs, radius: +e.currentTarget.value })} /><b>{prefs.radius}px</b></label>
      <label className="glow-customize-range"><span>Density</span><input type="range" min="0.82" max="1.18" step="0.02" value={prefs.density} onInput={(e) => setPrefs({ ...prefs, density: +e.currentTarget.value })} onChange={(e) => setPrefs({ ...prefs, density: +e.currentTarget.value })} /><b>{prefs.density.toFixed(2)}</b></label>
      <label className="glow-customize-range"><span>Type scale</span><input type="range" min="0.9" max="1.15" step="0.01" value={prefs.fontScale} onInput={(e) => setPrefs({ ...prefs, fontScale: +e.currentTarget.value })} onChange={(e) => setPrefs({ ...prefs, fontScale: +e.currentTarget.value })} /><b>{Math.round(prefs.fontScale * 100)}%</b></label>
      <label className="glow-customize-range"><span>Depth</span><input type="range" min="0" max="1.8" step="0.1" value={prefs.shadow} onInput={(e) => setPrefs({ ...prefs, shadow: +e.currentTarget.value })} onChange={(e) => setPrefs({ ...prefs, shadow: +e.currentTarget.value })} /><b>{prefs.shadow.toFixed(1)}</b></label>

      <div className="glow-customize-font"><span>Typography</span>{(['soft', 'serif', 'system'] as const).map((font) => <button type="button" key={font} className={prefs.font === font ? 'active' : ''} onClick={() => setPrefs({ ...prefs, font })}>{font}</button>)}</div>

      <button type="button" className="glow-customize-image" onClick={() => { setOpen(false); setImageMode(true); }}><ImagePlus size={14} />Replace any image</button>
      <button type="button" className="glow-customize-reset" onClick={() => { void reset(); }}><RotateCcw size={13} />Reset styles + this room&apos;s images</button>
      <div className="glow-customize-note"><SlidersHorizontal size={12} />Changes save on this device automatically.</div>
    </div> : null}

    <input ref={input} type="file" accept="image/*" className="sr-only" aria-label="Choose replacement image" onChange={(event) => { void choose(event); }} />
  </>;
}