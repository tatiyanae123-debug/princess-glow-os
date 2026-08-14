import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { BeautyLabExperience } from '@/components/beauty/beauty-lab-experience';
import { BeautyLabPhotoStrip } from '@/components/beauty/beauty-lab-photo-strip';
import { getBeautyProducts } from '@/lib/data/completion-v1';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { setBeautyProductArchivedAction, updateBeautyProductAction } from '@/app/actions/completion-v1';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full rounded-lg border border-[#F7D1D8] bg-white px-3 py-2 text-[11px] text-[#2B2420] focus:border-[#C9727E] focus:outline-none';
const dateValue = (value: Date | null) => value ? value.toISOString().slice(0, 10) : '';

export default async function BeautyLabPage({ searchParams }: { searchParams: Promise<{ productId?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const { productId } = await searchParams;
  const [products, routines] = await Promise.all([
    getBeautyProducts(session.user.id),
    getBeautyRoutinesByUser(session.user.id),
  ]);
  const selected = productId ? products.find((product) => product.id === productId) ?? null : null;

  return (
    <AppShell>
      <BeautyLabPhotoStrip />
      {productId && !selected ? (
        <div role="status" className="mb-4 rounded-[14px] border border-[#F7D1D8] bg-[#F7EEED] px-4 py-3 text-[11px] text-[#7B535C]">That Beauty Lab product is no longer available.</div>
      ) : null}
      {selected ? (
        <section className="mb-5 rounded-[20px] border border-[#C9727E] bg-white p-5 shadow-[0_14px_40px_rgba(201,114,126,.10)]">
          <div className="flex items-start justify-between gap-4">
            <div><p className="glow-eyebrow">Selected Beauty Lab product</p><h2 className="glow-display mt-1 text-[26px] text-[#2B2420]">{selected.name}</h2><p className="mt-1 text-[11px] text-[#8A8078]">Edit the exact saved product you opened.</p></div>
            <Link href="/beauty/lab" className="rounded-full border border-[#F7D1D8] px-3 py-1.5 text-[10px] text-[#8A8078]">Close</Link>
          </div>
          <form action={updateBeautyProductAction.bind(null, selected.id)} className="mt-4 grid gap-2 sm:grid-cols-2">
            <input name="name" required defaultValue={selected.name} className={fieldClass}/>
            <input name="category" required defaultValue={selected.category} className={fieldClass}/>
            <textarea name="ingredients" rows={2} defaultValue={selected.ingredients ?? ''} placeholder="Ingredients / actives" className={`${fieldClass} sm:col-span-2`}/>
            <input name="openedAt" type="date" defaultValue={dateValue(selected.openedAt)} className={fieldClass}/>
            <input name="expiresAt" type="date" defaultValue={dateValue(selected.expiresAt)} className={fieldClass}/>
            <input name="routinePosition" defaultValue={selected.routinePosition ?? ''} placeholder="Routine position" className={fieldClass}/>
            <input name="cost" inputMode="decimal" defaultValue={selected.costCents == null ? '' : String(selected.costCents / 100)} placeholder="Cost" className={fieldClass}/>
            <input name="usageFrequency" defaultValue={selected.usageFrequency ?? ''} placeholder="Usage frequency" className={fieldClass}/>
            <select name="repurchase" defaultValue={selected.repurchase ?? ''} className={fieldClass}><option value="">Still testing</option><option value="yes">Works for me — repurchase</option><option value="maybe">Unsure</option><option value="no">Discontinued</option></select>
            <textarea name="reaction" rows={3} defaultValue={selected.reaction ?? ''} placeholder="Observations / results" className={`${fieldClass} sm:col-span-2`}/>
            <button type="submit" className="w-fit rounded-full bg-[#2B2420] px-4 py-2 text-[11px] font-medium text-white">Save product</button>
          </form>
          <form action={setBeautyProductArchivedAction.bind(null, selected.id, true)} className="mt-2"><button type="submit" className="text-[10.5px] font-medium text-[#C9727E]">Archive product</button></form>
        </section>
      ) : null}
      <BeautyLabExperience products={products} routines={routines} />
    </AppShell>
  );
}
