export type WorkspaceModule = {
  title: string;
  description: string;
  metric?: string;
  href?: string;
  action?: string;
};

export type WorkspaceBlueprint = {
  label: string;
  subtitle: string;
  modules: WorkspaceModule[];
};

export const DEEP_WORKSPACES: Record<string, WorkspaceBlueprint> = {
  tasks: { label:'Intelligent Task Manager', subtitle:'Decide, schedule, break down and finish the right work.', modules:[
    {title:'Smart Views',description:'Today · Upcoming · Overdue · Someday · Completed · By Project · By Life Area',href:'/tasks',action:'Open task views'},
    {title:'Execution Controls',description:'Do Now · Schedule · Break Into Steps · Move · Snooze · Complete',href:'/tasks',action:'Work tasks'},
    {title:'Workload Intelligence',description:'Compare urgency, estimated time, energy and calendar space before choosing work.',href:'/brain',action:'Ask Glow'},
    {title:'Project Connections',description:'Keep actions tied to projects, goals, calendar commitments and reminders.',href:'/projects',action:'Open projects'}]},
  calendar: { label:'Life Time Map', subtitle:'See commitments, routines and real life as one flow of time.', modules:[
    {title:'Day · Week · Month',description:'Switch between immediate flow, weekly balance and monthly commitments.',href:'/calendar',action:'Open calendar'},
    {title:'Daily Flow',description:'Wake · routine · workout · getting ready · work · commute · dinner · reset · night routine',href:'/planning',action:'Shape the day'},
    {title:'Scheduling Intelligence',description:'Find realistic spaces for workouts, errands, projects, recovery and appointments.',href:'/brain',action:'Find a time'},
    {title:'Connected Sources',description:'Calendar commitments and imported reminders can inform every other Glow workspace.',href:'/connections',action:'Manage sources'}]},
  planning: { label:'Life Planning Studio', subtitle:'A digital planner connecting today to the year you are building.', modules:[
    {title:'Planning Horizons',description:'Today · Week · Month · Quarter · Year',href:'/planning',action:'Open horizons'},
    {title:'Weekly Board',description:'Priorities · appointments · tasks · meals · workouts · beauty · hair · spending · projects',href:'/planning',action:'Plan the week'},
    {title:'Sunday Reset',description:'Review last week, clear unfinished work, schedule care, choose priorities and generate the new week.',href:'/planning',action:'Start reset'},
    {title:'Prepare Tomorrow',description:'Review commitments and prep the next day before you go to sleep.',href:'/briefings',action:'Prepare tomorrow'}]},
  habits: { label:'Habit Intelligence', subtitle:'Understand consistency, context and friction instead of only checking boxes.', modules:[
    {title:'Today’s Habits',description:'Fast tap-to-complete actions with the most relevant habits first.',href:'/habits',action:'Track today'},
    {title:'Consistency',description:'Current streak · longest streak · weekly completion · monthly completion · best day · most missed',href:'/habits',action:'View patterns'},
    {title:'Habit Garden',description:'A visual growth layer that can turn consistency into a living environment.',href:'/world',action:'Open World'},
    {title:'Glow Insight',description:'Compare habit completion with workdays, time of day, energy and wellness.',href:'/observations',action:'See notices'}]},
  fitness: { label:'Personal Fitness Center', subtitle:'Train around your real schedule, energy and recovery.', modules:[
    {title:'Today’s Workout',description:'Workout · duration · exercises · sets · reps · rest · progression',href:'/fitness',action:'Start workout'},
    {title:'Workout Mode',description:'Track the active exercise, previous weight, current weight, reps and rest timer.',href:'/fitness',action:'Enter training mode'},
    {title:'Progress',description:'Weekly workouts · movement · steps · streak · strength progress · recovery · PRs',href:'/fitness',action:'Review progress'},
    {title:'Workout Intelligence',description:'Choose training based on time available, recent workouts, schedule and recovery context.',href:'/brain',action:'Ask for workout'}]},
  wellness: { label:'Wellness Center', subtitle:'A calmer room for mood, energy, sleep, hydration and nervous-system care.', modules:[
    {title:'Daily Check-In',description:'Mood · energy · stress · sleep · hydration · mindfulness · self-care',href:'/wellness',action:'Check in'},
    {title:'Wellness Patterns',description:'Compare energy and mood with routines, sleep, habits and workload.',href:'/observations',action:'See patterns'},
    {title:'Wellness Toolkit',description:'Breathing · meditation · grounding · journal · stretching · walk · rest · digital detox',href:'/notes',action:'Open toolkit'},
    {title:'Adaptive Day',description:'Use wellness context to reduce or reshape what Glow asks of you.',href:'/planning',action:'Make today lighter'}]},
  beauty: { label:'Beauty Command Center', subtitle:'A visual vanity, planner and routine tracker in one.', modules:[
    {title:'Today’s Beauty',description:'Morning routine · night routine · special treatment · maintenance · appointments',href:'/beauty',action:'Open routine'},
    {title:'Beauty Calendar',description:'Skincare · body · nails · appointments · treatment cadence · maintenance',href:'/calendar',action:'Schedule care'},
    {title:'Visual Progress',description:'Keep progress photos and meaningful changes connected to Memory and Timeline.',href:'/memory',action:'Open memory'},
    {title:'Product Intelligence',description:'Move from routines into ingredients, inventory, reactions and repurchase decisions.',href:'/beauty/lab',action:'Enter Beauty Lab'}]},
  'beauty-lab': { label:'Product Intelligence Lab', subtitle:'The science, inventory and economics behind Beauty OS.', modules:[
    {title:'Product Library',description:'Photo · brand · category · ingredients · purchase/open dates · expiration · price · notes',href:'/beauty/lab',action:'Browse products'},
    {title:'Product Status',description:'Good · use soon · expiring · low stock · unused · repurchase',href:'/beauty/lab',action:'Review inventory'},
    {title:'Compatibility',description:'Compare what products are being used together and keep evidence-based reaction notes.',href:'/beauty/lab',action:'Compare routine'},
    {title:'Beauty Economics',description:'Most used · least used · cost/month · running low · repurchase pressure',href:'/finance',action:'Open finance'}]},
  hair: { label:'Hair Care Studio', subtitle:'Plan wash cycles, treatments, styles and progress visually.', modules:[
    {title:'Hair Dashboard',description:'Current style · last wash · next wash · last treatment · next treatment',href:'/hair',action:'Open hair plan'},
    {title:'Hair Calendar',description:'Wash Day · Deep Condition · Clarify · Treatment · Trim · Protective Style · Scalp Care',href:'/calendar',action:'Schedule hair'},
    {title:'Product Shelf',description:'Shampoo · conditioner · mask · leave-in · oil · styling · cost · opened · repurchase',href:'/hair',action:'Review products'},
    {title:'Hair Journey',description:'Connect progress photos and milestones to Memory and Timeline.',href:'/timeline',action:'View journey'}]},
  finance: { label:'Money Center', subtitle:'Practical spending, budgets, bills and savings in one calm place.', modules:[
    {title:'Money Overview',description:'Current spending · monthly budget · bills due · savings · subscriptions',href:'/finance',action:'Open overview'},
    {title:'Interactive Budget',description:'Housing · Food · Transportation · Beauty · Shopping · Saint · Subscriptions · Entertainment · Savings',href:'/finance',action:'Review categories'},
    {title:'Upcoming Money',description:'Spending calendar · recurring bills · subscription renewals · expected expenses',href:'/calendar',action:'See upcoming'},
    {title:'Money Intelligence',description:'Move from what happened to what it means and what to do next.',href:'/finance/brain',action:'Ask Financial Brain'}]},
  'financial-brain': { label:'Financial Brain', subtitle:'Forecast, compare scenarios and make calmer purchase decisions.', modules:[
    {title:'Spending Meaning',description:'Compare this month with your normal patterns and identify pressure early.',href:'/finance/brain',action:'Analyze spending'},
    {title:'Can I Afford This?',description:'Consider current spending, upcoming commitments, savings goals and timing.',href:'/finance/brain',action:'Run decision'},
    {title:'Scenario Cards',description:'Buy now · wait until payday · save for it · skip it',href:'/finance/brain',action:'Compare scenarios'},
    {title:'Goal Funding',description:'Connect savings decisions directly to active life goals and projects.',href:'/goals',action:'Open goals'}]},
  goals: { label:'Life Goal System', subtitle:'Turn ambitions into visual journeys with milestones and next actions.', modules:[
    {title:'Goal Journeys',description:'Active · Completed · Paused · Future with visible progress and milestones.',href:'/goals',action:'Open goals'},
    {title:'Milestones',description:'Break outcomes into concrete checkpoints instead of a single percentage.',href:'/goals',action:'Review milestones'},
    {title:'Support Systems',description:'Connect each goal to projects, habits, planning and financial requirements.',href:'/projects',action:'See projects'},
    {title:'Next Best Move',description:'Ask Glow which action would move the goal forward most right now.',href:'/brain',action:'Ask Glow'}]},
  projects: { label:'Project Command Center', subtitle:'A creative studio for progress, blockers, files, research and delivery.', modules:[
    {title:'Project Home',description:'Status · health · progress · deadline · priority · velocity · next action',href:'/projects',action:'Open projects'},
    {title:'Project Workspace',description:'Overview · Tasks · Timeline · Files · Notes · Ideas · Research · Milestones · Activity',href:'/projects',action:'Enter workspace'},
    {title:'Visual Board',description:'Backlog · Next · In Progress · Waiting · Complete',href:'/tasks',action:'Work next actions'},
    {title:'AI Project Manager',description:'Find blockers, summarize progress, turn ideas into tasks and build timelines.',href:'/brain',action:'Ask Project Brain'}]},
  brain: { label:'Glow OS Intelligence', subtitle:'The conductor that understands the whole operating system.', modules:[
    {title:'Ask Anything',description:'Ask what matters now, what changed, what is being neglected or what needs attention.',href:'/brain',action:'Ask Glow'},
    {title:'Today’s Intelligence',description:'Priorities · patterns · things requiring attention · recommendations · predictions',href:'/brain',action:'Review intelligence'},
    {title:'Cross-System Context',description:'Tasks, calendar, habits, projects, finance, beauty, wellness and memory inform one answer.',href:'/dashboard',action:'Open command center'},
    {title:'Detected Patterns',description:'See the evidence behind what Glow is noticing.',href:'/observations',action:'Open notices'}]},
  concierge: { label:'Action Concierge', subtitle:'Turn Glow’s understanding into safe, reviewable actions.', modules:[
    {title:'Plan Tomorrow',description:'Generate a proposed day, then Accept · Change Morning · Make Lighter · Add Workout · Move Tasks',href:'/concierge',action:'Plan tomorrow'},
    {title:'Life Prep',description:'Prepare for work · reset day · packing · errands · Sunday reset',href:'/concierge',action:'Ask concierge'},
    {title:'Approval Queue',description:'Important changes stay reviewable and reversible before they affect your plan.',href:'/concierge',action:'Review proposals'},
    {title:'Why This?',description:'Open Brain or Observations to see the reasoning behind a proposal.',href:'/brain',action:'See reasoning'}]},
  observations: { label:'What Glow Noticed', subtitle:'Evidence-based patterns with useful feedback and next actions.', modules:[
    {title:'Routine Patterns',description:'Completion changes, timing friction and recurring misses.',href:'/observations',action:'Review routines'},
    {title:'Life Patterns',description:'Finance · projects · habits · planning · wellness signals in one gallery.',href:'/observations',action:'Review notices'},
    {title:'Feedback',description:'Useful · Not Useful · Dismiss · Snooze · Explain',href:'/observations',action:'Train recommendations'},
    {title:'Take Action',description:'Turn a useful observation into a Concierge proposal or planning change.',href:'/concierge',action:'Act on notice'}]},
  memory: { label:'My Digital Memory', subtitle:'A private search engine for decisions, experiences, preferences and context.', modules:[
    {title:'Memory Search',description:'When did I last… · What did I decide… · What products did I like…',href:'/memory',action:'Search memory'},
    {title:'Memory Categories',description:'People · Places · Decisions · Preferences · Projects · Ideas · Products · Events · Milestones',href:'/memory',action:'Browse memory'},
    {title:'Memory Controls',description:'Edit · Correct · Delete · Pin · Connect · Privacy level · Confidence',href:'/memory',action:'Manage memory'},
    {title:'Life Story',description:'See meaningful memories placed into chronological context.',href:'/timeline',action:'Open timeline'}]},
  timeline: { label:'My Life Story', subtitle:'A visual autobiography generated from the systems you already use.', modules:[
    {title:'Zoom Through Life',description:'Today · Week · Month · Year · Life',href:'/timeline',action:'Explore timeline'},
    {title:'Milestones',description:'Trips · jobs · projects · goals · photos · achievements · purchases · education · beauty · fitness',href:'/timeline',action:'View milestones'},
    {title:'Automatic Capture',description:'Important project, goal and memory events can appear without manual duplication.',href:'/memory',action:'Open memory'},
    {title:'Review Change',description:'Use Briefings to understand what moved during a period.',href:'/briefings',action:'Open briefings'}]},
  briefings: { label:'Personal Intelligence Reports', subtitle:'Morning, evening, weekly and monthly synthesis.', modules:[
    {title:'Morning Briefing',description:'Calendar · priorities · tasks · routine · workout · reminders · preparation',href:'/briefings',action:'Open morning'},
    {title:'Evening Briefing',description:'Completed · missed · spending · habits · reflection · tomorrow',href:'/briefings',action:'Finish day'},
    {title:'Weekly Review',description:'Wins · patterns · goals · habits · spending · projects · neglected areas · recommendations',href:'/briefings',action:'Review week'},
    {title:'Prepare Tomorrow',description:'Turn intelligence into a concrete next-day plan.',href:'/planning',action:'Plan tomorrow'}]},
  closet: { label:'Digital Wardrobe', subtitle:'A visual boutique for inventory, outfits and clothing intelligence.', modules:[
    {title:'Wardrobe',description:'Tops · Bottoms · Dresses · Shoes · Bags · Outerwear · Accessories',href:'/closet',action:'Browse closet'},
    {title:'Outfit Builder',description:'Combine pieces into saved outfits for events and routines.',href:'/closet',action:'Build outfit'},
    {title:'Closet Intelligence',description:'Most worn · never worn · cost per wear · laundry · repair · donate · wishlist',href:'/closet',action:'Review wardrobe'},
    {title:'Event Context',description:'Connect outfit choices to calendar events and future weather context.',href:'/calendar',action:'See events'}]},
  gmail: { label:'Email Intelligence', subtitle:'A life-relevant command center, not a copy of Gmail.', modules:[
    {title:'Needs Response',description:'Surface messages that require action or follow-up.',href:'/gmail',action:'Review action mail'},
    {title:'Life Categories',description:'Important · Orders · Appointments · Work · School · Receipts · Travel · Subscriptions',href:'/gmail',action:'Review categories'},
    {title:'Turn Mail Into Action',description:'Create Task · Add Calendar Event · Remind Me',href:'/tasks',action:'Create work'},
    {title:'Connected Context',description:'Attach relevant messages to projects and future commitments.',href:'/projects',action:'Open projects'}]},
  world: { label:'My Digital World', subtitle:'A spatial alternate interface for the same connected Glow OS.', modules:[
    {title:'Rooms',description:'Home · Beauty Studio · Fitness Room · Mind · Finance · Learning · Travel · Career · Creative Studio · Saint',href:'/world',action:'Explore rooms'},
    {title:'Status as Space',description:'Rooms can visually communicate what needs attention instead of existing only for aesthetics.',href:'/world',action:'Explore status'},
    {title:'Objects as Data',description:'Closet, shelves, desks, boards, maps and memories can become functional objects.',href:'/world',action:'Enter world'},
    {title:'Central Brain',description:'Ask Glow from any room without choosing a separate specialist first.',href:'/brain',action:'Ask Glow'}]},
  home: { label:'Home Operating System', subtitle:'Run cleaning, supplies, maintenance and organization without mental clutter.', modules:[
    {title:'Home Reset',description:'Kitchen · Bathroom · Bedroom · Laundry · Trash · Restock · Organize',href:'/home',action:'Start reset'},
    {title:'Home Systems',description:'Cleaning · Laundry · Groceries · Maintenance · Organization · Inventory · Shopping · Decor · Documents',href:'/home',action:'Open home systems'},
    {title:'Running Low',description:'Track supplies before they become urgent.',href:'/home',action:'Review inventory'},
    {title:'Home + Time',description:'Fit maintenance into your real task and calendar capacity.',href:'/planning',action:'Schedule reset'}]},
  connections: { label:'Glow OS Data Hub', subtitle:'See what is connected, what it contributes and what Glow can access.', modules:[
    {title:'Connection Status',description:'Connected / disconnected · last sync · imported information · permissions',href:'/connections',action:'Manage connections'},
    {title:'Data Flow',description:'Calendar → Glow → Daily Plan · Reminders → Tasks · Email → Actions',href:'/connections',action:'Understand flow'},
    {title:'Privacy Controls',description:'Review permission scope and disconnect supported services intentionally.',href:'/settings',action:'Review privacy'},
    {title:'Bring Data In',description:'Use Import for structured data and Notes for references.',href:'/import',action:'Open import'}]},
  notes: { label:'Personal Knowledge Space', subtitle:'A beautiful notebook connected to projects, memory and action.', modules:[
    {title:'Note Types',description:'Quick Note · Journal · Idea · Research · List · Meeting · Project Note · Reflection',href:'/notes',action:'Write note'},
    {title:'Knowledge Tools',description:'Photos · Links · Tags · Folders · Search · Favorites · Related notes',href:'/notes',action:'Browse notes'},
    {title:'Smart Connections',description:'Project mentioned? Connect it. Action found? Create task. Date found? Add to calendar.',href:'/projects',action:'Connect knowledge'},
    {title:'Memory',description:'Promote meaningful decisions or preferences into durable memory.',href:'/memory',action:'Open memory'}]},
  import: { label:'Bring My Life Into Glow', subtitle:'A safe onboarding and migration center for existing information.', modules:[
    {title:'Import Categories',description:'Tasks · Calendar · Notes · Finances · Beauty inventory · Closet · Projects · Photos · Documents',href:'/import',action:'Choose source'},
    {title:'Review Before Import',description:'Choose Source → Preview → Glow organizes → Review → Import',href:'/import',action:'Start import'},
    {title:'Import History',description:'Date · items · errors · status · undo',href:'/import',action:'View history'},
    {title:'Connected Sources',description:'Use Connections for ongoing sync rather than one-time migration.',href:'/connections',action:'Manage connections'}]},
  settings: { label:'Glow Control Center', subtitle:'Control appearance, personalization, intelligence, notifications and privacy.', modules:[
    {title:'Appearance',description:'Theme · interface density · animations · dashboard layout · widget size',href:'/settings',action:'Customize appearance'},
    {title:'Personalization',description:'Daily theme · week structure · life categories · priorities',href:'/settings',action:'Edit preferences'},
    {title:'Intelligence',description:'Recommendation level · memory · observations · briefings',href:'/settings',action:'Control AI'},
    {title:'Privacy + Data',description:'Connected services · permissions · memory controls · export · delete',href:'/connections',action:'Review data'}]},
};
