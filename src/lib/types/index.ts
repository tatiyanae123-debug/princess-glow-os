import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { users, accounts, sessions } from '@/db/schema/auth';
import type { tasks } from '@/db/schema/tasks';
import type { habits, habitLogs } from '@/db/schema/habits';
import type { routines, routineSteps } from '@/db/schema/routines';
import type { goals } from '@/db/schema/goals';
import type { calendarEvents } from '@/db/schema/calendar-events';
import type { beautyRoutines } from '@/db/schema/beauty-routines';
import type { wellnessEntries } from '@/db/schema/wellness-entries';
import type { financeEntries } from '@/db/schema/finance-entries';
import type { notes } from '@/db/schema/notes';
import type { importantLinks } from '@/db/schema/important-links';
import type { appointments } from '@/db/schema/appointments';
import type { workSchedules } from '@/db/schema/work-schedules';

// Users
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// Auth
export type Account = InferSelectModel<typeof accounts>;
export type Session = InferSelectModel<typeof sessions>;

// Tasks
export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;

// Habits
export type Habit = InferSelectModel<typeof habits>;
export type NewHabit = InferInsertModel<typeof habits>;
export type HabitLog = InferSelectModel<typeof habitLogs>;
export type NewHabitLog = InferInsertModel<typeof habitLogs>;

// Routines
export type Routine = InferSelectModel<typeof routines>;
export type NewRoutine = InferInsertModel<typeof routines>;
export type RoutineStep = InferSelectModel<typeof routineSteps>;
export type NewRoutineStep = InferInsertModel<typeof routineSteps>;

// Goals
export type Goal = InferSelectModel<typeof goals>;
export type NewGoal = InferInsertModel<typeof goals>;

// Calendar Events
export type CalendarEvent = InferSelectModel<typeof calendarEvents>;
export type NewCalendarEvent = InferInsertModel<typeof calendarEvents>;

// Beauty Routines
export type BeautyRoutine = InferSelectModel<typeof beautyRoutines>;
export type NewBeautyRoutine = InferInsertModel<typeof beautyRoutines>;

// Wellness Entries
export type WellnessEntry = InferSelectModel<typeof wellnessEntries>;
export type NewWellnessEntry = InferInsertModel<typeof wellnessEntries>;

// Finance Entries
export type FinanceEntry = InferSelectModel<typeof financeEntries>;
export type NewFinanceEntry = InferInsertModel<typeof financeEntries>;

// Notes
export type Note = InferSelectModel<typeof notes>;
export type NewNote = InferInsertModel<typeof notes>;

// Important Links
export type ImportantLink = InferSelectModel<typeof importantLinks>;
export type NewImportantLink = InferInsertModel<typeof importantLinks>;

// Appointments
export type Appointment = InferSelectModel<typeof appointments>;
export type NewAppointment = InferInsertModel<typeof appointments>;

// Work Schedules
export type WorkSchedule = InferSelectModel<typeof workSchedules>;
export type NewWorkSchedule = InferInsertModel<typeof workSchedules>;

// Composite types
export type HabitWithLogs = Habit & { logs: HabitLog[] };
export type RoutineWithSteps = Routine & { steps: RoutineStep[] };
