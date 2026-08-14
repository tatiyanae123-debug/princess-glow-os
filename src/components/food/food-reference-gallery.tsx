import Link from 'next/link';

const meals = [
  { title:'Breakfast', name:'Greek yogurt bowl', time:'8:00 AM', image:'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=700&q=82' },
  { title:'Lunch', name:'Salmon quinoa bowl', time:'12:30 PM', image:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=82' },
  { title:'Dinner', name:'Lemon pasta', time:'6:30 PM', image:'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=700&q=82' },
];

export function FoodReferenceGallery(){
  return <section className="rounded-[18px] border border-[#EEE9E6] bg-white p-4 sm:p-5">
    <div className="mb-4 flex items-end justify-between gap-3">
      <div><p className="glow-eyebrow">Today&apos;s meals</p><h2 className="glow-display mt-1 text-[21px] text-[#2D2927]">A visual food plan</h2></div>
      <Link href="/food" className="text-[10.5px] font-medium text-[#C86F80]">View all</Link>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      {meals.map(meal=><article key={meal.title} className="overflow-hidden rounded-[15px] border border-[#EEE9E6] bg-white">
        <div className="h-32 sm:h-36"><img src={meal.image} alt={meal.name} className="h-full w-full object-cover" loading="lazy"/></div>
        <div className="p-3"><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#B8AEA8]">{meal.title}</p><p className="glow-display mt-1 text-[14px] text-[#2D2927]">{meal.name}</p><p className="mt-1 text-[10px] text-[#9A928D]">{meal.time}</p><Link href="/food" className="mt-2 inline-block text-[10.5px] font-medium text-[#C86F80]">+ Add meal</Link></div>
      </article>)}
    </div>
  </section>;
}
