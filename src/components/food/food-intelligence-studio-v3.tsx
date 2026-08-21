'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import {
  ArrowRight,
  Check,
  ChefHat,
  ChevronLeft,
  Clock3,
  Heart,
  Mic2,
  PackageCheck,
  Refrigerator,
  Search,
  ShoppingBasket,
  TimerReset,
  Utensils,
  X,
} from 'lucide-react';
import {
  addAllFoodDraftGroceriesAction,
  addFoodGroceryAction,
  addFoodLeftoverAction,
  completeFoodMealPrepAction,
  createFoodCustomRecipeAction,
  recordFoodMealPrepStepAction,
  recordFoodRecipeUseAction,
  saveFoodMealPlanAction,
  setFoodGroceryStatusAction,
  setFoodRecipePreferenceAction,
  startFoodMealPrepAction,
  updateFoodInventoryAction,
  useFoodLeftoverAction as consumeFoodLeftoverAction,
} from '@/app/actions/food-intelligence';

type Ingredient = { name: string; amount?: string; note?: string };
type RecipeStep = { text: string; seconds?: number; parallelHint?: string };
type Recipe = {
  id: string;
  title: string;
  primaryCategory: string;
  categories: string[];
  tags: string[];
  recipeStatus: string;
  servings: string | null;
  prepMinutes: number | null;
  cookMinutes: number | null;
  totalMinutes: number | null;
  ingredients: Ingredient[];
  instructions: RecipeStep[];
  notes: string | null;
  favorite: boolean;
  rotation: string;
  rating: string | null;
  feedback: string[];
  useCount: number;
  lastUsedAt: string | null;
};
type Inventory = { id: string; normalizedName: string; name: string; category: string; state: string; quantity: number | null; unit: string | null; minimumQuantity: number | null; expiresAt: string | null; groceryDraft: boolean; updatedAt: string };
type Grocery = { id: string; normalizedName: string; name: string; category: string; quantity: number | null; unit: string | null; status: string; source: string };
type MealPlan = { id: string; mealDate: string; mealType: string; recipeId: string | null; title: string; status: string; servings: number | null };
type Leftover = { id: string; recipeId: string | null; title: string; servingsRemaining: number; expiresAt: string | null };
type PrepStep = { id: string; title: string; seconds: number; parallelHint?: string };
type PrepRun = { id: string; title: string; status: string; queue: PrepStep[]; completedStepIds: string[]; skippedStepIds: string[]; currentIndex: number; actualSeconds: number };
type FoodEvent = { id: string; title: string; occurredAt: string };
type FoodState = { recipes: Recipe[]; inventory: Inventory[]; groceries: Grocery[]; mealPlans: MealPlan[]; leftovers: Leftover[]; prepRuns: PrepRun[]; events: FoodEvent[] };
type Tab = 'Today' | 'Meal Plan' | 'Recipes' | 'Pantry' | 'Groceries' | 'Meal Prep' | 'Smoothies' | 'Food Studio';

const TABS: Tab[] = ['Today', 'Meal Plan', 'Recipes', 'Pantry', 'Groceries', 'Meal Prep', 'Smoothies', 'Food Studio'];
const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const SMOOTHIE = { Liquid: ['Water', 'Almond milk', 'Milk'], Fruit: ['Frozen fruit', 'Strawberries', 'Blueberries'], Greens: ['Spinach', 'Kale'], 'Add-ons': ['Collagen powder', 'Honey', 'Vanilla protein powder', 'Sea moss gel'] };
const BOWL = { Protein: ['Shrimp', 'Extra-firm tofu', 'Salmon', 'Butter beans'], Base: ['White rice', 'Quinoa', 'Potatoes', 'Greens'], Vegetables: ['Spinach', 'Bell peppers', 'Cucumber', 'Carrots'], Flavor: ['Soy sauce', 'Miso paste', 'Lemon', 'Garlic'] };

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function recipeMinutes(recipe: Recipe) {
  if (recipe.totalMinutes != null) return recipe.totalMinutes;
  const total = (recipe.prepMinutes ?? 0) + (recipe.cookMinutes ?? 0);
  return total > 0 ? total : null;
}
function words(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((item) => item.length > 2);
}
function pantryMatch(recipe: Recipe, inventory: Inventory[]) {
  const stocked = inventory.filter((item) => item.state === 'in_stock' || item.state === 'use_soon');
  if (!recipe.ingredients.length) return { have: 0, total: 0 };
  let have = 0;
  for (const ingredient of recipe.ingredients) {
    const ingredientWords = words(ingredient.name);
    if (stocked.some((item) => ingredientWords.some((word) => item.name.toLowerCase().includes(word)))) have += 1;
  }
  return { have, total: recipe.ingredients.length };
}
function mealTypeFor(hour: number): typeof MEALS[number] {
  if (hour < 11) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 20) return 'dinner';
  return 'snack';
}
function groupBy<T>(items: T[], key: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((accumulator, item) => {
    const group = key(item);
    if (!accumulator[group]) accumulator[group] = [];
    accumulator[group].push(item);
    return accumulator;
  }, {});
}

function Builder({ title, groups, selected, setSelected, onSave }: { title: string; groups: Record<string, string[]>; selected: string[]; setSelected: (value: string[]) => void; onSave: () => void }) {
  return (
    <section className="rounded-[26px] border border-[#e5e2d7] bg-white p-5">
      <p className="text-[10px] uppercase tracking-[.15em] text-[#7c796f]">Food Studio</p>
      <h2 className="glow-display mt-1 text-2xl">{title}</h2>
      {Object.entries(groups).map(([group, items]) => (
        <div key={group} className="mt-4">
          <p className="text-xs font-medium">{group}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {items.map((item) => (
              <button type="button" key={item} onClick={() => setSelected(selected.includes(item) ? selected.filter((value) => value !== item) : [...selected, item])} aria-pressed={selected.includes(item)} className={`rounded-full px-3 py-2 text-xs ${selected.includes(item) ? 'bg-[#6e7b63] text-white' : 'bg-[#f2f0e8]'}`}>{item}</button>
            ))}
          </div>
        </div>
      ))}
      <p className="mt-4 text-xs text-[#8d857c]">Selected: {selected.length ? selected.join(' · ') : 'none yet'}</p>
      <button type="button" onClick={onSave} className="mt-4 rounded-full bg-[#78604b] px-4 py-2.5 text-xs text-white">Save to Recipes</button>
    </section>
  );
}

export function FoodIntelligenceStudioV3({ initial, nextEvent, foodSpendCents, foodPurchaseCount }: { initial: FoodState; nextEvent: { id: string; title: string; startAt: string } | null; foodSpendCents: number; foodPurchaseCount: number }) {
  const [tab, setTab] = useState<Tab>('Today');
  const [recipes, setRecipes] = useState(initial.recipes);
  const [inventory, setInventory] = useState(initial.inventory);
  const [groceries, setGroceries] = useState(initial.groceries);
  const [mealPlans, setMealPlans] = useState(initial.mealPlans);
  const [leftovers, setLeftovers] = useState(initial.leftovers);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cook, setCook] = useState<{ recipe: Recipe; index: number } | null>(null);
  const [minutes, setMinutes] = useState(15);
  const [smoothie, setSmoothie] = useState<string[]>([]);
  const [bowl, setBowl] = useState<string[]>([]);
  const [prep, setPrep] = useState<PrepRun | null>(initial.prepRuns.find((run) => run.status === 'active') ?? null);
  const [prepSeconds, setPrepSeconds] = useState(0);
  const [shopping, setShopping] = useState(false);
  const [pending, startTransition] = useTransition();

  const now = new Date();
  const today = dateKey(now);
  const mealType = mealTypeFor(now.getHours());
  const todaysMeals = mealPlans.filter((meal) => meal.mealDate === today);
  const reviewCount = inventory.filter((item) => item.state === 'review').length;
  const useSoon = inventory.filter((item) => item.state === 'use_soon');
  const out = inventory.filter((item) => item.state === 'out');
  const draft = groceries.filter((item) => item.status === 'draft');
  const listed = groceries.filter((item) => item.status === 'listed');
  const activeLeftovers = leftovers.filter((item) => item.servingsRemaining > 0);
  const availableMinutes = nextEvent ? Math.max(0, Math.floor((new Date(nextEvent.startAt).getTime() - Date.now()) / 60_000)) : null;
  const foodSpend = (foodSpendCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const currentPrepStep = prep?.queue[prep.currentIndex] ?? null;

  const recommendations = useMemo(() => recipes
    .filter((recipe) => recipe.recipeStatus === 'complete')
    .map((recipe) => ({ recipe, match: pantryMatch(recipe, inventory), mins: recipeMinutes(recipe) }))
    .filter((item) => item.mins == null || item.mins <= minutes || minutes >= 60)
    .sort((a, b) => {
      const pantryA = a.match.total ? a.match.have / a.match.total : 0;
      const pantryB = b.match.total ? b.match.have / b.match.total : 0;
      const categoryA = a.recipe.categories.some((category) => category.toLowerCase().includes(mealType)) ? 1 : 0;
      const categoryB = b.recipe.categories.some((category) => category.toLowerCase().includes(mealType)) ? 1 : 0;
      return (categoryB - categoryA) || (pantryB - pantryA) || ((a.mins ?? 999) - (b.mins ?? 999));
    })
    .slice(0, 6), [inventory, mealType, minutes, recipes]);

  const filteredRecipes = recipes
    .filter((recipe) => !query || `${recipe.title} ${recipe.categories.join(' ')} ${recipe.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.title.localeCompare(b.title));

  function say(text: string) {
    window.dispatchEvent(new CustomEvent('glow:speak', { detail: { text } }));
  }
  function toast(text: string) {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 3500);
  }
  function changeInventory(item: Inventory, state: 'in_stock' | 'out' | 'use_soon' | 'review') {
    startTransition(async () => {
      const result = await updateFoodInventoryAction({ id: item.id, state });
      if (!result.data) return toast(result.error ?? 'Could not update pantry.');
      const row = result.data as Inventory;
      setInventory((current) => current.map((entry) => entry.id === item.id ? row : entry));
      if (state === 'out') toast(`${item.name} moved to the grocery draft.`);
    });
  }
  function addGrocery(name: string, category = 'Other') {
    startTransition(async () => {
      const result = await addFoodGroceryAction({ name, category, status: 'listed' });
      if (!result.data) return toast(result.error ?? 'Could not add grocery.');
      const row = result.data as Grocery;
      setGroceries((current) => current.some((item) => item.id === row.id) ? current : [...current, row]);
      toast(`${name} added to groceries.`);
    });
  }
  function groceryDone(item: Grocery) {
    startTransition(async () => {
      const result = await setFoodGroceryStatusAction({ id: item.id, status: 'completed' });
      if (!result.data) return toast(result.error ?? 'Could not update grocery.');
      setGroceries((current) => current.filter((entry) => entry.id !== item.id));
      setInventory((current) => current.map((entry) => entry.normalizedName === item.normalizedName ? { ...entry, state: 'in_stock', groceryDraft: false } : entry));
    });
  }
  function toggleFavorite(recipe: Recipe) {
    startTransition(async () => {
      const result = await setFoodRecipePreferenceAction({ id: recipe.id, favorite: !recipe.favorite });
      if (!result.data) return toast(result.error ?? 'Could not update favorite.');
      const row = result.data as Recipe;
      setRecipes((current) => current.map((item) => item.id === recipe.id ? row : item));
      if (selectedRecipe?.id === recipe.id) setSelectedRecipe(row);
    });
  }
  function planRecipe(recipe: Recipe, type: typeof MEALS[number] = mealType) {
    startTransition(async () => {
      const result = await saveFoodMealPlanAction({ mealDate: today, mealType: type, recipeId: recipe.id, title: recipe.title, status: 'planned' });
      if (!result.data) return toast(result.error ?? 'Could not plan meal.');
      const row = result.data as MealPlan;
      setMealPlans((current) => [...current.filter((item) => !(item.mealDate === today && item.mealType === type)), row]);
      toast(`${recipe.title} planned for ${type}.`);
    });
  }
  function markMeal(meal: MealPlan) {
    startTransition(async () => {
      const result = await saveFoodMealPlanAction({ mealDate: meal.mealDate, mealType: meal.mealType, recipeId: meal.recipeId, title: meal.title, status: 'ate' });
      if (!result.data) return toast(result.error ?? 'Could not update meal.');
      const row = result.data as MealPlan;
      setMealPlans((current) => current.map((item) => item.id === meal.id ? row : item));
    });
  }
  function startCook(recipe: Recipe) {
    if (recipe.recipeStatus !== 'complete' || !recipe.instructions.length) return toast('The original complete instructions are not available for this recipe yet.');
    setCook({ recipe, index: 0 });
    say(`Starting ${recipe.title}. ${recipe.instructions[0].text}`);
  }
  function nextCook() {
    if (!cook) return;
    const nextIndex = cook.index + 1;
    if (nextIndex >= cook.recipe.instructions.length) {
      startTransition(async () => {
        const result = await recordFoodRecipeUseAction(cook.recipe.id);
        if (result.data) setRecipes((current) => current.map((recipe) => recipe.id === cook.recipe.id ? { ...recipe, useCount: recipe.useCount + 1, lastUsedAt: new Date().toISOString() } : recipe));
        toast(`${cook.recipe.title} cooked.`);
        setCook(null);
      });
      return;
    }
    setCook({ ...cook, index: nextIndex });
    say(cook.recipe.instructions[nextIndex].text);
  }
  function startPrep() {
    startTransition(async () => {
      const result = await startFoodMealPrepAction();
      if (!result.data) return toast(result.error ?? 'Could not start Meal Prep.');
      setPrep(result.data as PrepRun);
      setTab('Meal Prep');
    });
  }
  function savePrepStep(status: 'completed' | 'skipped') {
    if (!prep || !currentPrepStep) return;
    startTransition(async () => {
      const result = await recordFoodMealPrepStepAction({ runId: prep.id, stepId: currentPrepStep.id, status, actualSeconds: prepSeconds });
      if (!result.data) return toast(result.error ?? 'Could not save prep step.');
      let run = result.data as PrepRun;
      setPrepSeconds(0);
      if (run.currentIndex >= run.queue.length) {
        const finished = await completeFoodMealPrepAction(run.id);
        if (finished.data) run = finished.data as PrepRun;
      }
      setPrep(run);
      if (run.status === 'completed') toast('Meal Prep complete.');
    });
  }
  function saveBuilder(kind: 'smoothie' | 'bowl') {
    const items = kind === 'smoothie' ? smoothie : bowl;
    if (!items.length) return toast('Choose ingredients first.');
    const title = kind === 'smoothie' ? `My Smoothie · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : `My Bowl · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    startTransition(async () => {
      const result = await createFoodCustomRecipeAction({ title, primaryCategory: kind === 'smoothie' ? 'drinks' : 'meal', categories: kind === 'smoothie' ? ['Drinks & Smoothies'] : ['Lunch', 'Dinner'], tags: [kind, 'created in Glow'], ingredients: items, notes: 'Built from ingredients selected in Glow Food Studio.' });
      if (!result.data) return toast(result.error ?? 'Could not save recipe.');
      setRecipes((current) => [result.data as Recipe, ...current]);
      toast(`${title} saved.`);
    });
  }
  function addLeftover() {
    const title = window.prompt('What did you make?')?.trim();
    if (!title) return;
    const servings = Number(window.prompt('How many servings remain?', '2') ?? 0);
    if (!Number.isFinite(servings) || servings <= 0) return toast('Enter a valid number of servings.');
    startTransition(async () => {
      const result = await addFoodLeftoverAction({ title, servingsRemaining: servings });
      if (!result.data) return toast(result.error ?? 'Could not save leftovers.');
      setLeftovers((current) => [result.data as Leftover, ...current]);
    });
  }
  function consumeLeftover(leftover: Leftover) {
    startTransition(async () => {
      const result = await consumeFoodLeftoverAction(leftover.id, 1);
      if (!result.data) return toast(result.error ?? 'Could not update leftovers.');
      setLeftovers((current) => current.map((item) => item.id === leftover.id ? result.data as Leftover : item));
    });
  }

  if (cook) {
    const current = cook.recipe.instructions[cook.index];
    const progress = Math.round(((cook.index + 1) / cook.recipe.instructions.length) * 100);
    return (
      <div className="fixed inset-0 z-[130] overflow-y-auto bg-[radial-gradient(circle_at_30%_15%,#fffdf5,#f3eadb_48%,#dfe8d8)] p-5">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => setCook(null)} aria-label="Close Cook Mode" className="rounded-full bg-white/70 p-3"><ChevronLeft size={18} aria-hidden="true" /></button>
            <p className="text-center text-xs uppercase tracking-[.16em]">Cook Mode · {cook.recipe.title}</p>
            <button type="button" onClick={() => say(current.text)} aria-label="Read step aloud" className="rounded-full bg-white/70 p-3"><Mic2 size={17} aria-hidden="true" /></button>
          </div>
          <div className="mt-20 text-center">
            <p className="text-xs text-[#9b8c7c]">{cook.index + 1} / {cook.recipe.instructions.length}</p>
            <div role="progressbar" aria-label="Cooking progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="mx-auto mt-3 h-2 max-w-md overflow-hidden rounded-full bg-white/60"><div className="h-full rounded-full bg-[#7b725e]" style={{ width: `${progress}%` }} /></div>
            <div className="mx-auto mt-5 max-w-lg rounded-[34px] bg-white/65 p-8 shadow-xl">
              <ChefHat className="mx-auto text-[#a06d54]" aria-hidden="true" />
              <h1 className="glow-display mt-4 text-3xl">{current.text}</h1>
              {current.parallelHint ? <p className="mt-4 rounded-2xl bg-[#eef2e6] p-3 text-sm"><b>While this cooks:</b> {current.parallelHint}</p> : null}
            </div>
            <button type="button" onClick={nextCook} className="mt-7 rounded-full bg-[#765b45] px-7 py-3.5 text-sm text-white">{cook.index === cook.recipe.instructions.length - 1 ? 'Finish cooking' : 'Next step'}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      {notice ? <div role="status" className="fixed right-4 top-4 z-[140] max-w-xs rounded-2xl bg-[#3f3a32] px-4 py-3 text-xs text-white shadow-xl">{notice}</div> : null}

      <section className="rounded-[32px] border border-[#ece3d7] bg-[radial-gradient(circle_at_85%_10%,rgba(187,205,166,.46),transparent_28%),linear-gradient(135deg,#fffaf1,#f3eadc_58%,#e5eadc)] p-6 sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="text-[10px] uppercase tracking-[.2em] text-[#817466]">Food · Decide → Prepare → Cook → Remember</p>
            <h1 className="glow-display mt-2 text-4xl sm:text-5xl">Food Intelligence</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#766d61]">Use what you actually own, plan from saved recipes, shop only for confirmed gaps, and keep leftovers visible before they disappear.</p>
            <div className="mt-5 flex flex-wrap gap-2">{TABS.map((item) => <button key={item} type="button" onClick={() => setTab(item)} aria-pressed={tab === item} className={`rounded-full px-3.5 py-2 text-xs ${tab === item ? 'bg-[#675a48] text-white' : 'bg-white/70 text-[#6d6257]'}`}>{item}</button>)}</div>
          </div>
          <div className="rounded-[24px] bg-white/65 p-5 backdrop-blur">
            <p className="text-[9px] uppercase tracking-[.15em] text-[#8d8275]">Right now</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs"><div className="rounded-2xl bg-white p-3"><b className="block text-xl">{inventory.filter((item) => item.state === 'in_stock').length}</b>in stock</div><div className="rounded-2xl bg-white p-3"><b className="block text-xl">{activeLeftovers.length}</b>leftovers</div><div className="rounded-2xl bg-white p-3"><b className="block text-xl">{listed.length}</b>shopping</div><div className="rounded-2xl bg-white p-3"><b className="block text-xl">{foodSpend}</b>this month</div></div>
            <p className="mt-3 text-[10px] text-[#82776b]">{nextEvent ? `${nextEvent.title} is next. About ${availableMinutes} min until it starts.` : 'No upcoming calendar event is limiting meal time.'}</p>
          </div>
        </div>
      </section>

      {tab === 'Today' ? (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[26px] bg-white p-5">
            <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] uppercase tracking-[.15em] text-[#8d8275]">What should I eat?</p><h2 className="glow-display mt-1 text-2xl">Best next options</h2></div><Utensils aria-hidden="true" /></div>
            <div className="mt-4 flex gap-2">{[5, 15, 30, 60].map((value) => <button type="button" key={value} onClick={() => setMinutes(value)} aria-pressed={minutes === value} className={`rounded-full px-3 py-2 text-xs ${minutes === value ? 'bg-[#6d7b61] text-white' : 'bg-[#eef2e8]'}`}>{value === 60 ? 'More' : `${value} min`}</button>)}</div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">{recommendations.slice(0, 4).map(({ recipe, match, mins }) => <article key={recipe.id} className="rounded-[22px] bg-[#fffaf4] p-4"><div className="flex justify-between gap-3"><div><h3 className="glow-display text-xl">{recipe.title}</h3><p className="text-xs text-[#7f7468]">{mins ? `${mins} min` : 'Time not stored'} · {match.total ? `${match.have}/${match.total} pantry match` : 'ingredients unavailable'}</p></div><button type="button" onClick={() => toggleFavorite(recipe)} aria-label={recipe.favorite ? 'Remove favorite' : 'Favorite recipe'}><Heart size={17} className={recipe.favorite ? 'fill-[#b96d68] text-[#b96d68]' : ''} /></button></div><div className="mt-3 flex gap-2"><button type="button" onClick={() => setSelectedRecipe(recipe)} className="text-xs underline">View</button><button type="button" onClick={() => planRecipe(recipe)} className="text-xs underline">Plan</button>{recipe.instructions.length ? <button type="button" onClick={() => startCook(recipe)} className="rounded-full bg-[#765b45] px-3 py-2 text-xs text-white">Cook</button> : null}</div></article>)}</div>
          </section>
          <section className="rounded-[26px] bg-white p-5"><h2 className="glow-display text-2xl">Today&apos;s meals</h2><div className="mt-4 space-y-2">{MEALS.map((type) => { const meal = todaysMeals.find((item) => item.mealType === type); return <div key={type} className="flex items-center justify-between rounded-2xl bg-[#faf7f1] p-3"><div><small className="uppercase">{type}</small><p className="text-sm">{meal?.title ?? 'Not planned'}</p></div>{meal && meal.status !== 'ate' ? <button type="button" onClick={() => markMeal(meal)} className="rounded-full bg-[#e9efe4] px-3 py-1.5 text-[10px]">Ate it</button> : null}</div>; })}</div><button type="button" onClick={() => setTab('Meal Plan')} className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#765b45]">Open meal plan <ArrowRight size={12} /></button></section>
        </div>
      ) : null}

      {tab === 'Food Studio' ? <div className="grid gap-4 lg:grid-cols-2"><Builder title="Build a Smoothie" groups={SMOOTHIE} selected={smoothie} setSelected={setSmoothie} onSave={() => saveBuilder('smoothie')} /><Builder title="Build a Bowl" groups={BOWL} selected={bowl} setSelected={setBowl} onSave={() => saveBuilder('bowl')} /></div> : null}

      {tab === 'Recipes' ? <><div className="flex items-center gap-2 rounded-[24px] bg-white p-4"><Search size={16} aria-hidden="true" /><label htmlFor="food-recipe-search" className="sr-only">Search recipes</label><input id="food-recipe-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search every Food-folder recipe" className="w-full bg-transparent text-sm outline-none" /></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filteredRecipes.map((recipe) => { const match = pantryMatch(recipe, inventory); return <article key={recipe.id} className="rounded-[24px] bg-white p-4"><div className="flex justify-between gap-3"><div><h3 className="glow-display text-xl">{recipe.title}</h3><p className="text-xs">{recipe.categories.join(' · ')}</p></div><button type="button" onClick={() => toggleFavorite(recipe)} aria-label={recipe.favorite ? 'Remove favorite' : 'Favorite recipe'}><Heart size={17} className={recipe.favorite ? 'fill-[#b96d68] text-[#b96d68]' : ''} /></button></div>{recipe.recipeStatus === 'missing_measurements' ? <p className="mt-3 rounded-xl bg-[#f8efe7] p-3 text-xs">Original measurements were not recoverable. Glow will not invent them.</p> : <p className="mt-3 text-xs">{recipe.ingredients.length} ingredients · {match.have}/{match.total} confirmed in pantry</p>}<div className="mt-4 flex gap-2"><button type="button" onClick={() => setSelectedRecipe(recipe)} className="text-xs underline">View</button><button type="button" onClick={() => planRecipe(recipe)} className="text-xs underline">Plan</button>{recipe.instructions.length ? <button type="button" onClick={() => startCook(recipe)} className="rounded-full bg-[#775c46] px-3 py-2 text-xs text-white">Cook</button> : null}</div></article>; })}</div></> : null}

      {tab === 'Pantry' ? <><section className="rounded-[24px] bg-[#faf7ef] p-5"><div className="flex gap-3"><Refrigerator aria-hidden="true" /><div><h2 className="glow-display text-2xl">Pantry</h2><p className="text-sm">Confirm what is actually in your kitchen. Glow does not assume imported items are stocked.</p></div></div><div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs"><span>In stock<br /><b>{inventory.filter((item) => item.state === 'in_stock').length}</b></span><span>Use soon<br /><b>{useSoon.length}</b></span><span>Out<br /><b>{out.length}</b></span><span>Review<br /><b>{reviewCount}</b></span></div></section>{Object.entries(groupBy(inventory, (item) => item.category)).map(([category, items]) => <section key={category} className="rounded-[24px] bg-white p-5"><h3 className="glow-display text-xl">{category}</h3><div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <div key={item.id} className="rounded-2xl bg-[#faf8f3] p-3"><b className="text-sm">{item.name}</b><p className="text-[10px] capitalize">{item.state.replace('_', ' ')}</p><div className="mt-3 flex flex-wrap gap-1.5"><button type="button" onClick={() => changeInventory(item, 'in_stock')} className="rounded-full bg-[#e8efe2] px-2.5 py-1.5 text-[10px]">In stock</button><button type="button" onClick={() => changeInventory(item, 'use_soon')} className="rounded-full bg-[#f3ead6] px-2.5 py-1.5 text-[10px]">Use soon</button><button type="button" onClick={() => changeInventory(item, 'out')} className="rounded-full bg-[#f4e5e0] px-2.5 py-1.5 text-[10px]">Out</button></div></div>)}</div></section>)}</> : null}

      {tab === 'Groceries' ? <><section className="rounded-[24px] bg-white p-5"><div className="flex justify-between gap-3"><div><h2 className="glow-display text-2xl">Groceries</h2><p className="text-sm">Draft → review → shopping.</p></div><ShoppingBasket aria-hidden="true" /></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={!draft.length || pending} onClick={() => startTransition(async () => { const result = await addAllFoodDraftGroceriesAction(); if (result.error) return toast(result.error); setGroceries((current) => current.map((item) => item.status === 'draft' ? { ...item, status: 'listed' } : item)); toast(`${result.data.length} draft items moved to shopping.`); })} className="rounded-full bg-[#78614d] px-4 py-2.5 text-xs text-white disabled:opacity-40">Add all {draft.length} draft items</button><button type="button" onClick={() => setShopping((value) => !value)} aria-pressed={shopping} className="rounded-full border px-4 py-2.5 text-xs">{shopping ? 'Exit Shopping Mode' : 'Shopping Mode'}</button><button type="button" onClick={() => { const name = window.prompt('Add grocery item')?.trim(); if (name) addGrocery(name); }} className="rounded-full border px-4 py-2.5 text-xs">+ Add item</button></div></section>{[['Draft', draft], ['Shopping List', listed]] as [string, Grocery[]][]}.map(([title, items]) => <section key={title} className="rounded-[24px] bg-white p-5"><h3 className="glow-display text-xl">{shopping && title === 'Shopping List' ? `${items.length} remaining` : title}</h3>{Object.entries(groupBy(items, (item) => item.category)).map(([category, group]) => <div key={category} className="mt-4"><p className="text-[9px] uppercase">{category}</p>{group.map((item) => <div key={item.id} className="mt-1 flex justify-between rounded-xl bg-[#faf7f2] p-3 text-sm"><span>{item.name}</span>{title === 'Shopping List' ? <button type="button" onClick={() => groceryDone(item)} aria-label={`Mark ${item.name} bought`}><Check size={14} /></button> : <small>draft</small>}</div>)}</div>)}</section>)}</> : null}

      {tab === 'Meal Plan' ? <section className="rounded-[24px] bg-white p-5"><h2 className="glow-display text-2xl">This Week</h2><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">{Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(now.getDate() + index); const key = dateKey(date); const items = mealPlans.filter((meal) => meal.mealDate === key); return <div key={key} className="rounded-2xl bg-[#faf7f1] p-3"><b>{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</b>{MEALS.map((type) => { const meal = items.find((item) => item.mealType === type); return <div key={type} className="mt-2"><small className="uppercase">{type}</small><p className="text-[10px]">{meal?.title ?? '—'}</p></div>; })}</div>; })}</div><button type="button" onClick={() => setTab('Recipes')} className="mt-4 rounded-full bg-[#80634d] px-4 py-2.5 text-xs text-white">Plan from Recipes</button></section> : null}

      {tab === 'Meal Prep' ? <section className="rounded-[26px] bg-[#f4f7ee] p-5"><div className="flex gap-3"><PackageCheck aria-hidden="true" /><div><h2 className="glow-display text-3xl">Meal Prep Mode</h2><p className="text-sm">One step at a time with parallel work when it helps.</p></div></div>{prep?.status === 'active' ? <div className="mt-5 rounded-[24px] bg-white p-5"><p className="text-xs">{prep.currentIndex + 1} / {prep.queue.length}</p><h3 className="glow-display mt-2 text-2xl">{currentPrepStep?.title}</h3>{currentPrepStep?.parallelHint ? <p className="mt-3 rounded-xl bg-[#eef4e8] p-3 text-sm"><b>Parallel:</b> {currentPrepStep.parallelHint}</p> : null}{currentPrepStep ? <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setPrepSeconds((value) => value + 60)} className="rounded-full border px-3 py-2 text-xs"><TimerReset size={13} className="inline" /> +1 min</button><button type="button" onClick={() => savePrepStep('skipped')} className="rounded-full border px-3 py-2 text-xs">Skip</button><button type="button" onClick={() => savePrepStep('completed')} className="rounded-full bg-[#6c7c62] px-4 py-2 text-xs text-white">Done</button><button type="button" onClick={() => say(`${currentPrepStep.title}. ${currentPrepStep.parallelHint ?? ''}`)} aria-label="Read Meal Prep step" className="rounded-full border p-2"><Mic2 size={14} /></button></div> : null}</div> : prep?.status === 'completed' ? <p className="mt-4 rounded-xl bg-white p-4">Meal Prep complete ✓</p> : <button type="button" onClick={startPrep} className="mt-5 rounded-full bg-[#6c7c62] px-5 py-3 text-sm text-white">Start Meal Prep</button>}</section> : null}

      {tab === 'Smoothies' ? <Builder title="Smoothie Studio" groups={SMOOTHIE} selected={smoothie} setSelected={setSmoothie} onSave={() => saveBuilder('smoothie')} /> : null}

      <section className="rounded-[26px] bg-white p-5"><div className="flex justify-between gap-3"><div><h2 className="glow-display text-2xl">Leftovers</h2><p className="text-xs text-[#81776d]">Keep what needs to be eaten visible.</p></div><button type="button" onClick={addLeftover} className="text-xs underline">+ Save leftovers</button></div><div className="mt-3 grid gap-2 md:grid-cols-3">{activeLeftovers.map((leftover) => <div key={leftover.id} className="rounded-xl bg-[#faf7f1] p-3"><b>{leftover.title}</b><p className="text-xs">{leftover.servingsRemaining} servings · {leftover.expiresAt ? `expiry ${new Date(leftover.expiresAt).toLocaleDateString()}` : 'freshness not tracked'}</p><button type="button" onClick={() => consumeLeftover(leftover)} className="mt-2 text-xs underline">Use 1 serving</button></div>)}{!activeLeftovers.length ? <p className="text-xs text-[#81776d]">No active leftovers saved.</p> : null}</div></section>

      <section className="rounded-[24px] bg-white p-5"><p className="text-[9px] uppercase tracking-[.14em] text-[#8d8275]">Food spending signal</p><p className="mt-2 text-sm">{foodSpend} across {foodPurchaseCount} Food transactions this month.</p><Link href="/finance" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#765b45]">Open Money <ArrowRight size={12} /></Link></section>

      {selectedRecipe ? <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/20 p-4 backdrop-blur-sm"><div className="mx-auto mt-8 max-w-3xl rounded-[30px] bg-[#fffdf8] p-6"><div className="flex justify-between gap-3"><div><h2 className="glow-display text-3xl">{selectedRecipe.title}</h2><p className="text-sm">{selectedRecipe.categories.join(' · ')}</p></div><button type="button" onClick={() => setSelectedRecipe(null)} aria-label="Close recipe"><X /></button></div>{selectedRecipe.recipeStatus === 'missing_measurements' ? <p className="mt-5 rounded-2xl bg-[#f7eee6] p-4 text-sm">Original complete measurements were not preserved in the source. Glow does not reconstruct them.</p> : <div className="mt-5 grid gap-5 lg:grid-cols-2"><div><h3 className="glow-display text-xl">Ingredients</h3>{selectedRecipe.ingredients.map((ingredient, index) => <div key={`${ingredient.name}-${index}`} className="mt-2 rounded-xl bg-white p-3 text-sm">{ingredient.amount ? <b>{ingredient.amount} </b> : null}{ingredient.name}{ingredient.note ? <small className="block">{ingredient.note}</small> : null}</div>)}</div><div><h3 className="glow-display text-xl">Instructions</h3>{selectedRecipe.instructions.map((instruction, index) => <div key={`${index}-${instruction.text}`} className="mt-2 rounded-xl bg-white p-3 text-sm">{index + 1}. {instruction.text}</div>)}<button type="button" onClick={() => startCook(selectedRecipe)} className="mt-4 rounded-full bg-[#775b45] px-5 py-3 text-sm text-white">Start Cook Mode</button></div></div>}</div></div> : null}

      <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-xl justify-around rounded-[22px] border border-white/80 bg-[#fffaf3]/92 p-2 shadow-xl backdrop-blur"><button type="button" onClick={() => setTab('Food Studio')} className="flex flex-col items-center gap-1 px-3 py-2 text-[10px]"><Utensils size={16} />Eat Next</button><button type="button" onClick={() => { setMinutes(5); setTab('Food Studio'); }} className="flex flex-col items-center gap-1 px-3 py-2 text-[10px]"><Clock3 size={16} />Quick Meal</button><button type="button" onClick={() => { const name = window.prompt('Add grocery item')?.trim(); if (name) addGrocery(name); }} className="flex flex-col items-center gap-1 px-3 py-2 text-[10px]"><ShoppingBasket size={16} />Add Grocery</button><button type="button" onClick={() => document.dispatchEvent(new CustomEvent('glow:open-conversation', { detail: { prompt: 'Help me with Food right now. Use my saved recipes, pantry, groceries, meal plan, leftovers and Calendar context. Do not invent what is in stock.' } }))} className="flex flex-col items-center gap-1 px-3 py-2 text-[10px]"><Mic2 size={16} />Ask Glow</button></div>
    </div>
  );
}
