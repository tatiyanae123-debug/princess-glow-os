import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { and, desc, eq, like } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { importantLinks } from '@/db/schema';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';
const categories = ['clothing','shoes','bags','vintage','jewelry','designer','basics','outerwear','local','other'] as const;
type Kind = 'store' | 'find';
const classInput='w-full rounded-lg border border-[#e7e4e2] bg-white px-3 py-3 text-sm text-[#1c1c1e]';

async function saveFashionLink(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const title=String(formData.get('title')??'').trim().slice(0,180);
  const rawUrl=String(formData.get('url')??'').trim();
  const kind:Kind=formData.get('kind')==='store'?'store':'find';
  const category=String(formData.get('category')??'other');
  const notes=String(formData.get('notes')??'').trim().slice(0,3000);
  if(!title || !rawUrl || !categories.includes(category as typeof categories[number])) return;
  let parsed:URL;
  try {parsed=new URL(rawUrl);} catch {return;}
  if(!['http:','https:'].includes(parsed.protocol))return;
  await db.insert(importantLinks).values({
    userId:session.user.id,title,url:parsed.toString(),category:`fashion:${kind}:${category}`,
    notes:notes||null,pinned:formData.get('pinned')==='on',
  });
  revalidatePath('/closet/fashion-directory');
}

async function archiveFashionLink(id:string) {
  'use server';
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  await db.update(importantLinks).set({archived:true,updatedAt:new Date()})
    .where(and(eq(importantLinks.id,id),eq(importantLinks.userId,session.user.id),like(importantLinks.category,'fashion:%')));
  revalidatePath('/closet/fashion-directory');
}

export default async function FashionDirectory(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const rows=await db.select().from(importantLinks)
    .where(and(eq(importantLinks.userId,session.user.id),like(importantLinks.category,'fashion:%'),eq(importantLinks.archived,false)))
    .orderBy(desc(importantLinks.pinned),desc(importantLinks.createdAt));
  const stores=rows.filter(r=>r.category?.startsWith('fashion:store:'));
  const finds=rows.filter(r=>r.category?.startsWith('fashion:find:'));
  return <AppShell><main className="mx-auto max-w-6xl space-y-8 px-4 py-8 text-[#1c1c1e]">
    <header className="space-y-3">
      <Link href="/closet" className="text-sm text-[#6e6e73] underline underline-offset-4">← Back to wardrobe</Link>
      <p className="text-xs uppercase tracking-[.22em] text-[#b86f7d]">Glow OS · Style Atelier</p>
      <h1 className="font-serif text-4xl">Fashion Directory</h1>
      <p className="max-w-xl text-sm leading-6 text-[#6e6e73]">Save favorite stores, product links, research and inspiration. Everything stays linked to your Glow account, not a browser-only list.</p>
    </header>
    <section className="grid gap-5 lg:grid-cols-2">
      {(['store','find'] as const).map(kind=><Card key={kind} className="space-y-4 p-5">
        <div><p className="text-xs uppercase tracking-wide text-[#b86f7d]">{kind==='store'?'Store + Brand':'Fashion Find'}</p><h2 className="mt-1 font-serif text-2xl">{kind==='store'?'Save a favorite shop':'Save a product or reference'}</h2></div>
        <form action={saveFashionLink} className="space-y-3">
          <input type="hidden" name="kind" value={kind}/>
          <label className="block space-y-1 text-sm"><span>Name</span><input name="title" required maxLength={180} className={classInput} placeholder={kind==='store'?'Store or brand name':'Product, outfit or article title'}/></label>
          <label className="block space-y-1 text-sm"><span>Website URL</span><input name="url" type="url" required className={classInput} placeholder="https://..."/></label>
          <label className="block space-y-1 text-sm"><span>Category</span><select name="category" className={classInput}>{categories.map(cat=><option key={cat} value={cat}>{cat[0].toUpperCase()+cat.slice(1)}</option>)}</select></label>
          <label className="block space-y-1 text-sm"><span>Why save it?</span><textarea name="notes" rows={3} className={classInput} placeholder="What to shop for, preferred sizing, wardrobe gap, outfits, and useful notes"/></label>
          <label className="flex items-center gap-2 text-sm"><input name="pinned" type="checkbox"/> Favorite / pin</label>
          <button type="submit" className="rounded-lg bg-[#1c1c1e] px-5 py-3 text-sm text-white">Save {kind==='store'?'store':'find'}</button>
        </form>
      </Card>)}
    </section>
    <section className="space-y-4"><h2 className="font-serif text-3xl">Stores + Brands <span className="text-sm text-[#6e6e73]">({stores.length})</span></h2>
      {stores.length===0?<p className="rounded-xl bg-[#fafafa] p-5 text-sm text-[#6e6e73]">No stores saved yet. Add your first favorite shop above.</p>:<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{stores.map(item=><Card key={item.id} className="space-y-3 p-4"><div><p className="text-xs uppercase text-[#b86f7d]">{item.category?.split(':')[2]}</p><h3 className="mt-1 text-lg font-medium">{item.title}</h3>{item.notes&&<p className="mt-2 whitespace-pre-wrap text-sm text-[#6e6e73]">{item.notes}</p>}</div><div className="flex flex-wrap gap-3 text-sm"><a href={item.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Visit store ↗</a><form action={archiveFashionLink.bind(null,item.id)}><button className="text-[#6e6e73] underline underline-offset-4">Archive</button></form></div></Card>)}</div>}
    </section>
    <section className="space-y-4"><h2 className="font-serif text-3xl">Products, Links + Finds <span className="text-sm text-[#6e6e73]">({finds.length})</span></h2>
      {finds.length===0?<p className="rounded-xl bg-[#fafafa] p-5 text-sm text-[#6e6e73]">No finds saved yet. Save a product page, reference or shopping link above.</p>:<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{finds.map(item=><Card key={item.id} className="space-y-3 p-4"><div><p className="text-xs uppercase text-[#b86f7d]">{item.category?.split(':')[2]}</p><h3 className="mt-1 text-lg font-medium">{item.title}</h3>{item.notes&&<p className="mt-2 whitespace-pre-wrap text-sm text-[#6e6e73]">{item.notes}</p>}</div><div className="flex flex-wrap gap-3 text-sm"><a href={item.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Open saved link ↗</a><form action={archiveFashionLink.bind(null,item.id)}><button className="text-[#6e6e73] underline underline-offset-4">Archive</button></form></div></Card>)}</div>}
    </section>
  </main></AppShell>;
}
