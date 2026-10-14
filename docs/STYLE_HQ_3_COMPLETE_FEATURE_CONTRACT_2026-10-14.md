# Glow OS — STYLE HQ 3.0 Complete Feature Contract
Status: implementation plan + incremental rollout. This document does NOT mean every capability is implemented or deployed.
Source: CLOSET + STYLE + FASHION SYSTEM(4).pdf (89 pages; Batch 13 contains 205 numbered items) plus the STYLE HQ 2.0 and 3.0 user-approved discussion on 2026-10-14.

## Permanent architecture
- Preserve the existing /closet route, canonical item identities, user-scoped storage, wear history, cost per wear, laundry/repair and wishlist status.
- Reuse the root Glow Current shell, global Ask Glow/Shakti, canonical page manifest, centralized intelligence, audit/receipt and cross-world objects. Do not introduce another sidebar, chat runtime, ORM, database or duplicate inventory.
- Notion = persistent planning, references, instructions and rich library; Glow OS = live action interface and intelligence based on verified canonical data. Sync requires real authorized connectors; do not imply that a Notion record is already synchronized.
- Never hardcode screenshot content or imagined owned products in production. Empty views stay honest. Creator fashion advice is labeled as opinion, not universal truth.
- Visual language: white/ivory editorial minimalism, subtle dusty rose, glass/material effects only when useful, serif hero, legible functional text, photographic cards; 1990s NYC editorial, vintage European, romantic accents; low-density first viewport.
- Shared references: docs/GLOW_GLOBAL_SHELL_NAVIGATION_SYNC_CONSTITUTION_2026-09-10.md, AGENTS.md and canonical manifesto.

## Page map and records
1. /closet STYLE HQ — NOW (outfit, upcoming needs, care), quick capture and collections.
2. Digital Wardrobe — real photos (front/back/detail), owner, garment type, brand/store, size, fit, cut, rise, length, fabric, weight, drape, texture, lining, transparency, stretch, color, pattern, tags, season, occasion, comfort, condition, exact physical home, ownership status, purchase info, wear count, cost per wear, availability, history.
3. Outfit Studio — real outfit photos, garment relations, anchor piece, shoes/bag/accessories, undergarments, hair/makeup/fragrance/nails, event, weather, date, dress code, confidence, comfort, practical success, repeat, version, calendar history, three modes (quick, normal, creative).
4. Shopping Studio — dream wishlist vs actual wardrobe gaps; saved photo, product/store link, price, size/color, budget, priority, hold period, owned alternatives, duplicates, borrow/thrift/swap/repair alternatives, three-outfit test, creator five-year/80%-versatile tests explicitly optional, purchases, returns, order status.
5. Fashion Directory — Stores + Brands (URL, type, aesthetic, price tier, category, sizing notes, local address optional, favorites, related finds and purchases); Fashion Links + Finds (URL, reason, category, intent wishlist/inspiration/research/gift/store reference, external source, image, related store).
6. Style Identity — original measurements with measured date, fit journal, signature visuals, silhouette experiments, multiple aesthetic weights, palettes, textures, colors, Pinterest, runway and proportion formulas; actual try-on supersedes creator heuristics; personal worth never inferred from measurements or clothing.
7. Care + Repairs — garment-specific care labels, laundry clean/dirty/drying/cleaner/repair, mending (button, seam, hole, hem, loose stitch), tailoring (waist, sleeve, straps, fit), provider/drop-off/pickup cost, DIY/upcycle techniques, donate/sell/swap/borrow queues, garment-safe practices.
8. Capsule + Packing — active vs off-season, special/archived, work, travel, event, season, optional 30-day test; no forced decluttering; exact storage and packing checklists, wardrobe gaps only after trying owned pieces.
9. Ritual Library — one reusable routine per stable ID with category, frequency, optional schedule, duration, supplies, safety, exact instructions, linked clothes/outfits/tasks; separate dated session/completion log and actual streaks. Daily dressing, after-wear return, weekly outfit planning, weekly closet reset, accessory rotation, wishlist review, fortnightly repair inspection, monthly wardrobe audit/analytics, seasonal transition, pre-event full look, dress-up experiments, shopping decisions, travel packing, mending/upcycling.
10. Analytics — chart by category/color/season, photographed inventory percentage, items/wears per period, most/least worn, cost per wear, outfit repetition, condition and care queue, wishlist decisions, real purchase totals, routine completion. Never show invented sample data as user history.
11. Source Archive — preserved original PDF paragraphs, images, 205 numbered entries and page citations; source claims split from Glow additions. Original pdf remains the source of truth for attribution.

## 205 source item coverage mapping (number ranges preserve exact item IDs)
1-22 identity, shopping-before-trends, multiple aesthetics, textures, confidence and social-perception safeguards.
23-40 digital closet, outfit repeat, photographic history, Pinterest recreation and creative sessions.
41-51 runway translation, alternatives to buying and accessories.
52-68 capsule tests, closet edit, archive, swap, borrow formalwear, no forced discard.
69-82 mending, repairs, alterations, thrift fixes, DIY/upcycling and equipment.
83-94 hair as accessory, complete look, color wheel, tonal/mono/three-color optional formulas.
95-103 juxtaposition, skin exposure choice, fancy/casual balance, white/anything source opinion.
104-125 fit, fabric structure and garment physics, proportion experimentation, undergarment and support kit.
126-141 lifestyle/calendar fit, statement pieces, versatile budgeting, five-year and three-outfit purchase filters.
142-163 layering, anchor pieces, quick/normal/creative outfit modes, event/work/travel and seasonal weather tags.
164-172 formula records, category-specific inventory and photo cards.
173-185 condition, repair/alter/upcycle/donate/archives, cost per wear, wear count, confidence portfolio.
186-203 outcome signals, outfit recommendation inputs, laundry availability, physical storage, similarity check, wishlist, purchase decisions, master outfit/shopping/reset workflows and page architecture.
204-205 keep creator's subjective claims source-specific and retain full Batch 13 closure.

## Core shopping and outfit workflows
SHOP: desire -> search existing inventory -> duplicates -> restyle -> repair/alter -> borrow/swap/thrift -> life/occasion fit -> independent taste -> 3 outfit compatibility -> budget -> real decision and receipt.
DRESS: check event/weather/dress code -> anchor item -> clean available owned clothes -> base -> fit -> layer -> footwear/bag/accessory -> support garment/hair/makeup -> save outfit record -> log actual wear -> return home.
RESET: inventory -> season -> favorites/never worn -> review reason -> repair/alter -> sell/donate (approval) -> sentimental archive -> rotate -> accessory edit -> new looks from owned -> update only verified gaps.

## Complete routine card template
Canonical routine ID; Life Area; category; frequency; duration; preferred window; what/why; tools/supplies; photos/diagram; preparation; ordered steps; completion checklist; linked outfit/garment; care; exceptions; next due; completion logs; latest completion; reflection. No permanent checked state for recurring steps.
Starter sessions:
Daily outfit: check calendar, weather, dress code, choose clean anchor, complete look, comfort, log.
Weekly outfit planning: upcoming events, prechoose outfits, laundry check, try-ons, images, outfit calendar.
Closet reset: clear floor, return items, identify dirty/care/repair, rotate available garments, update precise storage.
Dress-up: choose 5–10 pieces, test pairings, document photos, mark yes/maybe/no, write why.
Wishlist decision: save desire, compare duplicates, 3 looks, repair/borrow check, budget/wait, decision.
Seasonal rotation: climate, active season, condition/care, off-season storage, capsule and real gap review.
Before event: occasion/dress requirements, test complete look, undergarments, shoes, clothing care, bag, photos, packing and schedule.
Repair: diagnose material/care label, choose appropriate skill/provider, steps, finished photo and result.

## Outfit recipe cards
Fitted top + wide-leg trousers + structured layer + bag + shoe; lace + leather; dressy/casual contrast; tonal; monochromatic; complementary colors; optional three-color; white + color; cropped top + high rise; oversized top + narrow bottom; anchor/accessory first; optional exposure balancing; layering; runway interpretation; random pair; forgotten piece; work, errand, date, dinner, formal, interview and travel capsules.
Each formula is a *template*, not proof of owned garments.

## Required verified feature acceptance
- Every persistent record belongs to authenticated user; all writes scope user ID, links allow only http/https; meaningful mutations have truthful success/error and history.
- Images: working upload with durable storage (planned), URLs as basic interim alternative; preview, replace, provenance and removal; no image-generation mock replaces user assets.
- All gallery cards can open, edit, archive and restore; search, category filter, sorting, mobile tap targets and keyboard navigation work.
- Wishlist/store/product/outfit relations reflect real canonical IDs, no duplicate owners of wardrobe objects.
- Recurring session completion creates a new log; events/time remain calendar-owned.
- Empty states and charts only use recorded data; no autogenerated fake outfits.
- Canonical /closet/fashion-directory route is in manifest and Global Glow navigation continues.
- Validate on iPhone, iPad and desktop; screen reader labels, keyboard, contrast, reduced motion; verify build/lint/tests and live deployment separately.
- Do not mark features above 'done' merely because they appear in this contract.

## Implementation journal (2026-10-14)
- Existing /closet found with create item, wishlist, laundry, repair, favorite, wear, costs, and basic clean-item pairings.
- Added image URL input and persistence in create/update flows; this is a URL field, NOT phone photo upload.
- Added /closet/fashion-directory using existing important_links table, user-scoped storage, kind store/find, category, notes, favorite/pinned, archive, safe external link, and link from /closet.
- Registered new route in canonical page manifest.
- Outstanding: actual image uploads, richer inventory fields, entity relations, search/filter UX, outfit persistence, dedicated wishlist detailed properties, routine sessions, calendar integration, advanced graphs, source index entries and testing/deployment. Do not imply otherwise.
