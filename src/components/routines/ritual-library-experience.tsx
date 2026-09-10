'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  Apple,
  ArrowLeft,
  ArrowRight,
  BedDouble,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  Cloud,
  Dumbbell,
  Eye,
  Flame,
  Flower2,
  Footprints,
  Heart,
  Home,
  Laptop,
  Leaf,
  ListChecks,
  Luggage,
  MoonStar,
  NotebookPen,
  PackageCheck,
  Palette,
  Pill,
  Search,
  ShowerHead,
  Smile,
  Sparkles,
  Sprout,
  SunMedium,
  TimerReset,
  WandSparkles,
  Waves,
} from 'lucide-react';

type Energy = 'Recovery' | 'Low' | 'Medium' | 'High';
type CategoryId =
  | 'daily-life' | 'planning' | 'habits' | 'food' | 'wellness' | 'fitness'
  | 'skincare' | 'hair' | 'makeup' | 'beauty' | 'nails' | 'brows' | 'lashes'
  | 'smile' | 'fragrance' | 'home' | 'digital' | 'appointments' | 'travel' | 'seasonal';

type Routine = {
  title: string;
  subtitle: string;
  time?: string;
  frequency?: string;
  steps?: string[];
  tags?: string[];
};

type Category = {
  id: CategoryId;
  title: string;
  subtitle: string;
  count: number;
  icon: typeof SunMedium;
  glow: string;
  routines: Routine[];
};

const ENERGY: Record<Energy, { label: string; helper: string; icon: typeof Cloud; accent: string }> = {
  Recovery: { label: 'Recovery', helper: 'Bare minimum', icon: Cloud, accent: '#8796bb' },
  Low: { label: 'Low Energy', helper: 'Simplify & protect', icon: MoonStar, accent: '#9a84d8' },
  Medium: { label: 'Medium Energy', helper: 'Your normal flow', icon: SunMedium, accent: '#d69d37' },
  High: { label: 'High Energy', helper: 'Full routine available', icon: Flame, accent: '#dd765a' },
};

const r = (title: string, subtitle: string, time = '5–15 min', frequency = 'As needed', steps?: string[]): Routine => ({ title, subtitle, time, frequency, steps });

const CATEGORIES: Category[] = [
  {
    id: 'daily-life', title: 'Daily Life', subtitle: 'Structure your everyday.', count: 24, icon: SunMedium, glow: '#f3b55c',
    routines: [
      r('Morning Routine','Wake · orient · hydrate · care · plan','15–45 min','Daily',['Wake and orient','Morning hydration','First 20','Morning hygiene','Morning wellness','AM skincare','Morning hair','Body + grooming','Get dressed','Morning food','Morning planning','Start the day']),
      r('First 20','Move, breathe or journal before scrolling','5–20 min','Daily',['Water','Daylight or outside','Choose walk, meditation, reading or journal','Keep social scrolling outside the First 20']),
      r('Midday Reset','Recenter and recharge','5–15 min','Daily',['Energy check','Five slow breaths','Relax jaw + shoulders','Hydrate','Food check','Walk or stretch','Return to one next action']),
      r('Afternoon Routine','Stay productive and balanced','10–20 min','Daily'),
      r('Evening Routine','Transition and unwind','30–60 min','Daily',['Close work','Capture unfinished items','Workout or movement if scheduled','Dinner','Small life admin','Leisure','Begin night landing']),
      r('Night Routine','Close the day with care','20–40 min','Daily',['Close day','10-minute tidy','Return everything home','Tomorrow setup','Digital sunset','Hygiene','PM skincare','Night hair','Body care','Reflection','Calm down','Sleep']),
      r('Tomorrow Setup','Prepare a smoother day','10–20 min','Daily'),
      r('Daily Planning','Plan with clarity','10–20 min','Daily'),
      r('Daily Reflection','Check in. Grow.','5–15 min','Daily'),
      r('Workday Routine','Focused, balanced workday','Varies','Work days'),
      r('Home Day Routine','A calmer flow at home','Varies','Home days'),
      r('Out & About','Confident anywhere','Varies','As needed'),
      r('Sick Day Routine','Care and recover','Varies','As needed'),
      r('Low-Energy Day','Simplify and protect','Varies','As needed'),
      r('High-Energy Day','Make the most of it','Varies','As needed'),
      r('Reset Day','Pause and realign','Varies','As needed'),
      r('Sunday Reset','A fresh week ahead','2–4 hr','Weekly'),
    ],
  },
  {
    id: 'planning', title: 'Planning', subtitle: 'Plan with clarity.', count: 29, icon: NotebookPen, glow: '#caa07b',
    routines: [
      r('Quick Capture','Capture first. Organize second.','1–2 min','As needed'), r('Brain Dump','Get everything out of your head','5–15 min','As needed'), r('Fluff List','Time-sensitive · general · nice-to-do · future','10 min','Weekly'), r('Daily Planning','Calendar · capacity · priorities · time blocks','10–20 min','Daily'), r('Top 1','The one thing that matters most','2 min','Low-energy days'), r('Top 3','Your three highest-value priorities','3 min','Daily'), r('High-Energy Six Tasks','Rank six important tasks in order','5 min','High-energy days'), r('Time Blocking','Translate priorities into clock time','10–20 min','Daily'), r('Energy Planning','Match task demand to real capacity','5 min','Daily'), r('Deep Work','Protected high-focus work','50–180 min','As scheduled'), r('50 / 10 Focus','50 minutes work · 10 minutes break','60 min','As needed'), r('Admin Batch','Group shallow tasks together','30–90 min','As needed'), r('Creative Batch','Create without context switching','60–180 min','As needed'), r('Errand Batch','Group location-based tasks','Varies','Weekly'), r('Portable Tasks','Use small gaps intentionally','5–20 min','As needed'), r('Daily Theme','Give the day one primary identity','3 min','Daily'), r('Workday Setup','Prepare workspace and first action','10 min','Work days'), r('Work Shutdown','Capture · move · close · leave work mode','10–20 min','Work days'), r('Tomorrow Parking Lot','Store unfinished thoughts for tomorrow','5 min','Daily'), r('Weekly Reflection','What worked · what did not','15–30 min','Weekly'), r('Weekly Planning','Month → calendar → week → day','30–60 min','Weekly'), r('Monthly Planning','See the landscape','30–60 min','Monthly'), r('Monthly Reflection','Wins · challenges · patterns','20–40 min','Monthly'), r('Goal Review','Progress and next moves','20 min','Monthly'), r('Capacity Review','Planned time vs actual capacity','10 min','Weekly'), r('Duration Review','Estimated vs actual time','10 min','Weekly'), r('Digital Planning Reset','Clean planning inputs','15 min','Weekly'), r('Travel Planning','Reverse-plan travel logistics','30–60 min','Event-based'), r('Event Reverse Planning','Work backward from the event','20–45 min','Event-based'),
    ],
  },
  {
    id: 'habits', title: 'Habits', subtitle: 'Small habits. Big results.', count: 32, icon: Sprout, glow: '#86ae79',
    routines: [r('Morning Hydration','Water after waking','2 min','Daily'),r('No Scroll Morning','Protect the first part of the day','20 min','Daily'),r('Meditation','1 · 5 · 10 · 20 minute versions','1–20 min','Daily'),r('Walking','Outdoor or treadmill movement','15–60 min','Daily'),r('Daylight','Get outside or open the day to light','5–20 min','Daily'),r('Gratitude','Three things you are grateful for','3 min','Daily'),r('Journal','Morning, night or free-form','5–20 min','Daily'),r('Reading','Quiet attention ritual','10–30 min','Daily'),r('Affirmations','Intentional self-talk','3–10 min','Daily'),r('Make Bed','A small morning win','2 min','Daily'),r('Digital Boundary','Use friction instead of willpower','Varies','Daily'),r('1% Better','Name one piece of progress','2 min','Daily'),r('Daily Proof','Save evidence that you showed up','3 min','Daily'),r('Portfolio of Proof','Keep evidence of progress','10 min','Weekly'),r('Return Everything Home','Use → return','5–10 min','Daily'),r('10-Minute Tidy','Reset the environment','10 min','Daily')],
  },
  {
    id: 'food', title: 'Food + Nutrition', subtitle: 'Fuel your best self.', count: 28, icon: Apple, glow: '#bd7e61',
    routines: [r('Morning Food','Hydrate · check hunger · choose breakfast','5–20 min','Daily'),r('Breakfast','Simple default or cooked breakfast','10–25 min','Daily'),r('High-Protein Breakfast','Protein-forward option','10–25 min','As desired'),r('Midday Meal','Use prepped food first','15–30 min','Daily'),r('Work Lunch','Portable, planned lunch','15–30 min','Work days'),r('Dinner','Eat · store leftovers · reset','20–60 min','Daily'),r('Snacks','Portable and satisfying options','5 min','As needed'),r('Hydration','Morning · midday · workout · evening','2 min','Daily'),r('Meal Planning','Choose meals around your actual week','20–30 min','Weekly'),r('Grocery Planning','Inventory first · gaps second','15 min','Weekly'),r('Grocery Shopping','Buy only actual gaps','30–60 min','Weekly'),r('Sunday Meal Prep','Prep · portion · store · reset','60–120 min','Weekly'),r('Repeat Meals','Use reliable defaults','10 min','Weekly'),r('Leftovers','Store and use intentionally','5 min','Daily'),r('Use First','Surface perishables first','5 min','Daily'),r('Low-Energy Food','Prepared · frozen · simple · delivery','5–15 min','As needed'),r('Supplements','Only approved individual supplement objects','2–5 min','Per plan')],
  },
  {
    id: 'wellness', title: 'Wellness', subtitle: 'A calmer, healthier you.', count: 24, icon: Waves, glow: '#95a58a',
    routines: [r('Morning Wellness','Light · movement · calm','5–20 min','Daily'),r('Morning Light','Natural light before phones','5–20 min','Daily'),r('Outdoor Walk','Movement + reset','15–45 min','Daily'),r('Midday Reset','Breathe · water · move · return','5–15 min','Daily'),r('Low-Stimulation Break','Walk · stretch · shower · quiet','5–20 min','As needed'),r('Meditation','Micro to full versions','1–20 min','Daily'),r('Breathwork','Five slow breaths or longer practice','1–10 min','As needed'),r('Body Scan','Calm close to the day','3–10 min','Night'),r('Evening Wind-Down','Begin 1–2 hours before bed','60–120 min','Daily'),r('Digital Sunset','Reduce stimulation before bed','20–60 min','Daily'),r('Sleep Routine','Protect bedtime and wake rhythm','8 hr','Daily'),r('Sleep Audit','Review sleep bottlenecks','15 min','Weekly'),r('Recovery Day','Reduce load and restore','Varies','As needed'),r('Sick Day','Essentials only','Varies','As needed'),r('Red-Light Session','Device-specific use only','Per device','As scheduled'),r('Cycle Review','Compare phase with your own patterns','10 min','Weekly'),r('Wearable Review','Device says vs how I feel','10 min','Weekly')],
  },
  {
    id: 'fitness', title: 'Fitness', subtitle: 'Stronger every day.', count: 22, icon: Dumbbell, glow: '#d88aa2',
    routines: [r('Day 1 · Glutes + Hamstrings','Hip thrust · RDL · curl · kickback · extension','45–75 min','Weekly'),r('Day 2 · Upper Body + Posture','Pulldown · row · rear delt · raises · press · face pull','45–60 min','Weekly'),r('Day 3 · Recovery + Walking','Walking · Pilates · stretching · mobility','20–45 min','Weekly'),r('Day 4 · Glutes + Side Glutes','Light thrust · Bulgarian · abduction · side kick · step-up','45–70 min','Weekly'),r('Day 5 · Upper Body + Arms','Row · rear delt · triceps · biceps · lateral raise','40–60 min','Weekly'),r('Day 6 · Cardio + Core + Mobility','Cardio · leg raise · reverse crunch · plank · dead bug · vacuum','35–60 min','Weekly'),r('Day 7 · Full Rest','Recovery is part of the program','All day','Weekly'),r('Glute Warm-Up','Prepare hips and glutes','8–12 min','Training days'),r('Deep Core','Control + transverse abdominis focus','10–15 min','2–4x weekly'),r('Vacuum Routine','Breath and deep-core practice','5 min','As scheduled'),r('Posture Routine','Upper-back and alignment support','10–15 min','Daily'),r('Walking','Outdoor or treadmill','20–60 min','Daily'),r('Mobility','Restore range and ease','10–20 min','As needed'),r('Low-Energy Workout','Shortened or recovery version','10–30 min','As needed'),r('Progress Review','Strength · shape · posture · energy','20 min','Monthly')],
  },
  {
    id: 'skincare', title: 'Skincare', subtitle: 'Glow with healthy skin.', count: 28, icon: Sparkles, glow: '#e7b1a6',
    routines: [r('AM Full Routine','Cleanser · toner/essence · vitamin C · serum · moisturizer · SPF','7–12 min','Daily'),r('AM Normal Routine','Cleanser · serum · moisturizer · SPF','5–8 min','Daily'),r('AM Quick Routine','Moisturizer · SPF · lip care','3 min','Daily'),r('AM Bare Minimum','Skin comfort + appropriate SPF','2 min','As needed'),r('Makeup Prep Skincare','Skin prep chosen for makeup compatibility','6–10 min','Makeup days'),r('PM Standard Routine','Remove · cleanse · toner · treatment · moisturize · eye · lip','7–12 min','Daily'),r('PM Treatment Routine','Scheduled active treatment night','6–10 min','Scheduled'),r('PM Retinoid Routine','Exact product/prescription schedule','6–10 min','Scheduled'),r('PM Recovery Routine','Gentle cleanse · barrier support · moisturize · lip','5–8 min','As needed'),r('Makeup Removal','Remove complexion, eye and lip makeup','5 min','Makeup days'),r('Double Cleanse','First cleanse → second cleanse','5 min','As needed'),r('Hydration Night','Hydrating layers + barrier moisture','5–8 min','As needed'),r('Acne Flare Routine','Check irritation before treatment load','5–10 min','As needed'),r('Barrier Repair Routine','Reduce actives · restore comfort','5–10 min','As needed'),r('Mask Routine','Product-specific mask session','10–30 min','As scheduled'),r('BioDance Mask Ritual','Optional mask ritual','20–60 min','As desired'),r('Gua Sha Routine','Tool ritual with compatible skincare','5–15 min','As desired'),r('Face Yoga Routine','Facial movement ritual','5–10 min','As desired'),r('Red Light Routine','Follow actual device instructions','Per device','As scheduled'),r('Body Skincare','Cleanse · moisturize · body oil/SPF as appropriate','5–15 min','Daily'),r('Body Exfoliation','Scheduled body exfoliation','10 min','Weekly'),r('Body Retinoid Routine','Separate body treatment schedule','5 min','Scheduled'),r('Procedure Prep','Provider-specific preparation','Varies','Event-based'),r('Procedure Recovery','Provider directions override defaults','Varies','Event-based'),r('Travel Skincare','Simplified routine from owned products','5–10 min','Travel')],
  },
  {
    id: 'hair', title: 'Hair', subtitle: 'Healthy hair, always.', count: 30, icon: Waves, glow: '#c5a28f',
    routines: [r('Morning Hair','Release · assess · hydrate if needed · blend · style','5–15 min','Daily'),r('Night Hair','Remove · detangle · moisture check · secure · protect','5–15 min','Daily'),r('Hydration Refresh','Light water/aloe + small leave-in as needed','5 min','Every 1–2 days'),r('Ends Oiling','2–3 drops light oil to ends','2 min','Daily / every other day'),r('Leave-Out Check','Dryness · frizz · blending · parting','3 min','Daily'),r('Leave-Out Refresh','Three-direction blend','5 min','Every few days'),r('U-Part Setup','Part · braid base · secure · add wig · blend','15–30 min','As needed'),r('U-Part Removal','Gentle removal + reset','5–10 min','Night / as needed'),r('Front-Piece Styling','Always style front pieces last','5–10 min','As needed'),r('Protective Style','Low-tension protection','15–45 min','As needed'),r('Scalp Massage','Fingertips only · no nails','3–5 min','Daily / as desired'),r('Scalp Oil Treatment','Separate from daily ends oil','20–60 min','Scheduled'),r('Sunday Full Reset','Pre-oil · double shampoo · mask · condition · style','90–150 min','Weekly'),r('Thursday Bond Repair','Bond treatment · double shampoo · condition · restyle','60–90 min','Weekly'),r('Clarifying Wash','Occasional buildup removal','30–60 min','As needed'),r('Deep Conditioning','Mask or deep conditioner','20–40 min','Weekly'),r('Wig Wash','Clean and reset removable hairpiece','45–90 min','Monthly / as needed'),r('Blowout','Heat protect · dry · shape · front pieces last','30–60 min','As needed'),r('Straight Style','Smooth with protected heat','20–45 min','As needed'),r('Soft Curls','Movement over stiffness','20–45 min','As needed'),r('Hair Tool Cleaning','Clean brushes and hot tools safely','15 min','Monthly')],
  },
  {
    id: 'makeup', title: 'Makeup', subtitle: 'Express your beauty.', count: 18, icon: Palette, glow: '#d8a89b',
    routines: [r('Quick Makeup','Complexion correction · brows · blush · lip','5–10 min','As needed'),r('Everyday Look','Balanced everyday makeup','15–25 min','As needed'),r('Everyday Chinese Douyin','Thin base · three blushes · soft brows · Manhua lashes · gradient lip','35–60 min','As desired'),r('Everyday Baddie','Warm bronzed complexion · liner · half lashes · freckles','30–50 min','As desired'),r('Ningning Y2K / Rose','Rose eyes · defined lower lash · Y2K styling','40–60 min','As desired'),r('Beginner Douyin','Matte base · sculpting · enlarged-eye techniques','30–50 min','As desired'),r('Aegyo-Sal Routine','Eye-specific lower-eye shaping','10–15 min','As desired'),r('Lip Routine','Contour · center color · gloss','5–10 min','As desired'),r('Base Routine','Prep · complexion · set','10–20 min','As desired'),r('Touch-Up','Refresh complexion, lips and eye details','5–10 min','As needed'),r('Makeup Removal','Connects back to skincare cleansing','5–10 min','Makeup days'),r('Event Makeup','Full look based on event context','45–90 min','Event-based')],
  },
  {
    id: 'beauty', title: 'Beauty + Grooming', subtitle: 'Care for every detail.', count: 28, icon: Flower2, glow: '#dcb4a1',
    routines: [r('Daily Grooming','Skincare · hair · lips · deodorant · body care','5–20 min','Daily'),r('Quick Grooming','Essentials only','5 min','As needed'),r('Full Grooming','Complete personal-care version','30–60 min','As needed'),r('Everything Shower','A container routine built from what is actually due','30–120 min','Weekly'),r('Body Shower','Cleanse + basic aftercare','10–20 min','Daily / as needed'),r('Body Exfoliation','Scheduled exfoliation','10 min','Weekly'),r('Shaving','Preference-based hair removal','10–30 min','As needed'),r('Body Lotion','Daily moisture','3–5 min','Daily'),r('Body Oil','Optional seal and glow','3–5 min','As desired'),r('Hand Care','Hands + cuticles','5 min','As needed'),r('Foot Care','Feet + dry areas','10–20 min','Weekly'),r('Friday Fragrance Ritual','Choose and layer a scent story','5–10 min','Weekly'),r('Makeup Brush Cleaning','Clean frequently used tools','15–30 min','Weekly'),r('Beauty Tool Cleaning','Sanitize and reset tools','15–30 min','Weekly / monthly'),r('Beauty Inventory','Owned · backup · testing · needs ID','20 min','Monthly'),r('Beauty Audit','What is working, missing or overstocked','20 min','Monthly'),r('Appointment Prep','Provider · cost · prep · recovery','10 min','Event-based'),r('Event Beauty Prep','Reverse-plan hair, skin, body, nails and makeup','30–60 min','Event-based')],
  },
  { id:'nails', title:'Nails', subtitle:'Polished & confident.', count:14, icon:Sparkles, glow:'#d9a3aa', routines:[r('Daily Nail Check','Chips · lifting · damage · dry cuticles','2 min','Daily'),r('Weekly Nail Maintenance','Shape · cuticles · condition check','10–20 min','Weekly'),r('Natural Nail Care','Remove · inspect · shape · moisturize','15–30 min','Weekly'),r('DIY Gel Nails','Prep · apply · cure · finish · clean','45–90 min','As needed'),r('French Tips','Classic source nail aesthetic','45–90 min','As desired'),r('Press-On Nails','Prep · place · finish','20–40 min','As desired'),r('Gel Removal','Safe product-specific removal','30–60 min','As needed'),r('Press-On Removal','Gentle removal + condition check','15–30 min','As needed'),r('Cuticle Care','Soften · tidy · moisturize','5–10 min','Weekly'),r('Nail Repair','Address snag, break or lifting','5–20 min','As needed'),r('Nail Tool Cleaning','Clean reusable implements','10 min','After use'),r('Nail Supply Review','Check products, tools and restock gaps','15 min','Monthly')] },
  { id:'brows', title:'Brows', subtitle:'Defined, effortlessly.', count:8, icon:Eye, glow:'#b9987f', routines:[r('Daily Brow Grooming','Brush · gel/fill if wanted','2–5 min','Daily'),r('Weekly Brow Cleanup','Small touch-up if needed','5–10 min','Weekly'),r('Monthly Shape Review','Review shape and maintenance needs','10 min','Monthly'),r('Brow Product Review','Gel · pencil · powder · tools','10 min','Monthly'),r('Professional Brow Appointment','Threading · wax · tint where used','Varies','As needed'),r('Microblading Tracking','Professional/semi-permanent maintenance only','Varies','Appointment-based')] },
  { id:'lashes', title:'Lashes', subtitle:'Elevate your eyes.', count:10, icon:Eye, glow:'#bea19d', routines:[r('Lash Style Selection','Natural · cat-eye · doll · wispy · half lash','3 min','As desired'),r('Strip Lash Application','Prep · place · blend','10–20 min','As desired'),r('Individual Lash Application','Place temporary individual lashes','15–30 min','As desired'),r('DIY Cluster Application','Product-specific application','20–40 min','As desired'),r('Daily Lash Check','Wear · comfort · lifting · irritation','2 min','Daily'),r('Lash Maintenance','Check adhesive and wear','5–10 min','As needed'),r('Lash Removal','Follow actual remover instructions','10–20 min','As needed'),r('Lash Tool Cleaning','Clean tweezers/applicators','5–10 min','After use'),r('Lash Lift Tracking','Professional appointment tracking','Varies','Appointment-based')] },
  { id:'smile', title:'Smile + Oral Care', subtitle:'A brighter smile.', count:10, icon:Smile, glow:'#d8d0c4', routines:[r('Morning Oral Care','Brush · floss/tongue care as planned','5–10 min','Daily'),r('Night Oral Care','Complete nighttime oral hygiene','5–10 min','Daily'),r('Flossing','Daily interdental care','2–5 min','Daily'),r('Tongue Care','Tongue cleaning','1–2 min','Daily'),r('Breath Care','Support freshness without masking symptoms','2 min','As needed'),r('Whitening','Only according to exact product directions','Per product','Scheduled'),r('Whitening Sensitivity Check','Comfort and eligibility check','2 min','Before whitening'),r('Dental Appointment Prep','Questions · insurance · symptoms','10 min','Yearly / as needed'),r('Dental Follow-Up','Record plan and next review','10 min','After appointment')] },
  { id:'fragrance', title:'Fragrance', subtitle:'Scent your mood.', count:9, icon:Flower2, glow:'#e2b6b2', routines:[r('Daily Scent','Choose one scent or skip','2 min','Daily'),r('Friday Fragrance Ritual','Full scent selection ritual','5–10 min','Weekly'),r('Fragrance Layering','Body wash → lotion → oil → mist → perfume','5–10 min','As desired'),r('Work Scent','Context-appropriate scent','2 min','Work days'),r('Evening Scent','Nighttime fragrance choice','2 min','As desired'),r('Event Scent','Pair scent with occasion + outfit','3 min','Event-based'),r('Bedtime Scent','Optional calm scent ritual','2 min','As desired'),r('Seasonal Scent Change','Rotate seasonal favorites','15 min','Seasonal'),r('Fragrance Inventory','Track notes, wear and repurchase','15 min','Monthly')] },
  { id:'home', title:'Home', subtitle:'A calmer space.', count:15, icon:Home, glow:'#c5b8a7', routines:[r('Morning Bedroom Reset','Bed · curtains · obvious clutter','5–10 min','Daily'),r('Nightly 10-Minute Tidy','Trash · clothes · products · surfaces','10 min','Daily'),r('Return Everything Home','Everything back where it belongs','5–10 min','Daily'),r('Laundry','Wash · dry · fold · put away','60–120 min','Weekly'),r('Surface Reset','Clear and reset visible surfaces','10 min','Daily / weekly'),r('Kitchen Reset','Dishes · counters · leftovers','10–20 min','Daily'),r('Bathroom Reset','Products · towels · surfaces','10–20 min','Weekly'),r('Weekly Cleaning Reset','Whole-home maintenance','60–180 min','Weekly'),r('Declutter','Remove what is no longer useful','20–60 min','Monthly'),r('Storage Review','Design storage around real behavior','20 min','Monthly') ] },
  { id:'digital', title:'Digital', subtitle:'A cleaner, calmer digital life.', count:14, icon:Laptop, glow:'#aaaabd', routines:[r('Digital Reset','Inbox · files · screenshots · tabs','10–30 min','Weekly'),r('Camera Roll Cleanup','Delete obvious duplicates/junk','5–15 min','Every few days'),r('Email Cleanup','Labels · archive · action items','10–30 min','Weekly'),r('File Organization','Return documents to their home','15–30 min','Weekly'),r('App Review','Remove or limit distracting apps','10 min','Monthly'),r('Social Cleanup','Following + saved content review','15 min','Monthly'),r('Screen-Time Review','Notice patterns without judgment','10 min','Weekly'),r('Focus Mode Setup','Configure digital friction','10 min','As needed'),r('Brick / Opal Boundary','Use tools to protect focus','5 min','Daily')] },
  { id:'appointments', title:'Appointments', subtitle:'Stay prepared.', count:8, icon:CalendarDays, glow:'#c9b095', routines:[r('Appointment Prep','Provider · location · questions · prep','10 min','Event-based'),r('Beauty Appointment','Service · deposit · prep · recovery','10 min','Event-based'),r('Dental Appointment','Health + cosmetic maintenance','Varies','Yearly / as needed'),r('Preventive Care Review','Check what is due','15 min','Quarterly'),r('Appointment Follow-Up','Record result + next eligible date','10 min','After appointment')] },
  { id:'travel', title:'Travel', subtitle:'Glow anywhere.', count:12, icon:Luggage, glow:'#c7aa91', routines:[r('Travel Planning','Schedule · reservations · dependencies','30–60 min','Event-based'),r('Travel Packing','Use actual itinerary and weather','30–90 min','Event-based'),r('Travel Skincare','Simplified routine from owned products','5–10 min','Travel'),r('Travel Hair','Protection + styling plan','10–30 min','Travel'),r('Travel Makeup','Look options for itinerary','10–30 min','Travel'),r('Travel Beauty','Grooming + maintenance essentials','10–20 min','Travel'),r('Travel Food','Portable food + hydration planning','10–20 min','Travel'),r('Travel Workout','Low-equipment movement','15–30 min','Travel'),r('Arrival Reset','Unpack essentials + reset','20–40 min','Travel')] },
  { id:'seasonal', title:'Seasonal + Annual', subtitle:'All year, all you.', count:8, icon:CalendarDays, glow:'#bdc9d7', routines:[r('Seasonal Reset','Transition routines with the season','60–120 min','Seasonal'),r('Yearly Reset','Reflect · plan · grow','2–4 hr','Yearly'),r('Birthday Routine','Celebrate you','Varies','Yearly'),r('Vacation Mode','Reduce routines and enjoy','Varies','Event-based'),r('Quarterly Review','Goals · routines · systems · maintenance','45–90 min','Quarterly'),r('Annual Beauty Audit','Appointments · inventory · replacements','45 min','Yearly')] },
];

const glass = 'border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,.78),rgba(248,241,234,.56))] shadow-[inset_0_1px_0_rgba(255,255,255,.94),0_18px_55px_rgba(93,69,54,.07)] backdrop-blur-xl';

function EnergySelector({value,onChange}:{value:Energy;onChange:(v:Energy)=>void}){
  return <div className={`${glass} rounded-[24px] p-4`}>
    <div className="mb-3 flex items-center justify-between"><p className="glow-display text-[19px] text-[#302926]">Today&apos;s Energy</p><Sparkles size={14} className="text-[#a99586]"/></div>
    <div className="space-y-2">{(Object.keys(ENERGY) as Energy[]).map(item=>{const meta=ENERGY[item];const Icon=meta.icon;const selected=value===item;return <button key={item} onClick={()=>onChange(item)} className={`flex w-full items-center gap-3 rounded-[17px] border px-3 py-3 text-left transition ${selected?'border-white bg-white/80 shadow-[0_8px_25px_rgba(102,78,62,.08)]':'border-white/60 bg-white/30 hover:bg-white/55'}`}><Icon size={20} style={{color:meta.accent}}/><div className="flex-1"><p className="text-[10px] font-semibold text-[#3e3632]">{meta.label}</p><p className="mt-0.5 text-[8px] text-[#8b7a71]">{meta.helper}</p></div><span className={`h-4 w-4 rounded-full border ${selected?'border-[#3f3733] bg-[#3f3733] shadow-[inset_0_0_0_4px_white]':'border-[#b7aca4]'}`}/></button>})}</div>
  </div>
}

function RoutineDetail({routine,category,energy,onBack}:{routine:Routine;category:Category;energy:Energy;onBack:()=>void}){
  const steps=routine.steps?.length?routine.steps:['Prepare what you need','Start the routine intentionally','Complete the core sequence','Return products and tools home','Log completion and next due date'];
  const intensity=energy==='Recovery'?'Keep only essential steps.':energy==='Low'?'Use the shortest version that still protects the purpose.':energy==='High'?'Use the complete version plus appropriate optional extras.':'Use the normal everyday version.';
  return <div className="space-y-4">
    <button onClick={onBack} className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/55 px-4 py-2 text-[9px] text-[#5e514b]"><ArrowLeft size={12}/> Back to {category.title}</button>
    <div className={`${glass} overflow-hidden rounded-[30px]`}>
      <div className="grid lg:grid-cols-[1.2fr_.8fr]">
        <div className="relative p-7 sm:p-9">
          <div className="absolute -right-8 -top-12 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(255,232,208,.7),rgba(225,213,255,.22)_42%,transparent_70%)] blur-xl"/>
          <p className="text-[8px] font-bold uppercase tracking-[.22em] text-[#9d8173]">{category.title} · Routine Player</p>
          <h1 className="glow-display mt-3 max-w-3xl text-[42px] leading-[1.02] text-[#332c29] sm:text-[58px]">{routine.title}</h1>
          <p className="mt-3 max-w-xl text-[11px] leading-6 text-[#7b6b62]">{routine.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-2">{[routine.time,routine.frequency,energy+' Energy'].filter(Boolean).map(item=><span key={item} className="rounded-full border border-white/90 bg-white/58 px-3 py-2 text-[8px] text-[#75655e]">{item}</span>)}</div>
        </div>
        <div className="border-t border-white/70 bg-white/28 p-5 lg:border-l lg:border-t-0"><EnergySelector value={energy} onChange={()=>{}}/><div className="mt-3 rounded-[20px] border border-white/80 bg-white/55 p-4"><p className="text-[8px] font-bold uppercase tracking-[.16em] text-[#9b746f]">Adaptive instruction</p><p className="mt-2 text-[10px] leading-5 text-[#655750]">{intensity}</p></div></div>
      </div>
    </div>
    <div className="grid gap-4 xl:grid-cols-[1.4fr_.6fr]">
      <div className={`${glass} rounded-[26px] p-5 sm:p-6`}><div className="flex items-center justify-between"><div><p className="text-[8px] font-bold uppercase tracking-[.18em] text-[#9c7c70]">Exact routine order</p><p className="glow-display mt-1 text-[25px] text-[#3f3530]">Your routine right now</p></div><ListChecks size={20} className="text-[#a7897a]"/></div><div className="mt-5 space-y-2">{steps.map((step,index)=><div key={step} className="flex items-start gap-3 rounded-[17px] border border-white/80 bg-white/48 px-4 py-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2e8df] text-[9px] font-semibold text-[#7a6158]">{index+1}</div><p className="pt-1 text-[10px] leading-5 text-[#564a44]">{step}</p></div>)}</div></div>
      <div className="space-y-4"><div className={`${glass} rounded-[24px] p-5`}><p className="text-[8px] font-bold uppercase tracking-[.18em] text-[#947b70]">Routine intelligence</p><div className="mt-4 space-y-3">{['What is actually due today?','Products + tools needed','Where they live','What not to combine','Cleanup + put away','Result + next due'].map(item=><p key={item} className="flex items-center gap-2 text-[9px] text-[#62544d]"><Check size={12} className="text-[#8aa584]"/>{item}</p>)}</div></div><div className={`${glass} rounded-[24px] p-5`}><p className="text-[8px] font-bold uppercase tracking-[.18em] text-[#947b70]">Completion</p><button className="mt-4 flex w-full items-center justify-center gap-2 rounded-[15px] bg-[#403632] px-4 py-3 text-[9px] font-semibold text-white">Start Routine <ArrowRight size={12}/></button></div></div>
    </div>
  </div>;
}

function CategoryPage({category,energy,onEnergy,onBack,onRoutine}:{category:Category;energy:Energy;onEnergy:(v:Energy)=>void;onBack:()=>void;onRoutine:(r:Routine)=>void}){
  const Icon=category.icon;
  return <div className="space-y-4">
    <div className={`${glass} relative overflow-hidden rounded-[30px] p-6 sm:p-8`}>
      <div className="absolute right-10 top-5 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(255,245,227,.9),rgba(231,222,255,.36)_45%,transparent_72%)] blur-2xl"/>
      <div className="relative flex flex-wrap items-start justify-between gap-5"><div><button onClick={onBack} className="mb-4 inline-flex items-center gap-2 text-[8px] text-[#7c6a61]"><ArrowLeft size={11}/> Routine Library</button><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-white/90 bg-white/55 shadow-[0_12px_30px_rgba(100,76,62,.08)]"><Icon size={23} style={{color:category.glow}}/></div><div><p className="glow-display text-[38px] leading-none text-[#302926] sm:text-[48px]">{category.title} Routines</p><p className="mt-2 text-[10px] text-[#7f6f67]">{category.subtitle}</p></div></div></div><p className="glow-hand text-[28px] text-[#a79588]">small routines. brighter life.</p></div>
    </div>
    <div className="grid gap-4 xl:grid-cols-[1fr_270px]">
      <div className={`${glass} rounded-[28px] p-4 sm:p-5`}><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="relative min-w-[220px] flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a89487]"/><input placeholder={`Search ${category.title.toLowerCase()} routines…`} className="w-full rounded-full border border-white/90 bg-white/50 py-2.5 pl-9 pr-4 text-[9px] text-[#5d504a] outline-none placeholder:text-[#ad9d94]"/></div><span className="rounded-full border border-white/90 bg-white/55 px-3 py-2 text-[8px] text-[#7d6d64]">{category.routines.length} routines</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{category.routines.map((routine,index)=><button key={routine.title} onClick={()=>onRoutine(routine)} className="group min-h-[160px] rounded-[22px] border border-white/85 bg-white/42 p-4 text-left shadow-[inset_0_1px_0_white,0_12px_28px_rgba(96,74,60,.055)] transition hover:-translate-y-0.5 hover:bg-white/64"><div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/90 bg-[radial-gradient(circle_at_35%_25%,white,rgba(255,255,255,.45)_40%,rgba(240,224,215,.6))] shadow-[0_8px_20px_rgba(107,81,65,.08)]"><Icon size={20} style={{color:index%2?category.glow:'#b18b7d'}}/></div><p className="mt-4 text-[11px] font-semibold text-[#403632]">{routine.title}</p><p className="mt-1 text-[8px] leading-4 text-[#87766d]">{routine.subtitle}</p><div className="mt-3 flex items-center gap-2 text-[7px] text-[#9b8b82]"><Clock3 size={9}/>{routine.time}<span>·</span>{routine.frequency}</div></button>)}</div></div>
      <div className="space-y-4"><EnergySelector value={energy} onChange={onEnergy}/><div className={`${glass} rounded-[24px] p-4`}><p className="glow-display text-[18px] text-[#3c332f]">Today&apos;s Routine Focus</p><div className="mt-3 space-y-2">{category.routines.slice(0,4).map(item=><button key={item.title} onClick={()=>onRoutine(item)} className="flex w-full items-center justify-between rounded-[15px] border border-white/70 bg-white/38 px-3 py-2.5 text-left text-[8px] text-[#5f524b]"><span>{item.title}</span><ArrowRight size={10}/></button>)}</div></div></div>
    </div>
  </div>;
}

export function RitualLibraryExperience(){
  const [energy,setEnergy]=useState<Energy>('Medium');
  const [categoryId,setCategoryId]=useState<CategoryId|null>(null);
  const [routine,setRoutine]=useState<Routine|null>(null);
  const [query,setQuery]=useState('');
  const category=useMemo(()=>CATEGORIES.find(item=>item.id===categoryId)??null,[categoryId]);
  const filtered=useMemo(()=>CATEGORIES.filter(item=>!query.trim()||item.title.toLowerCase().includes(query.toLowerCase())||item.routines.some(x=>x.title.toLowerCase().includes(query.toLowerCase()))),[query]);

  if(category&&routine) return <RoutineDetail routine={routine} category={category} energy={energy} onBack={()=>setRoutine(null)}/>;
  if(category) return <CategoryPage category={category} energy={energy} onEnergy={setEnergy} onBack={()=>setCategoryId(null)} onRoutine={setRoutine}/>;

  return <section className="relative overflow-hidden rounded-[32px] border border-white/80 bg-[linear-gradient(135deg,#f9f5f0_0%,#f3eee8_46%,#f7f3ee_100%)] p-3 shadow-[0_28px_90px_rgba(92,69,56,.11)] sm:p-5">
    <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_14%_12%,rgba(255,255,255,.95),transparent_26%),radial-gradient(circle_at_70%_9%,rgba(232,222,255,.32),transparent_24%),radial-gradient(circle_at_54%_84%,rgba(255,224,205,.36),transparent_30%)]"/>
    <div className="relative mx-auto max-w-[1500px]">
      <div className="mb-5 text-center"><p className="text-[8px] font-bold uppercase tracking-[.28em] text-[#71645d]">Glow OS</p><h1 className="glow-display mt-2 text-[40px] leading-none text-[#26211f] sm:text-[50px]">Routine Library</h1><p className="mt-2 text-[10px] text-[#80716a]">Every routine. Your whole life. In one place.</p></div>
      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className={`${glass} rounded-[24px] p-3`}><div className="flex flex-wrap gap-2"><div className="relative min-w-[250px] flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a19085]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search routines… (e.g. morning, skincare, workout)" className="w-full rounded-full border border-white/90 bg-white/54 py-3 pl-9 pr-4 text-[9px] text-[#5d514a] outline-none placeholder:text-[#aa9b92]"/></div>{['Time','Frequency','Life Area','Energy','Situation'].map(label=><button key={label} className="rounded-full border border-white/85 bg-white/45 px-4 py-2 text-[8px] text-[#6f625b]">{label} ▾</button>)}</div></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{filtered.map(item=>{const Icon=item.icon;return <button key={item.id} onClick={()=>setCategoryId(item.id)} className="group rounded-[24px] border border-white/85 bg-white/38 p-4 text-left shadow-[inset_0_1px_0_white,0_14px_35px_rgba(92,68,55,.055)] transition hover:-translate-y-1 hover:bg-white/60"><div className="relative flex h-24 items-center justify-center overflow-hidden rounded-[22px] border border-white/90 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,.95),rgba(255,255,255,.42)_38%,rgba(237,222,214,.48)_73%,rgba(255,255,255,.75))]"><div className="absolute inset-3 rounded-[34%_46%_38%_44%] border border-white/80 bg-white/15 shadow-[inset_0_0_24px_rgba(255,255,255,.85),0_10px_28px_rgba(122,89,71,.08)]"/><Icon size={34} className="relative" style={{color:item.glow}}/></div><div className="mt-3 flex items-start justify-between gap-2"><div><p className="text-[11px] font-semibold text-[#3f3733]">{item.title}</p><p className="mt-0.5 text-[8px] text-[#8d7d74]">{item.count} routines</p></div><ArrowRight size={13} className="mt-1 text-[#98877d] transition group-hover:translate-x-1"/></div><p className="mt-2 text-[8px] text-[#766861]">{item.subtitle}</p></button>})}</div>
        </div>
        <div className="space-y-4"><EnergySelector value={energy} onChange={setEnergy}/><div className={`${glass} rounded-[24px] p-4`}><div className="flex items-center justify-between"><p className="glow-display text-[19px] text-[#332c29]">Popular Routines</p><span className="text-[7px] text-[#9d8d83]">See all</span></div><div className="mt-3 space-y-2">{[['Morning Routine','Daily Life'],['Night Routine','Daily Life'],['Everything Shower','Beauty + Grooming'],['Sunday Reset','Daily Life'],['Day 1 · Glutes + Hamstrings','Fitness']].map(([name,cat])=><button key={name} onClick={()=>{const c=CATEGORIES.find(x=>x.title===cat);if(c){setCategoryId(c.id);setRoutine(c.routines.find(x=>x.title===name)??c.routines[0])}}} className="flex w-full items-center justify-between rounded-[15px] border border-white/70 bg-white/36 px-3 py-2.5 text-left"><div><p className="text-[8px] font-medium text-[#574b45]">{name}</p><p className="text-[7px] text-[#9d8c82]">{cat}</p></div><ArrowRight size={10} className="text-[#99877b]"/></button>)}</div></div><div className={`${glass} rounded-[24px] p-4`}><p className="glow-hand text-center text-[24px] leading-tight text-[#9d8b80]">A calmer, more intentional you is always in progress.</p></div></div>
      </div>
      <div className={`${glass} mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[22px] px-4 py-3`}><div className="flex items-center gap-2 text-[#8f776e]"><WandSparkles size={14}/><p className="text-[8px]">Build your ideal routine · create or customize a living Glow Routine Object.</p></div><div className="flex gap-2"><button className="rounded-full border border-white/90 bg-white/55 px-4 py-2 text-[8px] text-[#665951]">Create New Routine</button><button className="rounded-full bg-[#433936] px-4 py-2 text-[8px] text-white">View All Routines</button></div></div>
    </div>
  </section>;
}
