import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getBeautyProducts } from '@/lib/data/completion-v1';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';

export const dynamic = 'force-dynamic';

type StudioSlug = 'nails' | 'brows' | 'lashes' | 'oral';

type StudioDefinition = {
  title: string;
  eyebrow: string;
  description: string;
  terms: string[];
  routineTerms: string[];
  nextHref: string;
  nextLabel: string;
};

const STUDIOS: Record<StudioSlug, StudioDefinition> = {
  nails: {
    title: 'Nails',
    eyebrow: 'Beauty Studio',
    description: 'Polish, manicure and pedicure care connected to the products and maintenance you actually own and schedule.',
    terms: ['nail', 'nails', 'polish', 'manicure', 'pedicure', 'cuticle'],
    routineTerms: ['nail', 'manicure', 'pedicure', 'cuticle'],
    nextHref: '/beauty/maintenance',
    nextLabel: 'Maintenance',
  },
  brows: {
    title: 'Brows',
    eyebrow: 'Beauty Studio',
    description: 'Brow products, shaping care and maintenance gathered into one Beauty room.',
    terms: ['brow', 'brows', 'eyebrow'],
    routineTerms: ['brow', 'brows', 'eyebrow', 'shape', 'wax', 'thread'],
    nextHref: '/beauty/makeup',
    nextLabel: 'Makeup',
  },
  lashes: {
    title: 'Lashes',
    eyebrow: 'Beauty Studio',
    description: 'Lash products, care and maintenance kept separate from makeup while staying connected to it.',
    terms: ['lash', 'lashes', 'mascara', 'eyelash'],
    routineTerms: ['lash', 'lashes', 'eyelash'],
    nextHref: '/beauty/makeup',
    nextLabel: 'Makeup',
  },
  oral: {
    title: 'Oral Care',
    eyebrow: 'Beauty Studio',
    description: 'Daily oral care and whitening products organized from the inventory already inside Glow.',
    terms: ['oral', 'tooth', 'teeth', 'dental', 'mouth', 'whitening', 'toothpaste', 'floss'],
    routineTerms: ['oral', 'tooth', 'teeth', 'dental', 'whitening', 'floss'],
    nextHref: '/beauty/maintenance',
    nextLabel: 'Maintenance',
  },
};

function includesAny(text: string, terms: string[]) {
  const value = text.toLowerCase();
  return terms.some((term) => value.includes(term));
}

export default async function BeautySecondaryStudioPage({ params }: { params: Promise<{ studio: string }> }) {
  const { studio } = await params;
  if (!(studio in STUDIOS)) notFound();
  const slug = studio as StudioSlug;
  const definition = STUDIOS[slug];

  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [products, routines] = await Promise.all([
    getBeautyProducts(session.user.id),
    getBeautyRoutinesByUser(session.user.id),
  ]);

  const matchedProducts = products.filter((product) => includesAny(
    `${product.name} ${product.category} ${product.ingredients ?? ''} ${product.routinePosition ?? ''} ${product.usageFrequency ?? ''}`,
    definition.terms,
  ));
  const matchedRoutines = routines.filter((routine) => includesAny(
    `${routine.name} ${routine.notes ?? ''} ${(routine.products ?? []).join(' ')}`,
    definition.routineTerms,
  ));
  const activeProducts = matchedProducts.filter((product) => Boolean(product.routinePosition?.trim() || product.usageFrequency?.trim()));

  return (
    <AppShell>
      <SectionPage eyebrow={definition.eyebrow} title={definition.title} description={definition.description}>
        <div className="space-y-5">
          <section className="grid gap-3 sm:grid-cols-3" aria-label={`${definition.title} summary`}>
            <Card className="paper-card p-4"><p className="glow-eyebrow">Owned</p><p className="glow-display mt-2 text-3xl text-[var(--glow-text)]">{matchedProducts.length}</p><p className="mt-1 text-[9px] text-[var(--glow-text-muted)]">matching inventory records</p></Card>
            <Card className="paper-card p-4"><p className="glow-eyebrow">In use</p><p className="glow-display mt-2 text-3xl text-[var(--glow-text)]">{activeProducts.length}</p><p className="mt-1 text-[9px] text-[var(--glow-text-muted)]">products with a current-use link</p></Card>
            <Card className="paper-card p-4"><p className="glow-eyebrow">Routines</p><p className="glow-display mt-2 text-3xl text-[var(--glow-text)]">{matchedRoutines.length}</p><p className="mt-1 text-[9px] text-[var(--glow-text-muted)]">connected routine records</p></Card>
          </section>

          <section className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
            <div className="space-y-3">
              <div><p className="glow-eyebrow">Inventory</p><h2 className="glow-display mt-1 text-2xl text-[var(--glow-text)]">What you already own</h2></div>
              {matchedProducts.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {matchedProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden p-0">
                      {product.photoUrl ? <div className="h-36 bg-cover bg-center" style={{ backgroundImage: `url(${product.photoUrl})` }} aria-hidden="true" /> : null}
                      <div className="p-4">
                        <p className="text-sm font-semibold text-[var(--glow-text)]">{product.name}</p>
                        <p className="mt-1 text-[9px] text-[var(--glow-text-muted)]">{product.category}</p>
                        <div className="mt-3 space-y-1 text-[9px] leading-4 text-[var(--glow-text-muted)]">
                          {product.routinePosition ? <p>Routine · {product.routinePosition}</p> : null}
                          {product.usageFrequency ? <p>Use · {product.usageFrequency}</p> : null}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="paper-card p-6"><p className="text-sm font-medium text-[var(--glow-text)]">No matching products are recorded yet.</p><p className="mt-2 text-xs leading-5 text-[var(--glow-text-muted)]">Glow leaves this room empty instead of inventing products. Add or identify products in Beauty Inventory when you are ready.</p><Link href="/beauty/inventory" className="mt-4 inline-flex text-xs font-semibold text-[var(--glow-accent)]">Open Beauty Inventory →</Link></Card>
              )}
            </div>

            <div className="space-y-3">
              <div><p className="glow-eyebrow">Rhythm</p><h2 className="glow-display mt-1 text-2xl text-[var(--glow-text)]">Connected routines</h2></div>
              <Card className="paper-card p-4">
                {matchedRoutines.length ? <div className="space-y-3">{matchedRoutines.map((routine) => <div key={routine.id} className="border-b border-[var(--glow-border)] pb-3 last:border-0 last:pb-0"><p className="text-sm font-semibold text-[var(--glow-text)]">{routine.name}</p><p className="mt-1 text-[9px] text-[var(--glow-text-muted)]">{routine.timeOfDay ?? 'Any time'}{routine.notes ? ` · ${routine.notes}` : ''}</p></div>)}</div> : <p className="text-xs leading-5 text-[var(--glow-text-muted)]">No dedicated routine is connected yet. This is a valid empty state.</p>}
              </Card>
              <div className="flex flex-wrap gap-2">
                <Link href="/beauty" className="glow-touch-target inline-flex items-center rounded-full border border-[var(--glow-border)] bg-white/50 px-4 text-xs text-[var(--glow-text)]">Beauty Atelier</Link>
                <Link href={definition.nextHref} className="glow-touch-target inline-flex items-center rounded-full border border-[var(--glow-border)] bg-white/50 px-4 text-xs text-[var(--glow-text)]">{definition.nextLabel}</Link>
              </div>
            </div>
          </section>
        </div>
      </SectionPage>
    </AppShell>
  );
}
