import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { getAdaptiveState } from '@/lib/intelligence/adaptive-os';
import { getMaintenanceSignals, getProjectHealthSignals } from '@/lib/intelligence/signals';
import { ArrowRight, BrainCircuit, CheckCircle2, CircleAlert, Crown, Sparkles, Target, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

function Surface({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[24px] border border-stone-200/70 bg-white/72 shadow-[0_18px_55px_rgba(108,82,64,.07)] backdrop-blur-md ${className}`}>{children}</section>;
}

export default async function BrainPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const now = new Date();
  const [state, maintenance, projects] = await Promise.all([
    getAdaptiveState(userId, now),
    getMaintenanceSignals(userId, now),
    getProjectHealthSignals(userId, now),
  ]);
  const primary = state.now.primary;
  const attentionProjects = projects.filter((project) => project.status !== 'green');

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-violet-700"><BrainCircuit size={18} /><p className="text-[10px] font-bold uppercase tracking-[.22em]">Glow Brain 2.0</p></div>
            <h1 className="mt-2 text-4xl tracking-[-.04em] text-stone-950" style={{ fontFamily: 'var(--glow-font-display)' }}>Your entire life, interpreted together.</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">{state.context.dailyBrief} Glow is using your active Life Mode, time until your next commitment, personal rules, projects, habits, reminders, and maintenance signals to decide what deserves attention.</p>
          </div>
          <div className="flex gap-2"><Link href="/today" className="flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs text-white"><Zap size={13}/> Open Today</Link><Link href="/rules" className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-700">Rules</Link></div>
        </header>

        <Surface className="overflow-hidden bg-[linear-gradient(135deg,rgba(242,231,244,.95),rgba(255,248,243,.95))]">
          <div className="flex items-center justify-between border-b border-white/70 px-5 py-4"><div className="flex items-center gap-2"><Crown size={15} className="text-amber-700"/><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Glow's Decision</p></div><span className="text-[10px] text-stone-500">Mode: {state.activeMode?.name ?? 'Normal Day'}</span></div>
          <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_.6fr] lg:items-end">
            <div>{primary ? <><p className="text-3xl text-stone-950 sm:text-4xl" style={{ fontFamily: 'var(--glow-font-display)' }}>{primary.title}</p><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{primary.reason}</p><div className="mt-4 flex flex-wrap gap-2 text-[10px] text-stone-500"><span className="rounded-full bg-white/70 px-3 py-1.5">~{primary.estimatedMinutes} min</span><span className="rounded-full bg-white/70 px-3 py-1.5 capitalize">{primary.energyCost} energy</span><span className="rounded-full bg-white/70 px-3 py-1.5">Score {primary.score}</span></div></> : <p className="text-xl text-stone-800">No urgent action needs you right now.</p>}</div>
            <div className="rounded-2xl border border-white/70 bg-white/50 p-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-stone-500">Available block</p><p className="mt-2 text-4xl text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>{state.now.availableMinutes == null ? 'Open' : `${state.now.availableMinutes}m`}</p><p className="mt-1 text-[10px] text-stone-500">{state.now.hiddenCount} lower-value option{state.now.hiddenCount === 1 ? '' : 's'} hidden</p></div>
          </div>
        </Surface>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {state.systemHealth.map((item) => <Surface key={item.domain} className="p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-stone-500">{item.domain}</p>{item.status === 'stable' ? <CheckCircle2 size={14} className="text-emerald-600"/> : <CircleAlert size={14} className={item.status === 'behind' ? 'text-rose-600' : 'text-amber-600'}/>}</div><p className="mt-2 text-sm font-medium capitalize text-stone-900">{item.status}</p><p className="mt-1 text-[10px] leading-4 text-stone-500">{item.reason}</p></Surface>)}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
          <Surface className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200/70 px-5 py-4"><div className="flex items-center gap-2"><Target size={15} className="text-rose-600"/><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Project Health</p></div><Link href="/projects" className="text-[10px] text-stone-500">All projects</Link></div>
            <div className="divide-y divide-stone-100">{projects.length ? projects.slice(0,8).map((project) => <Link key={project.id} href="/projects" className="grid gap-3 px-5 py-4 transition hover:bg-stone-50 sm:grid-cols-[1fr_90px]"><div><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${project.status==='green'?'bg-emerald-500':project.status==='yellow'?'bg-amber-500':'bg-rose-500'}`}/><p className="text-sm font-medium text-stone-900">{project.title}</p></div><p className="mt-1 text-[10px] leading-4 text-stone-500">{project.reason}</p>{project.nextAction ? <p className="mt-2 text-[10px] text-rose-700">Next: {project.nextAction}</p>:null}</div><div className="text-right"><p className="text-sm text-stone-700">{project.progress}%</p><p className="text-[9px] uppercase text-stone-400">progress</p></div></Link>) : <p className="p-5 text-xs text-stone-500">No active projects yet.</p>}</div>
          </Surface>

          <Surface className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200/70 px-5 py-4"><div className="flex items-center gap-2"><Sparkles size={15} className="text-amber-700"/><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Maintenance Forecast</p></div><span className="text-[10px] text-stone-400">{maintenance.length}</span></div>
            <div className="divide-y divide-stone-100">{maintenance.length ? maintenance.map((item) => <div key={item.id} className="px-5 py-4"><div className="flex justify-between gap-3"><div><p className="text-sm font-medium text-stone-900">{item.title}</p><p className="mt-1 text-[10px] leading-4 text-stone-500">{item.recommendation}</p></div><span className={`h-fit rounded-full px-2.5 py-1 text-[9px] uppercase ${item.urgency==='soon'?'bg-rose-100 text-rose-700':'bg-amber-50 text-amber-700'}`}>{item.domain}</span></div></div>) : <p className="p-5 text-xs text-stone-500">Nothing is approaching maintenance yet.</p>}</div>
          </Surface>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Surface className="overflow-hidden"><div className="border-b border-stone-200/70 px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Next Best Options</p></div><div className="divide-y divide-stone-100">{state.now.alternatives.map((item)=><Link href={item.href} key={item.id} className="block px-5 py-4 hover:bg-stone-50"><div className="flex justify-between gap-3"><div><p className="text-sm font-medium text-stone-900">{item.title}</p><p className="mt-1 text-[10px] line-clamp-2 text-stone-500">{item.reason}</p></div><ArrowRight size={13} className="mt-1 shrink-0 text-stone-300"/></div></Link>)}</div></Surface>
          <Surface className="p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Personal Rules Active</p><p className="mt-3 text-4xl text-stone-900" style={{ fontFamily:'var(--glow-font-display)' }}>{state.rules.length}</p><p className="mt-2 text-xs leading-5 text-stone-500">Rules constrain scheduling and recommendations before Glow tells you what to do.</p><Link href="/rules" className="mt-4 inline-flex items-center gap-2 text-xs text-rose-700">Edit rules <ArrowRight size={12}/></Link></Surface>
          <Surface className="p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Glow Notices</p><p className="mt-3 text-4xl text-stone-900" style={{ fontFamily:'var(--glow-font-display)' }}>{attentionProjects.length + maintenance.filter((x)=>x.urgency==='soon').length}</p><p className="mt-2 text-xs leading-5 text-stone-500">Potential issues are surfaced as evidence, not alarms. Review observations before accepting changes.</p><Link href="/observations" className="mt-4 inline-flex items-center gap-2 text-xs text-rose-700">Open notices <ArrowRight size={12}/></Link></Surface>
        </div>
      </div>
    </AppShell>
  );
}
