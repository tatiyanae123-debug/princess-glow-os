import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createBeautyProductAction, setBeautyProductArchivedAction, updateBeautyProductAction } from '@/app/actions/completion-v1';
import { getBeautyProducts } from '@/lib/data/completion-v1';
import { AlertTriangle, Beaker, CalendarClock, CheckCircle2, FlaskConical, PackageSearch, RotateCcw, Sparkles, WalletCards } from 'lucide-react';

export const dynamic = 'force-dynamic';

const fieldClass = 'w-full rounded-[6px] border border-[#e5d8d1] bg-white/75 px-3 py-2.5 text-[9px] text-[#4e3b37] outline-none focus:border-[#b98a8f]';
type View = 'cabinet' | 'routine' | 'responses' | 'repurchase';

function dateInput(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : '';
}

function daysUntil(date: Date | null, now: Date) {
  return date ? Math.ceil((date.getTime() - now.getTime()) / 86400000) : null;
}

function money(cents: number | null) {
  return cents === null ? '—' : `$${(cents / 100).toFixed(2)}`;
}

function viewHref(view: View) {
  return `/beauty/lab?view=${view}`;
}

export default async function BeautyLabPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const params = await searchParams;
  const requestedView = params.view;
  const view: View = requestedView === 'routine' || requestedView === 'responses' || requestedView === 'repurchase' ? requestedView : 'cabinet';
  const products = await getBeautyProducts(session.user.id);
  const now = new Date();
  const expiringProducts = products
    .filter((product) => product.expiresAt && product.expiresAt.getTime() <= now.getTime() + 45 * 86400000)
    .sort((a, b) => (a.expiresAt?.getTime() ?? 0) - (b.expiresAt?.getTime() ?? 0));
  const repurchaseProducts = products.filter((product) => product.repurchase === 'yes' || product.repurchase === 'maybe');
  const responseProducts = products.filter((product) => Boolean(product.reaction?.trim()));
  const routineProducts = products.filter((product) => Boolean(product.routinePosition?.trim() || product.usageFrequency?.trim()));
  const cabinetValue = products.reduce((sum, product) => sum + (product.costCents ?? 0), 0);
  const ingredientCoverage = products.filter((product) => Boolean(product.ingredients?.trim())).length;

  const visibleProducts = view === 'routine'
    ? routineProducts
    : view === 'responses'
      ? responseProducts
      : view === 'repurchase'
        ? repurchaseProducts
        : products;

  return (
    <AppShell>
      <SectionPage eyebrow="Beauty Laboratory" title="Your product intelligence cabinet" description="Track inventory, ingredients, expiration, usage, routine placement, cost, reactions, and repurchase decisions in one editable workspace.">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#f4e6e1,#f8f1ec)]">
              <Beaker size={38} strokeWidth={0.8} className="absolute right-4 top-3 text-[#aa7379]/18" />
              <p className="glow-eyebrow">Active cabinet</p>
              <p className="glow-display mt-2 text-[25px] text-[#4a3835]">{products.length}</p>
              <p className="mt-1 text-[8px] text-[#8a716b]">products currently in rotation</p>
            </Card>
            <Card>
              <CalendarClock size={18} strokeWidth={1} className="text-[#9b6a73]" />
              <p className="glow-eyebrow mt-3">Expiration watch</p>
              <p className="glow-display mt-2 text-[25px] text-[#4a3835]">{expiringProducts.length}</p>
              <p className="mt-1 text-[8px] text-[#8a716b]">due within 45 days</p>
            </Card>
            <Card>
              <WalletCards size={18} strokeWidth={1} className="text-[#9b6a73]" />
              <p className="glow-eyebrow mt-3">Cabinet value</p>
              <p className="glow-display mt-2 text-[25px] text-[#4a3835]">${(cabinetValue / 100).toFixed(0)}</p>
              <p className="mt-1 text-[8px] text-[#8a716b]">known purchase cost across active products</p>
            </Card>
            <Card>
              <FlaskConical size={18} strokeWidth={1} className="text-[#9b6a73]" />
              <p className="glow-eyebrow mt-3">Ingredient coverage</p>
              <p className="glow-display mt-2 text-[25px] text-[#4a3835]">{ingredientCoverage}/{products.length || 0}</p>
              <p className="mt-1 text-[8px] text-[#8a716b]">products with ingredient or active notes</p>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2">
            {([
              ['cabinet', 'Cabinet'],
              ['routine', 'Routine + usage'],
              ['responses', 'Reactions'],
              ['repurchase', 'Repurchase'],
            ] as const).map(([key, label]) => (
              <Link key={key} href={viewHref(key)} className={`rounded-full border px-3 py-2 text-[8px] transition ${view === key ? 'border-[#7d5a59] bg-[#5b4240] text-white' : 'border-[#e1d3cc] bg-white/65 text-[#795f59]'}`}>{label}</Link>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[.68fr_1.32fr]">
            <Card className="paper-card h-fit">
              <form action={createBeautyProductAction} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#a86e76]" />
                  <div>
                    <p className="glow-eyebrow">Lab intake</p>
                    <h2 className="glow-display mt-1 text-[20px] text-[#493733]">Add product</h2>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2"><input name="name" required placeholder="Product name" className={fieldClass} /><input name="category" required placeholder="Category" className={fieldClass} /></div>
                <textarea name="ingredients" rows={3} placeholder="Ingredients / actives" className={fieldClass} />
                <div className="grid grid-cols-2 gap-2"><input name="openedAt" type="date" className={fieldClass} /><input name="expiresAt" type="date" className={fieldClass} /></div>
                <div className="grid gap-2 sm:grid-cols-2"><input name="routinePosition" placeholder="Routine position" className={fieldClass} /><input name="usageFrequency" placeholder="Usage, e.g. PM daily" className={fieldClass} /></div>
                <textarea name="reaction" rows={2} placeholder="Reaction / progress notes" className={fieldClass} />
                <div className="grid gap-2 sm:grid-cols-2"><select name="repurchase" className={fieldClass} defaultValue=""><option value="">Repurchase undecided</option><option value="yes">Yes</option><option value="maybe">Maybe</option><option value="no">No</option></select><input name="cost" inputMode="decimal" placeholder="Cost" className={fieldClass} /></div>
                <button className="rounded-[6px] bg-[#3f302d] px-4 py-2 text-[9px] font-medium text-white">Save product</button>
              </form>
            </Card>

            <div className="space-y-4">
              {expiringProducts.length > 0 ? (
                <Card className="border-[#ead4c6] bg-[#fff8f1]">
                  <div className="flex gap-3">
                    <AlertTriangle size={16} strokeWidth={1.2} className="mt-0.5 shrink-0 text-[#ad765e]" />
                    <div>
                      <p className="glow-eyebrow">Maintenance forecast</p>
                      <p className="glow-display mt-1 text-[16px] text-[#4c3935]">{expiringProducts[0].name} needs attention first</p>
                      <p className="mt-1 text-[8px] leading-4 text-[#806a64]">{daysUntil(expiringProducts[0].expiresAt, now)! < 0 ? 'Expiration date has passed.' : `${daysUntil(expiringProducts[0].expiresAt, now)} days until its recorded expiration date.`} Review texture, smell, packaging guidance, and replace when appropriate.</p>
                    </div>
                  </div>
                </Card>
              ) : null}

              <Card className="p-0 overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-[#e8dbd4] px-5 py-4">
                  <div className="flex items-center gap-2"><PackageSearch size={14} className="text-[#a46f76]" /><div><p className="glow-eyebrow">{view === 'cabinet' ? 'Product shelf' : view === 'routine' ? 'Routine map' : view === 'responses' ? 'Response journal' : 'Purchase decisions'}</p><h2 className="glow-display mt-1 text-[19px] text-[#493733]">{visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'}</h2></div></div>
                  {view !== 'cabinet' ? <Link href={viewHref('cabinet')} className="text-[8px] text-[#836b65]">View all</Link> : null}
                </div>

                {visibleProducts.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle2 size={20} strokeWidth={1} className="mx-auto text-[#a98780]" />
                    <p className="mt-3 text-[9px] text-[#8b746e]">{products.length === 0 ? 'Your cabinet is empty. Add your first product to start building Beauty Lab intelligence.' : view === 'routine' ? 'No routine placement or usage notes yet. Open a product below in Cabinet and add how you use it.' : view === 'responses' ? 'No reactions logged yet. Add a response note after trying a product so Glow can build your progress journal.' : 'Nothing is marked Yes or Maybe for repurchase right now.'}</p>
                    {products.length > 0 && view !== 'cabinet' ? <Link href={viewHref('cabinet')} className="mt-3 inline-block rounded-[6px] border border-[#ddcec7] px-3 py-2 text-[8px] text-[#765f59]">Edit cabinet</Link> : null}
                  </div>
                ) : (
                  <div className="divide-y divide-[#eee3dc]">
                    {visibleProducts.map((product) => {
                      const expiryDays = daysUntil(product.expiresAt, now);
                      return (
                        <details key={product.id} className="group bg-white/45 open:bg-[#fbf4ef]/70">
                          <summary className="cursor-pointer list-none px-5 py-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2"><p className="glow-display text-[15px] text-[#4a3935]">{product.name}</p>{expiryDays !== null && expiryDays <= 45 ? <span className="rounded-full bg-[#f3dfd4] px-2 py-1 text-[7px] text-[#8f6258]">{expiryDays < 0 ? 'Expired date' : `${expiryDays}d left`}</span> : null}{product.repurchase ? <span className="rounded-full bg-[#f1e7e4] px-2 py-1 text-[7px] uppercase text-[#866963]">Repurchase {product.repurchase}</span> : null}</div>
                                <p className="mt-1 text-[7px] uppercase tracking-[.1em] text-[#9b817b]">{product.category}{product.routinePosition ? ` · ${product.routinePosition}` : ''}{product.usageFrequency ? ` · ${product.usageFrequency}` : ''}</p>
                              </div>
                              <div className="text-right"><p className="text-[8px] text-[#8a736c]">{money(product.costCents)}</p><p className="mt-1 text-[7px] text-[#a0867f] group-open:hidden">Open details</p></div>
                            </div>
                            {view === 'responses' && product.reaction ? <p className="mt-3 line-clamp-2 text-[8px] leading-4 text-[#79655f]">{product.reaction}</p> : null}
                            {view === 'routine' && product.ingredients ? <p className="mt-3 line-clamp-2 text-[8px] leading-4 text-[#79655f]">Actives: {product.ingredients}</p> : null}
                          </summary>

                          <div className="border-t border-[#eee3dc] px-5 py-5">
                            <form action={updateBeautyProductAction.bind(null, product.id)} className="space-y-3">
                              <div className="grid gap-2 sm:grid-cols-2"><input name="name" required defaultValue={product.name} className={fieldClass} /><input name="category" required defaultValue={product.category} className={fieldClass} /></div>
                              <textarea name="ingredients" rows={3} defaultValue={product.ingredients ?? ''} placeholder="Ingredients / actives" className={fieldClass} />
                              <div className="grid grid-cols-2 gap-2"><input name="openedAt" type="date" defaultValue={dateInput(product.openedAt)} className={fieldClass} /><input name="expiresAt" type="date" defaultValue={dateInput(product.expiresAt)} className={fieldClass} /></div>
                              <div className="grid gap-2 sm:grid-cols-2"><input name="routinePosition" defaultValue={product.routinePosition ?? ''} placeholder="Routine position" className={fieldClass} /><input name="usageFrequency" defaultValue={product.usageFrequency ?? ''} placeholder="Usage frequency" className={fieldClass} /></div>
                              <textarea name="reaction" rows={3} defaultValue={product.reaction ?? ''} placeholder="Reaction / progress notes" className={fieldClass} />
                              <div className="grid gap-2 sm:grid-cols-2"><select name="repurchase" className={fieldClass} defaultValue={product.repurchase ?? ''}><option value="">Repurchase undecided</option><option value="yes">Yes</option><option value="maybe">Maybe</option><option value="no">No</option></select><input name="cost" inputMode="decimal" defaultValue={product.costCents === null ? '' : (product.costCents / 100).toFixed(2)} placeholder="Cost" className={fieldClass} /></div>
                              <div className="flex flex-wrap gap-2"><button className="rounded-[6px] bg-[#4a3733] px-3 py-2 text-[8px] text-white">Save changes</button></div>
                            </form>
                            <form action={setBeautyProductArchivedAction.bind(null, product.id, true)} className="mt-2"><button className="inline-flex items-center gap-1.5 rounded-[6px] border border-[#e1d3cc] px-3 py-2 text-[8px] text-[#78625c]"><RotateCcw size={10} />Archive product</button></form>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </SectionPage>
    </AppShell>
  );
}
