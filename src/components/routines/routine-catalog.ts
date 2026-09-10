export type EnergyMode = 'Recovery' | 'Low' | 'Medium' | 'High';
export type TimeOfDay = 'Morning' | 'Between' | 'Afternoon' | 'Evening' | 'Night' | 'Any';
export type Situation = 'Normal Day' | 'Work Day' | 'Home Day' | 'Going Out' | 'Travel' | 'Sick' | 'Recovery' | 'Event Prep' | 'Reset Day';

export type RoutineObject = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  frequency: string;
  timeOfDay: TimeOfDay[];
  lifeAreas: string[];
  situations: Situation[];
  steps: string[];
  optional?: string[];
  productsTools?: string[];
  storage?: string[];
  avoid?: string[];
  cleanup?: string[];
  resultFields?: string[];
  nextDue?: string;
};

export type RoutineCategory = {
  id: string;
  title: string;
  subtitle: string;
  art: string;
  accent: string;
  note: string;
  tabs: string[];
  routineIds: string[];
};

const slug = (value: string) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const CORE: Record<string, Partial<RoutineObject>> = {
  'Morning Routine': {
    subtitle: 'Wake · orient · hydrate · care · plan', duration: '15–45 min', frequency: 'Daily', timeOfDay: ['Morning'],
    steps: ['Wake and orient', 'Morning hydration', 'First 20', 'Make bed or quick environment reset', 'Morning hygiene', 'Morning wellness', 'AM skincare', 'Morning hair', 'Body + grooming', 'Get dressed', 'Morning food', 'Medication or approved supplements where applicable', 'Morning planning', 'Start the day'],
    optional: ['Longer walk', 'Meditation', 'Journal', 'Gua Sha or Face Yoga when appropriate'],
    cleanup: ['Return products and tools home', 'Leave the bedroom and bathroom reset'],
  },
  'First 20': {
    subtitle: 'Move, breathe or journal before uncontrolled scrolling', duration: '5–20 min', frequency: 'Daily', timeOfDay: ['Morning'],
    steps: ['Drink water', 'Open curtains or step into daylight', 'Choose one or a small combination: walk, meditation, reading, journaling', 'Keep social scrolling outside the First 20'],
  },
  'Midday Reset': {
    subtitle: 'Recenter and recharge', duration: '5–15 min', frequency: 'Daily', timeOfDay: ['Between', 'Afternoon'],
    steps: ['Pause and check energy', 'Take five slow breaths', 'Relax jaw and shoulders', 'Hydrate', 'Check hunger and eat if needed', 'Walk, stretch or use the restroom', 'Adjust the schedule if capacity changed', 'Return to one next action'],
  },
  'Evening Routine': {
    subtitle: 'Transition and unwind', duration: '30–60 min', frequency: 'Daily', timeOfDay: ['Evening'],
    steps: ['Close work', 'Capture unfinished items', 'Transition out of work mode', 'Workout or movement if scheduled', 'Shower as needed', 'Dinner', 'Small life or home admin', 'Leisure or social time', 'Begin night landing'],
  },
  'Night Routine': {
    subtitle: 'Close the day with care', duration: '20–40 min', frequency: 'Daily', timeOfDay: ['Night'],
    steps: ['Close the day', '10-minute tidy', 'Return everything home', 'Tomorrow setup', 'Digital sunset', 'Night hygiene', 'PM skincare mode', 'Night hair', 'Body care', 'Reflection', 'Calming activity', 'Sleep routine'],
  },
  'Sunday Reset': {
    subtitle: 'A fresh week ahead', duration: '2–4 hr', frequency: 'Weekly', timeOfDay: ['Afternoon', 'Evening'],
    steps: ['Energy check', 'Weekly reflection', 'Review month and calendar', 'Collect fixed commitments', 'Plan the week', 'Prepare Monday and choose priorities', 'Home reset', 'Food reset', 'Hair reset if due', 'Beauty maintenance if due', 'Digital reset if due', 'Prepare tomorrow', 'Stop and preserve rest'],
  },
  'AM Full Routine': {
    subtitle: 'Cleanse · treat · hydrate · protect', duration: '7–12 min', frequency: 'Daily', timeOfDay: ['Morning'],
    steps: ['Cleanser', 'Toner or essence', 'Vitamin C if part of the current routine', 'Hydrating serum', 'Barrier moisturizer', 'Sunscreen on face, neck and chest', 'Lip care'],
    optional: ['BioDance mask when scheduled', 'Face Yoga', 'Gua Sha when compatible'],
    avoid: ['Do not add extra active ingredients just because energy is high'],
  },
  'PM Standard Routine': {
    subtitle: 'Remove · cleanse · treat · moisturize', duration: '7–12 min', frequency: 'Daily', timeOfDay: ['Night'],
    steps: ['Remove makeup if necessary', 'Cleanse or double cleanse as appropriate', 'Toner if appropriate', 'Scheduled compatible treatment', 'Barrier moisturizer', 'Eye care', 'Lip care'],
  },
  'PM Retinoid Routine': {
    subtitle: 'Exact retinoid or prescription schedule', duration: '6–10 min', frequency: 'Scheduled', timeOfDay: ['Night'],
    steps: ['Check exact product and schedule', 'Check recent irritation and recent procedures', 'Cleanse', 'Use only compatible supporting products', 'Apply retinoid only according to the actual directions', 'Moisturize and support barrier', 'Log irritation or result'],
    avoid: ['Prescription directions override source tutorials', 'Do not stack incompatible actives'],
  },
  'PM Recovery Routine': {
    subtitle: 'Gentle cleanse · barrier support · comfort', duration: '5–8 min', frequency: 'As needed', timeOfDay: ['Night'],
    steps: ['Gentle cleanse', 'Hydrating toner if appropriate', 'Hydrating or barrier serum if owned and compatible', 'Barrier moisturizer', 'Lip care', 'Skip unnecessary actives'],
  },
  'Morning Hair': {
    subtitle: 'Release · assess · hydrate only if needed · blend · style', duration: '5–15 min', frequency: 'Daily', timeOfDay: ['Morning'],
    steps: ['Remove bonnet or scarf gently', 'Let hair settle', 'Assess dryness, frizz, ends, blending and style longevity', 'Rehydrate only if needed', 'Use a small amount of leave-in only if needed', 'Seal lightly on mids and ends', 'Check leave-out', 'Blend forward, backward and downward', 'Add U-part if wearing', 'Style main hair', 'Style front pieces last', 'Return products and tools home'],
    avoid: ['Do not soak roots or over-wet bundles', 'Avoid heavy buildup and stiff styling'],
  },
  'Night Hair': {
    subtitle: 'Remove · detangle · assess · secure · protect', duration: '5–15 min', frequency: 'Daily', timeOfDay: ['Night'],
    steps: ['Remove removable wig if applicable', 'Take down tight style', 'Detangle gently with fingers first', 'Use a wide-tooth comb if needed, starting at ends', 'Check moisture', 'Mist only if needed', 'Use light serum or oil on mids and ends', 'Complete scheduled scalp care', 'Use treatments only according to actual directions', 'Secure loosely', 'Protect with satin or silk', 'Prep tomorrow’s hairstyle'],
  },
  'Sunday Full Reset': {
    subtitle: 'Pre-oil · double shampoo · mask · condition · style', duration: '90–150 min', frequency: 'Weekly', timeOfDay: ['Afternoon', 'Evening'],
    steps: ['Detangle', 'Coconut oil on mids and ends for the source timing of about 30 minutes', 'Shampoo #1 for buildup or oil if needed', 'Shampoo #2 for the target result', 'Mask or deep condition', 'Detangle', 'Condition', 'Rinse', 'Gentle towel dry', 'Leave-in', 'Heat protectant if heat styling', 'Light oil or serum if appropriate', 'Blowout or reset style', 'Front pieces last'],
  },
  'Thursday Bond Repair': {
    subtitle: 'Bond treatment · double shampoo · condition · restyle', duration: '60–90 min', frequency: 'Weekly', timeOfDay: ['Evening'],
    steps: ['Apply bond treatment for the stored source timing of about 10 minutes', 'Double shampoo', 'Condition', 'Gentle dry', 'Leave-in', 'Heat protectant if needed', 'Restyle or prep the next look'],
  },
  'Everything Shower': {
    subtitle: 'A container routine built from what is actually due', duration: '30–120 min', frequency: 'Weekly', timeOfDay: ['Evening'],
    steps: ['Check what is actually due', 'Pre-shower hair treatment if scheduled', 'Hair wash or treatment if due', 'Body cleanse', 'Body exfoliation if due', 'Shave if wanted', 'Foot or nail care if due', 'Rinse and dry gently', 'Body lotion', 'Body oil if desired', 'Deodorant', 'Hair post-wash care', 'Skincare', 'Fragrance layering if desired', 'Clean tools and return products home'],
  },
  'Day 1 · Glutes + Hamstrings': {
    subtitle: 'Heavy glute and hamstring strength day', duration: '45–75 min', frequency: 'Weekly', timeOfDay: ['Any'],
    steps: ['Warm up', 'Barbell hip thrust · source range 8–10', 'Romanian deadlift · 8–10', 'Seated hamstring curl · 10–12', 'Cable kickback · 12–15', '45° glute-focused back extension · 12–15', 'Incline treadmill walk', 'Log progression and recover'],
  },
  'Day 2 · Upper Body + Posture': { subtitle: 'Upper back, shoulders and posture', duration: '45–60 min', frequency: 'Weekly', steps: ['Lat pulldown', 'Seated row', 'Rear-delt fly', 'Lateral raise', 'Shoulder press', 'Face pull'] },
  'Day 3 · Recovery + Walking': { subtitle: 'Keep recovery restorative', duration: '20–45 min', frequency: 'Weekly', steps: ['Choose walking, Pilates, stretching, mobility or light core', 'Keep intensity restorative', 'Hydrate', 'Stop before it turns into another hard workout'] },
  'Day 4 · Glutes + Side Glutes': { subtitle: 'Glutes and side-glute emphasis', duration: '45–70 min', frequency: 'Weekly', steps: ['Lighter hip thrust', 'Bulgarian split squat with forward lean from source', 'Abduction machine', 'Cable side kick', 'Step-up', 'Glute bridge hold'] },
  'Day 5 · Upper Body + Arms': { subtitle: 'Upper body and arms', duration: '40–60 min', frequency: 'Weekly', steps: ['Seated row', 'Rear-delt fly', 'Triceps pushdown', 'Biceps curl', 'Lateral raise'] },
  'Day 6 · Cardio + Core + Mobility': { subtitle: 'Cardio, deep core and mobility', duration: '35–60 min', frequency: 'Weekly', steps: ['Choose cardio', 'Leg raises', 'Reverse crunch', 'Plank', 'Dead bug', 'Vacuum holds', 'Mobility'] },
  'Day 7 · Full Rest': { subtitle: 'Recovery is part of the program', duration: 'All day', frequency: 'Weekly', steps: ['Rest', 'Walk only if it feels restorative', 'Hydrate and eat normally', 'No automatic make-up workout'] },
  'Sunday Food Reset': {
    subtitle: 'Inventory first · gaps second · prep for the real week', duration: '60–150 min', frequency: 'Weekly', timeOfDay: ['Afternoon'],
    steps: ['Check fridge', 'Check freezer', 'Check pantry', 'Identify Use First foods', 'Check schedule and workouts', 'Choose meals', 'Check owned ingredients', 'Generate grocery gaps', 'Shop', 'Meal prep', 'Portion and store', 'Prepare low-energy backups', 'Check supplement inventory', 'Reset kitchen'],
  },
  'Weekly Planning': {
    subtitle: 'Month → calendar → week → Monday → priorities → time blocks', duration: '30–60 min', frequency: 'Weekly', timeOfDay: ['Afternoon', 'Evening'],
    steps: ['Look at monthly calendar', 'Open Google Calendar', 'Collect fixed events', 'Move relevant information into the weekly plan', 'Bring Monday into the daily plan', 'Add Monday theme', 'Choose Top 3', 'Place priorities in the schedule', 'Time block with buffers and rest'],
  },
  'Work Shutdown': {
    subtitle: 'Capture · move · close · leave work mode', duration: '10–20 min', frequency: 'Work days', timeOfDay: ['Evening'],
    steps: ['Capture unfinished work', 'Mark done, delayed, blocked, moved or cancelled', 'Move unfinished work somewhere real', 'Build Tomorrow Parking Lot', 'Identify tomorrow’s first action', 'Close workspace', 'Leave work mode'],
  },
  'Digital Reset': {
    subtitle: 'Reduce digital noise and return information home', duration: '10–30 min', frequency: 'Weekly', timeOfDay: ['Any'],
    steps: ['Camera roll and screenshots', 'Downloads', 'Notes', 'Email', 'Browser tabs', 'Files', 'Apps and social cleanup as due', 'Return important items to their real home'],
  },
};

const category = (id: string, title: string, subtitle: string, art: string, accent: string, note: string, tabs: string[], names: string[]): RoutineCategory => ({ id, title, subtitle, art, accent, note, tabs, routineIds: names.map(slug) });

const CATEGORY_SEEDS: RoutineCategory[] = [
  category('daily-life','Daily Life','Structure your everyday.','☀️','#e6ab62','Intentional days create a beautiful life.',['All','Morning','Midday','Evening','Night','Planning','Home','Errands','Social','Reset','Special'],['Morning Routine','First 20','Midday Reset','Afternoon Routine','Evening Routine','Night Routine','Tomorrow Setup','Daily Planning','Daily Reflection','Workday Routine','Work Shutdown','Home Reset','10-Minute Tidy','Return Everything Home','Laundry Routine','Cleaning Reset','Errand Routine','Social & Friend Time','Travel Routine','Sick Day Routine','Event Prep Routine','Reset Day','Sunday Reset','Monthly Reset','Seasonal Reset','Yearly Reset','Birthday Routine','Vacation Mode']),
  category('planning','Planning','Plan with clarity.','🗒️','#c3a087','Small plans. Big results.',['All','Capture','Today','Focus','Weekly','Monthly','Reviews','Travel + Events'],['Quick Capture','Brain Dump','Fluff List','Daily Planning','Top 1','Top 3','High-Energy Six Tasks','Time Blocking','Energy Planning','Deep Work','50 / 10 Focus','Admin Batch','Creative Batch','Errand Batch','Portable Tasks','Daily Theme','Workday Setup','Work Shutdown','Tomorrow Parking Lot','Weekly Reflection','Weekly Planning','Monthly Planning','Monthly Reflection','Goal Review','Capacity Review','Duration Review','Digital Planning Reset','Travel Planning','Event Reverse Planning']),
  category('habits','Habits','Small habits. Big results.','🌱','#89a579','Consistent today. A brighter tomorrow.',['All','Morning','Day','Night','Weekly','Home','Digital','Proof'],['Morning Hydration','No Scroll Morning','Meditation','Walking','Daylight','Gratitude','Journal','Reading','Affirmations','Make Bed','Energy Check','Portable Tasks','Deep Work','Movement Break','Stretch Break','Intentional Break','Hydration','Task Capture','Tomorrow Setup','10-Minute Tidy','Return Everything Home','Digital Boundary','Daily Reflection','Sleep Routine','Sunday Reset','Weekly Planning','Digital Reset','Sunday Food Reset','Beauty Maintenance','Hair Maintenance','Daily Proof','1% Better','Portfolio of Proof']),
  category('food','Food + Nutrition','Fuel your best self.','🥣','#bd8062','Good food. A better you.',['All','Morning','Meals','Hydration','Planning','Prep','Inventory','Low Energy','Travel'],['Morning Food','Breakfast','High-Protein Breakfast','Midday Meal','Work Lunch','Dinner','Snacks','Pre-Workout Food','Post-Workout Food','Hydration','Morning Hydration','Midday Hydration','Workout Hydration','Meal Planning','Grocery Planning','Grocery Shopping','Sunday Food Reset','Ingredient Prep','Batch Cooking','Repeat Meals','Leftovers','Use First','Fridge Reset','Freezer Reset','Pantry Reset','Emergency Food','Low-Energy Food','Travel Food','Workday Food','Event-Day Food','Food Inventory','Supplements','Supplement Restock']),
  category('wellness','Wellness','A calmer, healthier you.','🪨','#91a091','A calmer mind. A brighter you.',['All','Morning','Midday','Evening','Sleep','Recovery','Devices','Reviews','Care'],['Morning Wellness','Morning Light','Outdoor Walk','Midday Reset','Low-Stimulation Break','Meditation','1-Minute Meditation','5-Minute Meditation','Guided Meditation','Breathwork','Five-Breath Reset','Body Scan','Evening Wind-Down','Digital Sunset','Sleep Routine','Sleep Audit','Recovery Day','Active Recovery','Full Rest','Low-Energy Wellness','Sick Day','Sauna','Red-Light Session','Wearable Review','Cycle Review','Energy Review','Preventive Care']),
  category('fitness','Fitness','Stronger every day.','🏋️','#d68fa3','Stronger every day.',['All','Program','Glutes','Upper Body','Core','Cardio','Mobility','Recovery','Progress'],['Day 1 · Glutes + Hamstrings','Day 2 · Upper Body + Posture','Day 3 · Recovery + Walking','Day 4 · Glutes + Side Glutes','Day 5 · Upper Body + Arms','Day 6 · Cardio + Core + Mobility','Day 7 · Full Rest','Glute Warm-Up','Glute Form Check','Hip Thrust','RDL','Bulgarian Split Squat','Abduction','Kickback','Side-Glute Session','Deep Core','Vacuum Routine','Posture Routine','Walking','Cardio','Mobility','Stretching','Pilates / Recovery','Active Recovery','Workout Prep','Workout Bag','Post-Workout Reset','Low-Energy Workout','Travel Workout','Progressive Overload Review','Monthly Fitness Review','Fitness Progress Photos','Measurements']),
  category('skincare','Skincare','Healthy skin. Consistent care. Real results.','🧴','#e0aca1','Healthy skin. A happier you.',['All','Daily','Treatments','Devices','Body Care','Procedures','Travel','Recovery'],['AM Full Routine','AM Normal Routine','AM Quick Routine','AM Bare Minimum','Makeup Prep Skincare','PM Standard Routine','PM Treatment Routine','PM Retinoid Routine','PM Recovery Routine','Makeup Removal','Double Cleanse','Hydration Night','Acne Flare Routine','Barrier Repair Routine','Mask Routine','BioDance Mask Ritual','Gua Sha Routine','Face Yoga Routine','Red Light Routine','Body Skincare','Body Exfoliation','Body Retinoid Routine','Procedure Prep','Procedure Recovery','Travel Skincare']),
  category('hair','Hair','Healthy hair, always.','〰️','#b89583','Healthy hair, always.',['All','Daily','Hydration','Leave-Out + U-Part','Scalp','Wash + Repair','Styling','Tools + Inventory','Travel'],['Morning Hair','Night Hair','Hydration Refresh','Ends Oiling','Leave-In Refresh','Leave-Out Check','Leave-Out Refresh','Three-Direction Leave-Out Blend','U-Part Setup','U-Part Removal','Straight Style','Blowout','Soft Curl Style','Wand Curl','Roller Set','Front-Piece Styling','Protective Style','Night Protection','Scalp Massage','Scalp Serum','Scalp Oil Treatment','Wash-Day Prep','Sunday Full Reset','Thursday Bond Repair','Double Shampoo','Clarifying Wash','Strengthening Wash','Deep Conditioning','Bond Treatment','Conditioning','Post-Wash Styling','Wig Wash','Extension Wash','Monthly Wig / Extension Reset','Hair Tool Cleaning','Bonnet / Scarf Laundry','Trim Review','Hair Inventory','Hair Restock','Travel Hair','Event Hair']),
  category('makeup','Makeup','Express your beauty.','💄','#d7a397','Express your beauty. Every look, every you.',['All','Quick','Everyday','Douyin','Eyes','Lips','Base','Event'],['Quick Makeup','Everyday Look','Everyday Chinese Douyin','Everyday Baddie','Ningning Y2K / Rose','Beginner Douyin','Aegyo-Sal Routine','Lip Routine','Base Routine','Touch-Up','Makeup Removal','Event Makeup']),
  category('beauty','Beauty + Grooming','Care for every detail.','🫧','#d6b09f','Self care is power.',['All','Daily','Shower + Body','Maintenance','Tools','Inventory','Appointments','Events'],['Daily Grooming','Quick Grooming','Full Grooming','Everything Shower','Body Shower','Body Exfoliation','Shaving','Body Lotion','Body Oil','Dry Area Care','Hand Care','Foot Care','Deodorant','Daily Scent','Fragrance Layering','Friday Fragrance Ritual','Nail Care','Lash Application','Lash Maintenance','Lash Removal','Teeth Whitening','Oral Care','Makeup Brush Cleaning','Beauty Tool Cleaning','Beauty Laundry / Towels','Beauty Restock','Beauty Inventory','Beauty Audit','Beauty Progress Photos','Appointment Prep','Appointment Aftercare','Monthly Beauty Reset','Event Beauty Prep']),
  category('nails','Nails','Polished & confident.','💅','#d7a5ad','The details make the difference.',['All','Daily','Care','Application','Removal','Design','Tools','Inventory'],['Daily Nail Check','Weekly Nail Maintenance','Natural Nail Care','DIY Gel Nails','French Tip Application','Press-On Nails','Gel Removal','Press-On Removal','Cuticle Care','Nail Repair','Nail Tool Cleaning','Nail Design Selection','Nail Supply Review','Appointment Prep']),
  category('brows','Brows','Defined, effortlessly.','〰','#aa8b7e','Defined, effortlessly.',['All','Daily','Weekly','Monthly','Professional'],['Daily Brow Grooming','Weekly Brow Cleanup','Monthly Brow Shape Review','Brow Product Review','Professional Brow Appointment','Microblading Tracking']),
  category('lashes','Lashes','Elevate your eyes.','〽️','#b39898','Elevate your eyes.',['All','Style','Application','Maintenance','Removal','Tools','Professional'],['Lash Style Selection','Strip Lash Application','Individual Lash Application','DIY Cluster Application','Daily Lash Check','Lash Maintenance','Lash Removal','Lash Tool Cleaning','Lash Irritation Check','Lash Appointment','Lash Lift Tracking']),
  category('smile','Smile + Oral Care','A brighter smile.','🦷','#d5cec4','A brighter smile.',['All','Morning','Night','Whitening','Appointments'],['Morning Oral Care','Night Oral Care','Flossing','Tongue Care','Breath Care','Whitening','Whitening Sensitivity Check','Dental Appointment Prep','Dental Appointment Follow-Up']),
  category('fragrance','Fragrance','Scent your mood.','🌸','#ddb3b1','Scent your mood.',['All','Daily','Layering','Work','Evening','Event','Seasonal','Inventory'],['Daily Scent','Friday Fragrance Ritual','Fragrance Layering','Work Scent','Evening Scent','Event Scent','Bedtime Scent','Seasonal Scent Change','Fragrance Inventory']),
  category('home','Home','A calmer space.','🛏️','#b8aa9e','A peaceful home. A brighter you.',['All','Morning','Night','Kitchen','Bathroom','Laundry','Cleaning','Declutter','Storage','Seasonal'],['Morning Bedroom Reset','Nightly 10-Minute Tidy','Return Everything Home','Laundry','Surface Reset','Kitchen Reset','Bathroom Reset','Weekly Cleaning Reset','Declutter','Storage Review','Seasonal Reset']),
  category('digital','Digital','A cleaner, calmer digital life.','💻','#a8a8b6','Less digital noise. A brighter you.',['All','Quick','Photos','Email','Files','Apps','Social','Focus','Review'],['Digital Reset','Camera Roll Cleanup','Email Cleanup','File Organization','App Review','Social Cleanup','Screen-Time Review','Focus Mode Setup','Brick / Opal Boundary']),
  category('appointments','Appointments','Stay prepared.','🗓️','#c7ac92','Prepared before. Clear after.',['All','Prep','Beauty','Health','Follow-Up','Quarterly'],['Appointment Prep','Beauty Appointment','Dental Appointment','Preventive Care Review','Appointment Follow-Up']),
  category('travel','Travel','Glow anywhere.','🧳','#c1a18c','Same glow, wherever you go.',['All','Planning','Packing','Beauty','Food','Movement','Transit','Arrival'],['Travel Planning','Travel Packing','Travel Skincare','Travel Hair','Travel Makeup','Travel Beauty','Travel Food','Travel Workout','Airport Routine','In-Transit Routine','Arrival Reset']),
  category('seasonal','Seasonal + Annual','All year, all you.','❄️','#b7c3d1','All year, all you.',['All','Quarterly','Seasonal','Yearly','Birthday','Vacation','Beauty'],['Quarterly Review','Seasonal Reset','Yearly Reset','Birthday Routine','Vacation Mode','Annual Beauty Audit']),
];

const DEFAULTS: Partial<RoutineObject> = {
  subtitle: 'A living Glow routine that adapts to context without changing its purpose.', duration: '5–20 min', frequency: 'As needed', timeOfDay: ['Any'], situations: ['Normal Day'], steps: ['Check context and what is actually due', 'Prepare only the products, tools or information needed', 'Complete the saved routine in order', 'Clean up and return everything home', 'Log completion, result and next due when useful'], productsTools: [], storage: [], avoid: [], cleanup: ['Return used items to their home'], resultFields: ['Completed', 'Actual duration', 'How it felt', 'What to change next time'], nextDue: 'Calculated from the routine frequency and completion history',
};

const lifeAreasFor = (title: string) => CATEGORY_SEEDS.filter((c) => c.routineIds.includes(slug(title))).map((c) => c.title);

const names = Array.from(new Set(CATEGORY_SEEDS.flatMap((category) => category.routineIds)));
const titleById = new Map<string, string>();
for (const category of CATEGORY_SEEDS) {
  for (const rawTitle of category.routineIds) {
    if (!titleById.has(rawTitle)) titleById.set(rawTitle, rawTitle.split('-').map((part) => part ? part[0].toUpperCase() + part.slice(1) : '').join(' '));
  }
}
for (const title of Object.keys(CORE)) titleById.set(slug(title), title);

export const ROUTINES: RoutineObject[] = names.map((id) => {
  const title = titleById.get(id) ?? id;
  const core = CORE[title] ?? {};
  return {
    id,
    title,
    subtitle: core.subtitle ?? DEFAULTS.subtitle!,
    duration: core.duration ?? DEFAULTS.duration!,
    frequency: core.frequency ?? DEFAULTS.frequency!,
    timeOfDay: core.timeOfDay ?? DEFAULTS.timeOfDay!,
    lifeAreas: lifeAreasFor(title),
    situations: core.situations ?? DEFAULTS.situations!,
    steps: core.steps ?? DEFAULTS.steps!,
    optional: core.optional ?? [],
    productsTools: core.productsTools ?? [],
    storage: core.storage ?? [],
    avoid: core.avoid ?? [],
    cleanup: core.cleanup ?? DEFAULTS.cleanup!,
    resultFields: core.resultFields ?? DEFAULTS.resultFields!,
    nextDue: core.nextDue ?? DEFAULTS.nextDue!,
  };
});

export const ROUTINE_BY_ID = new Map(ROUTINES.map((routine) => [routine.id, routine]));
export const CATEGORIES = CATEGORY_SEEDS.map((category) => ({ ...category, routineIds: category.routineIds.filter((id) => ROUTINE_BY_ID.has(id)) }));
export const CATEGORY_BY_ID = new Map(CATEGORIES.map((category) => [category.id, category]));

export const ENERGY_COPY: Record<EnergyMode, { label: string; helper: string; symbol: string; accent: string }> = {
  Recovery: { label: 'Recovery', helper: 'Bare minimum · essentials only', symbol: '☁', accent: '#8796bb' },
  Low: { label: 'Low Energy', helper: 'Simplify & protect', symbol: '☾', accent: '#9a84d8' },
  Medium: { label: 'Medium Energy', helper: 'Your normal flow', symbol: '☀', accent: '#d69d37' },
  High: { label: 'High Energy', helper: 'Full routine + appropriate extras', symbol: '♨', accent: '#dd765a' },
};

export function routineStepsForEnergy(routine: RoutineObject, energy: EnergyMode) {
  const steps = routine.steps;
  if (energy === 'Recovery') return steps.slice(0, Math.min(3, steps.length));
  if (energy === 'Low') return steps.slice(0, Math.max(3, Math.ceil(steps.length * .58)));
  return steps;
}

export function routineDurationForEnergy(duration: string, energy: EnergyMode) {
  if (energy === 'Recovery') return `Bare minimum · ${duration}`;
  if (energy === 'Low') return `Short version · ${duration}`;
  if (energy === 'High') return `Full version · ${duration}`;
  return duration;
}
