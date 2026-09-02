import type { Metadata } from 'next';
import './globals.css';
import './today-scenes.css';
import './reference-rooms.css';
import './glow-os-3.css';
import './reference-board-exact-v2.css';
import './dashboard-reference-exact.css';
import './dashboard-sidebar-exact.css';
import './continuous-world.css';
import './today-spatial-polish.css';

export const metadata: Metadata = {
  title: 'Glow OS',
  description: 'A calm intelligent personal life operating system',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Glow' },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
