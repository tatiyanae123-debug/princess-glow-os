import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';

const products = [
  { name: 'Cleanse', detail: 'Gentle cleanser · AM/PM', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=700&q=82' },
  { name: 'Treat', detail: 'Serums · actives · prescriptions', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=700&q=82' },
  { name: 'Moisturize', detail: 'Barrier care · hydration', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=700&q=82' },
  { name: 'Protect', detail: 'SPF · daytime protection', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=700&q=82' },
];

export const dynamic = 'force-dynamic';

export default async function SkincarePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return (
    <AppShell>
      <SectionPage eyebrow="Beauty / Skincare" title="Skincare" description="Your routine, products, treatment rhythm and progress in one clean visual room.">
        <div className="space-y-4">
          <section className="rounded-[18px] border border-[#EEE9E6] bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="glow-eyebrow">Routine shelf</p><h2 className="glow-display mt-1 text-[22px] text-[#2D2927]">Skincare as a product collection</h2></div><Link href="/beauty/lab" className="rounded-full bg-[#D37687] px-4 py-2 text-[11px] font-medium text-white">Open Beauty Lab</Link></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => <Link href="/beauty/lab" key={product.name} className="overflow-hidden rounded-[16px] border border-[#EEE9E6] bg-white transition hover:-translate-y-0.5 hover:shadow-sm"><div className="relative h-36 bg-[#F8F5F3]"><Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" className="object-cover" /></div><div className="p-3"><h3 className="glow-display text-[15px] text-[#2D2927]">{product.name}</h3><p className="mt-1 text-[10.5px] text-[#928A85]">{product.detail}</p></div></Link>)}
            </div>
          </section>
          <section className="grid gap-3 md:grid-cols-3"><Link href="/beauty" className="rounded-[16px] border border-[#EEE9E6] bg-[#FFF7F8] p-4"><p className="text-[9px] uppercase tracking-[.12em] text-[#C86F80]">Today</p><h3 className="glow-display mt-2 text-[17px]">AM + PM routine</h3><p className="mt-2 text-[11px] text-[#8D8580]">See today&apos;s steps without opening the full lab.</p></Link><Link href="/beauty/lab" className="rounded-[16px] border border-[#EEE9E6] bg-[#F7F6FA] p-4"><p className="text-[9px] uppercase tracking-[.12em] text-[#8B7CA6]">Compatibility</p><h3 className="glow-display mt-2 text-[17px]">Ingredients + reactions</h3><p className="mt-2 text-[11px] text-[#8D8580]">Track actives, reactions, opening dates and expirations.</p></Link><Link href="/beauty" className="rounded-[16px] border border-[#EEE9E6] bg-[#F6F8F4] p-4"><p className="text-[9px] uppercase tracking-[.12em] text-[#7B9273]">Progress</p><h3 className="glow-display mt-2 text-[17px]">Skin journal</h3><p className="mt-2 text-[11px] text-[#8D8580]">Keep photos and notes connected to the routine.</p></Link></section>
        </div>
      </SectionPage>
    </AppShell>
  );
}
