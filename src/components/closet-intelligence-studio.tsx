'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronRight, Heart, PackageOpen, Sparkles, Star, WashingMachine } from 'lucide-react';
import { EditableRoomImage } from '@/components/media/editable-room-image';

type ClosetItem = {
  id: string;
  name: string;
  category: string;
  season: string | null;
  weatherTags: string | null;
  purchaseDate: Date | null;
  purchasePriceCents: number | null;
  wearCount: number;
  laundryState: string;
  favorite: boolean;
  status: string;
  imageUrl: string | null;
};

type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  location: string | null;
  allDay: boolean;
};

type Tab = 'today' | 'outfits' | 'wardrobe' | 'calendar' | 'care' | 'insights';

const fallback = 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1400&q=88';
const categoryOrder = [/dress/i, /top|shirt|blouse|sweater|cardigan/i, /pant|skirt|jean|bottom/i, /shoe|heel|boot|sandal|sneaker/i, /bag|purse|clutch|tote/i, /jewel|earring|necklace|bracelet|ring|accessor/i];

function price(item: ClosetItem) {
  return item.purchasePriceCents == null ? null : item.purchasePriceCents / 100;
}

function costPerWear(item: ClosetItem) {
  const p = price(item);
  return p != null && item.wearCount > 0 ? p / item.wearCount : null;
}

function displayState(state: string) {
  if (state === 'clean') return 'Clean · available';
  if (state === 'dirty') return 'Laundry';
  if (state === 'dry_clean') return 'Dry cleaning';
  if (state === 'repair') return 'Needs repair';
  return state.replaceAll('_', ' ');
}

function chooseLook(items: ClosetItem[]) {
  const available = items.filter((item) => item.status === 'active' && item.laundryState === 'clean');
  const ranked = [...available].sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.wearCount - a.wearCount);
  const chosen: ClosetItem[] = [];
  for (const pattern of categoryOrder) {
    const match = ranked.find((item) => !chosen.includes(item) && pattern.test(item.category));
    if (match) chosen.push(match);
  }
  if (!chosen.length) chosen.push(...ranked.slice(0, 5));
  return chosen.slice(0, 5);
}

export function ClosetIntelligenceStudio({ items, events }: { items: ClosetItem[]; events: CalendarEvent[] }) {
  const [tab, setTab] = useState<Tab>('today');
  const [category, setCategory] = useState('all');
  const [mood, setMood] = useState('Polished');
  const [dense, setDense] = useState(false);

  const active = items.filter((item) => item.status === 'active');
  const available = active.filter((item) => item.laundryState === 'clean');
  const laundry = active.filter((item) => item.laundryState !== 'clean');
  const favorites = active.filter((item) => item.favorite);
  const wishlist = items.filter((item) => item.status === 'wishlist');
  const nextEvent = events.filter((event) => event.startAt.getTime() >= Date.now()).sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0] ?? null;
  const look = useMemo(() => chooseLook(items), [items]);
  const categories = ['all', ...Array.from(new Set(active.map((item) => item.category).filter(Boolean))).slice(0, 10)];
  const shown = active.filter((item) => category === 'all' || item.category === category);
  const neverWorn = active.filter((item) => item.wearCount === 0);
  const repair = active.filter((item) => item.laundryState === 'repair');
  const totalValue = active.reduce((sum, item) => sum + (item.purchasePriceCents ?? 0), 0) / 100;
  const wornValue = active.filter((item) => item.wearCount > 0).reduce((sum, item) => sum + (item.purchasePriceCents ?? 0), 0) / 100;

  return <div className="couture-room closet-studio mx-auto max-w-[1480px] space-y-5">
    <header className="couture-hero overflow-hidden rounded-[34px] p-6 sm:p-8 lg:p-10">
      <div className="grid gap-7 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
        <div>
          <p className="couture-kicker">Closet · Personal Styling Intelligence</p>
          <h1 className="glow-display mt-3 max-w-[760px] text-[42px] leading-[.98] text-[#392d29] sm:text-[58px]">Your private dressing room, made intelligent.</h1>
          <p className="mt-4 max-w-[700px] text-[12px] leading-6 text-[#796961]">What should I wear? What works together? What is actually available? Glow uses your real wardrobe records, wear history, favorites, laundry state and calendar context to reduce the work of getting dressed.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" onClick={() => setTab('outfits')} className="couture-primary">Create a look</button>
            <button type="button" onClick={() => setTab('wardrobe')} className="couture-secondary">Browse wardrobe</button>
            <Link href="#closet-manage" className="couture-secondary">Add an item</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
          <Metric label="Active pieces" value={active.length}/>
          <Metric label="Available now" value={available.length}/>
          <Metric label="Laundry + care" value={laundry.length}/>
          <Metric label="Favorites" value={favorites.length}/>
        </div>
      </div>
    </header>

    <nav className="couture-tabs" aria-label="Closet workspace">
      {([['today','Today'],['outfits','Outfits'],['wardrobe','Wardrobe'],['calendar','Calendar'],['care','Laundry + Care'],['insights','Insights']] as const).map(([key,label]) => <button type="button" key={key} aria-pressed={tab===key} onClick={() => setTab(key)} className={tab===key?'active':''}>{label}</button>)}
    </nav>

    {tab === 'today' ? <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <div className="couture-panel overflow-hidden p-0">
          <div className="grid min-h-[420px] lg:grid-cols-[.92fr_1.08fr]">
            <EditableRoomImage slot="closet:today:hero" label="Closet Today" fallbackUrl={look[0]?.imageUrl || fallback} className="min-h-[310px] lg:min-h-full"/>
            <div className="flex flex-col justify-between p-6 sm:p-8">
              <div>
                <p className="couture-kicker">Closet · Today</p>
                <p className="mt-2 text-[10px] uppercase tracking-[.12em] text-[#9f8780]">{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
                <h2 className="glow-display mt-5 text-[30px] leading-tight text-[#443630]">{look.length ? `${mood} look from what is clean and available` : 'Build your wardrobe to unlock daily styling'}</h2>
                {nextEvent ? <div className="mt-4 rounded-[16px] bg-white/55 p-4 backdrop-blur"><p className="text-[8px] uppercase tracking-[.14em] text-[#a37776]">Next calendar context</p><p className="glow-display mt-1 text-[17px] text-[#493a35]">{nextEvent.title}</p><p className="mt-1 text-[9px] text-[#83736c]">{nextEvent.startAt.toLocaleString('en-US',{weekday:'short',hour:'numeric',minute:'2-digit'})}{nextEvent.location?` · ${nextEvent.location}`:''}</p></div> : null}
              </div>
              <div>
                <div className="mt-5 space-y-2">{look.map((item) => <Link key={item.id} href={`/closet?itemId=${encodeURIComponent(item.id)}#closet-manage`} className="flex items-center justify-between rounded-[13px] border border-white/60 bg-white/50 px-3 py-2.5 text-[10px] text-[#5f4e48] backdrop-blur hover:bg-white/75"><span>{item.name}</span><span className="text-[#a88982]">{item.category}</span></Link>)}</div>
                <div className="mt-5 flex flex-wrap gap-2">{['Polished','Soft','Elegant','Casual'].map((value)=><button type="button" key={value} onClick={()=>setMood(value)} className={`rounded-full px-3 py-2 text-[9px] ${mood===value?'bg-[#5a4540] text-white':'border border-white/70 bg-white/55 text-[#755f58]'}`}>{value}</button>)}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <Panel title="Ready status" icon={<Check size={14}/>}>{look.length ? <div className="space-y-2">{look.map((item)=><StatusRow key={item.id} label={item.name} value={displayState(item.laundryState)} ok={item.laundryState==='clean'}/>)}</div> : <Empty text="No active clean pieces are available yet."/>}</Panel>
          <Panel title="Help me get dressed" icon={<Sparkles size={14}/>}><div className="grid grid-cols-2 gap-2">{['Running late','Dress it up','Dress it down','Start with a favorite'].map((label)=><button type="button" key={label} onClick={()=>setTab('outfits')} className="rounded-[13px] border border-[#eadfd9] bg-white/55 p-3 text-left text-[9px] text-[#695750] hover:bg-white">{label}</button>)}</div></Panel>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <Panel title="Wear more" subtitle="Rediscover pieces that have not entered your wear history yet." icon={<Heart size={14}/>}>{neverWorn.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{neverWorn.slice(0,4).map((item)=><GarmentCard key={item.id} item={item} compact/> )}</div> : <Empty text="Every active piece has at least one logged wear."/>}</Panel>
        <Panel title="Wardrobe health" icon={<Star size={14}/>}><div className="grid grid-cols-2 gap-2"><Mini label="Never worn" value={neverWorn.length}/><Mini label="Needs repair" value={repair.length}/><Mini label="Wishlist" value={wishlist.length}/><Mini label="Tracked value" value={totalValue?`$${Math.round(totalValue)}`:'—'}/></div></Panel>
      </section>
    </div> : null}

    {tab === 'outfits' ? <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <Panel title="Style Studio" subtitle="A first-pass outfit board using pieces you actually own and that are currently clean." icon={<Sparkles size={14}/>}>
        {look.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{look.map((item)=><GarmentCard key={item.id} item={item}/>)}</div> : <Empty text="Add active wardrobe pieces to begin building looks."/>}
        <div className="mt-5 rounded-[16px] bg-[#f8f0ed]/80 p-4 text-[10px] leading-5 text-[#725f58]">Glow does not yet invent fit, color or occasion metadata that is not stored on an item. As those fields are added to the wardrobe model, this canvas can score color harmony, silhouette, dress code and occasion fit directly.</div>
      </Panel>
      <div className="space-y-4"><Panel title="Mood dressing" icon={<Heart size={14}/>}><div className="grid grid-cols-2 gap-2">{['Powerful','Pretty','Comfortable','Elegant','Soft','Creative','Polished','Effortless'].map((value)=><button type="button" key={value} onClick={()=>setMood(value)} className={`rounded-[13px] border p-3 text-left text-[9px] ${mood===value?'border-[#c98d93] bg-[#f8e8ea] text-[#81535b]':'border-[#eadfd9] bg-white/55 text-[#6c5a53]'}`}>{value}</button>)}</div></Panel><Panel title="Ask Glow examples"><div className="space-y-2 text-[10px] leading-5 text-[#76645d]"><p>“Make an outfit around my white pants.”</p><p>“I have 10 minutes. Dress me.”</p><p>“Make this look more elegant.”</p><p className="text-[#a17975]">Ask Glow should use owned pieces first unless you explicitly ask to shop.</p></div></Panel></div>
    </section> : null}

    {tab === 'wardrobe' ? <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[18px] border border-white/60 bg-white/45 p-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-2 overflow-x-auto">{categories.map((value)=><button type="button" key={value} onClick={()=>setCategory(value)} className={`whitespace-nowrap rounded-full px-3 py-2 text-[9px] ${category===value?'bg-[#5a4540] text-white':'border border-[#e8dbd5] bg-white/60 text-[#77635c]'}`}>{value==='all'?'All':value}</button>)}</div><button type="button" onClick={()=>setDense((value)=>!value)} className="couture-secondary whitespace-nowrap">{dense?'Editorial view':'Dense view'}</button></div>
      {shown.length ? <div className={`grid gap-3 ${dense?'grid-cols-2 sm:grid-cols-4 lg:grid-cols-6':'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>{shown.map((item)=><GarmentCard key={item.id} item={item} compact={dense}/>)}</div> : <Empty text="No active wardrobe items match this category."/>}
    </section> : null}

    {tab === 'calendar' ? <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <Panel title="Closet calendar" subtitle="Plan looks against real upcoming calendar events." icon={<CalendarDays size={14}/>}>{events.filter((event)=>event.startAt.getTime()>=Date.now()).slice(0,8).length ? <div className="space-y-2">{events.filter((event)=>event.startAt.getTime()>=Date.now()).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()).slice(0,8).map((event)=><div key={event.id} className="flex items-center justify-between rounded-[14px] border border-[#eadfd9] bg-white/50 p-3"><div><p className="glow-display text-[15px] text-[#4a3b35]">{event.title}</p><p className="mt-1 text-[8px] text-[#95817a]">{event.startAt.toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}</p></div><Link href="/calendar" className="text-[9px] text-[#a3646c]">Plan look →</Link></div>)}</div> : <Empty text="No upcoming calendar events are available."/>}</Panel>
      <Panel title="Style my week" subtitle="The planning rail is calendar-aware; weather-aware outfit scoring can layer on when weather is connected to this room." icon={<Sparkles size={14}/>}><div className="space-y-2">{['Monday','Tuesday','Wednesday','Thursday','Friday'].map((day)=><div key={day} className="flex items-center justify-between rounded-[13px] bg-white/45 px-3 py-2.5 text-[9px]"><span>{day}</span><span className="text-[#a1817a]">Choose from available wardrobe</span></div>)}</div></Panel>
    </section> : null}

    {tab === 'care' ? <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <Panel title="Laundry + Care" subtitle="Closet availability is driven by each item's real laundry state." icon={<WashingMachine size={14}/> }><div className="grid grid-cols-2 gap-2"><Mini label="Clean" value={available.length}/><Mini label="Laundry" value={active.filter(i=>i.laundryState==='dirty').length}/><Mini label="Dry clean" value={active.filter(i=>i.laundryState==='dry_clean').length}/><Mini label="Repair" value={repair.length}/></div><div className="mt-4 space-y-2">{laundry.slice(0,8).map((item)=><Link href={`/closet?itemId=${encodeURIComponent(item.id)}#closet-manage`} key={item.id} className="flex items-center justify-between rounded-[13px] border border-[#eadfd9] bg-white/45 px-3 py-2.5 text-[9px]"><span>{item.name}</span><span className="text-[#a07773]">{displayState(item.laundryState)}</span></Link>)}</div></Panel>
      <Panel title="Care memory" icon={<PackageOpen size={14}/>}><p className="text-[10px] leading-5 text-[#75625b]">Your current Closet schema tracks clean, laundry, dry-clean and repair state. Detailed garment-care instructions such as cold wash, delicate, hang dry or steam-only are not stored yet, so Glow will not fabricate them.</p><Link href="#closet-manage" className="mt-4 inline-flex text-[10px] font-medium text-[#a35f68]">Manage item states →</Link></Panel>
    </section> : null}

    {tab === 'insights' ? <section className="grid gap-4 lg:grid-cols-3">
      <Panel title="Wear intelligence"><div className="space-y-3"><Insight label="Most worn" value={[...active].sort((a,b)=>b.wearCount-a.wearCount)[0]?.name ?? 'Not enough history'}/><Insight label="Never worn" value={`${neverWorn.length} pieces`}/><Insight label="Favorite share" value={active.length?`${Math.round(favorites.length/active.length*100)}%`:'—'}/></div></Panel>
      <Panel title="Value intelligence"><div className="space-y-3"><Insight label="Tracked wardrobe value" value={totalValue?`$${Math.round(totalValue)}`:'No prices saved'}/><Insight label="Value already worn" value={wornValue?`$${Math.round(wornValue)}`:'—'}/><Insight label="Cost-per-wear ready" value={`${active.filter((item)=>costPerWear(item)!=null).length} pieces`}/></div></Panel>
      <Panel title="Wardrobe gaps"><p className="text-[10px] leading-5 text-[#75625b]">Glow can identify evidence-backed gaps once color, occasion, fit and style attributes exist as structured wardrobe fields. Until then, it can safely flag practical gaps like too many unavailable items, unworn pieces, repair backlog and duplicate category concentration.</p></Panel>
    </section> : null}
  </div>;
}

function Metric({label,value}:{label:string;value:string|number}){return <div className="couture-metric"><p className="glow-display text-[25px] text-[#493a34]">{value}</p><p className="mt-1 text-[8px] uppercase tracking-[.12em] text-[#9d867e]">{label}</p></div>}
function Panel({title,subtitle,icon,children}:{title:string;subtitle?:string;icon?:React.ReactNode;children:React.ReactNode}){return <section className="couture-panel p-5"><div className="flex items-start gap-2">{icon?<span className="mt-0.5 text-[#b36c75]">{icon}</span>:null}<div><h2 className="glow-display text-[18px] text-[#493b35]">{title}</h2>{subtitle?<p className="mt-1 text-[9px] leading-4 text-[#927e77]">{subtitle}</p>:null}</div></div><div className="mt-4">{children}</div></section>}
function Empty({text}:{text:string}){return <div className="rounded-[14px] border border-dashed border-[#ddcbc4] bg-white/35 p-5 text-center text-[9px] leading-5 text-[#927f78]">{text}</div>}
function Mini({label,value}:{label:string;value:string|number}){return <div className="rounded-[14px] bg-white/48 p-3"><p className="glow-display text-[19px] text-[#4b3c36]">{value}</p><p className="mt-1 text-[8px] uppercase tracking-[.1em] text-[#9f8981]">{label}</p></div>}
function StatusRow({label,value,ok}:{label:string;value:string;ok:boolean}){return <div className="flex items-center justify-between gap-3 rounded-[13px] bg-white/45 px-3 py-2.5 text-[9px]"><span>{label}</span><span className={ok?'text-[#66806a]':'text-[#ae6a70]'}>{ok?'✓ ':''}{value}</span></div>}
function Insight({label,value}:{label:string;value:string}){return <div className="border-b border-[#eadfd9] pb-3 last:border-0 last:pb-0"><p className="text-[8px] uppercase tracking-[.1em] text-[#9b857e]">{label}</p><p className="glow-display mt-1 text-[16px] text-[#4b3d37]">{value}</p></div>}
function GarmentCard({item,compact=false}:{item:ClosetItem;compact?:boolean}){const cpw=costPerWear(item);return <Link href={`/closet?itemId=${encodeURIComponent(item.id)}#closet-manage`} className={`group couture-garment overflow-hidden rounded-[20px] ${compact?'':'min-h-[330px]'}`}><EditableRoomImage slot={`closet:item:${item.id}`} label={item.name} fallbackUrl={item.imageUrl||fallback} overlay={false} className={`${compact?'h-36':'h-56'} transition duration-500 group-hover:scale-[1.015]`}/><div className="p-3.5"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="glow-display truncate text-[15px] text-[#493a34]">{item.name}</p><p className="mt-1 text-[8px] uppercase tracking-[.09em] text-[#a08880]">{item.category}{item.season?` · ${item.season}`:''}</p></div>{item.favorite?<Heart size={12} className="shrink-0 fill-[#c78189] text-[#c78189]"/>:null}</div>{compact?null:<div className="mt-3 grid grid-cols-2 gap-2 text-[8px] text-[#846f68]"><span>{displayState(item.laundryState)}</span><span className="text-right">{item.wearCount} wears</span>{cpw!=null?<span>Cost / wear</span>:null}{cpw!=null?<span className="text-right">${cpw.toFixed(2)}</span>:null}</div>}<span className="mt-3 inline-flex items-center gap-1 text-[9px] text-[#a35e67]">Open item <ChevronRight size={10}/></span></div></Link>}
