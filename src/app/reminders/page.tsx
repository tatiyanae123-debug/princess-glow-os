import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { RemindersRoom } from '@/components/reminders/reminders-room';
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
  return <AppShell><RemindersRoom reminders={reminders} connection={connection?{status:connection.status,lastImportedAt:connection.lastImportedAt?.toISOString()??null}:null}/></AppShell>;
}
