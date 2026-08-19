'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { NoteForm } from '@/components/notes/note-form';
import type { Note } from '@/lib/types';
import { Plus } from 'lucide-react';

function excerpt(note:Note){const text=(note.content??'').trim();return text?text.slice(0,110)+(text.length>110?'…':''):'No note text yet.'}

export function Batch2Journal({initialNotes}:{initialNotes:Note[]}){
 const router=useRouter();const params=useSearchParams();const requested=params.get('noteId')??params.get('selected');
 const [notes,setNotes]=useState(initialNotes);const [dialog,setDialog]=useState<Note|'new'|null>(null);
 const selected=useMemo(()=>requested?notes.find(n=>n.id===requested)??null:null,[notes,requested]);
 const pinned=[...notes].filter(n=>n.pinned).sort((a,b)=>b.updatedAt.getTime()-a.updatedAt.getTime()).slice(0,3);
 const cards=pinned.length?pinned:[...notes].sort((a,b)=>b.updatedAt.getTime()-a.updatedAt.getTime()).slice(0,3);
 const recent=[...notes].sort((a,b)=>b.updatedAt.getTime()-a.updatedAt.getTime()).slice(0,5);
 function closeRoute(){router.replace('/notes',{scroll:false})}
 function saved(note:Note){setNotes(cur=>cur.some(n=>n.id===note.id)?cur.map(n=>n.id===note.id?note:n):[note,...cur]);setDialog(null);closeRoute();router.refresh()}
 const openNote=dialog==='new'?null:dialog??selected;
 return <div className="batch2-page space-y-4">
  <header className="flex items-start justify-between gap-4"><div><p className="batch2-kicker">7. Notes / Journal</p><h1 className="batch2-title mt-3">Journal</h1><p className="batch2-subtitle">Your private space to think, reflect and write.</p></div><button onClick={()=>setDialog('new')} className="batch2-btn batch2-btn-primary"><Plus size={10}/>New Note</button></header>
  <nav className="batch2-tabs"><span className="active">All</span><span>Journal</span><span>Notes</span><span>Ideas</span><span>Plans</span><span>Quotes</span></nav>
  <section><h2 className="mb-3 font-serif text-[15px]">Pinned</h2><div className="batch2-journal-pinned">{cards.length?cards.map(n=><button key={n.id} onClick={()=>setDialog(n)} className="batch2-card batch2-note-tile text-left"><p className="text-[8px] font-medium">{n.title}</p><p className="batch2-mini mt-2">{n.updatedAt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</p><p className="batch2-body mt-4 line-clamp-5">{excerpt(n)}</p></button>):Array.from({length:3}).map((_,i)=><div key={i} className="batch2-card batch2-note-tile"><p className="text-[8px] font-medium">Your note</p><p className="batch2-mini mt-2">No saved note yet</p></div>)}</div></section>
  <section><h2 className="mb-3 font-serif text-[15px]">Recent Notes</h2><div className="batch2-card overflow-hidden">{recent.length?recent.map((n,i)=><button key={n.id} onClick={()=>setDialog(n)} className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left ${i?'border-t border-[#eee6e2]':''}`}><span className="text-[8.5px]">▣ &nbsp; {n.title}</span><span className="batch2-mini">{n.updatedAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></button>):<div className="p-8 text-center text-[9px] text-[#968b84]">No notes yet.</div>}</div></section>
  <button onClick={()=>setDialog('new')} className="batch2-btn flex w-full">View all notes</button>
  <Dialog open={Boolean(dialog||selected)} onClose={()=>{setDialog(null);if(selected)closeRoute()}} title={openNote?`Note · ${openNote.title}`:'New Note'}><NoteForm note={openNote} onSaved={saved} onCancel={()=>{setDialog(null);if(selected)closeRoute()}}/></Dialog>
  {requested&&!selected?<div className="fixed bottom-5 left-1/2 z-[170] -translate-x-1/2 rounded-full border border-[#f0d9dd] bg-white px-4 py-2 text-[9px] text-[#8d6069] shadow-lg">That note is no longer available.</div>:null}
 </div>
}
