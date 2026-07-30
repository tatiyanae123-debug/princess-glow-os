import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Princess Glow OS',
  description: 'A polished personal life OS dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
