'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Bell, Mic2, Plus, Search, UserRound } from 'lucide-react';

const SEARCH_ROUTES = ['/dashboard', '/planning', '/routines', '/projects', '/brain'];

export function GlobalHeader(){
  const pathname = usePathname();
  const router = useRouter();
  const isDashboard=pathname==='/dashboard'||pathname.startsWith('/dashboard/');
  const showSearch = SEARCH_ROUTES.some(path => pathname === path || pathname.startsWith(`${path}/`));

  if(isDashboard){
    return <header className="dashboard-topnav">
      <label><input placeholder="Search Glow OS..." onFocus={()=>document.dispatchEvent(new Event('glow:voice-open'))}/><Search/></label>
      <button type="button" className="mic" onClick={()=>document.dispatchEvent(new Event('glow:voice-open'))} aria-label="Speak to Glow"><Mic2/><i/></button>
      <button type="button" className="create" onClick={()=>document.dispatchEvent(new CustomEvent('glow:quick-add'))} aria-label="Create new"><Plus/></button>
      <button type="button" className="bell" onClick={()=>router.push('/inbox')} aria-label="Open notifications"><Bell/></button>
      <button type="button" className="top-avatar" onClick={()=>router.push('/settings?section=profile')} aria-label="Open profile">T</button>
    </header>;
  }

  return <header className="glow-global-header sticky top-0 z-40 flex h-[54px] items-center justify-end border-b border-[#F0F0F0] bg-white/96 px-4 backdrop-blur-xl sm:px-5 lg:px-6">
    <div className="flex items-center gap-1.5">
      {showSearch ? <button type="button" onClick={()=>document.dispatchEvent(new Event('glow:voice-open'))} className="glow-search-pill hidden md:flex" aria-label="Search Glow OS"><span>Search Glow OS...</span><Search size={14}/></button> : <button type="button" onClick={()=>document.dispatchEvent(new Event('glow:voice-open'))} className="glow-header-action hidden sm:inline-flex" aria-label="Search Glow"><Search size={16}/></button>}
      <button type="button" onClick={()=>document.dispatchEvent(new Event('glow:voice-open'))} className="glow-header-action" aria-label="Speak to Glow"><Mic2 size={16}/></button>
      <button type="button" onClick={()=>document.dispatchEvent(new CustomEvent('glow:quick-add'))} className="glow-header-action glow-header-create" aria-label="Create new"><Plus size={17}/></button>
      <button type="button" onClick={()=>router.push('/inbox')} className="glow-header-action" aria-label="Open notifications"><Bell size={16}/></button>
      <button type="button" onClick={()=>router.push('/settings?section=profile')} className="glow-header-action glow-profile-action" aria-label="Open profile"><UserRound size={15}/></button>
    </div>
  </header>;
}
