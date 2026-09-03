import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Camera, FileInput, Inbox, Mail, Mic2, NotebookPen, Sparkles, WandSparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

const portals = [
  { label: 'Capture', detail: 'Speech · text · photo · file', href: '/capture', icon: Mic2, position: 'left-[8%] top-[27%]' },
  { label: 'Creative Studio', detail: 'Transform an active idea', href: '/projects', icon: WandSparkles, position: 'right-[7%] top-[25%]' },
  { label: 'Notes', detail: 'Write and connect', href: '/notes', icon: NotebookPen, position: 'left-[14%] bottom-[18%]' },
  { label: 'Inbox', detail: 'Let arrivals find their destination', href: '/inbox', icon: Inbox, position: 'right-[13%] bottom-[18%]' },
  { label: 'Import', detail: 'Bring existing material into Glow', href: '/import', icon: FileInput, position: 'left-1/2 bottom-[7%] -translate-x-1/2' },
  { label: 'Gmail', detail: 'Correspondence into useful context', href: '/gmail', icon: Mail, position: 'left-1/2 top-[8%] -translate-x-1/2' },
];

export default async function CreatePage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');

  return <main className="relative min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.96)_0%,rgba(250,242,237,.90)_26%,rgba(231,235,244,.68)_54%,rgba(224,210,217,.82)_100%)] text-[#312b2a]">
    <div className="pointer-events-none absolute inset-0 opacity-65 [background-image:radial-gradient(circle_at_24%_18%,rgba(255,255,255,.95),transparent_22%),radial-gradient(circle_at_79%_72%,rgba(219,229,255,.48),transparent_28%)]"/>
    <div className="pointer-events-none absolute left-1/2 top-1/2 h-[72vh] w-[1px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-white/80 to-transparent shadow-[0_0_28px_4px_rgba(255,255,255,.48)]"/>

    <header className="absolute left-[5%] top-[5%] z-20">
      <p className="text-[10px] font-semibold uppercase tracking-[.3em]">CREATE · THE TRANSFORMATION STUDIO</p>
      <h1 className="mt-3 max-w-[520px] font-serif text-[clamp(34px,4vw,64px)] leading-[.96]">Let the idea become something.</h1>
      <p className="mt-4 max-w-[430px] text-sm leading-6 opacity-65">Mist becomes structure here. Capture first. Choose a form only when the idea is ready.</p>
    </header>

    <section className="relative mx-auto h-[100dvh] w-full max-w-[1500px]" aria-label="Create rooms">
      <div className="pointer-events-none absolute left-1/2 top-[53%] h-[36vw] max-h-[520px] w-[36vw] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.98)_0_4%,rgba(255,246,238,.82)_11%,rgba(214,228,255,.24)_30%,rgba(238,214,238,.18)_44%,transparent_66%)] blur-[1px] shadow-[0_0_80px_24px_rgba(255,255,255,.48)]"/>
      <div className="pointer-events-none absolute left-1/2 top-[53%] h-[25vw] max-h-[360px] w-[25vw] max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/75 shadow-[0_0_38px_rgba(255,255,255,.58),inset_0_0_36px_rgba(255,255,255,.44)]"/>
      <div className="absolute left-1/2 top-[53%] z-10 -translate-x-1/2 -translate-y-1/2 text-center">
        <Sparkles className="mx-auto h-7 w-7 opacity-45" strokeWidth={1}/>
        <p className="mt-3 font-serif text-[clamp(26px,3vw,44px)] italic">Mist → Structure</p>
        <p className="mt-2 text-[10px] uppercase tracking-[.22em] opacity-50">Current creation stays central</p>
      </div>

      {portals.map(({label,detail,href,icon:Icon,position})=><Link key={label} href={href} aria-label={label} className={`group absolute z-20 ${position} w-[min(27vw,280px)] border-l border-white/75 px-5 py-4 transition-transform duration-300 hover:translate-y-[-3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90`}>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/58 to-white/8 backdrop-blur-[9px] [mask-image:linear-gradient(90deg,#000,transparent)]"/>
        <Icon size={18} strokeWidth={1.2} className="opacity-55"/>
        <p className="mt-3 font-serif text-xl">{label}</p>
        <p className="mt-1 text-xs leading-5 opacity-55">{detail}</p>
      </Link>)}
    </section>

    <button type="button" onClick={undefined} className="pointer-events-none absolute bottom-[5%] left-[5%] flex items-center gap-2 text-[10px] uppercase tracking-[.18em] opacity-45"><Camera size={13}/> Open space · tools stay quiet until needed</button>
  </main>;
}
