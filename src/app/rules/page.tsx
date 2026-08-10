import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { createPersonalRuleAction, deletePersonalRuleAction, setPersonalRuleEnabledAction } from '@/app/actions/adaptive-rules';
import { getPersonalRules } from '@/lib/intelligence/adaptive-rules';
import { ensureAdaptiveDefaults } from '@/lib/intelligence/adaptive-os';
import { ShieldCheck, SlidersHorizontal, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function RulesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  await ensureAdaptiveDefaults(session.user.id);
  const rules = await getPersonalRules(session.user.id);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <div className="flex items-center gap-2 text-emerald-700"><ShieldCheck size={18} /><p className="text-[10px] font-bold uppercase tracking-[.2em]">Personal Rules Engine</p></div>
          <h1 className="mt-2 text-4xl tracking-[-.04em] text-stone-950" style={{ fontFamily: 'var(--glow-font-display)' }}>Teach Glow how your life works.</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">Rules are permanent preferences that planning, recommendations, Life Modes, and future automation can obey before suggesting anything.</p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
          <section className="rounded-[24px] border border-stone-200/70 bg-white/75 p-5 shadow-sm">
            <div className="flex items-center gap-2"><SlidersHorizontal size={15} className="text-rose-600" /><h2 className="text-sm font-semibold text-stone-900">Add a rule</h2></div>
            <form action={createPersonalRuleAction} className="mt-4 space-y-3">
              <input name="title" required placeholder="Never schedule workouts after 8 PM" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm" />
              <div className="grid grid-cols-2 gap-2"><select name="ruleType" className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm"><option value="scheduling">Scheduling</option><option value="health">Health</option><option value="beauty">Beauty</option><option value="fitness">Fitness</option><option value="work">Work</option><option value="time">Time</option><option value="general">General</option></select><input name="priority" type="number" min={1} max={100} defaultValue={70} className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm" /></div>
              <textarea name="conditionText" rows={3} placeholder="When does this rule apply?" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm" />
              <textarea name="effectText" rows={3} placeholder="What should Glow do?" className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm" />
              <button type="submit" className="w-full rounded-xl bg-stone-900 py-2.5 text-xs text-white">Save Rule</button>
            </form>
          </section>

          <section className="rounded-[24px] border border-stone-200/70 bg-white/75 shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-200/70 px-5 py-4"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Rules Glow Must Respect</p><span className="text-xs text-stone-400">{rules.filter((rule) => rule.enabled).length} active</span></div>
            <div className="divide-y divide-stone-100">
              {rules.map((rule) => (
                <div key={rule.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div><p className="text-sm font-medium text-stone-900">{rule.title}</p><p className="mt-1 text-[10px] uppercase tracking-[.12em] text-stone-400">{rule.ruleType} · priority {rule.priority} · {rule.source}</p>{typeof rule.effect === 'object' && rule.effect && 'description' in rule.effect && rule.effect.description ? <p className="mt-2 text-xs leading-5 text-stone-500">{String(rule.effect.description)}</p> : null}</div>
                    <div className="flex gap-2"><form action={setPersonalRuleEnabledAction.bind(null, rule.id, !rule.enabled)}><button type="submit" className={`rounded-full px-3 py-1.5 text-[10px] font-medium ${rule.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-500'}`}>{rule.enabled ? 'On' : 'Off'}</button></form>{rule.source === 'user' ? <form action={deletePersonalRuleAction.bind(null, rule.id)}><button type="submit" aria-label={`Delete ${rule.title}`} className="rounded-full border border-stone-200 p-1.5 text-stone-400 hover:text-rose-600"><Trash2 size={12} /></button></form> : null}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
