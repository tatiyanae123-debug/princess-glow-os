import type { RoomUpgradeSet } from './types';

export const FOOD_UPGRADES: RoomUpgradeSet[] = [{
  key:'food', label:'Food & Nutrition', path:'/food', upgrades:[
    {id:'today-meals',label:'Today’s Meals',description:'Keep today’s planned meals in an editorial day view.',kind:'route',href:'/food'},
    {id:'weekly-plan',label:'Weekly Meal Planner',description:'Build a reusable meal plan for the week.',kind:'entity',entityType:'meal_plan',fields:[{key:'week',label:'Week of',type:'date'},{key:'meals',label:'Meals',type:'textarea'},{key:'prep',label:'Prep notes',type:'textarea'}]},
    {id:'recipes',label:'Recipe Library',description:'Save real recipes with ingredients and directions.',kind:'entity',entityType:'recipe',fields:[{key:'category',label:'Category'},{key:'ingredients',label:'Ingredients',type:'textarea'},{key:'directions',label:'Directions',type:'textarea'}]},
    {id:'groceries',label:'Smart Grocery List',description:'Keep a grocery list connected to meal planning and pantry context.',kind:'entity',entityType:'grocery_list',fields:[{key:'items',label:'Items',type:'textarea'},{key:'store',label:'Store / source'},{key:'notes',label:'Notes',type:'textarea'}]},
    {id:'pantry',label:'Pantry Inventory',description:'Track what is on hand, quantities and use-soon dates.',kind:'entity',entityType:'pantry_item',fields:[{key:'quantity',label:'Quantity'},{key:'category',label:'Category'},{key:'useBy',label:'Use by',type:'date'}]},
    {id:'meal-prep',label:'Meal-Prep Mode',description:'Build a prep session with batches, steps and timing.',kind:'entity',entityType:'meal_prep_session',fields:[{key:'date',label:'Prep date',type:'date'},{key:'batches',label:'Meals / batches',type:'textarea'},{key:'steps',label:'Prep steps',type:'textarea'}]},
    {id:'favorites',label:'Favorite Meals',description:'Save the meals you want to repeat.',kind:'entity',entityType:'favorite_meal',fields:[{key:'why',label:'Why it works'},{key:'recipe',label:'Recipe / notes',type:'textarea'}]},
    {id:'nutrition',label:'Nutrition Summary',description:'Review only nutrition data you have explicitly stored or imported.',kind:'insight',scope:['food','wellness']},
    {id:'substitutions',label:'Ingredient Substitutions',description:'Save useful ingredient swaps for recipes you actually use.',kind:'entity',entityType:'ingredient_substitution',fields:[{key:'ingredient',label:'Ingredient'},{key:'substitute',label:'Substitute'},{key:'notes',label:'When to use it',type:'textarea'}]},
    {id:'meal-explorer',label:'Meal Explorer',description:'Connect a meal with recipe, groceries, prep and related notes.',kind:'relations',scope:['meal_plan','recipe','grocery_list','pantry_item']},
  ]
}];
