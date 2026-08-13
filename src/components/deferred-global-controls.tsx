'use client';

import dynamic from 'next/dynamic';

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
const UniversalCaptureDock = dynamic(
  () => import('@/components/universal-capture-dock').then((mod) => mod.UniversalCaptureDock),
  { ssr: false },
);
const GlowActionButton = dynamic(
  () => import('@/components/glow-action-button').then((mod) => mod.GlowActionButton),
  { ssr: false },
);

export function DeferredGlobalControls() {
  return (
    <>
      <ReferenceRoomInteractions />
      <GlowVoiceCommand />
      <QuickAdd />
      <UniversalCaptureDock />
      <GlowActionButton />
    </>
  );
}
