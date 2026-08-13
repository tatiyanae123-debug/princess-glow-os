import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { taskDependencies } from '@/db/schema/adaptive-os';
import { createDependencyAction, deleteDependencyAction } from '@/app/actions/dependencies';
import { CheckCircle2, Link2, LockKeyhole, Trash2 } from 'lucide-react';

type TaskLite = { id: string; title: string; status: string };
const fieldClass = 'w-full rounded-lg border border-[#F1E7E3] bg-white px-3 py-2.5 text-[12px] text-[#2B2420] focus:border-[#C9727E] focus:outline-none';

export async function TaskDependencyPanel({ userId, tasks }: { userId: string; tasks: TaskLite[] }) {
  let dependencies;
  try {
    dependencies = await db.select().from(taskDependencies).where(eq(taskDependencies.userId, userId));
  } catch {
    return (
      <section className="rounded-[18px] border border-[#F1E8D9] bg-[#FDF6F1] p-4">
        <p className="text-[12px] font-medium text-[#9A7A3D]">Dependency Engine is ready after intelligence activation.</p>
        <a href="/settings/intelligence" className="mt-2 inline-block text-[11px] font-medium text-[#9A7A3D]">Activate intelligence →</a>
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
    <section className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1E7E3] px-4 py-3">
        <div className="flex items-center gap-2">
          <Link2 size={13} className="text-[#C9727E]" />
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Dependency Engine</p>
            <p className="mt-0.5 text-[10.5px] text-[#B5ACA5]">Blocked work stays visible without pretending it is ready.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 text-[10.5px]">
          <span className="rounded-full bg-[#E4EBDD] px-2.5 py-1 text-[#5A6E52]">{readyTasks.length} ready</span>
          <span className="rounded-full bg-[#FBE4E8] px-2.5 py-1 text-[#B15A68]">{blockedTasks.length} blocked</span>
          <span className="rounded-full bg-[#FDF8F6] px-2.5 py-1 text-[#8A8078]">{dependencies.length} link{dependencies.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[.72fr_1.28fr]">
        <div className="space-y-3">
          <form action={createDependencyAction} className="space-y-2 rounded-[14px] bg-[#FDF8F6] p-3">
            <p className="text-[11px] font-medium text-[#4A4440]">Define what must happen first.</p>
            <select name="predecessorId" required className={fieldClass}>
              <option value="">First task…</option>
              {open.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
            </select>
            <select name="successorId" required className={fieldClass}>
              <option value="">Then unlock…</option>
              {open.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
            </select>
            <select name="dependencyType" className={fieldClass}>
              <option value="blocks">Blocks</option>
              <option value="precedes">Precedes</option>
              <option value="requires">Requires</option>
            </select>
            <button type="submit" disabled={open.length < 2} className="w-full rounded-full bg-[#2B2420] py-2.5 text-[11.5px] font-medium text-white disabled:opacity-40">Connect tasks</button>
            <p className="text-[10px] leading-4 text-[#B5ACA5]">Glow rejects self-links, duplicate links, direct cycles, and task IDs that do not belong to the signed-in user.</p>
          </form>

          <div className="rounded-[14px] border border-[#F1E7E3] bg-white p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={12} className="text-[#5A6E52]" />
              <p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Ready next</p>
            </div>
            <div className="mt-2 space-y-1.5">
              {readyTasks.slice(0, 4).map((task) => (
                <p key={task.id} className="rounded-[10px] bg-[#FDF8F6] px-2.5 py-2 text-[11.5px] text-[#4A4440]">{task.title}</p>
              ))}
              {readyTasks.length === 0 ? <p className="text-[11px] leading-4 text-[#8A8078]">No open task is currently dependency-free.</p> : null}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {blockedTasks.length ? (
            <div className="rounded-[14px] border border-[#F1E0D9] bg-[#FDF3F2] p-3">
              <div className="flex items-center gap-2">
                <LockKeyhole size={12} className="text-[#B15A68]" />
                <p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A5A56]">Blocked work</p>
              </div>
              <div className="mt-2 space-y-2">
                {blockedTasks.map((task) => (
                  <div key={task.id} className="rounded-[12px] border border-[#F1E7E3] bg-white p-3">
                    <p className="text-[12px] font-medium text-[#2B2420]">{task.title}</p>
                    <p className="mt-1 text-[10.5px] leading-4 text-[#8A8078]">Waiting on: {blockersFor(task.id).join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            {dependencies.length ? dependencies.map((dependency) => (
              <div key={dependency.id} className="flex items-center gap-2 rounded-[14px] border border-[#F1E7E3] bg-white p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-[#2B2420]">{names.get(dependency.predecessorId) ?? 'Task'}</p>
                  <p className="my-1 text-[10px] uppercase tracking-[.08em] text-[#B5ACA5]">{dependency.dependencyType} ↓</p>
                  <p className="truncate text-[12px] text-[#4A4440]">{names.get(dependency.successorId) ?? 'Task'}</p>
                </div>
                <form action={deleteDependencyAction.bind(null, dependency.id)}>
                  <button type="submit" aria-label="Remove dependency" className="rounded-full border border-[#F1E7E3] p-2 text-[#8A8078] hover:bg-[#FDF8F6]"><Trash2 size={11} /></button>
                </form>
              </div>
            )) : (
              <p className="rounded-[14px] border border-dashed border-[#F1E7E3] p-5 text-center text-[11.5px] leading-4 text-[#8A8078]">No dependencies yet. Connect tasks to reveal the next meaningful action instead of showing an overwhelming project list.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
