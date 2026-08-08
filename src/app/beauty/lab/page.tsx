import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createBeautyProductAction } from '@/app/actions/completion-v1';
import { getBeautyProducts } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

export default async function BeautyLabPage() {
  const session = await auth(); if (!session?.user?.id) redirect('/sign-in');
  const products = await getBeautyProducts(session.user.id);
  return <AppShell><SectionPage eyebrow="Beauty Laboratory" title="Know what you use and how your skin responds" description="Track products, ingredients, dates, reactions, cost, repurchase decisions, and routine position.">
    <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <Card><form action={createBeautyProductAction} className="space-y-3"><h2 className="text-xl font-semibold">Add product</h2><input name="name" required placeholder="Product name" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="category" required placeholder="Category" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><textarea name="ingredients" rows={3} placeholder="Ingredients / actives" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><div className="grid grid-cols-2 gap-2"><input name="openedAt" type="date" className="rounded-2xl border border-slate-200 bg-transparent px-3 py-3 text-sm dark:border-slate-800"/><input name="expiresAt" type="date" className="rounded-2xl border border-slate-200 bg-transparent px-3 py-3 text-sm dark:border-slate-800"/></div><input name="routinePosition" placeholder="Routine position" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="usageFrequency" placeholder="Usage frequency" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="reaction" placeholder="Reaction / notes" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="repurchase" placeholder="Repurchase? yes / maybe / no" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="cost" inputMode="decimal" placeholder="Cost" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Save product</button></form></Card>
      <Card className="space-y-3"><h2 className="text-xl font-semibold">Product shelf</h2>{products.length===0?<p className="text-sm text-slate-500">No products logged yet.</p>:products.map(p=><div key={p.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex justify-between gap-3"><div><p className="font-semibold">{p.name}</p><p className="text-sm text-slate-500">{p.category}{p.routinePosition?` · ${p.routinePosition}`:''}</p></div>{p.costCents!==null&&<span className="text-sm text-slate-500">${(p.costCents/100).toFixed(2)}</span>}</div>{p.reaction&&<p className="mt-2 text-sm">Reaction: {p.reaction}</p>}{p.expiresAt&&<p className="mt-2 text-xs text-slate-400">Expires {p.expiresAt.toLocaleDateString()}</p>}</div>)}</Card>
    </div>
  </SectionPage></AppShell>;
}
