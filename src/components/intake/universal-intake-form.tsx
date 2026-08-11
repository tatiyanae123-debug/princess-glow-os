'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileText, LoaderCircle, UploadCloud, XCircle } from 'lucide-react';
import { initialUniversalIntakeState, universalIntakeFormAction } from '@/app/actions/universal-intake';

const MAX_FILE_BYTES = 3 * 1024 * 1024;

export function UniversalIntakeForm({compact=false,sourceRoute}:{compact?:boolean;sourceRoute?:string}){
  const [state,action,pending]=useActionState(universalIntakeFormAction,initialUniversalIntakeState);
  const [selected,setSelected]=useState<File|null>(null);
  const [clientError,setClientError]=useState('');
  const formRef=useRef<HTMLFormElement>(null);

  useEffect(()=>{
    if(state.status==='success'){
      formRef.current?.reset();
      setSelected(null);
      setClientError('');
    }
  },[state.status,state.message]);

  function onFileChange(event:React.ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0]??null;
    setClientError('');
    if(file&&file.size>MAX_FILE_BYTES){
      setSelected(null);
      event.target.value='';
      setClientError(`${file.name} is larger than 3 MB. Choose a smaller file for Universal Intake.`);
      return;
    }
    setSelected(file);
  }

  return <form ref={formRef} action={action} className={compact?'space-y-3':'rounded-[26px] border border-rose-200/70 bg-[linear-gradient(135deg,rgba(255,248,245,.96),rgba(249,228,232,.75))] p-6 shadow-sm'}>
    {sourceRoute?<input type="hidden" name="sourceRoute" value={sourceRoute}/>:null}
    {!compact?<p className="text-[10px] font-bold uppercase tracking-[.18em] text-rose-700">+ Add Anything</p>:null}
    <textarea name="text" rows={compact?4:6} placeholder="Paste anything here… a reminder, schedule, appointment, shopping list, project idea, receipt, recipe, link, or brain dump." className={`${compact?'':'mt-4 '}w-full resize-none rounded-2xl border border-white/80 bg-white/80 p-4 text-sm text-stone-800 outline-none focus:border-rose-300`}/>
    <div className={`${compact?'my-2':'my-4'} flex items-center gap-3 text-[10px] uppercase tracking-[.15em] text-stone-400`}><span className="h-px flex-1 bg-stone-200"/>or upload<span className="h-px flex-1 bg-stone-200"/></div>
    <label className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white/65 px-5 ${compact?'py-5':'py-8'} text-center transition hover:bg-white/90`}>
      <UploadCloud className="text-rose-500"/>
      <span className="mt-2 text-sm font-medium text-stone-800">{selected?'Change file':'Choose any file'}</span>
      <span className="mt-1 text-[10px] text-stone-500">Photos, screenshots, PDFs, text, CSV, JSON and more · up to 3 MB</span>
      <input name="file" type="file" className="sr-only" onChange={onFileChange} accept="image/*,.pdf,.txt,.csv,.json,.md,audio/*,video/*,application/*"/>
    </label>
    {selected?<div className="mt-3 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-3"><FileText size={16} className="shrink-0 text-emerald-700"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-stone-800">{selected.name}</p><p className="mt-0.5 text-[9px] text-stone-500">{selected.size>=1024*1024?(selected.size/1024/1024).toFixed(1)+' MB':(selected.size/1024).toFixed(0)+' KB'} selected and ready to upload</p></div><CheckCircle2 size={16} className="shrink-0 text-emerald-700"/></div>:null}
    <input name="note" placeholder="Optional: tell Glow what this is or why it matters" className="mt-4 w-full rounded-xl border border-white/80 bg-white/80 px-4 py-3 text-xs outline-none focus:border-rose-300"/>
    {clientError?<div role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-800"><XCircle size={14} className="mt-0.5 shrink-0"/>{clientError}</div>:null}
    {state.message?<div role="status" className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs ${state.status==='success'?'border-emerald-200 bg-emerald-50 text-emerald-800':'border-rose-200 bg-rose-50 text-rose-800'}`}>{state.status==='success'?<CheckCircle2 size={14} className="mt-0.5 shrink-0"/>:<XCircle size={14} className="mt-0.5 shrink-0"/>}{state.message}</div>:null}
    <button disabled={pending||Boolean(clientError)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 py-3 text-xs font-medium text-white transition hover:bg-rose-950 disabled:cursor-not-allowed disabled:opacity-50" type="submit">{pending?<><LoaderCircle size={14} className="animate-spin"/>Uploading + understanding…</>:<>Understand + Send to Glow Inbox</>}</button>
    {!compact?<p className="mt-2 text-center text-[9px] leading-4 text-stone-500">Your selected file stays visible here until Glow confirms the upload.</p>:null}
  </form>;
}
