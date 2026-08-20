'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { ExternalLink, KeyRound, Link2, LockKeyhole, Plus, ShieldCheck, Trash2 } from 'lucide-react';

type VaultLink={id:string;label:string;url:string;category:string};
const STORAGE_KEY='glow-vault-links-v1';
const SAFE_DEFAULTS:VaultLink[]=[
  {id:'bilh',label:'BILH MyChart',url:'https://mychart.bilh.org/MyChart-BILH/',category:'Health'},
  {id:'spotify',label:'Spotify',url:'https://open.spotify.com/',category:'Music'},
];

function normalizeUrl(value:string){let safe=value.trim();if(!/^https?:\/\//i.test(safe))safe=`https://${safe}`;return safe;}
function readPrivateImport():VaultLink|null{
  if(typeof window==='undefined'||!window.location.hash.startsWith('#vault-add='))return null;
  try{
    const encoded=window.location.hash.slice('#vault-add='.length);
    const payload=JSON.parse(decodeURIComponent(encoded)) as Partial<VaultLink>;
    if(!payload.label||!payload.url)return null;
    return {id:crypto.randomUUID(),label:String(payload.label).trim(),url:normalizeUrl(String(payload.url)),category:String(payload.category||'Personal').trim()||'Personal'};
  }catch{return null;}
}

export default function VaultPage(){
  const[links,setLinks]=useState<VaultLink[]>(SAFE_DEFAULTS);const[label,setLabel]=useState('');const[url,setUrl]=useState('');const[category,setCategory]=useState('Personal');const[imported,setImported]=useState(false);
  useEffect(()=>{
    try{
      const raw=localStorage.getItem(STORAGE_KEY);const existing=raw?JSON.parse(raw) as VaultLink[]:[];
      const privateImport=readPrivateImport();
      let merged=[...SAFE_DEFAULTS,...existing.filter(x=>!SAFE_DEFAULTS.some(d=>d.id===x.id))];
      if(privateImport&&!merged.some(x=>x.url===privateImport.url)){
        merged=[...merged,privateImport];
        localStorage.setItem(STORAGE_KEY,JSON.stringify(merged.filter(x=>!SAFE_DEFAULTS.some(d=>d.id===x.id))));
        setImported(true);
      }
      setLinks(merged);
      if(window.location.hash.startsWith('#vault-add='))history.replaceState(null,'',window.location.pathname+window.location.search);
    }catch{}
  },[]);
  useEffect(()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(links.filter(x=>!SAFE_DEFAULTS.some(d=>d.id===x.id))))}catch{}},[links]);
  const grouped=useMemo(()=>Object.entries(links.reduce<Record<string,VaultLink[]>>((a,x)=>{(a[x.category]??=[]).push(x);return a;},{})),[links]);
  function add(){if(!label.trim()||!url.trim())return;const safe=normalizeUrl(url);setLinks(v=>v.some(x=>x.url===safe)?v:[...v,{id:crypto.randomUUID(),label:label.trim(),url:safe,category:category.trim()||'Personal'}]);setLabel('');setUrl('');}
  return <AppShell><div className="mx-auto max-w-[1180px] space-y-5 pb-24">
    {imported?<div role="status" className="rounded-[16px] border border-[#dfe8df] bg-[#f4f8f3] px-4 py-3 text-[11px] text-[#4e664d]">Private link added to this device&apos;s Glow Vault.</div>:null}
    <header className="rounded-[28px] border border-[#f0dedf] bg-[linear-gradient(135deg,#fff8f7,#f7ecea)] p-6 sm:p-8"><div className="flex items-start gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm"><LockKeyhole className="text-[#b85d70]"/></span><div><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#b85d70]">Secure access center</p><h1 className="mt-1 font-serif text-[38px] sm:text-[50px]">Vault</h1><p className="mt-2 max-w-2xl text-[12px] leading-6 text-[#776d68]">Your websites, portals, account destinations and password-manager links in one place. Glow OS intentionally does not store plaintext passwords in the public app code or database.</p></div></div></header>
    <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-[22px] border border-[#eee5e1] bg-white p-5"><div className="flex items-center gap-2"><ShieldCheck size={17} className="text-[#b85d70]"/><h2 className="font-serif text-[22px]">Safe password setup</h2></div><p className="mt-3 text-[11px] leading-5 text-[#7f746e]">Use Vault as the launchpad, not the password database. Keep actual passwords inside your password manager or private Notion workspace. Links you add here stay in this browser unless you intentionally move them elsewhere.</p><div className="mt-4 grid gap-2 sm:grid-cols-3"><input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Name, e.g. Notion Password Vault" className="rounded-xl border border-[#eadfdb] px-3 py-3 text-[12px]"/><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." className="rounded-xl border border-[#eadfdb] px-3 py-3 text-[12px]"/><input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Category" className="rounded-xl border border-[#eadfdb] px-3 py-3 text-[12px]"/></div><button type="button" onClick={add} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#c86679] px-4 py-2.5 text-[11px] font-medium text-white"><Plus size={14}/>Add secure link</button></div><div className="rounded-[22px] border border-[#eee5e1] bg-white p-5"><div className="flex items-center gap-2"><KeyRound size={17} className="text-[#b85d70]"/><h2 className="font-serif text-[22px]">How to use it</h2></div><ol className="mt-4 space-y-3 text-[11px] leading-5 text-[#756b65]"><li><b>1.</b> Open Vault instead of hunting through tabs.</li><li><b>2.</b> Tap the website or portal.</li><li><b>3.</b> Let your password manager autofill credentials.</li><li><b>4.</b> Never paste passwords into notes, source code or screenshots.</li></ol></div></section>
    <section className="space-y-4">{grouped.map(([name,items])=><div key={name} className="rounded-[22px] border border-[#eee5e1] bg-white p-5"><h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#9d8f88]">{name}</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map(item=><div key={item.id} className="flex items-center gap-3 rounded-[16px] border border-[#efe7e3] bg-[#fffdfc] p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f8eeec]"><Link2 size={16} className="text-[#b85d70]"/></span><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-medium">{item.label}</p><p className="truncate text-[9px] text-[#9a8e87]">{item.url.replace(/^https?:\/\//,'')}</p></div><a href={item.url} target="_blank" rel="noreferrer" aria-label={`Open ${item.label}`} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#f7eeed]"><ExternalLink size={14}/></a>{!SAFE_DEFAULTS.some(d=>d.id===item.id)?<button type="button" onClick={()=>setLinks(v=>v.filter(x=>x.id!==item.id))} aria-label={`Remove ${item.label}`} className="grid h-9 w-9 place-items-center rounded-full text-[#aa8d93] hover:bg-[#f7eeed]"><Trash2 size={13}/></button>:null}</div>)}</div></div>)}</section>
  </div></AppShell>;
}
