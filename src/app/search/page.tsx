import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, eq, ilike } from 'drizzle-orm';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { db } from '@/db';
import { tasks } from '@/db/schema/tasks';
import { notes } from '@/db/schema/notes';
import { goals } from '@/db/schema/goals';
import { importantLinks } from '@/db/schema/important-links';
import { projects, lifeMemories } from '@/db/schema/intelligence-expansion';
import { beautyProducts } from '@/db/schema/completion-v1';
import { Search, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
type Result = { id:string; type:string; title:string; subtitle?:string|null; href:string };

export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
  const session=await auth(); if(!session?.user?.id) redirect('/sign-in');
  const {q=''}=await searchParams; const term=q.trim(); let results:Result[]=[];
  if(term){const like=`%${term}%`; const [taskRows,noteRows,goalRows,projectRows,memoryRows,productRows,linkRows]=await Promise.all([
    db.select().from(tasks).where(and(eq(tasks.userId,session.user.id),ilike(tasks.title,like))).limit(12),
    db.select().from(notes).where(and(eq(notes.userId,session.user.id),ilike(notes.title,like))).limit(12),
    db.select().from(goals).where(and(eq(goals.userId,session.user.id),ilike(goals.title,like))).limit(12),
    db.select().from(projects).where(and(eq(projects.userId,session.user.id),ilike(projects.title,like))).limit(12),
    db.select().from(lifeMemories).where(and(eq(lifeMemories.userId,session.user.id),ilike(lifeMemories.title,like))).limit(12),
    db.select().from(beautyProducts).where(and(eq(beautyProducts.userId,session.user.id),ilike(beautyProducts.name,like))).limit(12),
    db.select().from(importantLinks).where(and(eq(importantLinks.userId,session.user.id),ilike(importantLinks.title,like))).limit(12),
  ]); results=[...taskRows.map(x=>({id:x.id,type:'Task',title:x.title,subtitle:x.description,href:'/tasks'})),...noteRows.map(x=>({id:x.id,type:'Note',title:x.title,subtitle:x.content,href:'/notes'})),...goalRows.map(x=>({id:x.id,type:'Goal',title:x.title,subtitle:x.description,href:'/goals'})),...projectRows.map(x=>({id:x.id,type:'Project',title:x.title,subtitle:x.nextAction,href:'/projects'})),...memoryRows.map(x=>({id:x.id,type:'Memory',title:x.title,subtitle:x.summary,href:'/memory'})),...productRows.map(x=>({id:x.id,type:'Beauty',title:x.name,subtitle:x.category,href:'/beauty/lab'})),...linkRows.map(x=>({id:x.id,type:'Link',title:x.title,subtitle:x.category,href:'/home'}))];}
  return <AppShell><div className="mx-auto max-w-5xl space-y-5"><header className="rounded-[22px] border border-[#e5d8d0] bg-[linear-gradient(120deg,#f8ece8,#fffaf6_55%,#eee6d8)] p-6"><div className="flex items-center gap-2 text-[#9f6670]"><Sparkles size={17}/><p className="text-[9px] font-bold uppercase tracking-[.2em]">Universal Search</p></div><h1 className="glow-display mt-2 text-4xl tracking-[-.04em] text-[#382d29]">Find anything in your world.</h1><p className="mt-2 text-[10px] text-[#806d66]">Search tasks, notes, goals, projects, memories, beauty products and saved links from one place.</p></header><form action="/search" className="flex gap-2 rounded-[18px] border border-[#e5d8d0] bg-[#fffaf6]/80 p-3 shadow-sm"><Search className="ml-2 mt-2.5 text-[#a58f86]" size={18}/><input name="q" defaultValue={term} autoFocus placeholder="Search Terrain, hair, a task, note, goal, product…" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"/><button className="rounded-[10px] bg-[#352925] px-5 py-2 text-xs text-white">Search</button></form>{term?<section className="overflow-hidden rounded-[20px] border border-[#e5d8d0] bg-[#fffaf6]/75"><div className="border-b border-[#eadfd6] px-5 py-4 text-[9px] font-bold uppercase tracking-[.18em] text-[#8b766f]">{results.length} result{results.length===1?'':'s'} for “{term}”</div><div className="divide-y divide-[#eee4dd]">{results.length?results.map(result=><Link key={`${result.type}-${result.id}`} href={result.href} className="grid gap-2 px-5 py-4 transition hover:bg-[#faeeee] md:grid-cols-[100px_1fr_140px]"><span className="text-[8px] font-bold uppercase tracking-[.12em] text-[#aa6873]">{result.type}</span><div><p className="text-sm font-medium text-[#3e322e]">{result.title}</p>{result.subtitle?<p className="mt-1 line-clamp-1 text-[10px] text-[#89756e]">{result.subtitle}</p>:null}</div><span className="text-[10px] text-[#a18b83] md:text-right">Open system →</span></Link>):<p className="p-10 text-center text-sm text-[#89756e]">Nothing matched yet. Ask Glow Brain for a broader interpretation.</p>}</div></section>:null}</div></AppShell>;
}
