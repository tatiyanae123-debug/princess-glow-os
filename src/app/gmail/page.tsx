import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch7GmailView } from '@/components/batch7/home-world-reference';
import { getRecentInboxMessages } from '@/lib/google/gmail-client';
import { gmailActionInsight } from '@/lib/gmail/intelligence';
import { GmailMessageActions } from '@/components/gmail/gmail-message-actions';

export const dynamic='force-dynamic';
export default async function GmailPage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const result=await getRecentInboxMessages(session.user.id);
 const rows=result.ok?result.messages.map(m=>({id:m.id,from:m.from,subject:m.subject,priority:gmailActionInsight(m).priority})):[];
 return <AppShell><div className="space-y-4"><Batch7GmailView rows={rows} unread={result.ok?result.unreadCount:0}/>{result.ok?<details className="b7-card"><summary className="cursor-pointer text-[10px] font-medium">Message actions</summary><div className="mt-3 divide-y divide-[#eee7e2]">{result.messages.slice(0,8).map(m=><div key={m.id} className="py-3"><p className="text-[10px] font-medium">{m.subject}</p><p className="text-[8px] text-[#918780]">{m.from}</p><GmailMessageActions messageId={m.id} threadId={m.threadId} subject={m.subject} from={m.from} snippet={m.snippet}/></div>)}</div></details>:<div className="b7-card text-[10px]">Gmail connection needs attention. <a className="text-[#925766]" href="/connections">Open Connections</a></div>}</div></AppShell>;
}
