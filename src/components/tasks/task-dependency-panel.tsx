import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { taskDependencies } from '@/db/schema/adaptive-os';
import { createDependencyAction, deleteDependencyAction } from '@/app/actions/dependencies';
import { CheckCircle2, Link2, LockKeyhole, Trash2 } from 'lucide-react';

type TaskLite = { id: string; title: string; status: string };

export async function TaskDependencyPanel({ userId, tasks }: { userId: string; tasks: TaskLite[] }) {
  let dependencies;
  try {
    dependencies = await db.select().from(taskDependencies).where(eq(taskDependencies.userId, userId));
  } catch {
    return (
      <section className="rounded-[18px] border border-amber-200 bg-amber-50/65 p-4">
        <p className="text-[9px] font-medium text-amber-900">Dependency Engine is ready after intelligence activation.</p>
        <a href="/settings/intelligence" className="mt-2 inline-block text-[8px] text-amber-800">Activate intelligence →</a>
      </section>
    );
  }

  const open = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const names = new Map(tasks.map((task) => [task.id, task.title]));
  const statuses = new Map(tasks.map((task) => [task.id, task.status]));
  const isComplete = (taskId: string) => {
    const status = statuses.get(taskId);
    return status === 'done' || status === 'cancelled';
  };

  const activeDependencies = dependencies.filter(
    (dependency) => !isComplete(dependency.successorId) && !isComplete(dependency.predecessorId),
  );
  const blockedIds = new Set(activeDependencies.map((dependency) => dependency.successorId));
  const readyTasks = open.filter((task) => !blockedIds.has(task.id));
  const blockedTasks = open.filter((task) => blockedIds.has(task.id));
  const blockersFor = (taskId: string) =>
    activeDependencies
      .filter((dependency) => dependency.successorId === taskId)
      .map((dependency) => names.get(dependency.predecessorId) ?? 'A prerequisite task');

  return (
    <section className="editorial-surface overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eadfd6] px-4 py-3">
        <div className="flex items-center gap-2">
          <Link2 size={13} className="text-[#a46b74]" />
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[.16em] text-[#745f58]">Dependency Engine</p>
            <p className="mt-0.5 text-[7px] text-[#9a827a]">Blocked work stays visible without pretending it is ready.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[7px]">
          <span className="rounded-full bg-[#e8eee4] px-2 py-1 text-[#667361]">{readyTasks.length} ready</span>
          <span className="rounded-full bg-[#f2dcde] px-2 py-1 text-[#8e5d64]">{blockedTasks.length} blocked</span>
          <span className="rounded-full bg-[#f0e9e3] px-2 py-1 text-[#76655e]">{dependencies.length} link{dependencies.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[.72fr_1.28fr]">
        <div className="space-y-3">
          <form action={createDependencyAction} className="space-y-2 rounded-[14px] bg-[#faf5f1] p-3">
            <p className="text-[8px] font-medium text-[#66534d]">Define what must happen first.</p>
            <select name="predecessorId" required className="w-full rounded-lg border border-[#e1d4cc] bg-white px-3 py-2 text-[8px]">
              <option value="">First task…</option>
              {open.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
            </select>
            <select name="successorId" required className="w-full rounded-lg border border-[#e1d4cc] bg-white px-3 py-2 text-[8px]">
              <option value="">Then unlock…</option>
              {open.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
            </select>
            <select name="dependencyType" className="w-full rounded-lg border border-[#e1d4cc] bg-white px-3 py-2 text-[8px]">
              <option value="blocks">Blocks</option>
              <option value="precedes">Precedes</option>
              <option value="requires">Requires</option>
            </select>
            <button type="submit" disabled={open.length < 2} className="w-full rounded-lg bg-[#40352f] py-2 text-[8px] text-white disabled:opacity-40">Connect tasks</button>
            <p className="text-[7px] leading-4 text-[#9a847c]">Glow rejects self-links, duplicate links, direct cycles, and task IDs that do not belong to the signed-in user.</p>
          </form>

          <div className="rounded-[14px] border border-[#e7ddd6] bg-white/60 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-[#71816c]" />
              <p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[#6d625a]">Ready next</p>
            </div>
            <div className="mt-2 space-y-1.5">
              {readyTasks.slice(0, 4).map((task) => (
                <p key={task.id} className="rounded-[10px] bg-[#f7f4ef] px-2.5 py-2 text-[8px] text-[#5c504a]">{task.title}</p>
              ))}
              {readyTasks.length === 0 ? <p className="text-[8px] leading-4 text-[#8d7972]">No open task is currently dependency-free.</p> : null}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {blockedTasks.length ? (
            <div className="rounded-[14px] border border-[#ead8da] bg-[#fcf4f4] p-3">
              <div className="flex items-center gap-2">
                <LockKeyhole size={12} className="text-[#9b6670]" />
                <p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[#805f64]">Blocked work</p>
              </div>
              <div className="mt-2 space-y-2">
                {blockedTasks.map((task) => (
                  <div key={task.id} className="rounded-[11px] border border-[#eddfe0] bg-white/75 p-2.5">
                    <p className="text-[9px] font-medium text-[#4b3d37]">{task.title}</p>
                    <p className="mt-1 text-[7px] leading-4 text-[#8c7478]">Waiting on: {blockersFor(task.id).join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            {dependencies.length ? dependencies.map((dependency) => (
              <div key={dependency.id} className="flex items-center gap-2 rounded-[12px] border border-[#eadfd7] bg-white/65 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[9px] font-medium text-[#4b3d37]">{names.get(dependency.predecessorId) ?? 'Task'}</p>
                  <p className="my-1 text-[7px] uppercase tracking-[.12em] text-[#a1847d]">{dependency.dependencyType} ↓</p>
                  <p className="truncate text-[9px] text-[#725f58]">{names.get(dependency.successorId) ?? 'Task'}</p>
                </div>
                <form action={deleteDependencyAction.bind(null, dependency.id)}>
                  <button type="submit" aria-label="Remove dependency" className="rounded-full border border-[#e4d7cf] p-2 text-[#a0887f]"><Trash2 size={11} /></button>
                </form>
              </div>
            )) : (
              <p className="rounded-[12px] border border-dashed border-[#ddd0c8] p-5 text-center text-[8px] leading-4 text-[#8d7972]">No dependencies yet. Connect tasks to reveal the next meaningful action instead of showing an overwhelming project list.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
