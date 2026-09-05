'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  CookingPot,
  CreditCard,
  Gift,
  Heart,
  Home,
  House,
  Leaf,
  ListChecks,
  Luggage,
  Map,
  MessageCircleMore,
  NotebookText,
  PackageCheck,
  Palette,
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
  cta?: string;
  icon: LucideIcon;
  size?: 'wide' | 'tall' | 'standard';
};

type RoomConfig = {
  title: string;
  subtitle: string;
  tabs: string[];
  heroTitle: string;
  heroCaption: string;
  statusTitle: string;
  statusCaption: string;
  statusBullets: string[];
  cards: RoomCard[];
};

const ROOM_CONFIG: Record<ReferenceLifeRoomId, RoomConfig> = {
  travel: {
    title: 'TRAVEL',
    subtitle: 'Farther you. A more open you.',
    tabs: ['Overview', 'Trips', 'Map', 'Packing', 'Insights', 'Settings'],
    heroTitle: 'Good journeys change you.',
    heroCaption: 'Dream, plan, move, and remember in one connected place.',
    statusTitle: 'Travel status',
    statusCaption: 'Only real trips and connected plans appear here.',
    statusBullets: ['Upcoming plans', 'Preparation', 'Places', 'Memories'],
    cards: [
      { title: '1. Dreaming', subtitle: 'Where to next?', bullets: ['Explore destinations', 'Saved places', 'Inspiration'], href: '/today?room=places', cta: 'Explore the world', icon: Compass, size: 'wide' },
      { title: '2. Deciding', subtitle: 'Turn dreams into plans', bullets: ['Compare options', 'Best time to go', 'Trip companions'], href: '/calendar', cta: 'View options', icon: Map },
      { title: '3. Booking', subtitle: 'Make it real', bullets: ['Flights', 'Stays', 'Travel insurance'], href: '/calendar', cta: 'View bookings', icon: Plane },
      { title: '4. Preparing', subtitle: 'Get ready with ease', bullets: ['Packing list', 'Documents', 'Health & safety', 'Accessibility'], href: '/tasks?context=travel', cta: 'View checklist', icon: Luggage },
      { title: '5. Traveling', subtitle: 'Be present', bullets: ['Current trip', 'Live itinerary', 'Maps & navigation', 'Connectivity'], href: '/today?room=places', cta: 'Open journey', icon: Plane },
      { title: '6. Remembering', subtitle: 'Keep the journey alive', bullets: ['Photos & memories', 'Notes & reflections', 'Places visited', 'Share your story'], href: '/timeline', cta: 'Create memory', icon: Camera, size: 'wide' },
    ],
  },
  closet: {
    title: 'CLOSET',
    subtitle: 'Wear your life, intentionally.',
    tabs: ['Overview', 'Outfits', 'Wardrobe', 'Care', 'Alterations', 'Settings'],
    heroTitle: 'A wardrobe for your next chapter.',
    heroCaption: 'Curated. Versatile. You.',
    statusTitle: 'Wardrobe context',
    statusCaption: 'Your closet reflects what Glow actually knows about your wardrobe.',
    statusBullets: ['Outfits', 'Wardrobe', 'Care', 'Recently worn'],
    cards: [
      { title: "Today's Context", subtitle: 'Dress for the real day in front of you.', bullets: ['Weather & plans', 'Desired effort', 'Comfort needs'], href: '/calendar', cta: 'See today', icon: CalendarDays },
      { title: 'Outfit Ideas', subtitle: 'Curated for your day', bullets: ['Work', 'Casual', 'Layerable'], href: '/closet?view=outfits', cta: 'See more looks', icon: Sparkles, size: 'wide' },
      { title: 'Categories', subtitle: 'Browse the wardrobe', bullets: ['Tops & bottoms', 'Dresses & outerwear', 'Shoes & accessories'], href: '/closet', cta: 'Open wardrobe', icon: Shirt },
      { title: 'Wardrobe Balance', subtitle: 'See what your closet is made of.', bullets: ['Core pieces', 'Occasion gaps', 'Underused items'], href: '/closet', cta: 'View full wardrobe', icon: Palette },
      { title: 'Care & Laundry', subtitle: 'Keep pieces at their best.', bullets: ['Laundry queue', 'Dry clean', 'Steam & repair'], href: '/tasks?context=closet', cta: 'Open care', icon: WashingMachine },
      { title: 'Alterations', subtitle: 'Fit and repair', bullets: ['In progress', 'Pickup dates', 'Tailoring notes'], href: '/tasks?context=alterations', cta: 'View alterations', icon: PackageCheck },
      { title: 'Favorites', subtitle: 'Saved looks', bullets: ['Repeat winners', 'Best silhouettes', 'Easy combinations'], href: '/closet?view=favorites', cta: 'Open favorites', icon: Heart },
      { title: 'Recently Worn', subtitle: 'Your latest looks', bullets: ['What you repeated', 'What worked', 'What to rotate next'], href: '/closet?view=recent', cta: 'Review looks', icon: Shirt },
    ],
  },
  food: {
    title: 'FOOD',
    subtitle: 'Nourish your body. A kinder, brighter you.',
    tabs: ['Overview', 'Meal Ideas', 'Nutrition', 'Groceries', 'Recipes', 'Settings'],
    heroTitle: 'Good food creates brighter days.',
    heroCaption: 'Nourishment in sync.',
    statusTitle: 'Nourishment context',
    statusCaption: 'No nutrition score is invented. Glow only summarizes what is connected.',
    statusBullets: ['Meals', 'Variety', 'Groceries', 'Recipes'],
    cards: [
      { title: 'Eat Now', subtitle: 'Quick · Healthy · Delicious', bullets: ['Fast meal ideas', 'Use what you have', 'Match your day'], href: '/food', cta: 'See all meal ideas', icon: Utensils, size: 'wide' },
      { title: 'Cook', subtitle: 'Turn ingredients into good days', bullets: ['Step-by-step recipes', 'Guided cooking', 'Save to your collection'], href: '/food?view=recipes', cta: 'Start cooking', icon: CookingPot },
      { title: 'Prepare', subtitle: 'Plan ahead. Less stress.', bullets: ['Chop vegetables', 'Cook grains', 'Prep protein', 'Make dressing'], href: '/routines?context=food', cta: 'View prep list', icon: ListChecks },
      { title: 'Use Soon', subtitle: 'Make the most of what you have', bullets: ['Fresh items', 'Expiry timing', 'Reduce waste'], href: '/food?view=groceries', cta: 'View all items', icon: Leaf },
      { title: 'Shop', subtitle: 'Everything you need, in one place', bullets: ['Grocery list', 'Preferred stores', 'Smart suggestions', 'Budget context'], href: '/food?view=groceries', cta: 'Open grocery list', icon: ShoppingBag },
      { title: 'Saved Recipes', subtitle: 'Your collection, your flavor', bullets: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'], href: '/food?view=recipes', cta: 'View all recipes', icon: NotebookText, size: 'wide' },
    ],
  },
  beauty: {
    title: 'BEAUTY COMMAND CENTER',
    subtitle: 'Look and feel like your best you, for today.',
    tabs: ['Today', 'Skin', 'Hair', 'Makeup', 'Body', 'Fragrance'],
    heroTitle: 'Ready when you are.',
    heroCaption: 'Glow brings the whole getting-ready sequence together.',
    statusTitle: 'Beauty status',
    statusCaption: 'Routines and timing are based only on connected beauty information.',
    statusBullets: ['Skin', 'Hair', 'Makeup', 'Body'],
    cards: [
      { title: 'Skin', subtitle: "Healthy, radiant skin for today's glow.", bullets: ['Cleanse', 'Treat', 'Moisturize', 'SPF'], href: '/beauty?studio=skincare', cta: 'Open skincare', icon: Sparkles },
      { title: 'Hair', subtitle: 'Healthy, styled, confidence in every strand.', bullets: ['Wash / dry', 'Style', 'Treat', 'Finish'], href: '/hair', cta: 'Open hair', icon: Sparkles },
      { title: 'Makeup', subtitle: 'Enhance your natural beauty.', bullets: ['Primer', 'Base', 'Color', 'Eyes', 'Lips'], href: '/beauty?studio=makeup', cta: 'Open makeup', icon: Palette },
      { title: 'Fragrance', subtitle: 'The final touch. A lasting impression.', bullets: ['Scent mood', 'Layering', 'Occasion', 'Finish'], href: '/beauty', cta: 'Choose fragrance', icon: Sparkles },
      { title: 'Body', subtitle: 'Feel fresh, smooth and energized.', bullets: ['Shower', 'Body care', 'Deodorant', 'Perfume prep'], href: '/routines?context=beauty', cta: 'Open body care', icon: Leaf },
      { title: 'Final Look', subtitle: 'Bring it all together.', bullets: ['Outfit ready', 'Hair & makeup done', 'Accessories', 'Quick mirror check'], href: '/closet?view=outfits', cta: 'View checklist', icon: CheckCircle2, size: 'wide' },
    ],
  },
  money: {
    title: 'MONEY',
    subtitle: 'Freedom today. More tomorrow.',
    tabs: ['Overview', 'Accounts', 'Spending', 'Saving', 'Plan', 'Settings'],
    heroTitle: 'A calmer relationship with money.',
    heroCaption: 'Clarity creates freedom.',
    statusTitle: 'Money status',
    statusCaption: 'Amounts and financial signals appear only when connected to your real data.',
    statusBullets: ['Cash flow', 'Bills', 'Saving', 'Attention'],
    cards: [
      { title: 'Available', subtitle: 'Liquid and ready', bullets: ['Checking', 'High-yield savings', 'Cash / other'], href: '/finance', cta: 'View all accounts', icon: WalletCards },
      { title: 'Committed', subtitle: 'Bills, subscriptions, and essentials', bullets: ['Housing', 'Subscriptions', 'Insurance', 'Other'], href: '/finance?view=budget', cta: 'View commitments', icon: ReceiptText },
      { title: 'Upcoming', subtitle: 'Next 30 days', bullets: ['Bills', 'Subscriptions', 'Payments', 'Due dates'], href: '/finance?view=bills', cta: 'View full calendar', icon: CalendarDays },
      { title: 'Saving', subtitle: 'Build future freedom', bullets: ['Emergency fund', 'Travel fund', 'Next goal'], href: '/finance?view=saving', cta: 'Manage savings', icon: CircleDollarSign },
      { title: 'Flexible Spending', subtitle: 'What is left to use', bullets: ['Spent so far', 'Budget remaining', 'Category mix'], href: '/finance?view=budget', cta: 'See breakdown', icon: CreditCard },
      { title: 'Financial Attention', subtitle: 'What deserves a decision next', bullets: ['Review subscriptions', 'Strengthen buffer', 'Plan next milestone'], href: '/finance/brain', cta: 'Open plan', icon: Target, size: 'wide' },
    ],
  },
  home: {
    title: 'HOME',
    subtitle: 'Your home, a calmer you.',
    tabs: ['Overview', 'Rooms', 'Routines', 'Maintenance', 'Inventory', 'Design'],
    heroTitle: 'Home in harmony.',
    heroCaption: 'A calm space supports a fuller life.',
    statusTitle: 'Home status',
    statusCaption: 'Glow uses your real tasks, routines, inventory, and maintenance context.',
    statusBullets: ['Cleanliness', 'Maintenance', 'Organization', 'Comfort'],
    cards: [
      { title: 'Living Room', subtitle: 'Relax · Connect · Unwind', bullets: ['Last reset', 'Next care', 'Room notes'], href: '/tasks?context=living-room', cta: 'Open room', icon: House },
      { title: 'Bedroom', subtitle: 'Rest · Recharge', bullets: ['Reset', 'Laundry', 'Next care'], href: '/tasks?context=bedroom', cta: 'Open room', icon: Home },
      { title: 'Kitchen', subtitle: 'Nourish · Gather', bullets: ['Clean', 'Restock', 'Meal prep'], href: '/tasks?context=kitchen', cta: 'Open kitchen', icon: CookingPot },
      { title: 'Bathroom', subtitle: 'Refresh · Care', bullets: ['Clean', 'Restock', 'Beauty inventory'], href: '/tasks?context=bathroom', cta: 'Open bathroom', icon: Sparkles },
      { title: 'Workspace', subtitle: 'Focus · Create', bullets: ['Reset desk', 'Supplies', 'Current setup'], href: '/tasks?context=workspace', cta: 'Open workspace', icon: BriefcaseBusiness },
      { title: 'Laundry', subtitle: 'Clean · Refresh', bullets: ['Wash queue', 'Dry clean', 'Put away'], href: '/tasks?context=laundry', cta: 'Open laundry', icon: WashingMachine },
      { title: 'Outdoor', subtitle: 'Plants · Fresh Air', bullets: ['Plants', 'Seasonal care', 'Outdoor reset'], href: '/tasks?context=outdoor', cta: 'Open outdoor', icon: Leaf },
      { title: 'Storage', subtitle: 'Organize · Keep', bullets: ['Bins', 'Inventory', 'Declutter'], href: '/tasks?context=storage', cta: 'Open storage', icon: PackageCheck },
    ],
  },
  relationships: {
    title: 'RELATIONSHIPS',
    subtitle: 'People who make life more meaningful.',
    tabs: ['Overview', 'People', 'Conversations', 'Memories', 'Dates', 'Boundaries'],
    heroTitle: 'People make life richer.',
    heroCaption: 'Nurture · Be present · Grow together.',
    statusTitle: 'Connection context',
    statusCaption: 'Glow will never invent a relationship score or fake closeness.',
    statusBullets: ['People', 'Conversations', 'Follow-ups', 'Important dates'],
    cards: [
      { title: 'People', subtitle: 'Family · Friends · Partners · You', bullets: ['People close to you', 'Contact context', 'Shared plans'], href: '/today?room=people', cta: 'Open people', icon: Users },
      { title: 'Conversations', subtitle: 'Meaningful · Ongoing · Ideas', bullets: ['Recent conversations', 'Things to return to', 'What matters next'], href: '/notes?context=relationships', cta: 'Open conversations', icon: MessageCircleMore },
      { title: 'Shared Memories', subtitle: 'Moments · Photos · Places', bullets: ['Photos', 'Places', 'Stories'], href: '/timeline', cta: 'Open memories', icon: Camera },
      { title: 'Important Dates', subtitle: 'Remember the moments that matter', bullets: ['Birthdays', 'Anniversaries', 'Plans'], href: '/calendar', cta: 'View dates', icon: CalendarDays },
      { title: 'Promises & Follow-ups', subtitle: 'Keep your word visible', bullets: ['Check-ins', 'Plans to make', 'Things to send'], href: '/tasks?context=relationships', cta: 'Review follow-ups', icon: CheckCircle2 },
      { title: 'Boundaries', subtitle: 'Your time · Your energy · Your yes · Your no', bullets: ['Personal rules', 'Space to protect', 'Needs to honor'], href: '/rules', cta: 'Review boundaries', icon: Heart },
      { title: 'Gift Ideas', subtitle: 'Thoughtful · Personal · On time', bullets: ['Ideas', 'Things they mentioned', 'Upcoming occasions'], href: '/notes?context=gifts', cta: 'Open gift ideas', icon: Gift },
      { title: 'Relationship Notes', subtitle: 'Reflections · Insights · Gratitude', bullets: ['Private notes', 'What you noticed', 'What you appreciate'], href: '/notes?context=relationships', cta: 'Open notes', icon: NotebookText },
    ],
  },
  work: {
    title: 'WORK',
    subtitle: 'Meaningful work. A balanced you.',
    tabs: ['Overview', 'Projects', 'Schedule', 'Career', 'Settings'],
    heroTitle: 'Work with direction.',
    heroCaption: 'Create impact. Grow your future. Find balance.',
    statusTitle: 'Work status',
    statusCaption: 'Work context reflects your real projects, calendar, tasks, and career information.',
    statusBullets: ['Focus', 'Progress', 'Balance', 'Direction'],
    cards: [
      { title: 'Current Role', subtitle: 'What you are doing now', bullets: ['Role context', 'Responsibilities', 'Work setup'], href: '/work', cta: 'Open role', icon: BriefcaseBusiness },
      { title: 'Schedule', subtitle: 'Today and this week', bullets: ['Meetings', 'Focus time', 'Interviews', 'Shifts'], href: '/calendar', cta: 'Open schedule', icon: CalendarDays },
      { title: 'Priorities', subtitle: 'What matters most', bullets: ['Active tasks', 'Next actions', 'Deadlines'], href: '/today?room=focus', cta: 'Open priorities', icon: Target },
      { title: 'People', subtitle: 'Team · Managers · Mentors · Peers', bullets: ['Key contacts', 'Follow-ups', 'Relationship context'], href: '/today?room=people', cta: 'Open people', icon: Users },
      { title: 'Career Direction', subtitle: "Design a life you're proud of.", bullets: ['Grow responsibility', 'Explore leadership', 'Build portfolio', 'Stay open'], href: '/work?view=career', cta: 'Open career', icon: Compass },
      { title: 'Projects', subtitle: 'Move work forward', bullets: ['Active projects', 'Milestones', 'Progress'], href: '/projects', cta: 'View projects', icon: BriefcaseBusiness, size: 'wide' },
      { title: 'Pay', subtitle: 'Financial freedom supports creativity.', bullets: ['Compensation', 'Next payday', 'Money context'], href: '/finance', cta: 'View details', icon: CircleDollarSign },
      { title: 'Dress & Presence', subtitle: 'Look good. Feel confident.', bullets: ['Dress code', 'Comfort', 'Interview looks'], href: '/closet?view=outfits', cta: 'Plan a look', icon: Shirt },
    ],
  },
};

export function isReferenceLifeRoom(value: string): value is ReferenceLifeRoomId {
  return value in ROOM_CONFIG;
}

function LiquidObject({ Icon }: { Icon: LucideIcon }) {
  return (
    <span className={styles.liquidObject} aria-hidden="true">
      <span className={styles.objectGlow} />
      <Icon size={24} strokeWidth={1.35} />
      <i />
      <b />
    </span>
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
            <small>WORLD 3</small>
            <span>LIFE · THE PERSONAL HOUSE</span>
            <h1>{config.title}</h1>
            <p>{config.subtitle}</p>
          </div>

          <Link href="/ask-glow" className={styles.askGlow}>
            <Search size={14} />
            <span>Ask Glow…</span>
            <i aria-hidden="true" />
          </Link>
        </header>

        <nav className={styles.localTabs} aria-label={`${config.title} controls`}>
          {config.tabs.map((tab, index) => (
            <span key={tab} className={index === 0 ? styles.tabActive : undefined}>{tab}</span>
          ))}
        </nav>

        <section className={styles.roomField}>
          <section className={styles.cardGrid} aria-label={`${config.title} areas`}>
            {config.cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className={`${styles.roomCard} ${styles[`card_${index + 1}`]} ${card.size ? styles[`size_${card.size}`] : ''}`}
                >
                  <div className={styles.cardCopy}>
                    <strong>{card.title}</strong>
                    <small>{card.subtitle}</small>
                    <ul>
                      {card.bullets.map((bullet) => <li key={bullet}><CheckCircle2 size={12} />{bullet}</li>)}
                    </ul>
                    <span className={styles.cardCta}>{card.cta ?? 'Open'} <ArrowRight size={13} /></span>
                  </div>
                  <LiquidObject Icon={Icon} />
                </Link>
              );
            })}

            <Link href="/ask-glow" className={styles.centerPiece}>
              <span className={styles.centerHalo} aria-hidden="true"><i /><b /><em /></span>
              <div>
                <Sparkles size={17} />
                <strong>{config.heroTitle}</strong>
                <small>{config.heroCaption}</small>
              </div>
            </Link>
          </section>

          <aside className={styles.intelligenceRail}>
            <section className={styles.statusCard}>
              <span className={styles.eyebrow}>{config.statusTitle}</span>
              <div className={styles.statusValue}>
                <strong>{connectedCount}</strong>
                <small>connected</small>
                <span className={styles.statusArc} aria-hidden="true" />
              </div>
              <p>{config.statusCaption}</p>
              <div className={styles.statusList}>
                {config.statusBullets.map((item) => <span key={item}><i />{item}</span>)}
              </div>
            </section>

            <section className={styles.nextCard}>
              <span className={styles.eyebrow}>Glow context</span>
              <strong>Ready for your real information.</strong>
              <p>Nothing on this page substitutes sample names, scores, trips, money, meals, work, or relationships for missing data.</p>
              <Link href="/ask-glow"><Sparkles size={13} /> Ask Glow about {config.title.toLowerCase()}</Link>
            </section>

            <section className={styles.saveCard}>
              <CheckCircle2 size={14} />
              <span>Changes stay connected across Glow OS</span>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
