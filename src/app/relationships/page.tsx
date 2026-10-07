import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';

export const dynamic='force-dynamic';

export default async function RelationshipsPage(){
 const session=await auth();
 if(!session?.user?.id)redirect('/sign-in');
 return <AppShell><SectionPage eyebrow="Life" title="People" description="Glow only surfaces relationship context when a real connected record, event, or follow-up gives someone a reason to matter now.">
   <section className="rounded-[18px] border border-[#e8dfda] bg-[#fffaf6] p-5">
    <p className="text-[10px] font-medium text-[#554942]">People source</p>
    <p className="mt-2 text-[9px] leading-4 text-[#7d7169]">A dedicated Contacts/People source is not connected to the canonical Life Model yet. Glow will not invent contacts or follow-ups. Calendar-linked people can still surface through their real events.</p>
   </section>
  </SectionPage></AppShell>;
}