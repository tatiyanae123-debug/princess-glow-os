'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const groups=[
 {title:'Plan',items:[['Life Experiments','/planning/experiments'],['Night-Before Intelligence','/planning/night-before']]},
 {title:'Life',items:[['Life Maintenance','/life/maintenance'],['Digital Life','/life/digital'],['Environment Intelligence','/home/environment'],['Style Intelligence','/closet/style'],['Facial Practice','/beauty/facial-practice']]},
 {title:'Brain',items:[['Identity Studio','/brain/identity'],['Future Self','/brain/future-self'],['Standards','/brain/standards'],['Proof Portfolio','/brain/proof'],['Learning','/brain/learning'],['Coping Plans','/brain/coping'],['Attention Reset','/brain/attention-reset']]},
 {title:'Money',items:[['Financial Plan','/finance/plan'],['Financial School','/finance/school'],['Financial Brain','/finance/brain']]},
 {title:'Create',items:[['Source Library','/create/source-library']]},
] as const;

export function CorpusRoomDirectory(){return <section className="mx-auto mt-6 max-w-[1480px] rounded-[32px] border border-[#ddd8cf] bg-[linear-gradient(145deg,rgba(253,252,248,.97),rgba(244,242,236,.95))] p-5 shadow-[0_26px_90px_rgba(57,51,45,.07)] sm:p-8"><p className="text-[9px] uppercase tracking-[.2em] text-[#8d8172]">Glow Knowledge Corpus · New Rooms</p><h2 className="mt-3 max-w-3xl font-serif text-3xl text-[#3e3934] sm:text-4xl">One civilization, not a stack of disconnected apps.</h2><p className="mt-3 max-w-3xl text-[11px] leading-5 text-[#716a62]">These rooms absorb the new source material while keeping Today, Planning, Beauty, Closet, Finance, Brain and Create as the primary worlds.</p><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">{groups.map(group=><div key={group.title}><p className="mb-2 text-[8px] uppercase tracking-[.16em] text-[#94897c]">{group.title}</p><div className="space-y-2">{group.items.map(([label,href])=><Link key={href} href={href} className="flex min-h-11 items-center justify-between rounded-[14px] border border-[#e0dbd2] bg-white/68 px-3 text-[10px] text-[#5f5851] hover:bg-white"><span>{label}</span><ArrowRight size={12}/></Link>)}</div></div>)}</div></section>}
