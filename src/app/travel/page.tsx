import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';

export const dynamic='force-dynamic';

export default async function TravelPage(){
 const session=await auth();
 if(!session?.user?.id)redirect('/sign-in');
 return <AppShell><SectionPage eyebrow="Life" title="Travel" description="Trips, reservations, places, and departure context live here when a real travel source or canonical Glow record exists.">
   <section className="rounded-[18px] border border-[#e8dfda] bg-[#fffaf6] p-5">
    <p className="text-[10px] font-medium text-[#554942]">Travel source</p>
    <p className="mt-2 text-[9px] leading-4 text-[#7d7169]">No dedicated travel source is connected yet. Glow uses real Calendar locations where available and will never invent a route, departure time, or reservation.</p>
   </section>
  </SectionPage></AppShell>;
}