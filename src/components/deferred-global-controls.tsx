'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';

const ReferenceRoomInteractions = dynamic(
  () => import('@/components/reference-room-interactions').then((mod) => mod.ReferenceRoomInteractions),
  { ssr: false },
);
const GlowVoiceCommand = dynamic(
  () => import('@/components/voice/glow-voice-command').then((mod) => mod.GlowVoiceCommand),
  { ssr: false },
);
const QuickAdd = dynamic(
  () => import('@/components/quick-add/quick-add').then((mod) => mod.QuickAdd),
  { ssr: false },
);
const GlowActionButton = dynamic(
  () => import('@/components/glow-action-button').then((mod) => mod.GlowActionButton),
  { ssr: false },
);

function DashboardAssistantBridge() {
  useEffect(() => {
    const routeDashboardAsk = () => {
      if (window.location.pathname === '/dashboard' || window.location.pathname.startsWith('/dashboard/')) {
        document.dispatchEvent(new Event('glow:voice-open'));
      }
    };
    document.addEventListener('glow:search-open', routeDashboardAsk);
    return () => document.removeEventListener('glow:search-open', routeDashboardAsk);
  }, []);
  return null;
}

export function DeferredGlobalControls() {
  return (
    <>
      <DashboardAssistantBridge />
      <ReferenceRoomInteractions />
      <GlowVoiceCommand />
      <QuickAdd />
      <GlowActionButton />
    </>
  );
}
