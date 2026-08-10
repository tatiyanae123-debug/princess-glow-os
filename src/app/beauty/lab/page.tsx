import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createBeautyProductAction, setBeautyProductArchivedAction } from '@/app/actions/completion-v1';
import { getBeautyProducts } from '@/lib/data/completion-v1';
import { Beaker, Sparkles, PackageSearch } from 'lucide-react';

export const dynamic='force-dynamic';
const fieldClass='w-full border px-4 py-3 text-[10px]';

export default async function BeautyLabPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const products=await getBeautyProducts(session.user.id);
  const expiring=products.filter((p)=>p.expiresAt&&p.expiresAt.getTime()<Date.now()+30*86400000).length;
  const repurchase=products.filter((p)=>p.repurchase==='yes').length;

  return <AppShell><SectionPage eyebrow="Beauty Laboratory" title="Know what you use and how your skin responds" description="Track products, ingredients, dates, reactions, cost, repurchase decisions, and routine position.">
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3"><Card className="relative overflow-hidden bg-[linear-gradient(145deg,#f4e6e1,#f8f1ec)]"><Beaker size={38} strokeWidth={.8} className="absolute right-4 top-3 text-[#aa7379]/18"/><p className="glow-eyebrow">Cabinet</p><p className="glow-display mt-2 text-[25px] text-[#4a3835]">{products.length}</p><p className="mt-1 text-[8px] text-[#8a716b]">products in your active shelf</p></Card><Card><p className="glow-eyebrow">Coming due</p><p className="glow-display mt-2 text-[25px] text-[#4a3835]">{expiring}</p><p className="mt-1 text-[8px] text-[#8a716b]">expiring within 30 days</p></Card><Card><p className="glow-eyebrow">Repurchase list</p><p className="glow-display mt-2 text-[25px] text-[#4a3835]">{repurchase}</p><p className="mt-1 text-[8px] text-[#8a716b]">products marked yes</p></Card></div>
      <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
        <Card className="paper-card"><form action={createBeautyProductAction} className="space-y-3"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#a86e76]"/><div><p className="glow-eyebrow">Lab intake</p><h2 className="glow-display mt-1 text-[20px] text-[#493733]">Add product</h2></div></div><input name="name" required placeholder="Product name" className={fieldClass}/><input name="category" required placeholder="Category" className={fieldClass}/><textarea name="ingredients" rows={3} placeholder="Ingredients / actives" className={fieldClass}/><div className="grid grid-cols-2 gap-2"><input name="openedAt" type="date" className={fieldClass}/><input name="expiresAt" type="date" className={fieldClass}/></div><input name="routinePosition" placeholder="Routine position" className={fieldClass}/><input name="usageFrequency" placeholder="Usage frequency" className={fieldClass}/><input name="reaction" placeholder="Reaction / notes" className={fieldClass}/><input name="repurchase" placeholder="Repurchase? yes / maybe / no" className={fieldClass}/><input name="cost" inputMode="decimal" placeholder="Cost" className={fieldClass}/><button className="rounded-[6px] bg-[#3f302d] px-4 py-2 text-[9px] font-medium text-white">Save product</button></form></Card>
        <Card className="p-0 overflow-hidden"><div className="flex items-center gap-2 border-b border-[#e8dbd4] px-5 py-4"><PackageSearch size={14} className="text-[#a46f76]"/><div><p className="glow-eyebrow">Product shelf</p><h2 className="glow-display mt-1 text-[19px] text-[#493733]">Cabinet + response history</h2></div></div>{products.length===0?<p className="p-8 text-center text-[9px] text-[#8b746e]">No products logged yet.</p>:<div className="grid gap-0 sm:grid-cols-2">{products.map((p,index)=><div key={p.id} className={`relative border-b border-r border-[#eee3dc] p-4 ${index%2===0?'bg-[#fbf4ef]/65':'bg-[#f7eceb]/50'}`}><div className="mb-3 flex h-16 items-end gap-2"><div className="h-12 w-8 rounded-t-[5px] bg-[#d8b9a9]"/><div className="h-16 w-10 rounded-t-[4px] bg-[#ecd3c5]"/><div className="h-9 w-9 rounded-[10px] bg-[#d9c3ba]"/></div><div className="flex justify-between gap-3"><div><p className="glow-display text-[14px] text-[#4a3935]">{p.name}</p><p className="mt-0.5 text-[7px] uppercase tracking-[.1em] text-[#9b817b]">{p.category}{p.routinePosition?` · ${p.routinePosition}`:''}</p></div>{p.costCents!==null?<span className="text-[8px] text-[#8a736c]">${(p.costCents/100).toFixed(2)}</span>:null}</div>{p.reaction?<p className="mt-2 text-[8px] leading-4 text-[#79655f]">Response: {p.reaction}</p>:null}{p.expiresAt?<p className="mt-2 text-[7px] text-[#a08780]">Expires {p.expiresAt.toLocaleDateString()}</p>:null}<form action={setBeautyProductArchivedAction.bind(null,p.id,true)} className="mt-3"><button className="rounded-[5px] border border-[#e2d4cc] px-2.5 py-1.5 text-[7px] text-[#78625c]">Archive product</button></form></div>)}</div>}</Card>
      </div>
    </div>
  </SectionPage></AppShell>;
}
