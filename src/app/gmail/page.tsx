import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { getRecentInboxMessages } from '@/lib/google/gmail-client';
import { classifyGmailMetadata, safeGmailSummary } from '@/lib/gmail/intelligence';
import { Mail, LockKeyhole, Sparkles } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function GmailPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const result=await getRecentInboxMessages(session.user.id);
  return <AppShell><SectionPage eyebrow="Gmail Intelligence" title="See what deserves attention without living in your inbox" description="Glow OS reads a bounded set of recent Gmail metadata and snippets only. It does not send, delete, archive, or modify your email.">
    <div className="space-y-4">
      <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#eeeae6,#f7f1ec)] p-5"><Mail size={54} strokeWidth={.75} className="absolute right-5 top-3 text-[#7e756d]/15"/><p className="glow-eyebrow">Correspondence desk</p><p className="glow-display mt-2 text-[24px] text-[#4a413a]">Read what matters. Leave the noise in the inbox.</p><div className="mt-3 flex items-center gap-2 text-[8px] text-[#7c7169]"><LockKeyhole size={10}/>Read-only intelligence</div></Card>
      {!result.ok?<Card><p className="glow-eyebrow">Connection notice</p><h2 className="glow-display mt-2 text-[18px] text-[#4a413a]">Gmail needs attention</h2><p className="mt-2 text-[9px] text-[#7f736b]">Connection state: {result.reason.replaceAll('_',' ')}. Reconnect Google from Connections if needed.</p><a href="/connections" className="mt-4 inline-block rounded-[6px] bg-[#443b35] px-3 py-2 text-[8px] text-white">Open Connections</a></Card>:<><div className="grid gap-3 sm:grid-cols-3"><Card><p className="text-[8px] text-[#83776f]">Recent messages</p><p className="glow-display mt-2 text-[26px] text-[#4b423b]">{result.messages.length}</p></Card><Card><p className="text-[8px] text-[#83776f]">Unread in sample</p><p className="glow-display mt-2 text-[26px] text-[#4b423b]">{result.unreadCount}</p></Card><Card><p className="text-[8px] text-[#83776f]">Access</p><p className="glow-display mt-2 text-[18px] text-[#4b423b]">Read-only</p></Card></div><Card className="p-0 overflow-hidden"><div className="flex items-center gap-2 border-b border-[#e7ddd7] px-5 py-4"><Sparkles size={13} className="text-[#81756c]"/><div><p className="glow-eyebrow">Attention edit</p><h2 className="glow-display mt-1 text-[19px] text-[#4a413a]">Correspondence feed</h2></div></div>{result.messages.length===0?<p className="p-8 text-center text-[9px] text-[#887b73]">No recent inbox messages returned.</p>:<div className="divide-y divide-[#eee5df]">{result.messages.map((message,index)=>{const category=classifyGmailMetadata(message);return <article key={message.id} className={`p-4 ${message.unread||index===0?'bg-[#f7efea]/65':''}`}><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="glow-display text-[14px] text-[#4a413a]">{message.subject}</p><p className="mt-1 text-[7px] text-[#96877e]">{message.from}</p></div><div className="flex gap-1"><span className="rounded-full bg-white/60 px-2 py-1 text-[7px] capitalize text-[#766b64]">{category}</span>{message.unread?<span className="rounded-full bg-[#514740] px-2 py-1 text-[7px] text-white">Unread</span>:null}</div></div><p className="mt-3 text-[8px] leading-4 text-[#766b64]">{safeGmailSummary(message)}</p>{message.date?<p className="mt-2 text-[7px] text-[#9b8d84]">{message.date.toLocaleString()}</p>:null}</article>;})}</div>}</Card></>}
    </div>
  </SectionPage></AppShell>;
}
