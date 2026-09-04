import type { Metadata } from 'next';
import { ShaktiPresence } from '@/components/shakti/shakti-presence';
import './globals.css';
import './continuous-world.css';
import './reference-rooms.css';
import './glow-os-3.css';
import './reference-board-exact-v2.css';
import './dashboard-reference-exact.css';
import './dashboard-sidebar-exact.css';

export const metadata: Metadata = {
  title: 'Glow OS',
  description: 'A calm intelligent personal life operating system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ShaktiPresence />
      </body>
    </html>
  );
}
