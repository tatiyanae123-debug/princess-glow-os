'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { CheckCircle2, FileText, LoaderCircle, Route, UploadCloud, XCircle } from 'lucide-react';

const MAX_FILE_BYTES = 3 * 1024 * 1024;
type IntakeState={status:'idle'|'success'|'error';message:string};
type IntakeClassification={type:string;title:string;confidence:number;destinations:string[]};

export function UniversalIntakeForm(){
  const [state,setState]=useState<IntakeState>({status:'idle',message:''});
  const [classification,setClassification]=useState<IntakeClassification|null>(null);
  const [pending,setPending]=useState(false);
  const [selected,setSelected]=useState<File|null>(null);
  const [clientError,setClientError]=useState('');
  const formRef=useRef<HTMLFormElement>(null);

  function onFileChange(event:React.ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0]??null;
    setClientError('');
    setState({status:'idle',message:''});
    setClassification(null);
    if(file&&file.size>MAX_FILE_BYTES){
      setSelected(null);
      event.target.value='';
      setClientError(`${file.name} is larger than 3 MB. Choose a smaller file for Universal Intake.`);
      return;
    }
    setSelected(file);
  }

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(pending||clientError)return;
    const data=new FormData(event.currentTarget);
    data.set('sourceRoute','/intake');
    const text=String(data.get('text')??'').trim();
    const file=data.get('file');
    if(!text&&(!(file instanceof File)||file.size===0)){
      setState({status:'error',message:'Choose a file or paste something before sending it to Glow.'});
      return;
    }
    setPending(true);
    setState({status:'idle',message:''});
    setClassification(null);
    try{
      const response=await fetch('/api/intake',{method:'POST',body:data,credentials:'same-origin'});
      const payload=await response.json().catch(()=>({ok:false,message:'Glow could not read the upload response.'})) as {ok?:boolean;message?:string;classification?:IntakeClassification};
      if(!response.ok||!payload.ok)throw new Error(payload.message||`Upload failed (${response.status}).`);
      setState({status:'success',message:payload.message||'Added to Glow Inbox.'});
      setClassification(payload.classification??null);
      formRef.current?.reset();
      setSelected(null);
      setClientError('');
    }catch(error){setState({status:'error',message:error instanceof Error?error.message:'Glow could not save that item.'});}
    finally{setPending(false);}
  }

  return <form ref={formRef} onSubmit={submit} encType="multipart/form-data" className="rounded-[26px] border border-rose-200/70 bg-[linear-gradient(135deg,rgba(255,248,245,.96),rgba(249,228,232,.75))] p-6 shadow-sm">
    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-rose-700">+ Add Anything</p>
    <textarea name="text" rows={6} placeholder="Paste anything here… a reminder, schedule, appointment, shopping list, project idea, receipt text, link, or brain dump." className="mt-4 w-full resize-none rounded-2xl border border-white/80 bg-white/70 p-4 text-sm text-stone-800 outline-none focus:border-rose-300"/>
    <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[.15em] text-stone-400"><span className="h-px flex-1 bg-stone-200"/>or upload<span className="h-px flex-1 bg-stone-200"/></div>
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/55 px-5 py-8 text-center transition hover:bg-white/80">
      <UploadCloud className="text-rose-500"/>
      <span className="mt-2 text-sm font-medium text-stone-800">{selected?'Change file':'Choose a file'}</span>
      <span className="mt-1 text-[10px] text-stone-500">Photos, screenshots, PDFs, documents, CSV/spreadsheets, text and JSON · up to 3 MB</span>
      <input name="file" type="file" className="sr-only" onChange={onFileChange} accept="image/*,.pdf,.txt,.csv,.xls,.xlsx,.numbers,.json,.md,.doc,.docx,.rtf,.pages,text/*,application/pdf,application/json,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
    </label>
    {selected?<div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-3"><FileText size={16} className="shrink-0 text-emerald-700"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-stone-800">{selected.name}</p><p className="mt-0.5 text-[9px] text-stone-500">{(selected.size/1024).toFixed(selected.size>1024*1024?0:1)} KB selected and ready to upload</p></div><CheckCircle2 size={16} className="shrink-0 text-emerald-700"/></div>:null}
    <input name="note" placeholder="Optional: tell Glow what this is or why it matters" className="mt-4 w-full rounded-xl border border-white/80 bg-white/70 px-4 py-3 text-xs outline-none focus:border-rose-300"/>
    {clientError?<div role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-800"><XCircle size={14} className="mt-0.5 shrink-0"/>{clientError}</div>:null}
    {state.message?<div role="status" className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${state.status==='success'?'border-emerald-200 bg-emerald-50 text-emerald-800':'border-rose-200 bg-rose-50 text-rose-800'}`}>{state.status==='success'?<CheckCircle2 size={14} className="mt-0.5 shrink-0"/>:<XCircle size={14} className="mt-0.5 shrink-0"/>}{state.message}</div>:null}
    {classification?<div className="mt-3 rounded-2xl border border-stone-200 bg-white/80 p-4"><div className="flex items-start gap-3"><Route size={16} className="mt-0.5 shrink-0 text-rose-600"/><div className="min-w-0 flex-1"><p className="text-[9px] font-bold uppercase tracking-[.14em] text-stone-500">Glow understood this as {classification.type}</p><p className="mt-1 truncate text-sm font-medium text-stone-900">{classification.title}</p><p className="mt-1 text-[9px] text-stone-500">{Math.round(classification.confidence*100)}% confidence · proposed destinations</p><div className="mt-2 flex flex-wrap gap-1">{classification.destinations.map(destination=><span key={destination} className="rounded-full bg-rose-50 px-2 py-1 text-[8px] text-rose-800">{destination}</span>)}</div></div></div><Link href="/inbox" className="mt-3 flex w-full items-center justify-center rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-[10px] font-medium text-stone-800 transition hover:border-rose-300 hover:text-rose-800">Review + approve routing in Glow Inbox →</Link></div>:null}
    <button disabled={pending||Boolean(clientError)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 py-3 text-xs font-medium text-white transition hover:bg-rose-950 disabled:cursor-not-allowed disabled:opacity-50" type="submit">{pending?<><LoaderCircle size={14} className="animate-spin"/>Uploading + understanding…</>:<>Understand + Send to Glow Inbox</>}</button>
    <p className="mt-2 text-center text-[9px] leading-4 text-stone-500">Glow proposes destinations first. Review and approve routing in Inbox before information is written into other systems.</p>
  </form>;
}
