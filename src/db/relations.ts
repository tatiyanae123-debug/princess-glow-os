import { relations } from 'drizzle-orm';
import { users, accounts, sessions, authenticators } from './schema/auth';
import { tasks } from './schema/tasks';
import { habits, habitLogs } from './schema/habits';
import { routines, routineSteps } from './schema/routines';
import { goals } from './schema/goals';
import { calendarEvents } from './schema/calendar-events';
import { beautyRoutines } from './schema/beauty-routines';
import { wellnessEntries } from './schema/wellness-entries';
import { financeEntries } from './schema/finance-entries';
import { notes } from './schema/notes';
import { importantLinks } from './schema/important-links';
import { appointments } from './schema/appointments';
import { workSchedules } from './schema/work-schedules';

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  authenticators: many(authenticators),
  tasks: many(tasks),
  habits: many(habits),
  habitLogs: many(habitLogs),
  routines: many(routines),
  routineSteps: many(routineSteps),
  goals: many(goals),
  calendarEvents: many(calendarEvents),
  beautyRoutines: many(beautyRoutines),
  wellnessEntries: many(wellnessEntries),
  financeEntries: many(financeEntries),
  notes: many(notes),
  importantLinks: many(importantLinks),
  appointments: many(appointments),
  workSchedules: many(workSchedules),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
  user: one(users, { fields: [authenticators.userId], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, { fields: [tasks.userId], references: [users.id] }),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, { fields: [habits.userId], references: [users.id] }),
  logs: many(habitLogs),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  habit: one(habits, { fields: [habitLogs.habitId], references: [habits.id] }),
  user: one(users, { fields: [habitLogs.userId], references: [users.id] }),
}));

export const routinesRelations = relations(routines, ({ one, many }) => ({
  user: one(users, { fields: [routines.userId], references: [users.id] }),
  steps: many(routineSteps),
}));

export const routineStepsRelations = relations(routineSteps, ({ one }) => ({
  routine: one(routines, { fields: [routineSteps.routineId], references: [routines.id] }),
  user: one(users, { fields: [routineSteps.userId], references: [users.id] }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  user: one(users, { fields: [calendarEvents.userId], references: [users.id] }),
}));

export const beautyRoutinesRelations = relations(beautyRoutines, ({ one }) => ({
  user: one(users, { fields: [beautyRoutines.userId], references: [users.id] }),
}));

export const wellnessEntriesRelations = relations(wellnessEntries, ({ one }) => ({
  user: one(users, { fields: [wellnessEntries.userId], references: [users.id] }),
}));

export const financeEntriesRelations = relations(financeEntries, ({ one }) => ({
  user: one(users, { fields: [financeEntries.userId], references: [users.id] }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  user: one(users, { fields: [notes.userId], references: [users.id] }),
}));

export const importantLinksRelations = relations(importantLinks, ({ one }) => ({
  user: one(users, { fields: [importantLinks.userId], references: [users.id] }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, { fields: [appointments.userId], references: [users.id] }),
}));

export const workSchedulesRelations = relations(workSchedules, ({ one }) => ({
  user: one(users, { fields: [workSchedules.userId], references: [users.id] }),
}));
