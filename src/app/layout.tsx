import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GlowCurrent } from '@/components/glow/glow-current';
import { GlowPresence } from '@/components/glow/glow-presence';
import { DeepRoomAtmosphere } from '@/components/glow/deep-room-atmosphere';
import { SpatialRouteTransition } from '@/components/glow/spatial-route-transition';
import './globals.css';
import './continuous-world.css';
import './reference-rooms.css';
import './glow-os-3.css';
import './reference-board-exact-v2.css';
import './dashboard-reference-exact.css';
import './dashboard-sidebar-exact.css';
import './image-polish.css';
import './image-page-overrides.css';
import './spatial-navigation.css';
import './glow-current.css';
import './today-spatial-world.css';
import './sidebar-precision.css';
import './plan-time-observatory.css';
import './glow-living-presence.css';
import './glow-canonical-integration.css';
import './glow-shell.css';
import './world-fold-2.css';
import './world-fold-2-fixes.css';
import './domain-native-rooms.css';
import './reference-fidelity-v4.css';
import './reference-fidelity-v4-interactions.css';
import './reference-fidelity-v4-rooms.css';
import './reference-fidelity-v4-goals.css';
import './reference-fidelity-v4-studio.css';
import './reference-fidelity-v4-support.css';

export const metadata: Metadata = {
  title: 'Glow OS',
  description: 'A calm intelligent personal life operating system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Suspense fallback={null}>
          <DeepRoomAtmosphere />
          <GlowCurrent />
        </Suspense>
        <SpatialRouteTransition />
        <GlowPresence />
      </body>
    </html>
  );
}
