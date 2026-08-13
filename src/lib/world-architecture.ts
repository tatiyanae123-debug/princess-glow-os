export type WorldKey = 'today' | 'life' | 'mind' | 'wellness' | 'beauty' | 'money' | 'work' | 'home';

export type WorldArchitecture = {
  world: WorldKey;
  title: string;
  eyebrow: string;
  statement: string;
  insight: string;
  actionLabel: string;
  actionHref: string;
  context: Array<{ label: string; href: string }>;
};

const worlds: Record<WorldKey, Omit<WorldArchitecture, 'title' | 'eyebrow'>> = {
  today: { world:'today', statement:'One calm foyer for what is happening now, what comes next and what can wait.', insight:'Glow keeps the first view intentionally small: your next move, your day shape and the life areas asking for attention.', actionLabel:'Plan My Day', actionHref:'/planning', context:[{label:'Calendar',href:'/calendar'},{label:'Tasks',href:'/tasks'},{label:'Morning Brief',href:'/briefings'}] },
  life: { world:'life', statement:'Move through time, plans, tasks and reminders as one connected life system.', insight:'Glow keeps time, actions and context connected so each page feels like another layer of the same world.', actionLabel:'Open Today', actionHref:'/today', context:[{label:'Calendar',href:'/calendar'},{label:'Timeline',href:'/timeline'},{label:'Goals',href:'/goals'}] },
  mind: { world:'mind', statement:'A quiet intelligence layer for context, memory, observations, decisions and relationships.', insight:'Glow can surface evidence and connections without turning every insight into an alert.', actionLabel:'Open Brain', actionHref:'/brain', context:[{label:'Memory',href:'/memory'},{label:'Observations',href:'/observations'},{label:'Graph',href:'/graph'}] },
  wellness: { world:'wellness', statement:'A softer room for energy, movement, food, recovery and daily care.', insight:'Glow keeps wellness useful, calm and contextual rather than clinical or crowded.', actionLabel:'Open Wellness', actionHref:'/wellness', context:[{label:'Fitness',href:'/fitness'},{label:'Food',href:'/food'},{label:'Medications',href:'/maintenance'}] },
  beauty: { world:'beauty', statement:'A luxury dressing room and laboratory for routines, products, hair and progress.', insight:'Glow keeps today’s routine in front while ingredients, reactions and history stay one layer deeper.', actionLabel:'Open Beauty', actionHref:'/beauty', context:[{label:'Beauty Lab',href:'/beauty/lab'},{label:'Hair',href:'/hair'},{label:'Wellness',href:'/wellness'}] },
  money: { world:'money', statement:'A calm financial library for current position, goals, spending and forward-looking choices.', insight:'Glow connects money decisions to the life plans and goals they affect.', actionLabel:'Open Financial Brain', actionHref:'/finance/brain', context:[{label:'Finance',href:'/finance'},{label:'Goals',href:'/goals'},{label:'Projects',href:'/projects'}] },
  work: { world:'work', statement:'A career gallery and creative studio for opportunities, projects, communication and making.', insight:'Glow keeps people, follow-ups, projects and next actions connected across your work.', actionLabel:'Open Work', actionHref:'/work', context:[{label:'Creative Studio',href:'/creative-studio'},{label:'Gmail',href:'/gmail'},{label:'Concierge',href:'/concierge'}] },
  home: { world:'home', statement:'A digital home where rooms, possessions, routines and responsibilities live where they belong.', insight:'Glow makes household context spatial and easy to return to.', actionLabel:'Open All Rooms', actionHref:'/all-rooms', context:[{label:'Home',href:'/home'},{label:'Life World',href:'/world'},{label:'Reminders',href:'/reminders'}] },
};

function routeTitle(pathname: string): { world: WorldKey; title: string; eyebrow: string } {
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/today')) return {world:'today',title:'Today',eyebrow:'YOUR LIFE / NOW'};
  if (pathname.startsWith('/briefings/evening')) return {world:'mind',title:'Evening Debrief',eyebrow:'MIND / CLOSE THE DAY'};
  if (pathname.startsWith('/briefings/weekly')) return {world:'mind',title:'Weekly Debrief',eyebrow:'MIND / WEEK IN REVIEW'};
  if (pathname.startsWith('/briefings/monthly')) return {world:'mind',title:'Monthly Debrief',eyebrow:'MIND / MONTH IN REVIEW'};
  if (pathname.startsWith('/briefings')) return {world:'mind',title:'Morning Brief',eyebrow:'MIND / MORNING'};
  if (pathname.startsWith('/brain')) return {world:'mind',title:'Brain',eyebrow:'MIND / INTELLIGENCE'};
  if (pathname.startsWith('/memory')) return {world:'mind',title:'Memory',eyebrow:'MIND / ARCHIVE'};
  if (pathname.startsWith('/observations')) return {world:'mind',title:'Observations',eyebrow:'MIND / QUIET SIGNALS'};
  if (pathname.startsWith('/graph')) return {world:'mind',title:'Graph',eyebrow:'MIND / RELATIONSHIPS'};
  if (pathname.startsWith('/timeline')) return {world:'life',title:'Timeline',eyebrow:'LIFE / THROUGH TIME'};
  if (pathname.startsWith('/calendar')) return {world:'life',title:'Calendar',eyebrow:'LIFE / TIME'};
  if (pathname.startsWith('/tasks')) return {world:'life',title:'Tasks',eyebrow:'LIFE / WORKBENCH'};
  if (pathname.startsWith('/planning')) return {world:'life',title:'Planning',eyebrow:'LIFE / PLAN'};
  if (pathname.startsWith('/reminders')) return {world:'life',title:'Reminders',eyebrow:'LIFE / CONTEXT'};
  if (pathname.startsWith('/goals')) return {world:'life',title:'Goals',eyebrow:'LIFE / JOURNEYS'};
  if (pathname.startsWith('/wellness')) return {world:'wellness',title:'Wellness',eyebrow:'WELLNESS / QUIET ROOM'};
  if (pathname.startsWith('/fitness')) return {world:'wellness',title:'Fitness',eyebrow:'WELLNESS / MOVEMENT'};
  if (pathname.startsWith('/food')) return {world:'wellness',title:'Food & Nutrition',eyebrow:'WELLNESS / KITCHEN'};
  if (pathname.startsWith('/maintenance')) return {world:'wellness',title:'Medications & Supplements',eyebrow:'WELLNESS / CARE RHYTHM'};
  if (pathname.startsWith('/beauty/lab')) return {world:'beauty',title:'Beauty Lab',eyebrow:'BEAUTY / LAB'};
  if (pathname.startsWith('/beauty')) return {world:'beauty',title:'Beauty',eyebrow:'BEAUTY / DRESSING ROOM'};
  if (pathname.startsWith('/hair')) return {world:'beauty',title:'Hair',eyebrow:'BEAUTY / HAIR STUDIO'};
  if (pathname.startsWith('/finance/brain')) return {world:'money',title:'Financial Brain',eyebrow:'MONEY / FORECAST'};
  if (pathname.startsWith('/finance')) return {world:'money',title:'Finance',eyebrow:'MONEY / CURRENT POSITION'};
  if (pathname.startsWith('/creative-studio') || pathname.startsWith('/projects')) return {world:'work',title:'Creative Studio',eyebrow:'WORK + CREATE / STUDIO'};
  if (pathname.startsWith('/work')) return {world:'work',title:'Work',eyebrow:'WORK + CREATE / CAREER'};
  if (pathname.startsWith('/concierge')) return {world:'work',title:'Concierge',eyebrow:'WORK + CREATE / PRIVATE DESK'};
  if (pathname.startsWith('/gmail') || pathname.startsWith('/inbox')) return {world:'work',title:pathname.startsWith('/gmail')?'Gmail':'Inbox',eyebrow:'WORK + CREATE / COMMUNICATION'};
  if (pathname.startsWith('/connections')) return {world:'life',title:'Connections',eyebrow:'LIFE / SYSTEM MAP'};
  if (pathname.startsWith('/import') || pathname.startsWith('/intake')) return {world:'life',title:'Add Anything',eyebrow:'LIFE / INTAKE'};
  if (pathname.startsWith('/home')) return {world:'home',title:'Home',eyebrow:'HOME / DIGITAL HOUSE'};
  if (pathname.startsWith('/all-rooms')) return {world:'home',title:'All Rooms',eyebrow:'HOME / ARCHITECTURE'};
  if (pathname.startsWith('/world') || pathname.startsWith('/life-world')) return {world:'home',title:'Glow World',eyebrow:'LIFE WORLD / ARCHITECTURE'};
  if (pathname.startsWith('/notices')) return {world:'mind',title:'Notices',eyebrow:'MIND / ATTENTION'};
  if (pathname.startsWith('/notes') || pathname.startsWith('/resources')) return {world:'life',title:pathname.startsWith('/notes')?'Notes':'Resources',eyebrow:'LIFE / LIBRARY'};
  return {world:'life',title:'Glow OS',eyebrow:'PERSONAL DIGITAL WORLD'};
}

export function getWorldArchitecture(pathname: string): WorldArchitecture {
  const route = routeTitle(pathname);
  return { ...worlds[route.world], title: route.title, eyebrow: route.eyebrow };
}
