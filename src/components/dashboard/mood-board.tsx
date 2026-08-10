'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Link2, Music2, Pencil, Plus, Trash2, Type, Upload, Video } from 'lucide-react';

type MoodKind = 'image' | 'video' | 'audio' | 'text' | 'link';
type MoodItem = { id: string; kind: MoodKind; title: string; text?: string; url?: string; blob?: Blob; createdAt: number };

const DB_NAME = 'glow-os-mood-board';
const STORE = 'pins';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readPins(): Promise<MoodItem[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as MoodItem[]).sort((a,b)=>b.createdAt-a.createdAt));
    req.onerror = () => reject(req.error);
  });
}

async function savePin(item: MoodItem) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function removePin(id: string) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function Pin({ item, editing, onDelete }: { item: MoodItem; editing: boolean; onDelete: (id:string)=>void }) {
  const objectUrl = useMemo(() => item.blob ? URL.createObjectURL(item.blob) : null, [item.blob]);
  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, [objectUrl]);

  return <article className="group relative mb-2 break-inside-avoid overflow-hidden rounded-[8px] border border-white/70 bg-white/55 shadow-[0_8px_20px_rgba(85,55,51,.08)]">
    {item.kind === 'image' && objectUrl ? <img src={objectUrl} alt={item.title || 'Mood board pin'} className="h-auto w-full object-cover" /> : null}
    {item.kind === 'video' && objectUrl ? <video src={objectUrl} controls playsInline className="h-auto w-full bg-black/5" /> : null}
    {item.kind === 'audio' && objectUrl ? <div className="p-3"><div className="mb-2 flex items-center gap-2 text-[#9b6b72]"><Music2 size={14}/><span className="text-[9px] font-medium">{item.title}</span></div><audio src={objectUrl} controls className="w-full" /></div> : null}
    {item.kind === 'text' ? <div className="paper-card p-4"><p className="glow-hand text-[24px] leading-7 text-[#6e4d49]">{item.title || 'Note'}</p><p className="mt-2 whitespace-pre-wrap text-[9px] leading-4 text-[#66544e]">{item.text}</p></div> : null}
    {item.kind === 'link' && item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="block p-4 hover:bg-[#fbf3ef]"><div className="flex items-center gap-2 text-[#9d6e73]"><Link2 size={13}/><span className="text-[8px] uppercase tracking-[.12em]">Saved link</span></div><p className="glow-display mt-2 text-[14px] text-[#433632]">{item.title || item.url}</p><p className="mt-1 line-clamp-2 text-[8px] text-[#8d7972]">{item.url}</p></a> : null}
    {editing ? <button type="button" onClick={()=>onDelete(item.id)} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-[#a45f69] shadow" aria-label="Delete pin"><Trash2 size={11}/></button> : null}
  </article>;
}

export function MoodBoard() {
  const [items,setItems]=useState<MoodItem[]>([]);
  const [editing,setEditing]=useState(false);
  const [adding,setAdding]=useState(false);
  const [text,setText]=useState('');
  const [title,setTitle]=useState('');
  const [link,setLink]=useState('');
  const fileRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{ readPins().then(setItems).catch(()=>{}); },[]);

  const addItem = async (item: MoodItem) => { await savePin(item); setItems((current)=>[item,...current]); setAdding(false); setText(''); setTitle(''); setLink(''); };
  const addText = () => text.trim() && addItem({id:crypto.randomUUID(),kind:'text',title:title.trim()||'A little note',text:text.trim(),createdAt:Date.now()});
  const addLink = () => link.trim() && addItem({id:crypto.randomUUID(),kind:'link',title:title.trim()||'Inspiration',url:link.trim(),createdAt:Date.now()});
  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const kind: MoodKind = file.type.startsWith('image/')?'image':file.type.startsWith('video/')?'video':file.type.startsWith('audio/')?'audio':'link';
      if (kind === 'link') continue;
      const item:MoodItem={id:crypto.randomUUID(),kind,title:file.name.replace(/\.[^.]+$/,''),blob:file,createdAt:Date.now()};
      await savePin(item); setItems((current)=>[item,...current]);
    }
    setAdding(false);
  };
  const del = async (id:string) => { await removePin(id); setItems((current)=>current.filter((item)=>item.id!==id)); };

  return <div className="relative h-full min-h-[300px] overflow-hidden rounded-[8px] border border-[#eadfd6] bg-[linear-gradient(145deg,#f7ece7,#f3dfdc)] p-3">
    <div className="mb-2 flex items-center justify-between">
      <div><p className="text-[7px] font-semibold uppercase tracking-[.16em] text-[#9a7772]">My Mood Board</p><p className="glow-hand text-[21px] leading-none text-[#6e4d49]">pin what feels like you</p></div>
      <div className="flex gap-1.5"><button type="button" onClick={()=>setEditing((v)=>!v)} className="rounded-full border border-white/80 bg-white/60 p-2 text-[#8c706a]" aria-label="Edit board"><Pencil size={11}/></button><button type="button" onClick={()=>setAdding(true)} className="flex items-center gap-1 rounded-full bg-[#d59aa2] px-2.5 py-2 text-[8px] text-white"><Plus size={10}/>Pin</button></div>
    </div>

    {items.length ? <div className="max-h-[255px] overflow-y-auto pr-1 [column-count:2] [column-gap:.5rem] xl:[column-count:3]">{items.map((item)=><Pin key={item.id} item={item} editing={editing} onDelete={del}/>)}</div> : <button type="button" onClick={()=>setAdding(true)} className="flex h-[240px] w-full flex-col items-center justify-center rounded-[7px] border border-dashed border-[#d8bfc0] bg-white/25 text-[#9a7772]"><ImagePlus size={28} strokeWidth={1}/><p className="glow-display mt-3 text-[15px]">Create your first board</p><p className="mt-1 text-[8px]">Photos · videos · songs · notes · links</p></button>}

    {adding ? <div className="absolute inset-2 z-20 overflow-y-auto rounded-[10px] border border-[#e3d2ca] bg-[#fffaf6]/95 p-4 shadow-xl backdrop-blur">
      <div className="flex items-center justify-between"><div><p className="glow-display text-[18px] text-[#443733]">Add to mood board</p><p className="mt-1 text-[8px] text-[#8e7770]">Like Pinterest, but private inside Glow OS.</p></div><button type="button" onClick={()=>setAdding(false)} className="text-[9px] text-[#8e7770]">Close</button></div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <button type="button" onClick={()=>fileRef.current?.click()} className="rounded-[8px] border border-[#eadfd6] bg-white p-3 text-center"><Upload size={15} className="mx-auto text-[#a96e76]"/><span className="mt-1 block text-[8px]">Upload</span></button>
        <button type="button" onClick={()=>fileRef.current?.click()} className="rounded-[8px] border border-[#eadfd6] bg-white p-3 text-center"><Video size={15} className="mx-auto text-[#a96e76]"/><span className="mt-1 block text-[8px]">Video / Song</span></button>
        <button type="button" onClick={()=>document.getElementById('mood-text')?.focus()} className="rounded-[8px] border border-[#eadfd6] bg-white p-3 text-center"><Type size={15} className="mx-auto text-[#a96e76]"/><span className="mt-1 block text-[8px]">Text</span></button>
      </div>
      <input ref={fileRef} hidden multiple type="file" accept="image/*,video/*,audio/*" onChange={(e)=>addFiles(e.target.files)}/>
      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title (optional)" className="mt-3 w-full rounded-[7px] border border-[#e4d7cf] bg-white/70 px-3 py-2 text-[9px] outline-none"/>
      <textarea id="mood-text" value={text} onChange={(e)=>setText(e.target.value)} rows={3} placeholder="Write a quote, thought, affirmation, goal, lyric note…" className="mt-2 w-full rounded-[7px] border border-[#e4d7cf] bg-white/70 px-3 py-2 text-[9px] outline-none"/>
      <button type="button" onClick={addText} disabled={!text.trim()} className="mt-1 rounded-[6px] bg-[#6a514b] px-3 py-2 text-[8px] text-white disabled:opacity-40">Add text pin</button>
      <div className="mt-3 flex gap-2"><input value={link} onChange={(e)=>setLink(e.target.value)} placeholder="Paste a Pinterest, Spotify, YouTube or website link" className="min-w-0 flex-1 rounded-[7px] border border-[#e4d7cf] bg-white/70 px-3 py-2 text-[9px] outline-none"/><button type="button" onClick={addLink} disabled={!link.trim()} className="rounded-[6px] bg-[#d49aa1] px-3 py-2 text-[8px] text-white disabled:opacity-40"><Link2 size={10}/></button></div>
      <p className="mt-3 text-[7px] leading-3 text-[#9a837b]">Uploads are stored privately in this browser on this device using IndexedDB. They are not uploaded to Glow OS servers yet.</p>
    </div> : null}
  </div>;
}
