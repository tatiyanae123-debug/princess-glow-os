import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createClosetItemAction } from '@/app/actions/completion-v1';
import { getClosetItems } from '@/lib/data/completion-v1';

export const dynamic = 'force-dynamic';

export default async function ClosetPage() {
  const session = await auth(); if (!session?.user?.id) redirect('/sign-in');
  const items = await getClosetItems(session.user.id);
  return <AppShell><SectionPage eyebrow="Digital Closet" title="Know what you own and actually wear" description="Track wardrobe inventory, seasons, laundry state, weather fit, favorites, purchase cost, and wear count.">
    <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <Card><form action={createClosetItemAction} className="space-y-3"><h2 className="text-xl font-semibold">Add closet item</h2><input name="name" required placeholder="Item name" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="category" required placeholder="Category" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="season" placeholder="Season" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="weatherTags" placeholder="Weather tags" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="purchaseDate" type="date" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><input name="purchasePrice" inputMode="decimal" placeholder="Purchase price" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"/><select name="laundryState" defaultValue="clean" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"><option value="clean">Clean</option><option value="dirty">Laundry</option><option value="dry_clean">Dry clean</option><option value="repair">Needs repair</option></select><label className="flex items-center gap-2 text-sm"><input name="favorite" type="checkbox"/> Favorite</label><button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Save item</button></form></Card>
      <Card className="space-y-3"><div className="flex justify-between gap-3"><h2 className="text-xl font-semibold">Wardrobe</h2><span className="text-sm text-slate-500">{items.length} items</span></div>{items.length===0?<p className="text-sm text-slate-500">No closet items yet.</p>:items.map(item=>{const cpw=item.purchasePriceCents&&item.wearCount>0?item.purchasePriceCents/item.wearCount:null;return <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"><div className="flex justify-between gap-3"><div><p className="font-semibold">{item.favorite?'♡ ':''}{item.name}</p><p className="text-sm text-slate-500">{item.category}{item.season?` · ${item.season}`:''}</p></div><span className="text-xs uppercase text-slate-400">{item.laundryState.replace('_',' ')}</span></div><p className="mt-2 text-xs text-slate-400">{item.wearCount} wears{cpw?` · $${(cpw/100).toFixed(2)} per wear`:''}</p></div>})}</Card>
    </div>
  </SectionPage></AppShell>;
}
