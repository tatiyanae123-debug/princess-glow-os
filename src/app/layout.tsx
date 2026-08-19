import type { Metadata } from 'next';
import './globals.css';
import './reference-rooms.css';
import './glow-os-3.css';
import './final-reference-batch.css';
import './cinematic-interactions.css';
import './architectural-world.css';
import './pink-system.css';
import './apple-reference-final.css';
import './dashboard-reference-3d.css';
import './glow-v3-system.css';
import './batch1-today-planning-reference.css';
import './batch2-mind-reference.css';
import './dashboard-apple-lock.css';
import './dashboard-apple-details.css';

export const metadata: Metadata = {
  title: 'Glow OS',
  description: 'A calm intelligent personal life operating system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
