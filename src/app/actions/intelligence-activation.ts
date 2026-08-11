'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { sql } from 'drizzle-orm';
import { db } from '@/db';

const statements = [
`CREATE TABLE IF NOT EXISTS life_modes (id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,name text NOT NULL,slug text NOT NULL,description text,energy_target integer,max_major_tasks integer NOT NULL DEFAULT 3,workout_policy text,routine_policy text,scheduling_policy text,settings jsonb NOT NULL DEFAULT '{}'::jsonb,is_active boolean NOT NULL DEFAULT false,created_at timestamp NOT NULL DEFAULT now(),updated_at timestamp NOT NULL DEFAULT now())`,
`CREATE INDEX IF NOT EXISTS life_modes_user_active_idx ON life_modes(user_id,is_active)`,
`CREATE TABLE IF NOT EXISTS personal_rules (id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,title text NOT NULL,rule_type text NOT NULL,condition jsonb NOT NULL DEFAULT '{}'::jsonb,effect jsonb NOT NULL DEFAULT '{}'::jsonb,priority integer NOT NULL DEFAULT 50,enabled boolean NOT NULL DEFAULT true,source text NOT NULL DEFAULT 'user',created_at timestamp NOT NULL DEFAULT now(),updated_at timestamp NOT NULL DEFAULT now())`,
`CREATE INDEX IF NOT EXISTS personal_rules_user_enabled_idx ON personal_rules(user_id,enabled)`,
`CREATE TABLE IF NOT EXISTS glow_inbox_items (id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,raw_text text NOT NULL,source text NOT NULL DEFAULT 'manual',suggested_type text,suggested_title text,confidence real NOT NULL DEFAULT 0.5,status text NOT NULL DEFAULT 'unprocessed',routed_entity_type text,routed_entity_id text,metadata jsonb NOT NULL DEFAULT '{}'::jsonb,created_at timestamp NOT NULL DEFAULT now(),processed_at timestamp)`,
`CREATE INDEX IF NOT EXISTS glow_inbox_items_user_status_idx ON glow_inbox_items(user_id,status)`,
`CREATE TABLE IF NOT EXISTS task_dependencies (id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,predecessor_type text NOT NULL,predecessor_id text NOT NULL,successor_type text NOT NULL,successor_id text NOT NULL,dependency_type text NOT NULL DEFAULT 'blocks',created_at timestamp NOT NULL DEFAULT now())`,
`CREATE INDEX IF NOT EXISTS task_dependencies_user_successor_idx ON task_dependencies(user_id,successor_type,successor_id)`,
`CREATE TABLE IF NOT EXISTS entity_relations (id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,from_type text NOT NULL,from_id text NOT NULL,relation text NOT NULL,to_type text NOT NULL,to_id text NOT NULL,weight real NOT NULL DEFAULT 1,metadata jsonb NOT NULL DEFAULT '{}'::jsonb,created_at timestamp NOT NULL DEFAULT now())`,
`CREATE INDEX IF NOT EXISTS entity_relations_user_from_idx ON entity_relations(user_id,from_type,from_id)`,
`CREATE TABLE IF NOT EXISTS focus_sessions (id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,entity_type text NOT NULL,entity_id text NOT NULL,title text NOT NULL,started_at timestamp NOT NULL DEFAULT now(),ended_at timestamp,planned_minutes integer,actual_minutes integer,outcome text,notes text,completed boolean NOT NULL DEFAULT false)`,
`CREATE INDEX IF NOT EXISTS focus_sessions_user_started_idx ON focus_sessions(user_id,started_at)`,
`CREATE TABLE IF NOT EXISTS day_reviews (id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,date_key text NOT NULL,energy integer,mood text,completed_summary text,moved_summary text,memory_note text,tomorrow_top_three jsonb NOT NULL DEFAULT '[]'::jsonb,created_at timestamp NOT NULL DEFAULT now(),updated_at timestamp NOT NULL DEFAULT now())`,
`CREATE INDEX IF NOT EXISTS day_reviews_user_date_idx ON day_reviews(user_id,date_key)`,
`CREATE TABLE IF NOT EXISTS maintenance_forecasts (id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,domain text NOT NULL,title text NOT NULL,due_at timestamp,urgency text NOT NULL DEFAULT 'normal',source_type text,source_id text,recommendation text,status text NOT NULL DEFAULT 'active',created_at timestamp NOT NULL DEFAULT now(),updated_at timestamp NOT NULL DEFAULT now())`,
`CREATE INDEX IF NOT EXISTS maintenance_forecasts_user_due_idx ON maintenance_forecasts(user_id,due_at)`,
`CREATE TABLE IF NOT EXISTS glow_entities (id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,entity_type text NOT NULL,source_table text,source_id text,title text NOT NULL,summary text,searchable_text text,status text NOT NULL DEFAULT 'active',importance real NOT NULL DEFAULT 0.5,metadata jsonb NOT NULL DEFAULT '{}'::jsonb,created_at timestamp NOT NULL DEFAULT now(),updated_at timestamp NOT NULL DEFAULT now())`,
`CREATE INDEX IF NOT EXISTS glow_entities_user_type_idx ON glow_entities(user_id,entity_type)`,
`CREATE UNIQUE INDEX IF NOT EXISTS glow_entities_source_uidx ON glow_entities(user_id,source_table,source_id)`,
`CREATE TABLE IF NOT EXISTS universal_intake_artifacts (id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,inbox_item_id text,kind text NOT NULL,original_name text,mime_type text,size_bytes integer,source_text text,content_data_url text,detected_type text,detected_title text,extracted jsonb NOT NULL DEFAULT '{}'::jsonb,proposed_destinations jsonb NOT NULL DEFAULT '[]'::jsonb,analysis_status text NOT NULL DEFAULT 'analyzed',confidence real NOT NULL DEFAULT 0.5,created_at timestamp NOT NULL DEFAULT now())`,
`CREATE INDEX IF NOT EXISTS universal_intake_user_created_idx ON universal_intake_artifacts(user_id,created_at)`,
`CREATE TABLE IF NOT EXISTS resource_library_items (id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,title text NOT NULL,category text NOT NULL,duration_minutes integer,content text,tags jsonb NOT NULL DEFAULT '[]'::jsonb,conditions jsonb NOT NULL DEFAULT '{}'::jsonb,archived boolean NOT NULL DEFAULT false,created_at timestamp NOT NULL DEFAULT now(),updated_at timestamp NOT NULL DEFAULT now())`,
`CREATE INDEX IF NOT EXISTS resource_library_user_category_idx ON resource_library_items(user_id,category)`,
`CREATE TABLE IF NOT EXISTS system_preferences (id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,system_key text NOT NULL,pinned boolean NOT NULL DEFAULT false,hidden boolean NOT NULL DEFAULT false,label text,image_url text,card_size text,preferences jsonb NOT NULL DEFAULT '{}'::jsonb,updated_at timestamp NOT NULL DEFAULT now())`,
`CREATE UNIQUE INDEX IF NOT EXISTS system_preferences_user_system_uidx ON system_preferences(user_id,system_key)`,
`CREATE TABLE IF NOT EXISTS glow_notices (id text PRIMARY KEY,user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,domain text NOT NULL,title text NOT NULL,evidence text NOT NULL,recommendation text,confidence real NOT NULL DEFAULT 0.5,status text NOT NULL DEFAULT 'active',action_type text,action_payload jsonb NOT NULL DEFAULT '{}'::jsonb,snoozed_until timestamp,created_at timestamp NOT NULL DEFAULT now())`,
`CREATE INDEX IF NOT EXISTS glow_notices_user_status_idx ON glow_notices(user_id,status)`,
];

let activationPromise:Promise<void>|null=null;

export async function ensureGlowIntelligenceSchema():Promise<void>{
  if(!activationPromise){
    activationPromise=(async()=>{
      for(const statement of statements)await db.execute(sql.raw(statement));
    })().catch(error=>{
      activationPromise=null;
      throw error;
    });
  }
  return activationPromise;
}

export async function activateGlowIntelligenceAction(formData:FormData):Promise<void>{
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const confirmation=String(formData.get('confirmation')??'').trim().toUpperCase();
  if(confirmation!=='ACTIVATE')throw new Error('Type ACTIVATE to confirm the idempotent intelligence schema activation.');
  await ensureGlowIntelligenceSchema();
  revalidatePath('/settings/intelligence');revalidatePath('/today');revalidatePath('/intake');revalidatePath('/inbox');
}
