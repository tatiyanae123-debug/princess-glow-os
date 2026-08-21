import 'server-only';
import { and, asc, desc, eq, gte, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { foodEvents, foodGroceryItems, foodInventory, foodLeftovers, foodMealPlans, foodPrepRuns, foodRecipes } from '@/db/schema/food-intelligence';
import { MASTER_GROCERY_GROUPS, MASTER_RECIPES, MEAL_PREP_QUEUE } from '@/lib/food/master-food-catalog';

export const normalizeFoodName=(value:string)=>value.trim().toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ');

export async function ensureFoodCatalogForUser(userId:string){
  const existingRecipes=new Set((await db.select({slug:foodRecipes.slug}).from(foodRecipes).where(eq(foodRecipes.userId,userId))).map(r=>r.slug));
  const missingRecipes=MASTER_RECIPES.filter(r=>!existingRecipes.has(r.slug));
  if(missingRecipes.length)await db.insert(foodRecipes).values(missingRecipes.map(r=>({userId,slug:r.slug,title:r.title,primaryCategory:r.primaryCategory,categories:r.categories,tags:r.tags??[],recipeStatus:r.recipeStatus,servings:r.servings??null,prepMinutes:r.prepMinutes??null,cookMinutes:r.cookMinutes??null,totalMinutes:r.totalMinutes??null,ingredients:r.ingredients??[],instructions:r.instructions??[],notes:r.notes??null,sourceLabel:'Complete Food Folder Master List'}))).onConflictDoNothing();

  const existingInventory=new Set((await db.select({normalizedName:foodInventory.normalizedName}).from(foodInventory).where(eq(foodInventory.userId,userId))).map(r=>r.normalizedName));
  const seen=new Set<string>();const rows:Array<{userId:string;normalizedName:string;name:string;category:string;state:string;notes:string}>=[];
  for(const [category,items] of Object.entries(MASTER_GROCERY_GROUPS))for(const name of items){const normalizedName=normalizeFoodName(name);if(seen.has(normalizedName)||existingInventory.has(normalizedName))continue;seen.add(normalizedName);rows.push({userId,normalizedName,name,category,state:'review',notes:'Imported from Complete Food Folder Master List. Stock quantity has not been confirmed.'});}
  if(rows.length)await db.insert(foodInventory).values(rows).onConflictDoNothing();
}

export async function getFoodIntelligenceState(userId:string){
  await ensureFoodCatalogForUser(userId);
  const since=new Date(Date.now()-30*86400000);
  const [recipes,inventory,groceries,mealPlans,leftovers,prepRuns,events]=await Promise.all([
    db.select().from(foodRecipes).where(eq(foodRecipes.userId,userId)).orderBy(asc(foodRecipes.title)),
    db.select().from(foodInventory).where(eq(foodInventory.userId,userId)).orderBy(asc(foodInventory.category),asc(foodInventory.name)),
    db.select().from(foodGroceryItems).where(and(eq(foodGroceryItems.userId,userId),inArray(foodGroceryItems.status,['draft','listed']))).orderBy(asc(foodGroceryItems.category),asc(foodGroceryItems.name)),
    db.select().from(foodMealPlans).where(eq(foodMealPlans.userId,userId)).orderBy(asc(foodMealPlans.mealDate),asc(foodMealPlans.mealType)),
    db.select().from(foodLeftovers).where(and(eq(foodLeftovers.userId,userId),gte(foodLeftovers.createdAt,since))).orderBy(desc(foodLeftovers.createdAt)),
    db.select().from(foodPrepRuns).where(and(eq(foodPrepRuns.userId,userId),gte(foodPrepRuns.startedAt,since))).orderBy(desc(foodPrepRuns.startedAt)).limit(30),
    db.select().from(foodEvents).where(and(eq(foodEvents.userId,userId),gte(foodEvents.occurredAt,since))).orderBy(desc(foodEvents.occurredAt)).limit(120),
  ]);
  return {recipes,inventory,groceries,mealPlans,leftovers,prepRuns,events};
}

async function event(userId:string,kind:string,title:string,metadata:Record<string,unknown>={}){await db.insert(foodEvents).values({userId,kind,title,metadata});}

export async function updateInventory(userId:string,id:string,input:{state:'in_stock'|'out'|'use_soon'|'review';quantity?:number|null;unit?:string|null}){
  const [owned]=await db.select().from(foodInventory).where(and(eq(foodInventory.id,id),eq(foodInventory.userId,userId))).limit(1);if(!owned)return null;
  const quantity=input.quantity==null?owned.quantity:Math.max(0,Math.min(9999,input.quantity));const now=new Date();
  const [row]=await db.update(foodInventory).set({state:input.state,quantity,unit:input.unit?.trim()||owned.unit,groceryDraft:input.state==='out'||(owned.minimumQuantity!=null&&quantity!=null&&quantity<=owned.minimumQuantity),updatedAt:now}).where(and(eq(foodInventory.id,id),eq(foodInventory.userId,userId))).returning();
  if(!row)return null;
  const shouldDraft=row.state==='out'||(row.minimumQuantity!=null&&row.quantity!=null&&row.quantity<=row.minimumQuantity);
  if(shouldDraft){await db.insert(foodGroceryItems).values({userId,normalizedName:row.normalizedName,name:row.name,category:row.category,status:'draft',source:'pantry'}).onConflictDoNothing();}
  await event(userId,'inventory',`${row.name} · ${row.state}`,{inventoryId:row.id,state:row.state,quantity:row.quantity,unit:row.unit});return row;
}

export async function addGrocery(userId:string,input:{name:string;category:string;status?:'draft'|'listed';quantity?:number|null;unit?:string|null;source?:string}){
  const normalizedName=normalizeFoodName(input.name);if(!normalizedName)return null;
  const status=input.status??'listed';
  try{const [row]=await db.insert(foodGroceryItems).values({userId,normalizedName,name:input.name.trim(),category:input.category.trim()||'Other',status,quantity:input.quantity??null,unit:input.unit?.trim()||null,source:input.source??'manual'}).returning();if(row)await event(userId,'grocery',`Added ${row.name} to groceries`,{groceryId:row.id});return row??null;}catch{const [existing]=await db.select().from(foodGroceryItems).where(and(eq(foodGroceryItems.userId,userId),eq(foodGroceryItems.normalizedName,normalizedName),eq(foodGroceryItems.status,status))).limit(1);return existing??null;}
}

export async function setGroceryStatus(userId:string,id:string,status:'draft'|'listed'|'completed'){
  const now=new Date();const [row]=await db.update(foodGroceryItems).set({status,completedAt:status==='completed'?now:null,updatedAt:now}).where(and(eq(foodGroceryItems.id,id),eq(foodGroceryItems.userId,userId))).returning();if(!row)return null;
  if(status==='completed'){await db.update(foodInventory).set({state:'in_stock',groceryDraft:false,updatedAt:now}).where(and(eq(foodInventory.userId,userId),eq(foodInventory.normalizedName,row.normalizedName)));await event(userId,'grocery',`Bought ${row.name}`,{groceryId:row.id});}
  return row;
}

export async function addAllDraftGroceries(userId:string){const now=new Date();const rows=await db.update(foodGroceryItems).set({status:'listed',updatedAt:now}).where(and(eq(foodGroceryItems.userId,userId),eq(foodGroceryItems.status,'draft'))).returning();if(rows.length)await event(userId,'grocery',`Moved ${rows.length} grocery draft item${rows.length===1?'':'s'} to the shopping list`,{count:rows.length});return rows;}

export async function setRecipePreference(userId:string,id:string,input:{favorite?:boolean;rotation?:'reliable'|'try_again'|'new'|'retired';rating?:'loved'|'good'|'fine'|'wouldnt_repeat'|null;feedback?:string[]}){
  const patch:{favorite?:boolean;rotation?:string;rating?:string|null;feedback?:string[];updatedAt:Date}={updatedAt:new Date()};if(input.favorite!=null)patch.favorite=input.favorite;if(input.rotation)patch.rotation=input.rotation;if(input.rating!==undefined)patch.rating=input.rating;if(input.feedback)patch.feedback=Array.from(new Set(input.feedback)).slice(0,8);
  const [row]=await db.update(foodRecipes).set(patch).where(and(eq(foodRecipes.id,id),eq(foodRecipes.userId,userId))).returning();if(row)await event(userId,'recipe',`Updated ${row.title}`,{recipeId:row.id,rating:row.rating,rotation:row.rotation,favorite:row.favorite});return row??null;
}

export async function recordRecipeUse(userId:string,id:string){const [recipe]=await db.select().from(foodRecipes).where(and(eq(foodRecipes.id,id),eq(foodRecipes.userId,userId))).limit(1);if(!recipe)return null;const [row]=await db.update(foodRecipes).set({useCount:recipe.useCount+1,lastUsedAt:new Date(),updatedAt:new Date()}).where(and(eq(foodRecipes.id,id),eq(foodRecipes.userId,userId))).returning();if(row)await event(userId,'meal',`Used ${row.title}`,{recipeId:row.id});return row??null;}

export async function saveMealPlan(userId:string,input:{mealDate:string;mealType:'breakfast'|'lunch'|'dinner'|'snack';recipeId?:string|null;title:string;status?:'planned'|'ate'|'changed'}){
  if(input.recipeId){const [recipe]=await db.select({id:foodRecipes.id}).from(foodRecipes).where(and(eq(foodRecipes.id,input.recipeId),eq(foodRecipes.userId,userId))).limit(1);if(!recipe)return null;}
  const [existing]=await db.select().from(foodMealPlans).where(and(eq(foodMealPlans.userId,userId),eq(foodMealPlans.mealDate,input.mealDate),eq(foodMealPlans.mealType,input.mealType))).limit(1);const now=new Date();
  const [row]=existing?await db.update(foodMealPlans).set({recipeId:input.recipeId??null,title:input.title.trim(),status:input.status??existing.status,updatedAt:now}).where(and(eq(foodMealPlans.id,existing.id),eq(foodMealPlans.userId,userId))).returning():await db.insert(foodMealPlans).values({userId,mealDate:input.mealDate,mealType:input.mealType,recipeId:input.recipeId??null,title:input.title.trim(),status:input.status??'planned'}).returning();if(row)await event(userId,'meal_plan',`${row.mealType} · ${row.title}`,{mealPlanId:row.id,date:row.mealDate,status:row.status});return row??null;
}

export async function addLeftover(userId:string,input:{recipeId?:string|null;title:string;servingsRemaining:number;expiresAt?:Date|null}){if(input.recipeId){const [recipe]=await db.select({id:foodRecipes.id}).from(foodRecipes).where(and(eq(foodRecipes.id,input.recipeId),eq(foodRecipes.userId,userId))).limit(1);if(!recipe)return null;}const servings=Math.max(.25,Math.min(100,input.servingsRemaining));const [row]=await db.insert(foodLeftovers).values({userId,recipeId:input.recipeId??null,title:input.title.trim(),servingsRemaining:servings,expiresAt:input.expiresAt??null}).returning();if(row)await event(userId,'leftover',`${servings} serving${servings===1?'':'s'} of ${row.title} saved`,{leftoverId:row.id});return row??null;}

export async function useLeftover(userId:string,id:string,amount=1){const [row]=await db.select().from(foodLeftovers).where(and(eq(foodLeftovers.id,id),eq(foodLeftovers.userId,userId))).limit(1);if(!row)return null;const remaining=Math.max(0,row.servingsRemaining-Math.max(.25,amount));const [updated]=await db.update(foodLeftovers).set({servingsRemaining:remaining,updatedAt:new Date()}).where(and(eq(foodLeftovers.id,id),eq(foodLeftovers.userId,userId))).returning();if(updated)await event(userId,'leftover',`Used ${row.title}`,{leftoverId:id,remaining});return updated??null;}

export async function startMealPrep(userId:string){const [active]=await db.select().from(foodPrepRuns).where(and(eq(foodPrepRuns.userId,userId),eq(foodPrepRuns.status,'active'))).orderBy(desc(foodPrepRuns.lastActivityAt)).limit(1);if(active)return active;try{const [row]=await db.insert(foodPrepRuns).values({userId,queue:MEAL_PREP_QUEUE}).returning();if(row)await event(userId,'prep','Meal Prep started',{runId:row.id});return row??null;}catch{const [winner]=await db.select().from(foodPrepRuns).where(and(eq(foodPrepRuns.userId,userId),eq(foodPrepRuns.status,'active'))).limit(1);return winner??null;}}

export async function recordMealPrepStep(userId:string,input:{runId:string;stepId:string;status:'completed'|'skipped';actualSeconds:number}){const [run]=await db.select().from(foodPrepRuns).where(and(eq(foodPrepRuns.id,input.runId),eq(foodPrepRuns.userId,userId),eq(foodPrepRuns.status,'active'))).limit(1);if(!run||!run.queue.some(s=>s.id===input.stepId))return null;const completed=input.status==='completed'?Array.from(new Set([...run.completedStepIds,input.stepId])):run.completedStepIds.filter(x=>x!==input.stepId);const skipped=input.status==='skipped'?Array.from(new Set([...run.skippedStepIds,input.stepId])):run.skippedStepIds.filter(x=>x!==input.stepId);const handled=new Set([...completed,...skipped]);const next=run.queue.findIndex(s=>!handled.has(s.id));const seconds=handled.has(input.stepId)?0:Math.max(0,Math.min(3600,input.actualSeconds));const [row]=await db.update(foodPrepRuns).set({completedStepIds:completed,skippedStepIds:skipped,currentIndex:next<0?run.queue.length:next,actualSeconds:Math.min(86400,run.actualSeconds+seconds),lastActivityAt:new Date()}).where(and(eq(foodPrepRuns.id,run.id),eq(foodPrepRuns.userId,userId))).returning();return row??null;}

export async function completeMealPrep(userId:string,id:string){const [run]=await db.select().from(foodPrepRuns).where(and(eq(foodPrepRuns.id,id),eq(foodPrepRuns.userId,userId),eq(foodPrepRuns.status,'active'))).limit(1);if(!run)return null;const handled=new Set([...run.completedStepIds,...run.skippedStepIds]);if(run.queue.some(s=>!handled.has(s.id)))return null;const now=new Date();const [row]=await db.update(foodPrepRuns).set({status:'completed',currentIndex:run.queue.length,completedAt:now,lastActivityAt:now}).where(and(eq(foodPrepRuns.id:id),eq(foodPrepRuns.userId,userId))).returning();return row??null;}

export async function abandonMealPrep(userId:string,id:string){const [row]=await db.update(foodPrepRuns).set({status:'abandoned',lastActivityAt:new Date()}).where(and(eq(foodPrepRuns.id,id),eq(foodPrepRuns.userId,userId),eq(foodPrepRuns.status,'active'))).returning();return row??null;}

export async function createCustomRecipe(userId:string,input:{title:string;primaryCategory:string;categories:string[];tags?:string[];ingredients:string[];notes?:string}){const slug=`custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;const [row]=await db.insert(foodRecipes).values({userId,slug,title:input.title.trim(),primaryCategory:input.primaryCategory,categories:input.categories,tags:input.tags??[],ingredients:input.ingredients.filter(Boolean).map(name=>({name})),instructions:[],recipeStatus:'complete',notes:input.notes?.trim()||null,sourceLabel:'Created in Glow Food Studio'}).returning();if(row)await event(userId,'recipe',`Created ${row.title}`,{recipeId:row.id});return row??null;}
