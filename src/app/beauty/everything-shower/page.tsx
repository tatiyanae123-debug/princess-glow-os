import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { EverythingShowerStudio } from '@/components/beauty/everything-shower-studio';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getBeautyIntelligenceState } from '@/lib/data/advanced-beauty';

export const dynamic='force-dynamic';
const MATCH=/shower|shampoo|condition|hair mask|scalp|body wash|exfoliat|scrub|shav|body treatment|lotion|body oil|leave.?in|heat protect|post.?shower/i;
export default async function EverythingShowerPage(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');const userId=session.user.id;const [routines,intelligence]=await Promise.all([getBeautyRoutinesByUser(userId),getBeautyIntelligenceState(userId)]);const steps=routines.filter(r=>MATCH.test(`${r.name} ${r.notes??''}`)).sort((a,b)=>a.stepOrder-b.stepOrder);const activeRun=intelligence.activeRuns.find(r=>r.ritualKey==='everything-shower')??null;return <AppShell><EverythingShowerStudio steps={steps} activeRun={activeRun}/></AppShell>}
