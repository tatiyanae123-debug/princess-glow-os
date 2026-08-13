import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { createPersonalRuleAction, deletePersonalRuleAction, setPersonalRuleEnabledAction } from '@/app/actions/adaptive-rules';
import { getPersonalRules } from '@/lib/intelligence/adaptive-rules';
import { ensureAdaptiveDefaults } from '@/lib/intelligence/adaptive-os';
import { ShieldCheck, SlidersHorizontal, Trash2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full rounded-lg border border-[#F1E7E3] px-3.5 py-2.5 text-[12.5px] text-[#2B2420] placeholder:text-[#B5ACA5] focus:border-[#C9727E] focus:outline-none';

export default async function RulesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  let rules;
  try {
    await ensureAdaptiveDefaults(session.user.id);
    rules = await getPersonalRules(session.user.id);
  } catch {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl rounded-[20px] border border-[#F1E7E3] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#2B2420]">Personal Rules Engine needs one-time intelligence activation.</p>
          <p className="mt-2 text-[12px] leading-5 text-[#8A8078]">After activation, Glow can persist your planning and life rules without changing existing routines or data.</p>
          <Link href="/settings/intelligence" className="mt-4 inline-block rounded-full bg-[#2B2420] px-4 py-2.5 text-[12px] text-white">Activate Glow Intelligence →</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-5">
        <header>
          <div className="flex items-center gap-2 text-[#5A6E52]"><ShieldCheck size={18} /><p className="text-[11px] font-semibold uppercase tracking-[.16em]">Personal Rules Engine</p></div>
          <h1 className="glow-display mt-2 text-[38px] leading-none text-[#2B2420] sm:text-[42px]">Teach Glow how your life works.</h1>
          <p className="mt-2 max-w-3xl text-[13px] leading-6 text-[#8A8078]">Rules are permanent preferences that planning, recommendations, Life Modes, and automation can obey before suggesting anything.</p>
        </header>
        <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
          <section className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center gap-2"><SlidersHorizontal size={15} className="text-[#C9727E]" /><h2 className="text-[13px] font-semibold text-[#2B2420]">Add a rule</h2></div>
            <form action={createPersonalRuleAction} className="mt-4 space-y-3">
              <input name="title" required placeholder="Never schedule workouts after 8 PM" className={fieldClass} />
              <div className="grid grid-cols-2 gap-2">
                <select name="ruleType" className={fieldClass}>
                  <option value="scheduling">Scheduling</option>
                  <option value="health">Health</option>
                  <option value="beauty">Beauty</option>
                  <option value="fitness">Fitness</option>
                  <option value="work">Work</option>
                  <option value="time">Time</option>
                  <option value="general">General</option>
                </select>
                <input name="priority" type="number" min={1} max={100} defaultValue={70} className={fieldClass} />
              </div>
              <textarea name="conditionText" rows={3} placeholder="When does this rule apply?" className={fieldClass} />
              <textarea name="effectText" rows={3} placeholder="What should Glow do?" className={fieldClass} />
              <button type="submit" className="w-full rounded-full bg-[#2B2420] py-2.5 text-[12px] font-medium text-white">Save Rule</button>
            </form>
          </section>
          <section className="rounded-[20px] border border-[#F1E7E3] bg-white">
            <div className="flex items-center justify-between border-b border-[#F1E7E3] px-5 py-4"><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Rules Glow Must Respect</p><span className="text-[12px] text-[#B5ACA5]">{rules.filter((rule) => rule.enabled).length} active</span></div>
            <div className="divide-y divide-[#F1E7E3]">
              {rules.map((rule) => (
                <div key={rule.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[13px] font-medium text-[#2B2420]">{rule.title}</p>
                      <p className="mt-1 text-[10.5px] uppercase tracking-[.08em] text-[#B5ACA5]">{rule.ruleType} · priority {rule.priority} · {rule.source}</p>
                      {typeof rule.effect === 'object' && rule.effect && 'description' in rule.effect && rule.effect.description ? <p className="mt-2 text-[11.5px] leading-5 text-[#8A8078]">{String(rule.effect.description)}</p> : null}
                    </div>
                    <div className="flex gap-2">
                      <form action={setPersonalRuleEnabledAction.bind(null, rule.id, !rule.enabled)}>
                        <button type="submit" className={`rounded-full px-3 py-1.5 text-[10.5px] font-medium ${rule.enabled ? 'bg-[#E4EBDD] text-[#5A6E52]' : 'bg-[#FDF8F6] text-[#8A8078]'}`}>{rule.enabled ? 'On' : 'Off'}</button>
                      </form>
                      {rule.source === 'user' ? (
                        <form action={deletePersonalRuleAction.bind(null, rule.id)}>
                          <button type="submit" aria-label={`Delete ${rule.title}`} className="rounded-full border border-[#F1E7E3] p-1.5 text-[#B5ACA5] hover:text-[#B15A68]"><Trash2 size={12} /></button>
                        </form>
                      ) : null}
                    </div>
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
