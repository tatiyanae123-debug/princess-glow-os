export type RoutineChapterBlueprint = {
  title: string;
  description: string;
  match: RegExp;
};

export type DailyAnchorBlueprint = {
  key: 'morning' | 'midday' | 'evening' | 'night';
  label: string;
  verb: string;
  timeLabel: string;
  purpose: string;
  tone: string;
  routineMatch: RegExp;
  chapters: RoutineChapterBlueprint[];
};

export const DAILY_ANCHORS: DailyAnchorBlueprint[] = [
  {
    key: 'morning',
    label: 'Morning',
    verb: 'Activate',
    timeLabel: '5:00–10:00 AM',
    purpose: 'Activate mind. Wake the body. Beautify calmly. Enter the day prepared.',
    tone: 'from-[#fff8dc] via-[#fffdf4] to-[#f5e7c4]',
    routineMatch: /morning/i,
    chapters: [
      { title: 'Wake + Mind', description: 'Brain dump first. Organize second.', match: /brain|note|top 3|goal|calendar|plan|wake|scroll|alarm/i },
      { title: 'Body Activation', description: 'Water, supplements, core activation, movement.', match: /water|hydrat|med|supplement|vacuum|pilates|workout|movement|stretch/i },
      { title: 'Nourish', description: 'Protein-centered breakfast and calm hydration.', match: /breakfast|protein|meal|eat|nourish/i },
      { title: 'Beauty', description: 'Hygiene, skin, hair, makeup and body care.', match: /brush|teeth|hygiene|skin|gua|face|hair|makeup|body|shower|deodorant|spf/i },
      { title: 'Leave Ready', description: 'Outfit, bag, keys and final preparation.', match: /outfit|dress|jewelry|bag|keys|ready|mirror|pack/i },
    ],
  },
  {
    key: 'midday',
    label: 'Midday',
    verb: 'Regulate',
    timeLabel: '12:00–2:00 PM',
    purpose: 'Re-center. Regulate. Restore focus. Choose one next action.',
    tone: 'from-[#edf4df] via-[#f9fbf3] to-[#dce8cf]',
    routineMatch: /midday|afternoon reset/i,
    chapters: [
      { title: 'Pause', description: 'Slow breathing and release tension.', match: /pause|breath|jaw|shoulder|silence/i },
      { title: 'Progress Check', description: 'Review what is done and what still matters.', match: /note|goal|priority|task|complete|review/i },
      { title: 'Move + Refuel', description: 'Walk or stretch, hydrate and eat.', match: /walk|stretch|posture|water|hydrat|meal|protein|snack|eat/i },
      { title: 'Refresh', description: 'Light hygiene and appearance reset.', match: /hygiene|face|lip|deodorant|hair|makeup|outfit|spf/i },
      { title: 'Return', description: 'Choose one next action and continue gently.', match: /next|return|focus|action|work/i },
    ],
  },
  {
    key: 'evening',
    label: 'Evening',
    verb: 'Transition',
    timeLabel: '4:00–8:30 PM',
    purpose: 'Transition out of execution mode. Reset body, space and attention.',
    tone: 'from-[#f8e7df] via-[#fff8f4] to-[#edd0c4]',
    routineMatch: /evening|wind.?down|cleaning mini reset/i,
    chapters: [
      { title: 'Transition', description: 'Dinner, messages and a softer pace.', match: /dinner|eat|message|transition|reset body/i },
      { title: 'Space Reset', description: 'Return the room to calm.', match: /room|clean|trash|surface|laundry|dish|vanity|space/i },
      { title: 'Prepare Night', description: 'Set up the next routine before fatigue rises.', match: /prepare|shower|night|phone|light/i },
    ],
  },
  {
    key: 'night',
    label: 'Night',
    verb: 'Close',
    timeLabel: '8:30–11:00 PM',
    purpose: 'Beautify deeply. Close the day. Prepare tomorrow. Protect sleep.',
    tone: 'from-[#eee8f7] via-[#fbf8ff] to-[#dcd1eb]',
    routineMatch: /night|sleep|bedtime/i,
    chapters: [
      { title: 'Digital Sunset', description: 'Dim stimulation and stop solving new problems.', match: /phone|scroll|digital|dnd|light|shutdown/i },
      { title: 'Pre-Shower', description: 'Remove makeup, prepare hair and slow down.', match: /pre.?shower|remove makeup|hair prep/i },
      { title: 'Shower + Body', description: 'Cleanse, treatments and post-shower care.', match: /shower|body|exfol|lotion|oil|pajama|deodorant/i },
      { title: 'Face + Hair', description: 'PM skincare, gua sha and night hair protection.', match: /skin|face|gua|red light|hair|bonnet|scalp|lip/i },
      { title: 'Tomorrow Prep', description: 'Pack, plan, brain dump and choose tomorrow’s priorities.', match: /tomorrow|pack|calendar|brain|goal|alarm|water nearby|medication by bed/i },
      { title: 'Nervous System Seal', description: 'Silence, breathing, body scan and sleep.', match: /breath|body scan|silence|sleep|lights off|affirm/i },
    ],
  },
];

export const WEEKDAY_EXTRAS: Record<number, { title: string; theme: string; items: string[] }> = {
  0: { title: 'Sunday extras', theme: 'Reset + Full Maintenance', items: ['Whole-body fascia reset', 'Chest opening stretch', 'Slow calm gua sha', 'Face posture audit'] },
  1: { title: 'Monday extras', theme: 'Foundation + Organization', items: ['Full neck + shoulder fascia release', 'Deep SCM check + release', 'Full gua sha sculpt', 'Scalp tension check', 'Long de-puffing drainage'] },
  2: { title: 'Tuesday extras', theme: 'Fitness + Body Maintenance', items: ['Cheek + masseter release', 'Jawline sculpt', 'Extra posture work', 'Tongue posture training · 5 min'] },
  3: { title: 'Wednesday extras', theme: 'Wellness + Regulation', items: ['Full lymphatic drainage', 'Chest + rib release', 'Light gua sha', 'Tension correction on uneven side'] },
  4: { title: 'Thursday extras', theme: 'Hair Maintenance + Presence', items: ['Cheek lift gua sha', 'Scalp fascia sweep', 'Sleeping posture training', 'Deep breathing session'] },
  5: { title: 'Friday extras', theme: 'Beauty + Soft Life', items: ['Jaw reset', 'Masseter + temple release', 'Brow + eye lifts', 'Hair mask + scalp massage'] },
  6: { title: 'Saturday extras', theme: 'Recovery + Preparation', items: ['Long gua sha sculpt', 'Full head massage', 'Neck mobility routine', 'Sinus drainage focus'] },
};

export const PREP_FOR_MORNING = [
  'Fill water bottle',
  'Set out medication/supplements',
  'Choose outfit',
  'Prepare gym clothes',
  'Charge iPad + phone',
];

export const SOURCE_RULES = [
  'Brain dump first → organize second',
  'Water before supplements',
  'Movement before breakfast',
  'Skincare before makeup',
  'Main hair styling before front pieces',
  'Front hair pieces are styled last',
  'Calm is success',
  'Consistency beats perfection',
];

export const MAINTENANCE_GROUPS = [
  { key: 'hair', label: 'Hair', match: /hair|wig|scalp|wash day/i },
  { key: 'skin', label: 'Skin', match: /skin|gua|face|beauty/i },
  { key: 'body', label: 'Body', match: /body|shower|fitness|movement|wellness/i },
  { key: 'home', label: 'Home', match: /clean|laundry|room|car|home/i },
  { key: 'planning', label: 'Planning', match: /plan|brain|finance|budget|calendar|admin/i },
  { key: 'wellness', label: 'Wellness', match: /wellness|reset|sleep|breath|lymph|posture/i },
];

export const LONG_CYCLE_MATCH = /monthly|seasonal|yearly|new year|spring|midyear|fall structure|december/i;
export const WEEKLY_MATCH = /sunday reset|midweek|weekly|wash day|laundry|finance|hair refresh/i;

export type HairContext = 'u-part' | 'natural' | 'straightened' | 'braids' | 'other';

export function stepFitsHairContext(title: string, notes: string | null, context: HairContext) {
  const text = `${title} ${notes ?? ''}`.toLowerCase();
  if (!/hair|wig|leave-out|scalp|braid|curl|mist|aloe|oil|bonnet|roller/.test(text)) return true;
  if (context === 'straightened' && /mist|aloe|water \+ aloe|rehydrate/.test(text)) return false;
  if (context === 'braids' && /leave-out|u-part|roller|curl front|wig/.test(text)) return false;
  if (context === 'u-part') return true;
  if (context === 'natural' && /u-part|wig|leave-out/.test(text)) return false;
  return true;
}
