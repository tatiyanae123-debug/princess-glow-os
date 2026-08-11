'use client';

import { useMemo, useState } from 'react';
import { Check, ChefHat, Clock3, Refrigerator, ShoppingBasket, Sparkles, Utensils, X } from 'lucide-react';

const tabs=['Today','Meal Plan','Recipes','Groceries','Pantry','Meal Prep','Favorites','Food Brain'];
const meals=[
  {day:'Monday',breakfast:'Greek yogurt + berries',lunch:'Miso tofu bowl',dinner:'Shrimp stir-fry + rice',snack:'Strawberries + honey'},
  {day:'Tuesday',breakfast:'Collagen fruit smoothie',lunch:'Lentil bowl',dinner:'Kelp noodle mac + greens',snack:'Greek yogurt + honey'},
  {day:'Wednesday',breakfast:'Protein oatmeal',lunch:'Cannellini bean salad',dinner:'Tofu quinoa bowl',snack:'Frozen fruit bowl'},
  {day:'Thursday',breakfast:'Smoothie + berries',lunch:'Leftover quinoa bowl',dinner:'Quick shrimp stir-fry',snack:'Chia pudding'},
  {day:'Friday',breakfast:'Greek yogurt + fruit',lunch:'Butter bean bowl',dinner:'Flexible / social',snack:'Rice crackers'},
  {day:'Saturday',breakfast:'Protein oatmeal',lunch:'Leftovers',dinner:'Comfort meal',snack:'Açaí sorbet'},
  {day:'Sunday',breakfast:'Smoothie',lunch:'Meal-prep tasting plate',dinner:'Reset dinner',snack:'Berries + honey'},
];
const grocerySeed={
  Produce:['Zucchini','Spinach','Kale','Fresh basil','Carrots','Cucumber','Red cabbage','Red bell pepper','Onion','Garlic','Lemons','Lime','Potatoes','Strawberries','Blueberries'],
  Frozen:['Frozen stir-fry vegetables','Frozen fruit for smoothies'],
  Protein:['Tofu','Shrimp','Bone broth'],
  'Grains & dry goods':['Rolled oats','Quinoa','White rice','Lentils','Cannellini beans','Butter beans','Kelp noodles','Oat flour'],
  'Dairy & alternatives':['Milk of choice','Unsweetened almond milk','Nonfat plain Greek yogurt','Laughing Cow light cheese','Light butter'],
  Pantry:['Olive oil','Peanut butter','Low sodium soy sauce','Rice vinegar','Miso paste','Nutritional yeast','Cacao powder','Collagen powder','Honey','Monk fruit sweetener'],
};
const recipes=[
  ['Collagen Fruit Smoothie','5 min','Breakfast · Quick','Frozen fruit, spinach/kale, milk, collagen, honey'],
  ['Miso Tofu Bowl','25 min','Lunch · Meal Prep','Tofu, rice or quinoa, greens, miso, soy sauce'],
  ['Shrimp Stir-Fry','20 min','Dinner · Work Day','Shrimp, frozen vegetables, rice, soy sauce, ginger'],
  ['Chia Pudding','5 min + chill','Snack · Prep Ahead','Chia seeds, milk, honey, berries'],
  ['Greek Yogurt Berry Bowl','3 min','Snack · High Protein','Greek yogurt, strawberries, blueberries, honey'],
  ['Kelp Noodle Comfort Bowl','15 min','Quick · Comfort Food','Kelp noodles, light cheese, seasonings, greens'],
];

export function FoodRoom(){
  const [tab,setTab]=useState('Today');
  const [checked,setChecked]=useState<Record<string,boolean>>({});
  const [notice,setNotice]=useState('');
  const [selectedRecipe,setSelectedRecipe]=useState<string|null>(null);
  const [addedRecipes,setAddedRecipes]=useState<Record<string,boolean>>({});
  const total=Object.values(grocerySeed).flat().length;
  const done=Object.values(checked).filter(Boolean).length;
  const stock=Math.round((done/Math.max(total,1))*100);
  const useSoon=['Spinach','Strawberries','Greek yogurt','Zucchini'];
  const groceryGroups=useMemo(()=>Object.entries(grocerySeed),[]);

  function go(next:string,message?:string){setTab(next);if(message)setNotice(message);}
  function askFoodBrain(question:string){window.location.assign(`/brain?q=${encodeURIComponent(question)}`);}

  return <div className="space-y-4">
    <section className="grid gap-3 xl:grid-cols-[1.35fr_.65fr]">
      <div className="paper-card relative min-h-[245px] overflow-hidden p-5 sm:p-7">
        <div className="absolute -right-8 -top-8 h-52 w-52 rounded-full bg-[#dfe6d5]/65 blur-3xl"/><div className="absolute bottom-0 right-0 h-36 w-[42%] bg-[linear-gradient(135deg,transparent,#e9c9c6_55%,#cab8a5)] opacity-55"/>
        <div className="relative max-w-2xl"><p className="text-[8px] font-bold uppercase tracking-[.2em] text-[#7f9474]">Today&apos;s nourishment</p><h2 className="glow-display mt-2 text-[30px] leading-[1.05] text-[#3e4338]">Eat beautifully. Plan practically.</h2><p className="mt-3 max-w-lg text-[10px] leading-5 text-[#6f7469]">Meals, groceries, pantry, prep and food spending should behave like one workflow. Plan once, let the rest of the system follow.</p><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={()=>go('Meal Plan','Opened your weekly meal plan.')} className="rounded-full bg-[#394138] px-4 py-2 text-[9px] font-semibold text-white">Build my food week</button><button type="button" onClick={()=>go('Pantry','Showing what is already in your kitchen.')} className="rounded-full border border-[#d7d7cc] bg-white/55 px-4 py-2 text-[9px] text-[#5c6658]">Use what I have</button></div></div>
        <ChefHat size={92} strokeWidth={.55} className="absolute bottom-7 right-[9%] text-white/75"/>
      </div>
      <div className="paper-card p-5"><p className="glow-display text-[18px] text-[#4a5144]">Kitchen intelligence</p><div className="mt-4 grid grid-cols-2 gap-2">{[['Meals','3 / 4'],['Groceries',`${stock}%`],['Use soon','4 items'],['Food budget','On track']].map(([a,b])=><div key={a} className="rounded-[12px] border border-[#e3ddd6] bg-white/45 p-3"><p className="text-[7px] font-bold uppercase tracking-[.14em] text-[#9a9a8f]">{a}</p><p className="glow-display mt-1 text-[15px] text-[#475043]">{b}</p></div>)}</div><div className="mt-4 rounded-[13px] bg-[#edf0e7] p-3"><p className="text-[8px] font-semibold text-[#60705a]">Use it before you lose it</p><p className="mt-1 text-[9px] leading-4 text-[#6d7468]">{useSoon.join(' · ')}</p><button type="button" onClick={()=>go('Recipes',`Showing recipes that can help use ${useSoon.join(', ')}.`)} className="mt-2 text-[8px] font-semibold text-[#7f6f66]">Find meals using these →</button></div></div>
    </section>

    <div className="flex gap-1.5 overflow-x-auto rounded-[14px] border border-[#e1d8d0] bg-white/35 p-1.5">{tabs.map(t=><button type="button" key={t} onClick={()=>setTab(t)} className={`min-w-max rounded-[10px] px-3 py-2 text-[8px] font-semibold transition ${tab===t?'bg-[#e9d1cf] text-[#604648]':'text-[#7b716b] hover:bg-white/55'}`}>{t}</button>)}</div>

    {notice?<div className="flex items-center justify-between rounded-[12px] border border-[#e4ddd5] bg-white/60 px-4 py-3 text-[8px] text-[#6b625c]"><span>{notice}</span><button type="button" aria-label="Dismiss Food message" onClick={()=>setNotice('')} className="rounded-full p-1 hover:bg-white"><X size={11}/></button></div>:null}

    {(tab==='Today'||tab==='Meal Plan')&&<section className="paper-card p-4 sm:p-5"><div className="flex items-end justify-between gap-3"><div><p className="text-[8px] font-bold uppercase tracking-[.18em] text-[#8a9b7d]">Weekly meal plan</p><h3 className="glow-display mt-1 text-[20px] text-[#44483f]">A week that fits your real schedule</h3></div><Clock3 size={18} className="text-[#9b8179]"/></div><div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-7">{meals.map(m=><article key={m.day} className="rounded-[13px] border border-[#e4dcd5] bg-[#fffaf6]/65 p-3"><p className="glow-display text-[13px] text-[#504942]">{m.day}</p><div className="mt-3 space-y-2">{[['Breakfast',m.breakfast],['Lunch',m.lunch],['Dinner',m.dinner],['Snack',m.snack]].map(([label,value])=><div key={label}><p className="text-[6px] font-bold uppercase tracking-[.13em] text-[#aaa096]">{label}</p><p className="mt-0.5 text-[8px] leading-3.5 text-[#6b625c]">{value}</p></div>)}</div></article>)}</div></section>}

    {tab==='Recipes'&&<><section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{recipes.map(([name,time,tags,ingredients],index)=><article key={name} className="paper-card overflow-hidden"><div className={`h-28 ${index%3===0?'bg-[linear-gradient(135deg,#dce5d7,#ead4c8)]':index%3===1?'bg-[linear-gradient(135deg,#e8d6cb,#d2ddc9)]':'bg-[linear-gradient(135deg,#ead4d6,#eee6d3)]'} flex items-center justify-center`}><Utensils size={34} strokeWidth={.8} className="text-white/80"/></div><div className="p-4"><p className="glow-display text-[16px] text-[#4a443f]">{name}</p><p className="mt-1 text-[8px] text-[#9b8f87]">{time} · {tags}</p><p className="mt-3 text-[9px] leading-4 text-[#6d655f]">{ingredients}</p><div className="mt-3 flex gap-2"><button type="button" onClick={()=>setSelectedRecipe(name)} className="text-[8px] font-semibold text-[#936d6e]">View recipe</button><button type="button" onClick={()=>{setAddedRecipes(current=>({...current,[name]:true}));setNotice(`${name} was added to your food week.`);}} className="text-[8px] text-[#8a8b80]">{addedRecipes[name]?'Added ✓':'Add to week'}</button></div></div></article>)}</section>{selectedRecipe?<section className="paper-card p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-[8px] font-bold uppercase tracking-[.16em] text-[#8a9b7d]">Recipe detail</p><h3 className="glow-display mt-1 text-[20px] text-[#484940]">{selectedRecipe}</h3><p className="mt-3 text-[9px] leading-5 text-[#6d655f]">{recipes.find(r=>r[0]===selectedRecipe)?.[3]}</p></div><button type="button" onClick={()=>setSelectedRecipe(null)} aria-label="Close recipe detail" className="rounded-full border border-[#e1d8d0] p-2"><X size={12}/></button></div></section>:null}</>}

    {tab==='Groceries'&&<section className="grid gap-3 xl:grid-cols-[1fr_300px]"><div className="paper-card p-4 sm:p-5"><div className="flex items-center justify-between"><div><p className="text-[8px] font-bold uppercase tracking-[.18em] text-[#8b9b7f]">Smart grocery list</p><h3 className="glow-display text-[20px] text-[#49483f]">This week&apos;s groceries</h3></div><ShoppingBasket size={20} className="text-[#9d7f76]"/></div><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{groceryGroups.map(([group,items])=><div key={group}><p className="mb-2 text-[8px] font-bold uppercase tracking-[.13em] text-[#8c827a]">{group}</p><div className="space-y-1.5">{items.map(item=><label key={item} className="flex cursor-pointer items-center gap-2 rounded-[8px] px-1 py-1 text-[9px] text-[#625a55] hover:bg-white/50"><button type="button" onClick={()=>setChecked(c=>({...c,[item]:!c[item]}))} className={`flex h-4 w-4 items-center justify-center rounded-full border ${checked[item]?'border-[#83977a] bg-[#83977a] text-white':'border-[#cfc4bb]'}`}>{checked[item]?<Check size={9}/>:null}</button><span className={checked[item]?'line-through opacity-45':''}>{item}</span></label>)}</div></div>)}</div></div><div className="paper-card p-4"><p className="glow-display text-[17px] text-[#4c5046]">Shopping progress</p><p className="mt-2 text-[30px] font-light text-[#6f8067]">{done}<span className="text-sm text-[#aaa39b]">/{total}</span></p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e6dfd9]"><div className="h-full rounded-full bg-[#93a389]" style={{width:`${stock}%`}}/></div><p className="mt-4 text-[8px] leading-4 text-[#777168]">Purchased items can later flow directly into Pantry Inventory and food spending.</p></div></section>}

    {tab==='Pantry'&&<section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{[['Fridge','Greek yogurt · strawberries · spinach'],['Freezer','Frozen fruit · stir-fry vegetables'],['Pantry','Quinoa · oats · rice · lentils · beans'],['Always Keep','Collagen · frozen fruit · strawberries · honey']].map(([name,content])=><article key={name} className="paper-card p-4"><Refrigerator size={18} className="text-[#8d9c83]"/><h3 className="glow-display mt-3 text-[16px] text-[#4f5048]">{name}</h3><p className="mt-2 text-[9px] leading-5 text-[#746e67]">{content}</p><button type="button" onClick={()=>go('Groceries',`Opened Groceries so you can update ${name} stock against what you buy.`)} className="mt-3 text-[8px] font-semibold text-[#956f6e]">Update inventory →</button></article>)}</section>}

    {tab==='Meal Prep'&&<section className="paper-card p-5"><p className="text-[8px] font-bold uppercase tracking-[.18em] text-[#8a9a7f]">Guided Sunday workflow</p><h3 className="glow-display mt-1 text-[22px] text-[#484940]">Meal Prep Mode</h3><div className="mt-5 grid gap-2 md:grid-cols-2 xl:grid-cols-4">{['Review the week','Choose meals','Check pantry','Generate groceries','Shop','Stock inventory','Prep ingredients','Prepare meals','Store portions','Add meals to calendar','Finish kitchen reset'].map((step,index)=><div key={step} className="rounded-[12px] border border-[#e2dbd4] bg-white/45 p-3"><p className="text-[7px] font-bold text-[#a1887f]">STEP {index+1}</p><p className="mt-1 text-[9px] text-[#615b55]">{step}</p></div>)}</div></section>}

    {(tab==='Favorites'||tab==='Food Brain')&&<section className="paper-card p-6"><div className="flex items-center gap-2"><Sparkles size={16} className="text-[#9c7a75]"/><h3 className="glow-display text-[20px] text-[#48463f]">{tab==='Food Brain'?'Ask Food Brain':'Favorite meals'}</h3></div>{tab==='Food Brain'?<><p className="mt-3 max-w-xl text-[10px] leading-5 text-[#6d675f]">Start with your own meals, pantry and schedule before inventing something new.</p><div className="mt-4 flex flex-wrap gap-2">{['What can I make with what I have?','Build my grocery list','Use my leftovers','Give me easy workday meals','What food should I use soon?'].map(q=><button type="button" onClick={()=>askFoodBrain(q)} key={q} className="rounded-full border border-[#dfd3cb] bg-white/50 px-3 py-2 text-[8px] text-[#6d625b]">{q}</button>)}</div></>:<div className="mt-4 grid gap-2 md:grid-cols-3">{recipes.slice(0,3).map(r=><div key={r[0]} className="rounded-[12px] bg-[#f4ebe5] p-4"><p className="glow-display text-[14px] text-[#554d47]">{r[0]}</p><p className="mt-1 text-[8px] text-[#8d8179]">{r[1]} · {r[2]}</p></div>)}</div>}</section>}
  </div>;
}
