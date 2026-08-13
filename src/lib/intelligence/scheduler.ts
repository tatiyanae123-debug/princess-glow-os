import type { Recommendation, ScheduleProposal } from './domain';
import { getGlowDayMode, type GlowDayMode } from '@/lib/day-mode';

function overlaps(start: Date, end: Date, fixed: { startAt: Date; endAt: Date | null }[]) {
  return fixed.some((item) => {
    const fixedEnd = item.endAt ?? new Date(item.startAt.getTime() + 60 * 60000);
    return start < fixedEnd && end > item.startAt;
  });
}

export function buildScheduleProposal(input: {
  recommendations: Recommendation[];
  commitments: { id: string; title: string; startAt: Date; endAt: Date | null }[];
  now?: Date;
  dayEnd?: Date;
  mode?: GlowDayMode;
}): ScheduleProposal {
  const now = input.now ?? new Date();
  const dayEnd = input.dayEnd ?? new Date(new Date(now).setHours(22, 0, 0, 0));
  const mode = input.mode ?? 'productive';
  const profile = getGlowDayMode(mode);
  const ranked = input.recommendations.slice(0, profile.maxSuggestions);
  const fixed = [...input.commitments].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const suggestions: ScheduleProposal['suggestions'] = [];

  if (mode === 'clear-schedule') {
    return { id: crypto.randomUUID(), mode, generatedAt: now, fixedCommitments: fixed, suggestions };
  }

  let cursor = new Date(Math.max(now.getTime(), new Date(new Date(now).setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0)).getTime()));

  for (const recommendation of ranked) {
    const duration = Math.max(10, Math.min(profile.maxBlockMinutes, recommendation.estimatedMinutes));
    let attempts = 0;
    let start = new Date(cursor);
    let end = new Date(start.getTime() + duration * 60000);

    while ((overlaps(start, end, fixed) || overlaps(start, end, suggestions)) && attempts < 64) {
      start = new Date(start.getTime() + 15 * 60000);
      end = new Date(start.getTime() + duration * 60000);
      attempts += 1;
    }

    if (end > dayEnd) continue;
    suggestions.push({ ...recommendation, startAt: start, endAt: end });
    cursor = new Date(end.getTime() + profile.bufferMinutes * 60000);
  }

  return { id: crypto.randomUUID(), mode, generatedAt: now, fixedCommitments: fixed, suggestions };
}
