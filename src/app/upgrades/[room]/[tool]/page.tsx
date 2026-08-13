import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {and,desc,eq} from 'drizzle-orm';
import {ArrowLeft} from 'lucide-react';
import {auth} from '@/auth';
import {db} from '@/db';
import {glowEntities} from '@/db/schema';
import {AppShell} from '@/components/app-shell';
import {UpgradeObjectManager} from '@/components/upgrade-object-manager';
import {loadUpgradeSet} from '@/lib/upgrades/loader';

export const dynamic='force-dynamic';

export default async function CanonicalUpgradeRoute({params}:{params:Promise<{room:string;tool:string}>}){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const {room,tool:toolId}=await params,set=await loadUpgradeSet(room),tool=set?.upgrades.find(item=>item.id===toolId);if(!set||!tool)notFound();
 if(tool.kind==='relations')redirect(`/brain/connections?room=${encodeURIComponent(room)}&tool=${encodeURIComponent(toolId)}`);
 const rows=await db.select().from(glowEntities).where(and(eq(glowEntities.userId,session.user.id),eq(glowEntities.sourceTable,'glow_upgrade'),eq(glowEntities.status,'active'))).orderBy(desc(glowEntities.updatedAt)).limit(300);
 const items=rows.filter(item=>{const meta=(item.metadata??{}) as Record<string,unknown>;return meta.room===room&&meta.tool===toolId;}).map(item=>({id:item.id,title:item.title,summary:item.summary,entityType:item.entityType,metadata:(item.metadata??{}) as Record<string,unknown>}));
 const connected=tool.kind==='insight'?`/search?scope=${encodeURIComponent((tool.scope??[room]).join(','))}`:tool.kind==='history'?'/timeline':tool.kind==='planning'?'/concierge':tool.kind==='review'?'/briefings':null;
 return <AppShell><div className="mx-auto max-w-5xl space-y-6"><div className="flex items-center justify-between gap-4"><Link href={set.path} className="inline-flex items-center gap-2 text-xs font-medium text-[#9A7C76]"><ArrowLeft size={14}/>Back to {set.label}</Link><span className="glow-eyebrow">Glow Upgrade Workspace</span></div><header className="editorial-surface rounded-[28px] border border-[#EFE2DC] bg-white p-6 sm:p-8"><p className="glow-eyebrow">{set.label}</p><h1 className="glow-display mt-2 text-4xl text-[#2B2420] sm:text-5xl">{tool.label}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#82756D]">{tool.description}</p><div className="mt-5 flex flex-wrap gap-2">{tool.href?<Link href={tool.href} className="rounded-full border border-[#E3D4CE] bg-[#FFF9F7] px-4 py-2.5 text-xs font-semibold text-[#A8646D]">Open native Glow feature →</Link>:null}{connected?<Link href={connected} className="rounded-full bg-[#302A27] px-4 py-2.5 text-xs font-semibold text-white">Open connected Glow view →</Link>:null}</div></header><UpgradeObjectManager room={room} tool={toolId} items={items} entityType={tool.entityType??'upgrade_item'} fields={tool.fields??[]}/></div></AppShell>;
}
