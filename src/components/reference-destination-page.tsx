import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export type DestinationLink = { label: string; href: string; note?: string };

export function ReferenceDestinationPage({
  eyebrow,
  title,
  description,
  tabs = [],
  primary,
  secondary = [],
  insight,
}: {
  eyebrow: string;
  title: string;
  description: string;
  tabs?: string[];
  primary: DestinationLink[];
  secondary?: DestinationLink[];
  insight: string;
}) {
  return (
    <div className="space-y-5">
      <header className="rounded-[24px] border border-[#eee7e3] bg-[linear-gradient(135deg,#fffdfb,#faf1ef)] px-5 py-6 sm:px-8 sm:py-8">
        <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#b65c70]">{eyebrow}</p>
        <h1 className="glow-display mt-2 text-[40px] leading-[.98] tracking-[-.035em] text-[#28221f] sm:text-[54px]">{title}</h1>
        <p className="mt-3 max-w-[62ch] text-[12.5px] leading-6 text-[#81756f]">{description}</p>
        {tabs.length ? <div className="mt-5 flex flex-wrap gap-2">{tabs.map((tab,index)=><span key={tab} className={index===0?'rounded-full bg-[#c45e75] px-3 py-2 text-[10px] font-medium text-white':'rounded-full border border-[#eadfdb] bg-white px-3 py-2 text-[10px] text-[#776d67]'}>{tab}</span>)}</div> : null}
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {primary.map((item,index)=><Link key={item.href+item.label} href={item.href} className="group rounded-[20px] border border-[#eee7e3] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#e3d3cf] hover:shadow-[0_14px_36px_rgba(67,45,36,.06)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fae7ea] text-[#bf5a71]"><Sparkles size={14}/></span>
          <p className="glow-display mt-4 text-[19px] leading-tight text-[#302825]">{item.label}</p>
          <p className="mt-2 min-h-[36px] text-[10.5px] leading-5 text-[#938781]">{item.note ?? 'Open the connected Glow OS room.'}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-[10.5px] font-medium text-[#b65c70]">Open <ArrowRight size={11} className="transition group-hover:translate-x-0.5"/></span>
        </Link>)}
      </section>

      {secondary.length ? <section className="rounded-[22px] border border-[#eee7e3] bg-white p-5 sm:p-6"><div className="grid gap-2 md:grid-cols-2">{secondary.map(item=><Link key={item.href+item.label} href={item.href} className="flex min-h-[58px] items-center justify-between gap-3 rounded-[14px] border border-[#f1e9e6] px-4 py-3 text-[11.5px] text-[#3d3531] transition hover:bg-[#fff8f7]"><span><span className="block font-medium">{item.label}</span>{item.note?<span className="mt-1 block text-[9.5px] text-[#9a8f89]">{item.note}</span>:null}</span><ArrowRight size={12} className="shrink-0 text-[#bd6175]"/></Link>)}</div></section> : null}

      <section className="rounded-[22px] border border-[#efdfdc] bg-[linear-gradient(90deg,#fff,#fff6f4)] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[#b85a6f]"><Sparkles size={14}/><span className="text-[10px] font-semibold uppercase tracking-[.12em]">Glow Insight</span></div>
        <p className="glow-display mt-3 max-w-[70ch] text-[18px] italic leading-7 text-[#4a403b]">{insight}</p>
      </section>
    </div>
  );
}
