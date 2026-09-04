import type { Metadata } from 'next';
import { GlobalHomeControl } from '@/components/global-home-control';
import './globals.css';

export const metadata: Metadata = {
  title: 'Glow OS',
  description: 'One continuous intelligent personal world made from Glow Matter.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlobalHomeControl />
        {children}
      </body>
    </html>
  );
}
