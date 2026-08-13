'use client';

import { useMemo, useState } from 'react';
import { Check, ChefHat, Clock3, Refrigerator, ShoppingBasket, Sparkles, Utensils, X } from 'lucide-react';

const tabs = ['Today', 'Meal Plan', 'Recipes', 'Groceries', 'Pantry', 'Meal Prep', 'Favorites', 'Food Brain'];
const meals = [
  { day: 'Monday', breakfast: 'Greek yogurt + berries', lunch: 'Miso tofu bowl', dinner: 'Shrimp stir-fry + rice', snack: 'Strawberries + honey' },
  { day: 'Tuesday', breakfast: 'Collagen fruit smoothie', lunch: 'Lentil bowl', dinner: 'Kelp noodle mac + greens', snack: 'Greek yogurt + honey' },
  { day: 'Wednesday', breakfast: 'Protein oatmeal', lunch: 'Cannellini bean salad', dinner: 'Tofu quinoa bowl', snack: 'Frozen fruit bowl' },
  { day: 'Thursday', breakfast: 'Smoothie + berries', lunch: 'Leftover quinoa bowl', dinner: 'Quick shrimp stir-fry', snack: 'Chia pudding' },
  { day: 'Friday', breakfast: 'Greek yogurt + fruit', lunch: 'Butter bean bowl', dinner: 'Flexible / social', snack: 'Rice crackers' },
  { day: 'Saturday', breakfast: 'Protein oatmeal', lunch: 'Leftovers', dinner: 'Comfort meal', snack: 'Açaí sorbet' },
  { day: 'Sunday', breakfast: 'Smoothie', lunch: 'Meal-prep tasting plate', dinner: 'Reset dinner', snack: 'Berries + honey' },
];
const grocerySeed = {
  Produce: ['Zucchini', 'Spinach', 'Kale', 'Fresh basil', 'Carrots', 'Cucumber', 'Red cabbage', 'Red bell pepper', 'Onion', 'Garlic', 'Lemons', 'Lime', 'Potatoes', 'Strawberries', 'Blueberries'],
  Frozen: ['Frozen stir-fry vegetables', 'Frozen fruit for smoothies'],
  Protein: ['Tofu', 'Shrimp', 'Bone broth'],
  'Grains & dry goods': ['Rolled oats', 'Quinoa', 'White rice', 'Lentils', 'Cannellini beans', 'Butter beans', 'Kelp noodles', 'Oat flour'],
  'Dairy & alternatives': ['Milk of choice', 'Unsweetened almond milk', 'Nonfat plain Greek yogurt', 'Laughing Cow light cheese', 'Light butter'],
  Pantry: ['Olive oil', 'Peanut butter', 'Low sodium soy sauce', 'Rice vinegar', 'Miso paste', 'Nutritional yeast', 'Cacao powder', 'Collagen powder', 'Honey', 'Monk fruit sweetener'],
};
const recipes = [
  ['Collagen Fruit Smoothie', '5 min', 'Breakfast · Quick', 'Frozen fruit, spinach/kale, milk, collagen, honey'],
  ['Miso Tofu Bowl', '25 min', 'Lunch · Meal Prep', 'Tofu, rice or quinoa, greens, miso, soy sauce'],
  ['Shrimp Stir-Fry', '20 min', 'Dinner · Work Day', 'Shrimp, frozen vegetables, rice, soy sauce, ginger'],
  ['Chia Pudding', '5 min + chill', 'Snack · Prep Ahead', 'Chia seeds, milk, honey, berries'],
  ['Greek Yogurt Berry Bowl', '3 min', 'Snack · High Protein', 'Greek yogurt, strawberries, blueberries, honey'],
  ['Kelp Noodle Comfort Bowl', '15 min', 'Quick · Comfort Food', 'Kelp noodles, light cheese, seasonings, greens'],
];

export function FoodRoom({ foodSpendCents, foodPurchaseCount }: { foodSpendCents: number; foodPurchaseCount: number }) {
  const [tab, setTab] = useState('Today');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [addedRecipes, setAddedRecipes] = useState<Record<string, boolean>>({});
  const total = Object.values(grocerySeed).flat().length;
  const done = Object.values(checked).filter(Boolean).length;
  const stock = Math.round((done / Math.max(total, 1)) * 100);
  const useSoon = ['Spinach', 'Strawberries', 'Greek yogurt', 'Zucchini'];
  const groceryGroups = useMemo(() => Object.entries(grocerySeed), []);
  const foodSpend = (foodSpendCents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  function go(next: string, message?: string) { setTab(next); if (message) setNotice(message); }
  function askFoodBrain(question: string) { window.location.assign(`/brain?q=${encodeURIComponent(question)}`); }

  return (
    <div className="space-y-4">
      <section className="grid gap-3 xl:grid-cols-[1.35fr_.65fr]">
        <div className="relative min-h-[220px] overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-[linear-gradient(135deg,#FDF8F6,#F1E8D9)] p-6 sm:p-8">
          <ChefHat size={92} strokeWidth={0.55} className="absolute bottom-6 right-[7%] text-[#9A7A3D]/18" />
          <div className="relative max-w-2xl">
            <p className="glow-eyebrow">Today&apos;s nourishment</p>
            <h2 className="glow-display mt-2 text-[30px] leading-[1.05] text-[#2B2420]">Eat beautifully. Plan practically.</h2>
            <p className="mt-3 max-w-lg text-[12.5px] leading-5 text-[#8A8078]">Meals, groceries, pantry, and prep behave like one workflow. This starter plan is yours to adapt — it isn&apos;t generated from a food log, since Glow OS doesn&apos;t track individual meals yet.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => go('Meal Plan', 'Opened your weekly meal plan.')} className="rounded-full bg-[#C9727E] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-[#B15A68]">Build my food week</button>
              <button type="button" onClick={() => go('Pantry', 'Showing what is already in your kitchen.')} className="rounded-full border border-[#F1E7E3] bg-white px-4 py-2.5 text-[12px] text-[#8A8078] hover:bg-[#FDF8F6]">Use what I have</button>
            </div>
          </div>
        </div>
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <p className="glow-display text-[18px] text-[#2B2420]">Kitchen glance</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#B5ACA5]">Meals planned</p><p className="glow-display mt-1 text-[16px] text-[#2B2420]">{meals.length} / week</p></div>
            <div className="rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#B5ACA5]">Groceries checked</p><p className="glow-display mt-1 text-[16px] text-[#2B2420]">{stock}%</p></div>
            <div className="rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#B5ACA5]">Use soon</p><p className="glow-display mt-1 text-[16px] text-[#2B2420]">{useSoon.length} items</p></div>
            <div className="rounded-[14px] border border-[#F1E7E3] bg-[#F1E8D9] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#9A7A3D]">Food spend (real)</p><p className="glow-display mt-1 text-[16px] text-[#2B2420]">{foodSpend}</p></div>
          </div>
          <p className="mt-2 text-[10px] text-[#9A9088]">Food spend is your real logged &ldquo;food&rdquo; category total from Money &amp; Growth this month ({foodPurchaseCount} entr{foodPurchaseCount === 1 ? 'y' : 'ies'}). Everything else on this card is planning scaffolding, not a record of what you ate.</p>
          <div className="mt-4 rounded-[14px] bg-[#FDF3F2] p-3">
            <p className="text-[11px] font-semibold text-[#B15A68]">Use it before you lose it</p>
            <p className="mt-1 text-[11px] leading-4 text-[#8A8078]">{useSoon.join(' · ')}</p>
            <button type="button" onClick={() => go('Recipes', `Showing recipes that can help use ${useSoon.join(', ')}.`)} className="mt-2 text-[11px] font-medium text-[#C9727E]">Find meals using these →</button>
          </div>
        </div>
      </section>

      <div className="flex gap-1.5 overflow-x-auto rounded-[14px] border border-[#F1E7E3] bg-white p-1.5">
        {tabs.map((t) => (
          <button type="button" key={t} onClick={() => setTab(t)} className={`min-w-max rounded-full px-3.5 py-2 text-[11.5px] font-medium transition ${tab === t ? 'bg-[#FBE4E8] text-[#B15A68]' : 'text-[#8A8078] hover:bg-[#FDF8F6]'}`}>{t}</button>
        ))}
      </div>

      {notice ? (
        <div className="flex items-center justify-between rounded-[14px] border border-[#F1E7E3] bg-white px-4 py-3 text-[11.5px] text-[#4A4440]">
          <span>{notice}</span>
          <button type="button" aria-label="Dismiss Food message" onClick={() => setNotice('')} className="rounded-full p-1 hover:bg-[#FDF8F6]"><X size={12} /></button>
        </div>
      ) : null}

      {(tab === 'Today' || tab === 'Meal Plan') && (
        <section className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-end justify-between gap-3">
            <div><p className="glow-eyebrow">Starter weekly plan</p><h3 className="glow-display mt-1 text-[20px] text-[#2B2420]">A template you can adapt to your real week</h3></div>
            <Clock3 size={18} className="text-[#C9727E]" />
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-7">
            {meals.map((m) => (
              <article key={m.day} className="rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] p-3">
                <p className="glow-display text-[13px] text-[#2B2420]">{m.day}</p>
                <div className="mt-3 space-y-2">
                  {[['Breakfast', m.breakfast], ['Lunch', m.lunch], ['Dinner', m.dinner], ['Snack', m.snack]].map(([label, value]) => (
                    <div key={label}><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-[#B5ACA5]">{label}</p><p className="mt-0.5 text-[10.5px] leading-4 text-[#4A4440]">{value}</p></div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'Recipes' && (
        <>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recipes.map(([name, time, tags, ingredients], index) => (
              <article key={name} className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
                <div className={`flex h-28 items-center justify-center ${index % 3 === 0 ? 'bg-[linear-gradient(135deg,#FBE4E8,#F1E8D9)]' : index % 3 === 1 ? 'bg-[linear-gradient(135deg,#F1E8D9,#E4EBDD)]' : 'bg-[linear-gradient(135deg,#E9E4F2,#FBE4E8)]'}`}>
                  <Utensils size={34} strokeWidth={0.8} className="text-white/85" />
                </div>
                <div className="p-4">
                  <p className="glow-display text-[16px] text-[#2B2420]">{name}</p>
                  <p className="mt-1 text-[10.5px] text-[#9A9088]">{time} · {tags}</p>
                  <p className="mt-3 text-[11.5px] leading-4 text-[#8A8078]">{ingredients}</p>
                  <div className="mt-3 flex gap-3">
                    <button type="button" onClick={() => setSelectedRecipe(name)} className="text-[11px] font-medium text-[#C9727E]">View recipe</button>
                    <button type="button" onClick={() => { setAddedRecipes((current) => ({ ...current, [name]: true })); setNotice(`${name} was added to your food week.`); }} className="text-[11px] text-[#8A8078]">{addedRecipes[name] ? 'Added ✓' : 'Add to week'}</button>
                  </div>
                </div>
              </article>
            ))}
          </section>
          {selectedRecipe ? (
            <section className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="glow-eyebrow">Recipe detail</p><h3 className="glow-display mt-1 text-[20px] text-[#2B2420]">{selectedRecipe}</h3><p className="mt-3 text-[11.5px] leading-5 text-[#8A8078]">{recipes.find((r) => r[0] === selectedRecipe)?.[3]}</p></div>
                <button type="button" onClick={() => setSelectedRecipe(null)} aria-label="Close recipe detail" className="rounded-full border border-[#F1E7E3] p-2 hover:bg-[#FDF8F6]"><X size={12} /></button>
              </div>
            </section>
          ) : null}
        </>
      )}

      {tab === 'Groceries' && (
        <section className="grid gap-3 xl:grid-cols-[1fr_300px]">
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <div className="flex items-center justify-between">
              <div><p className="glow-eyebrow">Grocery checklist</p><h3 className="glow-display text-[20px] text-[#2B2420]">This week&apos;s groceries</h3></div>
              <ShoppingBasket size={20} className="text-[#C9727E]" />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {groceryGroups.map(([group, items]) => (
                <div key={group}>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.1em] text-[#B5ACA5]">{group}</p>
                  <div className="space-y-1.5">
                    {items.map((item) => (
                      <label key={item} className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-[11.5px] text-[#4A4440] hover:bg-[#FDF8F6]">
                        <button type="button" onClick={() => setChecked((c) => ({ ...c, [item]: !c[item] }))} className={`flex h-4 w-4 items-center justify-center rounded-full border ${checked[item] ? 'border-[#C9727E] bg-[#C9727E] text-white' : 'border-[#F1E7E3]'}`}>{checked[item] ? <Check size={10} /> : null}</button>
                        <span className={checked[item] ? 'line-through opacity-45' : ''}>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
            <p className="glow-display text-[17px] text-[#2B2420]">Shopping progress</p>
            <p className="mt-2 text-[30px] font-light text-[#C9727E]">{done}<span className="text-[13px] text-[#B5ACA5]">/{total}</span></p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F4ECE8]"><div className="h-full rounded-full bg-[#C9727E]" style={{ width: `${stock}%` }} /></div>
            <p className="mt-4 text-[11px] leading-4 text-[#8A8078]">This checklist is a session tool — it resets on refresh. Purchases you actually log with category &ldquo;food&rdquo; in Money &amp; Growth are what power the real spend total above.</p>
          </div>
        </section>
      )}

      {tab === 'Pantry' && (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[['Fridge', 'Greek yogurt · strawberries · spinach'], ['Freezer', 'Frozen fruit · stir-fry vegetables'], ['Pantry', 'Quinoa · oats · rice · lentils · beans'], ['Always Keep', 'Collagen · frozen fruit · strawberries · honey']].map(([name, content]) => (
            <article key={name} className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
              <Refrigerator size={18} className="text-[#C9727E]" />
              <h3 className="glow-display mt-3 text-[16px] text-[#2B2420]">{name}</h3>
              <p className="mt-2 text-[11.5px] leading-5 text-[#8A8078]">{content}</p>
              <button type="button" onClick={() => go('Groceries', `Opened Groceries so you can update ${name} stock against what you buy.`)} className="mt-3 text-[11px] font-medium text-[#C9727E]">Update inventory →</button>
            </article>
          ))}
        </section>
      )}

      {tab === 'Meal Prep' && (
        <section className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <p className="glow-eyebrow">Guided Sunday workflow</p>
          <h3 className="glow-display mt-1 text-[22px] text-[#2B2420]">Meal Prep Mode</h3>
          <div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {['Review the week', 'Choose meals', 'Check pantry', 'Generate groceries', 'Shop', 'Stock inventory', 'Prep ingredients', 'Prepare meals', 'Store portions', 'Add meals to calendar', 'Finish kitchen reset'].map((step, index) => (
              <div key={step} className="rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] p-3">
                <p className="text-[9px] font-semibold text-[#C9727E]">STEP {index + 1}</p>
                <p className="mt-1 text-[11.5px] text-[#4A4440]">{step}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {(tab === 'Favorites' || tab === 'Food Brain') && (
        <section className="rounded-[18px] border border-[#F1E7E3] bg-white p-6">
          <div className="flex items-center gap-2"><Sparkles size={16} className="text-[#C9727E]" /><h3 className="glow-display text-[20px] text-[#2B2420]">{tab === 'Food Brain' ? 'Ask Food Brain' : 'Favorite meals'}</h3></div>
          {tab === 'Food Brain' ? (
            <>
              <p className="mt-3 max-w-xl text-[12px] leading-5 text-[#8A8078]">Start with your own meals, pantry and schedule before inventing something new. This routes into Glow Brain, your real central-intelligence page.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['What can I make with what I have?', 'Build my grocery list', 'Use my leftovers', 'Give me easy workday meals', 'What food should I use soon?'].map((q) => (
                  <button type="button" onClick={() => askFoodBrain(q)} key={q} className="rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#4A4440] hover:bg-[#FDF8F6]">{q}</button>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {recipes.slice(0, 3).map((r) => (
                <div key={r[0]} className="rounded-[14px] bg-[#FDF3F2] p-4"><p className="glow-display text-[14px] text-[#2B2420]">{r[0]}</p><p className="mt-1 text-[10.5px] text-[#9A9088]">{r[1]} · {r[2]}</p></div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
