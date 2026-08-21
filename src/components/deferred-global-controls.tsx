'use client';

import dynamic from 'next/dynamic';

const ReferenceRoomInteractions = dynamic(
  () => import('@/components/reference-room-interactions').then((mod) => mod.ReferenceRoomInteractions),
  { ssr: false },
);
const QuickAdd = dynamic(
  () => import('@/components/quick-add/quick-add').then((mod) => mod.QuickAdd),
  { ssr: false },
);

export function DeferredGlobalControls() {
  return (
    <>
      <ReferenceRoomInteractions />
      <QuickAdd />
    </>
  );
}
