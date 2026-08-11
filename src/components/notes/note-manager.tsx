'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Pin, NotebookPen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NoteForm } from '@/components/notes/note-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteNoteAction } from '@/app/actions/notes';
import type { Note } from '@/lib/types';

export function NoteManager({ initialNotes }: { initialNotes: Note[] }) {
  const [notes,setNotes]=useState<Note[]>(initialNotes);
  const [dialogNote,setDialogNote]=useState<Note|'new'|null>(null);
  const [deleteTarget,setDeleteTarget]=useState<Note|null>(null);
  const del=useServerAction((id:string)=>deleteNoteAction(id));
  const handleSaved=(note:Note)=>{setNotes((current)=>{const exists=current.some((n)=>n.id===note.id);return exists?current.map((n)=>(n.id===note.id?note:n)):[note,...current];});setDialogNote(null);};
  const handleDelete=()=>{if(!deleteTarget)return;del.run(deleteTarget.id,()=>{setNotes((current)=>current.filter((n)=>n.id!==deleteTarget.id));setDeleteTarget(null);});};
  const pinned=notes.filter((note)=>note.pinned).length;

  return <div className="space-y-4">
    <div className="grid gap-3 md:grid-cols-[1.2fr_.8fr]"><Card className="relative overflow-hidden bg-[linear-gradient(145deg,#f3eadf,#f7f0ea)] p-5"><NotebookPen size={52} strokeWidth={.75} className="absolute right-5 top-3 text-[#8a7764]/15"/><p className="glow-eyebrow">Paper desk</p><p className="glow-display mt-2 text-[24px] text-[#4b4034]">Thoughts can stay loose without getting lost.</p><p className="mt-2 text-[9px] leading-4 text-[#7d7064]">Capture first. Organize later. Pinned notes become the things you want in view.</p></Card><Card className="p-5"><div className="flex justify-between"><div><p className="text-[7px] uppercase tracking-[.12em] text-[#927f74]">Notes</p><p className="glow-display mt-1 text-[25px] text-[#4b4034]">{notes.length}</p></div><div className="text-right"><p className="text-[7px] uppercase tracking-[.12em] text-[#927f74]">Pinned</p><p className="glow-display mt-1 text-[25px] text-[#4b4034]">{pinned}</p></div></div><Button onClick={()=>setDialogNote('new')} className="mt-4 flex items-center gap-1.5"><Plus size={12}/>New note</Button></Card></div>

    {notes.length===0?<Card><p className="py-8 text-center text-[9px] text-[#897a70]">No notes yet. Capture your first idea.</p></Card>:<div className="columns-1 gap-3 md:columns-2 xl:columns-3">{notes.map((note,index)=><div key={note.id} className={`paper-card tape mb-3 break-inside-avoid p-4 ${index%3===1?'rotate-[.4deg]':index%3===2?'rotate-[-.35deg]':''}`}><div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="flex items-center gap-1.5">{note.pinned?<Pin size={10} className="text-[#a36d75]"/>:null}<p className="glow-display text-[15px] text-[#4b4034]">{note.title}</p></div></div><div className="flex shrink-0 gap-1"><button type="button" onClick={()=>setDialogNote(note)} aria-label="Edit note" className="rounded-full p-1.5 text-[#8d7b70] hover:bg-white/50"><Pencil size={10}/></button><button type="button" onClick={()=>setDeleteTarget(note)} aria-label="Delete note" className="rounded-full p-1.5 text-[#8d7b70] hover:bg-white/50"><Trash2 size={10}/></button></div></div>{note.content?<p className="mt-3 whitespace-pre-wrap text-[8px] leading-4 text-[#74665d]">{note.content}</p>:null}{note.pinned?<p className="mt-4 text-[7px] uppercase tracking-[.13em] text-[#a17878]">Pinned inspiration</p>:null}</div>)}</div>}

    <Dialog open={dialogNote!==null} onClose={()=>setDialogNote(null)} title={dialogNote==='new'?'Add note':'Edit note'}><NoteForm note={dialogNote==='new'?null:dialogNote} onSaved={handleSaved} onCancel={()=>setDialogNote(null)}/></Dialog>
    <ConfirmDialog open={deleteTarget!==null} title="Delete this note?" description={deleteTarget?`"${deleteTarget.title}" will be removed.`:undefined} pending={del.isPending} onCancel={()=>setDeleteTarget(null)} onConfirm={handleDelete}/>
  </div>;
}
