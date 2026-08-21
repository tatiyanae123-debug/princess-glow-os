import { boolean, index, integer, jsonb, pgTable, real, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './auth';

export type FoodIngredient = { name: string; amount?: string; note?: string };
export type FoodRecipeStep = { text: string; seconds?: number; parallelHint?: string };

export const foodRecipes = pgTable('food_recipes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  primaryCategory: text('primary_category').notNull().default('other'),
  categories: text('categories').array().notNull().default([]),
  tags: text('tags').array().notNull().default([]),
  recipeStatus: text('recipe_status').notNull().default('complete'),
  servings: text('servings'),
  prepMinutes: integer('prep_minutes'),
  cookMinutes: integer('cook_minutes'),
  totalMinutes: integer('total_minutes'),
  ingredients: jsonb('ingredients').$type<FoodIngredient[]>().notNull().default([]),
  instructions: jsonb('instructions').$type<FoodRecipeStep[]>().notNull().default([]),
  notes: text('notes'),
  sourceLabel: text('source_label').notNull().default('Food folder'),
  favorite: boolean('favorite').notNull().default(false),
  rotation: text('rotation').notNull().default('new'),
  rating: text('rating'),
  feedback: text('feedback').array().notNull().default([]),
  useCount: integer('use_count').notNull().default(0),
  lastUsedAt: timestamp('last_used_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userSlugUidx: uniqueIndex('food_recipes_user_slug_uidx').on(t.userId, t.slug),
  userCategoryIdx: index('food_recipes_user_category_idx').on(t.userId, t.primaryCategory),
}));

export const foodInventory = pgTable('food_inventory', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  normalizedName: text('normalized_name').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull().default('Pantry'),
  state: text('state').notNull().default('review'),
  quantity: real('quantity'),
  unit: text('unit'),
  minimumQuantity: real('minimum_quantity'),
  openedAt: timestamp('opened_at', { mode: 'date' }),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
  notes: text('notes'),
  groceryDraft: boolean('grocery_draft').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userNameUidx: uniqueIndex('food_inventory_user_name_uidx').on(t.userId, t.normalizedName),
  userStateIdx: index('food_inventory_user_state_idx').on(t.userId, t.state),
}));

export const foodGroceryItems = pgTable('food_grocery_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  normalizedName: text('normalized_name').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull().default('Other'),
  quantity: real('quantity'),
  unit: text('unit'),
  status: text('status').notNull().default('draft'),
  source: text('source').notNull().default('manual'),
  store: text('store'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userNameStatusUidx: uniqueIndex('food_grocery_user_name_status_uidx').on(t.userId, t.normalizedName, t.status),
  userStatusIdx: index('food_grocery_user_status_idx').on(t.userId, t.status),
}));

export const foodMealPlans = pgTable('food_meal_plans', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  mealDate: text('meal_date').notNull(),
  mealType: text('meal_type').notNull(),
  recipeId: text('recipe_id').references(() => foodRecipes.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  status: text('status').notNull().default('planned'),
  servings: integer('servings'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userDateMealUidx: uniqueIndex('food_meal_plans_user_date_meal_uidx').on(t.userId, t.mealDate, t.mealType),
  userDateIdx: index('food_meal_plans_user_date_idx').on(t.userId, t.mealDate),
}));

export const foodLeftovers = pgTable('food_leftovers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  recipeId: text('recipe_id').references(() => foodRecipes.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  servingsRemaining: real('servings_remaining').notNull().default(1),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userCreatedIdx: index('food_leftovers_user_created_idx').on(t.userId, t.createdAt) }));

export const foodPrepRuns = pgTable('food_prep_runs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Meal Prep'),
  status: text('status').notNull().default('active'),
  queue: jsonb('queue').$type<Array<{ id: string; title: string; seconds: number; parallelHint?: string }>>().notNull().default([]),
  completedStepIds: text('completed_step_ids').array().notNull().default([]),
  skippedStepIds: text('skipped_step_ids').array().notNull().default([]),
  currentIndex: integer('current_index').notNull().default(0),
  actualSeconds: integer('actual_seconds').notNull().default(0),
  startedAt: timestamp('started_at', { mode: 'date' }).notNull().defaultNow(),
  lastActivityAt: timestamp('last_activity_at', { mode: 'date' }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { mode: 'date' }),
}, (t) => ({ userStatusIdx: index('food_prep_runs_user_status_idx').on(t.userId, t.status) }));

export const foodEvents = pgTable('food_events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  occurredAt: timestamp('occurred_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userDateIdx: index('food_events_user_date_idx').on(t.userId, t.occurredAt) }));
