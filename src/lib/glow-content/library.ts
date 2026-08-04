// Canonical Glow OS 2026 content, sourced from the project's own blueprint
// documents. This is a read-only reference library — nothing here writes
// to the database directly. The Master Importer turns selected pieces of
// this into real rows only after the user confirms a preview.

export const GLOW_OS_SOURCE = 'glow-os-2026-master' as const;
export const GLOW_OS_SOURCE_VERSION = '1.0.0' as const;

export type ImportCategory =
  | 'routines'
  | 'habits'
  | 'tasks'
  | 'weekly_themes'
  | 'beauty_routines'
  | 'hair_routines'
  | 'wellness_routines'
  | 'workout_plans'
  | 'home_resets'
  | 'finance_reviews'
  | 'planning_rituals'
  | 'saint_care'
  | 'calendar_templates'
  | 'monthly_resets'
  | 'seasonal_resets'
  | 'yearly_resets';

export const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKLY_THEMES: { day: Weekday; title: string; focus: string }[] = [
  { day: 'sunday', title: 'Sunday Reset and Full Maintenance', focus: 'Full ritual reset, weekly review, hair wash day' },
  { day: 'monday', title: 'Monday Foundation', focus: 'Organize the week, set priorities, calendar review' },
  { day: 'tuesday', title: 'Tuesday Fitness and Body Maintenance', focus: 'Glutes + hamstrings, protein and steps focus' },
  { day: 'wednesday', title: 'Wednesday Wellness and Regulation', focus: 'Nervous system reset, midweek check-in' },
  { day: 'thursday', title: 'Thursday Hair Treatment, Presence, and Creative Work', focus: 'Bond-repair wash, content batching' },
  { day: 'friday', title: 'Friday Beauty, Social, and Soft Life', focus: 'Full beauty routine, social plans' },
  { day: 'saturday', title: 'Saturday Recovery, Deep Clean, and Body Care', focus: 'Deep clean, cardio/core/mobility, body care' },
];

export const WORKOUT_SPLIT: { day: Weekday; label: string; focus: string; exercises: string[] }[] = [
  { day: 'monday', label: 'Day 1', focus: 'Glutes and Hamstrings', exercises: ['Hip thrust', 'Romanian deadlift', 'Seated hamstring curl', 'Cable kickbacks', 'Glute-focused back extensions'] },
  { day: 'tuesday', label: 'Day 2', focus: 'Upper Body and Posture', exercises: ['Lat pulldown', 'Seated row', 'Rear delt fly', 'Shoulder press', 'Face pulls'] },
  { day: 'wednesday', label: 'Day 3', focus: 'Recovery and Walking', exercises: ['Outdoor walking', 'Incline treadmill', 'Vacuum holds'] },
  { day: 'thursday', label: 'Day 4', focus: 'Glutes and Side Glutes', exercises: ['Bulgarian split squat', 'Abduction machine', 'Cable side kick', 'Step-ups', 'Glute bridge holds'] },
  { day: 'friday', label: 'Day 5', focus: 'Upper Body and Arms', exercises: ['Lateral raises', 'Triceps pushdown', 'Biceps curl', 'Shoulder press'] },
  { day: 'saturday', label: 'Day 6', focus: 'Cardio, Core, and Mobility', exercises: ['StairMaster', 'Cycling', 'Rowing', 'Planks', 'Dead bugs', 'Leg raises', 'Reverse crunches'] },
  { day: 'sunday', label: 'Day 7', focus: 'Full Rest', exercises: [] },
];

export const EXERCISE_LIBRARY = [
  'Hip thrust', 'Romanian deadlift', 'Seated hamstring curl', 'Cable kickbacks', 'Glute-focused back extensions',
  'Bulgarian split squat', 'Abduction machine', 'Cable side kick', 'Step-ups', 'Glute bridge holds',
  'Lat pulldown', 'Seated row', 'Rear delt fly', 'Shoulder press', 'Lateral raises', 'Face pulls',
  'Triceps pushdown', 'Biceps curl', 'Leg raises', 'Reverse crunches', 'Planks', 'Dead bugs', 'Vacuum holds',
  'Incline treadmill', 'Outdoor walking', 'StairMaster', 'Cycling', 'Rowing',
] as const;

// ---- Importable template definitions ----
// Each entry maps to one real row (routine/habit/task/calendar event) once
// a batch is confirmed. `recurrence` is only used for calendar_templates.

export type RoutineTemplate = {
  category: 'routines';
  name: string;
  description: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
  daysOfWeek?: Weekday[];
};

export type HabitTemplate = {
  category: 'habits';
  name: string;
  description: string;
  frequency: 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';
};

export type TaskTemplate = {
  category: 'tasks';
  title: string;
  description: string;
};

export type CalendarTemplate = {
  category: 'calendar_templates';
  title: string;
  description: string;
  startTime: string; // HH:mm, America/New_York
  durationMinutes: number;
  daysOfWeek: Weekday[];
};

export type BeautyTemplate = {
  category: 'beauty_routines';
  name: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
  products?: string[];
};

export type ImportTemplate = RoutineTemplate | HabitTemplate | TaskTemplate | CalendarTemplate | BeautyTemplate;

export const CORE_DAILY_ROUTINE_TEMPLATES: RoutineTemplate[] = [
  { category: 'routines', name: 'Morning Activation', description: 'Brain dump, Top 3 priorities, hydration, supplements, stomach vacuums, workout, protein breakfast, hygiene, AM skincare, hair, styling, calendar review.', timeOfDay: 'morning' },
  { category: 'routines', name: 'Midday Reset', description: 'Saint care check-in and a brief reset before the second half of the day.', timeOfDay: 'afternoon' },
  { category: 'routines', name: 'Evening Routine', description: 'Cleaning mini reset, PM skincare, body care, night hair protection.', timeOfDay: 'evening' },
  { category: 'routines', name: 'Night Shutdown', description: 'Tomorrow preparation, no-doomscroll shutdown, sleep wind-down.', timeOfDay: 'night' },
];

export const CORE_DAILY_HABIT_TEMPLATES: HabitTemplate[] = [
  { category: 'habits', name: 'Hydration', description: 'Water intake check-in.', frequency: 'daily' },
  { category: 'habits', name: 'Medication reminder', description: 'Prescribed medication as directed.', frequency: 'daily' },
  { category: 'habits', name: 'Supplements', description: 'Daily supplement stack.', frequency: 'daily' },
  { category: 'habits', name: 'Stomach vacuums', description: 'Core activation practice.', frequency: 'daily' },
  { category: 'habits', name: 'No-doomscroll shutdown', description: 'Phone down at night wind-down.', frequency: 'daily' },
];

export const HAIR_ROUTINE_TEMPLATES: RoutineTemplate[] = [
  { category: 'routines', name: 'Morning Hair Assessment + Rehydration', description: 'Assess, lightly rehydrate, leave-in conditioner, jojoba/lightweight oil on mids and ends, blend leave-out, style front pieces last.', timeOfDay: 'morning' },
  { category: 'routines', name: 'Nighttime Hair Protection', description: 'Gentle detangling, scalp massage, low-tension protection, bonnet or satin pillowcase.', timeOfDay: 'night' },
  { category: 'routines', name: 'Sunday Full Wash', description: 'Full wash day.', timeOfDay: 'morning', daysOfWeek: ['sunday'] },
  { category: 'routines', name: 'Thursday Bond-Repair Maintenance', description: 'Bond-repair treatment wash.', timeOfDay: 'evening', daysOfWeek: ['thursday'] },
];

export const BEAUTY_ROUTINE_TEMPLATES: BeautyTemplate[] = [
  { category: 'beauty_routines', name: 'AM Skincare + SPF', timeOfDay: 'morning' },
  { category: 'beauty_routines', name: 'PM Skincare', timeOfDay: 'night' },
  { category: 'beauty_routines', name: 'Body lotion and oil', timeOfDay: 'anytime' },
  { category: 'beauty_routines', name: 'Oral care', timeOfDay: 'anytime' },
  { category: 'beauty_routines', name: 'Gua sha + lymphatic drainage', timeOfDay: 'morning' },
  { category: 'beauty_routines', name: 'Facial posture + face yoga', timeOfDay: 'anytime' },
];

export const WELLNESS_ROUTINE_TEMPLATES: RoutineTemplate[] = [
  { category: 'routines', name: 'Everything Shower', description: 'Full body treatment shower.', timeOfDay: 'evening', daysOfWeek: ['sunday'] },
  { category: 'routines', name: 'Nail care', description: 'Nail maintenance.', timeOfDay: 'anytime' },
  { category: 'routines', name: 'Brow care', description: 'Brow maintenance.', timeOfDay: 'anytime' },
];

export const HOME_RESET_TEMPLATES: TaskTemplate[] = [
  { category: 'tasks', title: 'Weekly deep clean', description: 'Full home reset — part of Saturday recovery day.' },
  { category: 'tasks', title: 'Cleaning mini reset', description: 'Evening 10-minute reset.' },
];

export const FINANCE_REVIEW_TEMPLATES: TaskTemplate[] = [
  { category: 'tasks', title: 'Weekly finance review', description: 'Review spending, bills, and savings buckets.' },
  { category: 'tasks', title: 'Monthly finance reset', description: 'Full monthly financial reset.' },
];

export const PLANNING_RITUAL_TEMPLATES: TaskTemplate[] = [
  { category: 'tasks', title: 'Brain dump', description: 'Clear your head before planning the day.' },
  { category: 'tasks', title: 'Top 3 priorities', description: 'Choose the three things that matter most today.' },
];

export const SAINT_CARE_TEMPLATES: HabitTemplate[] = [
  { category: 'habits', name: 'Saint morning care', description: 'Feed, water, morning walk.', frequency: 'daily' },
  { category: 'habits', name: 'Saint evening care', description: 'Evening walk, affection check-in.', frequency: 'daily' },
];

export const MONTHLY_RESET_TEMPLATES: TaskTemplate[] = [
  { category: 'tasks', title: 'Monthly reset', description: 'Full monthly Glow OS review and reset.' },
];

export const SEASONAL_RESET_TEMPLATES: TaskTemplate[] = [
  { category: 'tasks', title: 'Seasonal reset', description: 'Seasonal beauty, wardrobe, and system audit.' },
];

export const YEARLY_RESET_TEMPLATES: TaskTemplate[] = [
  { category: 'tasks', title: 'Yearly reset', description: 'Annual Glow OS audit and goal reset.' },
];

// Recurring calendar templates (the only category that creates
// calendar_events — everything else creates routines/habits/tasks).
export const CALENDAR_TEMPLATES: CalendarTemplate[] = [
  { category: 'calendar_templates', title: 'Morning Activation Block', description: 'Core morning ritual.', startTime: '06:30', durationMinutes: 90, daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
  { category: 'calendar_templates', title: 'Night Shutdown Ritual', description: 'Wind-down and tomorrow prep.', startTime: '21:30', durationMinutes: 60, daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
  { category: 'calendar_templates', title: 'Sunday Reset', description: 'Full weekly reset and wash day.', startTime: '10:00', durationMinutes: 180, daysOfWeek: ['sunday'] },
  { category: 'calendar_templates', title: 'Workout Block', description: 'Scheduled workout per the weekly split.', startTime: '17:00', durationMinutes: 60, daysOfWeek: ['monday', 'tuesday', 'thursday', 'friday', 'saturday'] },
];

export const IMPORT_CATEGORY_TEMPLATES: Record<ImportCategory, ImportTemplate[]> = {
  routines: CORE_DAILY_ROUTINE_TEMPLATES,
  habits: CORE_DAILY_HABIT_TEMPLATES,
  tasks: [...HOME_RESET_TEMPLATES, ...PLANNING_RITUAL_TEMPLATES],
  weekly_themes: [],
  beauty_routines: BEAUTY_ROUTINE_TEMPLATES,
  hair_routines: HAIR_ROUTINE_TEMPLATES,
  wellness_routines: WELLNESS_ROUTINE_TEMPLATES,
  workout_plans: [],
  home_resets: HOME_RESET_TEMPLATES,
  finance_reviews: FINANCE_REVIEW_TEMPLATES,
  planning_rituals: PLANNING_RITUAL_TEMPLATES,
  saint_care: SAINT_CARE_TEMPLATES,
  calendar_templates: CALENDAR_TEMPLATES,
  monthly_resets: MONTHLY_RESET_TEMPLATES,
  seasonal_resets: SEASONAL_RESET_TEMPLATES,
  yearly_resets: YEARLY_RESET_TEMPLATES,
};

export function getWorkoutOfTheDay(day: Weekday) {
  return WORKOUT_SPLIT.find((w) => w.day === day) ?? WORKOUT_SPLIT[0];
}

export function getWeeklyTheme(day: Weekday) {
  return WEEKLY_THEMES.find((t) => t.day === day) ?? WEEKLY_THEMES[0];
}
