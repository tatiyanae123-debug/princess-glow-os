'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { GlowLifeIntelligence } from '@/components/life-intelligence/glow-life-intelligence';
import { GlowVisualStudio } from '@/components/life-intelligence/glow-visual-studio';
import { GlobalSpeakingPresence } from '@/components/life-intelligence/global-speaking-presence';
import { LegacyGlowUiCleanup } from '@/components/life-intelligence/legacy-glow-ui-cleanup';

const HIDDEN_PREFIXES=['/sign-in','/api','/auth'];

export function GlobalGlowIntelligence(){
 const pathname=usePathname();
 useEffect(()=>{
  const openConversation=()=>document.dispatchEvent(new CustomEvent('glow:open-conversation'));
  document.addEventListener('glow:voice-open',openConversation);
  return()=>document.removeEventListener('glow:voice-open',openConversation);
 },[]);
 if(HIDDEN_PREFIXES.some(prefix=>pathname.startsWith(prefix)))return null;
 return <><LegacyGlowUiCleanup/><GlowLifeIntelligence/><GlowVisualStudio/><GlobalSpeakingPresence/></>;
}
