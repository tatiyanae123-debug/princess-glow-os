import type { PersonalEvent, PersonalTask } from '@/lib/personal-context/types';

export type DayBlockKey = 'morning' | 'between' | 'evening' | 'night';

const priorityScore: Record<PersonalTask['priority'], number> = {
  low: 8,
  medium: 18,
  high: 34,
  urgent: 55,
};

export function estimateTaskMinutes(task: PersonalTask) {
  const text = [task.title, task.description ?? ''].join(' ');
  const match = text.match(/\b(\d{1,3})\s*(?:min|mins|minute|minutes)\b/i);
  if (match) return Math.min(180, Math.max(5, Number(match[1])));
  if (/call|reply|email|text|confirm|book|schedule/i.test(text)) return 10;
  if (/research|prepare|review|apply|application|design|build|write|study/i.test(text)) return 30;
  return 20;
}

function dueScore(task: PersonalTask, now: Date) {
  if (!task.dueDate) return 0;
  const deltaHours = (new Date(task.dueDate).getTime() - now.getTime()) / 3_600_000;
  if (deltaHours < 0) return 45;
  if (deltaHours <= 6) return 35;
  if (deltaHours <= 24) return 26;
  if (deltaHours <= 72) return 14;
  return 4;
}

function businessHoursScore(task: PersonalTask, now: Date) {
  const text = [task.title, task.description ?? ''].join(' ');
  if (!/call|office|doctor|dermat|bank|pharmacy|prescription|appointment|customer service/i.test(text)) return 0;
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour >= 9 && hour < 16.5) return 20;
  if (hour >= 16.5 && hour < 18) return 10;
  return -8;
}

function energyFitScore(task: PersonalTask, energy: string | null | undefined) {
  if (!energy) return 0;
  const low = /low|tired|exhausted|poor/i.test(energy);
  const text = [task.title, task.description ?? ''].join(' ');
  const light = /call|reply|email|text|book|schedule|pick up|return|tidy/i.test(text);
  const deep = /research|study|design|build|write|application|prepare/i.test(text);
  if (low && light) return 8;
  if (low && deep) return -8;
  return 0;
}

function timeFitScore(task: PersonalTask, availableMinutes: number | null) {
  if (availableMinutes === null) return 0;
  const estimate = estimateTaskMinutes(task);
  if (estimate <= availableMinutes) return 12;
  return -Math.min(24, Math.ceil((estimate - availableMinutes) / 5) * 3);
}

export function rankTasks(args: {
  tasks: PersonalTask[];
  now: Date;
  nextEvent: PersonalEvent | null;
  energy?: string | null;
}) {
  const { tasks, now, nextEvent, energy } = args;
  const availableMinutes = nextEvent
    ? Math.max(0, Math.floor((new Date(nextEvent.startAt).getTime() - now.getTime()) / 60_000) - 30)
    : null;

  return tasks
    .map((task) => {
      let score = priorityScore[task.priority] + dueScore(task, now);
      if (task.status === 'in_progress') score += 20;
      score += businessHoursScore(task, now);
      score += energyFitScore(task, energy);
      score += timeFitScore(task, availableMinutes);
      const reasons: string[] = [];
      if (task.status === 'in_progress') reasons.push('already in progress');
      if (task.priority === 'urgent') reasons.push('marked urgent');
      else if (task.priority === 'high') reasons.push('high priority');
      if (task.dueDate) {
        const delta = new Date(task.dueDate).getTime() - now.getTime();
        if (delta < 0) reasons.push('overdue');
        else if (delta <= 24 * 3_600_000) reasons.push('due within 24 hours');
      }
      if (availableMinutes !== null && estimateTaskMinutes(task) <= availableMinutes) reasons.push('fits before your next event');
      if (!reasons.length) reasons.push('best fit among your open priorities');
      return { task, score, estimateMinutes: estimateTaskMinutes(task), reasons };
    })
    .sort((a, b) => b.score - a.score);
}

export function inferredLifeLane(task: PersonalTask): 'Career' | 'Body' | 'Life' {
  const text = [task.title, task.description ?? ''].join(' ');
  if (/job|career|interview|resume|application|recruit|work|client|portfolio/i.test(text)) return 'Career';
  if (/workout|gym|walk|pilates|fitness|glute|upper body|cardio|core|steps|stretch/i.test(text)) return 'Body';
  return 'Life';
}

export function chooseBigThree(tasks: PersonalTask[], now: Date, nextEvent: PersonalEvent | null, energy?: string | null) {
  const ranked = rankTasks({ tasks, now, nextEvent, energy });
  const lanes: Array<'Career' | 'Body' | 'Life'> = ['Career', 'Body', 'Life'];
  const used = new Set<string>();
  const result: Array<{ label: 'Career' | 'Body' | 'Life'; task: PersonalTask | null; reason: string }> = [];

  for (const lane of lanes) {
    const pick = ranked.find((item) => !used.has(item.task.id) && inferredLifeLane(item.task) === lane);
    if (pick) {
      used.add(pick.task.id);
      result.push({ label: lane, task: pick.task, reason: pick.reasons[0] });
    } else {
      result.push({ label: lane, task: null, reason: 'No connected priority selected' });
    }
  }

  for (const slot of result) {
    if (slot.task) continue;
    const pick = ranked.find((item) => !used.has(item.task.id));
    if (pick) {
      used.add(pick.task.id);
      slot.task = pick.task;
      slot.reason = pick.reasons[0];
    }
  }
  return result;
}

export function dayProgress(tasks: PersonalTask[], now: Date) {
  const day = now.toLocaleDateString('en-CA');
  const relevant = tasks.filter((task) => {
    if (task.status === 'cancelled') return false;
    const dueDay = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-CA') : null;
    const completedDay = task.completedAt ? new Date(task.completedAt).toLocaleDateString('en-CA') : null;
    return dueDay === day || completedDay === day;
  });
  const completed = relevant.filter((task) => task.status === 'done').length;
  return { completed, total: relevant.length };
}
