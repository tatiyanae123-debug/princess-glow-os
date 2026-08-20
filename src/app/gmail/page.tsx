import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch10GmailView } from '@/components/batch10/special-features-reference';
import { getRecentInboxMessages } from '@/lib/google/gmail-client';
import { gmailActionInsight } from '@/lib/gmail/intelligence';
import { GmailMessageActions } from '@/components/gmail/gmail-message-actions';

export const dynamic='force-dynamic';
export default async function GmailPage({searchParams}:{searchParams:Promise<{messageId?:string}>}){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const params=await searchParams;
 const result=await getRecentInboxMessages(session.user.id);
 if(!result.ok)return <AppShell><div className="mx-auto max-w-[1180px] rounded-[8px] border border-[#ebe4df] bg-white p-5 text-[10px]">Gmail connection needs attention. <Link className="text-[#874555]" href="/connections">Open Connections →</Link></div></AppShell>;
 const rows=result.messages.map(m=>({id:m.id,threadId:m.threadId,from:m.from,subject:m.subject,snippet:m.snippet,date:m.date?m.date.toLocaleDateString('en-US',{month:'short',day:'numeric'}):'',priority:gmailActionInsight(m).priority}));
 const selected=result.messages.find(m=>m.id===params.messageId)??result.messages[0];
 return <AppShell><div className="space-y-3"><Batch10GmailView rows={rows} selectedId={selected?.id}/>{selected?<div id={`gmail-actions-${selected.id}`} className="mx-auto max-w-[1180px] scroll-mt-20 rounded-[8px] border border-[#ebe4df] bg-white p-3"><p className="mb-2 text-[8px] font-semibold uppercase tracking-[.1em] text-[#756d68]">Actions for {selected.subject}</p><GmailMessageActions messageId={selected.id} threadId={selected.threadId} subject={selected.subject} from={selected.from} snippet={selected.snippet}/></div>:null}</div></AppShell>;
}
