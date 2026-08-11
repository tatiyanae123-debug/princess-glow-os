import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { desc, eq, and } from 'drizzle-orm';
import { AppShell } from '@/components/app-shell';
import { db } from '@/db';
import { glowInboxItems } from '@/db/schema/adaptive-os';
import { CalendarDays, ChefHat, Fridge, PackageOpen, ShoppingBasket, Sparkles, Utensils } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function FoodPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  let captures:typeof glowInboxItems.$inferSelect[]=[];
  try{
    captures=await db.select().from(glowInboxItems).where(and(eq(glowInboxItems.userId,session.user.id),eq(glowInboxItems.suggestedType,'food'))).orderBy(desc(glowInboxItems.createdAt)).limit(12);
  }catch{}
  return <AppShell><div className="mx-auto max-w-6xl space-y-5">
    <section className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
      <div className="rounded-[24px] border border-[#eadccf] bg-[#fffaf2]/80 p-5">
        <div className="flex items-center gap-2 text-[#8a7752]"><ChefHat size={16}/><p className="text-[8px] font-bold uppercase tracking-[.18em]">Kitchen Intelligence</p></div>
        <h1 className="glow-display mt-2 text-[34px] text-[#40352d]">Nourishment Kitchen</h1>
        <p className="mt-2 max-w-2xl text-[10px] leading-5 text-[#78665d]">Meals, groceries, pantry, prep, schedule and spending belong to one food system. Drop a recipe, grocery screenshot, receipt or meal idea into Glow and it will route here when Food is detected.</p>
        <div className="mt-5 flex flex-wrap gap-2"><Link href="/intake" className="rounded-full bg-[#6d5f43] px-4 py-2 text-[8px] text-white">Add recipe / food info</Link><Link href="/planning" className="rounded-full border border-[#d9cbbd] bg-white px-4 py-2 text-[8px] text-[#6d5a4e]">Meal plan</Link><Link href="/finance" className="rounded-full border border-[#d9cbbd] bg-white px-4 py-2 text-[8px] text-[#6d5a4e]">Food spending</Link></div>
      </div>
      <div className="rounded-[24px] border border-[#e6dacd] bg-[#f4eddf] p-5"><Sparkles size={18} className="text-[#907b50]"/><p className="glow-display mt-3 text-[20px] text-[#4a4038]">Sunday Meal Prep</p><p className="mt-2 text-[9px] leading-4 text-[#78665d]">Review fridge → choose meals → build groceries → prep ingredients → place meals into the week.</p><Link href="/planning" className="mt-5 inline-flex text-[8px] text-[#806943]">Enter prep workflow →</Link></div>
    </section>

    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {[[Utensils,'Counter','Today’s meals','/planning'],[Fridge,'Fridge','Use-soon inventory','/home'],[PackageOpen,'Pantry','Staples + restock','/home'],[ShoppingBasket,'Groceries','Shopping + receipts','/intake']].map(([Icon,title,descText,href])=>{const I=Icon as typeof Utensils;return <Link href={String(href)} key={String(title)} className="rounded-[18px] border border-[#e8ddd1] bg-white/75 p-5 transition hover:-translate-y-0.5 hover:shadow-md"><I size={18} className="text-[#8d7850]"/><p className="glow-display mt-3 text-[19px] text-[#453931]">{String(title)}</p><p className="mt-2 text-[9px] text-[#7d6a61]">{String(descText)}</p></Link>})}
    </section>

    <section className="rounded-[22px] border border-[#e6d9ce] bg-white/70">
      <div className="flex items-center justify-between border-b border-[#eee2d8] px-5 py-4"><div className="flex items-center gap-2"><CalendarDays size={14} className="text-[#8d7850]"/><p className="text-[8px] font-bold uppercase tracking-[.17em] text-[#725f55]">Food Glow already understood</p></div><Link href="/inbox" className="text-[8px] text-[#8d7850]">Review Inbox</Link></div>
      <div className="grid gap-2 p-4 md:grid-cols-2">{captures.length?captures.map(item=><article key={item.id} className="rounded-[14px] border border-[#eee2d8] bg-[#fffaf6] p-4"><p className="text-[8px] uppercase tracking-[.14em] text-[#9b8660]">{item.status}</p><p className="glow-display mt-2 text-[16px] text-[#453931]">{item.suggestedTitle||'Food capture'}</p><p className="mt-2 line-clamp-3 text-[9px] leading-4 text-[#78665d]">{item.rawText}</p></article>):<div className="col-span-full py-10 text-center"><ChefHat className="mx-auto text-[#c0ad89]"/><p className="mt-2 text-[9px] text-[#8a776d]">No food captures yet. Use Add anything to send a recipe, grocery list, meal idea or receipt into Glow.</p></div>}</div>
    </section>
  </div></AppShell>;
}
