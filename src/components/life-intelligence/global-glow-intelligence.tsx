'use client';

import { usePathname } from 'next/navigation';
import { GlowLifeIntelligence } from '@/components/life-intelligence/glow-life-intelligence';
import { HumanVoiceBridge } from '@/components/voice/human-voice-bridge';

const HIDDEN_PREFIXES=['/sign-in','/api','/auth'];

export function GlobalGlowIntelligence(){
 const pathname=usePathname();
 if(HIDDEN_PREFIXES.some(prefix=>pathname.startsWith(prefix)))return null;
 return <>
  <GlowLifeIntelligence/>
  <HumanVoiceBridge/>
 </>;
}
