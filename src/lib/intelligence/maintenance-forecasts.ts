import 'server-only';

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { maintenanceForecasts } from '@/db/schema/adaptive-os';
import { beautyProducts, hairLogs } from '@/db/schema/completion-v1';

export async function refreshMaintenanceForecasts(userId:string,now=new Date()){
  const [products,hair,active]=await Promise.all([
    db.select().from(beautyProducts).where(and(eq(beautyProducts.userId,userId),eq(beautyProducts.archived,false))),
    db.select().from(hairLogs).where(eq(hairLogs.userId,userId)).orderBy(desc(hairLogs.occurredAt)).limit(12),
    db.select().from(maintenanceForecasts).where(and(eq(maintenanceForecasts.userId,userId),eq(maintenanceForecasts.status,'active'))),
  ]);
  const existing=new Set(active.map(x=>`${x.domain}:${x.sourceType}:${x.sourceId}:${x.title}`));
  const proposals:Array<typeof maintenanceForecasts.$inferInsert>=[];
  const inDays=(date:Date)=>Math.ceil((date.getTime()-now.getTime())/86400000);

  for(const product of products){
    if(product.expiresAt){
      const days=inDays(product.expiresAt);
      if(days<=45){const title=days<0?`${product.name} may be expired`:`${product.name} expires ${days===0?'today':`in ${days} day${days===1?'':'s'}`}`;const key=`beauty:beauty_product:${product.id}:${title}`;if(!existing.has(key))proposals.push({userId,domain:'beauty',title,dueAt:product.expiresAt,urgency:days<=7?'high':days<=21?'soon':'normal',sourceType:'beauty_product',sourceId:product.id,recommendation:product.repurchase==='yes'||product.repurchase==='repurchase'?'Review remaining amount and decide whether to repurchase.':'Review whether to finish, replace, or retire this product.'});}
    }
    if(product.openedAt&&!product.expiresAt){const age=Math.floor((now.getTime()-product.openedAt.getTime())/86400000);if(age>=150){const title=`Review how long ${product.name} has been open`;const key=`beauty:beauty_product:${product.id}:${title}`;if(!existing.has(key))proposals.push({userId,domain:'beauty',title,dueAt:null,urgency:'normal',sourceType:'beauty_product',sourceId:product.id,recommendation:`Opened about ${Math.floor(age/30)} months ago. Check the package-after-opening guidance and product condition.`});}}
  }

  const latestHair=hair[0];
  if(latestHair?.nextAction){const title=`Hair: ${latestHair.nextAction}`;const key=`hair:hair_log:${latestHair.id}:${title}`;if(!existing.has(key))proposals.push({userId,domain:'hair',title,dueAt:null,urgency:'normal',sourceType:'hair_log',sourceId:latestHair.id,recommendation:'Protect enough time in Calendar and keep the needed products ready.'});}

  if(proposals.length)await db.insert(maintenanceForecasts).values(proposals);
  return db.select().from(maintenanceForecasts).where(and(eq(maintenanceForecasts.userId,userId),eq(maintenanceForecasts.status,'active')));
}
