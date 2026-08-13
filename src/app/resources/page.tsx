import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { BookOpen, Clock3, Sparkles } from 'lucide-react';

const LIBRARY = [
  { category: 'Reset', title: '5-Minute Reset', minutes: 5, items: ['Clear one visible surface', 'Drink water', 'Put away five things', 'Choose the next action'] },
  { category: 'Reset', title: '15-Minute Reset', minutes: 15, items: ['Quick room reset', 'Hydrate', 'Check calendar', 'Choose top three', 'Prep one thing for later'] },
  { category: 'Reset', title: '30-Minute Reset', minutes: 30, items: ['Tidy priority zone', 'Laundry or dishes', 'Review tasks', 'Prepare tomorrow', 'Short self-care reset'] },
  { category: 'Beauty', title: 'Beauty Routine Order', minutes: 10, items: ['Cleanse', 'Treatment', 'Serum', 'Moisturizer', 'SPF / finish'] },
  { category: 'Hair', title: 'Hair Wash Day Guide', minutes: 120, items: ['Pre-wash prep', 'Cleanse', 'Condition / mask', 'Leave-in', 'Dry / style', 'Log next wash'] },
  { category: 'Fitness', title: 'Short Workout Option', minutes: 20, items: ['Warm-up', 'Main movement block', 'Core / mobility', 'Cool down'] },
  { category: 'Travel', title: 'Travel Prep Routine', minutes: 30, items: ['Documents', 'Medication', 'Chargers', 'Beauty essentials', 'Outfits', 'Departure buffer'] },
  { category: 'Emergency', title: 'Low-Energy Essentials', minutes: 15, items: ['Medication', 'Water', 'Easy food', 'Essential hygiene', 'Move everything optional'] },
];

export default function ResourcesPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1450px] space-y-5">
        <header className="rounded-[20px] border border-[#F1E7E3] bg-[linear-gradient(120deg,#FBE4E8,#FDF8F6_58%,#F1E8D9)] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-[#C9727E]"><BookOpen size={16} /><p className="text-[11px] font-semibold uppercase tracking-[.16em]">Glow Reference Library</p></div>
          <h1 className="glow-display mt-2 text-[36px] leading-none text-[#2B2420] sm:text-[44px]">Your reusable life playbooks.</h1>
          <p className="mt-3 max-w-2xl text-[13px] leading-5 text-[#8A8078]">Quick resets, routine-order guides, workout alternatives, travel prep and emergency versions give Glow something useful to pull when time or energy changes.</p>
          <Link href="/resources/manage" className="mt-4 inline-flex rounded-full bg-[#2B2420] px-4 py-2.5 text-[11px] font-medium text-white">Build your own playbooks →</Link>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {LIBRARY.map((item) => (
            <article key={item.title} className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
              <div className="border-b border-[#F1E7E3] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#C9727E]">{item.category}</span>
                  <span className="flex items-center gap-1 text-[10.5px] text-[#8A8078]"><Clock3 size={10} />{item.minutes} min</span>
                </div>
                <h2 className="glow-display mt-2 text-[18px] text-[#2B2420]">{item.title}</h2>
              </div>
              <div className="space-y-2 p-4">
                {item.items.map((step) => (
                  <p key={step} className="flex items-start gap-2 text-[11.5px] leading-4 text-[#4A4440]"><Sparkles size={10} className="mt-0.5 shrink-0 text-[#C9727E]" />{step}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
        <section className="rounded-[18px] border border-[#F1E7E3] bg-[#FDF8F6] p-5">
          <p className="glow-display text-[20px] text-[#2B2420]">Use the library across your world.</p>
          <p className="mt-2 text-[12px] leading-5 text-[#8A8078]">A 15-minute opening in Calendar can point to the 15-Minute Reset. Low energy can point to Essentials. Beauty, Hair and Fitness can reuse their guides without duplicating the routine.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/planning" className="rounded-full bg-[#C9727E] px-3.5 py-2 text-[11px] font-medium text-white hover:bg-[#B15A68]">Use in Planning</Link>
            <Link href="/brain" className="rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#8A8078] hover:bg-[#FDF8F6]">Ask Glow which one</Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
