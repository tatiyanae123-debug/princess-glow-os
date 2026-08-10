'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Flower2, Sparkles } from 'lucide-react';

const rooms = [
  { match:'/beauty/lab', label:'Beauty Lab', kicker:'Product Intelligence', description:'Ingredients, reactions, inventory, expiration and repurchase decisions live here.', signature:'the laboratory', links:[['Beauty OS','/beauty'],['Hair Studio','/hair'],['Wellness','/wellness']] },
  { match:'/finance/brain', label:'Financial Brain', kicker:'Private Money Intelligence', description:'Turn transactions and goals into calm forecasts, choices and next moves.', signature:'the financial atelier', links:[['Finance Journal','/finance'],['Goals','/goals'],['Projects','/projects']] },
  { match:'/tasks', label:'Tasks & Planner', kicker:'Execution Desk', description:'See the next meaningful action, protect focus and move work without overwhelm.', signature:'the execution desk', links:[['Calendar','/calendar'],['Planning','/planning'],['Glow Brain','/brain']] },
  { match:'/calendar', label:'Calendar', kicker:'Editorial Planner', description:'Appointments, commitments and spacious time blocks arranged around the life you want.', signature:'the planning wall', links:[['Tasks','/tasks'],['Planning','/planning'],['Briefings','/briefings']] },
  { match:'/planning', label:'Planning', kicker:'Life Architecture', description:'Connect today, week, quarter and year so the important things have a place to happen.', signature:'the planning journal', links:[['Goals','/goals'],['Calendar','/calendar'],['Projects','/projects']] },
  { match:'/habits', label:'Habits', kicker:'Ritual Journal', description:'Track consistency as a gentle rhythm rather than a punishment scoreboard.', signature:'the ritual journal', links:[['Wellness','/wellness'],['Fitness','/fitness'],['Beauty','/beauty']] },
  { match:'/fitness', label:'Fitness', kicker:'Wellness Studio', description:'Training, energy, soreness and recovery become one intelligent movement practice.', signature:'the training studio', links:[['Wellness','/wellness'],['Habits','/habits'],['Calendar','/calendar']] },
  { match:'/beauty', label:'Beauty OS', kicker:'Luxury Vanity', description:'Routines, maintenance and today’s beauty decisions arranged like a private beauty journal.', signature:'the vanity', links:[['Beauty Lab','/beauty/lab'],['Hair','/hair'],['Wellness','/wellness']] },
  { match:'/hair', label:'Hair Studio', kicker:'Maintenance Rituals', description:'Wash days, products, styling history and next actions in one calm maintenance space.', signature:'the hair studio', links:[['Beauty','/beauty'],['Beauty Lab','/beauty/lab'],['Calendar','/calendar']] },
  { match:'/wellness', label:'Wellness', kicker:'Body & Energy', description:'Hydration, medication, supplements, recovery and daily care stay visible without feeling clinical.', signature:'the wellness shelf', links:[['Fitness','/fitness'],['Habits','/habits'],['Beauty','/beauty']] },
  { match:'/finance', label:'Finance', kicker:'Financial Journal', description:'Spending, saving and planning presented as a calm private money journal.', signature:'the money journal', links:[['Financial Brain','/finance/brain'],['Goals','/goals'],['Projects','/projects']] },
  { match:'/goals', label:'Goals', kicker:'Future Self', description:'Ambitions become visible journeys connected to the projects and actions that move them forward.', signature:'the future wall', links:[['Projects','/projects'],['Planning','/planning'],['Finance','/finance']] },
  { match:'/projects', label:'Projects', kicker:'Creative Studio', description:'Project desks, milestones, files, decisions and next actions for everything you are building.', signature:'the studio', links:[['Goals','/goals'],['Brain','/brain'],['Memory','/memory']] },
  { match:'/brain', label:'Glow Brain', kicker:'Central Intelligence', description:'Ask one question and let Glow pull context across every room instead of making you search.', signature:'the concierge desk', links:[['Concierge','/concierge'],['Observations','/observations'],['Briefings','/briefings']] },
  { match:'/concierge', label:'Concierge', kicker:'Approved Actions', description:'Glow proposes useful changes here so intelligence can become action without losing your control.', signature:'the service desk', links:[['Brain','/brain'],['Observations','/observations'],['Planning','/planning']] },
  { match:'/observations', label:'Glow Notices', kicker:'Pattern Studio', description:'Evidence-based patterns, gentle warnings and useful suggestions from across your life.', signature:'the observation room', links:[['Brain','/brain'],['Concierge','/concierge'],['Briefings','/briefings']] },
  { match:'/memory', label:'Memory', kicker:'Private Archive', description:'Important facts, moments and context become a searchable archive that grows with your life.', signature:'the archive', links:[['Timeline','/timeline'],['Notes','/notes'],['Projects','/projects']] },
  { match:'/timeline', label:'Timeline', kicker:'Life Gallery', description:'See your life as a story of events, milestones, projects, routines and memories.', signature:'the gallery', links:[['Memory','/memory'],['Briefings','/briefings'],['World','/world']] },
  { match:'/briefings', label:'Briefings', kicker:'Daily Editorial', description:'Morning, evening and weekly intelligence distilled into a page you can actually use.', signature:'the morning paper', links:[['Brain','/brain'],['Planning','/planning'],['Timeline','/timeline']] },
  { match:'/closet', label:'Closet', kicker:'Digital Wardrobe', description:'Clothes, wear count, laundry state and favorites arranged like a private styling room.', signature:'the wardrobe', links:[['Beauty','/beauty'],['Calendar','/calendar'],['World','/world']] },
  { match:'/gmail', label:'Gmail Intelligence', kicker:'Correspondence Desk', description:'See the messages that matter without letting the inbox take over the day.', signature:'the correspondence desk', links:[['Tasks','/tasks'],['Calendar','/calendar'],['Connections','/connections']] },
  { match:'/world', label:'Life World', kicker:'My Universe', description:'Enter the connected rooms of your life and move between systems like places rather than pages.', signature:'the universe', links:[['Home','/home'],['Projects','/projects'],['Memory','/memory']] },
  { match:'/home', label:'Home', kicker:'Living Space', description:'Cleaning, resets, supplies and care for your physical world in one gentle home system.', signature:'the home room', links:[['Habits','/habits'],['Planning','/planning'],['World','/world']] },
  { match:'/notes', label:'Notes & Brain Dump', kicker:'Paper Desk', description:'Loose thoughts, references and ideas can stay messy here while still being searchable and useful.', signature:'the paper desk', links:[['Memory','/memory'],['Projects','/projects'],['Tasks','/tasks']] },
  { match:'/connections', label:'Connections', kicker:'Digital Dock', description:'Calendar, Gmail, reminders and external services meet Glow OS here.', signature:'the connection dock', links:[['Calendar','/calendar'],['Gmail','/gmail'],['Import','/import']] },
  { match:'/import', label:'Import', kicker:'Bring It Into Glow', description:'Move outside information into the system without rebuilding it by hand.', signature:'the intake desk', links:[['Connections','/connections'],['Notes','/notes'],['Tasks','/tasks']] },
  { match:'/settings', label:'Settings', kicker:'Edit My World', description:'Tune the environment, visual system and behavior of Glow OS without touching the underlying architecture.', signature:'the dressing room', links:[['Dashboard','/dashboard'],['World','/world'],['Connections','/connections']] },
];

export function EditorialRoomBanner() {
  const pathname = usePathname();
  if (pathname === '/dashboard' || pathname === '/') return null;
  const room = rooms.find((candidate) => pathname === candidate.match || pathname.startsWith(candidate.match + '/'));
  if (!room) return null;

  return <section className="mb-4 overflow-hidden rounded-[12px] border border-[var(--glow-border)] bg-[linear-gradient(110deg,rgba(255,252,249,.72),var(--room-wash,rgba(232,213,205,.42)))] shadow-[0_8px_25px_rgba(75,53,45,.04)]">
    <div className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center">
      <div className="relative min-w-0">
        <Flower2 size={52} strokeWidth={.7} className="absolute -left-1 -top-3 text-[var(--room-accent,#a77b75)] opacity-[.12]" />
        <div className="relative pl-1">
          <div className="flex items-center gap-2"><Sparkles size={10} className="text-[var(--room-accent,#a77b75)]"/><p className="text-[7px] font-semibold uppercase tracking-[.17em] text-[var(--room-accent,#8d716b)]">{room.kicker}</p></div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3"><h2 className="glow-display text-[22px] leading-none text-[var(--glow-text)]">{room.label}</h2><span className="glow-hand text-[22px] text-[var(--room-accent,#9a7471)]">{room.signature}</span></div>
          <p className="mt-2 max-w-3xl text-[9px] leading-4 text-[var(--glow-text-muted)]">{room.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">{room.links.map(([label,href])=><Link key={href} href={href} className="inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/45 px-2.5 py-1.5 text-[8px] text-[#6e5c55] hover:bg-white/75">{label}<ArrowUpRight size={8}/></Link>)}</div>
    </div>
  </section>;
}
