'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlarmClock,
  BarChart3,
  CalendarClock,
  Check,
  ChevronRight,
  CirclePause,
  Clock3,
  FlaskConical,
  Flower2,
  Layers3,
  Leaf,
  Mic2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Sprout,
  Target,
  WandSparkles,
  X,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { HabitManager } from '@/components/habits/habit-manager';
import {
  completeHabitIntelligenceAction,
  createHabitExperimentAction,
  createHabitStackAction,
  createHabitTriggerAction,
  intentionalSkipHabitAction,
  upsertHabitProfileAction,
} from '@/app/actions/advanced-habits';
import type {
  CalendarEvent,
  Goal,
  Habit,
  HabitCompletionDetail,
  HabitExperiment,
  HabitLog,
  HabitProfile,
  HabitSourceLink,
  HabitStack,
  HabitTimingStat,
  HabitTrigger,
  Routine,
} from '@/lib/types';

type Energy = 'high' | 'normal' | 'low' | 'exhausted';
type Version = 'full' | 'quick' | 'minimum';
type Band = 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
type LocalProfile = {
  area: string;
  timeBand: Band;
  importanceTier: 'essential' | 'growth' | 'nice';
  fullLabel: string;
  fullMinutes: number;
  quickLabel: string;
  quickMinutes: number;
  minimumLabel: string;
  minimumMinutes: number;
  difficulty: number;
  contextMode: string;
  identityStatement: string | null;
  whyItMatters: string | null;
  preferredAnchor: string | null;
  weeklyTarget: number | null;
  rollingGoalType: string;
  rollingTarget: number | null;
  focus: boolean;
  pausedUntil: Date | null;
  pausedIndefinitely: boolean;
  seasonalStartMonth: number | null;
  seasonalEndMonth: number | null;
  progressiveLevel: number;
};

type SpeechRecognitionEventLike = { results: ArrayLike<{ 0: { transcript: string } }> };
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const BANDS: Array<{ key: Band; label: string; time: string; tone: string }> = [
  { key: 'morning', label: 'Morning', time: '5–10 AM', tone: 'bg-[#FBF0D8]' },
  { key: 'afternoon', label: 'Midday', time: '10 AM–4 PM', tone: 'bg-[#E8EFE2]' },
  { key: 'evening', label: 'Evening', time: '4–8:30 PM', tone: 'bg-[#F6E5DC]' },
  { key: 'night', label: 'Night', time: '8:30–11 PM', tone: 'bg-[#ECE7F4]' },
];
const TIME_OPTIONS = [2, 5, 10, 20];
const ENERGY_OPTIONS: Energy[] = ['high', 'normal', 'low', 'exhausted'];

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function addDaysKey(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return localDateKey(date);
}
function currentBand(date: Date): Exclude<Band, 'anytime'> {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour < 10) return 'morning';
  if (hour < 16) return 'afternoon';
  if (hour < 20.5) return 'evening';
  return 'night';
}
function inferredArea(name: string) {
  if (/workout|walk|movement|stretch|steps|exercise/i.test(name)) return 'Body';
  if (/water|protein|sleep|med|supplement|vitamin|eat|meal/i.test(name)) return 'Body';
  if (/skin|hair|beauty|brush|teeth|hygiene/i.test(name)) return 'Beauty';
  if (/clean|laundry|room|kitchen|home|reset/i.test(name)) return 'Home';
  if (/read|journal|brain|meditat|plan|learn|study/i.test(name)) return 'Mind';
  return 'Life';
}
function inferredBand(name: string): Band {
  if (/morning|am |breakfast|wake|first thing/i.test(name)) return 'morning';
  if (/night|pm |bed|tomorrow|evening|skincare/i.test(name)) return 'night';
  if (/lunch|midday/i.test(name)) return 'afternoon';
  return 'anytime';
}
function inferredImportance(name: string): 'essential' | 'growth' | 'nice' {
  if (/med|medicine|water|brush|teeth|hygiene|eat|protein|sleep/i.test(name)) return 'essential';
  if (/pinterest|optional|extra/i.test(name)) return 'nice';
  return 'growth';
}
function profileFor(habit: Habit, profiles: HabitProfile[]): LocalProfile {
  const found = profiles.find((item) => item.habitId === habit.id);
  const fullMinutes = found?.fullMinutes ?? (/workout|exercise/i.test(habit.name) ? 30 : /read|clean|walk|plan/i.test(habit.name) ? 15 : 8);
  return {
    area: found?.area ?? inferredArea(habit.name),
    timeBand: (found?.timeBand as Band | undefined) ?? inferredBand(habit.name),
    importanceTier: (found?.importanceTier as LocalProfile['importanceTier'] | undefined) ?? inferredImportance(habit.name),
    fullLabel: found?.fullLabel ?? habit.name,
    fullMinutes,
    quickLabel: found?.quickLabel ?? `Quick ${habit.name}`,
    quickMinutes: found?.quickMinutes ?? Math.max(2, Math.round(fullMinutes * 0.45)),
    minimumLabel: found?.minimumLabel ?? `Minimum ${habit.name}`,
    minimumMinutes: found?.minimumMinutes ?? Math.max(1, Math.min(3, Math.round(fullMinutes * 0.2))),
    difficulty: found?.difficulty ?? 3,
    contextMode: found?.contextMode ?? 'anywhere',
    identityStatement: found?.identityStatement ?? null,
    whyItMatters: found?.whyItMatters ?? null,
    preferredAnchor: found?.preferredAnchor ?? null,
    weeklyTarget: found?.weeklyTarget ?? (habit.frequency === 'weekly' ? Math.max(1, habit.targetCount) : null),
    rollingGoalType: found?.rollingGoalType ?? (habit.targetCount > 1 ? 'quantity' : 'days'),
    rollingTarget: found?.rollingTarget ?? (habit.targetCount > 1 ? habit.targetCount : null),
    focus: found?.focus ?? false,
    pausedUntil: found?.pausedUntil ?? null,
    pausedIndefinitely: found?.pausedIndefinitely ?? false,
    seasonalStartMonth: found?.seasonalStartMonth ?? null,
    seasonalEndMonth: found?.seasonalEndMonth ?? null,
    progressiveLevel: found?.progressiveLevel ?? 1,
  };
}
function isPaused(profile: LocalProfile, now: Date) {
  if (profile.pausedIndefinitely) return true;
  if (profile.pausedUntil && profile.pausedUntil.getTime() > now.getTime()) return true;
  if (profile.seasonalStartMonth && profile.seasonalEndMonth) {
    const month = now.getMonth() + 1;
    const start = profile.seasonalStartMonth;
    const end = profile.seasonalEndMonth;
    const active = start <= end ? month >= start && month <= end : month >= start || month <= end;
    if (!active) return true;
  }
  return false;
}
function scheduledToday(habit: Habit, profile: LocalProfile, now: Date) {
  if (isPaused(profile, now)) return false;
  const day = now.getDay();
  if (habit.frequency === 'weekdays') return day >= 1 && day <= 5;
  if (habit.frequency === 'weekends') return day === 0 || day === 6;
  return true;
}
function versionFor(energy: Energy, minutes: number, profile: LocalProfile): Version {
  if (energy === 'exhausted' || minutes <= profile.minimumMinutes) return 'minimum';
  if (energy === 'low' || minutes < profile.fullMinutes || minutes <= profile.quickMinutes) return 'quick';
  return 'full';
}
function versionMinutes(profile: LocalProfile, version: Version) {
  return version === 'full' ? profile.fullMinutes : version === 'quick' ? profile.quickMinutes : profile.minimumMinutes;
}
function versionLabel(profile: LocalProfile, version: Version) {
  return version === 'full' ? profile.fullLabel : version === 'quick' ? profile.quickLabel : profile.minimumLabel;
}
function dominantBand(stat?: HabitTimingStat) {
  if (!stat || stat.sampleCount < 3) return null;
  const values = [
    ['morning', stat.morningCount], ['afternoon', stat.afternoonCount], ['evening', stat.eveningCount], ['night', stat.nightCount],
  ] as const;
  return [...values].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}
function daysAgoKey(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localDateKey(date);
}
function consistencyFor(habitId: string, details: HabitCompletionDetail[], days = 30) {
  const completed = new Set(details.filter((d) => d.habitId === habitId && !d.intentionalSkip && d.dateKey >= daysAgoKey(days - 1)).map((d) => d.dateKey));
  return Math.round((completed.size / days) * 100);
}
function recoveryFor(habitId: string, details: HabitCompletionDetail[], days = 30) {
  const done = new Set(details.filter((d) => d.habitId === habitId && !d.intentionalSkip).map((d) => d.dateKey));
  let recovered = 0;
  for (let day = days - 1; day >= 1; day -= 1) {
    const missed = daysAgoKey(day);
    const next = daysAgoKey(day - 1);
    if (!done.has(missed) && done.has(next)) recovered += 1;
  }
  return recovered;
}
function nextMonday() {
  const date = new Date();
  const days = (8 - date.getDay()) % 7 || 7;
  date.setDate(date.getDate() + days);
  date.setHours(8, 0, 0, 0);
  return date;
}

export function HabitsExperience({
  initialHabits,
  initialLogs,
  profiles: initialProfiles,
  details: initialDetails,
  timingStats,
  triggers: initialTriggers,
  stacks: initialStacks,
  experiments: initialExperiments,
  sourceLinks,
  calendarEvents,
  routines,
  goals,
}: {
  initialHabits: Habit[];
  initialLogs: HabitLog[];
  profiles: HabitProfile[];
  details: HabitCompletionDetail[];
  timingStats: HabitTimingStat[];
  triggers: HabitTrigger[];
  stacks: HabitStack[];
  experiments: HabitExperiment[];
  sourceLinks: HabitSourceLink[];
  calendarEvents: CalendarEvent[];
  routines: Routine[];
  goals: Goal[];
}) {
  const router = useRouter();
  const [logs, setLogs] = useState(initialLogs);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [details, setDetails] = useState(initialDetails);
  const [triggers, setTriggers] = useState(initialTriggers);
  const [stacks, setStacks] = useState(initialStacks);
  const [experiments, setExperiments] = useState(initialExperiments);
  const [energy, setEnergy] = useState<Energy>('normal');
  const [availableMinutes, setAvailableMinutes] = useState(10);
  const [contextMode, setContextMode] = useState('anywhere');
  const [showManager, setShowManager] = useState(false);
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [timerHabitId, setTimerHabitId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInIndex, setCheckInIndex] = useState(0);
  const [voiceListening, setVoiceListening] = useState(false);
  const [isPending, startTransition] = useTransition();
  const speechRef = useRef<SpeechRecognitionLike | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(id);
  }, [notice]);
  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return;
    const id = window.setInterval(() => setTimerSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning, timerSeconds]);
  useEffect(() => {
    if (timerSeconds !== 0 || !timerRunning) return;
    setTimerRunning(false);
    setNotice('Habit timer finished. Mark it complete when the behavior itself is finished.');
  }, [timerRunning, timerSeconds]);
  useEffect(() => () => speechRef.current?.stop(), []);

  const todayKey = localDateKey(now);
  const band = currentBand(now);
  const loggedToday = useMemo(() => new Map(logs.filter((log) => log.loggedDate === todayKey).map((log) => [log.habitId, log])), [logs, todayKey]);
  const detailToday = useMemo(() => new Map(details.filter((detail) => detail.dateKey === todayKey).map((detail) => [detail.habitId, detail])), [details, todayKey]);
  const profileMap = useMemo(() => new Map(initialHabits.map((habit) => [habit.id, profileFor(habit, profiles)])), [initialHabits, profiles]);
  const activeHabits = initialHabits.filter((habit) => scheduledToday(habit, profileMap.get(habit.id)!, now));
  const completedHabits = activeHabits.filter((habit) => loggedToday.has(habit.id));
  const intentionalRest = activeHabits.filter((habit) => detailToday.get(habit.id)?.intentionalSkip);
  const remainingHabits = activeHabits.filter((habit) => !loggedToday.has(habit.id) && !detailToday.get(habit.id)?.intentionalSkip);

  const upcomingEvent = useMemo(() => [...calendarEvents]
    .filter((event) => !event.allDay && event.startAt.getTime() > now.getTime())
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0] ?? null, [calendarEvents, now]);
  const minutesToEvent = upcomingEvent ? Math.max(0, Math.floor((upcomingEvent.startAt.getTime() - now.getTime()) / 60000)) : null;

  function scoreHabit(habit: Habit) {
    const profile = profileMap.get(habit.id)!;
    const timing = timingStats.find((item) => item.habitId === habit.id);
    let score = profile.importanceTier === 'essential' ? 70 : profile.importanceTier === 'growth' ? 40 : 15;
    if (profile.focus) score += 25;
    if (profile.timeBand === band) score += 25;
    else if (profile.timeBand === 'anytime') score += 10;
    if (profile.contextMode !== 'anywhere' && profile.contextMode !== contextMode) score -= 40;
    const version = versionFor(energy, availableMinutes, profile);
    if (versionMinutes(profile, version) <= availableMinutes) score += 12;
    if (dominantBand(timing) === band) score += 8;
    return score;
  }
  const rankedRemaining = [...remainingHabits].sort((a, b) => scoreHabit(b) - scoreHabit(a));
  const bestHabit = rankedRemaining[0] ?? null;
  const bestProfile = bestHabit ? profileMap.get(bestHabit.id)! : null;
  const bestVersion = bestProfile ? versionFor(energy, availableMinutes, bestProfile) : 'minimum';
  const essentialsRemaining = remainingHabits.filter((habit) => profileMap.get(habit.id)?.importanceTier === 'essential');
  const todayEnough = activeHabits.length > 0 && essentialsRemaining.length === 0;

  const groups = useMemo(() => {
    const map = new Map<Band, Habit[]>();
    for (const key of ['morning','afternoon','evening','night'] as Band[]) map.set(key, []);
    for (const habit of activeHabits) {
      const profile = profileMap.get(habit.id)!;
      const key = profile.timeBand === 'anytime' ? band : profile.timeBand;
      map.get(key)?.push(habit);
    }
    return map;
  }, [activeHabits, band, profileMap]);

  const focusHabits = activeHabits.filter((habit) => profileMap.get(habit.id)?.focus).slice(0, 3);
  const weeklyHabits = initialHabits.filter((habit) => profileMap.get(habit.id)?.weeklyTarget);
  const activeExperiments = experiments.filter((experiment) => experiment.status === 'active');
  const averageConsistency = initialHabits.length ? Math.round(initialHabits.reduce((sum, habit) => sum + consistencyFor(habit.id, details), 0) / initialHabits.length) : 0;
  const recoveryCount = initialHabits.reduce((sum, habit) => sum + recoveryFor(habit.id, details), 0);
  const lateRisk = upcomingEvent && minutesToEvent !== null && minutesToEvent <= 120 && remainingHabits.length >= 2;

  function appendCompletion(habit: Habit, result: Awaited<ReturnType<typeof completeHabitIntelligenceAction>>['data']) {
    if (!result) return;
    setLogs((current) => {
      const without = current.filter((log) => !(log.habitId === habit.id && log.loggedDate === todayKey));
      return [result.log, ...without];
    });
    setDetails((current) => [result.detail, ...current.filter((detail) => !(detail.habitId === habit.id && detail.dateKey === todayKey))]);
  }

  function completeHabit(habit: Habit, version: Version, quantity?: number) {
    const profile = profileMap.get(habit.id)!;
    const actualSeconds = timerHabitId === habit.id && timerStartedAt ? Math.max(1, Math.round((Date.now() - timerStartedAt) / 1000)) : versionMinutes(profile, version) * 60;
    startTransition(async () => {
      const result = await completeHabitIntelligenceAction({ habitId: habit.id, dateKey: todayKey, version, actualSeconds, quantity });
      if (!result.data) {
        setNotice(result.error ?? 'Glow could not save that habit.');
        return;
      }
      appendCompletion(habit, result.data);
      setTimerRunning(false);
      setTimerHabitId(null);
      setTimerStartedAt(null);
      setNotice(version === 'minimum' ? 'Habit kept. Minimum counts because you returned to the behavior.' : `${habit.name} saved as ${version}.`);
      router.refresh();
    });
  }

  function restHabit(habit: Habit, reason = 'Intentional rest day') {
    startTransition(async () => {
      const result = await intentionalSkipHabitAction({ habitId: habit.id, dateKey: todayKey, reason });
      if (!result.data) {
        setNotice(result.error ?? 'Glow could not protect this rest day.');
        return;
      }
      setDetails((current) => [result.data, ...current.filter((detail) => !(detail.habitId === habit.id && detail.dateKey === todayKey))]);
      setNotice('Protected rest day. Glow will not treat this as an accidental miss.');
      router.refresh();
    });
  }

  function saveProfile(habit: Habit, patch: Parameters<typeof upsertHabitProfileAction>[1]) {
    startTransition(async () => {
      const result = await upsertHabitProfileAction(habit.id, patch);
      if (!result.data) {
        setNotice(result.error ?? 'Glow could not save that behavior setting.');
        return;
      }
      setProfiles((current) => [result.data, ...current.filter((item) => item.habitId !== habit.id)]);
      setNotice('Habit behavior settings saved across devices.');
      router.refresh();
    });
  }

  function startTimer(habit: Habit, minutes: number) {
    setTimerHabitId(habit.id);
    setTimerSeconds(minutes * 60);
    setTimerStartedAt(Date.now());
    setTimerRunning(true);
    setNotice(`${minutes}-minute ${habit.name} timer started.`);
  }

  function incrementHabit(habit: Habit, delta: number) {
    const current = loggedToday.get(habit.id)?.count ?? 0;
    const next = Math.max(1, current + delta);
    completeHabit(habit, 'full', next);
  }

  function createDefaultStack() {
    const candidates = activeHabits.filter((habit) => {
      const p = profileMap.get(habit.id)!;
      return p.timeBand === band || p.timeBand === 'anytime';
    }).slice(0, 4);
    if (candidates.length < 2) {
      setNotice('Glow needs at least two habits in this time window to create a stack.');
      return;
    }
    startTransition(async () => {
      const result = await createHabitStackAction({ name: `${BANDS.find((item) => item.key === band)?.label ?? 'Current'} Stack`, anchorType: 'time', anchorValue: band, habitIds: candidates.map((habit) => habit.id) });
      if (!result.data) return setNotice(result.error ?? 'Glow could not create the stack.');
      setStacks((current) => [...current, result.data]);
      setNotice('Habit stack created and saved.');
    });
  }

  function createExperiment() {
    if (!bestHabit) return;
    const baselineRate = consistencyFor(bestHabit.id, details) / 100;
    startTransition(async () => {
      const result = await createHabitExperimentAction({ habitId: bestHabit.id, hypothesis: `Making ${bestHabit.name} easier will improve consistency.`, change: `Use the quick or minimum version when energy is low.`, days: 14, baselineRate });
      if (!result.data) return setNotice(result.error ?? 'Glow could not start the experiment.');
      setExperiments((current) => [result.data, ...current]);
      setNotice('Two-week habit experiment started.');
    });
  }

  function addTimeTrigger(habit: Habit) {
    const p = profileMap.get(habit.id)!;
    const value = p.timeBand === 'morning' ? '08:00' : p.timeBand === 'afternoon' ? '13:00' : p.timeBand === 'evening' ? '18:00' : p.timeBand === 'night' ? '20:30' : '12:00';
    startTransition(async () => {
      const result = await createHabitTriggerAction({ habitId: habit.id, triggerType: 'time', triggerValue: value });
      if (!result.data) return setNotice(result.error ?? 'Glow could not add the trigger.');
      setTriggers((current) => [...current, result.data]);
      setNotice(`Trigger saved for ${value}.`);
    });
  }

  function askGlow() {
    const raw = assistantInput.trim();
    const value = raw.toLowerCase();
    if (!value) return;
    const minutes = value.match(/(2|5|10|15|20|30|45|60)\s*(?:min|minute)/)?.[1];
    if (minutes) setAvailableMinutes(Number(minutes));
    if (/exhaust|no energy|bare minimum/.test(value)) setEnergy('exhausted');
    else if (/tired|low energy|easier/.test(value)) setEnergy('low');
    else if (/high energy|lots of energy/.test(value)) setEnergy('high');

    const namedHabit = initialHabits.find((habit) => value.includes(habit.name.toLowerCase()) || habit.name.toLowerCase().split(/\s+/).some((word) => word.length > 4 && value.includes(word)));
    if ((/mark|did|done|drank|completed/.test(value)) && namedHabit) {
      completeHabit(namedHabit, versionFor(energy, Number(minutes ?? availableMinutes), profileMap.get(namedHabit.id)!));
      setAssistantReply(`I marked ${namedHabit.name} complete using the version that fits your current time and energy.`);
      return;
    }
    if (/pause/.test(value) && namedHabit) {
      saveProfile(namedHabit, { pausedUntil: nextMonday(), pausedIndefinitely: false });
      setAssistantReply(`${namedHabit.name} will stay paused until next Monday morning.`);
      return;
    }
    if (/which habit|what.*first|do next/.test(value)) {
      setAssistantReply(bestHabit ? `${bestHabit.name} is the strongest next habit. ${versionLabel(profileMap.get(bestHabit.id)!, bestVersion)} takes about ${versionMinutes(profileMap.get(bestHabit.id)!, bestVersion)} minutes.` : 'Your important habits are covered right now.');
      return;
    }
    if (/why.*miss|keep missing|pattern/.test(value)) {
      const hardest = [...initialHabits].sort((a, b) => consistencyFor(a.id, details) - consistencyFor(b.id, details))[0];
      setAssistantReply(hardest ? `${hardest.name} has the lowest recent consistency at ${consistencyFor(hardest.id, details)}%. Glow treats that as a pattern to redesign, not a failure.` : 'Glow needs more habit history before it can identify a reliable pattern.');
      return;
    }
    if (/simplify|easier tonight|make.*easier/.test(value)) {
      setEnergy('low');
      setAvailableMinutes(5);
      setAssistantReply('I switched the recommendation layer to low-energy, five-minute mode. Quick and Minimum versions now rise to the top.');
      return;
    }
    setAssistantReply(bestHabit ? `Right now, I would protect ${bestHabit.name}. If that feels too heavy, use its ${bestVersion} version. You can also say “mark ${bestHabit.name} done,” “pause ${bestHabit.name} until Monday,” or “I only have 5 minutes.”` : 'Your essentials are covered. You can stop thinking about Habits for now.');
  }

  const checkInHabits = rankedRemaining.slice(0, 6);
  const checkHabit = checkInHabits[checkInIndex] ?? null;
  function advanceCheckIn() { setCheckInIndex((index) => index + 1); }
  function speakCheckIn() {
    if (!checkHabit || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Did you do ${checkHabit.name}? Say yes, not yet, or minimum.`));
  }
  function listenCheckIn() {
    if (!checkHabit) return;
    const browser = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognition) {
      setNotice('Voice check-in is not supported by this browser. The tap controls still work.');
      return;
    }
    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.toLowerCase() ?? '';
      if (/yes|done|did it|complete/.test(transcript)) completeHabit(checkHabit, 'full');
      else if (/minimum|small|quick/.test(transcript)) completeHabit(checkHabit, 'minimum');
      else if (/not yet|no|later/.test(transcript)) advanceCheckIn();
      else setNotice(`Glow heard “${transcript}”. Say yes, not yet, or minimum.`);
    };
    recognition.onerror = () => { setVoiceListening(false); setNotice('Voice check-in stopped because the browser reported a microphone/speech error.'); };
    recognition.onend = () => setVoiceListening(false);
    recognition.start();
    speechRef.current = recognition;
    setVoiceListening(true);
    speakCheckIn();
  }

  const strongestHabit = [...initialHabits].sort((a, b) => consistencyFor(b.id, details) - consistencyFor(a.id, details))[0] ?? null;
  const hardestHabit = [...initialHabits].sort((a, b) => consistencyFor(a.id, details) - consistencyFor(b.id, details))[0] ?? null;
  const learnedTimingHabit = initialHabits.find((habit) => {
    const stat = timingStats.find((item) => item.habitId === habit.id);
    const preferred = profileMap.get(habit.id)?.timeBand;
    const learned = dominantBand(stat);
    return learned && preferred !== 'anytime' && learned !== preferred;
  }) ?? null;

  return (
    <div className="mx-auto max-w-[1380px] space-y-6 pb-28">
      {notice ? <div aria-live="polite" className="fixed left-1/2 top-5 z-[190] max-w-[92vw] -translate-x-1/2 rounded-full border border-[#eaded8] bg-white px-4 py-2.5 text-[11px] text-[#6d5f58] shadow-xl">{notice}</div> : null}

      <section className="overflow-hidden rounded-[32px] border border-[#eee3dd] bg-[radial-gradient(circle_at_top_left,#fffaf5,#f6efe9_58%,#f0ebe7)] p-5 shadow-[0_24px_70px_rgba(83,59,50,.06)] sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[1.12fr_.88fr] lg:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#a56b72]">Habits Right Now · {now.toLocaleDateString('en-US',{weekday:'long'})} · {now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</p>
            <h1 className="glow-display mt-2 text-[42px] leading-[.95] text-[#2B2420] sm:text-[58px]">{todayEnough ? 'You’re doing enough for today.' : 'Your rhythm, not a scorecard.'}</h1>
            <p className="mt-4 max-w-2xl text-[13px] leading-6 text-[#746963]">{activeHabits.length} planned · {completedHabits.length} complete · {remainingHabits.length} still worth considering · {intentionalRest.length} intentional rest</p>
            {bestHabit && bestProfile ? <div className="mt-6 rounded-[24px] border border-white/80 bg-white/72 p-5 backdrop-blur"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#a76b74]">Best next habit</p><div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h2 className="glow-display text-[28px] text-[#2B2420]">{bestHabit.name}</h2><p className="mt-1 text-[11px] text-[#81756e]">{versionLabel(bestProfile, bestVersion)} · {versionMinutes(bestProfile, bestVersion)} min · {bestProfile.importanceTier === 'essential' ? 'Non-negotiable' : bestProfile.focus ? 'Weekly focus' : 'Worth doing'}</p>{upcomingEvent ? <p className="mt-1 text-[10px] text-[#9a8e87]">{minutesToEvent! >= versionMinutes(bestProfile,bestVersion) ? `Fits before ${upcomingEvent.title}` : `${upcomingEvent.title} is close. Glow recommends a smaller version.`}</p> : null}</div><div className="flex flex-wrap gap-2"><button type="button" disabled={isPending} onClick={() => completeHabit(bestHabit,bestVersion)} className="rounded-full bg-[#2B2420] px-5 py-3 text-[11px] font-semibold text-white disabled:opacity-50"><Check className="mr-1 inline" size={13}/>Start / Complete</button><button type="button" disabled={isPending} onClick={() => completeHabit(bestHabit,'quick')} className="rounded-full border border-[#dfd2cb] bg-white px-4 py-3 text-[11px] text-[#625650]">Quick Version</button><button type="button" disabled={isPending} onClick={() => restHabit(bestHabit)} className="rounded-full border border-[#dfd2cb] bg-white px-4 py-3 text-[11px] text-[#625650]">Not Tonight</button></div></div></div> : <div className="mt-6 rounded-[24px] border border-[#e5ddd7] bg-white/70 p-5"><p className="glow-display text-[23px] text-[#2B2420]">Your essentials are covered.</p><p className="mt-2 text-[12px] text-[#7e726b]">Everything remaining is optional or paused. You can stop thinking about Habits for now.</p></div>}
          </div>
          <div className="space-y-3 rounded-[26px] border border-[#eadfd9] bg-white/78 p-5">
            <div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#8b7d75]">Energy</p><div className="mt-2 grid grid-cols-4 gap-1.5">{ENERGY_OPTIONS.map((option) => <button key={option} type="button" onClick={() => setEnergy(option)} className={`rounded-xl px-2 py-2 text-[9.5px] capitalize ${energy===option?'bg-[#2B2420] text-white':'bg-[#f6f0ec] text-[#746963]'}`}>{option}</button>)}</div></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#8b7d75]">I have…</p><div className="mt-2 grid grid-cols-4 gap-1.5">{TIME_OPTIONS.map((minutes) => <button key={minutes} type="button" onClick={() => setAvailableMinutes(minutes)} className={`rounded-xl px-2 py-2 text-[9.5px] ${availableMinutes===minutes?'bg-[#c87983] text-white':'bg-[#f6f0ec] text-[#746963]'}`}>{minutes}{minutes===20?'+':''} min</button>)}</div></div>
            <div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#8b7d75]">Where are you?</p><div className="mt-2 flex flex-wrap gap-1.5">{['anywhere','home','out','work','gym'].map((place)=><button key={place} type="button" onClick={()=>setContextMode(place)} className={`rounded-full px-3 py-1.5 text-[9.5px] capitalize ${contextMode===place?'bg-[#e4ecdf] text-[#52654d]':'bg-[#f7f3ef] text-[#80746d]'}`}>{place}</button>)}</div></div>
          </div>
        </div>
      </section>

      {todayEnough ? <section className="rounded-[24px] border border-[#dce7d5] bg-[#f4f8f0] p-5 sm:flex sm:items-center sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#687c60]">Today is enough</p><h2 className="glow-display mt-1 text-[25px] text-[#32402f]">Your essentials are covered.</h2><p className="mt-1 text-[11px] text-[#6d7a68]">Anything still open is growth or nice-to-have work, not a reason to feel behind.</p></div><button type="button" onClick={() => setAvailableMinutes(2)} className="mt-3 rounded-full bg-white px-4 py-2 text-[10.5px] text-[#5e7058] sm:mt-0">Do One More</button></section> : null}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#a36f75]">Do → Notice → Adapt → Repeat</p><h2 className="glow-display mt-1 text-[30px] text-[#2B2420]">Your rhythm today</h2></div><button type="button" onClick={() => setCheckInOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-[#e8ddd7] bg-white px-4 py-2.5 text-[10.5px] text-[#685d57]"><Mic2 size={13}/>Check Me In</button></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{BANDS.map((window) => { const list=groups.get(window.key)??[]; const done=list.filter(h=>loggedToday.has(h.id)).length; return <div key={window.key} className={`rounded-[22px] border border-[#ece3dd] p-4 ${window.tone} ${band===window.key?'ring-2 ring-white shadow-lg':''}`}><div className="flex items-start justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#756a63]">{window.label}</p><p className="mt-0.5 text-[9px] text-[#958a82]">{window.time}</p></div><span className="rounded-full bg-white/70 px-2 py-1 text-[9px] text-[#776b64]">{done}/{list.length}</span></div><div className="mt-3 space-y-2">{list.length?list.map((habit)=>{const p=profileMap.get(habit.id)!;const doneNow=loggedToday.has(habit.id);const rest=detailToday.get(habit.id)?.intentionalSkip;const version=versionFor(energy,availableMinutes,p);return <button key={habit.id} type="button" onClick={()=>!doneNow&&!rest&&completeHabit(habit,version)} disabled={isPending||doneNow||Boolean(rest)} className="flex w-full items-center gap-2 rounded-xl bg-white/72 px-3 py-2 text-left disabled:opacity-70"><span className={`grid h-5 w-5 place-items-center rounded-full text-[9px] ${doneNow?'bg-[#78916e] text-white':rest?'bg-[#d8d0dd] text-[#685f70]':'border border-[#d9cec8]'}`}>{doneNow?'✓':rest?'–':''}</span><span className="min-w-0 flex-1 truncate text-[10.5px] text-[#4c433e]">{habit.name}</span><span className="text-[9px] text-[#958980]">{doneNow?'done':rest?'rest':`${versionMinutes(p,version)}m`}</span></button>}) : <p className="rounded-xl bg-white/45 px-3 py-4 text-center text-[10px] text-[#968a82]">Nothing assigned here.</p>}</div></div>})}</div>
      </section>

      {bestHabit && bestProfile && !loggedToday.has(bestHabit.id) ? <section className="rounded-[24px] border border-[#eedbd9] bg-[#fff7f6] p-5"><div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#ae6d77]">Keep the habit alive</p><h2 className="glow-display mt-1 text-[25px] text-[#3d302e]">{bestProfile.minimumLabel}</h2><p className="mt-1 text-[11px] text-[#7c6e68]">Your normal version is {bestProfile.fullMinutes} min. The minimum is {bestProfile.minimumMinutes} min and still counts as returning to the behavior.</p></div><button type="button" disabled={isPending} onClick={()=>completeHabit(bestHabit,'minimum')} className="rounded-full bg-[#bf727c] px-5 py-3 text-[11px] font-semibold text-white disabled:opacity-50">Do Minimum · {bestProfile.minimumMinutes}m</button></div></section> : null}

      {lateRisk ? <section className="rounded-[22px] border border-[#eadfd9] bg-white p-5"><div className="flex items-start gap-3"><CalendarClock size={18} className="mt-0.5 text-[#a26e73]"/><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#a26e73]">Tonight may be harder than usual</p><h2 className="glow-display mt-1 text-[22px] text-[#2B2420]">{upcomingEvent?.title} is in about {minutesToEvent} minutes.</h2><p className="mt-1 text-[11px] text-[#7e736d]">You still have {remainingHabits.length} habits open. Glow recommends Quick/Minimum versions instead of pretending the Calendar is empty.</p><button type="button" onClick={()=>{setEnergy('low');setAvailableMinutes(5);}} className="mt-3 rounded-full bg-[#f3e5e3] px-4 py-2 text-[10px] text-[#8b5a62]">Simplify Tonight</button></div></div></section> : null}

      <div className="grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <section className="rounded-[24px] border border-[#ece2dd] bg-white p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#8d7d75]">This Week’s Focus</p><h2 className="glow-display mt-1 text-[25px] text-[#2B2420]">Protect 1–3 behaviors</h2></div><Target size={18} className="text-[#bf7a82]"/></div><div className="mt-4 grid gap-2 sm:grid-cols-3">{focusHabits.length?focusHabits.map((habit)=><div key={habit.id} className="rounded-[17px] bg-[#faf5f1] p-4"><p className="text-[11px] font-medium text-[#443b36]">{habit.name}</p><p className="mt-1 text-[9.5px] text-[#8b7f78]">{consistencyFor(habit.id,details)}% recent consistency</p><button type="button" onClick={()=>saveProfile(habit,{focus:false})} className="mt-3 text-[9px] text-[#a26c74]">Remove focus</button></div>):<div className="sm:col-span-3 rounded-[17px] border border-dashed border-[#e4d9d3] p-4 text-[10.5px] text-[#8d817a]">No focus habits yet. Open a habit in the Library and choose “Make weekly focus.”</div>}</div></section>
        <section className="rounded-[24px] border border-[#ece2dd] bg-white p-5"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#8d7d75]">Recovery</p><div className="mt-2 flex items-end gap-3"><p className="glow-display text-[38px] text-[#2B2420]">{recoveryCount}</p><p className="pb-1 text-[10px] leading-4 text-[#887c75]">next-day returns<br/>after recent misses</p></div><p className="mt-3 text-[11px] leading-5 text-[#786d67]">Glow rewards returning. Intentional rest days are stored separately and do not need to become a guilt streak.</p></section>
      </div>

      <section className="rounded-[24px] border border-[#ece2dd] bg-white p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#8d7d75]">Flexible goals</p><h2 className="glow-display mt-1 text-[26px] text-[#2B2420]">Weekly opportunities, not daily perfection</h2></div><BarChart3 size={18} className="text-[#788e70]"/></div><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{weeklyHabits.length?weeklyHabits.map((habit)=>{const p=profileMap.get(habit.id)!;const weekStart=new Date(now);weekStart.setDate(now.getDate()-((now.getDay()+6)%7));const weekKey=localDateKey(weekStart);const count=new Set(details.filter(d=>d.habitId===habit.id&&!d.intentionalSkip&&d.dateKey>=weekKey).map(d=>d.dateKey)).size;const remaining=Math.max(0,(p.weeklyTarget??1)-count);return <div key={habit.id} className="rounded-[18px] bg-[#f7f5ef] p-4"><div className="flex justify-between gap-2"><p className="text-[11px] font-medium text-[#423a35]">{habit.name}</p><span className="text-[9.5px] text-[#72806d]">{count}/{p.weeklyTarget}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#869b7d]" style={{width:`${Math.min(100,(count/(p.weeklyTarget??1))*100)}%`}}/></div><p className="mt-2 text-[9.5px] text-[#887c74]">{remaining?`${remaining} more by Sunday. Choose the days that actually fit.`:'Weekly target covered.'}</p></div>}):<p className="text-[11px] text-[#8c817a]">Set a Weekly Target in any habit’s Behavior Studio to use flexible goals.</p>}</div></section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-[24px] border border-[#ece2dd] bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#8d7d75]">Habit stacks</p><h2 className="glow-display mt-1 text-[22px]">Anchor behaviors together</h2></div><Layers3 size={17} className="text-[#8b7ca0]"/></div><div className="mt-3 space-y-2">{stacks.slice(0,4).map((stack)=><div key={stack.id} className="rounded-xl bg-[#f7f3f9] p-3"><p className="text-[10.5px] font-medium">{stack.name}</p><p className="mt-1 text-[9px] text-[#8a7e90]">{stack.habitIds.length} habits · anchor {stack.anchorValue??stack.anchorType}</p></div>)}{!stacks.length?<p className="text-[10.5px] text-[#8c817a]">No stacks yet.</p>:null}</div><button type="button" onClick={createDefaultStack} disabled={isPending} className="mt-4 rounded-full border border-[#e2d8e7] px-4 py-2 text-[10px] text-[#786b86] disabled:opacity-50">Create {band} stack</button></section>
        <section className="rounded-[24px] border border-[#ece2dd] bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#8d7d75]">Experiments</p><h2 className="glow-display mt-1 text-[22px]">Test what makes it easier</h2></div><FlaskConical size={17} className="text-[#a97770]"/></div>{activeExperiments.length?<div className="mt-3 space-y-2">{activeExperiments.slice(0,3).map((experiment)=><div key={experiment.id} className="rounded-xl bg-[#fff6f1] p-3"><p className="text-[10px] font-medium">{initialHabits.find(h=>h.id===experiment.habitId)?.name??'Habit experiment'}</p><p className="mt-1 text-[9px] leading-4 text-[#8c7770]">{experiment.change}</p></div>)}</div>:<p className="mt-3 text-[10.5px] text-[#8c817a]">No active experiment.</p>}<button type="button" onClick={createExperiment} disabled={!bestHabit||isPending} className="mt-4 rounded-full border border-[#ead7ce] px-4 py-2 text-[10px] text-[#96665e] disabled:opacity-40">Test easier version for 2 weeks</button></section>
        <section className="rounded-[24px] border border-[#ece2dd] bg-white p-5"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#8d7d75]">Patterns</p><div className="mt-3 space-y-3"><div className="rounded-xl bg-[#f5f7f1] p-3"><p className="text-[9px] text-[#75816f]">Overall consistency</p><p className="glow-display mt-1 text-[24px]">{averageConsistency}%</p></div>{learnedTimingHabit?<div className="rounded-xl bg-[#f7f3f9] p-3"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-[#7d6e87]">Glow noticed</p><p className="mt-1 text-[10.5px] leading-4 text-[#685d6e]">{learnedTimingHabit.name} is most often completed in the {dominantBand(timingStats.find(s=>s.habitId===learnedTimingHabit.id))}, which differs from its saved time.</p><button type="button" onClick={()=>saveProfile(learnedTimingHabit,{timeBand:dominantBand(timingStats.find(s=>s.habitId===learnedTimingHabit.id)) as Band})} className="mt-2 text-[9px] text-[#806e89]">Move to learned time</button></div>:<div className="rounded-xl bg-[#f7f3f9] p-3 text-[10px] leading-4 text-[#827789]">Glow will suggest timing changes after at least three timed completions.</div>}</div></section>
      </div>

      <section className="rounded-[24px] border border-[#ece2dd] bg-white p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#8d7d75]">Glow Noticed</p><h2 className="glow-display mt-1 text-[27px] text-[#2B2420]">Patterns, not punishment</h2></div><Sparkles size={18} className="text-[#c37a84]"/></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-[17px] bg-[#f5f7f1] p-4"><p className="text-[9px] uppercase tracking-[.1em] text-[#75816f]">Strongest rhythm</p><p className="mt-2 text-[11px] font-medium">{strongestHabit?.name??'More history needed'}</p><p className="mt-1 text-[9.5px] text-[#837a74]">{strongestHabit?`${consistencyFor(strongestHabit.id,details)}% recent consistency`:''}</p></div><div className="rounded-[17px] bg-[#fff6f3] p-4"><p className="text-[9px] uppercase tracking-[.1em] text-[#a57370]">Needs redesign</p><p className="mt-2 text-[11px] font-medium">{hardestHabit?.name??'More history needed'}</p><p className="mt-1 text-[9.5px] text-[#8b7874]">{hardestHabit?'Try Quick/Minimum, a trigger, or a better anchor.':''}</p></div><div className="rounded-[17px] bg-[#f5f1f8] p-4"><p className="text-[9px] uppercase tracking-[.1em] text-[#7c6f8b]">Goal alignment</p><p className="mt-2 text-[11px] font-medium">{goals.length?`${goals.length} active goal${goals.length===1?'':'s'} available for alignment`:'Add goals to connect behavior to direction.'}</p><p className="mt-1 text-[9.5px] text-[#83798a]">Glow labels keyword matches as likely support, not proven causation.</p></div></div></section>

      <section className="rounded-[24px] border border-[#ece2dd] bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#8d7d75]">Habit Library</p><h2 className="glow-display mt-1 text-[28px] text-[#2B2420]">Make each behavior easier to repeat</h2></div><button type="button" onClick={()=>setShowManager(true)} className="inline-flex items-center gap-2 rounded-full bg-[#2B2420] px-4 py-2.5 text-[10.5px] font-semibold text-white"><Plus size={12}/>Add / Manage</button></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{initialHabits.map((habit)=>{const p=profileMap.get(habit.id)!;const detail=detailToday.get(habit.id);const done=loggedToday.has(habit.id);const stat=timingStats.find(s=>s.habitId===habit.id);const links=sourceLinks.filter(l=>l.habitId===habit.id&&l.enabled);const habitTriggers=triggers.filter(t=>t.habitId===habit.id&&t.enabled);const relatedGoal=goals.find(g=>habit.name.toLowerCase().split(/\s+/).some(word=>word.length>4&&`${g.title} ${g.description??''}`.toLowerCase().includes(word)));return <div key={habit.id} className="rounded-[19px] border border-[#f0e7e2] bg-[#fffdfc] p-4"><div className="flex items-start gap-3"><button type="button" disabled={done||Boolean(detail?.intentionalSkip)||isPending} onClick={()=>completeHabit(habit,versionFor(energy,availableMinutes,p))} className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${done?'bg-[#7d9474] text-white':detail?.intentionalSkip?'bg-[#ddd6e1] text-[#6f6576]':'border border-[#dacfc9] text-[#8b7f78]'}`}>{done?<Check size={14}/>:detail?.intentionalSkip?<CirclePause size={13}/>:<Sprout size={13}/>}</button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-[12px] font-medium text-[#3f3732]">{habit.name}</p><span className="rounded-full bg-[#f4efe9] px-2 py-0.5 text-[8.5px] text-[#7e716a]">{p.area}</span><span className="rounded-full bg-[#f3f5ef] px-2 py-0.5 text-[8.5px] text-[#6d7b68]">{p.importanceTier}</span>{p.focus?<span className="rounded-full bg-[#f7e8ea] px-2 py-0.5 text-[8.5px] text-[#a05e69]">focus</span>:null}</div><p className="mt-1 text-[9.5px] text-[#91867f]">Full {p.fullMinutes}m · Quick {p.quickMinutes}m · Minimum {p.minimumMinutes}m · {p.contextMode}</p><div className="mt-2 flex flex-wrap gap-1.5">{p.rollingGoalType==='quantity'||habit.targetCount>1?<><button type="button" disabled={isPending} onClick={()=>incrementHabit(habit,-1)} className="rounded-full border border-[#e5dbd5] p-1.5"><Minus size={10}/></button><span className="rounded-full bg-[#f6f1ed] px-3 py-1.5 text-[9px]">{loggedToday.get(habit.id)?.count??0}/{p.rollingTarget??habit.targetCount}</span><button type="button" disabled={isPending} onClick={()=>incrementHabit(habit,1)} className="rounded-full border border-[#e5dbd5] p-1.5"><Plus size={10}/></button></>:null}{/read|meditat|stretch|clean|walk|movement|workout|study/i.test(habit.name)?<button type="button" onClick={()=>startTimer(habit,p.quickMinutes)} className="inline-flex items-center gap-1 rounded-full border border-[#e5dbd5] px-3 py-1.5 text-[9px]"><Clock3 size={10}/>Start {p.quickMinutes}m</button>:null}<button type="button" onClick={()=>setExpandedHabitId(expandedHabitId===habit.id?null:habit.id)} className="rounded-full border border-[#e5dbd5] px-3 py-1.5 text-[9px]">Behavior Studio</button></div>{relatedGoal?<p className="mt-2 text-[9px] text-[#a07a57]">Likely supports · {relatedGoal.title}</p>:null}{stat?.sampleCount?<p className="mt-1 text-[9px] text-[#7d8a76]">Learned timing · {stat.sampleCount} sample{stat.sampleCount===1?'':'s'} · avg {Math.max(1,Math.round(stat.averageSeconds/60))}m · usually {dominantBand(stat)}</p>:null}{links.length?<p className="mt-1 text-[9px] text-[#758499]">One-source links · {links.map(l=>l.sourceType).join(', ')}</p>:null}{habitTriggers.length?<p className="mt-1 text-[9px] text-[#8b7d96]">Triggers · {habitTriggers.map(t=>`${t.triggerType}:${t.triggerValue}`).join(' · ')}</p>:null}</div><ChevronRight size={13} className="mt-1 shrink-0 text-[#b0a59f]"/></div>{expandedHabitId===habit.id?<div className="mt-4 rounded-[16px] bg-[#faf6f3] p-4"><div className="grid gap-3 sm:grid-cols-2"><label className="text-[9px] text-[#7c716b]">Time band<select value={p.timeBand} onChange={(e)=>saveProfile(habit,{timeBand:e.target.value as Band})} className="mt-1 w-full rounded-lg border border-[#e6ddd8] bg-white px-2 py-2 text-[10px]"><option value="anytime">Anytime</option><option value="morning">Morning</option><option value="afternoon">Midday</option><option value="evening">Evening</option><option value="night">Night</option></select></label><label className="text-[9px] text-[#7c716b]">Context<select value={p.contextMode} onChange={(e)=>saveProfile(habit,{contextMode:e.target.value})} className="mt-1 w-full rounded-lg border border-[#e6ddd8] bg-white px-2 py-2 text-[10px]"><option value="anywhere">Anywhere</option><option value="home">Home</option><option value="out">Out</option><option value="work">Work</option><option value="gym">Gym</option><option value="phone-free">Phone-free</option></select></label><label className="text-[9px] text-[#7c716b]">Importance<select value={p.importanceTier} onChange={(e)=>saveProfile(habit,{importanceTier:e.target.value as LocalProfile['importanceTier']})} className="mt-1 w-full rounded-lg border border-[#e6ddd8] bg-white px-2 py-2 text-[10px]"><option value="essential">Non-negotiable</option><option value="growth">Growth</option><option value="nice">Nice to have</option></select></label><label className="text-[9px] text-[#7c716b]">Difficulty · {p.difficulty}/5<input type="range" min="1" max="5" value={p.difficulty} onChange={(e)=>saveProfile(habit,{difficulty:Number(e.target.value)})} className="mt-2 w-full"/></label></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={()=>saveProfile(habit,{focus:!p.focus})} className="rounded-full bg-white px-3 py-2 text-[9px]">{p.focus?'Remove weekly focus':'Make weekly focus'}</button><button type="button" onClick={()=>saveProfile(habit,{pausedUntil:nextMonday(),pausedIndefinitely:false})} className="rounded-full bg-white px-3 py-2 text-[9px]"><Pause className="mr-1 inline" size={9}/>Pause until Monday</button><button type="button" onClick={()=>saveProfile(habit,{pausedIndefinitely:true})} className="rounded-full bg-white px-3 py-2 text-[9px]">Pause indefinitely</button><button type="button" onClick={()=>saveProfile(habit,{pausedUntil:null,pausedIndefinitely:false})} className="rounded-full bg-white px-3 py-2 text-[9px]"><RotateCcw className="mr-1 inline" size={9}/>Resume</button><button type="button" onClick={()=>addTimeTrigger(habit)} className="rounded-full bg-white px-3 py-2 text-[9px]"><AlarmClock className="mr-1 inline" size={9}/>Add time trigger</button></div><div className="mt-3 rounded-xl bg-white p-3"><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-[#98726f]">Make this easier</p><p className="mt-1 text-[10px] leading-4 text-[#756963]">Prepare what you need ahead of time. Anchor it to {p.preferredAnchor??'something you already do'}. On hard days, use “{p.minimumLabel}” for {p.minimumMinutes} minutes instead of abandoning the behavior.</p></div></div>:null}</div>})}</div></section>

      {timerHabitId ? <section className="fixed bottom-20 left-1/2 z-[160] w-[min(420px,92vw)] -translate-x-1/2 rounded-[22px] border border-[#e8ddd7] bg-white p-4 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-[9px] uppercase tracking-[.12em] text-[#9a756f]">Habit timer</p><p className="mt-1 text-[11px] font-medium">{initialHabits.find(h=>h.id===timerHabitId)?.name}</p></div><button type="button" onClick={()=>{setTimerHabitId(null);setTimerRunning(false);setTimerStartedAt(null)}}><X size={15}/></button></div><div className="mt-3 flex items-center justify-between"><span className="font-mono text-[28px]">{String(Math.floor(timerSeconds/60)).padStart(2,'0')}:{String(timerSeconds%60).padStart(2,'0')}</span><button type="button" onClick={()=>setTimerRunning(current=>!current)} className="rounded-full bg-[#2B2420] p-3 text-white">{timerRunning?<Pause size={14}/>:<Play size={14}/>}</button></div></section> : null}

      <section className="rounded-[24px] border border-[#ece2dd] bg-[linear-gradient(135deg,#fffdfb,#f8f2ef)] p-5"><div className="flex items-center gap-2"><WandSparkles size={15} className="text-[#bd7580]"/><h2 className="glow-display text-[24px] text-[#2B2420]">Ask Glow about your habits</h2></div><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={assistantInput} onChange={(e)=>setAssistantInput(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter')askGlow()}} placeholder='“I only have five minutes” or “mark skincare done”' className="min-w-0 flex-1 rounded-2xl border border-[#e6ddd8] bg-white px-4 py-3 text-[11px] outline-none"/><button type="button" onClick={askGlow} className="rounded-2xl bg-[#2B2420] px-5 py-3 text-[11px] font-semibold text-white">Ask / Act</button></div>{assistantReply?<p className="mt-3 rounded-2xl bg-white p-4 text-[11px] leading-5 text-[#6e625c]">{assistantReply}</p>:null}</section>

      <div className="fixed bottom-5 right-5 z-[140] flex flex-col items-end gap-2"><button type="button" onClick={()=>setShowManager(true)} className="grid h-12 w-12 place-items-center rounded-full bg-[#2B2420] text-white shadow-xl" aria-label="Open habit command palette"><Plus size={18}/></button><div className="rounded-2xl border border-[#e7ddd7] bg-white/95 p-2 text-[9.5px] text-[#655a54] shadow-lg"><button type="button" onClick={()=>setShowManager(true)} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-[#f8f3ef]">Add / edit habit</button><button type="button" onClick={()=>setCheckInOpen(true)} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-[#f8f3ef]">Voice check-in</button><button type="button" onClick={createDefaultStack} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-[#f8f3ef]">Create habit stack</button><button type="button" onClick={createExperiment} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-[#f8f3ef]">Create experiment</button></div></div>

      <Dialog open={showManager} onClose={()=>setShowManager(false)} title="Habit Garden + Manager"><HabitManager initialHabits={initialHabits} initialLogs={logs}/></Dialog>
      <Dialog open={checkInOpen} onClose={()=>{setCheckInOpen(false);setCheckInIndex(0)}} title="Check Me In">{checkHabit?<div className="space-y-4"><p className="text-[10px] uppercase tracking-[.14em] text-[#a36f75]">{checkInIndex+1} of {checkInHabits.length}</p><h3 className="glow-display text-[28px] text-[#2B2420]">Did you do {checkHabit.name}?</h3><div className="grid grid-cols-3 gap-2"><button type="button" onClick={()=>{completeHabit(checkHabit,'full');advanceCheckIn()}} className="rounded-xl bg-[#2B2420] px-3 py-3 text-[10px] text-white">Yes</button><button type="button" onClick={advanceCheckIn} className="rounded-xl border border-[#e5dcd7] px-3 py-3 text-[10px]">Not yet</button><button type="button" onClick={()=>{completeHabit(checkHabit,'minimum');advanceCheckIn()}} className="rounded-xl border border-[#ead8dc] bg-[#fff5f6] px-3 py-3 text-[10px] text-[#9a6570]">Minimum</button></div><button type="button" onClick={listenCheckIn} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] ${voiceListening?'bg-[#a46670] text-white':'bg-[#f6f0ec] text-[#6f625b]'}`}><Mic2 size={12}/>{voiceListening?'Listening…':'Answer by voice'}</button></div>:<div className="py-8 text-center"><Flower2 className="mx-auto text-[#8a9c7f]" size={24}/><p className="mt-3 glow-display text-[22px]">Check-in complete.</p><p className="mt-1 text-[10.5px] text-[#847870]">You can stop thinking about the remaining optional habits for now.</p></div>}</Dialog>
    </div>
  );
}
