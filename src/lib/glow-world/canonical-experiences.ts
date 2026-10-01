export type CanonicalClimate =
  | 'food' | 'work' | 'money' | 'brain' | 'settings' | 'wellness' | 'home'
  | 'travel' | 'relationships' | 'saint' | 'create' | 'beauty' | 'closet'
  | 'fitness' | 'body' | 'plan' | 'today' | 'global';

export type CanonicalExperienceSpec = {
  path: string;
  title: string;
  eyebrow: string;
  question: string;
  climate: CanonicalClimate;
  parentHref: string;
  parentLabel: string;
  enclosure: 'open' | 'structured' | 'protected';
  sections: string[];
};

const e = (
  path:string,title:string,eyebrow:string,question:string,climate:CanonicalClimate,
  parentHref:string,parentLabel:string,sections:string[],enclosure:CanonicalExperienceSpec['enclosure']='structured'
):CanonicalExperienceSpec => ({path,title,eyebrow,question,climate,parentHref,parentLabel,sections,enclosure});

export const CANONICAL_EXPERIENCE_SPECS: CanonicalExperienceSpec[] = [
  // PLAN · horizons, modes, resets, capacity, templates
  e('/planning/horizon/day','Day','Plan · Horizon Studio','What can realistically fit in this day?','plan','/planning','Plan',['Chronological commitments','Tasks + routines','Buffers + travel','Energy + capacity','Open space']),
  e('/planning/horizon/week','Week','Plan · Horizon Studio','How should this week breathe?','plan','/planning','Plan',['Seven days','Weekly drivers','Routines + fitness','Organization days','Capacity + rest']),
  e('/planning/horizon/month','Month','Plan · Horizon Studio','What is this month for?','plan','/planning','Plan',['Goals','Important dates','Projects','Maintenance','Money + social plans']),
  e('/planning/horizon/quarter','Quarter','Plan · Horizon Studio','What needs to move across these three months?','plan','/planning','Plan',['Three months','Goals','Milestones','Projects','Capacity changes']),
  e('/planning/horizon/year','Year','Plan · Horizon Studio','What direction should the year hold?','plan','/planning','Plan',['Twelve months','Seasons','Major goals','Trips + milestones','Reviews']),
  e('/planning/modes/plan','Plan Mode','Plan · Modes','Where should commitments live in time?','plan','/planning','Plan',['Allocation','Conflicts','Commitments','Open space']),
  e('/planning/modes/focus','Focus Mode','Plan · Modes','What deserves the narrowest planning lens?','plan','/planning','Plan',['Current horizon','Next actions','Protected time','Peripheral suppression'],'protected'),
  e('/planning/modes/build','Build Mode','Plan · Modes','What dependencies turn this project into execution?','plan','/planning','Plan',['Projects','Milestones','Dependencies','Execution sequence']),
  e('/planning/modes/reflect','Reflect Mode','Plan · Modes','What did reality teach the plan?','plan','/planning','Plan',['Planned vs actual','Completed work','Capacity','Lessons + patterns']),
  e('/planning/weekly-theme','Weekly Theme Planner','Plan','What identity and rhythm should each day carry?','plan','/planning','Plan',['Weekly theme','Day identities','Anchors','Fitness + Beauty','Home + social + rest']),
  e('/planning/weekly-reset','Weekly Reset','Plan','What must be cleared, reviewed, scheduled, and prepared before the next week?','plan','/planning','Plan',['Last-week review','Capture','Calendar scan','Weekly drivers','Groceries + reset','Preview next week']),
  e('/planning/12-week-sprint','12-Week Sprint','Plan · Planning Studio','What outcome are these twelve weeks building?','plan','/planning/studio','Planning Studio',['Outcome','Lead measures','Twelve-week timeline','Checkpoints','Evidence + review']),
  e('/planning/capacity','Capacity Planner','Plan · Planning Studio','How much is actually available after fixed life and recovery?','plan','/planning/studio','Planning Studio',['Fixed time','Flexible work','Rest + buffers','Mental/physical/focus load','Remaining capacity']),
  ...['daily','weekly','monthly','quarterly','yearly','reset'].map((slug)=>e(
    `/planning/templates/${slug}`,
    `${slug[0].toUpperCase()+slug.slice(1)} Template`,
    'Plan · Templates',
    'What structure should this planning horizon start from?',
    'plan','/planning','Plan',
    ['Direction','Commitments','Routines','Open space','Review + preparation']
  )),

  // PLAN · canonical object/detail families
  e('/tasks/inbox','Capture Inbox','Plan · Tasks','What is this captured action, and where does it belong?','plan','/tasks','Tasks',['Captured item','Source','Classify','Schedule or link','Archive / delete']),
  e('/routines/library','Routine Library','Plan · Routines','Which living rhythm do I want to enter?','plan','/routines','Routines',['Daily life','Planning + home','Beauty + hair','Fitness + food','Weekly/monthly/seasonal']),
  e('/routines/adaptive','Adaptive Routine','Plan · Routines','How should this routine reform for the time, energy, and items available?','plan','/routines','Routines',['Available time','Energy mode','Required steps','Optional steps','Preview + apply'],'protected'),

  // BODY + WELLNESS
  e('/body','Body','Life · Body','What is true about my body model right now?','body','/life','Life',['Measurements','Proportions','Recomposition','Posture','Fitness + wellness links'],'open'),
  e('/body/recomposition','Body Recomposition Profile','Life · Body','What physical priorities are guiding training and recovery?','body','/body','Body',['Current goals','Training emphasis','Recovery','Nutrition relationship','Evidence']),
  e('/body/measurements','Measurements','Life · Body','What has changed, and what does it affect?','body','/body','Body',['Measurements','Ratios','Dates','Change history','Garment-fit relationship']),
  e('/wellness/regulation','Regulation Studio','Life · Wellness','What would help my nervous system settle or mobilize right now?','wellness','/wellness','Wellness',['Current state','Grounding','Breathing','Sensory regulation','Result logging'],'protected'),
  e('/wellness/sleep','Sleep','Life · Wellness','What supports tonight and tomorrow morning?','wellness','/wellness','Wellness',['Sleep plan','Bedtime + wake time','Evening routine','Morning relationship','Consistency']),
  e('/wellness/appointments','Appointments','Life · Wellness','What do I need before, during, and after this appointment?','wellness','/wellness','Wellness',['Upcoming appointments','Provider + place','Preparation','Questions + documents','Follow-up']),

  // FITNESS depth
  e('/fitness/week','Seven-Day Workout Week','Life · Fitness','How should training load and recovery flow across seven days?','fitness','/fitness','Fitness',['Seven days','Workout focus','Recovery','Readiness','Progression']),
  e('/fitness/workout','Workout Day Detail','Life · Fitness','What is today’s complete training sequence?','fitness','/fitness','Fitness',['Warm-up','Exercises','Sets + reps','Rest + substitutions','Recovery link']),
  e('/fitness/workout/player','Guided Workout Player','Life · Fitness','What movement, set, and cue am I doing now?','fitness','/fitness/workout','Workout Day',['Exercise','Set + reps','Technique cue','Rest timer','Complete / substitute'],'protected'),
  e('/fitness/exercises','Exercise Library','Life · Fitness','Which movement fits this goal and equipment?','fitness','/fitness','Fitness',['Body area','Movement pattern','Equipment','Workout usage','Saved exercises']),
  e('/fitness/progression','Progression','Life · Fitness','How is training load changing over time?','fitness','/fitness','Fitness',['Load','Repetitions','Volume','Milestones','Plateaus']),
  e('/fitness/recovery','Recovery','Life · Fitness','What restores training capacity today?','fitness','/fitness','Fitness',['Walking','Mobility','Soreness','Hydration','Sleep relationship']),

  // BEAUTY · intelligence and missing studios
  e('/beauty/intelligence','Beauty Intelligence','Life · Beauty','What does Beauty need now, and why?','beauty','/beauty','Beauty',['Current state','Concerns','Routine conflicts','Inventory status','Maintenance + event prep']),
  e('/beauty/skincare/morning','Morning Routine','Life · Beauty · Skincare','What is the correct morning skin sequence today?','beauty','/beauty/skincare','Skincare',['Cleanse / rinse','Treatment','Hydration','Moisturizer','SPF'],'protected'),
  e('/beauty/skincare/night','Night Routine','Life · Beauty · Skincare','Which treatment mode belongs tonight?','beauty','/beauty/skincare','Skincare',['Cleanse','Treatment mode','Hydration','Moisturizer','Compatibility'],'protected'),
  ...[
    ['recovery','Recovery Night','Barrier support without strong actives'],
    ['retinoid','Retinoid Night','Retinoid-compatible treatment and support'],
    ['exfoliation','Exfoliation Night','Exfoliation with redundancy control'],
    ['acne-treatment','Acne Treatment Night','Acne-targeted treatment plus support'],
    ['hydration','Hydration Night','Hydration and barrier recovery'],
  ].map(([slug,title,q])=>e(`/beauty/skincare/night/${slug}`,title,'Life · Beauty · Skincare',q,'beauty','/beauty/skincare/night','Night Routine',['Active pathway','Compatible products','Suppressed conflicts','Order + timing','Complete'],'protected')),
  e('/beauty/skincare/products','Product Shelf','Life · Beauty · Skincare','What do I own, where does it belong, and what is its state?','beauty','/beauty/skincare','Skincare',['Categories','Current use','Backups','Open / expiry state','Routine relationships']),
  e('/beauty/skincare/compatibility','Compatibility Studio','Life · Beauty · Skincare','Can these products safely and usefully share a routine?','beauty','/beauty/skincare','Skincare',['Selected products','Ingredients','Conflicts','Redundancy','AM/PM sequence'],'protected'),
  e('/beauty/skincare/progress','Skincare Progress','Life · Beauty · Skincare','What changed after the routine or product changed?','beauty','/beauty/skincare','Skincare',['Photos','Concerns','Observations','Routine changes','Product changes']),
  e('/beauty/gua-sha/face-map','Face Map','Life · Beauty · Gua Sha','Which face zone and drainage path am I working on?','beauty','/beauty/gua-sha','Gua Sha Studio',['Forehead','Brows + eyes','Cheeks','Jaw','Neck + drainage']),
  e('/beauty/gua-sha/routines','Routine Library','Life · Beauty · Gua Sha','Which facial movement sequence fits this goal and time?','beauty','/beauty/gua-sha','Gua Sha Studio',['Morning depuff','Evening sculpt','Quick','Full','Custom']),
  e('/beauty/gua-sha/player','Gua Sha Player','Life · Beauty · Gua Sha','What stroke, side, and repetition am I doing now?','beauty','/beauty/gua-sha','Gua Sha Studio',['Current zone','Side + direction','Repetitions','Timer','Next / pause / complete'],'protected'),
  e('/beauty/hair/morning','Morning Hair Player','Life · Beauty · Hair','What does my hair need this morning?','beauty','/hair','Hair',['Current style','Step','Product','Tool','Complete'],'protected'),
  e('/beauty/hair/night','Night Hair Player','Life · Beauty · Hair','How should I protect my hair tonight?','beauty','/hair','Hair',['Protection','Moisture','Ends','Textile / bonnet','Complete'],'protected'),
  e('/beauty/hair/wash-day','Wash Day','Life · Beauty · Hair','What phase of wash day comes next?','beauty','/hair','Hair',['Pre-treatment','Cleanse','Treat + condition','Detangle','Leave-in + style + dry']),
  e('/beauty/hair/wash-day/player','Wash Day Player','Life · Beauty · Hair','What is the one wash-day step I am doing now?','beauty','/beauty/hair/wash-day','Wash Day',['Phase','Instruction','Product + tool','Timer','Next / complete'],'protected'),
  e('/beauty/hair/schedule','Hair Schedule','Life · Beauty · Hair','What maintenance is due across this hair cycle?','beauty','/hair','Hair',['Wash days','Treatments','Protective styles','Trims + gloss','Appointments']),
  e('/beauty/hair/products','Hair Product Shelf','Life · Beauty · Hair','What hair products are owned and where do they fit?','beauty','/hair','Hair',['Cleanse','Condition + masks','Leave-in + scalp','Styling + hold','Backups']),
  e('/beauty/hair/styles','Styles','Life · Beauty · Hair','Which current, saved, or protective style am I considering?','beauty','/hair','Hair',['Current','Saved','Protective','Inspiration','Maintenance']),
  e('/beauty/makeup/looks','Looks','Life · Beauty · Makeup','What makeup look fits this moment?','beauty','/beauty/makeup','Makeup',['Use + mood','Occasion','Favorites','Owned-product fit','Timing']),
  e('/beauty/makeup/face-map','Face Map','Life · Beauty · Makeup','Where does each technique sit on my face?','beauty','/beauty/makeup','Makeup',['Contour','Blush + highlight','Eyes','Brows','Lips']),
  e('/beauty/makeup/occasion','Occasion Engine','Life · Beauty · Makeup','What look fits the outfit, venue, light, time, and desired effect?','beauty','/beauty/makeup','Makeup',['Occasion','Outfit + hair','Venue + lighting','Desired effect','Proposed look'],'protected'),
  e('/beauty/makeup/techniques','Technique Library','Life · Beauty · Makeup','Which technique do I want to learn or repeat?','beauty','/beauty/makeup','Makeup',['Complexion','Brows','Eyes + lashes','Cheeks','Lips + finishing']),
  e('/beauty/makeup/wear-test','Wear Test','Life · Beauty · Makeup','How did this makeup combination behave over time?','beauty','/beauty/makeup','Makeup',['Application','Environment','Checkpoints','Transfer + fading','Conclusion']),
  e('/beauty/makeup/inventory','Makeup Inventory','Life · Beauty · Makeup','What makeup do I own and actually use?','beauty','/beauty/makeup','Makeup',['Complexion','Eye + brow','Cheek + lip','Lash + setting','Tools + backups']),
  e('/beauty/nails','Nails','Life · Beauty','What nail care, maintenance, color, or tool needs attention?','beauty','/beauty','Beauty',['Nail condition','Routines','Colors + extensions','Maintenance','Tools + appointments'],'open'),
  e('/beauty/brows-lashes','Brows + Lashes','Life · Beauty','What brow or lash care is current, due, or planned?','beauty','/beauty','Beauty',['Current state','Routines','Appointments','Products','Treatments'],'open'),
  e('/beauty/oral-care','Oral Care','Life · Beauty','What oral-care routine or maintenance is due?','beauty','/beauty','Beauty',['Daily routines','Whitening','Tools','Maintenance','Cadence'],'open'),
  e('/beauty/devices/inventory','Tools + Devices Inventory','Life · Beauty','What beauty tools and devices are owned and ready to use?','beauty','/beauty/devices','Tools + Devices',['LED + facial tools','Hair tools','Massage tools','Hair-removal devices','Accessories']),
  ...[
    ['body','Body Beauty',['Routine Library','Routine Player','Inventory','Item Detail']],
    ['nails','Nails',['Routine Library','Routine Player','Inventory','Item Detail']],
    ['brows-lashes','Brows + Lashes',['Routine Library','Routine Player','Inventory','Item Detail']],
    ['oral-care','Oral Care',['Routine Library','Routine Player','Inventory','Item Detail']],
  ].flatMap(([slug,title,sections])=>[
    e(`/beauty/${slug}/routines`,`${title} Routine Library`,`Life · Beauty · ${title}`,'Which saved care sequence fits now?','beauty',`/beauty/${slug}`,title as string,sections as string[]),
    e(`/beauty/${slug}/player`,`${title} Routine Player`,`Life · Beauty · ${title}`,'What is the one care step I am doing now?','beauty',`/beauty/${slug}`,title as string,['Current step','Instruction','Product / tool','Timer','Complete'],'protected'),
    e(`/beauty/${slug}/inventory`,`${title} Inventory`,`Life · Beauty · ${title}`,'What is owned, due, or running low?','beauty',`/beauty/${slug}`,title as string,['Owned items','Current use','Stock','Maintenance','History']),
  ]),
  e('/beauty/fragrance/wardrobe','Fragrance Wardrobe','Life · Beauty · Fragrance','Which scent fits season, mood, and occasion?','beauty','/beauty/fragrance','Fragrance',['Owned fragrances','Family','Mood + season','Occasion','Usage']),
  e('/beauty/fragrance/layering','Layering Studio','Life · Beauty · Fragrance','How do these scents compose together?','beauty','/beauty/fragrance','Fragrance',['Selected fragrances','Notes','Proposed pairings','Occasion','Save combination'],'protected'),
  e('/beauty/fragrance/wear-log','Wear Log','Life · Beauty · Fragrance','How did this scent wear in the real world?','beauty','/beauty/fragrance','Fragrance',['Date + occasion','Environment','Longevity','Impression','Layering']),
  e('/beauty/devices/usage-calendar','Usage Calendar','Life · Beauty · Tools + Devices','When is each device due for use?','beauty','/beauty/devices','Tools + Devices',['Cadence','Scheduled use','Completion','Conflicts','History']),
  e('/beauty/devices/maintenance','Cleaning + Maintenance','Life · Beauty · Tools + Devices','What device needs cleaning, charging, or replacement?','beauty','/beauty/devices','Tools + Devices',['Cleaning','Charging','Replacement parts','Sanitation','Service']),
  e('/beauty/experiments','Beauty Experiments','Life · Beauty','What single variable am I intentionally testing?','beauty','/beauty','Beauty',['Hypothesis','Baseline','Variable','Timeline','Evidence']),
  e('/beauty/safety','Safety Gate','Life · Beauty','What combination or action needs to be blocked or adapted?','beauty','/beauty','Beauty',['Affected objects','Reason','Conflict','Safe alternatives','Decision'],'protected'),

  // CLOSET
  e('/closet/style-identity','Style Identity','Life · Closet','What visual language feels most like me?','closet','/closet','Closet',['Aesthetic','Silhouettes','Proportions','Colors + materials','Evolution']),
  e('/closet/wardrobe','Digital Wardrobe','Life · Closet','What do I actually own?','closet','/closet','Closet',['Clothing','Footwear','Bags + accessories','Condition + fit','Wear state']),
  e('/closet/outfit-builder','Outfit Builder','Life · Closet','What complete look can I build from owned pieces?','closet','/closet','Closet',['Body / outfit field','Owned item rails','Weather','Occasion','Beauty links'],'protected'),
  e('/closet/outfits','Outfit Library','Life · Closet','Which saved complete looks are ready to wear?','closet','/closet','Closet',['Saved outfits','Occasion','Weather','Favorites','Wear history']),
  e('/closet/outfit-history','Outfit History','Life · Closet','What did I actually wear and repeat?','closet','/closet','Closet',['Chronology','Photos','Occasion','Pieces','Repeat patterns']),
  e('/closet/formulas','Outfit Formula Builder','Life · Closet','Which reusable silhouette formula makes dressing easier?','closet','/closet','Closet',['Silhouette','Top','Bottom','Layer','Footwear + finish']),
  e('/closet/shopping','Shopping','Life · Closet','Does a possible purchase solve a real wardrobe need?','closet','/closet','Closet',['Candidate items','Owned wardrobe fit','Duplicates','Gap filled','Decision']),
  e('/closet/shopping/decision','Smart Shopping Decision','Life · Closet','What changes if I buy this?','closet','/closet/shopping','Shopping',['Proposed item','Compatible owned pieces','Duplicate risk','Outfit count','Price + care'],'protected'),
  e('/closet/wishlist','Wishlist','Life · Closet','Which saved purchases still deserve attention?','closet','/closet','Closet',['Source','Price','Priority','Gap','Decision state']),
  e('/closet/gaps','Gap Analysis','Life · Closet','What is truly missing versus merely tempting?','closet','/closet','Closet',['Missing needs','Duplicate clusters','Occasion gaps','Season gaps','Priority']),
  e('/closet/laundry','Laundry','Life · Closet','Where is each garment in the care cycle?','closet','/closet','Closet',['Dirty','Wash','Delicate','Dry clean / air dry','Ready to return']),
  e('/closet/repairs','Repairs + Alterations','Life · Closet','What garment needs repair, tailoring, or replacement?','closet','/closet','Closet',['Garment','Issue','Repair area','Timeline','Tailor / action']),
  e('/closet/storage','Storage','Life · Closet','Where does each category physically live?','closet','/closet','Closet',['Closet','Drawers','Bins','Seasonal','Accessories']),
  e('/closet/inspiration','Inspiration','Life · Closet','What references are influencing style without pretending they are owned?','closet','/closet','Closet',['Editorial references','Looks','Silhouettes','Materials','Source']),
  e('/closet/audit','Closet Audit','Life · Closet','What should happen to this one garment?','closet','/closet','Closet',['Keep','Repair','Alter','Sell / donate','Replace / archive'],'protected'),

  // FOOD
  e('/food/meal-plan','Meal Plan','Life · Food','How should meals flow through this week?','food','/food','Food',['Breakfast','Lunch','Dinner','Snacks + leftovers','Eating out']),
  e('/food/recipes','Recipes','Life · Food','What can I make from the food and time available?','food','/food','Food',['Recipe library','Ingredients','Time','Substitutions','Saved status']),
  e('/food/groceries','Groceries','Life · Food','What actually needs to be bought?','food','/food','Food',['Store / category','Recipe relationships','Pantry check','Quantity','Checked state']),
  e('/food/pantry','Pantry + Inventory','Life · Food','What food do I already have and what needs using first?','food','/food','Food',['Pantry','Fridge','Freezer','Expiry','Low stock']),
  e('/food/meal-prep','Meal Prep','Life · Food','What preparation can happen together?','food','/food','Food',['Chop','Cook','Portion','Assemble','Store']),

  // HOME
  e('/life/home','Home','Life · Home','Which physical space, routine, object, or maintenance need belongs here?','home','/life','Life',['Home Reset','Rooms','Cleaning','Maintenance','Inventory'],'open'),
  e('/life/home/reset','Home Reset','Life · Home','What sequence returns the whole home to baseline?','home','/life/home','Home',['Collect','Dishes','Laundry','Surfaces + floors','Trash + put-away'],'protected'),
  e('/life/home/rooms','Rooms','Life · Home','Which physical space needs attention?','home','/life/home','Home',['Room map','State','Cleaning','Storage','Projects']),
  e('/life/home/cleaning','Cleaning','Life · Home','What cleaning belongs to this space and cadence?','home','/life/home','Home',['Daily','Weekly','Deep','Seasonal','By room']),
  e('/life/home/maintenance','Maintenance','Life · Home','What needs repair, service, or replacement?','home','/life/home','Home',['Repairs','Service dates','Filters + batteries','Seasonal work','Warranties']),
  e('/life/home/inventory','Inventory','Life · Home','What household items and supplies exist, and where?','home','/life/home','Home',['Category','Location','Quantity','Replacement state','Manual + receipt']),

  // MONEY
  e('/finance/baseline','Financial Baseline','Life · Money','What is the current financial baseline as of now?','money','/finance','Money',['Income','Fixed costs','Flexible costs','Balances','Debts + savings']),
  e('/finance/spending','Spending','Life · Money','Where is money moving and what stands out?','money','/finance','Money',['Transaction ledger','Category','Merchant','Trend','Unusual items']),
  e('/finance/recurring-bills','Recurring Bills','Life · Money','What obligations repeat and when do they land?','money','/finance','Money',['Monthly ribbon','Amount','Due date','Account','Change history']),
  e('/finance/debt','Debt','Life · Money','What liabilities exist and how do scenarios change them?','money','/finance','Money',['Balance','Rate','Payment','Due date','Scenario + progress']),
  e('/finance/savings','Savings','Life · Money','What future capacity am I building?','money','/finance','Money',['Goals','Current amount','Contributions','Target','Progress']),
  e('/finance/purchase-decision','Purchase Decision Studio','Life · Money','What happens to my money if I buy this, wait, or choose something else?','money','/finance','Money',['Potential purchase','Need','Alternatives','Cash-flow effect','Savings impact'],'protected'),
  e('/finance/calendar','Financial Calendar','Life · Money','Which dates change my financial state?','money','/finance','Money',['Paydays','Bills','Transfers','Subscriptions','Reviews + deadlines']),
  e('/finance/learning','Money Learning','Life · Money','What concept helps me understand a real financial decision?','money','/finance','Money',['Notes','Glossary','Sources','Examples','Personal decision links']),

  // CAREER + WORK
  e('/work/job-search','Job Search','Life · Career + Work','Which opportunities are moving, and what is the next action?','work','/work','Career + Work',['Saved','Preparing','Applied','Interviewing','Offer / closed']),
  e('/work/interviews','Interviews','Life · Career + Work','What do I need to know, prepare, wear, and ask for this interview?','work','/work','Career + Work',['Company research','Stories','Questions','Travel + outfit','Follow-up']),
  e('/work/skills','Skills','Life · Career + Work','What skill evidence am I actually building?','work','/work','Career + Work',['Skill','Evidence','Course / work','Practice','Portfolio relationship']),
  e('/work/portfolio','Portfolio','Life · Career + Work','Which project best shows the process and outcome?','work','/work','Career + Work',['Project','Role','Process','Work','Outcome']),

  // TRAVEL
  e('/travel','Travel','Life · Travel','Which journey is real, which is forming, and what needs preparation?','travel','/life','Life',['Trips','Itinerary','Packing','Bookings','Budget'],'open'),
  e('/travel/itinerary','Itinerary','Life · Travel','How should this trip unfold day by day without overpacking time?','travel','/travel','Travel',['Days','Stops','Reservations','Transport','Free time']),
  e('/travel/packing','Packing','Life · Travel','What owned objects need to travel with me?','travel','/travel','Travel',['Clothing','Beauty','Toiletries','Technology','Documents']),
  e('/travel/bookings','Bookings','Life · Travel','What is confirmed and where is the proof?','travel','/travel','Travel',['Flights','Hotels','Transport','Reservations','Confirmations']),
  e('/travel/budget','Budget','Life · Travel','What will this trip cost versus what it actually cost?','travel','/travel','Travel',['Expected','Actual','Category','Date','Variance']),

  // RELATIONSHIPS + SAINT
  e('/relationships','Relationships','Life · Relationships','Who matters, what is upcoming, and what needs follow-up?','relationships','/life','Life',['People','Important dates','Follow-ups','Shared plans','Gifts + notes'],'open'),
  e('/relationships/person','Person Detail','Life · Relationships','What context belongs to this relationship?','relationships','/relationships','Relationships',['Identity','Important dates','Interactions','Shared plans','Gifts + linked objects']),
  e('/saint','Saint Care','Life · Saint Care','What does Saint need today and what is approaching?','saint','/life','Life',['Daily care','Supplies','Appointments','Grooming','Routines'],'open'),
  e('/saint/daily','Daily Care','Life · Saint Care','What care is due today?','saint','/saint','Saint Care',['Food + water','Walk / activity','Cleaning','Routine','Notes']),
  e('/saint/supplies','Supplies','Life · Saint Care','What supplies exist and what needs replacement?','saint','/saint','Saint Care',['Food','Grooming','Care products','Quantity','Storage']),
  e('/saint/appointments','Appointments','Life · Saint Care','What needs preparation or follow-up for Saint’s appointments?','saint','/saint','Saint Care',['Upcoming visits','Preparation','Documents','Follow-up','History']),
  e('/saint/grooming','Grooming','Life · Saint Care','What grooming care is due and what supplies are needed?','saint','/saint','Saint Care',['Bathing','Brushing','Nails','Coat / skin','Cadence + supplies']),

  // BRAIN
  e('/brain/thoughts','Thoughts','Brain','What raw thought is asking to become something else?','brain','/brain','Brain',['Fragments','Source time','Promote to note','Promote to task','Archive']),
  e('/brain/ideas','Ideas','Brain','Which idea is still a seed, and which is becoming a project?','brain','/brain','Brain',['Idea seeds','Problem / opportunity','References','Project relationship','Next experiment']),
  e('/brain/insights','Insights','Brain','What pattern is supported by enough evidence to keep?','brain','/brain','Brain',['Insight','Evidence','Fact vs inference','Uncertainty','Related objects']),
  e('/brain/decisions','Decision Archive','Brain','What did I decide, why, and what happened afterward?','brain','/brain','Brain',['Decision','Options','Evidence + reasons','Outcome','Later review']),
  e('/brain/graph','Brain Graph','Brain','How are canonical Glow objects related?','brain','/brain','Brain',['Objects','Relationships','Source','History','Open detail']),
  e('/brain/imported','Imported Knowledge','Brain','What source knowledge entered Glow and where is it used?','brain','/brain','Brain',['Source documents','Extracted concepts','Provenance','Relationships','Canonical destinations']),
  e('/brain/migration-review','Source Migration Review','Brain','What came from the source, and what canonical object should it become?','brain','/brain/imported','Imported Knowledge',['Original source','Proposed destination','Fact / inference distinction','Merge / create','Approval'],'protected'),
  e('/brain/import-review','Import Review','Brain','What was created, linked, merged, skipped, or left unresolved?','brain','/brain/imported','Imported Knowledge',['Created','Linked','Merged','Skipped','Unresolved']),

  // CREATE
  e('/create/capture','Capture','Create','What is trying to become real?','create','/create','Create',['Text','Voice','Image','File / link','Destination suggestion']),
  e('/create/inbox','Inbox','Create','What unfinished creative material needs a destination?','create','/create','Create',['Unprocessed captures','Source','Classification','Destination','Archive']),
  e('/create/studio','Creative Studio','Create','What am I actively making right now?','create','/create','Create',['Work canvas','References','Versions','Ask Glow','Tasks + output'],'protected'),
  e('/create/projects','Creative Projects','Create','Which creative body of work is active, paused, or complete?','create','/create','Create',['Project covers','Status','Next action','Assets','Output']),
  e('/create/media','Media Library','Create','Which image, video, audio, or reference belongs here?','create','/create','Create',['Images','Video','Audio','References','Relationships']),
  e('/create/import','Import','Create','What is this source, where should it go, and what must remain attributable?','create','/create','Create',['Source','Privacy','Destination suggestion','Preview','Confirm'],'protected'),
  e('/create/templates','Templates','Create','Which reusable creative starting point fits this work?','create','/create','Create',['Artifact previews','Use case','Inputs','Create from template','History']),

  // GLOBAL UTILITIES
  e('/search/results','Search Results','Global · Search','Where is the thing I am looking for across canonical Glow objects?','global','/search','Search',['World groups','Object type','Relevant snippet','Source','Direct action']),
  e('/ask-glow/quick','Quick Ask','Global · Ask Glow','What can Glow answer or act on without leaving this context?','global','/ask-glow','Ask Glow',['Current context','Question','Referenced object','Answer / proposal','Receipt']),
  e('/ask-glow/thread','Full Thread','Global · Ask Glow','What is the full conversation and context trail?','global','/ask-glow','Ask Glow',['Conversation','References','Actions','Approvals','Receipts']),
  e('/ask-glow/references','Reference Lock','Global · Ask Glow','Which objects or sources must remain fixed in context?','global','/ask-glow','Ask Glow',['Pinned objects','Pinned sources','Scope','Remove','History']),
  e('/ask-glow/attachments','Attachments','Global · Ask Glow','Which files and images are attached to this thread?','global','/ask-glow','Ask Glow',['Preview','Source','Status','Use in context','Remove']),
  e('/ask-glow/history','History','Global · Ask Glow','Which previous Glow conversation should I return to?','global','/ask-glow','Ask Glow',['Threads','Date','Related objects','Search','Resume']),
  e('/concierge/request','Request Detail','Global · Concierge','What situation is Glow coordinating, and what needs approval?','global','/concierge','Concierge',['Goal','Dependencies','Steps','Current status','Proposal + receipt'],'protected'),
  e('/attention','Attention Center','Global Utility','What requires human review without interrupting every room?','global','/today','Today',['Conflicts','Maintenance','Low stock','Money','Imports + sync'],'open'),
  e('/attention/item','Attention Item Detail','Global Utility','Why does this need attention, what evidence supports it, and what can resolve it?','global','/attention','Attention Center',['Reason','Evidence','Affected objects','Resolutions','Action']),
  e('/notifications','Notifications','Global Utility','What changed, completed, or needs a reminder?','global','/today','Today',['Reminders','System notices','Completed actions','Sync / import','Relevant changes'],'open'),

  // SETTINGS deep utility family
  ...[
    ['profile','Profile',['Profile information','Display preferences','User defaults']],
    ['appearance-accessibility','Appearance + Accessibility',['Appearance','Reduced motion','Contrast','Text size','Input preferences']],
    ['notifications','Notification Settings',['Categories','Timing','Channel','Quiet behavior','Priority']],
    ['data-privacy','Data + Privacy',['Data usage','History','Storage','Privacy boundaries','Delete / export']],
    ['permissions','Permissions',['Calendar','Files','Location','Notifications','Connected systems']],
    ['integrations','Integrations',['Connected services','Status','Authorization','Reconnect','Disconnect']],
    ['calendar-connections','Calendar Connections',['Calendars','Visibility','Write access','Default calendar','Conflict behavior']],
    ['routine-defaults','Routine Defaults',['Default timing','Energy mode','Adaptation','Completion behavior','History']],
    ['ask-glow','Ask Glow Settings',['Context behavior','Reference preferences','Action permissions','Conversation defaults']],
    ['import-export','Import + Export',['Import sources','Exports','Source receipts','Backup','Restore']],
    ['account','Account',['Authentication','Sessions','Account actions','Security','Sign out']],
  ].map(([slug,title,sections])=>e(`/settings/${slug}`,title as string,'Global Utility · Settings','How should this part of Glow behave?','settings','/settings','Settings',sections as string[])),
];

const INDEX = new Map(CANONICAL_EXPERIENCE_SPECS.map((spec)=>[spec.path,spec]));

function dynamicDetailSpec(normalized:string):CanonicalExperienceSpec|null{
  const patterns:Array<{re:RegExp; build:(m:RegExpMatchArray)=>CanonicalExperienceSpec}> = [
    { re:/^\/tasks\/([^/]+)$/, build:(m)=>e(normalized,'Task Detail','Plan · Tasks','What is true about this task, what is it connected to, and what happens next?','plan','/tasks','Tasks',['Identity + status','Duration + load','Schedule + deadline','Project + goal','Subtasks + history']) },
    { re:/^\/goals\/([^/]+)$/, build:(m)=>e(normalized,'Goal Detail','Plan · Goals','Why does this goal exist and what evidence shows movement?','plan','/goals','Goals',['Why + target','Horizon','Milestones','Projects + routines','Evidence + review']) },
    { re:/^\/projects\/([^/]+)$/, build:(m)=>e(normalized,'Project Detail','Plan · Projects','What is this project, what is next, and what is blocking it?','plan','/projects','Projects',['Overview','Milestones','Task queue','Notes + files','Decisions + history']) },
    { re:/^\/habits\/([^/]+)$/, build:(m)=>e(normalized,'Habit Detail','Plan · Habits','What cue, cadence, and evidence define this habit?','plan','/habits','Habits',['Behavior','Cue','Cadence','History','Goal / routine relationship']) },
    { re:/^\/routines\/([^/]+)$/, build:(m)=>e(normalized,'Routine Detail','Plan · Routines','What is this living routine and how should it adapt?','plan','/routines','Routines',['Purpose + trigger','Cadence + duration','Ordered steps','Variants','Tools + history']) },
    { re:/^\/routines\/([^/]+)\/player$/, build:(m)=>e(normalized,'Routine Player','Plan · Routines','What step am I doing now?','plan',`/routines/${m[1]}`,'Routine Detail',['Current step','Timer','Instruction','Required object','Pause / skip / complete'],'protected') },
    { re:/^\/routines\/([^/]+)\/player\/step$/, build:(m)=>e(normalized,'Active Step','Plan · Routines','What is the one instruction that matters right now?','plan',`/routines/${m[1]}/player`,'Routine Player',['Instruction','Visual guidance','Timer / repetitions','Product / tool','Done / skip'],'protected') },
    { re:/^\/calendar\/event\/([^/]+)$/, build:(m)=>e(normalized,'Event Detail','Plan · Calendar','What does this event require before, during, and after?','plan','/calendar','Calendar',['Time','People','Place / link','Preparation','Related objects + history']) },
    { re:/^\/fitness\/exercises\/([^/]+)$/, build:(m)=>e(normalized,'Exercise Detail','Life · Fitness','How should this movement be set up, performed, and progressed?','fitness','/fitness/exercises','Exercise Library',['Setup','Execution','Cues + mistakes','Muscles','Regression + progression + history']) },
    { re:/^\/beauty\/skincare\/products\/([^/]+)$/, build:(m)=>e(normalized,'Skincare Product Detail','Life · Beauty · Skincare','Where does this owned product belong and what should be known about it?','beauty','/beauty/skincare/products','Product Shelf',['Identity + category','Ingredients','Routine placement','Compatibility','Open date + usage + source']) },
    { re:/^\/beauty\/hair\/products\/([^/]+)$/, build:(m)=>e(normalized,'Hair Product Detail','Life · Beauty · Hair','What is this product for, where does it fit, and what is its state?','beauty','/beauty/hair/products','Hair Product Shelf',['Purpose','Routine placement','Inventory','History','Notes + relationships']) },
    { re:/^\/beauty\/hair\/styles\/([^/]+)$/, build:(m)=>e(normalized,'Style Detail','Life · Beauty · Hair','How is this hairstyle prepared, maintained, and taken down?','beauty','/beauty/hair/styles','Styles',['Reference','Preparation + sections','Tools + steps','Maintenance + longevity','Takedown']) },
    { re:/^\/beauty\/makeup\/looks\/([^/]+)$/, build:(m)=>e(normalized,'Look Detail','Life · Beauty · Makeup','What is the exact makeup recipe for this look?','beauty','/beauty/makeup/looks','Looks',['Reference','Prep + complexion','Brows + eyes','Cheeks + lips','Products + timing']) },
    { re:/^\/beauty\/makeup\/techniques\/([^/]+)$/, build:(m)=>e(normalized,'Technique Detail','Life · Beauty · Makeup','How is this technique performed and adapted?','beauty','/beauty/makeup/techniques','Technique Library',['Close-up diagram','Numbered steps','Adaptations','Mistakes','Linked looks']) },
    { re:/^\/beauty\/makeup\/inventory\/([^/]+)$/, build:(m)=>e(normalized,'Makeup Product Detail','Life · Beauty · Makeup','How does this owned product perform and where is it used?','beauty','/beauty/makeup/inventory','Makeup Inventory',['Product + shade','Category','Look relationships','Wear observations','Stock + history']) },
    { re:/^\/beauty\/fragrance\/wardrobe\/([^/]+)$/, build:(m)=>e(normalized,'Fragrance Detail','Life · Beauty · Fragrance','What defines this fragrance and when does it work best?','beauty','/beauty/fragrance/wardrobe','Fragrance Wardrobe',['Bottle + notes','Family','Season + occasions','Longevity','Layering + wear history']) },
    { re:/^\/beauty\/devices\/inventory\/([^/]+)$/, build:(m)=>e(normalized,'Device Detail','Life · Beauty · Tools + Devices','How is this device used, cleaned, charged, and scheduled?','beauty','/beauty/devices','Tools + Devices',['Device','Instructions','Cadence','Charging + cleaning','Contraindications + history']) },
    { re:/^\/beauty\/experiments\/([^/]+)$/, build:(m)=>e(normalized,'Experiment Detail','Life · Beauty · Experiments','What changed, what stayed controlled, and what did the evidence show?','beauty','/beauty/experiments','Beauty Experiments',['Hypothesis','Variable','Baseline','Timeline + observations','Conclusion + keep / revert']) },
    { re:/^\/closet\/wardrobe\/([^/]+)$/, build:(m)=>e(normalized,'Item Detail','Life · Closet','What is true about this owned wardrobe item?','closet','/closet/wardrobe','Digital Wardrobe',['Garment image','Brand + fit + size','Condition','Wear history + care','Outfits + repair + source']) },
    { re:/^\/closet\/outfits\/([^/]+)$/, build:(m)=>e(normalized,'Outfit Detail','Life · Closet','What makes this complete outfit work and where has it been worn?','closet','/closet/outfits','Outfit Library',['Complete look','Pieces','Styling notes','Beauty + occasion + weather','Wear history']) },
    { re:/^\/food\/recipes\/([^/]+)$/, build:(m)=>e(normalized,'Recipe Detail','Life · Food','What do I need, how long will it take, and what can substitute?','food','/food/recipes','Recipes',['Recipe identity','Ingredients','Directions','Timing','Substitutions']) },
    { re:/^\/life\/home\/rooms\/([^/]+)$/, build:(m)=>e(normalized,'Room Detail','Life · Home','What is the state of this physical room and what belongs here?','home','/life/home/rooms','Rooms',['Room state','Cleaning','Storage','Projects','Inventory + notes']) },
    { re:/^\/work\/job-search\/([^/]+)$/, build:(m)=>e(normalized,'Job Detail','Life · Career + Work','What is true about this opportunity and what is the next action?','work','/work/job-search','Job Search',['Job + company','Compensation + schedule','Location + fit','Documents + contact','Interview prep + history']) },
    { re:/^\/travel\/trips\/([^/]+)$/, build:(m)=>e(normalized,'Trip Detail','Life · Travel','What is the complete state of this trip?','travel','/travel','Travel',['Destination + dates','People','Itinerary','Bookings + packing','Budget + notes']) },
    { re:/^\/relationships\/person\/([^/]+)$/, build:(m)=>e(normalized,'Person Detail','Life · Relationships','What context belongs to this person and relationship?','relationships','/relationships','Relationships',['Identity','Important dates','Interactions','Shared plans','Gifts + linked objects']) },
    { re:/^\/notes\/([^/]+)$/, build:(m)=>e(normalized,'Note Detail','Brain · Notes','What is this note saying and what is it connected to?','brain','/notes','Notes',['Title + body','Relationships','Files','Backlinks + provenance','Edit history']) },
    { re:/^\/memory\/([^/]+)$/, build:(m)=>e(normalized,'Memory Detail','Brain · Memory','What happened, when, and how confident is Glow in this memory?','brain','/memory','Memory',['Memory','When','Source','Related objects','Confidence + correction history']) },
    { re:/^\/brain\/ideas\/([^/]+)$/, build:(m)=>e(normalized,'Idea Detail','Brain · Ideas','What problem or opportunity does this idea address, and what is the next experiment?','brain','/brain/ideas','Ideas',['Problem / opportunity','Concept','Supporting notes','References','Project link + next experiment']) },
    { re:/^\/brain\/insights\/([^/]+)$/, build:(m)=>e(normalized,'Insight Detail','Brain · Insights','What evidence supports this insight and what remains uncertain?','brain','/brain/insights','Insights',['Insight','Supporting evidence','Fact','Inference','Uncertainty']) },
    { re:/^\/brain\/decisions\/([^/]+)$/, build:(m)=>e(normalized,'Decision Detail','Brain · Decisions','What was decided, why, and what happened later?','brain','/brain/decisions','Decision Archive',['Decision','Options','Evidence + reasons','Outcome','Review + receipts']) },
    { re:/^\/create\/projects\/([^/]+)$/, build:(m)=>e(normalized,'Creative Project Detail','Create · Projects','What is this creative project becoming?','create','/create/projects','Creative Projects',['Brief','Concept + references','Drafts + assets','Tasks + versions','Feedback + output']) },
    { re:/^\/concierge\/request\/([^/]+)$/, build:(m)=>e(normalized,'Request Detail','Global · Concierge','What situation is being coordinated and what needs approval?','global','/concierge','Concierge',['Goal','Dependencies','Steps','Status','Proposal + receipt'],'protected') },
    { re:/^\/attention\/item\/([^/]+)$/, build:(m)=>e(normalized,'Attention Item Detail','Global Utility','Why does this need review and what can resolve it?','global','/attention','Attention Center',['Reason','Evidence','Affected objects','Possible resolutions','Action']) },
  ];
  for(const pattern of patterns){
    const match=normalized.match(pattern.re);
    if(match) return pattern.build(match);
  }
  return null;
}

export function canonicalExperienceFor(path:string){
  const normalized=(path.split('?')[0]||'/').replace(/\/$/,'')||'/';
  return INDEX.get(normalized) ?? dynamicDetailSpec(normalized);
}
