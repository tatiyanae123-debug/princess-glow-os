import 'server-only';

import { createHash, randomBytes } from 'crypto';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { appleReminderConnections, appleReminders } from '@/db/schema/intelligence-expansion';
import { glowEntities } from '@/db/schema/interconnected-os';
import type { AppleReminderImport } from '@/lib/validations/apple-reminders';
import { understandAppleReminder } from '@/lib/apple-reminders/intelligence';

function hashKey(value:string){return createHash('sha256').update(value).digest('hex');}

export async function prepareAppleReminderBridge(userId:string){
  const key=`glow_${randomBytes(24).toString('base64url')}`;const tokenHash=hashKey(key);
  await db.insert(appleReminderConnections).values({userId,tokenHash,status:'ready'}).onConflictDoUpdate({target:appleReminderConnections.userId,set:{tokenHash,status:'ready',lastError:null,updatedAt:new Date()}});
  return key;
}

export async function getAppleReminderConnection(userId:string){
  try{const [row]=await db.select().from(appleReminderConnections).where(eq(appleReminderConnections.userId,userId));return row??null;}catch(error){console.error('[Glow OS] Apple Reminders connection unavailable',error);return null;}
}

export async function resolveBridgeUser(bearerKey:string){
  try{const [row]=await db.select({userId:appleReminderConnections.userId}).from(appleReminderConnections).where(eq(appleReminderConnections.tokenHash,hashKey(bearerKey)));return row?.userId??null;}catch(error){console.error('[Glow OS] Apple Reminders bridge lookup unavailable',error);return null;}
}

export async function importAppleReminders(userId:string,payload:AppleReminderImport){
  const now=new Date();let imported=0;
  for(const reminder of payload.reminders){
    const dueAt=reminder.dueAt?new Date(reminder.dueAt):null;
    const intelligence=understandAppleReminder({title:reminder.title,notes:reminder.notes,dueAt,completed:reminder.completed});
    const importance=(intelligence.urgency==='overdue'||intelligence.urgency==='today')?0.85:0.55;
    const [saved]=await db.insert(appleReminders).values({userId,externalId:reminder.externalId,listName:reminder.listName,title:reminder.title,notes:reminder.notes??null,dueAt,completed:reminder.completed,lastSyncedAt:now,importAudit:{importedAt:now.toISOString(),source:'iphone_shortcuts',understoodAs:intelligence.domain,destinations:intelligence.destinations}}).onConflictDoUpdate({target:[appleReminders.userId,appleReminders.externalId],set:{listName:reminder.listName,title:reminder.title,notes:reminder.notes??null,dueAt,completed:reminder.completed,lastSyncedAt:now,importAudit:{importedAt:now.toISOString(),source:'iphone_shortcuts',understoodAs:intelligence.domain,destinations:intelligence.destinations}}}).returning();

    try {
      await db.insert(glowEntities).values({
        userId,
        entityType:'reminder',
        sourceTable:'apple_reminders',
        sourceId:saved.id,
        title:saved.title,
        summary:saved.notes??`${saved.listName} · ${intelligence.intent}`,
        searchableText:`${saved.title} ${saved.notes??''} ${saved.listName}`.trim(),
        status:saved.completed?'completed':'active',
        importance,
        metadata:{source:'apple_reminders',externalId:saved.externalId,listName:saved.listName,dueAt:saved.dueAt?.toISOString()??null,domain:intelligence.domain,destinations:intelligence.destinations,intent:intelligence.intent,nextAction:intelligence.nextAction,urgency:intelligence.urgency,readOnlySource:true},
        updatedAt:now,
      }).onConflictDoUpdate({target:[glowEntities.userId,glowEntities.sourceTable,glowEntities.sourceId],set:{title:saved.title,summary:saved.notes??`${saved.listName} · ${intelligence.intent}`,searchableText:`${saved.title} ${saved.notes??''} ${saved.listName}`.trim(),status:saved.completed?'completed':'active',importance,metadata:{source:'apple_reminders',externalId:saved.externalId,listName:saved.listName,dueAt:saved.dueAt?.toISOString()??null,domain:intelligence.domain,destinations:intelligence.destinations,intent:intelligence.intent,nextAction:intelligence.nextAction,urgency:intelligence.urgency,readOnlySource:true},updatedAt:now}});
    } catch (error) {
      console.error('[Glow OS] Reminder imported but entity indexing is unavailable', error);
    }
    imported+=1;
  }
  await db.update(appleReminderConnections).set({status:'connected',lastImportedAt:now,lastError:null,updatedAt:now}).where(eq(appleReminderConnections.userId,userId));
  return {imported};
}

export async function getAppleRemindersByUser(userId:string){
  try{return await db.select().from(appleReminders).where(eq(appleReminders.userId,userId)).orderBy(desc(appleReminders.dueAt));}catch(error){console.error('[Glow OS] Apple Reminders unavailable',error);return [];}
}
