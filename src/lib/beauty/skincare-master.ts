export type InventoryStatus = 'confirmed' | 'backup' | 'needs-confirmation' | 'needs-identification';

export type BeautyInventoryItem = {
  name: string;
  category: string;
  status: InventoryStatus;
  quantity?: number;
  notes?: string;
  systems?: string[];
};

export type SkincarePageSpec = {
  slug: string;
  title: string;
  group: string;
  question: string;
  geometry: string;
  description: string;
  fields: string[];
};

const item = (name: string, category: string, status: InventoryStatus = 'confirmed', quantity = 1, notes?: string, systems: string[] = []): BeautyInventoryItem => ({ name, category, status, quantity, notes, systems });

export const MASTER_BEAUTY_INVENTORY: BeautyInventoryItem[] = [
  item('La Roche-Posay Lipikar AP+ Gentle Foaming Cleansing Oil','Cleansers + Makeup Removers','confirmed',1,undefined,['morning','evening','double-cleanse','travel']),
  item('OLEHENRIKSEN Truth Juice Daily Cleanser','Cleansers + Makeup Removers','backup',2,'Two physical units visible',['morning','evening','travel']),
  item('Dior La Mousse OFF/ON Foaming Cleanser','Cleansers + Makeup Removers'),
  item('Lancôme Bi-Facil Double-Action Eye Makeup Remover','Cleansers + Makeup Removers','confirmed',1,undefined,['evening','double-cleanse','makeup-removal']),
  item('Bioderma Sensibio Micellar Cleansing Oil','Cleansers + Makeup Removers','confirmed',1,undefined,['evening','double-cleanse']),
  item('Garnier SkinActive Erase It All Makeup Cleansing Balm + Hyaluronic Acid','Cleansers + Makeup Removers','confirmed',1,undefined,['evening','double-cleanse']),
  item('Skin Nutrition Botanicals Tea Tree Oil + Salicylic Acid Balancing Face Wash','Cleansers + Makeup Removers','confirmed',1,undefined,['acne','evening']),
  item('Clinique Take The Day Off Cleansing Balm, purple jar','Cleansers + Makeup Removers','confirmed',1,undefined,['evening','double-cleanse']),
  item('Clinique Take The Day Off cleansing-balm product, darker/charcoal jar','Cleansers + Makeup Removers','needs-confirmation',1,'Exact variant needs readable front label',['evening','double-cleanse']),

  item('Hero Pore Release Blackhead Clearing Solution','Toners + Exfoliating Liquids + Pore Products','confirmed',1,undefined,['exfoliation','acne','active-rotation']),
  item('PanOxyl Clarifying Exfoliant','Toners + Exfoliating Liquids + Pore Products','confirmed',1,undefined,['exfoliation','acne','active-rotation']),
  item('Differin Pore-Minimizing Toner with Witch Hazel','Toners + Exfoliating Liquids + Pore Products','confirmed',1,undefined,['exfoliation','acne']),
  item('Peach Slices Snail Rescue Blemish Busting Toner','Toners + Exfoliating Liquids + Pore Products','confirmed',1,undefined,['acne']),
  item('Bubble Moon Walk Gentle Exfoliating Toner','Toners + Exfoliating Liquids + Pore Products','confirmed',1,undefined,['exfoliation','active-rotation']),
  item('Hero Lightning Swipe Dark Spot Brightening Pads','Toners + Exfoliating Liquids + Pore Products','confirmed',1,undefined,['dark-spots','acne','active-rotation']),
  item('Thayers Facial Mist / Witch Hazel facial mist','Toners + Exfoliating Liquids + Pore Products','needs-confirmation',1,'Exact variant/scent needs readable label'),
  item('Fenty Skin cylindrical skincare product','Toners + Exfoliating Liquids + Pore Products','needs-identification',1,'Exact toner/serum variant unreadable'),

  item('TruSkin Vitamin C Super Serum+','Vitamin C','confirmed',1,undefined,['morning','active-load']),
  item('TruSkin Vitamin C Facial Serum','Vitamin C','confirmed',1,undefined,['morning','active-load']),
  item('Naturium Vitamin C Super Plus Serum','Vitamin C','confirmed',1,undefined,['morning','active-load']),
  item('Jumiso All Day Vitamin Brightening & Balancing Facial Serum','Vitamin C + Brightening','confirmed',1,undefined,['morning','brightening','active-load']),

  item('Naturium Azelaic Topical Acid 10%','Azelaic Acid','backup',2,'One active identity with two physical units',['active-rotation','acne','dark-spots']),

  item('Sunday Riley B3 Nice 10% Niacinamide Serum','Niacinamide + Brightening'),
  item('Naturium Niacinamide Serum 12% + Zinc 2%','Niacinamide + Brightening'),
  item('Good Molecules Niacinamide Serum','Niacinamide + Brightening','backup',2,'Two physical units visible'),
  item('Good Molecules Daily Brightening Serum','Niacinamide + Brightening','confirmed',1,undefined,['brightening','dark-spots']),
  item('BYOMA Brightening Serum','Niacinamide + Brightening','confirmed',1,undefined,['brightening']),
  item('Caudalie Vinoperfect Radiance Serum','Niacinamide + Brightening','confirmed',1,undefined,['brightening','dark-spots']),
  item('Dior Capture Youth Glow Booster','Niacinamide + Brightening','confirmed',1,undefined,['cosmetic-glow']),

  item('Neutrogena Hydro Boost Hyaluronic Acid Serum','Hydration + Support','confirmed',1,undefined,['morning','recovery','makeup-prep']),
  item('Naturium Quadruple Hyaluronic Acid Serum 5%','Hydration + Support','confirmed',1,undefined,['morning','recovery','makeup-prep']),
  item('TruSkin HA Hyaluronic Acid Facial Serum','Hydration + Support','confirmed',1,undefined,['morning','recovery']),
  item('Drunk Elephant B-Hydra Intensive Hydration Serum','Hydration + Support','confirmed',1,undefined,['morning','recovery','makeup-prep']),
  item('Cetaphil Ceramide Serum','Hydration + Support','confirmed',1,undefined,['barrier','recovery']),
  item('Lancôme Advanced Génifique','Hydration + Support'),
  item('BYOMA Hydrating Recovery Oil','Hydration + Support','confirmed',1,undefined,['recovery']),
  item('BYOMA hydrating blue-dropper serum/product','Hydration + Support','needs-confirmation',1,'Exact version needs confirmation'),
  item('BYOMA Clarifying Serum','Hydration + Support','confirmed',1,undefined,['clarifying']),
  item('Vertly facial serum/oil','Hydration + Support','needs-confirmation',1,'Brand visible, exact title needs close-up'),
  item('Drunk Elephant pump skincare product with colored cap #1','Hydration + Support','needs-identification',1,'Exact variant unreadable'),
  item('Drunk Elephant airless-pump product #2','Hydration + Support','needs-identification',1,'Exact variant unreadable'),

  item('Naturium Retinaldehyde Cream Serum 0.05%','Retinoids / Retinal','confirmed',1,undefined,['retinoid-night','active-rotation']),
  item('Sunday Riley Luna Sleeping Night Oil','Retinoids / Retinal','confirmed',1,undefined,['retinoid-night','active-rotation']),
  item('Hero Rescue Retinol Nighttime Renewing Cream','Retinoids / Retinal','confirmed',1,undefined,['retinoid-night','active-rotation']),
  item('BYOMA Sensitive Retinol Oil','Retinoids / Retinal','confirmed',1,undefined,['retinoid-night','active-rotation']),
  item('AMBI Even & Clear Fade Serum Retinol','Retinoids / Retinal + Dark Spots','confirmed',1,undefined,['retinoid-night','dark-spots']),
  item('CVS Health Refining Retinol Serum','Retinoids / Retinal','confirmed',1,undefined,['retinoid-night']),
  item('CeraVe retinol serum','Retinoids / Retinal','needs-confirmation',1,'Exact CeraVe version needs full front label',['retinoid-night']),

  item('AMBI Even & Clear Fade Cream','Dark Spots + Post-Acne','backup',2,'Multiple AMBI fade-treatment units visible',['dark-spots']),
  item('Additional AMBI Even & Clear fade product','Dark Spots + Post-Acne','needs-identification',1,'Exact variant partly obscured'),
  item('Differin Resurfacing Scar Gel','Scar Care + Dark Spots','confirmed',1,undefined,['scar-care','dark-spots']),
  item('CVS Health Advanced Scar Gel','Scar Care'),
  item('Silicone Scar Stick / Scar Solutions','Scar Care','backup',2,'Active stick plus boxed backup visible',['scar-care']),

  item('Oil-Free Spot Acne Treatment / Salicylic Acid Acne Medication','Acne Spot Care','confirmed',1,undefined,['acne']),
  item('CVS Health acne spot-treatment cream, blue/white tube','Acne Spot Care','needs-confirmation',1,'Exact variant unreadable',['acne']),
  item('Innisfree Pore Clearing Clay Mask 2X with Super Volcanic Clusters','Acne Spot Care + Masks','confirmed',1,undefined,['acne','mask']),
  item('Playtex Baby 40% Zinc Oxide Diaper Rash Cream','Acne Spot Care','confirmed',1,undefined,['acne']),

  item('Hero Mighty Patch The Original, 24 hydrocolloid patches','Hero Patches','confirmed',1,undefined,['acne']),
  item('Hero Mighty Patch Micropoint for Blemishes, 8 patches','Hero Patches','confirmed',1,undefined,['acne']),
  item('Hero Early-Stage Blemish patches, turquoise packet','Hero Patches','confirmed',1,undefined,['acne']),
  item('Additional Hero blemish-treatment packet/product','Hero Patches','needs-identification',1,'Visible inside patch storage bag',['acne']),

  item('Vanicream Moisturizing Cream, large pump tub','Moisturizers + Barrier','confirmed',1,undefined,['morning','evening','recovery','body']),
  item('CeraVe Moisturizing Cream, tub','Moisturizers + Barrier','confirmed',1,undefined,['morning','evening','recovery','body']),
  item('Hero Clear Collective Clarifying Prebiotic Moisturizer','Moisturizers + Barrier','confirmed',1,undefined,['morning','evening']),
  item('Lancôme Absolue cream','Moisturizers + Barrier','needs-confirmation',1,'Exact cream variant needs confirmation'),
  item('Shiseido cream/moisturizer jar','Moisturizers + Barrier','needs-confirmation',1,'Exact version needs front label'),
  item('Drunk Elephant moisturizer/treatment #1','Moisturizers + Barrier','needs-identification'),
  item('Drunk Elephant moisturizer/treatment #2','Moisturizers + Barrier','needs-identification'),

  item('No7 Restore & Renew eye-area product / eye cream','Eye Care'),
  item('CVS Health Repairing Eye Cream','Eye Care'),
  item('Drunk Elephant eye-area product','Eye Care','needs-confirmation',1,'Front label needed before locking'),
  item('Small lip-balm treatment jar with gold-tone lid','Lip Care','needs-identification'),
  item('Additional partially obscured lip-care item(s)','Lip Care','needs-identification'),
  item('Peter Thomas Roth 24K Gold Mask Pure Luxury Lift & Firm','Masks'),
  item('Other partially hidden mask/packet products','Masks','needs-identification'),

  item('La Roche-Posay Anthelios Melt-In Milk Sunscreen SPF 60, Body & Face','Face Sunscreen','confirmed',1,undefined,['spf','body-sun']),
  item('La Roche-Posay Anthelios Ultra-Light Fluid SPF 60','Face Sunscreen','confirmed',1,undefined,['spf','makeup-prep','travel']),
  item('CVS Health Ultra-Light Fluid sunscreen SPF 60','Face Sunscreen','needs-confirmation',1,'Exact variant needs confirmation',['spf']),
  item('Supergoop! Glowscreen Sunrise SPF 40','Face Sunscreen','confirmed',1,undefined,['spf','makeup-prep']),
  item('e.l.f. Suntouchable! Whoa Glow SPF 30','Face Sunscreen','confirmed',1,undefined,['spf','makeup-prep']),
  item('EltaMD UV Physical Broad-Spectrum SPF 41','Face Sunscreen','confirmed',1,undefined,['spf','makeup-prep']),
  item('Cetaphil Sun SPF 30','Face Sunscreen','needs-confirmation',1,'Exact mineral/sheer variant needs confirmation',['spf']),
  item('Bubble yellow sunscreen tube','Face Sunscreen','needs-identification',1,'Exact front label needed',['spf']),
  item('Supergoop! powder-style sunscreen product','Face Sunscreen','needs-confirmation',1,'Exact version unresolved',['spf']),
  item('White sunscreen powder/brush-style container','Face Sunscreen','needs-identification',1,'Brand unresolved',['spf']),

  item('Lancôme Soleil / Flash Bronzer self-tanning product','Self-Tan / Cosmetic Glow','needs-confirmation',1,'Exact full product name needs confirmation'),
  item('Neutrogena Beach Defense SPF 30','Body Sunscreen + After-Sun','confirmed',1,undefined,['body-sun','travel']),
  item('Clarins After-Sun Moisturizer / Soothing After-Sun Balm','Body Sunscreen + After-Sun','needs-confirmation',1,'Exact wording partly obscured',['body-sun']),

  item('Palmer’s Cocoa Butter Formula Shimmer Radiance Body Oil','Body Oils','backup',2,'Large bottle plus smaller/second bottle visible',['body']),
  item('Spring Valley Vitamin E Body Oil','Body Oils','needs-confirmation',1,undefined,['body']),
  item('Palmer’s Cocoa Butter Formula Tahitian Vanilla body oil','Body Oils','needs-confirmation',1,undefined,['body']),
  item('Palmer’s Coconut Oil Formula Brazilian Coco body oil','Body Oils','confirmed',1,undefined,['body']),
  item('Additional small body-oil bottle','Body Oils','needs-identification',1,'Partially obscured',['body']),
  item('Palmer’s Tahitian Vanilla Moisture Rich Body Cream','Body Lotions + Creams','confirmed',1,undefined,['body']),
  item('Dermasil Labs Aloe Fresh Moisturizing Body Lotion','Body Lotions + Creams','confirmed',1,undefined,['body']),
  item('CVS Health Moisturizing Dry Skin Therapy Soothing Cream','Body Lotions + Creams','confirmed',1,undefined,['body']),
  item('Pro Silk Body Moisturizing Body Lotion, Creamy Cashmere','Body Lotions + Creams','confirmed',1,undefined,['body']),
  item('Neutrogena Ultra Gentle Face & Body Moisturizer','Body Lotions + Creams','needs-confirmation',1,undefined,['body']),
  item('Redux Aloe 99% soothing gel','Body Lotions + Creams','confirmed',1,undefined,['body','recovery']),
  item('Vaseline Original Healing Jelly','Body Lotions + Creams','confirmed',1,undefined,['body','barrier']),
  item('Large body-cream/body-butter jar with gold lid','Body Lotions + Creams','needs-identification',1,undefined,['body']),
  item('Additional Dermasil body-treatment/lotion tube','Body Lotions + Creams','needs-identification',1,undefined,['body']),
  item('Small brown pump body-care product','Body Lotions + Creams','needs-identification',1,undefined,['body']),
  item('Additional small body-care jar/container','Body Lotions + Creams','needs-identification',1,undefined,['body']),
  item('Reviver Naturally Moisturizing Factors + Phytoceramides Face & Body Spray','Body Hydration Spray','confirmed',1,undefined,['body']),
  item('Mando Deodorant + Extra Strength Sweat Control, Cedar Grove','Deodorant + Sweat Control','confirmed',1,undefined,['body']),
  item('Carpe sweat-control/antiperspirant product, large orange container','Deodorant + Sweat Control','needs-confirmation',1,undefined,['body']),
  item('Carpe sweat-control/body-area product, smaller orange container','Deodorant + Sweat Control','needs-confirmation',1,undefined,['body']),
  item('Coconut Foaming Feminine Wash','Intimate Care','needs-identification',1,'Brand not readable'),
  item('T.N. Dickinson’s Witch Hazel','Body-Adjacent Care'),
  item('Megababe pump product','Other Body Care','needs-identification'),
  item('Purple-and-white striped foot/body treatment tube','Other Body Care','needs-identification'),
  item('Additional partially hidden body-treatment bottle','Other Body Care','needs-identification'),
  item('Additional small cream/lotion container','Other Body Care','needs-identification'),
  item('White oval container partly hidden under body products','Other Body Care','needs-identification'),

  item('Large rectangular LED/red-light therapy panel','Beauty Devices','confirmed',1,undefined,['red-light','device-library']),
  item('Power cable for LED panel','Device Accessories','confirmed',1,'Linked to LED panel'),
  item('Power adapter for LED panel','Device Accessories','confirmed',1,'Linked to LED panel'),
  item('Black protective/carry case for LED panel','Device Accessories','confirmed',1,'Linked to LED panel'),
  item('SOLAWAVE Radiant Renewal 4-in-1 Skincare Wand','Beauty Devices','confirmed',1,undefined,['device-library']),
  item('SOLAWAVE retail box','Device Accessories','confirmed',1,'Linked to SOLAWAVE'),
  item('Nood IPL hair-removal device','Beauty Devices','confirmed',1,undefined,['hair-removal','device-library']),
  item('Finishing Touch Flawless hair-removal device','Beauty Devices','confirmed',1,undefined,['hair-removal','device-library']),
  item('YEAMON twin-ball facial microcurrent/EMS/massage device','Beauty Devices','confirmed',1,'Visible controls: VM, MC, LED, MODE, ON/OFF',['microcurrent','device-library']),
  item('White T-bar facial massage/sculpting device','Beauty Devices','needs-identification',1,'Exact brand/model unreadable',['device-library']),
  item('White-and-green corded facial wand','Beauty Devices','needs-confirmation',1,'Exact brand/model unresolved',['device-library']),
  item('Second white corded facial-device handle','Beauty Devices','needs-identification',1,undefined,['device-library']),
  item('Associated corded-device electrical cords','Device Accessories','confirmed'),
  item('Associated corded-device power adapter','Device Accessories','confirmed'),
  item('Additional AC/DC adapter','Device Accessories','backup',2,'Multiple adapters visible'),

  item('Clear glass electrode attachment, rounded/mushroom style','Glass Electrode Attachments'),
  item('Clear glass electrode attachment, curved style','Glass Electrode Attachments'),
  item('Clear glass electrode attachment, spoon/tongue style','Glass Electrode Attachments'),
  item('Clear glass electrode attachment, straight/pointed style','Glass Electrode Attachments'),
  item('Clear glass electrode attachment, fork/Y-style','Glass Electrode Attachments'),
  item('Additional clear glass electrode #1','Glass Electrode Attachments'),
  item('Additional clear glass electrode #2','Glass Electrode Attachments'),

  item('Stainless-steel gua sha tool, wing/heart-shaped','Gua Sha + Massage Tools','confirmed',1,undefined,['gua-sha','device-library']),
  item('Wooden comb-style scalp/fascia tool with rounded metal ball-tip teeth','Gua Sha + Massage Tools','confirmed',1,undefined,['gua-sha','scalp','device-library']),
  item('Rose-quartz double-ended facial roller','Gua Sha + Massage Tools','confirmed',1,undefined,['roller','device-library']),
  item('Rose-gold electronic/vibrating stone roller/wand','Gua Sha + Massage Tools','needs-confirmation',1,undefined,['roller','device-library']),
  item('Purple/gold T-bar vibrating facial massager','Gua Sha + Massage Tools','needs-confirmation',1,undefined,['device-library']),
  item('Chrome/silver facial roller tool #1','Gua Sha + Massage Tools'),
  item('Chrome/silver facial roller tool #2','Gua Sha + Massage Tools'),
  item('Pink facial dermaplaning razor','Dermaplaning / Hair Removal','confirmed',1,undefined,['dermaplaning','device-library']),

  item('Blue CVS toothbrush','Oral Care'),
  item('Smile LED teeth-whitening device','Oral Care','needs-confirmation'),
  item('Clear dental/whitening mouth tray','Oral Care'),
  item('Smile whitening/brightening gel pen','Oral Care','needs-confirmation'),
  item('Additional clear dental tray/accessory','Oral Care','needs-identification'),
  item('Electronic foot-file/callus-removal device, blue and white','Foot Care','needs-identification',1,'Exact manufacturer/model unresolved',['body','device-library']),

  item('Large white AC/DC adapter','Device Accessories'),
  item('Second white power adapter','Device Accessories'),
  item('Multiple white charging/power cables','Device Accessories','backup',2,'Multiple cables visible'),
  item('Device plugs/connectors','Device Accessories'),
  item('Plastic storage bags for attachments','Storage + Consumables'),
  item('Protective device packaging/cases','Storage + Consumables'),
  item('Multiple clear zip-top skincare storage bags','Storage + Consumables','backup',2),
  item('Green/teal skincare cloth or washcloth','Storage + Consumables'),
  item('Clear plastic storage pouches','Storage + Consumables'),
  item('Product boxes/backstock packaging','Storage + Consumables'),
  item('Device attachment bags','Storage + Consumables'),
  item('Honeywell tabletop fan','Incidental','confirmed',1,'Recorded because it was visible; not classified as beauty care'),
];

const page = (slug:string,title:string,group:string,question:string,geometry:string,description:string,fields:string[]):SkincarePageSpec => ({slug,title,group,question,geometry,description,fields});

export const SKINCARE_PAGE_SPECS: SkincarePageSpec[] = [
  page('skin-today','Skin Today','Current Skin + Daily Decisions','What is my skin telling me today?','observational face map','Neutral observations drive today’s routine without beauty scores.',['Comfort','Hydration','Oil','Redness','Flaking','Acne activity','Texture','Hyperpigmentation','Last active','Sun exposure']),
  page('use-now','What Should I Use Now?','Current Skin + Daily Decisions','What belongs on my skin right now?','layered decision surface','Owned products rise or recede according to time, current state, schedule, testing, and compatibility.',['AM/PM','Already applied','Current state','Active schedule','Prescription timing','Makeup next','Sun exposure','Device plan']),
  page('skin-readiness','Skin Readiness','Current Skin + Daily Decisions','Can I treat tonight?','readiness gate','READY / REVIEW / RECOVERY is based on current tolerance and verified instructions, not a calendar alone.',['Irritation','Burning','Flaking','Barrier discomfort','Recent procedure','Testing','Active load']),
  page('morning','Morning Skincare','Morning System','What is the right full morning sequence today?','rising vertical pathway','Only the selected owned products enter the active routine path.',['Cleanse','Optional toner/essence','Optional Vitamin C','Hydration','Moisturizer','SPF','Lip']),
  page('quick-morning','Quick Morning','Morning System','What is enough when I only have a few minutes?','minimal countdown surface','A no-guilt minimum version prioritizes essentials.',['Cleanse if needed','Moisturizer','SPF','Lip','Time remaining']),
  page('spf-studio','SPF Studio','Morning System','Which sunscreen fits today?','circular optical sunscreen rack','Compare owned sunscreens by context and observed wear.',['Face/body','Under makeup','Outdoor','Finish','Cast','Pilling','Shine','Dryness','Travel']),
  page('makeup-prep','Makeup Prep Skincare','Morning System','Which tested base works under today’s makeup?','stacked optical film layers','Hydration, moisturizer, SPF, and makeup are evaluated as a combination.',['Pilling','Separation','Shine','Dryness','Smoothness','Wear']),
  page('evening','Evening Skincare','Evening System','What belongs in tonight’s routine?','descending pathway','Removal, cleansing, treatment, and recovery adapt to what actually happened today.',['Makeup removal','First cleanse','Second cleanse','Treatment','Moisturizer','Eye','Lip']),
  page('double-cleanse','Double Cleanse','Evening System','Do I need one cleanse or two tonight?','two cleansing basins','REMOVE and CLEANSE stay distinct, and one cleanse can be enough.',['Makeup','Water-resistant makeup','SPF load','Buildup','Sensitivity']),
  page('low-energy-pm','Low-Energy PM','Evening System','What is the essential version tonight?','quiet essential strip','The interface strips back to only what matters.',['Remove makeup if needed','Cleanse','Essential prescribed treatment','Moisturizer','Lip']),
  page('recovery-night','Recovery Night','Evening System','What helps my skin recover instead of adding more?','milky recovery chamber','Barrier-support products move forward while unnecessary actives recede.',['Gentle cleanse','Hydration','Barrier support','Moisturizer','Lip']),
  page('event-prep','Event Prep','Evening System','How do I keep my skin stable before an event?','countdown timeline','Known-tolerated products are prioritized and experiments stay outside the path.',['48 hours','24 hours','Morning of','Before makeup']),
  page('retinoid-night','Retinoid Night','Retinoid + Active System','Which one retinoid is actually active in my plan?','single-treatment protocol','The selected retinoid is central; owned alternatives remain inactive unless deliberately chosen.',['Exact product','Strength','Directions','Frequency','Last use','Next use','Tolerance','Paused products']),
  page('active-rotation','Active Rotation','Retinoid + Active System','How are my actives distributed safely across the week?','seven-pane week architecture','Current actives occupy distinct time slots; ownership alone never schedules them.',['Retinoid','Azelaic acid','Exfoliation','Dark-spot treatment','Acne treatment','Recovery']),
  page('ingredient-conflicts','Ingredient Conflicts','Retinoid + Active System','Which combinations need review, and why?','compatibility network','Warnings distinguish duplicate function, irritation overlap, manufacturer restriction, provider restriction, and unknowns.',['Current routine','Potential overlap','Manufacturer rule','Provider rule','Known reaction']),
  page('active-load','Active Load','Retinoid + Active System','Am I trying to use too many actives at once?','transparent active tower','Only currently used actives fill the tower; owned-but-inactive products sit on a separate shelf.',['Retinoid','AHA','BHA','Benzoyl peroxide','Vitamin C','Azelaic acid','Other active']),
  page('exfoliation','Exfoliation','Retinoid + Active System','What exfoliation is actually in rotation?','barrier surface + product families','Exfoliating liquids, scrubs, peels, and masks stay separate and schedule-aware.',['Strength','Face/body','Frequency','Last use','Next use','Barrier state']),
  page('barrier-lab','Barrier Lab','Barrier + Sensitivity','Does my skin need support before more treatment?','layered skin surface','Observational comfort signals guide recovery without inventing a barrier score.',['Tightness','Burning','Stinging','Flaking','Sensitivity','Visible irritation']),
  page('sensitivity','Sensitivity','Barrier + Sensitivity','What patterns are showing up in my reactions?','reaction timeline','Exposure, timing, area, and confounders are logged without blanket ingredient fear.',['Product','Area','Reaction','Onset','Duration','Other changes']),
  page('irritation-alert','Irritation Alert','Barrier + Sensitivity','Is this mild irritation or something that needs review?','calm triage gate','Glow separates mild observations from symptoms that warrant stopping, provider review, or appropriate care.',['Burning','Swelling','Persistent pain','Severe redness','Rash','Eye symptoms','Dryness','Flaking']),
  page('acne-today','Acne Today','Acne System','What acne activity is present today?','neutral lesion map','Lesions can be logged and treated without an attractiveness or severity score.',['New','Inflamed','Healing','Tender','Dryness','Hyperpigmentation','Comfort']),
  page('flare-mode','Flare Mode','Acne System','What changed around this flare?','simplified recovery field','The system simplifies first and looks at recent changes without diagnosing a cause.',['New products','More actives','Makeup','Travel','Procedure','Prescription change','Unknown']),
  page('acne-timeline','Acne Timeline','Acne System','What changed over enough time to evaluate treatment?','clinical-photo timeline','Baseline, week markers, product starts, irritation periods, photos, and provider visits share one time axis.',['Baseline','Week 2','Week 4','Week 8','Treatment starts','Photos','Provider visits']),
  page('treatment-history','Treatment History','Acne System','What have I tried, and what actually happened?','transparent intervention capsules','Past treatments preserve start/stop, directions, response, and reason discontinued.',['Treatment','Start','End','Directions','Frequency','Reaction','Result','Reason stopped']),
  page('prescriptions','Prescriptions','Prescription + Provider Care','What verified prescription care is active?','protected treatment cabinet','Prescription records are separate from cosmetic inventory and use verified directions only.',['Exact name','Strength','Form','Prescriber','Directions','Frequency','Area','Refill','Reaction']),
  page('dermatology','Dermatology','Prescription + Provider Care','What provider care is connected?','provider workspace','Real provider information appears when connected; otherwise the page stays explicitly empty.',['Provider','Practice','Last appointment','Next appointment','Contact','Plan','Instructions','Documents']),
  page('appointment-prep','Appointment Prep','Prescription + Provider Care','What should I bring to my dermatology visit?','single visit packet','Current products, prescriptions, photos, reactions, procedures, concerns, and questions become one brief.',['Products','Prescriptions','Start dates','Photos','Reactions','Concerns','Questions','Procedures']),
  page('provider-instructions','Provider Instructions','Prescription + Provider Care','Which provider rules override Glow optimization?','sealed instruction slab','Provider rules are preserved exactly and outrank ordinary routine suggestions.',['Use','Avoid','Frequency','Pause before procedure','Resume after procedure','Contact provider if','Follow-up']),
  page('product-library','Product Library','Product System','What do I own, and what is its status?','physical digital shelf','The master inventory is organized by identity and function, not duplicated by every routine that references it.',['Confirmed','Needs identification','Duplicates','Backups','Testing','Use first']),
  page('product-detail','Product Detail','Product System','What is everything Glow knows about this one product?','single-object inspection table','Identity, ownership, use, schedule, safety, performance, and provenance surround one product.',['Identity','Quantity','Purpose','Strength','Routine','Frequency','Last use','Reaction','Result','Storage','PAO']),
  page('use-first','Use First','Product System','What should I finish safely before opening more?','foreground aging shelf','Open, aging, low, and duplicated products move closer without being forced into routines.',['Opened','PAO','Expiration','Low quantity','Duplicate','Still appropriate?']),
  page('backups','Backups + Duplicates','Product System','What is active, backup, or redundant?','reserve stockroom','One product identity can have multiple physical units while functional overlap stays visible.',['Active','Backup','Quantity','Unopened','Storage','Replacement threshold']),
  page('shopping-gap','Shopping Gap Check','Product System','Do I actually need to buy anything?','gap decision engine','Glow checks existing function, backups, overlap, and untested stock before declaring a gap.',['Same-function products','Backups','Overlap','Untested','True gap','No purchase needed']),
  page('patch-test','Patch Test','Product Testing','How do I test this product in a controlled way?','small test chamber','A selected owned product gets a dedicated test record.',['Product','Area','Start date','Directions','Reaction','Decision']),
  page('new-product-test','New Product Test','Product Testing','What happens when I change one variable?','experiment timeline','Testing stays separate from active routine and records confounders.',['Status','Start date','Frequency','Area','Reaction','Breakout','Dryness','Burning','Improvement','Confounders']),
  page('product-result-log','Product Result Log','Product Testing','What do I actually think this product did for me?','personal evidence ledger','Your own comfort, finish, and repurchase evidence remains separate from creator opinion.',['Hydration','Comfort','Irritation','Breakouts','Texture','Finish','Makeup compatibility','Repurchase']),
  page('red-light','Red Light Session','Devices','How do I use my actual red-light device according to its real instructions?','device session surface','The owned panel, cable, adapter, and case remain linked; exact protocol waits for exact model/manual.',['Brand/model','Session time','Frequency','Wavelength','Eye protection','Prep','Warnings','Cleaning','Last session']),
  page('microcurrent','Microcurrent / Facial Device','Devices','Which device and protocol am I actually using?','technical facial map','YEAMON, SOLAWAVE, T-bar, and corded devices remain distinct and manufacturer-specific.',['Device','Program','Conductive product','Directions','Duration','Comfort','Reaction']),
  page('device-library','Device Library','Devices','What devices, tools, attachments, and chargers do I own?','optical equipment cabinet','Devices stay linked to their chargers, cases, attachments, cleaning, and instructions.',['Skin','Hair removal','Massage','Light','Microcurrent/EMS','Gua sha','Roller','Dermaplaning','Body','Foot']),
  page('procedure-center','Procedure Center','Procedures','What professional procedures have actually happened?','professional treatment timeline','Professional procedures are separate from at-home devices and require real event/provider data.',['Provider','Date','Reason','Pre-care','Post-care','Downtime','Paused products','Resumed products','Photos']),
  page('procedure-recovery','Procedure Recovery','Procedures','What verified recovery instructions apply right now?','restricted recovery timeline','The ordinary routine disappears while provider recovery rules are active.',['Allowed cleanser','Allowed moisturizer','SPF','Paused products','Resume rules','Warning signs','Follow-up']),
  page('active-pause-resume','Active Pause / Resume','Procedures','When can each active resume after a procedure?','pause/resume rail','Resume dates come from actual instructions, never generic assumptions.',['Retinoid','AHA','BHA','Benzoyl peroxide','Vitamin C','Other prescription']),
  page('progress-photos','Progress Photos','Progress','How do I capture comparable skin photos without turning it into constant flaw-checking?','controlled camera environment','Front, left, right, and optional close-ups use matched conditions.',['Lighting','Angle','Distance','Makeup status','Filter off','Capture date']),
  page('skin-timeline','Skin Timeline','Progress','What changed over months, and what else was happening at the same time?','longitudinal river','Photos, acne, irritation, products, prescriptions, procedures, travel, and provider visits share one timeline.',['Photos','Acne','Irritation','Product starts','Product stops','Prescriptions','Procedures','Travel','Provider visits']),
  page('before-after','Before + After','Progress','What is actually comparable between these two dates?','sliding comparison plane','Matched photos are paired with all treatment and context changes between the dates.',['Lighting','Angle','Distance','Expression','Makeup','Treatment changes','Travel','Procedures']),
  page('travel-kit','Travel Skincare Kit','Travel + Special Modes','What is the smallest appropriate kit from products I already own?','compact packing surface','Glow chooses from confirmed owned products instead of inventing minis.',['Cleanser','Moisturizer','SPF','Essential treatment','Lip','Optional treatment']),
  page('travel-adaptation','Travel Adaptation','Travel + Special Modes','How should I simplify while my environment is different?','climate adaptation surface','Climate, flights, sun, makeup, and current reactions guide simplification first.',['Climate','Dry air','Humidity','Sun exposure','Flight','Makeup','Routine disruption','Reaction']),
  page('body-skin','Body Skin · Body Treatment Lab','Body Skincare','What does each body area need, using what I already own?','full-body zone map','Body moisturizers, oils, sun care, sweat care, foot care, and special treatments remain inventory-connected.',['Chest','Back','Arms','Underarms','Hands','Elbows','Legs','Knees','Feet','Moisturize','Oil','Hydration','Sun','Sweat']),
];

export const INVENTORY_STATUS_LABEL: Record<InventoryStatus,string> = {
  confirmed: 'Confirmed',
  backup: 'Physical duplicate / backup',
  'needs-confirmation': 'Needs confirmation',
  'needs-identification': 'Needs identification',
};

export function normalizeBeautyName(value:string){
  return value.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
