export const PERSONAL_OS_SOURCE_VERSION = 'glow-chat-2026-08-20-v1';

export type PersonalRoutineDefinition = {
  key: string;
  name: string;
  description: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
  daysOfWeek?: string[];
  steps: Array<{ title: string; notes?: string; durationMinutes?: number }>;
};

export const personalHabits = [
  { name: 'Brain dump', description: 'Capture tasks, to-dos and thoughts before organizing.', icon: 'brain' },
  { name: 'Hydration', description: 'Drink water consistently through the day.', icon: 'droplets' },
  { name: 'Medication', description: 'Track prescribed medication exactly as directed.', icon: 'pill' },
  { name: 'Supplements', description: 'Track the supplements already included in your routine.', icon: 'sparkles' },
  { name: 'Stomach vacuums', description: 'Deep-core engagement before movement when scheduled.', icon: 'activity' },
  { name: 'Gua sha', description: 'Light morning or full night sculpt according to the routine.', icon: 'sparkles' },
  { name: 'Skincare AM', description: 'Morning cleanse, hydration, barrier care and SPF.', icon: 'sun' },
  { name: 'Skincare PM', description: 'Night cleanse, scheduled treatment, hydration and barrier care.', icon: 'moon' },
  { name: 'Hair protection', description: 'Gentle handling, protect ends and use satin/silk at night.', icon: 'scissors' },
  { name: 'Movement', description: 'Assigned workout, Pilates, walking or recovery movement.', icon: 'dumbbell' },
  { name: 'Protein', description: 'Protein-focused meals to support the 2026 recomposition plan.', icon: 'utensils' },
  { name: 'Daily steps', description: 'Aim for the movement target in the fitness system.', icon: 'footprints' },
  { name: 'No doom scrolling', description: 'Protect the morning ritual and evening wind-down from scrolling.', icon: 'smartphone-off' },
  { name: 'Planning closure', description: 'Close the day, move unfinished work realistically and prepare tomorrow.', icon: 'calendar' },
] as const;

export const personalRoutines: PersonalRoutineDefinition[] = [
  {
    key: 'morning-ritual',
    name: 'Morning Ritual',
    description: 'Activate mind, sculpt body, beautify calmly, and enter the day regulated and composed.',
    timeOfDay: 'morning',
    steps: [
      { title: 'Brain dump first', notes: 'Open Notes. Capture tasks, to-dos and thoughts without organizing.' },
      { title: 'Choose three goals', notes: 'Choose only three priorities for today.' },
      { title: 'Stomach vacuums', notes: 'Complete before movement.' },
      { title: 'Drink water', notes: 'Water comes before medication and supplements.' },
      { title: 'Take prescribed medication', notes: 'Follow the existing prescription directions.' },
      { title: 'Take scheduled supplements', notes: 'Use the supplement list already saved in Glow OS.' },
      { title: 'Light gua sha', notes: 'Neck, jaw, cheeks, under-eyes gently, forehead, then drain down neck.' },
      { title: 'Pilates or assigned workout', notes: 'Controlled pace, mind-body focus, no phone.', durationMinutes: 30 },
      { title: 'Protein-focused breakfast', notes: 'Sit to eat. No scrolling.' },
      { title: 'Hygiene', notes: 'Brush teeth, Waterpik/mouthwash, deodorant, shower if scheduled.' },
      { title: 'AM skincare', notes: 'Cleanse, toner, serums, barrier cream, SPF when exposed.' },
      { title: 'Hair ritual', notes: 'Assess hair cycle, hydrate only if needed, protect ends, style front pieces last.' },
      { title: 'Get dressed and lock in', notes: 'Outfit, jewelry, bag, keys and final mirror check.' },
    ],
  },
  {
    key: 'midday-reset',
    name: 'Midday Reset',
    description: 'Re-center, regulate and continue the day calmly.',
    timeOfDay: 'afternoon',
    steps: [
      { title: 'Pause completely', notes: 'Take five slow nasal breaths with a longer exhale.' },
      { title: 'Review what is already complete', notes: 'Do not add new tasks during the reset.' },
      { title: 'Choose what matters for the rest of today', notes: 'Check which of the three goals still needs energy.' },
      { title: 'Light physical reset', notes: 'Short walk, gentle stretch or posture reset.' },
      { title: 'Hydrate and eat', notes: 'Balanced meal or protein snack; sit down and avoid the phone.' },
      { title: 'Quick appearance reset', notes: 'Lip care, deodorant check, hair adjustment and makeup only if needed.' },
      { title: 'One to two minutes of silence', notes: 'No music, no input.' },
      { title: 'Choose one next action', notes: 'Return to work gently.' },
    ],
  },
  {
    key: 'night-ritual',
    name: 'Night Ritual',
    description: 'Beautify deeply, close the day, prepare tomorrow and protect sleep.',
    timeOfDay: 'night',
    steps: [
      { title: 'Quick room clean' },
      { title: 'Digital sunset', notes: 'Do Not Disturb, app blocking and dim lights. No new problems.' },
      { title: 'Remove makeup and prep hair', notes: 'Follow scheduled scalp or ends care.' },
      { title: 'Shower ritual', notes: 'Cleanse body; exfoliation, treatment, wash day or everything shower only when scheduled.' },
      { title: 'Post-shower body care', notes: 'Pat dry, lotion/oil, scheduled body treatment, deodorant, fresh pajamas.' },
      { title: 'PM skincare', notes: 'Cleanse, toner, serums, barrier cream and lip care; scheduled treatment only.' },
      { title: 'Night gua sha / red light', notes: 'Use the full sculpt sequence when scheduled. No phone.' },
      { title: 'Night hair protection', notes: 'Detangle gently, hydrate if needed, seal ends, loose protective style, satin/silk.' },
      { title: 'Pack for tomorrow', notes: 'Include the items needed for work, gym, shower and beauty.' },
      { title: 'Planning and closure', notes: 'Review completed work, move unfinished tasks realistically, brain dump tomorrow and choose three goals.' },
      { title: 'Prepare medication and water', notes: 'Place morning medication and water by bed when appropriate.' },
      { title: 'Nervous-system seal', notes: 'Silence, slow breathing, body scan, then lights off with no scrolling.' },
    ],
  },
  {
    key: 'sunday-reset',
    name: 'Sunday Reset + Full Maintenance',
    description: 'Reset body, home, appearance and life. Sunday anchors the week.',
    timeOfDay: 'anytime',
    daysOfWeek: ['sunday'],
    steps: [
      { title: 'Full home reset', notes: 'Vacuum, steam mop, bathroom, mirrors/surfaces, appliances, fridge scan and finish laundry.' },
      { title: 'Wash sheets and duvet' },
      { title: 'Wash dog bedding' },
      { title: 'Full beauty reset', notes: 'Body exfoliation, shave, hair mask, face mask, fake tan and brow maintenance as scheduled.' },
      { title: 'Body recovery', notes: 'Sauna if available, long walk and early night.' },
      { title: 'Weekly brain dump' },
      { title: 'Plan daily and weekly tasks' },
      { title: 'Schedule appointments, work and classes' },
      { title: 'Review routines and rituals' },
      { title: 'Review fitness plan' },
      { title: 'Review finances' },
      { title: 'Review medication and supplements', notes: 'Update tracking only; medication changes belong with the prescriber.' },
      { title: 'Rotational maintenance', notes: 'Closet, fridge, progress photos, hair/nail/brow appointments, room/car deep clean or pantry inventory as needed.' },
    ],
  },
  {
    key: 'monday-foundation',
    name: 'Monday Reset + Foundation',
    description: 'Set the tone and remove overwhelm.',
    timeOfDay: 'anytime',
    daysOfWeek: ['monday'],
    steps: [
      { title: 'Hair maintenance', notes: 'Wash or maintain protective style; deep condition/mask and scalp care if scheduled.' },
      { title: 'Finish laundry or delayed linens' },
      { title: 'Bathroom touch-up' },
      { title: 'Choose weekly focus theme' },
      { title: 'Brief goal review' },
      { title: 'Schedule non-negotiables into calendar' },
    ],
  },
  {
    key: 'tuesday-fitness-maintenance',
    name: 'Tuesday Fitness + Body Maintenance',
    description: 'Body alignment and upkeep.',
    timeOfDay: 'anytime',
    daysOfWeek: ['tuesday'],
    steps: [
      { title: 'Review workouts for the week' },
      { title: 'Adjust workout plan if needed' },
      { title: 'Deep stretch session' },
      { title: 'Nail maintenance' },
      { title: 'Brow maintenance' },
      { title: 'Refill supplements if low' },
    ],
  },
  {
    key: 'wednesday-wellness',
    name: 'Wednesday Wellness + Regulation',
    description: 'Midweek nervous-system reset.',
    timeOfDay: 'anytime',
    daysOfWeek: ['wednesday'],
    steps: [
      { title: 'Gentle movement or walk' },
      { title: 'Breathwork or stretching' },
      { title: 'Hydration focus' },
      { title: 'Extended skincare' },
      { title: 'Face yoga or gua sha' },
      { title: 'Early wind-down' },
    ],
  },
  {
    key: 'thursday-presence',
    name: 'Thursday Dynasty + Presence',
    description: 'Identity, power and output.',
    timeOfDay: 'anytime',
    daysOfWeek: ['thursday'],
    steps: [
      { title: 'Intentional appearance', notes: 'Makeup, styled outfit, jewelry and fragrance.' },
      { title: 'Content planning or batching' },
      { title: 'Brand review' },
      { title: 'Presence check', notes: 'Posture, tone and boundaries.' },
      { title: 'Hair maintenance wash', notes: 'Thursday is the repair/maintenance wash day in the hair system.' },
    ],
  },
  {
    key: 'friday-soft-life',
    name: 'Friday Soft Life + Social',
    description: 'Pleasure, polish and ease.',
    timeOfDay: 'anytime',
    daysOfWeek: ['friday'],
    steps: [
      { title: 'Slower pace' },
      { title: 'Light beauty focus' },
      { title: 'Beauty polish for the evening' },
      { title: 'Outfit planning' },
      { title: 'Fragrance ritual' },
    ],
  },
  {
    key: 'saturday-deep-clean',
    name: 'Saturday Deep Clean + Body Day',
    description: 'Physical reset with one main theme.',
    timeOfDay: 'anytime',
    daysOfWeek: ['saturday'],
    steps: [
      { title: 'Deep clean one zone' },
      { title: 'Car care if needed' },
      { title: 'Everything shower' },
      { title: 'Fresh sheets if not already done' },
      { title: 'Calm low-stimulation night' },
    ],
  },
];

export const workoutWeek = [
  { day: 1, name: 'Glutes + Hamstrings', purpose: 'Glute growth, projection, hamstring shaping and lower-body density.', exercises: ['Barbell hip thrust', 'Romanian deadlift', 'Seated hamstring curl', 'Cable kickbacks', '45° glute-focused back extensions', 'Incline treadmill walking'] },
  { day: 2, name: 'Upper Body + Posture', purpose: 'V-taper illusion, posture, shoulder shaping and upper-back definition.', exercises: ['Lat pulldown', 'Seated row', 'Rear delt fly', 'Lateral raises', 'Shoulder press', 'Face pulls'] },
  { day: 3, name: 'Recovery + Walking', purpose: 'Recovery, active movement and nervous-system support.', exercises: ['Walking', 'Pilates', 'Stretching', 'Mobility', 'Light core work'] },
  { day: 4, name: 'Glutes + Side Glutes', purpose: 'Side-glute fullness, rounded hips and silhouette shaping.', exercises: ['Lighter hip thrusts', 'Bulgarian split squats', 'Abduction machine', 'Cable side kicks', 'Step-ups', 'Glute bridge holds'] },
  { day: 5, name: 'Upper Body + Arms', purpose: 'Upper-body balance, arm tone and posture support.', exercises: ['Seated row', 'Rear delt fly', 'Tricep pushdowns', 'Bicep curls', 'Lateral raises'] },
  { day: 6, name: 'Cardio + Core + Mobility', purpose: 'Conditioning, deep-core work, recovery support and mobility.', exercises: ['Incline treadmill / walking / stairmaster / cycling', 'Leg raises', 'Reverse crunches', 'Planks', 'Dead bugs', 'Vacuum holds'] },
  { day: 7, name: 'Full Rest', purpose: 'Muscle repair and nervous-system reset.', exercises: ['Recovery is productive'] },
] as const;

export function workoutForDate(date = new Date()) {
  const jsDay = date.getDay();
  const planDay = jsDay === 0 ? 7 : jsDay;
  return workoutWeek.find((item) => item.day === planDay) ?? workoutWeek[6];
}

export function routinesForDate(date = new Date()) {
  const day = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return personalRoutines.filter((routine) => !routine.daysOfWeek || routine.daysOfWeek.includes(day));
}

export function visualCardItems(kind: string, date = new Date()) {
  const normalized = kind.toLowerCase();
  if (normalized.includes('sunday')) return personalRoutines.find((r) => r.key === 'sunday-reset')?.steps.map((s) => s.title) ?? [];
  if (normalized.includes('midday')) return personalRoutines.find((r) => r.key === 'midday-reset')?.steps.map((s) => s.title) ?? [];
  if (normalized.includes('night') || normalized.includes('evening')) return personalRoutines.find((r) => r.key === 'night-ritual')?.steps.map((s) => s.title) ?? [];
  if (normalized.includes('workout') || normalized.includes('fitness')) return workoutForDate(date).exercises;
  if (normalized.includes('week')) return workoutWeek.map((item) => `Day ${item.day}: ${item.name}`);
  return personalRoutines.find((r) => r.key === 'morning-ritual')?.steps.map((s) => s.title) ?? [];
}
