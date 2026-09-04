import type { Metadata, Viewport } from 'next';
import './globals.css';
import './continuous-world.css';
import './reference-rooms.css';
import './glow-os-3.css';
import './reference-board-exact-v2.css';
import './dashboard-reference-exact.css';
import './dashboard-sidebar-exact.css';
import './glow-fidelity-overrides.css';
import './today-living-center-2141-hotfix.css';
import './today-zero-overlap-final.css';
import './today-device-mode.css';
import './shakti-living-presence.css';
import './shakti-volumetric-v3.css';
import './today-shakti-fidelity-v4.css';
import './today-live-v6.css';
import './today-live-v7.css';
import './today-live-v8.css';
import './today-live-v9.css';
import { GlowNavigationNormalizer } from '@/components/glow-navigation-normalizer';
import { GlowWorldRuntime } from '@/components/glow-world-runtime-v3';
import { ShaktiProductLanguage } from '@/components/shakti-product-language';
import { TodayViewportMode } from '@/components/today-viewport-mode';

export const metadata:Metadata={title:'Glow OS',description:'A calm intelligent personal life operating system'};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover'};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="en"><body><TodayViewportMode/><ShaktiProductLanguage/>{children}<GlowNavigationNormalizer/><GlowWorldRuntime/></body></html>;
}
