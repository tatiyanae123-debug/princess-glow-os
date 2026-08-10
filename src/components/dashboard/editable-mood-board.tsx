'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Image as ImageIcon,
  Link2,
  Music2,
  Pencil,
  Plus,
  Trash2,
  Type,
  Upload,
  Video,
  X,
} from 'lucide-react';

type MoodItemType = 'image' | 'video' | 'text' | 'link' | 'song';

type MoodItem = {
  id: string;
  type: MoodItemType;
  title?: string;
  content: string;
  caption?: string;
  createdAt: number;
};

const STORAGE_KEY = 'glow-os-dashboard-mood-board-v1';
const MAX_LOCAL_FILE_BYTES = 2_500_000;

const starterItems: MoodItem[] = [
  {
    id: 'starter-note',
    type: 'text',
    title: 'Today’s mood',
    content: 'Dream • Plan • Do',
    caption: 'Tap Edit Mood Board to replace this with anything you want.',
    createdAt: 1,
  },
  {
    id: 'starter-pantone',
    type: 'text',
    title: 'PANTONE',
    content: '685 C',
    caption: 'soft blush',
    createdAt: 2,
  },
];

function uid() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function hostLabel(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return 'saved link';
  }
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

async function compressImage(file: File) {
  const raw = await fileToDataUrl(file);
  if (file.size < 900_000) return raw;

  return new Promise<string>((resolve) => {
    const image = new Image();
    image.onload = () => {
      const max = 1400;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) return resolve(raw);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.onerror = () => resolve(raw);
    image.src = raw;
  });
}

function ItemCard({ item, index, editMode, onDelete, onMove }: {
  item: MoodItem;
  index: number;
  editMode: boolean;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}) {
  const rotations = ['-rotate-2', 'rotate-2', 'rotate-[-1deg]', 'rotate-[1deg]', 'rotate-0'];
  const rotation = rotations[index % rotations.length];
  const base = `relative overflow-hidden rounded-[5px] border border-white/60 bg-white/55 shadow-[0_12px_24px_rgba(78,55,48,.10)] ${rotation}`;

  return <div className={`${base} group min-h-[92px]`}>
    {item.type === 'image' ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.content} alt={item.title || 'Mood board image'} className="h-full min-h-[110px] w-full object-cover" />
    ) : item.type === 'video' ? (
      <video src={item.content} controls playsInline className="h-full min-h-[110px] w-full bg-[#2e2623] object-cover" />
    ) : item.type === 'song' ? (
      <a href={item.content} target="_blank" rel="noreferrer" className="flex min-h-[110px] h-full flex-col justify-between bg-[linear-gradient(145deg,#eed8d8,#f7eee9)] p-3 text-[#4f403b]">
        <Music2 size={18} className="text-[#a96f79]" />
        <div><p className="glow-display text-[13px] leading-4">{item.title || 'Song / playlist'}</p><p className="mt-1 text-[7px] uppercase tracking-[.12em] text-[#9a8179]">{hostLabel(item.content)}</p></div>
      </a>
    ) : item.type === 'link' ? (
      <a href={item.content} target="_blank" rel="noreferrer" className="flex min-h-[110px] h-full flex-col justify-between bg-[linear-gradient(145deg,#eee5dc,#faf6f1)] p-3 text-[#4f403b]">
        <Link2 size={16} className="text-[#a07f70]" />
        <div><p className="glow-display line-clamp-2 text-[12px] leading-4">{item.title || 'Saved inspiration'}</p><p className="mt-1 truncate text-[7px] text-[#9a8179]">{hostLabel(item.content)}</p></div>
      </a>
    ) : (
      <div className="flex min-h-[110px] h-full flex-col justify-between bg-[linear-gradient(145deg,#f3dfdc,#fbf5ef)] p-3 text-[#4f403b]">
        <p className="text-[7px] font-semibold uppercase tracking-[.12em] text-[#9c7774]">{item.title || 'Note'}</p>
        <p className="glow-hand text-[24px] leading-6 text-[#654b47]">{item.content}</p>
        {item.caption ? <p className="mt-2 text-[7px] leading-3 text-[#927a73]">{item.caption}</p> : null}
      </div>
    )}

    {item.caption && (item.type === 'image' || item.type === 'video') ? <div className="absolute inset-x-0 bottom-0 bg-black/35 px-2 py-1.5 text-[7px] text-white">{item.caption}</div> : null}

    {editMode ? <div className="absolute right-1.5 top-1.5 flex gap-1 rounded-full bg-white/90 p-1 shadow-sm">
      <button type="button" aria-label="Move item earlier" onClick={() => onMove(item.id, -1)} className="rounded-full p-1 text-[#765e58] hover:bg-[#f5e7e3]"><ArrowUp size={9} /></button>
      <button type="button" aria-label="Move item later" onClick={() => onMove(item.id, 1)} className="rounded-full p-1 text-[#765e58] hover:bg-[#f5e7e3]"><ArrowDown size={9} /></button>
      <button type="button" aria-label="Delete item" onClick={() => onDelete(item.id)} className="rounded-full p-1 text-[#a25d67] hover:bg-[#f5e7e3]"><Trash2 size={9} /></button>
    </div> : null}
  </div>;
}

export function EditableMoodBoard() {
  const [items, setItems] = useState<MoodItem[]>(starterItems);
  const [hydrated, setHydrated] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [type, setType] = useState<MoodItemType>('image');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [caption, setCaption] = useState('');
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as MoodItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // A corrupted local mood board should never break the dashboard.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      setMessage('This browser is out of local storage. Remove a large photo/video or use a link instead.');
    }
  }, [hydrated, items]);

  const visibleItems = useMemo(() => items.slice(0, 8), [items]);

  function resetComposer() {
    setTitle('');
    setContent('');
    setCaption('');
    setMessage('');
    setComposerOpen(false);
  }

  function addItem(next: Omit<MoodItem, 'id' | 'createdAt'>) {
    setItems((current) => [...current, { ...next, id: uid(), createdAt: Date.now() }].slice(-18));
    resetComposer();
  }

  async function handleFile(file?: File) {
    if (!file) return;
    setMessage('');

    if (file.type.startsWith('image/')) {
      try {
        const source = await compressImage(file);
        addItem({ type: 'image', content: source, title: title || file.name, caption });
      } catch {
        setMessage('That image could not be added.');
      }
      return;
    }

    if (file.type.startsWith('video/')) {
      if (file.size > MAX_LOCAL_FILE_BYTES) {
        setMessage('For videos larger than 2.5 MB, paste a YouTube, Vimeo, TikTok, Instagram, or other video link instead.');
        return;
      }
      try {
        const source = await fileToDataUrl(file);
        addItem({ type: 'video', content: source, title: title || file.name, caption });
      } catch {
        setMessage('That video could not be added.');
      }
    }
  }

  function submit() {
    const value = content.trim();
    if (type === 'text') {
      if (!value) return setMessage('Write the text you want on the board.');
      return addItem({ type, content: value, title: title.trim(), caption: caption.trim() });
    }
    if ((type === 'link' || type === 'song' || type === 'video' || type === 'image') && value) {
      if (!isValidUrl(value)) return setMessage('Paste a complete web link beginning with http:// or https://.');
      return addItem({ type, content: value, title: title.trim(), caption: caption.trim() });
    }
    if (type === 'image' || type === 'video') {
      fileRef.current?.click();
      return;
    }
    setMessage('Add a link or choose a file.');
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  function moveItem(id: string, direction: -1 | 1) {
    setItems((current) => {
      const index = current.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return <div className="relative min-h-[300px] rounded-[6px] bg-[radial-gradient(circle_at_25%_25%,rgba(231,181,188,.32),transparent_25%),radial-gradient(circle_at_80%_20%,rgba(209,188,157,.24),transparent_22%)] p-2">
    <div className="absolute right-1 top-1 z-30 flex gap-1.5">
      <button type="button" onClick={() => setEditMode((value) => !value)} className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/80 px-2.5 py-1.5 text-[7px] font-medium uppercase tracking-[.08em] text-[#765f58] shadow-sm backdrop-blur-sm"><Pencil size={9} />{editMode ? 'Done' : 'Edit Mood Board'}</button>
      {editMode ? <button type="button" onClick={() => setComposerOpen(true)} className="inline-flex items-center gap-1 rounded-full bg-[#d5969f] px-2.5 py-1.5 text-[7px] font-medium uppercase tracking-[.08em] text-white shadow-sm"><Plus size={9} />Add</button> : null}
    </div>

    {visibleItems.length ? <div className="grid min-h-[290px] grid-cols-2 gap-2 pt-8 sm:grid-cols-3">
      {visibleItems.map((item, index) => <ItemCard key={item.id} item={item} index={index} editMode={editMode} onDelete={removeItem} onMove={moveItem} />)}
    </div> : <button type="button" onClick={() => { setEditMode(true); setComposerOpen(true); }} className="flex min-h-[290px] w-full flex-col items-center justify-center rounded-[6px] border border-dashed border-[#d8c0b9] bg-white/25 text-[#866d66]"><Plus size={20}/><span className="glow-display mt-2 text-[14px]">Build your mood board</span><span className="mt-1 text-[7px] uppercase tracking-[.12em]">photos · videos · songs · text · links</span></button>}

    {items.length > 8 ? <p className="mt-2 text-right text-[7px] text-[#907a73]">Showing 8 of {items.length} items. Reorder in Edit mode to choose what appears here.</p> : null}

    {composerOpen ? <div className="absolute inset-0 z-40 overflow-y-auto rounded-[6px] bg-[#fbf5f0]/95 p-4 backdrop-blur-md">
      <div className="mx-auto max-w-[480px]">
        <div className="flex items-start justify-between gap-3"><div><p className="glow-display text-[20px] text-[#463733]">Add to Mood Board</p><p className="mt-1 text-[8px] text-[#8e7770]">Anything that sets the mood can live here.</p></div><button type="button" onClick={resetComposer} className="rounded-full border border-[#e0d2ca] bg-white p-1.5 text-[#7d6861]"><X size={12}/></button></div>

        <div className="mt-4 grid grid-cols-5 gap-1.5">{([
          ['image','Photo',ImageIcon],
          ['video','Video',Video],
          ['song','Song',Music2],
          ['text','Text',Type],
          ['link','Link',Link2],
        ] as const).map(([value,label,Icon]) => <button type="button" key={value} onClick={() => { setType(value); setMessage(''); }} className={`flex flex-col items-center gap-1 rounded-[6px] border px-2 py-2 text-[7px] ${type===value?'border-[#c98992] bg-[#f3dfe1] text-[#8f5c64]':'border-[#e2d6ce] bg-white/70 text-[#7d6b65]'}`}><Icon size={13}/>{label}</button>)}</div>

        <div className="mt-4 space-y-2">
          <input value={title} onChange={(event)=>setTitle(event.target.value)} placeholder={type==='song'?'Song / playlist title (optional)':'Title (optional)'} className="w-full rounded-[6px] border border-[#dfd1c9] bg-white/70 px-3 py-2 text-[9px] text-[#544540] outline-none focus:border-[#c98b94]" />
          {type === 'text' ? <textarea value={content} onChange={(event)=>setContent(event.target.value)} rows={4} placeholder="Write anything: a quote, intention, lyric fragment, reminder, idea…" className="w-full rounded-[6px] border border-[#dfd1c9] bg-white/70 px-3 py-2 text-[9px] text-[#544540] outline-none focus:border-[#c98b94]" /> : <input value={content} onChange={(event)=>setContent(event.target.value)} placeholder={type==='song'?'Spotify / Apple Music / YouTube link':type==='video'?'Video URL, or leave blank to upload a small clip':type==='image'?'Image URL, or leave blank to upload a photo':'Website / inspiration link'} className="w-full rounded-[6px] border border-[#dfd1c9] bg-white/70 px-3 py-2 text-[9px] text-[#544540] outline-none focus:border-[#c98b94]" />}
          <input value={caption} onChange={(event)=>setCaption(event.target.value)} placeholder="Caption / why you saved it (optional)" className="w-full rounded-[6px] border border-[#dfd1c9] bg-white/70 px-3 py-2 text-[9px] text-[#544540] outline-none focus:border-[#c98b94]" />
        </div>

        {(type==='image'||type==='video') ? <button type="button" onClick={()=>fileRef.current?.click()} className="mt-3 flex w-full items-center justify-center gap-2 rounded-[6px] border border-dashed border-[#cfb8b2] bg-white/55 px-3 py-3 text-[8px] text-[#795f59]"><Upload size={12}/>Choose {type==='image'?'photo':'video'} from this device</button> : null}
        <input ref={fileRef} type="file" accept={type==='image'?'image/*':'video/*'} className="hidden" onChange={(event)=>{void handleFile(event.target.files?.[0]); event.currentTarget.value='';}} />

        {message ? <p className="mt-3 rounded-[5px] bg-[#f7e5e4] px-3 py-2 text-[8px] text-[#9b5e66]">{message}</p> : null}

        <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={resetComposer} className="rounded-[6px] border border-[#dfd1c9] bg-white px-3 py-2 text-[8px] text-[#705d57]">Cancel</button><button type="button" onClick={submit} className="rounded-[6px] bg-[#c98791] px-4 py-2 text-[8px] font-medium text-white">Add to Board</button></div>
      </div>
    </div> : null}
  </div>;
}
