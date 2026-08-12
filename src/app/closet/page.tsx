import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { createClosetItemAction, incrementClosetWearAction, updateClosetItemAction } from '@/app/actions/completion-v1';
import { getClosetItems } from '@/lib/data/completion-v1';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { CalendarDays, Heart, Layers3, Shirt, Sparkles, WashingMachine, Wrench, Gift, ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full rounded-lg border border-[#F1E7E3] px-3 py-2.5 text-[11px]';

function dollars(cents: number | null) {
  return cents == null ? '—' : `$${(cents / 100).toFixed(2)}`;
}

export default async function ClosetPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [items, events] = await Promise.all([
    getClosetItems(session.user.id),
    getCalendarEventsByUser(session.user.id),
  ]);

  const active = items.filter((item) => item.status === 'active');
  const favorites = active.filter((item) => item.favorite);
  const laundry = active.filter((item) => item.laundryState === 'dirty' || item.laundryState === 'dry_clean');
  const repair = active.filter((item) => item.laundryState === 'repair');
  const donate = items.filter((item) => item.status === 'donate' || item.status === 'sell');
  const wishlist = items.filter((item) => item.status === 'wishlist');
  const clean = active.filter((item) => item.laundryState === 'clean');
  const unworn = active.filter((item) => item.wearCount === 0);
  const recentlyWorn = [...active].filter((item) => item.wearCount > 0).sort((a, b) => b.wearCount - a.wearCount).slice(0, 6);
  const bestValue = [...active].filter((item) => item.purchasePriceCents && item.wearCount > 0).sort((a, b) => (a.purchasePriceCents! / Math.max(a.wearCount, 1)) - (b.purchasePriceCents! / Math.max(b.wearCount, 1)))[0] ?? null;
  const wardrobeValue = active.reduce((sum, item) => sum + (item.purchasePriceCents ?? 0), 0);

  const categories = new Map<string, typeof items>();
  for (const item of items.filter((i) => i.status === 'active')) {
    const key = item.category || 'Uncategorized';
    categories.set(key, [...(categories.get(key) ?? []), item]);
  }

  const seasons = new Map<string, typeof items>();
  for (const item of active.filter((i) => i.season)) {
    seasons.set(item.season!, [...(seasons.get(item.season!) ?? []), item]);
  }

  const todaysLook = clean.length >= 2
    ? clean.slice(0, 6).flatMap((item, index) => clean.slice(index + 1).filter((other) => other.category.toLowerCase() !== item.category.toLowerCase()).slice(0, 1).map((other) => [item, other] as const))[0] ?? null
    : null;

  const upcomingEvents = events.filter((event) => event.startAt.getTime() >= Date.now()).sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).slice(0, 3);

  const insight = unworn.length > 0 && bestValue
    ? `${unworn.length} piece${unworn.length === 1 ? '' : 's'} haven't been worn yet, while ${bestValue.name} is earning its place at ${dollars(Math.round(bestValue.purchasePriceCents! / Math.max(bestValue.wearCount, 1)))} per wear.`
    : unworn.length > 0
      ? `${unworn.length} piece${unworn.length === 1 ? '' : 's'} in your closet haven't been worn yet — a good place to start next time you're getting dressed.`
      : bestValue
        ? `${bestValue.name} is your best value piece at ${dollars(Math.round(bestValue.purchasePriceCents! / Math.max(bestValue.wearCount, 1)))} per wear.`
        : 'Log a few wears and purchase prices to unlock cost-per-wear insights here.';

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#C9727E]">Closet</p>
            <h1 className="glow-display mt-1 text-[38px] leading-[1.05] text-[#2B2420] sm:text-[44px]">Your wardrobe,<br />styled around your life.</h1>
            <p className="mt-3 max-w-md text-[13px] text-[#8A8078]">Know what you own. Wear more of what you love.</p>
          </div>
          <EditableRoomImage slot="closet:hero" label="Closet hero" className="min-h-[190px] overflow-hidden rounded-[20px] border border-[#F1E7E3] sm:min-h-[230px]" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><p className="text-[10px] uppercase tracking-[.1em] text-[#9A9088]">Active pieces</p><p className="glow-display mt-1.5 text-[24px] text-[#2B2420]">{active.length}</p></div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[.1em] text-[#9A9088]"><Heart size={11} className="text-[#C9727E]" />Favorites</div><p className="glow-display mt-1.5 text-[24px] text-[#2B2420]">{favorites.length}</p></div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><p className="text-[10px] uppercase tracking-[.1em] text-[#9A9088]">Tracked value</p><p className="glow-display mt-1.5 text-[24px] text-[#2B2420]">{dollars(wardrobeValue)}</p></div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><p className="text-[10px] uppercase tracking-[.1em] text-[#9A9088]">Unworn pieces</p><p className="glow-display mt-1.5 text-[24px] text-[#2B2420]">{unworn.length}</p></div>
        </div>

        <div className="rounded-[20px] border border-[#F1E7E3] bg-[linear-gradient(150deg,#FBE4E8,#FDF3F2)] p-5">
          <div className="flex items-center gap-1.5 text-[#B15A68]"><Layers3 size={14} /><p className="text-[11px] font-semibold uppercase tracking-[.1em]">Today&apos;s Look</p></div>
          {todaysLook ? (
            <div className="mt-3 flex flex-wrap items-center gap-4">
              {todaysLook.map((item) => (
                <div key={item.id} className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FBE4E8] text-[#C9727E]"><Shirt size={13} /></span>
                  <span className="text-[12px] font-medium text-[#4A3238]">{item.name}</span>
                </div>
              ))}
            </div>
          ) : <p className="mt-3 text-[12px] text-[#8A6068]">Add at least two clean pieces from different categories to unlock outfit pairing.</p>}
        </div>

        <details className="rounded-[18px] border border-[#F1E7E3] bg-white p-5" open={items.length === 0}>
          <summary className="cursor-pointer text-[13px] font-medium text-[#2B2420]">+ Add a closet item</summary>
          <form action={createClosetItemAction} className="mt-3 grid gap-2 sm:grid-cols-2">
            <input name="name" required placeholder="Item name" className={fieldClass} />
            <input name="category" required placeholder="Category · top, denim, shoe, bag…" className={fieldClass} />
            <input name="season" placeholder="Season" className={fieldClass} />
            <input name="weatherTags" placeholder="Weather tags" className={fieldClass} />
            <input name="purchaseDate" type="date" className={fieldClass} />
            <input name="purchasePrice" inputMode="decimal" placeholder="Purchase price" className={fieldClass} />
            <select name="laundryState" defaultValue="clean" className={fieldClass}><option value="clean">Clean / ready</option><option value="dirty">Laundry</option><option value="dry_clean">Dry clean</option><option value="repair">Needs repair</option></select>
            <label className="flex items-center gap-2 text-[11px] text-[#8A8078]"><input name="favorite" type="checkbox" />Favorite</label>
            <button className="sm:col-span-2 w-fit rounded-lg bg-[#C9727E] px-4 py-2 text-[11px] font-medium text-white">Save item</button>
          </form>
        </details>

        {items.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-[#F1E7E3] bg-white p-10 text-center">
            <Shirt size={22} className="mx-auto text-[#D8CDC8]" />
            <p className="glow-display mt-3 text-[18px] text-[#2B2420]">Build your digital wardrobe.</p>
            <p className="mx-auto mt-2 max-w-sm text-[12px] text-[#9A9088]">Add your first piece above to unlock outfit pairings, care queues, and cost-per-wear intelligence.</p>
          </div>
        ) : (
          [...categories.entries()].map(([category, categoryItems]) => (
            <div key={category}>
              <p className="text-[13px] font-medium capitalize text-[#2B2420]">{category}</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {categoryItems.map((item) => {
                  const cpw = item.purchasePriceCents && item.wearCount > 0 ? item.purchasePriceCents / item.wearCount : null;
                  return (
                    <div key={item.id} className="overflow-hidden rounded-[16px] border border-[#F1E7E3] bg-white">
                      <div className="relative h-32 bg-[linear-gradient(145deg,#F1E0D9,#EAD9CE)]">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : <Shirt size={32} strokeWidth={0.9} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/70" />}
                        {item.favorite ? <Heart size={13} className="absolute right-2.5 top-2.5 fill-white/85 text-white/90" /> : null}
                      </div>
                      <form action={updateClosetItemAction.bind(null, item.id)} className="p-3">
                        <p className="truncate text-[12px] font-medium text-[#2B2420]">{item.name}</p>
                        <p className="text-[10px] text-[#9A9088]">{item.wearCount} wears{cpw ? ` · ${dollars(Math.round(cpw))}/wear` : ''}</p>
                        <details className="mt-2">
                          <summary className="cursor-pointer text-[10px] text-[#C9727E]">Manage</summary>
                          <div className="mt-2 space-y-1.5">
                            <input name="wearCount" type="number" min="0" defaultValue={item.wearCount} className={fieldClass} />
                            <select name="status" defaultValue={item.status} className={fieldClass}><option value="active">Active</option><option value="wishlist">Wishlist</option><option value="donate">Donate</option><option value="sell">Sell</option><option value="archived">Archived</option></select>
                            <div className="flex flex-wrap gap-1.5">
                              <button className="rounded-lg bg-[#4A4440] px-2.5 py-1.5 text-[10px] text-white">Save</button>
                              <button formAction={incrementClosetWearAction.bind(null, item.id, item.wearCount)} className="rounded-lg border border-[#F1E7E3] px-2.5 py-1.5 text-[10px] text-[#4A4440]">Wore today +1</button>
                            </div>
                          </div>
                        </details>
                      </form>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <p className="text-[13px] font-medium text-[#2B2420]">Recently Worn</p>
            {recentlyWorn.length === 0 ? <p className="mt-3 text-[12px] text-[#9A9088]">No wear history yet.</p> : (
              <div className="mt-3 space-y-2">{recentlyWorn.map((item) => <div key={item.id} className="flex items-center justify-between text-[12px]"><span className="text-[#3A332E]">{item.name}</span><span className="text-[#9A9088]">{item.wearCount} wears</span></div>)}</div>
            )}
          </div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <p className="text-[13px] font-medium text-[#2B2420]">Seasonal Edit</p>
            {seasons.size === 0 ? <p className="mt-3 text-[12px] text-[#9A9088]">Add a season to items to organize them here.</p> : (
              <div className="mt-3 space-y-2">{[...seasons.entries()].map(([season, seasonItems]) => <div key={season} className="flex items-center justify-between text-[12px]"><span className="capitalize text-[#3A332E]">{season}</span><span className="text-[#9A9088]">{seasonItems.length} pieces</span></div>)}</div>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-1.5"><WashingMachine size={13} className="text-[#C9727E]" /><p className="text-[12px] font-medium text-[#2B2420]">Laundry</p></div>
            <p className="mt-1 text-[10.5px] text-[#9A9088]">{laundry.length} waiting</p>
            <div className="mt-2 space-y-1.5">{laundry.slice(0, 4).map((item) => <p key={item.id} className="rounded-lg bg-[#FDFAF8] px-2.5 py-1.5 text-[11px] text-[#4A4440]">{item.name}</p>)}</div>
          </div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-1.5"><Wrench size={13} className="text-[#C9727E]" /><p className="text-[12px] font-medium text-[#2B2420]">Repair</p></div>
            <p className="mt-1 text-[10.5px] text-[#9A9088]">{repair.length} need attention</p>
            <div className="mt-2 space-y-1.5">{repair.slice(0, 4).map((item) => <p key={item.id} className="rounded-lg bg-[#FDFAF8] px-2.5 py-1.5 text-[11px] text-[#4A4440]">{item.name}</p>)}</div>
          </div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
            <div className="flex items-center gap-1.5"><Gift size={13} className="text-[#C9727E]" /><p className="text-[12px] font-medium text-[#2B2420]">Donate / Sell</p></div>
            <p className="mt-1 text-[10.5px] text-[#9A9088]">{donate.length} queued</p>
            <div className="mt-2 space-y-1.5">{donate.slice(0, 4).map((item) => <p key={item.id} className="rounded-lg bg-[#FDFAF8] px-2.5 py-1.5 text-[11px] text-[#4A4440]">{item.name}</p>)}</div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center gap-1.5"><ShoppingBag size={13} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Wishlist</p></div>
            {wishlist.length === 0 ? <p className="mt-3 text-[12px] text-[#9A9088]">Mark a piece as Wishlist from its Manage menu.</p> : (
              <div className="mt-3 space-y-2">{wishlist.map((item) => <div key={item.id} className="flex items-center justify-between text-[12px]"><span className="text-[#3A332E]">{item.name}</span><span className="text-[#9A9088]">{dollars(item.purchasePriceCents)}</span></div>)}</div>
            )}
          </div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center gap-1.5"><CalendarDays size={13} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Style Planning</p></div>
            {upcomingEvents.length === 0 ? <p className="mt-3 text-[12px] text-[#9A9088]">No upcoming events to plan a look for.</p> : (
              <div className="mt-3 space-y-2">{upcomingEvents.map((event) => <div key={event.id} className="flex items-center justify-between text-[12px]"><span className="truncate text-[#3A332E]">{event.title}</span><span className="text-[#9A9088]">{event.startAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></div>)}</div>
            )}
            <p className="mt-2 text-[10.5px] text-[#9A9088]">Pick your look from Recently Worn or Today&apos;s Look above, then check the piece is clean before your event.</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-[#FDF8F6] p-5">
          <div className="flex items-center gap-1.5"><Sparkles size={14} className="text-[#C9727E]" /><p className="text-[12px] font-medium text-[#2B2420]">Closet Insight</p></div>
          <p className="mt-2 max-w-xl text-[12.5px] leading-5 text-[#6B6560]">{insight}</p>
        </div>
      </div>
    </AppShell>
  );
}
