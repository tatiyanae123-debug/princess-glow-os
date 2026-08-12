import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { BookOpen, Clock3, Sparkles } from 'lucide-react';

const LIBRARY=[
  {category:'Reset',title:'5-Minute Reset',minutes:5,items:['Clear one visible surface','Drink water','Put away five things','Choose the next action']},
  {category:'Reset',title:'15-Minute Reset',minutes:15,items:['Quick room reset','Hydrate','Check calendar','Choose top three','Prep one thing for later']},
  {category:'Reset',title:'30-Minute Reset',minutes:30,items:['Tidy priority zone','Laundry or dishes','Review tasks','Prepare tomorrow','Short self-care reset']},
  {category:'Beauty',title:'Beauty Routine Order',minutes:10,items:['Cleanse','Treatment','Serum','Moisturizer','SPF / finish']},
  {category:'Hair',title:'Hair Wash Day Guide',minutes:120,items:['Pre-wash prep','Cleanse','Condition / mask','Leave-in','Dry / style','Log next wash']},
  {category:'Fitness',title:'Short Workout Option',minutes:20,items:['Warm-up','Main movement block','Core / mobility','Cool down']},
  {category:'Travel',title:'Travel Prep Routine',minutes:30,items:['Documents','Medication','Chargers','Beauty essentials','Outfits','Departure buffer']},
  {category:'Emergency',title:'Low-Energy Essentials',minutes:15,items:['Medication','Water','Easy food','Essential hygiene','Move everything optional']},
];

export default function ResourcesPage(){
  return <AppShell><div className="mx-auto max-w-[1450px] space-y-5">
    <header className="rounded-[22px] border border-[#e4d7cf] bg-[linear-gradient(120deg,#f7ebe4,#fffaf6_58%,#ede7d6)] p-6 sm:p-8"><div className="flex items-center gap-2 text-[#a36d72]"><BookOpen size={16}/><p className="text-[8px] font-bold uppercase tracking-[.2em]">Glow Reference Library</p></div><h1 className="glow-display mt-2 text-[36px] leading-none text-[#382d29] sm:text-[46px]">Your reusable life playbooks.</h1><p className="mt-3 max-w-2xl text-[10px] leading-5 text-[#806d66]">Quick resets, routine-order guides, workout alternatives, travel prep and emergency versions give Glow something useful to pull when time or energy changes.</p></header>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{LIBRARY.map(item=><article key={item.title} className="editorial-surface overflow-hidden"><div className="border-b border-[#eadfd6] px-4 py-3"><div className="flex items-center justify-between gap-3"><span className="text-[7px] font-bold uppercase tracking-[.16em] text-[#a26a72]">{item.category}</span><span className="flex items-center gap-1 text-[8px] text-[#927d75]"><Clock3 size={9}/>{item.minutes} min</span></div><h2 className="glow-display mt-2 text-[18px] text-[#40342f]">{item.title}</h2></div><div className="space-y-2 p-4">{item.items.map(step=><p key={step} className="flex items-start gap-2 text-[9px] leading-4 text-[#75625c]"><Sparkles size={9} className="mt-0.5 shrink-0 text-[#c18a92]"/>{step}</p>)}</div></article>)}</div>
    <section className="rounded-[18px] border border-[#e4d7cf] bg-[#f7eee8] p-5"><p className="glow-display text-[20px] text-[#40342f]">Use the library across your world.</p><p className="mt-2 text-[9px] leading-4 text-[#806d66]">A 15-minute opening in Calendar can point to the 15-Minute Reset. Low energy can point to Essentials. Beauty, Hair and Fitness can reuse their guides without duplicating the routine.</p><div className="mt-4 flex flex-wrap gap-2"><Link href="/planning" className="rounded-[8px] bg-[#d9a2a7] px-3 py-2 text-[8px] text-white">Use in Planning</Link><Link href="/brain" className="rounded-[8px] border border-[#decfc7] bg-white/60 px-3 py-2 text-[8px] text-[#6b5751]">Ask Glow which one</Link></div></section>
  </div></AppShell>;
}
