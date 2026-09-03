import type { Metadata, Viewport } from 'next';
import './globals.css';
import './continuous-world.css';
import './reference-rooms.css';
import './glow-os-3.css';
import './reference-board-exact-v2.css';
import './dashboard-reference-exact.css';
import './dashboard-sidebar-exact.css';
import './glow-fidelity-overrides.css';
import { GlowNavigationNormalizer } from '@/components/glow-navigation-normalizer';
import { GlowWorldRuntime } from '@/components/glow-world-runtime-v3';

export const metadata: Metadata = {
  title: 'Glow OS',
  description: 'A calm intelligent personal life operating system',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <GlowNavigationNormalizer />
        <GlowWorldRuntime />
      </body>
    </html>
  );
}
