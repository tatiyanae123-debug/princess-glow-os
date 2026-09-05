'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  CookingPot,
  CreditCard,
  Droplets,
  Dumbbell,
  Gift,
  Heart,
  HeartPulse,
  Home,
  House,
  Leaf,
  ListChecks,
  Luggage,
  Map,
  MessageCircleMore,
  Moon,
  NotebookText,
  PackageCheck,
  Palette,
  Pill,
  Plane,
  ReceiptText,
  Search,
  Shirt,
  ShoppingBag,
  Sparkles,
  Target,
  Users,
  Utensils,
  WalletCards,
  WashingMachine,
} from 'lucide-react';
import styles from './life-reference-room.module.css';

export type ReferenceLifeRoomId =
  | 'body'
  | 'beauty'
  | 'closet'
  | 'food'
  | 'home'
  | 'money'
  | 'work'
  | 'relationships'
  | 'travel';

type RoomCard = {
  title: string;
  subtitle: string;
  bullets: string[];
  href: string;
  icon: LucideIcon;
  cta?: string;
};

type RoomConfig = {
  title: string;
  subtitle: string;
  question: string;
  tabs: string[];
  heroTitle: string;
  heroCaption: string;
  railTitle: string;
  railNote: string;
  railLabels: string[];
  cards: RoomCard[];
};

const ROOM_CONFIG: Record<ReferenceLifeRoomId, RoomConfig> = {
  body: {
    title: 'BODY',
    subtitle: 'Listen. Adjust. Be kind.',
    question: 'How is my body today, and what does it need?',
    tabs: ['Body', 'Mind', 'Energy', 'Recovery'],
    heroTitle: 'You are in context.',
    heroCaption: 'Sleep, energy, movement, nourishment, symptoms, medication, and recovery stay connected around you.',
    railTitle: 'Body context',
    railNote: 'Glow does not invent a body score. Signals appear only when they are actually connected.',
    railLabels: ['Sleep', 'Energy', 'Hydration', 'Movement', 'Recovery'],
    cards: [
      { title: 'Sleep', subtitle: 'Rest · Recovery', bullets: ['Last night', 'Restorative sleep', 'Sleep rhythm'], href: '/wellness?view=sleep', icon: Moon },
      { title: 'Cycle & Hormones', subtitle: 'Patterns across time', bullets: ['Cycle context', 'Energy changes', 'Body patterns'], href: '/wellness?view=cycle', icon: Activity },
      { title: 'Energy', subtitle: 'Capacity today', bullets: ['Energy check-in', 'Fatigue context', 'Daily capacity'], href: '/wellness', icon: BatteryCharging },
      { title: 'Symptoms', subtitle: 'Notice what changed', bullets: ['Current symptoms', 'Patterns', 'What changed'], href: '/wellness?view=symptoms', icon: HeartPulse },
      { title: 'Movement', subtitle: 'Strength · Mobility · Cardio', bullets: ['Training', 'Walking', 'Mobility'], href: '/fitness', icon: Dumbbell },
      { title: 'Medication', subtitle: 'Your real medication context', bullets: ['Reminders', 'Schedule', 'Notes'], href: '/wellness?view=medication', icon: Pill },
      { title: 'Nutrition & Hydration', subtitle: 'Fuel · Water · Nourishment', bullets: ['Hydration', 'Meals', 'Protein & nourishment'], href: '/food?view=nutrition', icon: Droplets },
      { title: 'Care & Recovery', subtitle: 'Stretch · Breathe · Rest', bullets: ['Recovery', 'Body care', 'Restorative actions'], href: '/wellness?view=recovery', icon: Sparkles },
    ],
  },
  beauty: {
    title: 'BEAUTY',
    subtitle: 'Look good. Feel good. Be you.',
    question: 'What helps me feel ready for the life I am actually living today?',
    tabs: ['Today', 'Skin', 'Hair', 'Makeup', 'Body', 'Fragrance'],
    heroTitle: 'Your best self today.',
    heroCaption: 'Prep with intention. Step into your day.',
    railTitle: 'Beauty context',
    railNote: 'No sample beauty score is shown. Glow uses your routines, products, timing, and real plans.',
    railLabels: ['Skin', 'Hair', 'Makeup', 'Body', 'Fragrance'],
    cards: [
      { title: 'Skin', subtitle: 'Clear · Balanced', bullets: ['Cleanse', 'Treat', 'Moisturize', 'SPF'], href: '/beauty?studio=skincare', icon: Sparkles },
      { title: 'Body', subtitle: 'Smooth · cared for', bullets: ['Shower', 'Body care', 'Deodorant', 'Finish'], href: '/routines?context=beauty', icon: Heart },
      { title: 'Hair', subtitle: 'Healthy · Styled', bullets: ['Wash / dry', 'Style', 'Treat', 'Finish'], href: '/hair', icon: Sparkles },
      { title: 'Fragrance', subtitle: 'Fresh · Warm', bullets: ['Scent mood', 'Layering', 'Occasion', 'Finish'], href: '/beauty', icon: Sparkles },
      { title: 'Makeup', subtitle: 'Natural · Polished', bullets: ['Base', 'Eyes', 'Lips', 'Lasting power'], href: '/beauty?studio=makeup', icon: Palette },
      { title: 'Final Look', subtitle: 'Bring it all together', bullets: ['Skin care', 'Hair', 'Makeup', 'Outfit'], href: '/closet?view=outfits', icon: CheckCircle2 },
    ],
  },
  closet: {
    title: 'CLOSET',
    subtitle: 'Wear your life, intentionally.',
    question: 'What should I wear and what is available to me right now?',
    tabs: ['Wardrobe', 'Outfits', 'Occasions', 'Favorites', 'History'],
    heroTitle: 'Your wardrobe, physically organized.',
    heroCaption: 'Clothes, care, occasions, fit, and repeatable looks live in one place.',
    railTitle: 'Outfit context',
    railNote: 'Recommendations come from your wardrobe, plans, preferences, weather, comfort, and actual wear history.',
    railLabels: ['Weather', 'Occasion', 'Your style', 'Color harmony'],
    cards: [
      { title: 'Right now', subtitle: 'Weather · plans · comfort', bullets: ['Current conditions', 'Today’s schedule', 'Layering needs'], href: '/calendar', icon: CalendarDays },
      { title: 'Wardrobe', subtitle: 'What you own', bullets: ['Tops & bottoms', 'Dresses & outerwear', 'Shoes & accessories'], href: '/closet', icon: Shirt },
      { title: 'Occasions today', subtitle: 'Dress for real plans', bullets: ['Work', 'Appointments', 'Evening plans'], href: '/calendar', icon: BriefcaseBusiness },
      { title: 'Care & Laundry', subtitle: 'Keep pieces ready', bullets: ['Clean', 'In laundry', 'Needs care'], href: '/tasks?context=closet', icon: WashingMachine },
      { title: 'Today’s Pick', subtitle: 'A complete look', bullets: ['Pieces that work together', 'Fit notes', 'Alternatives'], href: '/closet?view=outfits', icon: Sparkles },
      { title: 'Recent Outfits', subtitle: 'What you actually wore', bullets: ['Repeat winners', 'Recent combinations', 'What felt good'], href: '/closet?view=recent', icon: Heart },
    ],
  },
  food: {
    title: 'FOOD',
    subtitle: 'Good food, a calmer you.',
    question: 'What should I eat, prepare, use, and shop for next?',
    tabs: ['Food', 'Meals', 'Recipes', 'Pantry', 'Groceries'],
    heroTitle: 'Good food, made useful.',
    heroCaption: 'Eat now, cook, prepare, use what you have, and save what you love.',
    railTitle: 'Pantry & fridge',
    railNote: 'Glow keeps food grounded in what you actually have, what you enjoy, and what you have planned.',
    railLabels: ['Fresh produce', 'Proteins', 'Grains', 'Snacks', 'Use soon'],
    cards: [
      { title: 'Eat Now', subtitle: 'Delicious · Ready · For you', bullets: ['Quick ideas', 'Use what you have', 'Match your day'], href: '/food', icon: Utensils },
      { title: 'Cook', subtitle: 'Step by step · Guided', bullets: ['Recipes', 'Ingredients', 'Cooking flow'], href: '/food?view=recipes', icon: CookingPot },
      { title: 'Prepare', subtitle: 'Chop · Mix · Get ahead', bullets: ['Meal prep', 'Batch basics', 'Future-you help'], href: '/routines?context=food', icon: ListChecks },
      { title: 'Today’s Meals', subtitle: 'Your day of food', bullets: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], href: '/food?view=meals', icon: CalendarDays },
      { title: 'Use Soon', subtitle: 'Reduce waste', bullets: ['Fresh items', 'Expiry timing', 'Ideas that use them'], href: '/food?view=groceries', icon: Leaf },
      { title: 'Saved Recipes', subtitle: 'Your collection', bullets: ['Favorites', 'Reliable meals', 'Ideas to try'], href: '/food?view=recipes', icon: NotebookText },
    ],
  },
  home: {
    title: 'HOME',
    subtitle: 'Your home, a calmer you.',
    question: 'What does my home need and where does everything belong?',
    tabs: ['Home', 'Rooms', 'Routines', 'Maintenance', 'Inventory', 'Design'],
    heroTitle: 'Home in harmony.',
    heroCaption: 'The floor plan is the center. Rooms, routines, maintenance, inventory, and projects orbit the actual space.',
    railTitle: 'Home context',
    railNote: 'Glow uses your real rooms, tasks, routines, inventory, and projects instead of turning Home into a generic task list.',
    railLabels: ['Rooms', 'Maintenance', 'Organization', 'Projects', 'Inventory'],
    cards: [
      { title: 'Routines', subtitle: 'Keep home running smoothly', bullets: ['Daily', 'Weekly', 'Monthly', 'Seasonal'], href: '/routines?context=home', icon: ListChecks },
      { title: 'Living Room', subtitle: 'Relax · Connect · Unwind', bullets: ['Reset', 'Next care', 'Room notes'], href: '/tasks?context=living-room', icon: House },
      { title: 'Maintenance', subtitle: 'Prevent issues, keep it beautiful', bullets: ['Filters', 'Appliances', 'HVAC', 'Surfaces'], href: '/maintenance', icon: PackageCheck },
      { title: 'Bedroom', subtitle: 'Rest · Reset', bullets: ['Clean', 'Laundry', 'Next care'], href: '/tasks?context=bedroom', icon: Home },
      { title: 'Inventory', subtitle: 'Know what you have', bullets: ['Household items', 'Low stock', 'Organization'], href: '/tasks?context=inventory', icon: ShoppingBag },
      { title: 'Kitchen & Dining', subtitle: 'Clean · Nourish · Gather', bullets: ['Kitchen reset', 'Meal prep', 'Restock'], href: '/tasks?context=kitchen', icon: CookingPot },
      { title: 'Laundry & Storage', subtitle: 'Clean · Organize · Keep', bullets: ['Laundry queue', 'Storage', 'Put away'], href: '/tasks?context=laundry', icon: WashingMachine },
      { title: 'Workspace & Outdoor', subtitle: 'Focus · Create · Fresh air', bullets: ['Desk reset', 'Plants', 'Seasonal care'], href: '/tasks?context=workspace', icon: Leaf },
    ],
  },
  money: {
    title: 'MONEY',
    subtitle: 'A calmer, clearer relationship with your money.',
    question: 'What is available, committed, upcoming, and building my future?',
    tabs: ['Money', 'Accounts', 'Spending', 'Saving', 'Plan'],
    heroTitle: 'More freedom creates a fuller you.',
    heroCaption: 'Money moves as a connected flow instead of a pile of disconnected finance cards.',
    railTitle: 'Financial context',
    railNote: 'Amounts appear only when real financial data is connected. Glow never fabricates balances, spending, or savings.',
    railLabels: ['Available', 'Committed', 'Upcoming', 'Saving', 'Cash flow'],
    cards: [
      { title: 'Available', subtitle: 'Ready to use', bullets: ['Checking', 'Savings', 'Cash / other'], href: '/finance', icon: WalletCards },
      { title: 'Committed', subtitle: 'Bills · subscriptions · obligations', bullets: ['Housing', 'Subscriptions', 'Insurance', 'Other'], href: '/finance?view=budget', icon: ReceiptText },
      { title: 'Upcoming', subtitle: 'Next 30 days', bullets: ['Bills', 'Payments', 'Due dates'], href: '/finance?view=bills', icon: CalendarDays },
      { title: 'Saving', subtitle: 'Build future freedom', bullets: ['Emergency buffer', 'Goals', 'Next contribution'], href: '/finance?view=saving', icon: CircleDollarSign },
      { title: 'Flexible Spending', subtitle: 'What can move', bullets: ['Spent so far', 'Budget remaining', 'Category mix'], href: '/finance?view=budget', icon: CreditCard },
      { title: 'Financial Attention', subtitle: 'What deserves a decision next', bullets: ['Subscriptions', 'Buffer', 'Next milestone'], href: '/finance/brain', icon: Target },
    ],
  },
  work: {
    title: 'WORK',
    subtitle: 'Meaningful work. A balanced you.',
    question: 'What professional work matters now and what supports it?',
    tabs: ['Today', 'This Week', 'Projects', 'Career', 'Ideas'],
    heroTitle: 'Today’s priorities.',
    heroCaption: 'The center of Work is what deserves your attention now. Projects, people, schedule, and career context support it.',
    railTitle: 'Work context',
    railNote: 'Glow reflects your real role, projects, calendar, tasks, applications, interviews, and career direction.',
    railLabels: ['Deep work', 'Progress', 'Collaboration', 'Learning', 'Impact'],
    cards: [
      { title: 'Role & Purpose', subtitle: 'What you are doing now', bullets: ['Current role', 'Responsibilities', 'Direction'], href: '/work', icon: BriefcaseBusiness },
      { title: 'Today', subtitle: 'The professional day ahead', bullets: ['Key priorities', 'Meetings', 'Focus blocks'], href: '/today?room=focus', icon: Target },
      { title: 'Work Energy', subtitle: 'How the work feels', bullets: ['Focus', 'Creativity', 'Collaboration'], href: '/work?view=energy', icon: BatteryCharging },
      { title: 'Schedule', subtitle: 'Time has shape', bullets: ['Meetings', 'Focus time', 'Interviews'], href: '/calendar', icon: CalendarDays },
      { title: 'People', subtitle: 'Key collaborators', bullets: ['Team', 'Managers', 'Mentors'], href: '/today?room=people', icon: Users },
      { title: 'Projects', subtitle: 'Move meaningful work forward', bullets: ['Active projects', 'Milestones', 'Progress'], href: '/projects', icon: BriefcaseBusiness },
      { title: 'Interviews & Career', subtitle: 'Your next chapter', bullets: ['Applications', 'Interviews', 'Portfolio'], href: '/work?view=career', icon: Compass },
      { title: 'Follow-ups', subtitle: 'Close the loops', bullets: ['Messages', 'Feedback', 'Next actions'], href: '/tasks?context=work', icon: CheckCircle2 },
    ],
  },
  relationships: {
    title: 'RELATIONSHIPS',
    subtitle: 'How am I caring for the people in my life?',
    question: 'What helps me stay present, connected, and boundaried with the people who matter?',
    tabs: ['People', 'Conversations', 'Memories', 'Plans', 'Boundaries'],
    heroTitle: 'Relationships are a place to be human.',
    heroCaption: 'Listen. Show up. Appreciate. Grow together.',
    railTitle: 'People to nurture',
    railNote: 'Glow never assigns human worth or closeness scores. It helps you remember context, promises, dates, and care.',
    railLabels: ['People', 'Conversations', 'Plans', 'Follow-ups', 'Boundaries'],
    cards: [
      { title: 'People', subtitle: 'The ones who matter', bullets: ['Family', 'Friends', 'Partners', 'You'], href: '/today?room=people', icon: Users },
      { title: 'Shared Memories', subtitle: 'Moments that matter', bullets: ['Photos', 'Places', 'Stories'], href: '/timeline', icon: Camera },
      { title: 'Conversations', subtitle: 'Stay close', bullets: ['Recent conversations', 'Things to return to', 'Context'], href: '/notes?context=relationships', icon: MessageCircleMore },
      { title: 'Upcoming', subtitle: 'Time well spent', bullets: ['Plans', 'Birthdays', 'Important dates'], href: '/calendar', icon: CalendarDays },
      { title: 'Promises & Follow-ups', subtitle: 'Keep your word', bullets: ['Check-ins', 'Plans to make', 'Things to send'], href: '/tasks?context=relationships', icon: CheckCircle2 },
      { title: 'Preferences & Boundaries', subtitle: 'What helps relationships thrive', bullets: ['Quality time', 'Communication', 'Space', 'No'], href: '/rules', icon: Heart },
      { title: 'Care & Support', subtitle: 'Be there, together', bullets: ['Check in', 'Celebrate', 'Offer support'], href: '/notes?context=relationships', icon: Gift },
    ],
  },
  travel: {
    title: 'TRAVEL',
    subtitle: 'Farther you. A kinder, wider world.',
    question: 'Where am I going, what needs to happen before I leave, and what do I want to remember?',
    tabs: ['Travel', 'Trips', 'Map', 'Packing', 'Memories'],
    heroTitle: 'Next stop.',
    heroCaption: 'Dreaming becomes deciding, booking, preparing, traveling, and remembering without leaving the same journey.',
    railTitle: 'Journey context',
    railNote: 'Only real trips, places, reservations, calendar events, and memories appear when they are connected.',
    railLabels: ['Dreaming', 'Planning', 'Bookings', 'Preparing', 'Memories'],
    cards: [
      { title: '1. Dreaming', subtitle: 'Ideas for your next chapter', bullets: ['Destinations', 'Saved places', 'Inspiration'], href: '/today?room=places', icon: Compass },
      { title: '4. Preparing', subtitle: 'Get ready. Travel lighter.', bullets: ['Packing list', 'Essentials', 'Documents', 'Health & safety'], href: '/tasks?context=travel', icon: Luggage },
      { title: '2. Deciding', subtitle: 'Compare. Plan. Align.', bullets: ['Best time', 'Budget', 'Travel style'], href: '/calendar', icon: Map },
      { title: '5. Traveling', subtitle: 'In the moment', bullets: ['Live itinerary', 'Maps', 'Arrival', 'Check-in'], href: '/today?room=places', icon: Plane },
      { title: '3. Booking', subtitle: 'Everything in one place', bullets: ['Flights', 'Hotels', 'Transport', 'Activities'], href: '/calendar', icon: Plane },
      { title: '6. Remembering', subtitle: 'Moments that stay', bullets: ['Photos', 'Notes', 'Places', 'Stories'], href: '/timeline', icon: Camera },
    ],
  },
};

const DESIGN_WIDTH = 1360;
const DESIGN_HEIGHT = 760;

function ScaledStage({ children }: { children: React.ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const update = () => {
      const width = node.clientWidth;
      const fit = Math.min(1, width / DESIGN_WIDTH);
      setScale(width < 700 ? Math.max(0.55, fit) : fit);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={viewportRef} className={styles.stageViewport}>
      <div className={styles.stageSizer} style={{ width: DESIGN_WIDTH * scale, height: DESIGN_HEIGHT * scale }}>
        <div className={styles.designStage} style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT, transform: `scale(${scale})` }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Pod({ card, index }: { card: RoomCard; index: number }) {
  const Icon = card.icon;
  return (
    <Link href={card.href} className={`${styles.pod} ${styles[`pod_${index + 1}`]}`}>
      <div className={styles.podText}>
        <strong>{card.title}</strong>
        <small>{card.subtitle}</small>
        <ul>
          {card.bullets.map((bullet) => (
            <li key={bullet}><CheckCircle2 size={12} />{bullet}</li>
          ))}
        </ul>
        <span>{card.cta ?? 'Open'} <ArrowRight size={13} /></span>
      </div>
      <div className={styles.podObject} aria-hidden="true">
        <i className={styles.podOrb} />
        <Icon size={32} strokeWidth={1.25} />
        <b />
        <em />
      </div>
    </Link>
  );
}

function HeroScene({ room, title, caption }: { room: ReferenceLifeRoomId; title: string; caption: string }) {
  if (room === 'home') {
    return (
      <Link href="/tasks?context=home" className={`${styles.heroScene} ${styles.homeHero}`}>
        <div className={styles.floorPlan} aria-hidden="true">
          <span className={styles.floorBedroom}>Bedroom</span>
          <span className={styles.floorBath}>Bathroom</span>
          <span className={styles.floorOffice}>Office</span>
          <span className={styles.floorKitchen}>Kitchen</span>
          <span className={styles.floorDining}>Dining</span>
          <span className={styles.floorLiving}>Living Room</span>
          <span className={styles.floorLaundry}>Laundry</span>
        </div>
        <div className={styles.heroCopy}><strong>{title}</strong><small>{caption}</small></div>
      </Link>
    );
  }

  if (room === 'closet') {
    return (
      <Link href="/closet" className={`${styles.heroScene} ${styles.closetHero}`}>
        <div className={styles.wardrobe} aria-hidden="true">
          {[0,1,2,3,4].map((section) => (
            <span key={section} className={styles.wardrobeBay}>
              <i className={styles.railLine} />
              {[0,1,2,3].map((garment) => <b key={garment} className={styles.garment} />)}
            </span>
          ))}
          <span className={styles.accessoryShelf}><i /><i /><i /></span>
        </div>
        <div className={styles.heroCopy}><strong>{title}</strong><small>{caption}</small></div>
      </Link>
    );
  }

  if (room === 'beauty') {
    return (
      <Link href="/beauty" className={`${styles.heroScene} ${styles.beautyHero}`}>
        <div className={styles.vanity} aria-hidden="true">
          <span className={styles.mirror}><i /></span>
          <span className={styles.vanityShelf} />
          <span className={styles.bottleOne} />
          <span className={styles.bottleTwo} />
          <span className={styles.brushCup}><i /><i /><i /><i /></span>
        </div>
        <div className={styles.heroCopy}><strong>{title}</strong><small>{caption}</small></div>
      </Link>
    );
  }

  if (room === 'food') {
    return (
      <Link href="/food" className={`${styles.heroScene} ${styles.foodHero}`}>
        <div className={styles.foodBowl} aria-hidden="true">
          <span className={styles.foodBase} />
          <i /><i /><i /><i /><i />
          <b /><b /><b />
        </div>
        <div className={styles.heroCopy}><strong>{title}</strong><small>{caption}</small></div>
      </Link>
    );
  }

  if (room === 'money') {
    return (
      <Link href="/finance" className={`${styles.heroScene} ${styles.moneyHero}`}>
        <div className={styles.moneyFlow} aria-hidden="true"><i /><i /><i /><b /><b /></div>
        <div className={styles.heroCopy}><strong>{title}</strong><small>{caption}</small></div>
      </Link>
    );
  }

  if (room === 'work') {
    return (
      <Link href="/today?room=focus" className={`${styles.heroScene} ${styles.workHero}`}>
        <div className={styles.workSurface} aria-hidden="true">
          <span className={styles.workSheet}><i /><i /><i /></span>
          <span className={styles.workFolder} />
          <span className={styles.workPen} />
          <span className={styles.workNote}>Ideas<br />Progress<br />People<br />Impact</span>
        </div>
        <div className={styles.heroCopy}><strong>{title}</strong><small>{caption}</small></div>
      </Link>
    );
  }

  if (room === 'relationships') {
    return (
      <Link href="/today?room=people" className={`${styles.heroScene} ${styles.relationshipsHero}`}>
        <div className={styles.relationshipMatter} aria-hidden="true"><i /><i /><i /><b /><b /><em /></div>
        <div className={styles.heroCopy}><strong>{title}</strong><small>{caption}</small></div>
      </Link>
    );
  }

  if (room === 'travel') {
    return (
      <Link href="/today?room=places" className={`${styles.heroScene} ${styles.travelHero}`}>
        <div className={styles.travelScene} aria-hidden="true">
          <span className={styles.sunset} />
          <span className={styles.horizon} />
          <Plane className={styles.travelPlane} size={52} strokeWidth={1.2} />
          <span className={styles.suitcase}><i /><b /></span>
        </div>
        <div className={styles.heroCopy}><strong>{title}</strong><small>{caption}</small></div>
      </Link>
    );
  }

  return (
    <Link href="/wellness" className={`${styles.heroScene} ${styles.bodyHero}`}>
      <div className={styles.bodyOrbit} aria-hidden="true"><i /><b /><em /></div>
      <div className={styles.bodyFigure} aria-hidden="true"><span /><i /><b /><em /></div>
      <div className={styles.heroCopy}><strong>{title}</strong><small>{caption}</small></div>
    </Link>
  );
}

export function LifeReferenceRoom({ room, connectedCount }: { room: ReferenceLifeRoomId; connectedCount: number }) {
  const config = ROOM_CONFIG[room];

  return (
    <main className={`${styles.world} ${styles[`room_${room}`]}`} data-glow-room={`life-${room}`}>
      <div className={styles.causticA} aria-hidden="true" />
      <div className={styles.causticB} aria-hidden="true" />

      <section className={styles.frame} aria-label={`Life · ${config.title}`}>
        <header className={styles.header}>
          <Link href="/life" className={styles.returnAnchor} aria-label="Return to Life">
            <ArrowLeft size={15} />
            <span>Back to Life</span>
          </Link>

          <div className={styles.identity}>
            <small>WORLD 3 · LIFE</small>
            <h1>{config.title}</h1>
            <p>{config.question}</p>
          </div>

          <Link href="/ask-glow" className={styles.askGlow}>
            <Search size={14} />
            <span>Ask Glow…</span>
            <i aria-hidden="true" />
          </Link>
        </header>

        <nav className={styles.localTabs} aria-label={`${config.title} local controls`}>
          {config.tabs.map((tab, index) => <span key={tab} className={index === 0 ? styles.tabActive : undefined}>{tab}</span>)}
        </nav>

        <ScaledStage>
          <div className={styles.sceneColumn}>
            <div className={styles.sceneGlow} aria-hidden="true" />
            {config.cards.map((card, index) => <Pod key={card.title} card={card} index={index} />)}
            <HeroScene room={room} title={config.heroTitle} caption={config.heroCaption} />
          </div>

          <aside className={styles.intelligenceRail}>
            <section className={styles.statusCard}>
              <span className={styles.eyebrow}>{config.railTitle}</span>
              <div className={styles.connectionCount}>
                <strong>{connectedCount}</strong>
                <small>connected</small>
                <i aria-hidden="true" />
              </div>
              <p>{config.railNote}</p>
              <div className={styles.railSignals}>
                {config.railLabels.map((label) => <span key={label}><i />{label}</span>)}
              </div>
            </section>

            <section className={styles.guidanceCard}>
              <span className={styles.eyebrow}>Glow guidance</span>
              <strong>{config.subtitle}</strong>
              <p>Ask Glow from inside this room and the conversation keeps the room context instead of sending you to a disconnected assistant screen.</p>
              <Link href="/ask-glow"><Sparkles size={13} /> Ask Glow about {config.title.toLowerCase()}</Link>
            </section>

            <section className={styles.savedState}>
              <CheckCircle2 size={14} />
              <span>Connected across Glow OS</span>
            </section>
          </aside>
        </ScaledStage>

        <footer className={styles.roomFooter}>
          <Link href="/life"><ArrowLeft size={13} /> Life</Link>
          <span className={styles.footerGlow} aria-hidden="true" />
          <Link href="/ask-glow">Ask Glow <ArrowRight size={13} /></Link>
        </footer>
      </section>
    </main>
  );
}
