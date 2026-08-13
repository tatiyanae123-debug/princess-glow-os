// Canonical personal Glow OS 2026 content merged from the user's current master PDFs.
// The importer converts these templates into editable database rows and records provenance/undo batches.

export const GLOW_OS_SOURCE = 'glow-os-2026-personal-master' as const;
export const GLOW_OS_SOURCE_VERSION = '2.0.0' as const;

export type ImportCategory =
  | 'routines' | 'habits' | 'tasks' | 'weekly_themes' | 'beauty_routines'
  | 'hair_routines' | 'wellness_routines' | 'workout_plans' | 'home_resets'
  | 'finance_reviews' | 'planning_rituals' | 'saint_care' | 'calendar_templates'
  | 'monthly_resets' | 'seasonal_resets' | 'yearly_resets';

export const WEEKDAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export type RoutineTemplate = { category:'routines'; name:string; description:string; timeOfDay:'morning'|'afternoon'|'evening'|'night'|'anytime'; daysOfWeek?:Weekday[] };
export type HabitTemplate = { category:'habits'; name:string; description:string; frequency:'daily'|'weekdays'|'weekends'|'weekly'|'custom' };
export type TaskTemplate = { category:'tasks'; title:string; description:string };
export type CalendarTemplate = { category:'calendar_templates'; title:string; description:string; startTime:string; durationMinutes:number; daysOfWeek:Weekday[] };
export type BeautyTemplate = { category:'beauty_routines'; name:string; timeOfDay:'morning'|'afternoon'|'evening'|'night'|'anytime'; products?:string[] };
export type ImportTemplate = RoutineTemplate | HabitTemplate | TaskTemplate | CalendarTemplate | BeautyTemplate;

const ALL_DAYS: Weekday[] = [...WEEKDAYS];

export const GLOW_OS_PHILOSOPHY = {
  philosophy: 'A glow up is built through systems, consistency, emotional regulation, intentional habits, presentation, self-respect and alignment rather than random motivation or perfection. Beauty is part of lifestyle. Small repeated habits shape confidence, posture, energy, nervous-system regulation, self-concept, standards, relationships, opportunities and identity.',
  identity: ['calm','emotionally regulated','self-possessed','disciplined','feminine','intentional','grounded','selective','independent'],
  identityRules: ['No chasing','No overexplaining','Protect peace','Maintain standards','Choose self first','Do not abandon yourself','Observe actions over words and consistency over potential','Move slowly and intentionally','Confidence comes from keeping promises to yourself'],
  finalStatement: 'I am self-possessed, disciplined, emotionally regulated, selective, independent and grounded. I do not need to prove my value. I embody it.',
};

export const WEEKLY_THEMES: { day:Weekday; title:string; focus:string }[] = [
  {day:'sunday',title:'Sunday Reset + Full Maintenance',focus:'10 AM–4 PM full home, beauty, body, admin, planning and weekly reset; wash day; early night.'},
  {day:'monday',title:'Reset + Foundation Day',focus:'Foundation, organization, unfinished laundry, hair/protective-style maintenance, weekly focus and calendar non-negotiables.'},
  {day:'tuesday',title:'Fitness + Body Maintenance Day',focus:'Review workouts, adjust the week, deep stretch, nail/brow maintenance and supplement refill check.'},
  {day:'wednesday',title:'Wellness + Regulation Day',focus:'Gentle movement, breathwork/stretching, hydration focus, extended skincare, face yoga/gua sha and early wind-down.'},
  {day:'thursday',title:'Hair Maintenance + Presence + Creative Work',focus:'Bond-repair hair maintenance, intentional appearance, content/brand review, posture, tone and boundaries.'},
  {day:'friday',title:'Beauty + Soft Life + Social Day',focus:'Slower pace, beauty polish, outfit planning, fragrance ritual, social life and weekly finance review.'},
  {day:'saturday',title:'Recovery + Creativity + Deep Clean',focus:'Deep-clean zone, car care if needed, everything shower/body maintenance, cardio/core/mobility and calm night.'},
];

export const WORKOUT_SPLIT = [
  {day:'monday' as Weekday,label:'Day 1',focus:'Glutes + Hamstrings',exercises:['Barbell hip thrust','Romanian deadlift','Seated hamstring curl','Cable kickbacks','45° glute-focused back extensions','Incline treadmill walking']},
  {day:'tuesday' as Weekday,label:'Day 2',focus:'Upper Body + Posture',exercises:['Lat pulldown','Seated row','Rear delt fly','Lateral raises','Shoulder press','Face pulls']},
  {day:'wednesday' as Weekday,label:'Day 3',focus:'Recovery + Walking',exercises:['Walking','Pilates','Stretching','Mobility','Light core work']},
  {day:'thursday' as Weekday,label:'Day 4',focus:'Glutes + Side Glutes',exercises:['Lighter hip thrusts','Bulgarian split squats','Abduction machine','Cable side kicks','Step-ups','Glute bridge holds']},
  {day:'friday' as Weekday,label:'Day 5',focus:'Upper Body + Arms',exercises:['Seated row','Rear delt fly','Triceps pushdowns','Biceps curls','Lateral raises']},
  {day:'saturday' as Weekday,label:'Day 6',focus:'Cardio + Core + Mobility',exercises:['Incline treadmill','Walking','StairMaster','Cycling','Rowing','Leg raises','Reverse crunches','Planks','Dead bugs','Vacuum holds']},
  {day:'sunday' as Weekday,label:'Day 7',focus:'Full Rest',exercises:['Walking if desired','Mobility','Stretching','Recovery']},
];

export const EXERCISE_LIBRARY = Array.from(new Set(WORKOUT_SPLIT.flatMap((x)=>x.exercises)));

export const CORE_DAILY_ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {category:'routines',name:'Morning Mind Reset + Planning',timeOfDay:'morning',description:'In bed / low stimulation: no scrolling; calm breathing; open Notes; brain dump tasks, to-dos, thoughts, appointments and reminders; choose only 3 goals; review Google Calendar; mark completed blocks; move unfinished items realistically; set alarms. Brain dump first, organize second.'},
  {category:'routines',name:'Morning Body Activation',timeOfDay:'morning',description:'Drink water first. Take prescribed medication and planned supplements. Complete stomach vacuums, deep breathing and gentle activation. Pilates for about 30 minutes or assigned workout/walk. Controlled pace, mind-body focus, slow breathing, no phone.'},
  {category:'routines',name:'Morning Nourishment + Hygiene',timeOfDay:'morning',description:'Protein-focused breakfast; sit to eat; no phone. Brush teeth, tongue scrape, Waterpik/floss, mouthwash, wash/refresh face, deodorant; shower if scheduled.'},
  {category:'routines',name:'Morning Beauty + Styling Lock-In',timeOfDay:'morning',description:'AM skincare, gua sha/lymphatic work, hair setup, makeup/polish, body care/SPF, outfit, jewelry, bag, keys, water bottle and final mirror check. Leave the house calm, prepared and intentional.'},
  {category:'routines',name:'Midday Reset',timeOfDay:'afternoon',description:'Best around 12–2 PM for 20–45 min. Pause completely; 5 slow nasal breaths with longer exhale; relax shoulders/jaw; review what is completed and which Top 3 still matters; do not add unnecessary tasks; 5–15 min walk/stretch/posture/mobility; hydrate and eat balanced meal/protein snack seated without phone; freshen hands/face/lips/deodorant/hair/makeup/outfit only as needed; 1–2 min silence; affirmation “I move calmly. I’m in control.” Choose ONE next action.'},
  {category:'routines',name:'Evening Wind-Down + Room Reset',timeOfDay:'evening',description:'Begin slowing 1–2 hours before bed. DND on, app blockers on, dim lights, reduce screen time, avoid stressful conversations/new problems. Make bed if needed, put away clutter, quick room reset, trash/surfaces/laundry/dishes/vanity, dinner and important messages.'},
  {category:'routines',name:'Night Beauty + Shower System',timeOfDay:'night',description:'Remove makeup; prep hair; shower/cleanse body; scheduled exfoliation, body treatments or hair wash; pat dry; body lotion/oil; scheduled retinol body lotion; deodorant; fresh pajamas; PM skincare; optional face yoga, gua sha/red light; fragrance if desired.'},
  {category:'routines',name:'Night Planning + Closure',timeOfDay:'night',description:'Open Notes: what was completed, what did not get done, release lingering thoughts; review Google Calendar; mark completed blocks; move unfinished tasks realistically; tomorrow brain dump/to-dos; choose tomorrow’s 3 goals; set alarms; place morning medication and water by bed; pack iPad, chargers, lip gloss, perfume, gym clothes/shoes, shower supplies, sunscreen, concealer and mascara as needed.'},
  {category:'routines',name:'Nervous System Seal + Sleep',timeOfDay:'night',description:'Silence, slow breathing and body scan. Optional affirmation: “I am done for today. Tomorrow is handled.” Lights off, no scrolling, hair protected, consistent bedtime. Target sleep window in source plan: 7.5–9 hours.'},
];

export const CORE_DAILY_HABIT_TEMPLATES: HabitTemplate[] = [
  {category:'habits',name:'Brain dump before planning',description:'Capture thoughts first; organize second.',frequency:'daily'},
  {category:'habits',name:'Hydration',description:'Water immediately after waking and throughout the day; electrolytes as planned.',frequency:'daily'},
  {category:'habits',name:'Prescribed medication',description:'Take prescribed medication as directed and keep reminder in morning/night planning.',frequency:'daily'},
  {category:'habits',name:'Supplements',description:'Current source list includes beef liver, ashwagandha, sea moss, prebiotic + probiotic, NAD/NAD+, Lion’s Mane and liquid chlorophyll; personal supplements only as appropriate.',frequency:'daily'},
  {category:'habits',name:'Movement',description:'Assigned Pilates/workout or walk plus daily movement/steps.',frequency:'daily'},
  {category:'habits',name:'Stomach vacuums + deep core',description:'Core activation and waist/posture awareness.',frequency:'daily'},
  {category:'habits',name:'AM skincare + SPF',description:'Complete morning skincare and SPF on face, neck/chest and exposed skin.',frequency:'daily'},
  {category:'habits',name:'PM skincare',description:'Cleanse/treat/hydrate/barrier support and lip care.',frequency:'daily'},
  {category:'habits',name:'Morning + night hair protection',description:'Gentle handling, moisture check, ends protection, low tension and satin/silk night protection.',frequency:'daily'},
  {category:'habits',name:'Protein-focused meals',description:'Include protein at meals; source plan also prioritizes fiber, hydration and stable energy.',frequency:'daily'},
  {category:'habits',name:'Google Calendar review',description:'Review schedule, appointments, work, school, errands and time blocks.',frequency:'daily'},
  {category:'habits',name:'Top 3 priorities',description:'Choose only three highest-leverage priorities for the day.',frequency:'daily'},
  {category:'habits',name:'Posture + jaw check',description:'Tongue on palate, chin slightly tucked, shoulders down/back, neutral spine, jaw unclenched.',frequency:'daily'},
  {category:'habits',name:'Reset living space',description:'Short reset before bed so the next day starts clean.',frequency:'daily'},
  {category:'habits',name:'No doom scrolling',description:'Protect morning activation and night wind-down from scrolling.',frequency:'daily'},
  {category:'habits',name:'Saint care',description:'Feed/water, walk, play and check care needs.',frequency:'daily'},
];

export const HAIR_ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {category:'routines',name:'Morning Hair — Settle + Assess',timeOfDay:'morning',description:'Remove bonnet/scarf gently. Do not touch hair aggressively or immediately brush through curls/texture. Let hair settle. Check dryness, frizz, ends, blending, parting and style longevity.'},
  {category:'routines',name:'Morning Hair — Hydrate + Leave-In + Seal',timeOfDay:'morning',description:'Lightly mist mids/ends with aloe vera juice + water (or plain water if already moisturized), focused on dryness/frizz/ends. Do not soak roots, oversaturate bundles or make leave-out puffy. Apply a small/pea-sized leave-in to mids/ends/dry areas, avoiding roots/scalp/top of leave-out. Seal with only 2–3 drops jojoba, argan, lightweight serum/oil on mids/ends/ends only. Do not over-oil low-porosity hair.'},
  {category:'routines',name:'Morning Hair — Leave-Out + Signature Finish',timeOfDay:'morning',description:'Separate front/leave-out. Use spoolie, edge brush or small comb and brush forward, backward and downward for natural blend. Style main hair sleek/straight/blowout/wand curls/rollers/layered or brushed-out curls/soft volume. Preserve movement and body; avoid stiff/crunchy curls, too much hairspray and flat roots. ALWAYS curl bangs/face-framing/leave-out/front layers LAST for soft bends, airy cheekbone framing, natural movement and polished expensive-looking finish.'},
  {category:'routines',name:'U-Part Wig Morning Setup',timeOfDay:'morning',description:'If wearing natural hair/U-part: light serum; aloe + warm water mist through mids if appropriate; leave-in; seal mids/ends with about 3 drops jojoba; part leave-out; braid back half; add curlers/Velcro rollers to front while getting ready; install U-part; blend; finish front pieces last. For leave-out sew-in: mist lightly, flat wrap/roller bump, avoid daily flat ironing. If straightened: no water; light oil on ends only.'},
  {category:'routines',name:'Night Hair — Detangle + Moisture Seal',timeOfDay:'night',description:'Remove wig if wearing and release tight styles. Detangle with fingers first then wide-tooth/wet brush as appropriate, starting at ends and working upward. Every night or every other night as needed: light water/aloe mist, small leave-in, lightweight oil on mids/ends/ends only; allow to dry. Avoid ripping through knots or aggressive dry brushing.'},
  {category:'routines',name:'Night Hair — Scalp + Protection',timeOfDay:'night',description:'3–5 minute scalp massage with fingertips, not nails. Optional rosemary/scalp serum; minoxidil only if using and according to its separate routine. Secure with 2 loose braids, twist, loose bun, pineapple, wrap or flexi rod. Keep tension low. Finish with silk/satin scarf or bonnet + satin pillowcase. Avoid tight ponytails and sleeping unprotected.'},
  {category:'routines',name:'Sunday Full Reset Wash Day',timeOfDay:'evening',daysOfWeek:['sunday'],description:'Pre-shower: detangle; optional coconut oil mid-lengths/ends ~30 min. Shampoo #1 cleanse buildup (source example Pantene Volume if oily). Shampoo #2 target result (source example L’Oréal gloss for shine or repair/strengthening shampoo). Shampoo scalp rather than aggressively scrubbing lengths. Apply mask mid-lengths/ends 5–10 min; detangle gently in mask/conditioner from ends upward; condition mids/ends; warm-to-cool rinse; microfiber towel/cotton T-shirt squeeze/pat, no rubbing; leave-in + heat protectant + light oil; blow-dry/reset style.'},
  {category:'routines',name:'Thursday Repair + Maintenance Wash',timeOfDay:'evening',daysOfWeek:['thursday'],description:'Before shower: bond treatment all over hair about 10 min. In shower: double shampoo; conditioner; heavy mask only if needed. After: leave-in, heat protectant if styling, light oil, restyle/prep next look. Refresh U-part/half wig/leave-out/curls/straight style, rehydrate mids/ends and fix blend; front hairs last.'},
  {category:'routines',name:'Scalp Oil Treatment',timeOfDay:'anytime',description:'Separate from daily ends oil. Up to 2–3x/week max in source plan: section hair, apply small amount to scalp, massage 4–5 min, leave 1–4 hours or overnight then wash out. Oil mix options: castor, pumpkin seed, jojoba, rosemary, coconut; additional DIY oils listed: grapeseed, onion, argan, castor; “Hernan blend” notes list black licorice + marigolds. Never layer scalp oil immediately before/after minoxidil; do not leave scalp clogged for days.'},
  {category:'routines',name:'Minoxidil Routine (if using)',timeOfDay:'anytime',description:'Choose ONE time daily if using. Apply to clean, dry scalp at edges, crown or thinning areas with dropper/foam as directed; let dry fully before styling. Do not oil scalp immediately before/after. Optional 2–4 minute no-oil scalp massage 3–5x/week. Keep this editable/optional, not a forced routine.'},
  {category:'routines',name:'Hair Refresh Every 3 Days',timeOfDay:'anytime',description:'Refresh curls, redo blend and refresh leave-out approximately every 3 days. Hydration refresh may be every 1–2 days depending on hair state.'},
  {category:'routines',name:'Monthly Hair Maintenance',timeOfDay:'anytime',description:'Wash wig/extensions/U-part unit, detangle gently, refresh curls or straighten, reset blend; clarify scalp if buildup exists; trim split/damaged ends if needed; review product inventory.'},
];

export const BEAUTY_ROUTINE_TEMPLATES: BeautyTemplate[] = [
  {category:'beauty_routines',name:'AM Skincare — Glass Skin Stack',timeOfDay:'morning',products:['Gentle cleanser / The Face Shop Rice Water cleanser (source example)','Toner or essence','Vitamin C if using','Hydrating serum / hyaluronic acid','Beauty of Joseon serum','Purito Centella serum','Aestura barrier cream / moisturizer','SPF face, neck and chest','Eye cream if used','Lip balm']},
  {category:'beauty_routines',name:'PM Skincare — Repair + Barrier',timeOfDay:'night',products:['Double cleanse when wearing makeup/SPF','Toner','Treatment serum','Scheduled exfoliant only','Scheduled retinoid only','Hydrating serum','Barrier moisturizer / Aestura','Eye cream','Lip mask','Lash serum nightly (source baseline)']},
  {category:'beauty_routines',name:'Gua Sha — Light Morning',timeOfDay:'morning',products:['Light facial oil/serum','Neck drainage','Jawline outward to ear','Cheeks upward/outward','Very gentle under-eye outward sweeps','Forehead','Drain down neck']},
  {category:'beauty_routines',name:'Gua Sha — Full Night Sculpt',timeOfDay:'night',products:['Facial oil','Long slow neck sweeps','Jawline sculpt','Cheekbone lift','Gentle under-eye lift','Brow lifting sweep','Drain down neck']},
  {category:'beauty_routines',name:'Face + Fascia + TMJ Release',timeOfDay:'anytime',products:['SCM release','Masseter release','Temple/scalp release','Jaw unclench','Tongue posture','Facial relaxation','Thoracic/posture reset','Deep breathing']},
  {category:'beauty_routines',name:'Daily Body Glow',timeOfDay:'anytime',products:['Daily shower','Body oil on damp skin','Body lotion to seal','Deodorant','SPF on exposed skin','Light fragrance optional','Lip care']},
  {category:'beauty_routines',name:'Body Treatment Rotation',timeOfDay:'night',products:['Skinfix glycolic scrub (source example)','REN AHA tonic (source example)','Paula’s Choice 2% BHA body (source example)','Retinol body lotion on scheduled nights','Do not stack multiple strong treatments on one night']},
  {category:'beauty_routines',name:'Daily Oral Care',timeOfDay:'anytime',products:['Brush AM + PM','Whitening toothpaste (source baseline)','Tongue scrape AM','Floss / Waterpik','Mouthwash','Lip care']},
  {category:'beauty_routines',name:'Natural Skin-Focused Makeup',timeOfDay:'morning',products:['Prep skin first','Pat foundation, do not swipe','No foundation under eyes','Pressed powder under eyes before baking','Beauty blender damp, not soaked','Healthy skin over heavy coverage']},
  {category:'beauty_routines',name:'Fragrance Ritual',timeOfDay:'anytime',products:['Wrists','Neck','Behind ears','Perfumed body oil optional','Bakhoor/incense optional','Clean soft signature scent']},
];

export const WELLNESS_ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {category:'routines',name:'Morning Face Posture + Lymph Reset',timeOfDay:'morning',description:'2–3 minute stretch; turn head and check SCM; gently release tighter side; masseter/jaw release; temples/scalp circles from hairline to crown/sides; arm swings 20–30 sec; deep belly breathing; chest opening; light gua sha; tongue on palate, lips together, shoulders down/back, chin slightly tucked; shoulder rolls + thoracic extension + head alignment.'},
  {category:'routines',name:'Midday Face Posture + Lymph Reset',timeOfDay:'afternoon',description:'Hydrate; tongue posture ~1 min; shoulders back; release clenching; arms overhead, inhale ribs, exhale/roll arms down; 30-sec jaw check and brief masseter massage; optional mini gua sha jaw→ear, cheek→temple, down neck; hold tight SCM side ~10 sec; four belly breaths; reapply lip care/SPF; avoid forward-head posture.'},
  {category:'routines',name:'Night Myofascial + TMJ Reset',timeOfDay:'night',description:'Check scalp tension; lift/mobilize scalp gently; massage temples/jaw; gentle cheek-fascia hold; full slow gua sha; tongue posture before bed; side-sleeping correction with front pillow/head straight; relax jaw and slow breathing.'},
  {category:'routines',name:'Monday Face/Neck Focus',timeOfDay:'anytime',daysOfWeek:['monday'],description:'Full neck/shoulder fascia release, deep SCM check/release, full gua sha sculpt, scalp tension check and long de-puffing drainage.'},
  {category:'routines',name:'Tuesday Jaw/Posture Focus',timeOfDay:'anytime',daysOfWeek:['tuesday'],description:'Cheek + masseter release, jawline sculpt, extra posture work and tongue-posture training ~5 minutes.'},
  {category:'routines',name:'Wednesday Lymphatic Focus',timeOfDay:'anytime',daysOfWeek:['wednesday'],description:'Full lymphatic drainage session, chest/rib release, light gua sha and tension correction on uneven side.'},
  {category:'routines',name:'Thursday Cheek/Scalp Focus',timeOfDay:'anytime',daysOfWeek:['thursday'],description:'Cheek-lift gua sha, scalp fascia sweep, sleeping-posture training and deep-breathing session.'},
  {category:'routines',name:'Friday Jaw/Temple + Hair Focus',timeOfDay:'anytime',daysOfWeek:['friday'],description:'Jaw reset, masseter/temple release, brow/eye lifts, hair mask + scalp massage.'},
  {category:'routines',name:'Saturday Long Sculpt Focus',timeOfDay:'anytime',daysOfWeek:['saturday'],description:'Long gua sha sculpt, full head massage, neck mobility and sinus-drainage focus.'},
  {category:'routines',name:'Sunday Whole-Body Fascia Reset',timeOfDay:'anytime',daysOfWeek:['sunday'],description:'Whole-body fascia reset, chest-opening stretch, slow calm gua sha and face-posture audit.'},
  {category:'routines',name:'Weekly Beauty Add-Ons',timeOfDay:'anytime',description:'Facial shaving 1x/week; brow maintenance 1x/week; full-body lymphatic massage in shower 2x/week; deep conditioning/scalp oil treatment 1x/week; weekly asymmetry check by turning head, comparing sides and noting tension spots.'},
];

export const HOME_RESET_TEMPLATES: TaskTemplate[] = [
  {category:'tasks',title:'Sunday Full Home Reset',description:'Vacuum; steam mop floors; clean bathroom completely; clean mirrors/furniture/TV; wipe stainless appliances; wash sheets + duvet; wash Saint/dog bedding; scan fridge for expired items; finish all laundry; clear walkways; collect categories then return in batches; clean vanity/nightstands/surfaces/floors/product areas; organize scent/body/skincare/hair products; remake bed.'},
  {category:'tasks',title:'Saturday Deep Clean Zone',description:'Deep-clean one zone of choice; car care if needed; fresh sheets if Sunday did not cover them; everything shower/body day; calm low-stimulation night.'},
  {category:'tasks',title:'Weekly Laundry Reset',description:'Wash, dry, fold, hang and put away; refresh towels/bedding as needed; work clothes, gym clothes and beauty towels.'},
  {category:'tasks',title:'Car Cleaning Reset',description:'Remove trash, wipe surfaces, organize items, check gas and essentials, reset car environment.'},
  {category:'tasks',title:'Evening Cleaning Mini Reset',description:'Trash, surfaces, laundry check, dishes, vanity and returning things to their home.'},
];

export const FINANCE_REVIEW_TEMPLATES: TaskTemplate[] = [
  {category:'tasks',title:'Weekly Finance Check',description:'Review spending, bills, savings buckets, car insurance, gas, groceries, fun, takeout, buffer, investing and upcoming charges.'},
  {category:'tasks',title:'Monthly Finance Reset',description:'Review subscriptions, bills, savings, investing, checking account, spending patterns, car insurance, gas, groceries, fun, beauty, takeout and buffer.'},
];

export const PLANNING_RITUAL_TEMPLATES: TaskTemplate[] = [
  {category:'tasks',title:'Daily Brain Dump',description:'Capture tasks, to-dos, thoughts, appointments, reminders, school/work/admin, finance, groceries, Saint care and life-management items before organizing.'},
  {category:'tasks',title:'Daily Top 3',description:'Choose only three high-leverage goals supporting life, work/school, money, health, beauty and identity.'},
  {category:'tasks',title:'Weekly Planning Reset',description:'Review Google Calendar, Sheets/tracking, tasks, brain dump, routines, habits, goals, work schedule, school, admin, errands, beauty maintenance, social/personal life, fitness and finances; schedule appointments/classes and non-negotiables.'},
];

export const SAINT_CARE_TEMPLATES: HabitTemplate[] = [
  {category:'habits',name:'Saint Midday Care',description:'Feed if needed, walk, play, check water and reset dog-care needs.',frequency:'daily'},
  {category:'habits',name:'Saint Bedding + Care Review',description:'Wash dog bedding during Sunday reset; track vet/grooming and supplies as needed.',frequency:'weekly'},
];

export const FITNESS_TASKS: TaskTemplate[] = [
  {category:'tasks',title:'Fitness Doctrine + Goals',description:'Body recomposition / silhouette-engineering plan: balanced proportions, glute development and projection, fuller side glutes, flatter/tighter stomach appearance, waist illusion, lean arms, defined shoulders/upper back, lifted posture, long-looking legs and a soft feminine athletic silhouette. Train shape rather than chase scale weight.'},
  {category:'tasks',title:'Glute Growth Principles',description:'Prioritize glute max/medius/minimus. Core movements: hip thrust, RDL, abduction machine, cable kickbacks, Bulgarian split squat; also step-ups and bridge holds. Control reps; stop/reset if lower back dominates. Progress through weight, reps, technique, range of motion or control. Growth plan prioritizes food/protein, sleep and recovery.'},
  {category:'tasks',title:'Core + Waist System',description:'Prioritize deep core/transverse abdominis, stability and posture: vacuum holds, dead bugs, reverse crunches, planks, leg raises; source also lists hollow holds/toe touches. Avoid heavy side bends/heavy oblique emphasis/excessive weighted twisting when the goal is a narrower waist visual.'},
  {category:'tasks',title:'Cardio + Daily Movement System',description:'Supportive cardio: incline treadmill, outdoor walking, StairMaster, cycling, rowing. Source treadmill guideline: speed about 3.0–3.5, incline about 8–12. LISS 20–30 min, roughly 2–4x/week. Daily movement target in source plan: about 8,000–12,000 steps.'},
  {category:'tasks',title:'Fitness Nutrition + Recovery',description:'Source plan: protein about 0.7–1 g/lb body weight, plus hydration, fiber, whole foods/stable energy and recovery nutrition. Recovery priorities: 7.5–9 h sleep target, hydration, mobility/stretching, stress regulation, rest days and walking.'},
  {category:'tasks',title:'Monthly Fitness Check-In',description:'Progress photos, waist/hips measurements, glute fullness, posture, strength/progression, energy, clothing fit and recovery audit. Shape and performance matter more than scale alone.'},
];

export const FOOD_TASKS: TaskTemplate[] = [
  {category:'tasks',title:'Nutrition Priorities',description:'Protein every meal, hydration/electrolytes, fiber, balanced meals, smoothies, collagen as planned, bone broth and meal-prep structure.'},
  {category:'tasks',title:'Master Grocery — Produce',description:'Zucchini; spinach; kale; fresh basil; carrots; cucumber; red cabbage; green onion; red bell pepper; onion; garlic; lemons; lime; potatoes; strawberries; blueberries.'},
  {category:'tasks',title:'Master Grocery — Frozen + Proteins',description:'Frozen stir-fry vegetables; frozen fruit for smoothies. Proteins: tofu; shrimp (present in source file); bone broth; optional protein of choice.'},
  {category:'tasks',title:'Master Grocery — Grains + Dry Goods',description:'Rolled oats; quinoa; white rice; lentils; beans; cannellini beans; butter beans; kelp noodles; oat flour.'},
  {category:'tasks',title:'Master Grocery — Dairy / Alternatives + Creamers',description:'Milk of choice; unsweetened almond milk; nonfat plain Greek yogurt; Laughing Cow light cheese; light butter; Chobani Sweet Cream Coffee Creamer; Ben & Jerry’s Non Dairy Ice Cream Coffee Creamer.'},
  {category:'tasks',title:'Master Grocery — Pantry + Seasonings',description:'Olive oil; peanut butter; low-sodium soy sauce; rice vinegar; miso paste; nutritional yeast; cacao powder; collagen powder; honey; monk fruit sweetener or liquid stevia; yellow mustard; baking soda; salt; pepper; garlic powder; onion powder; ginger; optional sesame seeds, chopped peanuts and Sriracha.'},
  {category:'tasks',title:'Locked Always-Add Grocery Items',description:'Collagen powder; frozen fruit for smoothies; strawberries; honey; Chobani Sweet Cream Coffee Creamer; Ben & Jerry’s Non Dairy Ice Cream Coffee Creamer.'},
  {category:'tasks',title:'Snack Library',description:'Toasted rice crackers + thin vegan butter + light agave; carrots with ranch; strawberries + honey; strawberries + blueberries; frozen fruit bowl; Greek yogurt + honey or berries; bone-broth hot cocoa (optional dairy-free Cool Whip); smoothie snack; protein sugar cookies; snack-size low-calorie kelp-noodle mac and cheese; açaí sorbet.'},
  {category:'tasks',title:'Chia Seed Pudding',description:'Basic formula: chia seeds + milk/non-dairy milk; optional honey; optional strawberries or blueberries.'},
  {category:'tasks',title:'Smoothie Formula',description:'Half water / half creamer. Add liquid to a little more than halfway up where the fruit ends. Add Splenda + honey, spinach + kale mixture and frozen fruit. Source add-ins also list collagen powder, milk/non-dairy milk and strawberries.'},
];

export const MONTHLY_RESET_TEMPLATES: TaskTemplate[] = [
  {category:'tasks',title:'Monthly Glow OS Reset — Day 1',description:'Review routines, habits, goals, beauty maintenance, home, finances, school, work, content/Dynasty, body goals, emotional patterns and life-management systems.'},
  {category:'tasks',title:'Monthly Beauty Maintenance — Day 2',description:'Brows, nails, teeth whitening, hair-product restock, skincare restock, makeup-bag cleanout, body-care products and everything-shower upgrade; progress photos and beauty audit as useful.'},
  {category:'tasks',title:'Monthly U-Part Wig Wash — Day 4',description:'Wash current unit/U-part wig, detangle gently, refresh curls or straighten, reset blend and prepare for the month.'},
  {category:'tasks',title:'Monthly Closet + Style Reset — Day 5',description:'Organize clothes, review outfits, update Whering/style system, plan work looks, soft-life outfits, gym outfits, content outfits and seasonal needs.'},
];

export const SEASONAL_RESET_TEMPLATES: TaskTemplate[] = [
  {category:'tasks',title:'Spring Cleaning Reset — March 20',description:'Deep clean, wardrobe transition, beauty refresh, home refresh, car refresh, body-goal review and spring-routine update.'},
  {category:'tasks',title:'Fall Structure Reset — September 1',description:'Reset school, work, wardrobe, routines, calendar, planning system, hair, beauty and colder-weather structure.'},
];

export const YEARLY_RESET_TEMPLATES: TaskTemplate[] = [
  {category:'tasks',title:'January New Year Glow OS Audit — January 1',description:'Review identity, habits, routines, goals, money, body, beauty, work, school, content/Dynasty, relationships, home and long-term direction.'},
  {category:'tasks',title:'Midyear Glow OS Review — June 1',description:'Audit first half of year: routines, money, fitness, beauty, work, school, emotional growth and content/Dynasty progress.'},
  {category:'tasks',title:'December Lock-In Reset — December 1',description:'No doom scrolling; micro-habits in fitness, discipline, career, mental health and daily 3-2-1 check-ins; use December as launchpad into the new year.'},
];

export const CALENDAR_TEMPLATES: CalendarTemplate[] = [
  {category:'calendar_templates',title:'Open Blinds + Natural Light',description:'Open blinds immediately; natural light wake-up/clarity ritual.',startTime:'05:00',durationMinutes:5,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Hydration',description:'Drink water first thing before caffeine, scrolling or rushing.',startTime:'05:05',durationMinutes:5,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Supplements',description:'Take planned vitamins/supplements; prescriptions/hormone-related items only as directed.',startTime:'05:10',durationMinutes:5,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Stomach Vacuums',description:'Core activation and waist/posture awareness.',startTime:'05:15',durationMinutes:5,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Gua Sha + Lymphatic Massage',description:'Gentle drainage/sculpt focus: neck, jaw, cheeks, under-eyes/face and calm posture.',startTime:'05:20',durationMinutes:10,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Facial Posture Check',description:'Tongue on palate, jaw unclenched, brows/eyes soft, shoulders down, chin slightly tucked.',startTime:'05:30',durationMinutes:5,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Skincare AM',description:'Cleanse as needed, hydrate, moisturize and SPF; keep barrier supportive.',startTime:'05:35',durationMinutes:15,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Morning Hair Routine',description:'Settle/assess, light hydration, leave-in, light seal, blend leave-out, style and front pieces last.',startTime:'05:50',durationMinutes:25,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Makeup or Polish Routine',description:'Light glam or polished face; clean skin, brows, lashes, lips and soft dimension.',startTime:'06:15',durationMinutes:20,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Get Dressed + Outfit Check',description:'Choose look for schedule, work/school/errands, mood and polish.',startTime:'06:35',durationMinutes:15,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Protein Breakfast + Hydration',description:'Eat/prep a protein-centered breakfast and hydrate again.',startTime:'06:50',durationMinutes:20,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Brain Dump',description:'Capture tasks, reminders, life-management and open loops.',startTime:'07:10',durationMinutes:10,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Top 3 Daily Goals',description:'Choose three main high-leverage goals only.',startTime:'07:20',durationMinutes:10,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Google Calendar Check',description:'Review appointments, work/school, errands, routines, deadlines and time blocks.',startTime:'07:30',durationMinutes:10,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Work Shift or Main Execution Block',description:'Main execution for work, school, study, admin, errands, content, cleaning or priority work.',startTime:'10:00',durationMinutes:240,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Midday Reset',description:'Hydrate/eat, posture and jaw check, breathe, task check and emotional reset.',startTime:'13:00',durationMinutes:20,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Saint Care Midday',description:'Feed if needed, walk, play, check water and care needs.',startTime:'15:30',durationMinutes:20,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Evening Routine',description:'Transition out of execution mode; dinner, body/space reset, important messages and night prep.',startTime:'18:00',durationMinutes:45,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Cleaning Mini Reset',description:'Room, trash, surfaces, laundry, dishes and vanity reset.',startTime:'18:45',durationMinutes:20,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Night Hair Protection',description:'Low-tension protective style and satin/silk protection.',startTime:'20:30',durationMinutes:15,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Skincare PM',description:'Cleanse/treat/hydrate/moisturize/lip care and barrier protection.',startTime:'20:45',durationMinutes:20,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Body Care',description:'Moisturize/oil as needed; hands, feet, neck/chest and body glow maintenance.',startTime:'21:05',durationMinutes:15,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Night Brain Dump + Tomorrow Prep',description:'Open loops, tomorrow priorities/outfit, work/school, beauty and errands.',startTime:'21:20',durationMinutes:20,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'No Doomscroll Shutdown',description:'Phone down, app blocking if needed, soft light and sleep protection.',startTime:'21:45',durationMinutes:15,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Sleep Wind Down',description:'Low stimulation, reflection, calm breathing and sleep preparation.',startTime:'22:00',durationMinutes:60,daysOfWeek:ALL_DAYS},
  {category:'calendar_templates',title:'Sunday Reset',description:'Full home/life reset, laundry/bedding, beauty, errands/groceries and self-care.',startTime:'11:00',durationMinutes:240,daysOfWeek:['sunday']},
  {category:'calendar_templates',title:'Weekly Planning Reset',description:'Calendar, tracking, tasks, routines, habits, goals, work/school, admin and beauty maintenance.',startTime:'16:00',durationMinutes:60,daysOfWeek:['sunday']},
  {category:'calendar_templates',title:'Meal Prep + Groceries',description:'Plan meals, grocery list, proteins, snacks, hydration and easy work/school food.',startTime:'17:00',durationMinutes:90,daysOfWeek:['sunday']},
  {category:'calendar_templates',title:'Hair Wash Day',description:'Full Sunday hair reset / deep condition / scalp care / detangle / style.',startTime:'19:00',durationMinutes:90,daysOfWeek:['sunday']},
  {category:'calendar_templates',title:'Midweek Reset',description:'Room, laundry, tasks, calendar, emotional state, hydration, hair, bags, car and open loops.',startTime:'19:00',durationMinutes:60,daysOfWeek:['wednesday']},
  {category:'calendar_templates',title:'Thursday Hair Refresh',description:'Refresh current unit/style, rehydrate mids/ends, fix blend and do front hairs last.',startTime:'20:00',durationMinutes:45,daysOfWeek:['thursday']},
  {category:'calendar_templates',title:'Weekly Finance Check',description:'Spending, bills, savings buckets, car/gas, groceries, fun, takeout, buffer, investing and upcoming charges.',startTime:'10:00',durationMinutes:30,daysOfWeek:['friday']},
  {category:'calendar_templates',title:'Weekly Laundry Reset',description:'Wash/dry/fold/hang/put away; towels, bedding, work/gym and beauty laundry.',startTime:'12:00',durationMinutes:90,daysOfWeek:['saturday']},
  {category:'calendar_templates',title:'Car Cleaning',description:'Trash, wipe surfaces, organize, gas and essentials check.',startTime:'14:00',durationMinutes:45,daysOfWeek:['saturday']},
];

export const IMPORT_CATEGORY_TEMPLATES: Record<ImportCategory,ImportTemplate[]> = {
  routines: CORE_DAILY_ROUTINE_TEMPLATES,
  habits: CORE_DAILY_HABIT_TEMPLATES,
  tasks: [...FITNESS_TASKS,...FOOD_TASKS],
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

export function getWorkoutOfTheDay(day:Weekday){ return WORKOUT_SPLIT.find((w)=>w.day===day) ?? WORKOUT_SPLIT[0]; }
export function getWeeklyTheme(day:Weekday){ return WEEKLY_THEMES.find((t)=>t.day===day) ?? WEEKLY_THEMES[0]; }
