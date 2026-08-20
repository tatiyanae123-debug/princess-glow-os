import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch10RemindersView } from '@/components/batch10/special-features-reference';
import { getAppleReminderConnection, getAppleRemindersByUser } from '@/lib/apple-reminders/service';
import { understandAppleReminder } from '@/lib/apple-reminders/intelligence';

export const dynamic='force-dynamic';

export default async function RemindersPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const userId=session.user.id;
  const [rows,connection]=await Promise.all([getAppleRemindersByUser(userId),getAppleReminderConnection(userId)]);
  const reminders=rows.map(row=>{
    const intelligence=understandAppleReminder({title:row.title,notes:row.notes,dueAt:row.dueAt,completed:row.completed});
    return {id:row.id,title:row.title,notes:row.notes,listName:row.listName,dueAt:row.dueAt?.toISOString()??null,completed:row.completed,lastSyncedAt:row.lastSyncedAt.toISOString(),...intelligence};
  });
  return <AppShell><div className="space-y-3"><Batch10RemindersView reminders={reminders}/><div className="mx-auto flex max-w-[1180px] items-center justify-between rounded-[8px] border border-[#ebe4df] bg-white px-3 py-2 text-[8px] text-[#8a817b]"><span>Apple reminders are imported read-only copies. Edit or complete them in Apple Reminders, then sync again.</span><Link href="/connections#apple-reminders" className="text-[#874555]">{connection?.status==='connected'?'Sync settings':'Set up sync'} →</Link></div></div></AppShell>;
}
