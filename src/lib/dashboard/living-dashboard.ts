import { getAppointmentsByUser } from '@/lib/data/appointments';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getGoalsByUser } from '@/lib/data/goals';
import { getHabitLogsByHabit, getHabitsByUser } from '@/lib/data/habits';
import { getRoutinesByUser, getStepsByRoutine } from '@/lib/data/routines';
import { getTasksByUser } from '@/lib/data/tasks';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getWorkSchedulesByUser } from '@/lib/data/work-schedules';
import type { DashboardAchievement, DashboardCalendarItem, DashboardHabitSummary, DashboardProjectSummary, DashboardRoutineProgress, LivingDashboardData } from '@/lib/dashboard/types';
import type { Routine, Task } from '@/lib/types';

const priorityRank: Record<Task['priority'], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const weekdayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const routineLabels = {
  morning: 'Morning routine',
  afternoon: 'Midday routine',
  evening: 'Evening routine',
  night: 'Night routine',
} as const;
const weeklyThemes = [
  { title: 'Momentum Week', note: 'Protect your best energy with one lead objective and a gentle rhythm.' },
  { title: 'Clarity Week', note: 'Simplify your commitments and make space for what moves life forward.' },
  { title: 'Balance Week', note: 'Blend ambition with restoration so the whole system feels sustainable.' },
  { title: 'Refinement Week', note: 'Tighten the details, elevate your standards, and let the system support you.' },
] as const;
const defaultMealReminders = ['Breakfast · 8:00 AM', 'Lunch · 1:00 PM', 'Dinner · 7:00 PM'];
const defaultMedicationReminders = ['Daily vitamins · 9:00 AM', 'Night routine supplements · 9:30 PM'];
const projectLabels = ['Glow OS', 'EverHub', 'Terrain Design', 'Beauty Brand', 'Creative Studio', 'Pinterest', 'Content Creation', 'Career', 'Personal Projects'] as const;

function formatWeekTheme(date: Date) {
  const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
  return weeklyThemes[weekNumber % weeklyThemes.length];
}

function getTimeOfDayState(date: Date) {
  const hour = date.getHours();
  if (hour < 12) {
    return {
      label: 'Good morning',
      title: 'Welcome to your Living Command Center.',
      message: 'Lead with your most important move, protect your energy, and let the rest of the day organize around it.',
      routineMatch: 'morning' as const,
    };
  }
  if (hour < 17) {
    return {
      label: 'Good afternoon',
      title: 'Your system is here to protect momentum.',
      message: 'Keep the day elegant: finish the next high-value block, then let your routines absorb the rest.',
      routineMatch: 'afternoon' as const,
    };
  }
  if (hour < 21) {
    return {
      label: 'Good evening',
      title: 'Close the loop before the night begins.',
      message: 'Land the essentials, review what changed, and shift into restoration with intention.',
      routineMatch: 'evening' as const,
    };
  }
  return {
    label: 'Good night',
    title: 'Reset softly so tomorrow starts lighter.',
    message: 'Capture wins, prepare the morning, and let the command center carry your memory for you.',
    routineMatch: 'night' as const,
  };
}

function isSameDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sortTasksByPriority(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function createRoutineProgress(label: string, routines: Routine[], completedToday: number, totalTrackedTasks: number): DashboardRoutineProgress {
  const totalSteps = Math.max(routines.length * 3, routines.length === 0 ? 0 : routines.length);
  const clampedCompleted = Math.min(completedToday, totalSteps);
  const completion = totalSteps === 0 ? 0 : Math.round((clampedCompleted / totalSteps) * 100);

  return {
    label,
    completion,
    completedSteps: clampedCompleted,
    totalSteps,
    pendingSteps: Math.max(totalSteps - clampedCompleted, 0),
    currentStep:
      totalSteps === 0
        ? null
        : completion === 100
        ? 'Complete and ready to reset tomorrow.'
        : totalTrackedTasks > 0
        ? 'Finish the next active task tied to this block.'
        : 'Add tasks or routine steps to personalize this flow.',
    routines: routines.map((routine) => ({ id: routine.id, name: routine.name, description: routine.description })),
  };
}

export async function getLivingDashboardData(userId: string): Promise<LivingDashboardData> {
  const now = new Date();
  const todayStart = startOfDay(now);
  const dayOfWeek = weekdayOrder[now.getDay()];
  const timeState = getTimeOfDayState(now);

  const [tasks, routines, goals, workSchedules, events, habits, appointments, wellnessEntries, beautyRoutines, financeEntries] = await Promise.all([
    getTasksByUser(userId),
    getRoutinesByUser(userId),
    getGoalsByUser(userId),
    getWorkSchedulesByUser(userId),
    getCalendarEventsByUser(userId),
    getHabitsByUser(userId),
    getAppointmentsByUser(userId),
    getWellnessEntriesByUser(userId),
    getBeautyRoutinesByUser(userId),
    getFinanceEntriesByUser(userId),
  ]);

  const habitLogs = await Promise.all(habits.map((habit) => getHabitLogsByHabit(habit.id, userId)));
  const routineSteps = await Promise.all(routines.map((routine) => getStepsByRoutine(routine.id, userId)));

  const activeTasks = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const completedTasks = tasks.filter((task) => task.status === 'done');
  const topPriorityTasks = sortTasksByPriority(activeTasks).slice(0, 4);
  const tasksDueToday = activeTasks.filter((task) => task.dueDate && isSameDay(task.dueDate, now)).length;
  const overdueTasks = sortTasksByPriority(
    activeTasks.filter((task) => task.dueDate && task.dueDate.getTime() < todayStart.getTime()),
  );

  const todaysEvents = events
    .filter((event) => isSameDay(event.startAt, now))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  const todaysAppointments = appointments
    .filter((appointment) => isSameDay(appointment.startAt, now))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  const todaysWorkSchedule = workSchedules
    .filter((schedule) => schedule.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const routinesForToday = routines.filter((routine) => !routine.daysOfWeek || routine.daysOfWeek.length === 0 || routine.daysOfWeek.includes(dayOfWeek));
  const routinesByTime = {
    morning: routinesForToday.filter((routine) => routine.timeOfDay === 'morning' || routine.timeOfDay === 'anytime'),
    afternoon: routinesForToday.filter((routine) => routine.timeOfDay === 'afternoon' || routine.timeOfDay === 'anytime'),
    evening: routinesForToday.filter((routine) => routine.timeOfDay === 'evening' || routine.timeOfDay === 'anytime'),
    night: routinesForToday.filter((routine) => routine.timeOfDay === 'night' || routine.timeOfDay === 'anytime'),
  };

  const completedTodayCount = completedTasks.filter((task) => task.completedAt && isSameDay(task.completedAt, now)).length;
  const routineTaskCounts = {
    morning: activeTasks.filter((task) => /morning|wake|am|breakfast/i.test(`${task.title} ${task.description ?? ''}`)).length,
    afternoon: activeTasks.filter((task) => /midday|afternoon|lunch|noon/i.test(`${task.title} ${task.description ?? ''}`)).length,
    evening: activeTasks.filter((task) => /evening|pm|dinner|sunset/i.test(`${task.title} ${task.description ?? ''}`)).length,
    night: activeTasks.filter((task) => /night|sleep|bed|wind/i.test(`${task.title} ${task.description ?? ''}`)).length,
  };

  const routinesProgress = {
    morning: createRoutineProgress(routineLabels.morning, routinesByTime.morning, completedTodayCount, routineTaskCounts.morning),
    midday: createRoutineProgress(routineLabels.afternoon, routinesByTime.afternoon, completedTodayCount, routineTaskCounts.afternoon),
    evening: createRoutineProgress(routineLabels.evening, routinesByTime.evening, completedTodayCount, routineTaskCounts.evening),
    night: createRoutineProgress(routineLabels.night, routinesByTime.night, completedTodayCount, routineTaskCounts.night),
  };

  const habitSummaries: DashboardHabitSummary[] = habits.map((habit, index) => {
    const logs = habitLogs[index] ?? [];
    const completedToday = logs.filter((log) => log.loggedDate.toDateString() === todayStart.toDateString()).reduce((sum, log) => sum + log.count, 0);
    const uniqueDates = [...new Set(logs.map((log) => log.loggedDate.toISOString()))].sort().reverse();
    let streak = 0;
    let cursor = new Date(todayStart);
    for (const isoDate of uniqueDates) {
      const date = new Date(isoDate);
      if (date.toDateString() === cursor.toDateString()) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else if (date < cursor) {
        break;
      }
    }

    const completionRate = habit.targetCount > 0 ? Math.min(100, Math.round((completedToday / habit.targetCount) * 100)) : 0;
    return {
      id: habit.id,
      name: habit.name,
      frequency: habit.frequency,
      color: habit.color ?? '#f43f5e',
      streak,
      completionRate,
      completedToday,
      targetCount: habit.targetCount,
    };
  });

  const completedHabitsToday = habitSummaries.filter((habit) => habit.completedToday >= habit.targetCount).length;
  const averageHabitCompletion = habitSummaries.length > 0
    ? Math.round(habitSummaries.reduce((total, habit) => total + habit.completionRate, 0) / habitSummaries.length)
    : 0;
  const totalXp = habitSummaries.reduce((total, habit) => total + habit.streak * 10 + habit.completedToday * 5, 0);

  const latestWellness = wellnessEntries[0] ?? null;
  const beautyMorning = beautyRoutines.filter((routine) => routine.timeOfDay === 'morning').slice(0, 3);
  const beautyNight = beautyRoutines.filter((routine) => routine.timeOfDay === 'night' || routine.timeOfDay === 'evening').slice(0, 3);
  const beautyFocus = beautyMorning[0]?.name ?? beautyRoutines[0]?.name ?? 'Skincare ritual';
  const hairFocus = beautyNight[0]?.name ?? 'Scalp care and protective styling';

  const income = financeEntries
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const expenses = financeEntries
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const savings = financeEntries
    .filter((entry) => entry.type === 'saving' || entry.category === 'savings')
    .reduce((sum, entry) => sum + Number(entry.amount), 0);
  const subscriptions = financeEntries.filter((entry) => entry.category === 'subscriptions').length;

  const inProgressGoals = goals.filter((goal) => goal.status === 'in_progress');
  const achievedGoals = goals.filter((goal) => goal.status === 'achieved');
  const averageGoalProgress = goals.length ? Math.round(goals.reduce((total, goal) => total + goal.progress, 0) / goals.length) : 0;

  const projects: DashboardProjectSummary[] = projectLabels.map((label) => {
    const matchingTasks = tasks.filter((task) => `${task.title} ${task.description ?? ''}`.toLowerCase().includes(label.toLowerCase()));
    const matchingGoals = goals.filter((goal) => `${goal.title} ${goal.description ?? ''}`.toLowerCase().includes(label.toLowerCase()));
    const avgProgress = matchingGoals.length > 0 ? Math.round(matchingGoals.reduce((sum, goal) => sum + goal.progress, 0) / matchingGoals.length) : 0;
    return {
      label,
      activeTasks: matchingTasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled').length,
      completedTasks: matchingTasks.filter((task) => task.status === 'done').length,
      goalProgress: avgProgress,
    };
  }).filter((project) => project.activeTasks > 0 || project.completedTasks > 0 || project.goalProgress > 0).slice(0, 5);

  const timeline: DashboardCalendarItem[] = [
    ...todaysWorkSchedule.map((schedule) => ({
      id: schedule.id,
      title: schedule.title,
      startAt: new Date(`${todayStart.toISOString().slice(0, 10)}T${schedule.startTime}`),
      endAt: new Date(`${todayStart.toISOString().slice(0, 10)}T${schedule.endTime}`),
      source: 'work' as const,
      detail: 'Work schedule',
      allDay: false,
    })),
    ...todaysEvents.map((event) => ({
      id: event.id,
      title: event.title,
      startAt: event.startAt,
      endAt: event.endAt,
      source: 'calendar' as const,
      detail: event.location ?? 'Calendar event',
      allDay: event.allDay,
    })),
    ...todaysAppointments.map((appointment) => ({
      id: appointment.id,
      title: appointment.title,
      startAt: appointment.startAt,
      endAt: appointment.endAt,
      source: 'appointment' as const,
      detail: appointment.location ?? appointment.type,
      allDay: false,
    })),
  ].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  const achievements: DashboardAchievement[] = [
    ...completedTasks.slice(0, 3).map((task) => ({
      id: task.id,
      label: 'Task completed',
      detail: task.title,
      achievedAt: task.completedAt ?? task.updatedAt,
    })),
    ...achievedGoals.slice(0, 2).map((goal) => ({
      id: goal.id,
      label: 'Goal achieved',
      detail: goal.title,
      achievedAt: goal.updatedAt,
    })),
  ].sort((a, b) => b.achievedAt.getTime() - a.achievedAt.getTime()).slice(0, 5);

  const aiInsight = overdueTasks[0]
    ? `Start with ${overdueTasks[0].title}, then move into ${timeState.routineMatch === 'afternoon' ? 'your midday reset' : `${timeState.routineMatch} routines`} to regain control.`
    : topPriorityTasks[0]
    ? `Protect ${topPriorityTasks[0].title} first, then let your schedule and rituals cascade around it.`
    : 'Your dashboard is calm right now—use this space to define today's most meaningful win.';

  return {
    greeting: {
      label: timeState.label,
      title: timeState.title,
      message: timeState.message,
    },
    weekTheme: formatWeekTheme(now),
    hero: {
      title: 'Personal Life Operating System',
      subtitle: 'A premium Living Command Center that brings your schedule, routines, wellness, money, and goals into one view.',
      primaryFocus: topPriorityTasks[0]?.title ?? 'Set today's top priority',
      secondaryFocus: todaysAppointments[0]?.title ?? todaysEvents[0]?.title ?? 'No immediate event pressure',
    },
    commandCenter: {
      todayLabel: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      weather: 'Weather sync ready for your local integration',
      aiInsight,
      sleepGoal: `${latestWellness?.sleepHours ?? 0}/${8} hrs`,
      weeklyFocus: formatWeekTheme(now).title,
      completedAchievements: achievements.length,
      overdueCount: overdueTasks.length,
    },
    todayOverview: {
      tasksDueToday,
      eventsToday: todaysEvents.length,
      activeRoutines: routinesForToday.length,
      activeGoals: inProgressGoals.length,
      appointmentsToday: todaysAppointments.length,
      habitsTracked: habits.length,
      completedToday: completedTodayCount + completedHabitsToday,
    },
    dailyFocus: topPriorityTasks[0]
      ? {
          title: topPriorityTasks[0].title,
          note: topPriorityTasks[0].description ?? 'Keep this task protected before opening smaller loops.',
          priority: topPriorityTasks[0].priority,
        }
      : null,
    topPriorityTasks: topPriorityTasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
    })),
    routines: routinesProgress,
    todaySchedule: {
      workSlots: todaysWorkSchedule.map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        dayOfWeek: schedule.dayOfWeek,
      })),
      events: todaysEvents.map((event) => ({
        id: event.id,
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
        location: event.location,
        allDay: event.allDay,
      })),
      appointments: todaysAppointments.map((appointment) => ({
        id: appointment.id,
        title: appointment.title,
        startAt: appointment.startAt,
        endAt: appointment.endAt,
        location: appointment.location,
        type: appointment.type,
      })),
      timeline,
    },
    habits: {
      total: habits.length,
      completedToday: completedHabitsToday,
      averageCompletion: averageHabitCompletion,
      totalXp,
      summaries: habitSummaries.slice(0, 4),
    },
    wellness: {
      water: latestWellness?.waterGlasses ?? 0,
      targetWater: 8,
      sleepHours: latestWellness?.sleepHours ?? null,
      sleepGoalHours: 8,
      workout: activeTasks.find((task) => /workout|gym|cardio|lift|exercise/i.test(`${task.title} ${task.description ?? ''}`))?.title ?? 'Movement block not set',
      meals: defaultMealReminders,
      medication: defaultMedicationReminders,
      beautyFocus,
      hairFocus,
    },
    finance: {
      income,
      expenses,
      savings,
      subscriptions,
      snapshotLabel: `${formatCurrency(income - expenses)} available after tracked expenses`,
    },
    projects: {
      current: projects,
      goalsInProgress: inProgressGoals.length,
      goalsAchieved: achievedGoals.length,
      averageGoalProgress,
      activeTaskCount: activeTasks.length,
      completedTaskCount: completedTasks.length,
    },
    achievements,
    insights: {
      overdue: overdueTasks.slice(0, 3).map((task) => task.title),
      upcoming: timeline.slice(0, 4).map((item) => item.title),
      recommendation: aiInsight,
    },
    sourceData: {
      tasks,
      habits,
      routines,
      goals,
      events,
      appointments,
      wellnessEntries,
      beautyRoutines,
      financeEntries,
    },
  };
}
