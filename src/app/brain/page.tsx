import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { buildPersonalContext } from '@/lib/intelligence/context';

export const dynamic='force-dynamic';

const destinations=[
  {label:'Notes',href:'/notes',cue:'Thinking on paper'},
  {label:'Memory',href:'/memory',cue:'Long-term context'},
  {label:'Thoughts',href:'/brain/thoughts',cue:'Raw fragments'},
  {label:'Ideas',href:'/brain/ideas',cue:'Possibilities taking shape'},
  {label:'Insights',href:'/brain/insights',cue:'Evidence becoming meaning'},
  {label:'Timeline',href:'/timeline',cue:'History in sequence'},
  {label:'Decisions',href:'/brain/decisions',cue:'Reasons and outcomes'},
  {label:'Brain Graph',href:'/brain/graph',cue:'Relationships between objects'},
  {label:'Imported Knowledge',href:'/brain/imported',cue:'Sources and provenance'},
];

export default async function BrainPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');

  let context:Awaited<ReturnType<typeof buildPersonalContext>>|null=null;
  try{
    context=await buildPersonalContext(session.user.id);
  }catch(error){
    console.error('[Glow OS] Brain context unavailable',error);
  }

  if(!context){
    return (
      <AppShell>
        <CanonicalDomainRoom
          eyebrow="World · Brain"
          title="Brain"
          question="What do I know, notice, remember, or need to understand?"
          climate="brain"
          destinations={destinations}
        >
          <div data-error-state="recoverable" className="py-10">
            <p className="max-w-2xl font-serif text-[28px] text-[#4d4658]">The archive is still here.</p>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-[#7b7484]">One connected source could not be read right now. Your notes, memory, timeline, and other Brain rooms remain available without inventing replacement data.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link href="/notes" className="min-h-11 rounded-full border border-[#d9d2e2] px-5 py-3 text-[13px] text-[#625a70]">Open Notes</Link><Link href="/memory" className="min-h-11 rounded-full border border-[#d9d2e2] px-5 py-3 text-[13px] text-[#625a70]">Open Memory</Link></div>
          </div>
        </CanonicalDomainRoom>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="World · Brain"
        title="Brain"
        question="What do I know, notice, remember, or need to understand?"
        climate="brain"
        destinations={destinations}
        aside={
          <div className="space-y-5">
            <div><small className="text-[11px] uppercase tracking-[.14em] text-[#756e8e]">Current context</small><p className="mt-2 font-serif text-[25px] text-[#4d4658]">{context.focusScore}</p><p className="text-[12px] text-[#80798a]">focus snapshot, not a judgment</p></div>
            <div className="border-t border-[#ddd8e6] pt-4"><strong className="block text-[16px] text-[#514a5c]">{context.unfinishedTasks.length}</strong><span className="text-[12px] text-[#817a8a]">unfinished tasks · {context.overdueTasks.length} overdue</span></div>
            <div className="border-t border-[#ddd8e6] pt-4"><strong className="block text-[16px] text-[#514a5c]">{context.todaysEvents.length}</strong><span className="text-[12px] text-[#817a8a]">events in today’s context</span></div>
            <div className="border-t border-[#ddd8e6] pt-4"><strong className="block text-[16px] text-[#514a5c]">{context.activeGoals.length}</strong><span className="text-[12px] text-[#817a8a]">active goals informing reasoning</span></div>
          </div>
        }
      >
        <div className="space-y-10">
          <section>
            <p className="text-[11px] uppercase tracking-[.16em] text-[#756e8e]">Current interpretation</p>
            <p className="mt-3 max-w-3xl font-serif text-[27px] leading-[1.35] text-[#484151]">{context.dailyBrief}</p>
            <p className="mt-4 text-[11px] uppercase tracking-[.12em] text-[#948d9b]">Updated {context.generatedAt.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})} · {context.todayLabel}</p>
          </section>

          <section className="border-t border-[#e0dbe7] pt-8">
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] uppercase tracking-[.16em] text-[#756e8e]">Attention current</p><h2 className="mt-2 font-serif text-[27px] text-[#484151]">What wants a next action</h2></div><Link href="/attention" className="text-[12px] font-medium text-[#6d647c]">Open Attention Center</Link></div>
            <div className="mt-4 divide-y divide-[#e3dee9]">
              {context.recommendations.length===0?<p className="py-5 text-[13px] text-[#817a8a]">No recommendation is asking for attention right now.</p>:context.recommendations.map((item,index)=><Link key={item.id} href={item.href} className="grid gap-3 py-5 text-inherit no-underline sm:grid-cols-[32px_1fr_auto] sm:items-center"><span className="font-serif text-[18px] text-[#aaa2b5]">{String(index+1).padStart(2,'0')}</span><span><strong className="block text-[15px] text-[#514a5c]">{item.title}</strong><small className="mt-1 block text-[12px] leading-5 text-[#80798a]">{item.reason}</small></span><span className="text-[11px] uppercase tracking-[.1em] text-[#93899d]">{item.priority}</span></Link>)}
            </div>
          </section>

          <section className="border-t border-[#e0dbe7] pt-8">
            <p className="text-[11px] uppercase tracking-[.16em] text-[#756e8e]">Evidence-linked patterns</p>
            <h2 className="mt-2 font-serif text-[27px] text-[#484151]">What Glow is noticing</h2>
            <div className="mt-4 divide-y divide-[#e3dee9]">
              {context.patterns.length===0?<p className="py-5 text-[13px] text-[#817a8a]">No evidence-backed pattern is ready to surface.</p>:context.patterns.map((pattern)=><Link key={pattern.id} href={pattern.href} className="block py-5 text-inherit no-underline"><strong className="text-[15px] text-[#514a5c]">{pattern.title}</strong><p className="mt-2 text-[12px] leading-5 text-[#80798a]">{pattern.detail}</p></Link>)}
            </div>
          </section>

          <section className="border-t border-[#e0dbe7] pt-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[.16em] text-[#756e8e]">Pressure signals</p>
                <div className="mt-3 divide-y divide-[#e3dee9]">{context.attentionSignals.length===0?<p className="py-4 text-[13px] text-[#817a8a]">Nothing meaningful is pressing.</p>:context.attentionSignals.map((signal)=><Link key={signal.id} href={signal.href} className="block py-4 text-inherit no-underline"><span className="flex items-center justify-between gap-3"><strong className="text-[14px] text-[#514a5c]">{signal.label}</strong><small className="text-[10px] uppercase tracking-[.1em] text-[#968d9e]">{signal.level}</small></span><p className="mt-1 text-[12px] leading-5 text-[#80798a]">{signal.detail}</p></Link>)}</div>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[.16em] text-[#756e8e]">Goals in context</p>
                <div className="mt-3 divide-y divide-[#e3dee9]">{context.activeGoals.length===0?<p className="py-4 text-[13px] text-[#817a8a]">No active goals are informing the graph yet.</p>:context.activeGoals.map((goal)=><Link key={goal.id} href="/goals" className="block py-4 text-[14px] font-medium text-[#514a5c] no-underline">{goal.title}</Link>)}</div>
              </div>
            </div>
          </section>

          {context.nextEvent?<section className="border-t border-[#e0dbe7] pt-8"><p className="text-[11px] uppercase tracking-[.16em] text-[#756e8e]">Temporal context</p><Link href="/calendar" className="mt-3 block text-inherit no-underline"><strong className="font-serif text-[24px] font-medium text-[#484151]">{context.nextEvent.title}</strong><p className="mt-2 text-[12px] text-[#80798a]">{context.nextEvent.allDay?'All day':context.nextEvent.startAt.toLocaleString([],{weekday:'short',hour:'numeric',minute:'2-digit'})}</p></Link></section>:null}
        </div>
      </CanonicalDomainRoom>
    </AppShell>
  );
}
