import Link from 'next/link';

const tiles=[
 {label:'Skincare',href:'/skincare',image:'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=650&q=82'},
 {label:'Makeup',href:'/makeup',image:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=650&q=82'},
 {label:'Hair',href:'/hair',image:'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=650&q=82'},
 {label:'Beauty Cabinet',href:'/beauty/lab',image:'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=650&q=82'}
];

export function BeautyLabPhotoStrip(){
 return <section className="mb-5 rounded-[18px] border border-[#EEE9E6] bg-white p-4">
  <div className="mb-3"><p className="glow-eyebrow">Beauty collection</p><h2 className="glow-display mt-1 text-[20px] text-[#2D2927]">Products first, data second</h2></div>
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{tiles.map(t=><Link href={t.href} key={t.label} className="group overflow-hidden rounded-[14px] border border-[#EEE9E6] bg-[#FAF8F7]"><div className="h-24 sm:h-28"><img src={t.image} alt={t.label} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" loading="lazy"/></div><p className="px-3 py-2 text-[10.5px] font-medium text-[#4C4541]">{t.label}</p></Link>)}</div>
 </section>;
}
