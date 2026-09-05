import Link from 'next/link';
import { House } from 'lucide-react';

export default function AskGlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .ask-glow-workspace button[aria-label="Close Ask Glow"] {
          display: none !important;
        }
      `}</style>
      <div className="relative">
        {children}
        <Link
          href="/today"
          aria-label="Exit Ask Glow and return Home"
          title="Return Home"
          className="fixed right-[max(16px,env(safe-area-inset-right))] top-[max(16px,env(safe-area-inset-top))] z-[110] inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#ECECEC] bg-white/95 px-3.5 text-sm font-semibold text-[#1C1C1E] shadow-[0_10px_36px_rgba(28,28,30,.08)] backdrop-blur-xl transition hover:bg-[#FAFAFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B86F7D]/35"
        >
          <House size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Home</span>
        </Link>
      </div>
    </>
  );
}
