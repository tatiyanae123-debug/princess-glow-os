'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  CookingPot,
  HeartPulse,
  House,
  Plane,
  Search,
  Shirt,
  Sparkles,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './life-physical-world.module.css';

export type LifePhysicalRoomId =
  | 'body'
  | 'beauty'
  | 'closet'
  | 'food'
  | 'home'
  | 'money'
  | 'work'
  | 'relationships'
  | 'travel';

type ModuleSpec = { title: string; note: string; detail: string[] };
type PageSpec = {
  slug: string;
  label: string;
  question: string;
  motif: string;
  hero: string;
  note: string;
  modules: ModuleSpec[];
  signals: string[];
};
type RoomSpec = { title: string; subtitle: string; icon: LucideIcon; pages: PageSpec[] };

const m = (title: string, note: string, detail: string[]): ModuleSpec => ({ title, note, detail });
const p = (slug: string, label: string, question: string, motif: string, hero: string, note: string, modules: ModuleSpec[], signals: string[]): PageSpec => ({ slug, label, question, motif, hero, note, modules, signals });

const ROOMS: Record<LifePhysicalRoomId, RoomSpec> = {
  home: {
    title: 'HOME', subtitle: 'Your home, a calmer you.', icon: House,
    pages: [
      p('home', 'Home', 'What does my home need and where does everything belong?', 'home-model', 'Home in harmony.', 'The house itself is the interface.', [
        m('Living Room', 'Relax · connect · unwind', ['Reset', 'Comfort', 'Gather']),
        m('Bedroom', 'Rest · recharge', ['Bed', 'Laundry', 'Night care']),
        m('Kitchen', 'Nourish · gather', ['Cook', 'Restock', 'Close']),
        m('Bathroom', 'Refresh · care', ['Clean', 'Beauty stock', 'Linens']),
        m('Workspace', 'Focus · create', ['Desk', 'Supplies', 'Projects']),
        m('Laundry + Storage', 'Clean · organize', ['Wash', 'Put away', 'Store']),
      ], ['Rooms needing attention', 'Home reset', 'Low stock', 'Maintenance due']),
      p('rooms', 'Rooms', 'Which room needs attention, and what is happening inside it?', 'house-cutaway', 'The house opens room by room.', 'Walls reveal interiors instead of sending you to a room list.', [
        m('Bedroom', 'Rest zone', ['Bed', 'Closet edge', 'Night routine']),
        m('Bathroom', 'Care zone', ['Sink', 'Shower', 'Restock']),
        m('Kitchen + Dining', 'Nourishment zone', ['Prep', 'Cook', 'Gather']),
        m('Living Room', 'Connection zone', ['Tidy', 'Comfort', 'Host']),
        m('Workspace', 'Focus zone', ['Desk', 'Projects', 'Supplies']),
        m('Utility Spaces', 'Laundry · storage · outdoor', ['Wash', 'Store', 'Plants']),
      ], ['Room state', 'Next reset', 'What belongs where', 'Active room project']),
      p('routines', 'Routines', 'What recurring rhythm keeps my home easy to live in?', 'home-rhythm', 'Home runs on rhythm.', 'Daily, weekly, monthly and seasonal care travel through the floor plan.', [
        m('Daily', 'Small resets', ['Make bed', 'Kitchen close', 'Put away']),
        m('Weekly', 'Main reset', ['Laundry', 'Surfaces', 'Floors']),
        m('Monthly', 'Deeper care', ['Declutter', 'Restock', 'Inspect']),
        m('Seasonal', 'Change with the home', ['Filters', 'Wardrobe', 'Outdoor']),
        m('Sunday Reset', 'Bring it together', ['Plan', 'Clean', 'Prepare']),
      ], ['Today’s home rhythm', 'Next weekly reset', 'Overdue care', 'Seasonal shift']),
      p('maintenance', 'Maintenance', 'What needs care before it becomes a problem?', 'home-xray', 'The house turns into an infrastructure x-ray.', 'Air, water, appliances, safety and materials light up inside the architecture.', [
        m('Air + HVAC', 'Breathe easier', ['Filters', 'Vents', 'Seasonal service']),
        m('Plumbing', 'Water systems', ['Drains', 'Fixtures', 'Leaks']),
        m('Appliances', 'Keep essentials working', ['Kitchen', 'Laundry', 'Small appliances']),
        m('Electrical + Safety', 'Quiet protection', ['Detectors', 'Outlets', 'Locks']),
        m('Surfaces', 'Protect materials', ['Wood', 'Stone', 'Glass']),
      ], ['Due soon', 'Overdue maintenance', 'Replacement cycle', 'Home systems']),
      p('inventory', 'Inventory', 'What do I own, what is running low, and where does it live?', 'home-storage', 'The home becomes transparent storage.', 'Cabinets, drawers, shelves and hidden storage reveal what belongs inside.', [
        m('Kitchen Storage', 'Food + tools', ['Pantry', 'Fridge', 'Cookware']),
        m('Bathroom Storage', 'Care stock', ['Skin', 'Hair', 'Body']),
        m('Household', 'Everyday supplies', ['Cleaning', 'Paper', 'Laundry']),
        m('Bedroom Storage', 'Personal items', ['Closet', 'Under-bed', 'Drawers']),
        m('Low Stock', 'Replace soon', ['Almost out', 'Out', 'Backup']),
      ], ['Low stock', 'Where it lives', 'Duplicates', 'Restock next']),
      p('design', 'Design', 'How should this home look, feel, and function next?', 'home-drafting', 'The floor plan becomes a luminous design table.', 'Furniture, measurements, materials, lighting and projects sit directly on the plan.', [
        m('Layout', 'Space planning', ['Flow', 'Zones', 'Furniture']),
        m('Furniture', 'What belongs where', ['Keep', 'Move', 'Remove']),
        m('Lighting', 'Shape atmosphere', ['Ambient', 'Task', 'Accent']),
        m('Materials + Mood', 'The feeling of the room', ['Palette', 'Texture', 'References']),
        m('Projects', 'Changes in motion', ['Current', 'Next', 'Someday']),
      ], ['Current project', 'Measurements', 'Furniture moves', 'Design decisions']),
    ],
  },
  body: {
    title: 'BODY', subtitle: 'Listen. Adjust. Be kind.', icon: HeartPulse,
    pages: [
      p('body', 'Body', 'How is my body today, and what does it need?', 'body-form', 'Your body is the center.', 'Signals live around a translucent human form rather than inside health cards.', [
        m('Sleep', 'Rest + recovery', ['Last night', 'Rhythm', 'Restorative']),
        m('Energy', 'Capacity today', ['Available', 'Load', 'Fatigue']),
        m('Movement', 'Strength + mobility', ['Training', 'Walking', 'Mobility']),
        m('Cycle + Hormones', 'Patterns across time', ['Cycle', 'Changes', 'Context']),
        m('Symptoms', 'Notice what changed', ['Current', 'Pattern', 'Notes']),
        m('Nutrition + Hydration', 'Fuel + water', ['Meals', 'Protein', 'Hydration']),
      ], ['Sleep', 'Energy', 'Hydration', 'Movement']),
      p('mind', 'Mind', 'What is my nervous system carrying today?', 'mind-cloud', 'A quieter internal atmosphere.', 'Thoughts, mood, attention and regulation gather around a soft neural light field.', [
        m('Mental Load', 'What feels full', ['Open loops', 'Decisions', 'Stress']),
        m('Mood', 'Emotional weather', ['Check-in', 'Pattern', 'Context']),
        m('Focus', 'Attention capacity', ['Clarity', 'Distraction', 'Needs']),
        m('Regulation', 'Downshift', ['Breathing', 'Grounding', 'Quiet']),
        m('Rest', 'Protect recovery', ['Space', 'Sleep', 'Low stimulation']),
      ], ['Mental load', 'Mood', 'Focus capacity', 'Need for recovery']),
      p('energy', 'Energy', 'Where is my energy going, and what can I realistically do?', 'energy-current', 'Energy moves through the day.', 'Capacity rises, dips and recovers as a luminous current instead of becoming a score.', [
        m('Current Capacity', 'What is available now', ['Low', 'Steady', 'High']),
        m('Sleep Effect', 'What last night changed', ['Duration', 'Quality', 'Timing']),
        m('Fuel', 'Food + hydration', ['Meals', 'Protein', 'Water']),
        m('Movement Load', 'How much you are spending', ['Walk', 'Train', 'Mobility']),
        m('Recovery', 'Rebuild capacity', ['Rest', 'Stretch', 'Downshift']),
      ], ['Capacity now', 'Energy dip', 'Recovery window', 'Realistic load']),
      p('recovery', 'Recovery', 'What would help my body recover instead of just push through?', 'recovery-cocoon', 'Recovery becomes a cocoon.', 'Sleep, nourishment, gentle movement and care collect inside a protected restorative shell.', [
        m('Sleep', 'Primary recovery', ['Wind-down', 'Schedule', 'Rest']),
        m('Gentle Movement', 'Restore circulation', ['Walk', 'Stretch', 'Mobility']),
        m('Nourishment', 'Refuel', ['Meals', 'Protein', 'Hydration']),
        m('Medication + Care', 'Stay supported', ['Timing', 'Routine', 'Notes']),
        m('Body Care', 'Do something kind', ['Shower', 'Heat', 'Rest']),
      ], ['Recovery priority', 'Rest window', 'Gentle movement', 'Nourishment']),
    ],
  },
  beauty: {
    title: 'BEAUTY', subtitle: 'Look good. Feel good. Be you.', icon: Sparkles,
    pages: [
      p('today', 'Today', 'What helps me feel ready for the life I am actually living today?', 'beauty-vanity', 'Your best self today.', 'The full getting-ready sequence lives inside one illuminated vanity.', [
        m('Skin', 'Clear + balanced', ['Cleanse', 'Treat', 'Moisturize']),
        m('Hair', 'Healthy + styled', ['Wash', 'Style', 'Finish']),
        m('Makeup', 'Natural + polished', ['Base', 'Eyes', 'Lips']),
        m('Body', 'Smooth + cared for', ['Shower', 'Care', 'Finish']),
        m('Fragrance', 'The final layer', ['Mood', 'Layer', 'Last']),
        m('Final Look', 'Bring it together', ['Outfit', 'Hair', 'Makeup']),
      ], ['Ready-by time', 'Skin step', 'Hair state', 'Final look']),
      p('skin', 'Skin', 'What does my skin need today, and what should I use next?', 'skin-lab', 'The mirror becomes a skincare laboratory.', 'Serums, treatments and routine order occupy a clear ritual chamber.', [
        m('AM Ritual', 'Protect the day', ['Cleanse', 'Treat', 'Moisturize', 'SPF']),
        m('PM Ritual', 'Repair overnight', ['Cleanse', 'Treatment', 'Barrier']),
        m('Treatments', 'Targeted care', ['Retinoid', 'Acid', 'Spot care']),
        m('Products', 'In rotation', ['Active', 'Backup', 'Low stock']),
        m('Progress', 'What is changing', ['Texture', 'Tone', 'Breakouts']),
      ], ['What to use now', 'Sensitive combinations', 'Low stock', 'Progress']),
      p('hair', 'Hair', 'What does my hair need to stay healthy, styled, and easy to manage?', 'hair-studio', 'A transparent hair studio.', 'Brushes, tools, products, extensions and styling flow around a tactile hair ribbon.', [
        m('Wash Day', 'Clean + condition', ['Wash', 'Mask', 'Dry']),
        m('Style', 'Shape the day', ['Heat', 'Tools', 'Finish']),
        m('Treat', 'Protect health', ['Moisture', 'Scalp', 'Strength']),
        m('Extensions', 'Blend + protect', ['Wefts', 'U-part', 'Leave-out']),
        m('Maintenance', 'Keep it polished', ['Wrap', 'Detangle', 'Refresh']),
      ], ['Wash timing', 'Style today', 'Heat exposure', 'Maintenance']),
      p('makeup', 'Makeup', 'What makeup fits today without making getting ready harder?', 'makeup-station', 'An actual makeup station.', 'Face zones, brushes, palettes and product layers sit around the mirror.', [
        m('Complexion', 'Base layer', ['Prep', 'Base', 'Conceal']),
        m('Eyes', 'Shape + definition', ['Brows', 'Liner', 'Lashes']),
        m('Color', 'Bring life back', ['Blush', 'Bronze', 'Highlight']),
        m('Lips', 'Finish', ['Line', 'Color', 'Gloss']),
        m('Looks', 'Saved combinations', ['Natural', 'Polished', 'Evening']),
      ], ['Look for today', 'Products in use', 'Time available', 'Touch-up']),
      p('body', 'Body', 'What body-care ritual would make me feel fresh and comfortable today?', 'body-bath', 'A bathing and body-care environment.', 'Water, towels, body products and scent preparation replace generic beauty modules.', [
        m('Shower', 'Reset', ['Cleanse', 'Rinse', 'Refresh']),
        m('Body Care', 'Smooth + moisturize', ['Exfoliate', 'Moisturize', 'Treat']),
        m('Hands + Feet', 'Small maintenance', ['Nails', 'Cream', 'Care']),
        m('Hair Removal', 'Only when wanted', ['Prep', 'Care', 'Soothe']),
        m('Finish', 'Comfort first', ['Deodorant', 'Oil', 'Fragrance prep']),
      ], ['Body care due', 'What is already done', 'Comfort', 'Finish']),
      p('fragrance', 'Fragrance', 'What scent belongs to this mood, place, and moment?', 'fragrance-cabinet', 'A perfume cabinet made of light.', 'Bottles, notes, layering and memories occupy a scent atmosphere.', [
        m('Today', 'Choose the mood', ['Fresh', 'Warm', 'Soft']),
        m('Collection', 'What you own', ['Everyday', 'Evening', 'Seasonal']),
        m('Layering', 'Build the scent', ['Body', 'Base', 'Top']),
        m('Favorites', 'What keeps winning', ['Signature', 'Comfort', 'Event']),
        m('Memories', 'Scent + life', ['Places', 'People', 'Seasons']),
      ], ['Scent for now', 'Weather', 'Occasion', 'Layering']),
    ],
  },
  closet: {
    title: 'CLOSET', subtitle: 'Wear your life, intentionally.', icon: Shirt,
    pages: [
      p('wardrobe', 'Wardrobe', 'What do I own and what is available to me right now?', 'closet-wardrobe', 'The wardrobe is the interface.', 'Rails, hanging garments, shelves and accessories stay visible even before wardrobe data is added.', [
        m('Tops', 'Upper-body bay', ['Everyday', 'Dressy', 'Layering']),
        m('Bottoms', 'Pants + skirts bay', ['Rise', 'Fit', 'Silhouette']),
        m('Dresses', 'One-piece bay', ['Day', 'Evening', 'Event']),
        m('Outerwear', 'Heavier rail', ['Jackets', 'Coats', 'Cardigans']),
        m('Shoes', 'Lower shelving', ['Flats', 'Heels', 'Sneakers']),
        m('Accessories', 'Display cabinet', ['Bags', 'Jewelry', 'Belts']),
      ], ['Wearable now', 'Needs laundry', 'Needs care', 'Underused pieces']),
      p('outfits', 'Outfits', 'What complete look works for my real day?', 'closet-outfits', 'Garments leave the closet and compose themselves.', 'Complete silhouettes appear on a styling rail with alternatives nearby.', [
        m('Today’s Look', 'Best match for the day', ['Top', 'Bottom', 'Shoes']),
        m('Alternative 1', 'Same intention', ['Softer', 'Easier', 'Layered']),
        m('Alternative 2', 'Different silhouette', ['Shape', 'Proportion', 'Comfort']),
        m('Accessories', 'Finish the look', ['Bag', 'Jewelry', 'Shoes']),
        m('Care Check', 'Is it ready?', ['Clean', 'Steam', 'Repair']),
      ], ['Best match', 'Weather fit', 'Comfort', 'Care status']),
      p('occasions', 'Occasions', 'What should I wear for the things actually on my calendar?', 'closet-occasions', 'Events become dressing portals.', 'Each real-life occasion opens into a distinct outfit environment.', [
        m('Work', 'Polished', ['Shift', 'Meeting', 'Interview']),
        m('Dinner', 'Intentional', ['Casual', 'Date', 'Friends']),
        m('Birthday + Event', 'Special', ['Day', 'Evening', 'Party']),
        m('Travel', 'Destination aware', ['Airport', 'Day', 'Dinner']),
        m('At Home', 'Comfortable', ['Easy', 'Layered', 'Relaxed']),
      ], ['Next occasion', 'Dress code', 'Weather', 'Pieces available']),
      p('favorites', 'Favorites', 'Which pieces and combinations keep proving themselves?', 'closet-favorites', 'Favorites become a curated fashion archive.', 'Best pieces sit in glass display cases like objects worth remembering.', [
        m('Favorite Pieces', 'The reliable ones', ['Tops', 'Bottoms', 'Outerwear']),
        m('Favorite Looks', 'Whole outfits', ['Casual', 'Work', 'Evening']),
        m('Best Fit', 'Pieces that sit right', ['Waist', 'Length', 'Shape']),
        m('Most Worn', 'What earns its place', ['Repeat', 'Versatile', 'Easy']),
      ], ['Most useful', 'Best fit', 'Repeat winner', 'Signature pieces']),
      p('history', 'History', 'What have I actually worn, repeated, ignored, and loved?', 'closet-history', 'The closet becomes a visual wear timeline.', 'Outfit snapshots move through time with repetition, care and seasonal context.', [
        m('This Week', 'Recent looks', ['Today', 'Yesterday', 'Earlier']),
        m('Repeat Winners', 'What keeps working', ['Frequent', 'Easy', 'Loved']),
        m('Underused', 'What disappeared', ['Rarely worn', 'Hard to style', 'Needs care']),
        m('Care History', 'What changed', ['Laundry', 'Dry clean', 'Alterations']),
        m('Season Shift', 'What comes forward next', ['Store', 'Bring out', 'Replace']),
      ], ['Recent looks', 'Repeat rate', 'Underused', 'Care history']),
    ],
  },
  food: {
    title: 'FOOD', subtitle: 'Good food, a calmer you.', icon: CookingPot,
    pages: [
      p('food', 'Food', 'What should I eat, prepare, use, and shop for next?', 'food-table', 'Food becomes a living kitchen table.', 'A real plate, ingredients and kitchen objects anchor nourishment decisions.', [
        m('Eat Now', 'Ready + delicious', ['Quick', 'Available', 'Fits today']),
        m('Cook', 'Make something', ['Recipe', 'Ingredients', 'Steps']),
        m('Prepare', 'Make later easier', ['Chop', 'Cook', 'Portion']),
        m('Use Soon', 'Reduce waste', ['Fresh', 'Opened', 'Expiring']),
        m('Pantry + Fridge', 'Know what is there', ['Fridge', 'Freezer', 'Pantry']),
        m('Groceries', 'Restock intentionally', ['Need', 'Soon', 'Preferred']),
      ], ['Eat now', 'Use soon', 'Meal prep', 'Missing ingredients']),
      p('meals', 'Meals', 'How does food fit across my actual day?', 'meal-clock', 'Meals move through a day clock.', 'Breakfast, lunch, dinner and snacks sit on the day rather than in a spreadsheet.', [
        m('Breakfast', 'Start nourished', ['Protein', 'Fiber', 'Hydration']),
        m('Lunch', 'Keep energy steady', ['Main', 'Produce', 'Drink']),
        m('Dinner', 'End the day well', ['Main', 'Side', 'Prep']),
        m('Snacks', 'Useful between meals', ['Protein', 'Fruit', 'Easy']),
        m('Prep', 'Make tomorrow easier', ['Chop', 'Cook', 'Portion']),
      ], ['Next meal', 'Prep needed', 'Meal timing', 'What is available']),
      p('recipes', 'Recipes', 'What do I know how to make, and what should I cook next?', 'recipe-surface', 'One recipe becomes the cooking surface.', 'Ingredients and steps physically surround the dish like a transparent cookbook opened on the counter.', [
        m('Dish', 'What you are making', ['Time', 'Serving', 'Method']),
        m('Ingredients', 'What it needs', ['On hand', 'Missing', 'Optional']),
        m('Steps', 'Cook in order', ['Prep', 'Cook', 'Finish']),
        m('Saved', 'Your collection', ['Breakfast', 'Lunch', 'Dinner']),
        m('To Try', 'Future meals', ['New', 'Seasonal', 'Inspired']),
      ], ['Can cook now', 'Missing ingredient', 'Time needed', 'Saved favorites']),
      p('pantry', 'Pantry', 'What food is actually in my home right now?', 'pantry-wall', 'A glowing pantry wall.', 'Shelves, jars, refrigerator bins and freezer drawers become the inventory.', [
        m('Fridge', 'Fresh + ready', ['Produce', 'Dairy', 'Prepared']),
        m('Freezer', 'Longer-term stock', ['Protein', 'Meals', 'Frozen']),
        m('Pantry', 'Shelf stable', ['Grains', 'Cans', 'Snacks']),
        m('Use Soon', 'Reduce waste', ['Fresh', 'Opened', 'Expiring']),
        m('Staples', 'Never be without', ['Breakfast', 'Cooking', 'Snacks']),
      ], ['Use soon', 'Low stock', 'Staples', 'What is available']),
      p('groceries', 'Groceries', 'What do I actually need to buy, and what can wait?', 'market-basket', 'The pantry pours into a market basket.', 'Only real gaps leave the shelves and enter the shopping environment.', [
        m('Need Now', 'Missing essentials', ['Food', 'Home', 'Beauty']),
        m('Low Stock', 'Replace soon', ['Almost out', 'Backup', 'Staples']),
        m('For Meals', 'Connected to recipes', ['This week', 'Prep', 'Special']),
        m('Stores', 'Where to buy it', ['Preferred', 'Nearby', 'Specialty']),
        m('Budget Context', 'Keep it grounded', ['Planned', 'Flexible', 'Skip']),
      ], ['Need now', 'Can wait', 'Meal-linked items', 'Budget fit']),
    ],
  },
  money: {
    title: 'MONEY', subtitle: 'A calmer, clearer relationship with your money.', icon: CircleDollarSign,
    pages: [
      p('money', 'Money', 'What is available, committed, upcoming, and building my future?', 'money-flow', 'Money moves as one liquid system.', 'Funds flow through transparent channels instead of sitting inside dashboard cards.', [
        m('Available', 'Ready to use', ['Checking', 'Cash', 'Other']),
        m('Committed', 'Already spoken for', ['Bills', 'Subscriptions', 'Essentials']),
        m('Upcoming', 'Coming next', ['This week', 'This month', 'Later']),
        m('Saving', 'Build future freedom', ['Buffer', 'Goals', 'Contributions']),
        m('Flexible', 'Choices', ['Food', 'Shopping', 'Social']),
      ], ['Available now', 'Committed next', 'Flexible room', 'Needs attention']),
      p('accounts', 'Accounts', 'Where is my money, and what is each account for?', 'account-reservoirs', 'Accounts become financial reservoirs.', 'Different vessels make purpose and separation visible without inventing totals.', [
        m('Checking', 'Everyday flow', ['Income', 'Bills', 'Spending']),
        m('Savings', 'Protected money', ['Emergency', 'Goals', 'Short term']),
        m('Credit', 'Borrowed capacity', ['Balance', 'Due', 'Utilization']),
        m('Cash + Other', 'Outside primary accounts', ['Cash', 'Wallets', 'Other']),
        m('Transfers', 'Move intentionally', ['To savings', 'To bills', 'Between']),
      ], ['Account purpose', 'Available cash', 'Upcoming transfer', 'Credit attention']),
      p('spending', 'Spending', 'Where is money going, and what is flexible versus committed?', 'spending-streams', 'Spending becomes flowing channels.', 'Categories behave like streams leaving the main reservoir.', [
        m('Committed', 'Bills + essentials', ['Housing', 'Phone', 'Insurance']),
        m('Flexible', 'Choices this month', ['Food', 'Shopping', 'Social']),
        m('Subscriptions', 'Recurring flows', ['Active', 'Review', 'Cancel']),
        m('Patterns', 'What changed', ['Up', 'Down', 'Stable']),
        m('Recent', 'Latest movement', ['Today', 'This week', 'Month']),
      ], ['Largest flow', 'Flexible remaining', 'Subscription review', 'Recent change']),
      p('saving', 'Saving', 'What future freedom am I building, and what should happen next?', 'saving-vessels', 'Saving visibly accumulates.', 'Future goals fill separate glass vessels instead of becoming progress cards.', [
        m('Emergency Buffer', 'Protect the present', ['Target', 'Current', 'Next']),
        m('Travel', 'Fund future trips', ['Goal', 'Timeline', 'Contribution']),
        m('Big Purchase', 'Save before spending', ['Target', 'Priority', 'Timeline']),
        m('Automatic Saving', 'Make it easier', ['Payday', 'Transfer', 'Frequency']),
        m('Progress', 'See the fill', ['Current', 'Added', 'Remaining']),
      ], ['Next contribution', 'Emergency buffer', 'Goal closest', 'Automatic transfer']),
      p('plan', 'Plan', 'What financial decisions are coming, and how do they fit together?', 'money-path', 'The money flow extends into a future path.', 'Bills, debt, savings, investing and milestones occupy distance and time.', [
        m('Upcoming Bills', 'What is due', ['This week', 'This month', 'Later']),
        m('Debt', 'Obligations + payoff', ['Balances', 'Minimums', 'Strategy']),
        m('Savings Plan', 'Protect + build', ['Emergency', 'Goals', 'Automatic']),
        m('Investing', 'Long-term direction', ['Retirement', 'Allocation', 'Contribution']),
        m('Milestones', 'What comes next', ['Near term', 'This year', 'Future']),
      ], ['Next obligation', 'Decision point', 'Savings action', 'Long-term milestone']),
    ],
  },
  work: {
    title: 'WORK', subtitle: 'Meaningful work. A balanced you.', icon: BriefcaseBusiness,
    pages: [
      p('today', 'Today', 'What professional work matters now and what supports it?', 'work-desk', 'The work surface is active.', 'Documents, priorities, people and tools live on one dimensional desk.', [
        m('Priorities', 'The few things that matter', ['Now', 'Next', 'Later']),
        m('Schedule', 'Time has shape', ['Meetings', 'Focus', 'Interview']),
        m('Projects', 'Move work forward', ['Active', 'Milestone', 'Progress']),
        m('People', 'Who the work involves', ['Team', 'Manager', 'Contacts']),
        m('Follow-ups', 'Close the loops', ['Messages', 'Feedback', 'Next']),
      ], ['Top priority', 'Next meeting', 'Follow-up', 'Focus window']),
      p('week', 'This Week', 'How does the whole workweek fit together?', 'work-week', 'The desk stretches into five days.', 'Time expands horizontally with meetings, deep work and deadlines embedded into the week.', [
        m('Monday', 'Foundation', ['Priority', 'Meetings', 'Focus']),
        m('Tuesday', 'Build momentum', ['Work', 'Project', 'Follow-up']),
        m('Wednesday', 'Midweek check', ['Review', 'Adjust', 'Deep work']),
        m('Thursday', 'Close loops', ['Meetings', 'Creative', 'Follow-up']),
        m('Friday', 'Finish + prepare', ['Wrap', 'Review', 'Next week']),
      ], ['Heaviest day', 'Focus blocks', 'Deadline', 'Recovery space']),
      p('projects', 'Projects', 'What am I building, and what moves each project forward?', 'project-models', 'Projects become transparent working models.', 'Milestones, references and next actions stack physically like prototypes.', [
        m('Active', 'What is alive now', ['Current', 'Priority', 'Status']),
        m('Milestones', 'Important checkpoints', ['Next', 'Later', 'Done']),
        m('Next Actions', 'Move each project', ['Do', 'Ask', 'Schedule']),
        m('References', 'Support material', ['Notes', 'Files', 'Ideas']),
        m('Progress', 'What changed', ['This week', 'Blockers', 'Wins']),
      ], ['Project at risk', 'Next milestone', 'Waiting on', 'Recent progress']),
      p('career', 'Career', 'What is my next professional chapter, and what am I doing to reach it?', 'career-stair', 'Career becomes a forward architectural path.', 'Role, applications, interviews and portfolio rise through translucent steps.', [
        m('Current Role', 'Where you are', ['Responsibilities', 'Strengths', 'Growth']),
        m('Opportunities', 'What is available', ['Jobs', 'Leads', 'Ideas']),
        m('Applications', 'Where you applied', ['Submitted', 'Waiting', 'Next']),
        m('Interviews', 'Prepare + follow through', ['Upcoming', 'Prep', 'Follow-up']),
        m('Portfolio', 'Show the work', ['Projects', 'Case studies', 'Updates']),
      ], ['Next interview', 'Application waiting', 'Portfolio gap', 'Opportunity']),
      p('ideas', 'Ideas', 'What professional ideas deserve to be captured before they disappear?', 'idea-cloud', 'Ideas stay lightweight until they become work.', 'Loose notes, sketches and translucent fragments float around an open creative surface.', [
        m('Captured', 'Fresh ideas', ['Today', 'Recent', 'Unsorted']),
        m('Research', 'Things to explore', ['Questions', 'Links', 'References']),
        m('Possibilities', 'Could become projects', ['Product', 'Career', 'Creative']),
        m('Someday', 'Not now, not lost', ['Later', 'Maybe', 'Archive']),
      ], ['Fresh idea', 'Needs research', 'Could become project', 'Someday']),
    ],
  },
  relationships: {
    title: 'RELATIONSHIPS', subtitle: 'People who make life more meaningful.', icon: Users,
    pages: [
      p('people', 'People', 'Who matters in my life, and what context helps me show up well?', 'people-constellation', 'People are the visual center.', 'Human points, shared context and gentle connection lines replace relationship scoring.', [
        m('Close People', 'Actively nurtured', ['Family', 'Friends', 'Partner']),
        m('Recent Contact', 'Who you spoke with', ['Today', 'This week', 'Recent']),
        m('Important Dates', 'Remember what matters', ['Birthdays', 'Anniversaries', 'Plans']),
        m('Follow-ups', 'Things to return to', ['Check in', 'Send', 'Plan']),
        m('Care Notes', 'Private context', ['Preferences', 'Support', 'Ideas']),
      ], ['Who to nurture', 'Upcoming date', 'Promise to keep', 'Recent connection']),
      p('conversations', 'Conversations', 'What conversations are ongoing, unfinished, or worth returning to?', 'conversation-field', 'Conversation stays attached to people.', 'Speech fragments, promises and follow-ups float between human points.', [
        m('Recent', 'What was just said', ['Today', 'This week', 'Recent']),
        m('Return To', 'Things unfinished', ['Question', 'Promise', 'Plan']),
        m('Ask Next', 'Stay curious', ['Life', 'Work', 'Feelings']),
        m('Share', 'Things to send', ['Article', 'Photo', 'Idea']),
      ], ['Conversation to return to', 'Question to ask', 'Something to send', 'Promise']),
      p('memories', 'Memories', 'What moments do I want to keep alive with the people I love?', 'memory-glass', 'Shared memories become physical objects.', 'Photos, places, stories and traditions overlap like keepsakes in glass.', [
        m('Photos', 'Visual memories', ['Recent', 'Favorites', 'People']),
        m('Places', 'Where life happened', ['Trips', 'Restaurants', 'Home']),
        m('Traditions', 'Things repeated together', ['Annual', 'Seasonal', 'Small']),
        m('Stories', 'What you remember', ['Funny', 'Meaningful', 'Milestones']),
        m('Create Memory', 'Keep something new', ['Photo', 'Note', 'Place']),
      ], ['Recent memory', 'Shared place', 'Tradition', 'Moment to save']),
      p('plans', 'Plans', 'When am I spending time with people, and what needs arranging?', 'relationship-orbit', 'Shared time orbits the people involved.', 'Meals, calls, birthdays and trips move around the people instead of becoming event cards.', [
        m('Upcoming', 'Already planned', ['Meals', 'Calls', 'Events']),
        m('Birthdays', 'Celebrate on time', ['Upcoming', 'Gift', 'Plan']),
        m('Check-ins', 'Make time to connect', ['Call', 'Text', 'Visit']),
        m('Trips', 'Shared experiences', ['Idea', 'Plan', 'Booked']),
        m('Host', 'Bring people together', ['Dinner', 'Home', 'Gathering']),
      ], ['Next shared plan', 'Birthday', 'Check-in due', 'Plan needing coordination']),
      p('boundaries', 'Boundaries', 'What helps me stay connected without abandoning my own needs?', 'boundary-field', 'Connection gains protective space.', 'Availability, alone time and communication preferences become visible distance and rings.', [
        m('Availability', 'When you are open', ['Time', 'Energy', 'Notice']),
        m('Communication', 'How you want to connect', ['Text', 'Call', 'Urgent']),
        m('Alone Time', 'Protect recharge', ['Quiet', 'Recovery', 'No plans']),
        m('Yes / No', 'Decide intentionally', ['Accept', 'Decline', 'Maybe later']),
        m('Care for Self', 'Boundaries support connection', ['Rest', 'Space', 'Needs']),
      ], ['Availability', 'Need for space', 'Communication preference', 'Recovery']),
    ],
  },
  travel: {
    title: 'TRAVEL', subtitle: 'Farther you. A kinder, wider world.', icon: Plane,
    pages: [
      p('travel', 'Travel', 'Where am I going, what needs to happen before I leave, and what do I want to remember?', 'travel-landscape', 'The journey is one continuous landscape.', 'Dreaming, deciding, booking, preparing, traveling and remembering share one horizon.', [
        m('Dreaming', 'Ideas for next chapter', ['Destinations', 'Saved places', 'Inspiration']),
        m('Deciding', 'Compare + align', ['Timing', 'Budget', 'Companions']),
        m('Booking', 'Make it real', ['Flights', 'Stay', 'Transport']),
        m('Preparing', 'Get ready lighter', ['Packing', 'Documents', 'Health']),
        m('Traveling', 'Be in the moment', ['Itinerary', 'Map', 'Connectivity']),
        m('Remembering', 'Keep it alive', ['Photos', 'Places', 'Notes']),
      ], ['Next trip', 'Preparation gap', 'Travel day', 'Memory to keep']),
      p('trips', 'Trips', 'What trips are real, what is still an idea, and what happens next?', 'trip-capsules', 'Trips become transparent destination capsules.', 'Upcoming, planning, dream and past journeys each hold their own place and atmosphere.', [
        m('Upcoming', 'Next real journey', ['Dates', 'Place', 'Status']),
        m('Booked', 'Confirmed pieces', ['Flight', 'Stay', 'Transport']),
        m('Planning', 'Taking shape', ['Dates', 'Budget', 'Options']),
        m('Dream Trips', 'Not booked yet', ['Places', 'Seasons', 'Ideas']),
        m('Past', 'Where you have been', ['Trips', 'Photos', 'Notes']),
      ], ['Upcoming trip', 'Booking missing', 'Planning decision', 'Dream destination']),
      p('map', 'Map', 'Where are the places in my life, and how do they connect?', 'travel-map', 'The destination unfolds into geography.', 'Saved places, routes and stops live on a glass terrain table.', [
        m('Saved Places', 'Future possibilities', ['Food', 'Stay', 'Explore']),
        m('Visited', 'Places with memories', ['Trips', 'Photos', 'Notes']),
        m('Upcoming Stops', 'Next itinerary', ['Airport', 'Stay', 'Plans']),
        m('Routes', 'How you move', ['Walk', 'Transit', 'Drive']),
        m('Neighborhoods', 'Explore by area', ['Food', 'Shops', 'Places']),
      ], ['Next stop', 'Saved nearby', 'Route', 'Place connected to memory']),
      p('packing', 'Packing', 'What do I actually need for this trip, and what can stay home?', 'travel-suitcase', 'A transparent suitcase opens in the center.', 'Clothing, beauty, documents, tech and health occupy real packing zones.', [
        m('Clothing', 'Dress for the trip', ['Day', 'Evening', 'Weather']),
        m('Beauty', 'Travel care', ['Skin', 'Hair', 'Makeup']),
        m('Documents', 'Ready to move', ['ID', 'Booking', 'Insurance']),
        m('Tech', 'Charged + packed', ['Phone', 'Chargers', 'Adapters']),
        m('Health + Comfort', 'Take care of yourself', ['Medication', 'Water', 'Comfort']),
      ], ['Still unpacked', 'Document check', 'Weather mismatch', 'Ready to leave']),
      p('memories', 'Memories', 'What do I want to keep from the places I have been?', 'travel-memories', 'The destination becomes floating memory glass.', 'Photos, tickets, notes and places overlap like a physical travel archive.', [
        m('Photos', 'What you saw', ['Favorites', 'People', 'Places']),
        m('Places', 'Where you went', ['Stayed', 'Ate', 'Explored']),
        m('Notes', 'What you noticed', ['Moments', 'Thoughts', 'Details']),
        m('Stories', 'What you tell later', ['Funny', 'Beautiful', 'Unexpected']),
        m('Next Time', 'What you learned', ['Repeat', 'Change', 'Return']),
      ], ['Favorite moment', 'Place to remember', 'Story', 'Next-time note']),
    ],
  },
};

const ROOM_CTA: Record<LifePhysicalRoomId, string> = {
  home: 'Ask about my home', body: 'Ask what my body needs', beauty: 'Ask Glow to get me ready', closet: 'Ask what I should wear', food: 'Ask what I should eat', money: 'Ask about my money', work: 'Ask what matters at work', relationships: 'Ask about my people', travel: 'Ask about this journey',
};

function SceneObject({ motif }: { motif: string }) {
  return (
    <div className={`${styles.sceneObject} ${styles[`motif_${motif}`]}`} aria-hidden="true">
      <div className={styles.objectGlow} />
      <div className={styles.objectShell} />
      <div className={styles.objectA} />
      <div className={styles.objectB} />
      <div className={styles.objectC} />
      <div className={styles.objectD} />
      <div className={styles.objectE} />
      <div className={styles.objectF} />
      <div className={styles.objectG} />
      <div className={styles.objectH} />
      <div className={styles.objectI} />
      <div className={styles.objectJ} />
      <span className={styles.pearlOne} /><span className={styles.pearlTwo} /><span className={styles.pearlThree} />
    </div>
  );
}

function MatterModule({ item, index, Icon }: { item: ModuleSpec; index: number; Icon: LucideIcon }) {
  return (
    <article className={`${styles.module} ${styles[`module_${index + 1}`]}`}>
      <div className={styles.moduleObject}><Icon size={20} strokeWidth={1.25} /></div>
      <div className={styles.moduleText}><strong>{item.title}</strong><small>{item.note}</small><div>{item.detail.slice(0, 4).map((line) => <span key={line}><i />{line}</span>)}</div></div>
    </article>
  );
}

export function LifePhysicalWorld({ room, connectedCount }: { room: LifePhysicalRoomId; connectedCount: number }) {
  const params = useSearchParams();
  const spec = ROOMS[room];
  const requested = params.get('view');
  const page = spec.pages.find((item) => item.slug === requested) ?? spec.pages[0];
  const PageIcon = spec.icon;
  const pages = useMemo(() => spec.pages, [spec.pages]);
  const hasContext = connectedCount > 0;

  return (
    <main className={`${styles.world} ${styles[`room_${room}`]}`} data-glow-room={`life-${room}-${page.slug}`}>
      <div className={styles.worldLightA} aria-hidden="true" /><div className={styles.worldLightB} aria-hidden="true" />
      <section className={styles.frame}>
        <header className={styles.header}>
          <Link href="/life" className={styles.returnAnchor} aria-label="Return to Life"><ArrowLeft size={16} /><span>Life</span><i /></Link>
          <div className={styles.identity}><small>WORLD 3 · LIFE</small><h1>{spec.title}</h1><p>{page.question}</p></div>
          <Link href="/ask-glow" className={styles.glowPresence}><Search size={15} /><span>Ask Glow</span><i /></Link>
        </header>

        <nav className={styles.depthPath} aria-label={`${spec.title} depth`}>
          {pages.map((item) => <Link key={item.slug} href={`/life?room=${room}&view=${item.slug}`} className={item.slug === page.slug ? styles.depthActive : undefined}><i /><span>{item.label}</span></Link>)}
        </nav>

        <div className={styles.roomLayout}>
          <section className={`${styles.scene} ${styles[`scene_${page.motif}`]}`}>
            <div className={styles.causticSweep} aria-hidden="true" />
            <SceneObject motif={page.motif} />
            <div className={styles.heroCopy}><PageIcon size={18} strokeWidth={1.2} /><strong>{page.hero}</strong><p>{page.note}</p></div>
            <div className={styles.moduleField}>{page.modules.slice(0, 6).map((item, index) => <MatterModule key={item.title} item={item} index={index} Icon={PageIcon} />)}</div>
          </section>

          <aside className={styles.intelligence}>
            <section className={styles.intelligenceMain}>
              <span className={styles.eyebrow}>{page.label} intelligence</span>
              <strong>{hasContext ? 'What matters here now' : 'The room is ready'}</strong>
              <p>{hasContext ? 'Glow is using the real information already connected to this part of your life.' : `Your ${page.label.toLowerCase()} architecture stays visible even before you add information.`}</p>
              <div className={styles.signalList}>{page.signals.map((signal) => <span key={signal}><i />{signal}</span>)}</div>
            </section>
            <section className={styles.glowInside}><Sparkles size={15} /><strong>{spec.subtitle}</strong><p>{ROOM_CTA[room]} without leaving this room.</p><Link href="/ask-glow">{ROOM_CTA[room]}</Link></section>
            <section className={styles.continuity}><CheckCircle2 size={14} /><span>{page.label} stays connected to {spec.title.toLowerCase()}</span></section>
          </aside>
        </div>
      </section>
    </main>
  );
}
