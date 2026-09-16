'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { ArrowRight, Image, Lightbulb, Mic, Palette, PenLine, Sparkles, Upload, WandSparkles } from 'lucide-react';

const spaces=[
 {title:'Capture',detail:'Catch the thought before it disappears.',href:'/inbox',icon:Lightbulb},
 {title:'Write',detail:'Move from fragments into notes and drafts.',href:'/notes',icon:PenLine},
 {title:'Visualize',detail:'Bring references, imagery and direction together.',href:'/resources',icon:Palette},
 {title:'Import',detail:'Bring source material into Glow without losing provenance.',href:'/import',icon:Upload},
];

export function CreateWorld(){
 const [focus,setFocus]=useState('');
 const askGlow=(intent:string)=>document.dispatchEvent(new CustomEvent('glow:open',{detail:{context:{world:'Create',room:'Creation Studio',intent,focus}}}));
 return <AppShell><main className="mx-auto max-w-6xl space-y-6 pb-16">
  <section className="relative overflow-hidden rounded-[28px] border border-[#ece7e2] bg-white px-6 py-12 md:px-10"><div className="pointer-events-none absolute right-8 top-5 h-44 w-44 rounded-full bg-[radial-gradient(circle,#f7e9ee,transparent_68%)]"/><p className="glow-eyebrow">Create World · living studio</p><h1 className="glow-display mt-3 max-w-3xl text-[36px] leading-tight text-[#282426] md:text-[44px]">Turn what is in your head into something you can see, shape, and keep.</h1><p className="mt-4 max-w-2xl text-[14px] leading-6 text-[#6e6e73]">Create is the making side of Glow. Start with an idea, a reference, a voice thought, or unfinished material. The same Glow intelligence stays with the work as it becomes a real object.</p><div className="mt-7 flex max-w-2xl gap-2 rounded-2xl border border-[#ece7e2] bg-[#fafafa] p-2"><input value={focus} onChange={(e)=>setFocus(e.target.value)} placeholder="What do you want to make?" className="min-w-0 flex-1 bg-transparent px-3 text-[14px] outline-none"/><button onClick={()=>askGlow(focus||'Help me decide what to create next')} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1c1c1e] px-4 text-[13px] text-white"><WandSparkles size={15}/>Create with Glow</button></div></section>
  <section><p className="glow-eyebrow">Start where the material is</p><div className="mt-3 grid gap-3 md:grid-cols-2">{spaces.map(({title,detail,href,icon:Icon})=><Link key={title} href={href} className="group rounded-[20px] border border-[#ececec] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(50,40,45,.07)]"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#f8eff1] text-[#9c6370]"><Icon size={18}/></span><ArrowRight size={17} className="text-[#aaa1a4] transition group-hover:translate-x-1"/></div><h2 className="mt-5 text-[17px] font-semibold text-[#292629]">{title}</h2><p className="mt-2 text-[13px] leading-5 text-[#6e6e73]">{detail}</p></Link>)}</div></section>
  <section className="grid gap-3 md:grid-cols-3"><button onClick={()=>askGlow('Help me turn a voice thought into a creation')} className="rounded-[18px] border border-[#ececec] bg-[#fafafa] p-5 text-left"><Mic size={18}/><b className="mt-4 block text-[14px]">Speak it</b><span className="mt-1 block text-[12px] text-[#6e6e73]">Use the same persistent Glow conversation.</span></button><button onClick={()=>askGlow('Help me create an image from my idea')} className="rounded-[18px] border border-[#ececec] bg-[#fafafa] p-5 text-left"><Image size={18}/><b className="mt-4 block text-[14px]">Make an image</b><span className="mt-1 block text-[12px] text-[#6e6e73]">Send the intent to the centralized creation runtime.</span></button><button onClick={()=>askGlow('Show me the most useful next step for what I am creating')} className="rounded-[18px] border border-[#ececec] bg-[#fafafa] p-5 text-left"><Sparkles size={18}/><b className="mt-4 block text-[14px]">What next?</b><span className="mt-1 block text-[12px] text-[#6e6e73]">Reason from current context instead of starting over.</span></button></section>
 </main></AppShell>;
}
