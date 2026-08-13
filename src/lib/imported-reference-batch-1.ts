export type ImportedReferenceRoom =
  | 'dashboard'
  | 'calendar'
  | 'routines'
  | 'wellness'
  | 'food'
  | 'beauty'
  | 'hair'
  | 'finance'
  | 'goals';

export type ImportedReferenceSection = {
  title: string;
  items: string[];
};

export type ImportedReference = {
  eyebrow: string;
  title: string;
  subtitle: string;
  tabs?: string[];
  sections: ImportedReferenceSection[];
  designNotes?: string[];
};

export const IMPORTED_REFERENCE_BATCH_1: Record<ImportedReferenceRoom, ImportedReference> = {
  dashboard: {
    eyebrow: 'Imported master architecture',
    title: 'Princess Glow OS master command center',
    subtitle: 'The dashboard is a window into one connected operating system, not a storage page.',
    sections: [
      { title: 'Core architecture', items: [
        'Use one master source of truth for actionable life items instead of duplicating the same task, routine, goal, appointment, or idea across pages.',
        'Core actionable types include tasks, routines, habits, goals, projects, ideas, appointments, reminders, brain dumps, purchases, wishlists, reviews, and references.',
        'Life categories include Beauty, Hair, Fitness, Wellness, Health, Nutrition, Home, Cleaning, Laundry, Money, Content, Work, School, Saint, Relationships, Shopping, Errands, Planning, Personal Growth, Brain Dump, and Glow OS.',
        'Every item should have at minimum Name, Status, Category, and Type. Optional properties include Area, Routine, Project, Goal, Priority, Energy Required, Estimated Time, Frequency, Day, Time Block, Due Date, Next Due, Streak, Progress, Notes, Attachments, Created, Last Edited, and Completed Date.',
      ]},
      { title: 'Dashboard order', items: [
        'Welcome Header → Today’s Focus → Quick Actions → Today’s Schedule → Daily Routines → Priority Tasks → Life Areas → Planning → Projects → Reviews → Archive.',
        'Today’s Focus should show only today’s tasks, due-today items, next three tasks, appointments, today’s workout, and today’s routine.',
        'Quick Actions should stay near the top: New Task, Brain Dump, New Appointment, Shopping Item, Content Idea, Expense, Goal, Project.',
        'Daily routines should expose Morning, Midday, Evening, and Night unfinished steps.',
        'This Week should show upcoming tasks, appointments, Sunday Reset, and Weekly Review, sorted Monday through Sunday.',
      ]},
      { title: 'Life-area windows', items: [
        'Beauty: beauty-only items. Hair: hair-only items. Fitness: workout items. Wellness: mental health, supplements, meditation, hydration.',
        'Nutrition: meal prep, groceries, water, supplements. Home: cleaning, laundry, reset, organization. Money: bills, budget, savings, income, expenses.',
        'Content: Pinterest, Instagram, Amazon, photography, editing. Work: shifts, projects, follow-ups. School: assignments, reading, classes, study sessions.',
        'Saint: walks, food, vet, medicine, playtime. Relationships: calls, family, friends, birthdays.',
      ]},
      { title: 'View rules', items: [
        'Use list view for Today, Morning, Brain Dump, weekly tasks, and appointments.',
        'Use board view for Goals, Projects, Status, and Categories.',
        'Use calendar view for appointments, due dates, weekly planning, and monthly planning.',
        'Use gallery view only when images matter, such as Products, Pinterest, Vision Board, Hair Inspiration, and Beauty Inspiration.',
        'Mobile should prioritize Today, Quick Actions, Morning, This Week, then Beauty, Hair, Fitness, Wellness, Money, Content, Home. No horizontal scrolling.',
        'Nothing is deleted from history. Completed, Cancelled, Skipped, and Archived items remain reviewable.',
      ]},
    ],
    designNotes: ['Calm, uncluttered home-screen feeling', 'Short names and 4–6 key properties on iPhone', 'Priority → time → due-date sorting', 'No copied dashboard data when a linked/filtered source can be used'],
  },
  calendar: {
    eyebrow: 'Imported Calendar reference',
    title: 'Calendar · your time, intentionally designed',
    subtitle: 'A soft editorial week planner with fast switching between time scales.',
    tabs: ['Day', 'Week', 'Month', 'Year', 'Timeline'],
    sections: [
      { title: 'Primary calendar controls', items: ['Today control', 'Previous/next week navigation', 'Add Event action', 'Search', 'Filter/settings', 'Overflow menu', 'Notifications'] },
      { title: 'Reference week', items: ['Week view shown for August 10–16, 2026', 'Columns: Monday Aug 10 through Sunday Aug 16', 'Current/selected date receives a rose/pink visual treatment'] },
      { title: 'Sidebar context', items: ['Mini month calendar', 'Up Next list', 'Upcoming appointment summaries', 'Quick New Event action'] },
    ],
    designNotes: ['Airy cream/blush canvas', 'Elegant serif + script accents', 'Muted green and warm neutral event colors', 'Desktop week grid with no loss of mobile readability'],
  },
  routines: {
    eyebrow: 'Imported Routines & Rituals references',
    title: 'Routines & Rituals',
    subtitle: 'Small rituals, big transformations. Ritualize your life and elevate your everyday.',
    tabs: ['My Rituals', 'Library', 'Custom', 'Templates', 'Adaptive Modes', 'Completed', 'Morning', 'Night', 'Weekly', 'Hair Days', 'Events', 'Everything Shower'],
    sections: [
      { title: 'Daily time windows', items: ['Morning Ritual · 5 AM–10 AM', 'Midday Reset · 10 AM–4 PM', 'Evening Wind-Down · 4 PM–8:30 PM', 'Night Ritual · 8:30 PM–11 PM'] },
      { title: 'Core ritual cards', items: ['Morning Ritual · 5:00–9:30 AM · 11 steps', 'Night Ritual · 8:30–11:00 PM · 9 steps', 'Wash Day Ritual · 2h 15m · 14 steps', 'Everything Shower · 45 min · 12 steps', 'Sunday Reset · 3h 30m · 10 steps'] },
      { title: 'Morning template', items: ['Drink water', 'Make bed', 'Open curtains', 'Morning hygiene', 'Morning skincare', 'Morning hair', 'Supplements', 'Breakfast', 'Check calendar', 'Review priorities'] },
      { title: 'Midday template', items: ['Hydrate', 'Stretch', 'Lunch', 'Check remaining tasks', 'Reset workspace'] },
      { title: 'Evening + night templates', items: ['Dinner', 'Tidy room', 'Prepare tomorrow', 'Review progress', 'Night skincare', 'Brush teeth', 'Hair protection', 'Journal', 'Set alarm', 'Lights out'] },
      { title: 'Weekly ritual logic', items: ['Sunday Reset', 'Monday Foundation', 'Tuesday Fitness', 'Wednesday Wellness', 'Thursday Hair/Creative maintenance', 'Friday Beauty/Soft Life', 'Saturday Deep Clean/Recovery'] },
    ],
    designNotes: ['Warm blush/cream ritual cards', 'Photography-led ritual thumbnails', 'Create Ritual action', 'Quick stats and Ritual of the Day can live in the right rail'],
  },
  wellness: {
    eyebrow: 'Imported Wellness Sanctuary reference',
    title: 'Wellness Sanctuary',
    subtitle: 'Your peace is your power. Check in with yourself, nourish your body, calm your mind, and protect your energy.',
    sections: [
      { title: 'Daily check-in', items: ['Energy rating', 'Stress rating', 'Mood rating', 'Sleep duration', 'Mindset state', 'Check In Now action'] },
      { title: 'Reference state', items: ['Sleep example: 7h 21m', 'Mindset example: Calm & Focused', 'Wellness card examples can show Energy High, Stress Low, Mood Good, Sleep 7h 32m, Hydration 6/8'] },
      { title: 'Recommended actions', items: ['Move · 20 min Pilates', 'Breathe · 5 min Meditation', 'Nourish · High protein lunch', 'Reflect · Journal prompt'] },
      { title: 'Wellness rituals', items: ['Everything Shower', 'Nail care', 'Brow care', 'Hydration', 'Meditation', 'Supplements', 'Mental-health check-ins'] },
      { title: 'Editorial reminders', items: ['Rest is productive.', 'Peace is powerful.', 'You are becoming.', 'Small daily choices create big life shifts.'] },
    ],
    designNotes: ['Spa-like cream, sage, and rose palette', 'Botanical/candle imagery', 'Rounded soft cards', 'Gentle status dots instead of harsh warning colors'],
  },
  food: {
    eyebrow: 'Imported Food & Nutrition reference',
    title: 'Food & Nutrition',
    subtitle: 'Nourish your body. Fuel your glow. Whole foods, balanced meals, and mindful choices for a vibrant life.',
    tabs: ['Today', 'Meals', 'Meal Plan', 'Pantry', 'Recipes', 'Nutrition', 'Groceries', 'Hydration', 'Favorites'],
    sections: [
      { title: 'Today’s meals reference', items: ['Breakfast · 8:00 AM · Greek Yogurt Bowl · High Protein', 'Lunch · 12:30 PM · Salmon Power Bowl · Balanced', 'Dinner · 6:30 PM · Chicken Stir Fry · High Protein'] },
      { title: 'Meal-planning workflow', items: ['Plan meals', 'Review pantry', 'Build grocery list', 'Track hydration', 'Save favorite recipes', 'Use nutrition summary as context rather than clutter'] },
      { title: 'Grocery Trip template', items: ['Pantry', 'Produce', 'Protein', 'Dairy', 'Frozen', 'Household items'] },
      { title: 'Meal Prep template', items: ['Cook protein', 'Prepare vegetables', 'Portion meals', 'Label containers'] },
    ],
    designNotes: ['Warm beige/cream editorial kitchen feeling', 'High-quality food photography', 'Soft earthy/pink accents', 'Meal cards should be visual, while groceries and actions stay efficient'],
  },
  beauty: {
    eyebrow: 'Imported Beauty references',
    title: 'Beauty',
    subtitle: 'Enhance your natural glow. Care. Consistency. Confidence.',
    tabs: ['Overview', 'Skincare', 'Makeup', 'Body Care', 'Fragrance', 'Treatments', 'Prescriptions', 'Progress', 'Inspiration'],
    sections: [
      { title: 'Today’s beauty focus', items: ['Hydrate, Protect, Glow', 'Morning Skincare', 'SPF 50', 'Hydrate (2L water)', 'Hair Care', 'Evening Skincare', 'Start Routine action'] },
      { title: 'Beauty routine system', items: ['AM Skincare + SPF', 'PM Skincare', 'Body lotion and oil', 'Oral care', 'Gua sha + lymphatic drainage', 'Facial posture + face yoga'] },
      { title: 'Everything Shower template', items: ['Shampoo', 'Conditioner', 'Hair mask', 'Exfoliate', 'Shave', 'Body wash', 'Body lotion', 'Body oil', 'Nail oil', 'Perfume'] },
      { title: 'Face treatment template', items: ['Cleanser', 'Treatment', 'Serum', 'Moisturizer', 'SPF in the morning', 'Lip care'] },
      { title: 'Self-care night', items: ['Face mask', 'Tea', 'Reading', 'Stretching', 'Journal', 'Early bedtime'] },
      { title: 'Editorial cues', items: ['Beauty begins the moment you decide to be yourself.', 'You don’t need more. You need consistency.', 'Hero area can pair routines with soft product photography and inspiration.'] },
    ],
    designNotes: ['Soft blush/cream palette', 'Elegant serif headers with restrained script', 'Rounded cards and generous whitespace', 'Routine tracker + skin overview + product shelf + appointments + progress journal'],
  },
  hair: {
    eyebrow: 'Imported Hair references',
    title: 'Hair',
    subtitle: 'Healthy hair, healthy you. Consistency is the cure.',
    tabs: ['Overview', 'Wash Days', 'Treatments', 'Hair Goals', 'Products', 'Scalp Care', 'Styles', 'Inspiration', 'History'],
    sections: [
      { title: 'Today’s hair focus', items: ['Healthy Roots, Long Term Growth', 'Scalp Massage (5 min)', 'Hydrate & Moisturize', 'Protect Ends', 'Silk Scarf at Night', 'View Today’s Routine action'] },
      { title: 'Hair lifecycle reference', items: ['Rest', 'Wash', 'Treat', 'Style', 'Refresh', 'Current phase example: Growth', 'Current style example: Silk Press'] },
      { title: 'Routine templates', items: ['Morning assessment + rehydration', 'Nighttime hair protection', 'Sunday full wash', 'Thursday bond-repair maintenance'] },
      { title: 'Sunday Wash Day', items: ['Pre-poo', 'Shampoo', 'Conditioner', 'Hair mask', 'Detangle', 'Leave-in', 'Dry', 'Style'] },
      { title: 'Thursday Maintenance', items: ['Refresh', 'Moisturize', 'Scalp check', 'Ends oil', 'Restyle'] },
      { title: 'Hair Growth Session', items: ['Scalp massage', 'Growth treatment', 'Progress photo', 'Notes'] },
      { title: 'Status widgets', items: ['Hair health score', 'Next wash', 'Products low', 'Treatment schedule', 'Inspiration images', 'Progress/history'] },
    ],
    designNotes: ['Soft pink/beige salon-editorial palette', 'Glossy hair photography', 'Cards for hair health and schedule', 'Growth and consistency should be more prominent than generic beauty content'],
  },
  finance: {
    eyebrow: 'Imported Finance reference',
    title: 'Finance',
    subtitle: 'Take control. Build freedom. Create abundance.',
    tabs: ['Overview', 'Accounts', 'Budget', 'Goals', 'Investments', 'Bills & Subscriptions', 'Transactions', 'Taxes', 'Reports'],
    sections: [
      { title: 'Financial overview reference', items: ['Income · $4,850.00', 'Expenses · $2,693.42', 'Savings · $2,156.58', 'Savings Rate · 44%', 'Example month-over-month savings-rate change · +8%'] },
      { title: 'Spending breakdown reference', items: ['Housing · $1,150 · 42.7%', 'Food · $420 · 15.6%', 'Transportation · $260 · 9.7%', 'Beauty & Self Care · $210 · 7.8%', 'Health · $190 · 7.1%', 'Entertainment · $165 · 6.1%', 'Shopping · $120 · 4.5%', 'Other · $178 · 6.6%'] },
      { title: 'Net worth reference', items: ['All Accounts example · $78,540', 'Example change · +$3,210 (4.27%) vs last month'] },
      { title: 'Money templates', items: ['Monthly Budget Review: review income, expenses, savings, investments, upcoming bills', 'Bill Payment: verify amount, pay, save receipt, update budget'] },
      { title: 'Core finance areas', items: ['Bills', 'Budget', 'Savings', 'Income', 'Expenses', 'Transactions', 'Reports', 'Investments', 'Taxes'] },
    ],
    designNotes: ['Cream/neutral background with sage/olive and blush accents', 'Rounded summary cards', 'Donut breakdown + category legend', 'Keep financial data legible before decorative elements'],
  },
  goals: {
    eyebrow: 'Imported Goals reference',
    title: 'Goals',
    subtitle: 'Dream it. Plan it. Achieve it.',
    tabs: ['Overview', 'Life Goals', 'Quarterly Goals', 'Goal Planner', 'Vision Board', 'Milestones', 'Habit Goals', 'Achievements', 'Reflections'],
    sections: [
      { title: 'Focus for this season', items: ['Build my dream life', 'Create financial freedom', 'Build my brand', 'Travel the world', 'Help & inspire others'] },
      { title: 'Goal status model', items: ['Dream', 'Planning', 'Active', 'Completed', 'Archived', 'Each goal card should show progress, priority, and target date'] },
      { title: 'Reference overall progress', items: ['68% overall progress', '12 Completed', '5 In Progress', '3 Not Started', 'You are closer than you think.'] },
      { title: 'Reference categories', items: ['Personal Growth · 4/6 · 67%', 'Health & Wellness · 3/5 · 60%', 'Financial · 2/4 · 50%', 'Career & Business · 3/4 · 75%', 'Relationships · 2/3 · 67%', 'Travel & Experiences · 1/2 · 50%', 'Home & Lifestyle · 1/3 · 33%'] },
      { title: 'New Goal template', items: ['Goal statement', 'Why it matters', 'Success metric', 'First action', 'Target date'] },
      { title: 'Top-goal presentation', items: ['Use visual thumbnails when meaningful', 'Show progress bar', 'Show target date', 'Example reference: Launch my brand · Target Dec 31, 2026 · 72%'] },
    ],
    designNotes: ['Cream/beige canvas with mauve and sage progress', 'Editorial hero/vision-board imagery', 'Progress should be understandable at a glance', 'Use board/grouping for status and category views'],
  },
};

export function hasImportedReference(room: string): room is ImportedReferenceRoom {
  return room in IMPORTED_REFERENCE_BATCH_1;
}
