export type GlowPageBlueprint = {
  key: string;
  title: string;
  purpose: string;
  question: string;
  rightNow: string;
  overview: string;
  explore: string;
};

const PAGES: GlowPageBlueprint[] = [
  { key:'/dashboard', title:'Dashboard', purpose:'Your command center for today.', question:'What should I do now?', rightNow:'Priority, next event, routine and alerts', overview:'Today timeline, Top 3 and life status', explore:'Briefings, history and deeper analytics' },
  { key:'/second-brain', title:'Second Brain', purpose:'Think, organize, prioritize and execute.', question:'What am I thinking about?', rightNow:'Focus, energy and Top 3', overview:'Body / Mind / Soul, notes and follow-ups', explore:'Brain dump patterns and intelligent rollover' },
  { key:'/tasks', title:'Tasks', purpose:'Everything that requires action.', question:'What requires action?', rightNow:'Do first and overdue work', overview:'Today, upcoming, waiting and projects', explore:'Someday, dependencies and completion patterns' },
  { key:'/reminders', title:'Reminders', purpose:'Make sure important things actually happen.', question:'What must I remember?', rightNow:'Due and high-priority reminders', overview:'Recurring, grouped and upcoming reminders', explore:'History, conversions and reminder patterns' },
  { key:'/calendar', title:'Calendar', purpose:'Your actual life in time.', question:'Where does my time go?', rightNow:'Current block and what is next', overview:'Day, week and routines overlay', explore:'Month, ideal vs actual and rescheduling' },
  { key:'/planning', title:'Planning', purpose:'Decide before doing.', question:'What am I choosing to make happen?', rightNow:'Today and weekly Top 3 drivers', overview:'Week, month and capacity', explore:'Quarterly direction and review patterns' },
  { key:'/routines', title:'Routines', purpose:'Repeatable sequences that make life easier.', question:'What sequence should I follow?', rightNow:'Current routine and current step', overview:'Morning, midday, evening and reset', explore:'History, templates and adaptive versions' },
  { key:'/habits', title:'Habits', purpose:'Build consistency without unnecessary pressure.', question:'Am I being consistent?', rightNow:'Today habits', overview:'Weekly consistency and streak health', explore:'Heat map, goal links and behavior insights' },
  { key:'/fitness', title:'Fitness', purpose:'Your complete training operating center.', question:'How am I training?', rightNow:'Today workout and readiness', overview:'Program, exercises and progress', explore:'Measurements, strength trends and history' },
  { key:'/wellness', title:'Wellness', purpose:'Understand how you are actually feeling.', question:'How am I feeling?', rightNow:'Energy, mood, sleep and hydration', overview:'Stress, observations and weekly trends', explore:'Longer-term correlations and patterns' },
  { key:'/food', title:'Food', purpose:'Recipe to meal plan to grocery list to eating.', question:'What am I eating?', rightNow:'Today meals and prep', overview:'Meal plan, groceries and pantry', explore:'Recipes, favorites and nutrition patterns' },
  { key:'/beauty/lab', title:'Beauty Lab', purpose:'Run beauty experiments and learn what works.', question:'What is actually working?', rightNow:'Active experiments', overview:'Products, ingredients and results', explore:'Before/after history and graduated routines' },
  { key:'/beauty', title:'Beauty', purpose:'Your daily beauty dashboard.', question:'What does my routine require?', rightNow:'AM, PM or Tonight mode', overview:'Weekly schedule, products and appointments', explore:'Usage, progress photography and history' },
  { key:'/hair', title:'Hair', purpose:'Manage hair care, styles and maintenance.', question:'What does my hair need?', rightNow:'Today routine and next maintenance', overview:'Wash, treatment and protective-style calendar', explore:'Products, progress, goals and history' },
  { key:'/closet', title:'Closet', purpose:'A digital wardrobe and styling assistant.', question:'What should I wear?', rightNow:'Today outfit and weather context', overview:'Wardrobe, favorites and outfit calendar', explore:'Wear analytics, packing and occasion history' },
  { key:'/finance/brain', title:'Financial Brain', purpose:'Understand what your money is doing.', question:'What is changing financially?', rightNow:'Cash-flow change and immediate risks', overview:'Net worth, goals and subscriptions', explore:'Scenarios, forecasts and spending patterns' },
  { key:'/finance', title:'Finance', purpose:'Daily money management without chart overload.', question:'How am I doing financially?', rightNow:'Safe to spend, bills and current spending', overview:'Budget, savings and subscriptions', explore:'Categories, history and deeper analysis' },
  { key:'/goals', title:'Goals', purpose:'Turn desired outcomes into visible progress.', question:'Where am I going?', rightNow:'Goals needing movement this week', overview:'Milestones, deadlines and progress', explore:'Goal health and calendar alignment' },
  { key:'/projects', title:'Projects', purpose:'Manage multi-step outcomes.', question:'What am I building?', rightNow:'Next action and project health', overview:'Milestones, tasks and timeline', explore:'Resources, history and stalled work' },
  { key:'/brain', title:'Brain', purpose:'The central intelligence of Glow OS.', question:'What does Glow know?', rightNow:'Ask, capture or change anything', overview:'Search connected life context', explore:'Patterns, relationships and system knowledge' },
  { key:'/concierge', title:'Concierge', purpose:'Turn complexity into one clear next move.', question:'What can Glow handle for me?', rightNow:'One recommended next action', overview:'Prepare, organize and simplify', explore:'Saved plans and previous assistance' },
  { key:'/observations', title:'Observations', purpose:'Capture patterns without creating unnecessary tasks.', question:'What am I noticing?', rightNow:'Quick observation capture', overview:'Themes across life areas', explore:'Clusters and promotion into Memory' },
  { key:'/memory', title:'Memory', purpose:'Keep important life context under your control.', question:'What should I remember?', rightNow:'Recently relevant memories', overview:'People, preferences, places and decisions', explore:'Review, edit and delete memory history' },
  { key:'/timeline', title:'Timeline', purpose:'See your life chronologically.', question:'What has happened over time?', rightNow:'Recent life events', overview:'Month and year story', explore:'Achievements, transformations and archives' },
  { key:'/briefings', title:'Briefings', purpose:'Tell you what matters without making you search.', question:'What needs my attention?', rightNow:'Current briefing', overview:'Calendar, tasks, reminders and goals', explore:'Morning, evening and weekly history' },
  { key:'/gmail', title:'Gmail', purpose:'Use email without living in email.', question:'Who or what needs a response?', rightNow:'Priority inbox and waiting replies', overview:'Career, appointments, orders and receipts', explore:'Thread summaries and converted actions' },
  { key:'/vault', title:'Vault', purpose:'A secure access center for important services.', question:'Where do I need to securely go?', rightNow:'Pinned secure destinations', overview:'Work, medical, banking and services', explore:'Searchable access categories' },
  { key:'/world', title:'World', purpose:'Represent your life spatially without slowing productivity.', question:'Where am I in my life world?', rightNow:'Active destinations', overview:'Goals, projects and current rooms', explore:'Memories, progress and world history' },
  { key:'/home', title:'Home', purpose:'Manage your physical environment.', question:'What does my space need?', rightNow:'Today reset and urgent home tasks', overview:'Rooms, laundry, cleaning and shopping', explore:'Maintenance, projects and wishlist' },
  { key:'/connections', title:'Connections', purpose:'A calm personal relationship manager.', question:'Who should I stay connected with?', rightNow:'Follow-ups and important dates', overview:'People, notes and recent interactions', explore:'Relationship history and gentle reconnects' },
  { key:'/notes', title:'Notes', purpose:'Store information quickly and make it reusable.', question:'What have I written down?', rightNow:'Recent and pinned notes', overview:'Tags, files and linked notes', explore:'Backlinks, summaries and related knowledge' },
  { key:'/import', title:'Import', purpose:'Bring existing information into Glow without manual re-entry.', question:'What do I want Glow to organize?', rightNow:'Current import and extraction preview', overview:'Documents, screenshots, sheets and schedules', explore:'Import history and routing decisions' },
  { key:'/spotify', title:'Spotify', purpose:'Put the right music behind the right mode.', question:'What should be playing?', rightNow:'Now playing and current mode', overview:'Morning, workout, focus, beauty and reset', explore:'Favorite playlists and listening shortcuts' },
  { key:'/settings', title:'Settings', purpose:'Control Glow OS behavior, appearance and connections.', question:'How should Glow work for me?', rightNow:'System health and connection status', overview:'Appearance, notifications, AI and privacy', explore:'Accessibility, backup and export' },
  { key:'/search', title:'Universal Search', purpose:'Find anything across Glow using natural language.', question:'What am I trying to find?', rightNow:'Search across your life', overview:'People, notes, tasks, appointments and files', explore:'Recent searches and related context' },
  { key:'/intake', title:'Universal Capture', purpose:'Enter information once and let Glow route it.', question:'What do I need to get out of my head?', rightNow:'Speak, type, upload or paste', overview:'Preview where Glow will put everything', explore:'Capture history and routing corrections' },
];

export function blueprintForPath(pathname: string): GlowPageBlueprint | null {
  const sorted = [...PAGES].sort((a,b)=>b.key.length-a.key.length);
  return sorted.find((page)=>pathname===page.key || pathname.startsWith(`${page.key}/`)) ?? null;
}
