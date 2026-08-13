import { notFound, redirect } from 'next/navigation';
import { and, desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { aiProposals, entityRelations, focusSessions, glowEntities } from '@/db/schema';
import { AppShell } from '@/components/app-shell';
import { UpgradeWorkspace } from '@/components/upgrade-workspace';
import { ROOM_UPGRADES } from '@/lib/intelligence/room-upgrades';

export const dynamic='force-dynamic';

export default async function UpgradePage({params}:{params:Promise<{room:string;tool:string}>}){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const {room,tool:toolId}=await params;const tool=ROOM_UPGRADES[room]?.find(item=>item.id===toolId);if(!tool)notFound();
  const userId=session.user.id,sourceId=`${room}:${toolId}`;
  const [state,entities,proposals,focus,relations]=await Promise.all([
    db.query.glowEntities.findFirst({where:and(eq(glowEntities.userId,userId),eq(glowEntities.sourceTable,'room_upgrade'),eq(glowEntities.sourceId,sourceId))}),
    db.select({id:glowEntities.id,type:glowEntities.entityType,title:glowEntities.title}).from(glowEntities).where(and(eq(glowEntities.userId,userId),eq(glowEntities.status,'active'))).orderBy(desc(glowEntities.updatedAt)).limit(60),
    db.select({id:aiProposals.id}).from(aiProposals).where(and(eq(aiProposals.userId,userId),eq(aiProposals.intent,`room_upgrade:${room}:${toolId}`))).limit(50),
    db.select({id:focusSessions.id}).from(focusSessions).where(and(eq(focusSessions.userId,userId),eq(focusSessions.entityType,'room_upgrade'),eq(focusSessions.entityId,sourceId))).limit(50),
    db.select({id:entityRelations.id}).from(entityRelations).where(eq(entityRelations.userId,userId)).limit(200),
  ]);
  return <AppShell><UpgradeWorkspace room={room} tool={tool} state={state?{title:state.title,summary:state.summary,status:state.status}:null} entities={entities} proposalCount={proposals.length} focusCount={focus.length} relationCount={relations.length}/></AppShell>;
}
