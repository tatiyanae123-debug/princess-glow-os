'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  CookingPot,
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
  Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './life-room-architecture.module.css';

export type LifeArchitectureRoomId =
  | 'body'
  | 'beauty'
  | 'closet'
  | 'food'
  | 'home'
  | 'money'
  | 'work'
  | 'relationships'
  | 'travel';

type ModuleSpec = {
  title: string;
  note: string;
  detail: string[];
  href: string;
  icon: LucideIcon;
};

type ViewSpec = {
  slug: string;
  label: string;
  question: string;
  hero: string;
  heroNote: string;
  motif: string;
  modules: ModuleSpec[];
  rail: string[];
};

type RoomSpec = {
  title: string;
  subtitle: string;
  views: ViewSpec[];
};

const m = (title: string, note: string, detail: string[], href: string, icon: LucideIcon): ModuleSpec => ({ title, note, detail, href, icon });
const v = (slug: string, label: string, question: string, hero: string, heroNote: string, motif: string, modules: ModuleSpec[], rail: string[]): ViewSpec => ({ slug, label, question, hero, heroNote, motif, modules, rail });

const ROOMS: Record<LifeArchitectureRoomId, RoomSpec> = {
  home: {
    title: 'HOME', subtitle: 'Your home, a calmer you.',
    views: [
      v('home', 'Home', 'What does my home need and where does everything belong?', 'Home in harmony.', 'The floor plan stays at the center. Rooms, routines, maintenance, inventory, and design orbit the actual space.', 'floorplan', [
        m('Rooms', 'Move through the house itself', ['Living spaces', 'Private rooms', 'Utility spaces'], '/life?room=home&view=rooms', House),
        m('Routines', 'Keep home running smoothly', ['Daily', 'Weekly', 'Monthly'], '/life?room=home&view=routines', ListChecks),
        m('Maintenance', 'Prevent issues early', ['Systems', 'Surfaces', 'Appliances'], '/life?room=home&view=maintenance', Wrench),
        m('Inventory', 'Know what you have', ['Household stock', 'Storage', 'Low stock'], '/life?room=home&view=inventory', PackageCheck),
        m('Design', 'Shape how the home feels', ['Layout', 'Lighting', 'Projects'], '/life?room=home&view=design', Palette),
        m('Today at Home', 'The next physical actions', ['Reset', 'Care', 'Put away'], '/tasks?context=home', CheckCircle2),
      ], ['Rooms', 'Routines', 'Maintenance', 'Inventory', 'Design']),
      v('rooms', 'Rooms', 'Which room needs attention, and what is happening inside it?', 'The house opens room by room.', 'Each room becomes a real place with its own reset, inventory, atmosphere, and next action.', 'rooms', [
        m('Bedroom', 'Rest · reset', ['Bed', 'Clothing', 'Night routine'], '/tasks?context=bedroom', Moon),
        m('Living Room', 'Relax · connect', ['Reset', 'Comfort', 'Gathering'], '/tasks?context=living-room', House),
        m('Kitchen & Dining', 'Nourish · gather', ['Cook', 'Restock', 'Clean'], '/tasks?context=kitchen', CookingPot),
        m('Bathroom', 'Refresh · care', ['Beauty stock', 'Cleaning', 'Linens'], '/tasks?context=bathroom', Droplets),
        m('Workspace', 'Focus · create', ['Desk reset', 'Supplies', 'Projects'], '/tasks?context=workspace', BriefcaseBusiness),
        m('Laundry · Storage · Outdoor', 'Utility spaces', ['Laundry', 'Storage', 'Plants'], '/tasks?context=laundry', WashingMachine),
      ], ['Bedroom', 'Kitchen', 'Living', 'Bathroom', 'Workspace']),
      v('routines', 'Routines', 'What recurring rhythm keeps my home easy to live in?', 'Home runs on rhythm.', 'Daily, weekly, monthly, seasonal, and reset routines become an orbit around the house instead of a checklist wall.', 'orbit', [
        m('Daily', 'Small resets', ['Make bed', 'Kitchen close', 'Put away'], '/routines?context=home', CalendarDays),
        m('Weekly', 'The main reset', ['Laundry', 'Surfaces', 'Floors'], '/routines?context=home', ListChecks),
        m('Monthly', 'Deeper care', ['Declutter', 'Restock', 'Inspect'], '/routines?context=home', PackageCheck),
        m('Seasonal', 'Change with the home', ['Filters', 'Wardrobe', 'Outdoor'], '/routines?context=home', Leaf),
        m('Sunday Reset', 'Bring everything back together', ['Plan', 'Clean', 'Prepare'], '/routines?context=home', Sparkles),
      ], ['Daily', 'Weekly', 'Monthly', 'Seasonal', 'Reset']),
      v('maintenance', 'Maintenance', 'What needs care before it becomes a problem?', 'The utility core comes forward.', 'Maintenance is organized by the physical systems of the home and what is due next.', 'utility', [
        m('Filters & Air', 'Breathe easier', ['HVAC', 'Air filters', 'Vents'], '/maintenance', Leaf),
        m('Appliances', 'Keep essentials working', ['Kitchen', 'Laundry', 'Small appliances'], '/maintenance', Wrench),
        m('Plumbing', 'Water systems', ['Leaks', 'Drains', 'Fixtures'], '/maintenance', Droplets),
        m('Surfaces', 'Protect materials', ['Wood', 'Stone', 'Glass'], '/maintenance', Home),
        m('Safety', 'Quiet checks', ['Detectors', 'Locks', 'Emergency'], '/maintenance', CheckCircle2),
      ], ['Air', 'Appliances', 'Plumbing', 'Surfaces', 'Safety']),
      v('inventory', 'Inventory', 'What do I own, what is running low, and where does it live?', 'The house becomes transparent storage.', 'Inventory is spatial: what exists, where it belongs, how much remains, and what should be replaced.', 'shelves', [
        m('Household', 'Everyday supplies', ['Paper goods', 'Cleaning', 'Laundry'], '/tasks?context=inventory', ShoppingBag),
        m('Low Stock', 'Replace soon', ['Running low', 'Out', 'Subscription'], '/tasks?context=inventory', PackageCheck),
        m('Storage', 'Where things live', ['Bins', 'Shelves', 'Under-bed'], '/tasks?context=storage', Home),
        m('Beauty & Bath', 'Care inventory', ['Skincare', 'Hair', 'Body'], '/beauty', Sparkles),
        m('Food & Pantry', 'Kitchen inventory', ['Pantry', 'Fridge', 'Freezer'], '/life?room=food&view=pantry', Utensils),
      ], ['Owned', 'Low stock', 'Storage', 'Restock', 'Locations']),
      v('design', 'Design', 'How should this home look, feel, and function next?', 'The floor plan turns into a design table.', 'Layout, furniture, lighting, atmosphere, and active projects sit directly on the architecture.', 'drafting', [
        m('Layout', 'Space planning', ['Flow', 'Zones', 'Furniture'], '/notes?context=home-design', Map),
        m('Lighting', 'Shape the atmosphere', ['Ambient', 'Task', 'Accent'], '/notes?context=home-design', Sparkles),
        m('Furniture', 'What belongs where', ['Keep', 'Move', 'Remove'], '/notes?context=home-design', Home),
        m('Mood', 'Materials and feeling', ['Palette', 'Texture', 'References'], '/notes?context=home-design', Palette),
        m('Projects', 'Changes in motion', ['Current', 'Next', 'Someday'], '/projects', BriefcaseBusiness),
      ], ['Layout', 'Lighting', 'Furniture', 'Mood', 'Projects']),
    ],
  },
  body: {
    title: 'BODY', subtitle: 'Listen. Adjust. Be kind.',
    views: [
      v('body', 'Body', 'How is my body today, and what does it need?', 'Your body, in context.', 'A translucent body field holds sleep, movement, hydration, cycle, symptoms, medication, and care around the center.', 'body', [
        m('Sleep', 'Rest · recovery', ['Last night', 'Rhythm', 'Restorative'], '/wellness?view=sleep', Moon),
        m('Energy', 'Capacity today', ['Energy', 'Fatigue', 'Load'], '/life?room=body&view=energy', BatteryCharging),
        m('Movement', 'Strength · mobility', ['Training', 'Walking', 'Mobility'], '/fitness', Dumbbell),
        m('Cycle & Hormones', 'Patterns across time', ['Cycle', 'Hormones', 'Changes'], '/wellness?view=cycle', Activity),
        m('Symptoms', 'Notice what changed', ['Current', 'Pattern', 'Notes'], '/wellness?view=symptoms', HeartPulse),
        m('Nutrition & Hydration', 'Fuel · water', ['Meals', 'Protein', 'Hydration'], '/life?room=food&view=food', Droplets),
      ], ['Sleep', 'Energy', 'Movement', 'Cycle', 'Recovery']),
      v('mind', 'Mind', 'What is my nervous system carrying today?', 'The body field becomes quieter and more internal.', 'Mental load, regulation, focus, rest, and emotional weather gather around a softer neural core.', 'neural', [
        m('Mental Load', 'What feels full', ['Open loops', 'Stress', 'Decisions'], '/brain', Activity),
        m('Mood', 'Emotional weather', ['Check-in', 'Pattern', 'Context'], '/wellness', Heart),
        m('Focus', 'Attention capacity', ['Clarity', 'Distraction', 'Needs'], '/today?room=focus', Target),
        m('Regulation', 'Downshift the system', ['Breathing', 'Grounding', 'Pause'], '/routines?context=wellness', Sparkles),
        m('Rest', 'Protect recovery', ['Quiet', 'Sleep', 'Space'], '/wellness?view=sleep', Moon),
      ], ['Load', 'Mood', 'Focus', 'Regulation', 'Rest']),
      v('energy', 'Energy', 'Where is my energy going, and what can I realistically do?', 'Energy becomes visible as light.', 'Capacity rises and falls through translucent bars, recovery pools, movement, meals, and sleep.', 'energy', [
        m('Current Capacity', 'What is available now', ['Low', 'Steady', 'High'], '/wellness', BatteryCharging),
        m('Sleep Effect', 'What last night changed', ['Duration', 'Quality', 'Timing'], '/wellness?view=sleep', Moon),
        m('Food & Hydration', 'Fuel the system', ['Meal timing', 'Protein', 'Water'], '/life?room=food&view=meals', Utensils),
        m('Movement', 'Spend energy well', ['Walk', 'Train', 'Mobility'], '/fitness', Dumbbell),
        m('Recovery', 'Rebuild capacity', ['Rest', 'Stretch', 'Downshift'], '/life?room=body&view=recovery', HeartPulse),
      ], ['Capacity', 'Sleep', 'Fuel', 'Movement', 'Recovery']),
      v('recovery', 'Recovery', 'What would help my body recover instead of just push through?', 'Recovery becomes a translucent cocoon.', 'Sleep, nourishment, gentle movement, body care, medication, and rest collect into one restorative field.', 'cocoon', [
        m('Sleep', 'Primary recovery', ['Schedule', 'Wind-down', 'Rest'], '/wellness?view=sleep', Moon),
        m('Gentle Movement', 'Restore circulation', ['Walk', 'Stretch', 'Mobility'], '/fitness?view=movement', Activity),
        m('Nourishment', 'Refuel', ['Meals', 'Protein', 'Hydration'], '/life?room=food&view=meals', Utensils),
        m('Medication', 'Stay on schedule', ['Reminders', 'Notes', 'Timing'], '/wellness?view=medication', Pill),
        m('Body Care', 'Do something kind', ['Shower', 'Heat', 'Rest'], '/routines?context=beauty', Heart),
      ], ['Sleep', 'Gentle movement', 'Nourishment', 'Medication', 'Body care']),
    ],
  },
  beauty: {
    title: 'BEAUTY', subtitle: 'Look good. Feel good. Be you.',
    views: [
      v('today', 'Today', 'What helps me feel ready for the life I am actually living today?', 'Your best self today.', 'A glowing vanity holds the full preparation sequence around one mirror.', 'vanity', [
        m('Skin', 'Clear · balanced', ['Cleanse', 'Treat', 'Moisturize'], '/life?room=beauty&view=skin', Sparkles),
        m('Hair', 'Healthy · styled', ['Wash', 'Style', 'Finish'], '/life?room=beauty&view=hair', Sparkles),
        m('Makeup', 'Natural · polished', ['Base', 'Eyes', 'Lips'], '/life?room=beauty&view=makeup', Palette),
        m('Body', 'Smooth · cared for', ['Shower', 'Body care', 'Finish'], '/life?room=beauty&view=body', Heart),
        m('Fragrance', 'The final layer', ['Mood', 'Layering', 'Lasting'], '/life?room=beauty&view=fragrance', Sparkles),
        m('Final Look', 'Bring it together', ['Outfit', 'Hair', 'Makeup'], '/closet?view=outfits', CheckCircle2),
      ], ['Skin', 'Hair', 'Makeup', 'Body', 'Fragrance']),
      v('skin', 'Skin', 'What does my skin need today, and what should I use next?', 'The mirror becomes a skin laboratory.', 'Products, routine order, treatments, sensitivity, and progress sit inside a translucent skincare chamber.', 'serum', [
        m('AM Routine', 'Protect the day', ['Cleanse', 'Treat', 'Moisturize'], '/beauty?studio=skincare', Sparkles),
        m('PM Routine', 'Repair overnight', ['Cleanse', 'Treatment', 'Barrier'], '/beauty?studio=skincare', Moon),
        m('Treatments', 'Targeted care', ['Retinoid', 'Acids', 'Spot care'], '/beauty?studio=skincare', Droplets),
        m('Products', 'What is in rotation', ['Active', 'Backup', 'Low stock'], '/beauty?studio=skincare', PackageCheck),
        m('Progress', 'What is changing', ['Texture', 'Tone', 'Breakouts'], '/beauty/lab', Activity),
      ], ['AM', 'PM', 'Treatments', 'Products', 'Progress']),
      v('hair', 'Hair', 'What does my hair need to stay healthy, styled, and easy to manage?', 'Hair moves like a polished ribbon.', 'Wash timing, moisture, styling, protective care, extensions, and maintenance wrap around the central hair wave.', 'hairwave', [
        m('Wash Day', 'Clean · condition', ['Wash', 'Mask', 'Dry'], '/hair', Droplets),
        m('Style', 'Shape the day', ['Heat', 'Tools', 'Finish'], '/hair', Sparkles),
        m('Treat', 'Protect health', ['Moisture', 'Scalp', 'Strength'], '/hair', Heart),
        m('Extensions', 'Blend · protect', ['Wefts', 'Wigs', 'Maintenance'], '/hair', Shirt),
        m('Next Care', 'What happens next', ['Wash', 'Trim', 'Refresh'], '/tasks?context=hair', CalendarDays),
      ], ['Wash', 'Style', 'Treat', 'Extensions', 'Next care']),
      v('makeup', 'Makeup', 'What makeup fits the plan, the effort level, and how I want to feel?', 'The vanity unfolds into a luminous palette.', 'Complexion, eyes, lips, tools, looks, and wear time become physical wells of color and light.', 'palette', [
        m('Complexion', 'Base · concealer', ['Prep', 'Base', 'Set'], '/beauty?studio=makeup', Palette),
        m('Eyes', 'Shape · definition', ['Brows', 'Shadow', 'Mascara'], '/beauty?studio=makeup', Sparkles),
        m('Lips', 'Color · finish', ['Liner', 'Color', 'Gloss'], '/beauty?studio=makeup', Heart),
        m('Looks', 'Saved combinations', ['Everyday', 'Work', 'Evening'], '/beauty?studio=makeup', Camera),
        m('Tools', 'Brushes · prep', ['Clean', 'Ready', 'Replace'], '/tasks?context=makeup', PackageCheck),
      ], ['Complexion', 'Eyes', 'Lips', 'Looks', 'Tools']),
      v('body', 'Body', 'What body-care sequence helps me feel fresh, comfortable, and put together?', 'A soft bath chamber replaces the vanity.', 'Shower, exfoliation, moisture, deodorant, fragrance prep, and grooming sit inside one spa-like field.', 'bath', [
        m('Shower', 'Clean · refresh', ['Wash', 'Rinse', 'Reset'], '/routines?context=beauty', Droplets),
        m('Exfoliation', 'Smooth intentionally', ['Body', 'Hands', 'Feet'], '/routines?context=beauty', Sparkles),
        m('Moisture', 'Seal in comfort', ['Lotion', 'Oil', 'Hands'], '/routines?context=beauty', Heart),
        m('Grooming', 'Maintenance', ['Shave', 'Nails', 'Details'], '/tasks?context=beauty', ListChecks),
        m('Finish', 'Ready to dress', ['Deodorant', 'Fragrance', 'Clothes'], '/life?room=closet&view=outfits', Shirt),
      ], ['Shower', 'Exfoliate', 'Moisturize', 'Groom', 'Finish']),
      v('fragrance', 'Fragrance', 'What scent belongs to this mood, weather, plan, and version of me?', 'A perfume vessel becomes the center object.', 'Fragrance families, layering, occasion, longevity, and favorites float like translucent scent notes.', 'perfume', [
        m('Today’s Scent', 'Match the day', ['Mood', 'Weather', 'Plan'], '/beauty', Sparkles),
        m('Families', 'Know your language', ['Floral', 'Woody', 'Fresh'], '/notes?context=fragrance', Leaf),
        m('Layering', 'Build the scent', ['Body', 'Fragrance', 'Touch-up'], '/notes?context=fragrance', Droplets),
        m('Favorites', 'Repeat what works', ['Daily', 'Evening', 'Seasonal'], '/notes?context=fragrance', Heart),
        m('Collection', 'What you own', ['Full size', 'Travel', 'Samples'], '/notes?context=fragrance', PackageCheck),
      ], ['Today', 'Families', 'Layering', 'Favorites', 'Collection']),
    ],
  },
  closet: {
    title: 'CLOSET', subtitle: 'Wear your life, intentionally.',
    views: [
      v('wardrobe', 'Wardrobe', 'What do I own and what is available to me right now?', 'Your wardrobe becomes a transparent installation.', 'Clothes hang inside physical bays instead of appearing as generic product cards.', 'wardrobe', [
        m('Tops', 'Upper-body pieces', ['Everyday', 'Dressy', 'Layering'], '/closet', Shirt),
        m('Bottoms', 'Pants · skirts', ['Fit', 'Rise', 'Silhouette'], '/closet', Shirt),
        m('Dresses', 'One-piece looks', ['Day', 'Evening', 'Event'], '/closet', Sparkles),
        m('Outerwear', 'Layers', ['Jackets', 'Coats', 'Cardigans'], '/closet', Shirt),
        m('Shoes & Accessories', 'Finish the look', ['Shoes', 'Bags', 'Jewelry'], '/closet', ShoppingBag),
      ], ['Categories', 'Fit', 'Care', 'Availability', 'Use']),
      v('outfits', 'Outfits', 'What complete look works for my real day?', 'The wardrobe turns into a styling rail.', 'Full looks move together as outfits, with fit, comfort, weather, and alternatives built into the composition.', 'lookrail', [
        m('Today’s Pick', 'The strongest match', ['Top', 'Bottom', 'Shoes'], '/closet?view=outfits', Sparkles),
        m('Alternatives', 'Same intention, different pieces', ['Easy', 'Polished', 'Layered'], '/closet?view=outfits', Shirt),
        m('Fit Notes', 'What works on your body', ['Length', 'Waist', 'Proportion'], '/notes?context=closet', NotebookText),
        m('Accessories', 'Finish without overdoing it', ['Bag', 'Jewelry', 'Shoes'], '/closet', Gift),
        m('Care Check', 'Is it ready to wear?', ['Clean', 'Steam', 'Repair'], '/tasks?context=closet', WashingMachine),
      ], ['Match', 'Fit', 'Comfort', 'Weather', 'Care']),
      v('occasions', 'Occasions', 'What should I wear for the things actually on my calendar?', 'Events become translucent dressing portals.', 'Work, social, date, travel, interview, and special-event looks arrange around calendar moments.', 'portals', [
        m('Work', 'Polished · appropriate', ['Shift', 'Meeting', 'Interview'], '/calendar', BriefcaseBusiness),
        m('Social', 'Relaxed · intentional', ['Dinner', 'Friends', 'Weekend'], '/calendar', Users),
        m('Date', 'Feel like yourself', ['Dinner', 'Activity', 'Evening'], '/calendar', Heart),
        m('Travel', 'Comfort + destination', ['Airport', 'Day', 'Dinner'], '/life?room=travel&view=trips', Plane),
        m('Special Events', 'Dress with purpose', ['Birthday', 'Wedding', 'Party'], '/calendar', Sparkles),
      ], ['Work', 'Social', 'Date', 'Travel', 'Event']),
      v('favorites', 'Favorites', 'Which pieces and combinations keep proving themselves?', 'Favorites float forward like jewelry in glass.', 'Best pieces, best looks, best fits, and repeat combinations become the bright center of the closet.', 'favorites', [
        m('Favorite Pieces', 'The reliable ones', ['Tops', 'Bottoms', 'Outerwear'], '/closet?view=favorites', Heart),
        m('Favorite Looks', 'Whole outfits', ['Casual', 'Work', 'Evening'], '/closet?view=favorites', Sparkles),
        m('Best Fit', 'Pieces that sit right', ['Waist', 'Length', 'Shape'], '/notes?context=closet', Shirt),
        m('Most Worn', 'What earns its place', ['Repeat', 'Versatile', 'Easy'], '/closet?view=recent', CalendarDays),
      ], ['Pieces', 'Looks', 'Fit', 'Repeat', 'Versatility']),
      v('history', 'History', 'What have I actually worn, repeated, ignored, and loved?', 'The closet becomes a luminous wear timeline.', 'Recent outfits, frequency, seasons, fit notes, and care history flow across time.', 'timeline', [
        m('Recent Outfits', 'Latest looks', ['Today', 'This week', 'This month'], '/closet?view=recent', Camera),
        m('Repeat Winners', 'What keeps working', ['Frequent', 'Easy', 'Loved'], '/closet?view=recent', Heart),
        m('Underused', 'What is disappearing', ['Rarely worn', 'Hard to style', 'Needs care'], '/closet', Shirt),
        m('Care History', 'What has been washed or repaired', ['Laundry', 'Dry clean', 'Alterations'], '/tasks?context=closet', WashingMachine),
        m('Season Shift', 'What changes next', ['Store', 'Bring forward', 'Replace'], '/closet', CalendarDays),
      ], ['Recent', 'Repeat', 'Underused', 'Care', 'Season']),
    ],
  },
  food: {
    title: 'FOOD', subtitle: 'Good food, a calmer you.',
    views: [
      v('food', 'Food', 'What should I eat, prepare, use, and shop for next?', 'Food becomes a living kitchen table.', 'Eat Now, Cook, Prepare, Meals, Use Soon, Pantry, and Groceries connect around one central dish.', 'plate', [
        m('Eat Now', 'Ready · delicious', ['Quick', 'Available', 'Fits today'], '/food', Utensils),
        m('Meals', 'The day of food', ['Breakfast', 'Lunch', 'Dinner'], '/life?room=food&view=meals', CalendarDays),
        m('Recipes', 'Cook with guidance', ['Saved', 'Favorites', 'New'], '/life?room=food&view=recipes', BookOpen),
        m('Pantry', 'Use what you have', ['Fridge', 'Freezer', 'Pantry'], '/life?room=food&view=pantry', PackageCheck),
        m('Groceries', 'Restock intentionally', ['Need', 'Soon', 'Preferred'], '/life?room=food&view=groceries', ShoppingBag),
      ], ['Eat now', 'Meals', 'Use soon', 'Stock', 'Groceries']),
      v('meals', 'Meals', 'How does food fit across my actual day?', 'The central plate becomes a day clock.', 'Breakfast, lunch, dinner, snacks, timing, and preparation orbit the hours instead of becoming a spreadsheet.', 'mealclock', [
        m('Breakfast', 'Start nourished', ['Protein', 'Fiber', 'Hydration'], '/food', Utensils),
        m('Lunch', 'Keep energy steady', ['Main', 'Produce', 'Drink'], '/food', Utensils),
        m('Dinner', 'End the day well', ['Main', 'Side', 'Prep'], '/food', CookingPot),
        m('Snacks', 'Useful between meals', ['Protein', 'Fruit', 'Easy'], '/food', Leaf),
        m('Prep', 'Make tomorrow easier', ['Chop', 'Cook', 'Portion'], '/routines?context=food', ListChecks),
      ], ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Prep']),
      v('recipes', 'Recipes', 'What do I know how to make, and what should I cook next?', 'Recipes unfold like transparent pages around the meal.', 'Saved dishes, ingredients, steps, timing, favorites, and things to try form a tactile recipe library.', 'recipe', [
        m('Saved', 'Your collection', ['Breakfast', 'Lunch', 'Dinner'], '/food?view=recipes', BookOpen),
        m('Favorites', 'Reliable winners', ['Fast', 'High protein', 'Comfort'], '/food?view=recipes', Heart),
        m('To Try', 'Future meals', ['New', 'Seasonal', 'Inspired'], '/food?view=recipes', Sparkles),
        m('Ingredients', 'What each recipe needs', ['On hand', 'Missing', 'Optional'], '/food?view=groceries', ShoppingBag),
        m('Cooking Flow', 'Step by step', ['Prep', 'Cook', 'Finish'], '/food?view=recipes', CookingPot),
      ], ['Saved', 'Favorites', 'To try', 'Ingredients', 'Steps']),
      v('pantry', 'Pantry', 'What food is actually in my home right now?', 'Storage becomes a glowing pantry wall.', 'Fridge, freezer, pantry, use-soon items, staples, and expiry timing occupy physical shelves.', 'pantry', [
        m('Fridge', 'Fresh + ready', ['Produce', 'Dairy', 'Prepared'], '/food?view=groceries', PackageCheck),
        m('Freezer', 'Longer-term stock', ['Protein', 'Meals', 'Frozen'], '/food?view=groceries', Droplets),
        m('Pantry', 'Shelf stable', ['Grains', 'Cans', 'Snacks'], '/food?view=groceries', ShoppingBag),
        m('Use Soon', 'Reduce waste', ['Fresh', 'Opened', 'Expiring'], '/food?view=groceries', Leaf),
        m('Staples', 'Never be without', ['Breakfast', 'Cooking', 'Snacks'], '/food?view=groceries', CheckCircle2),
      ], ['Fridge', 'Freezer', 'Pantry', 'Use soon', 'Staples']),
      v('groceries', 'Groceries', 'What do I actually need to buy, and what can wait?', 'The pantry pours into a transparent market basket.', 'Needed items, low stock, stores, budget context, and planned meals connect before anything goes on the list.', 'basket', [
        m('Need Now', 'Missing essentials', ['Food', 'Home', 'Beauty'], '/food?view=groceries', ShoppingBag),
        m('Low Stock', 'Replace soon', ['Almost out', 'Backup', 'Staples'], '/food?view=groceries', PackageCheck),
        m('For Meals', 'Connected to recipes', ['This week', 'Prep', 'Special'], '/food?view=recipes', Utensils),
        m('Stores', 'Where to buy it', ['Preferred', 'Nearby', 'Specialty'], '/notes?context=groceries', Map),
        m('Budget Context', 'Keep the list grounded', ['Planned', 'Flexible', 'Skip'], '/finance?view=budget', CircleDollarSign),
      ], ['Need now', 'Low stock', 'Meals', 'Stores', 'Budget']),
    ],
  },
  money: {
    title: 'MONEY', subtitle: 'A calmer, clearer relationship with your money.',
    views: [
      v('money', 'Money', 'What is available, committed, upcoming, and building my future?', 'Money moves as one liquid system.', 'Available, committed, upcoming, saving, spending, and financial attention flow through one transparent field.', 'moneyflow', [
        m('Accounts', 'Where money lives', ['Checking', 'Savings', 'Other'], '/life?room=money&view=accounts', WalletCards),
        m('Spending', 'What is moving out', ['Flexible', 'Committed', 'Patterns'], '/life?room=money&view=spending', ReceiptText),
        m('Saving', 'Build future freedom', ['Buffer', 'Goals', 'Contributions'], '/life?room=money&view=saving', CircleDollarSign),
        m('Plan', 'What happens next', ['Bills', 'Milestones', 'Decisions'], '/life?room=money&view=plan', Target),
        m('Financial Attention', 'What deserves a decision', ['Review', 'Adjust', 'Next'], '/finance/brain', Sparkles),
      ], ['Accounts', 'Spending', 'Saving', 'Upcoming', 'Plan']),
      v('accounts', 'Accounts', 'Where is my money, and what is each account for?', 'Accounts become transparent reservoirs.', 'Checking, savings, cash, credit, and long-term containers sit as separate vessels in one financial landscape.', 'reservoirs', [
        m('Checking', 'Everyday flow', ['Income', 'Bills', 'Spending'], '/finance', WalletCards),
        m('Savings', 'Protected money', ['Emergency', 'Goals', 'Short term'], '/finance?view=saving', CircleDollarSign),
        m('Credit', 'Borrowed capacity', ['Balance', 'Due', 'Utilization'], '/finance?view=debt', ReceiptText),
        m('Cash & Other', 'Outside primary accounts', ['Cash', 'Wallets', 'Other'], '/finance', WalletCards),
        m('Transfers', 'Move money intentionally', ['To savings', 'To bills', 'Between accounts'], '/finance', ArrowRight),
      ], ['Checking', 'Savings', 'Credit', 'Other', 'Transfers']),
      v('spending', 'Spending', 'Where is money going, and what is flexible versus committed?', 'Spending becomes flowing channels.', 'Essentials, flexible spending, subscriptions, categories, and recent movement appear as streams instead of a pie chart wall.', 'streams', [
        m('Committed', 'Bills + essentials', ['Housing', 'Phone', 'Insurance'], '/finance?view=budget', ReceiptText),
        m('Flexible', 'Choices this month', ['Food', 'Shopping', 'Social'], '/finance?view=budget', ShoppingBag),
        m('Subscriptions', 'Recurring small flows', ['Active', 'Review', 'Cancel'], '/finance?view=bills', CalendarDays),
        m('Patterns', 'What changed', ['Up', 'Down', 'Stable'], '/finance', Activity),
        m('Recent', 'Latest movement', ['Today', 'This week', 'This month'], '/finance', WalletCards),
      ], ['Committed', 'Flexible', 'Subscriptions', 'Patterns', 'Recent']),
      v('saving', 'Saving', 'What future freedom am I building, and what should happen next?', 'Saving becomes a glass reservoir filling over time.', 'Emergency buffer, near-term goals, travel, major purchases, and contributions collect into separate future vessels.', 'savings', [
        m('Emergency Buffer', 'Protect the present', ['Target', 'Current', 'Next'], '/finance?view=saving', CircleDollarSign),
        m('Travel', 'Fund future trips', ['Goal', 'Timeline', 'Contribution'], '/finance?view=saving', Plane),
        m('Big Purchase', 'Save before spending', ['Target', 'Priority', 'Timeline'], '/finance?view=saving', Target),
        m('Automatic Saving', 'Make it easier', ['Payday', 'Transfer', 'Frequency'], '/finance?view=saving', CalendarDays),
        m('Progress', 'See the fill, not a score', ['Current', 'Added', 'Remaining'], '/finance?view=saving', Activity),
      ], ['Emergency', 'Travel', 'Goals', 'Automatic', 'Progress']),
      v('plan', 'Plan', 'What financial decisions are coming, and how do they fit together?', 'The money flow becomes a future path.', 'Bills, debt, savings, investing, goals, and milestones align across time without inventing numbers.', 'path', [
        m('Upcoming Bills', 'What is due', ['This week', 'This month', 'Later'], '/finance?view=bills', CalendarDays),
        m('Debt', 'Obligations + payoff', ['Balances', 'Minimums', 'Strategy'], '/finance?view=debt', ReceiptText),
        m('Savings Plan', 'Protect and build', ['Emergency', 'Goals', 'Automatic'], '/finance?view=saving', CircleDollarSign),
        m('Investing', 'Long-term direction', ['Retirement', 'Allocation', 'Contributions'], '/finance/brain', Activity),
        m('Milestones', 'What comes next', ['Near term', 'This year', 'Future'], '/finance/brain', Target),
      ], ['Bills', 'Debt', 'Saving', 'Investing', 'Milestones']),
    ],
  },
  work: {
    title: 'WORK', subtitle: 'Meaningful work. A balanced you.',
    views: [
      v('today', 'Today', 'What professional work matters now and what supports it?', 'Today’s priorities sit at the center.', 'Schedule, people, projects, energy, career, and follow-ups support the work that deserves attention now.', 'desk', [
        m('Priorities', 'The few things that matter', ['Now', 'Next', 'Later'], '/today?room=focus', Target),
        m('Schedule', 'Time has shape', ['Meetings', 'Focus', 'Interview'], '/calendar', CalendarDays),
        m('Projects', 'Move work forward', ['Active', 'Milestone', 'Progress'], '/life?room=work&view=projects', BriefcaseBusiness),
        m('People', 'Who the work involves', ['Team', 'Manager', 'Contacts'], '/today?room=people', Users),
        m('Follow-ups', 'Close the loops', ['Messages', 'Feedback', 'Next actions'], '/tasks?context=work', CheckCircle2),
      ], ['Priorities', 'Schedule', 'Projects', 'People', 'Follow-ups']),
      v('week', 'This Week', 'How does the whole workweek fit together?', 'The desk stretches into a five-day timeline.', 'Deadlines, meetings, focus blocks, shifts, interviews, and recovery move across the week as one surface.', 'week', [
        m('Monday', 'Foundation', ['Priority', 'Meetings', 'Focus'], '/calendar', CalendarDays),
        m('Tuesday', 'Build momentum', ['Work', 'Project', 'Follow-up'], '/calendar', CalendarDays),
        m('Wednesday', 'Midweek check', ['Review', 'Adjust', 'Deep work'], '/calendar', CalendarDays),
        m('Thursday', 'Close key loops', ['Meetings', 'Creative', 'Follow-up'], '/calendar', CalendarDays),
        m('Friday', 'Finish + prepare', ['Wrap', 'Review', 'Next week'], '/calendar', CalendarDays),
      ], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
      v('projects', 'Projects', 'What am I building, and what moves each project forward?', 'Projects stack like transparent working models.', 'Active projects, milestones, next actions, references, and progress become physical layers on the desk.', 'projects', [
        m('Active', 'What is alive now', ['Current', 'Priority', 'Status'], '/projects', BriefcaseBusiness),
        m('Milestones', 'Important checkpoints', ['Next', 'Later', 'Done'], '/projects', Target),
        m('Next Actions', 'Move each project', ['Do', 'Ask', 'Schedule'], '/tasks?context=work', CheckCircle2),
        m('References', 'What supports the work', ['Notes', 'Files', 'Ideas'], '/notes?context=work', NotebookText),
        m('Progress', 'What changed', ['This week', 'Blockers', 'Wins'], '/projects', Activity),
      ], ['Active', 'Milestones', 'Next', 'References', 'Progress']),
      v('career', 'Career', 'What is my next professional chapter, and what am I doing to reach it?', 'The work surface becomes a translucent staircase.', 'Current role, opportunities, applications, interviews, portfolio, and long-term direction rise toward the next level.', 'career', [
        m('Current Role', 'What you are doing now', ['Responsibilities', 'Strengths', 'Growth'], '/work', BriefcaseBusiness),
        m('Opportunities', 'What is available', ['Jobs', 'Leads', 'Ideas'], '/work?view=career', Compass),
        m('Applications', 'Where you applied', ['Submitted', 'Waiting', 'Next'], '/tasks?context=career', ListChecks),
        m('Interviews', 'Prepare + follow through', ['Upcoming', 'Prep', 'Follow-up'], '/calendar', CalendarDays),
        m('Portfolio', 'Show the work', ['Projects', 'Case studies', 'Updates'], '/projects', Palette),
      ], ['Role', 'Opportunities', 'Applications', 'Interviews', 'Portfolio']),
      v('ideas', 'Ideas', 'What professional ideas deserve to be captured before they disappear?', 'Loose ideas float as translucent notes around the desk.', 'Ideas, possibilities, research, questions, and someday work stay lightweight until they become projects.', 'ideas', [
        m('Captured', 'Fresh ideas', ['Today', 'Recent', 'Unsorted'], '/notes?context=work', NotebookText),
        m('Research', 'Things to explore', ['Questions', 'Links', 'References'], '/notes?context=work', Search),
        m('Possibilities', 'Could become projects', ['Product', 'Career', 'Creative'], '/notes?context=work', Sparkles),
        m('Someday', 'Not now, not lost', ['Later', 'Maybe', 'Archive'], '/notes?context=work', Compass),
      ], ['Captured', 'Research', 'Possibilities', 'Someday']),
    ],
  },
  relationships: {
    title: 'RELATIONSHIPS', subtitle: 'How am I caring for the people in my life?',
    views: [
      v('people', 'People', 'Who matters in my life, and what context helps me show up well?', 'People become a warm constellation.', 'Family, friends, partners, mentors, and close contacts gather as connected human points, never scored by worth.', 'constellation', [
        m('Close People', 'The ones you actively nurture', ['Family', 'Friends', 'Partner'], '/today?room=people', Users),
        m('Recent Contact', 'Who you have spoken with', ['Today', 'This week', 'Recent'], '/today?room=people', MessageCircleMore),
        m('Important Dates', 'Remember what matters', ['Birthdays', 'Anniversaries', 'Plans'], '/calendar', CalendarDays),
        m('Follow-ups', 'Things to return to', ['Check in', 'Send', 'Plan'], '/tasks?context=relationships', CheckCircle2),
        m('Care Notes', 'Private context', ['Preferences', 'Support', 'Ideas'], '/notes?context=relationships', Heart),
      ], ['People', 'Recent contact', 'Dates', 'Follow-ups', 'Care']),
      v('conversations', 'Conversations', 'What conversations are ongoing, unfinished, or worth returning to?', 'Conversation bubbles drift through the connection field.', 'Recent talks, things to ask, promises, ideas, and follow-ups remain connected to the person they belong to.', 'conversation', [
        m('Recent', 'What was just said', ['Today', 'This week', 'Recent'], '/notes?context=relationships', MessageCircleMore),
        m('Return To', 'Things not finished', ['Question', 'Promise', 'Plan'], '/tasks?context=relationships', CheckCircle2),
        m('Ask Next', 'Stay curious', ['Life', 'Work', 'Feelings'], '/notes?context=relationships', Heart),
        m('Share', 'Things to send', ['Article', 'Photo', 'Idea'], '/tasks?context=relationships', Gift),
      ], ['Recent', 'Return to', 'Ask next', 'Share']),
      v('memories', 'Memories', 'What moments do I want to keep alive with the people I love?', 'Shared memories become floating photo glass.', 'Photos, places, traditions, trips, and meaningful moments sit around the relationship core.', 'memoryglass', [
        m('Photos', 'Visual memories', ['Recent', 'Favorites', 'People'], '/timeline', Camera),
        m('Places', 'Where life happened', ['Trips', 'Restaurants', 'Home'], '/timeline', Map),
        m('Traditions', 'Things you repeat together', ['Annual', 'Seasonal', 'Small'], '/notes?context=relationships', Heart),
        m('Stories', 'What you remember', ['Funny', 'Meaningful', 'Milestones'], '/notes?context=relationships', NotebookText),
        m('Create Memory', 'Add something new', ['Photo', 'Note', 'Place'], '/timeline', Sparkles),
      ], ['Photos', 'Places', 'Traditions', 'Stories', 'Create']),
      v('plans', 'Plans', 'When am I spending time with people, and what needs arranging?', 'Plans become a warm calendar orbit.', 'Meals, calls, birthdays, trips, celebrations, and simple check-ins move around the people they involve.', 'plans', [
        m('Upcoming', 'What is already planned', ['Meals', 'Calls', 'Events'], '/calendar', CalendarDays),
        m('Birthdays', 'Celebrate on time', ['Upcoming', 'Gift', 'Plan'], '/calendar', Gift),
        m('Check-ins', 'Make time to connect', ['Call', 'Text', 'Visit'], '/tasks?context=relationships', Heart),
        m('Trips', 'Shared experiences', ['Idea', 'Plan', 'Booked'], '/life?room=travel&view=trips', Plane),
        m('Host', 'Bring people together', ['Dinner', 'Home', 'Gathering'], '/calendar', Home),
      ], ['Upcoming', 'Birthdays', 'Check-ins', 'Trips', 'Host']),
      v('boundaries', 'Boundaries', 'What helps me stay connected without abandoning my own needs?', 'A protective translucent ring forms around the connection field.', 'Availability, communication preferences, alone time, yes/no decisions, and recovery space become visible boundaries.', 'boundaries', [
        m('Availability', 'When you are open', ['Time', 'Energy', 'Notice'], '/rules', CalendarDays),
        m('Communication', 'How you want to connect', ['Text', 'Call', 'Urgent'], '/rules', MessageCircleMore),
        m('Alone Time', 'Protect recharge', ['Quiet', 'Recovery', 'No plans'], '/rules', Moon),
        m('Yes / No', 'Decide intentionally', ['Accept', 'Decline', 'Maybe later'], '/rules', CheckCircle2),
        m('Care for Self', 'Boundaries support connection', ['Rest', 'Space', 'Needs'], '/wellness', Heart),
      ], ['Availability', 'Communication', 'Alone time', 'Yes / No', 'Self care']),
    ],
  },
  travel: {
    title: 'TRAVEL', subtitle: 'Farther you. A kinder, wider world.',
    views: [
      v('travel', 'Travel', 'Where am I going, what needs to happen before I leave, and what do I want to remember?', 'The journey becomes one continuous landscape.', 'Dreaming, deciding, booking, preparing, traveling, and remembering connect around the destination instead of becoming separate apps.', 'destination', [
        m('Dreaming', 'Ideas for your next chapter', ['Destinations', 'Saved places', 'Inspiration'], '/today?room=places', Compass),
        m('Trips', 'Planned journeys', ['Upcoming', 'Past', 'Ideas'], '/life?room=travel&view=trips', Plane),
        m('Map', 'See the world spatially', ['Saved', 'Visited', 'Next'], '/life?room=travel&view=map', Map),
        m('Packing', 'Get ready lighter', ['List', 'Essentials', 'Documents'], '/life?room=travel&view=packing', Luggage),
        m('Memories', 'Keep the journey alive', ['Photos', 'Places', 'Notes'], '/life?room=travel&view=memories', Camera),
      ], ['Dreaming', 'Trips', 'Map', 'Packing', 'Memories']),
      v('trips', 'Trips', 'What trips are real, what is still an idea, and what happens next?', 'Trips become transparent journey capsules.', 'Upcoming, booked, tentative, past, and dream trips each keep timing, people, places, and next actions together.', 'trips', [
        m('Upcoming', 'Next real journeys', ['Dates', 'Place', 'Status'], '/calendar', Plane),
        m('Booked', 'Confirmed pieces', ['Flight', 'Stay', 'Transport'], '/calendar', CheckCircle2),
        m('Planning', 'Still taking shape', ['Dates', 'Budget', 'Options'], '/notes?context=travel', Compass),
        m('Dream Trips', 'Not booked yet', ['Places', 'Seasons', 'Ideas'], '/today?room=places', Sparkles),
        m('Past', 'Where you have been', ['Trips', 'Photos', 'Notes'], '/timeline', Camera),
      ], ['Upcoming', 'Booked', 'Planning', 'Dream', 'Past']),
      v('map', 'Map', 'Where are the places in my life, and how do they connect?', 'The destination turns into a glass map table.', 'Saved places, visited places, upcoming stops, routes, and neighborhood clusters live spatially.', 'maptable', [
        m('Saved Places', 'Future possibilities', ['Food', 'Stay', 'Explore'], '/today?room=places', Map),
        m('Visited', 'Places with memories', ['Trips', 'Photos', 'Notes'], '/timeline', Camera),
        m('Upcoming Stops', 'Next itinerary', ['Airport', 'Stay', 'Plans'], '/calendar', Plane),
        m('Routes', 'How you move through a trip', ['Walk', 'Transit', 'Drive'], '/today?room=places', Compass),
        m('Neighborhoods', 'Explore by area', ['Food', 'Shops', 'Places'], '/today?room=places', Map),
      ], ['Saved', 'Visited', 'Upcoming', 'Routes', 'Areas']),
      v('packing', 'Packing', 'What do I actually need for this trip, and what can stay home?', 'A transparent suitcase opens in the center.', 'Clothing, beauty, documents, tech, health, and trip-specific essentials fit into physical packing zones.', 'suitcase', [
        m('Clothing', 'Dress for the trip', ['Day', 'Evening', 'Weather'], '/life?room=closet&view=outfits', Shirt),
        m('Beauty', 'Travel care', ['Skin', 'Hair', 'Makeup'], '/life?room=beauty&view=today', Sparkles),
        m('Documents', 'Ready to move', ['ID', 'Booking', 'Insurance'], '/tasks?context=travel', NotebookText),
        m('Tech', 'Charged + packed', ['Phone', 'Chargers', 'Adapters'], '/tasks?context=travel', BatteryCharging),
        m('Health & Comfort', 'Take care of yourself', ['Medication', 'Water', 'Comfort'], '/tasks?context=travel', HeartPulse),
      ], ['Clothing', 'Beauty', 'Documents', 'Tech', 'Health']),
      v('memories', 'Memories', 'What do I want to keep from the places I have been?', 'The destination dissolves into floating memory glass.', 'Photos, places, notes, stories, objects, and reflections gather after the trip without losing the journey they came from.', 'travelmemories', [
        m('Photos', 'What you saw', ['Favorites', 'People', 'Places'], '/timeline', Camera),
        m('Places', 'Where you went', ['Stayed', 'Ate', 'Explored'], '/timeline', Map),
        m('Notes', 'What you noticed', ['Moments', 'Thoughts', 'Details'], '/notes?context=travel', NotebookText),
        m('Stories', 'What you tell later', ['Funny', 'Beautiful', 'Unexpected'], '/notes?context=travel', Heart),
        m('Next Time', 'What you learned', ['Repeat', 'Change', 'Return'], '/notes?context=travel', Compass),
      ], ['Photos', 'Places', 'Notes', 'Stories', 'Next time']),
    ],
  },
};

const DESIGN_WIDTH = 1180;
const DESIGN_HEIGHT = 710;

function ScaledArchitecture({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setScale(Math.min(1, Math.max(.58, node.clientWidth / DESIGN_WIDTH)));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={styles.viewport}><div className={styles.sizer} style={{ width: DESIGN_WIDTH * scale, height: DESIGN_HEIGHT * scale }}><div className={styles.stage} style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT, transform: `scale(${scale})` }}>{children}</div></div></div>;
}

function Artifact({ room, motif, hero, note }: { room: LifeArchitectureRoomId; motif: string; hero: string; note: string }) {
  return (
    <section className={`${styles.artifact} ${styles[`artifact_${room}`]} ${styles[`motif_${motif}`]}`} aria-label={hero}>
      <div className={styles.artifactMatter} aria-hidden="true">
        <span className={styles.coreA} /><span className={styles.coreB} /><span className={styles.coreC} />
        <i className={styles.orbitA} /><i className={styles.orbitB} /><i className={styles.orbitC} />
        <b className={styles.detailA} /><b className={styles.detailB} /><b className={styles.detailC} />
      </div>
      <div className={styles.artifactCopy}><strong>{hero}</strong><p>{note}</p></div>
    </section>
  );
}

function ModulePod({ item, index }: { item: ModuleSpec; index: number }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className={`${styles.modulePod} ${styles[`module_${index + 1}`]}`}>
      <div className={styles.moduleCopy}><strong>{item.title}</strong><small>{item.note}</small><ul>{item.detail.slice(0, 4).map((line) => <li key={line}><span />{line}</li>)}</ul></div>
      <div className={styles.moduleObject} aria-hidden="true"><Icon size={25} strokeWidth={1.25} /><i /><b /></div>
      <ArrowRight className={styles.moduleArrow} size={14} />
    </Link>
  );
}

export function LifeRoomArchitecture({ room, connectedCount }: { room: LifeArchitectureRoomId; connectedCount: number }) {
  const params = useSearchParams();
  const roomSpec = ROOMS[room];
  const requested = params.get('view');
  const viewIndex = Math.max(0, roomSpec.views.findIndex((item) => item.slug === requested));
  const view = roomSpec.views[viewIndex] ?? roomSpec.views[0];
  const prev = roomSpec.views[(viewIndex - 1 + roomSpec.views.length) % roomSpec.views.length];
  const next = roomSpec.views[(viewIndex + 1) % roomSpec.views.length];
  const composition = `composition_${viewIndex % 6}`;

  const tabs = useMemo(() => roomSpec.views, [roomSpec.views]);

  return (
    <main className={`${styles.world} ${styles[`room_${room}`]}`} data-glow-room={`life-${room}-${view.slug}`}>
      <div className={styles.causticA} aria-hidden="true" /><div className={styles.causticB} aria-hidden="true" />
      <section className={styles.frame}>
        <header className={styles.header}>
          <Link href="/life" className={styles.back}><ArrowLeft size={14} /> Back to Life</Link>
          <div className={styles.identity}><small>WORLD 3 · LIFE</small><h1>{roomSpec.title}</h1><p>{view.question}</p></div>
          <Link href="/ask-glow" className={styles.ask}><Search size={14} /><span>Ask Glow…</span><i /></Link>
        </header>

        <nav className={styles.tabs} aria-label={`${roomSpec.title} pages`}>
          {tabs.map((tab) => <Link key={tab.slug} href={`/life?room=${room}&view=${tab.slug}`} className={tab.slug === view.slug ? styles.activeTab : undefined}>{tab.label}</Link>)}
        </nav>

        <ScaledArchitecture>
          <div className={`${styles.architecture} ${styles[composition]}`}>
            <div className={styles.lightField} aria-hidden="true" />
            {view.modules.slice(0, 6).map((item, index) => <ModulePod key={`${view.slug}-${item.title}`} item={item} index={index} />)}
            <Artifact room={room} motif={view.motif} hero={view.hero} note={view.heroNote} />
          </div>
          <aside className={styles.rail}>
            <section className={styles.contextCard}>
              <span className={styles.eyebrow}>{view.label} context</span>
              <div className={styles.connected}><strong>{connectedCount}</strong><small>connected</small><i /></div>
              <p>Glow keeps this page grounded in your connected information. Missing information stays missing instead of being replaced with sample data.</p>
              <div className={styles.signals}>{view.rail.map((label) => <span key={label}><i />{label}</span>)}</div>
            </section>
            <section className={styles.glowCard}><Sparkles size={15} /><strong>{roomSpec.subtitle}</strong><p>Ask Glow from here and this exact room and subpage remain part of the conversation context.</p><Link href="/ask-glow">Ask Glow about {view.label.toLowerCase()} <ArrowRight size={13} /></Link></section>
            <section className={styles.saved}><CheckCircle2 size={13} /> Connected across Glow OS</section>
          </aside>
        </ScaledArchitecture>

        <footer className={styles.footer}>
          <Link href={`/life?room=${room}&view=${prev.slug}`}><ArrowLeft size={13} /> {prev.label}</Link>
          <span className={styles.footerOrb} aria-hidden="true" />
          <Link href={`/life?room=${room}&view=${next.slug}`}>{next.label} <ArrowRight size={13} /></Link>
        </footer>
      </section>
    </main>
  );
}
