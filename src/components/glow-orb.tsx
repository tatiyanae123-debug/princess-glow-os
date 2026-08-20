'use client';

import { cn } from '@/lib/utils';

type GlowOrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

export function GlowOrb({
  state = 'idle',
  size = 56,
  className,
}: {
  state?: GlowOrbState;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      data-state={state}
      className={cn('glow-ethereal-orb relative inline-block shrink-0 overflow-hidden rounded-full', className)}
      style={{ width: size, height: size }}
    >
      <span className="glow-ethereal-orb__halo absolute inset-[-22%] rounded-full" />
      <span className="glow-ethereal-orb__body absolute inset-[7%] rounded-full" />
      <span className="glow-ethereal-orb__veil glow-ethereal-orb__veil--a absolute rounded-full" />
      <span className="glow-ethereal-orb__veil glow-ethereal-orb__veil--b absolute rounded-full" />
      <span className="glow-ethereal-orb__core absolute inset-[31%] rounded-full" />
      <span className="glow-ethereal-orb__glint absolute left-[24%] top-[19%] h-[16%] w-[20%] rounded-full" />
      <style jsx>{`
        .glow-ethereal-orb { isolation: isolate; filter: saturate(.92) contrast(1.02); }
        .glow-ethereal-orb__halo {
          background: radial-gradient(circle at 50% 50%, rgba(255,255,255,.95) 0 18%, rgba(237,221,255,.62) 34%, rgba(190,227,255,.44) 49%, rgba(255,219,233,.35) 61%, transparent 75%);
          filter: blur(8px);
          opacity: .92;
          animation: glowHalo 5.5s ease-in-out infinite;
        }
        .glow-ethereal-orb__body {
          background:
            radial-gradient(circle at 33% 28%, rgba(255,255,255,.98) 0 9%, transparent 24%),
            radial-gradient(circle at 66% 31%, rgba(213,238,255,.82) 0 9%, transparent 27%),
            radial-gradient(circle at 37% 69%, rgba(255,217,237,.74) 0 11%, transparent 31%),
            radial-gradient(circle at 68% 70%, rgba(224,216,255,.86) 0 10%, transparent 31%),
            conic-gradient(from 210deg at 50% 50%, #fff 0deg, #e7f4ff 58deg, #f2e8ff 119deg, #ffe9f2 178deg, #f8f5ff 238deg, #e8f7ff 302deg, #fff 360deg);
          box-shadow: inset 0 0 20px rgba(255,255,255,.96), inset -7px -10px 18px rgba(181,205,255,.25), 0 8px 26px rgba(154,139,188,.22);
          animation: glowBody 7s ease-in-out infinite;
        }
        .glow-ethereal-orb__veil { mix-blend-mode: screen; filter: blur(6px); opacity: .72; }
        .glow-ethereal-orb__veil--a { left: 14%; top: 26%; width: 74%; height: 22%; transform: rotate(-24deg); background: linear-gradient(90deg, transparent, rgba(255,255,255,.95), rgba(210,237,255,.72), transparent); animation: glowVeilA 5s ease-in-out infinite; }
        .glow-ethereal-orb__veil--b { left: 21%; top: 48%; width: 65%; height: 18%; transform: rotate(23deg); background: linear-gradient(90deg, transparent, rgba(255,226,241,.8), rgba(255,255,255,.95), transparent); animation: glowVeilB 6.4s ease-in-out infinite; }
        .glow-ethereal-orb__core { background: radial-gradient(circle, rgba(255,255,255,1) 0 24%, rgba(242,238,255,.82) 48%, rgba(212,232,255,.28) 70%, transparent 76%); filter: blur(1px); animation: glowCore 3.6s ease-in-out infinite; }
        .glow-ethereal-orb__glint { background: rgba(255,255,255,.9); filter: blur(2px); transform: rotate(-18deg); }
        [data-state='listening'] .glow-ethereal-orb__halo { animation-duration: 1.8s; opacity: 1; }
        [data-state='listening'] .glow-ethereal-orb__body { animation-duration: 2.3s; }
        [data-state='thinking'] .glow-ethereal-orb__body { animation-duration: 2s; }
        [data-state='thinking'] .glow-ethereal-orb__veil--a,
        [data-state='thinking'] .glow-ethereal-orb__veil--b { animation-duration: 1.7s; }
        [data-state='speaking'] .glow-ethereal-orb__core { animation-duration: 1.15s; }
        @keyframes glowHalo { 0%,100% { transform: scale(.96); opacity: .72; } 50% { transform: scale(1.08); opacity: 1; } }
        @keyframes glowBody { 0%,100% { transform: rotate(-4deg) scale(.985); } 50% { transform: rotate(5deg) scale(1.02); } }
        @keyframes glowVeilA { 0%,100% { transform: translateX(-6%) rotate(-24deg) scaleX(.9); opacity: .46; } 50% { transform: translateX(8%) rotate(-12deg) scaleX(1.1); opacity: .88; } }
        @keyframes glowVeilB { 0%,100% { transform: translateX(5%) rotate(23deg) scaleX(1.05); opacity: .48; } 50% { transform: translateX(-8%) rotate(10deg) scaleX(.92); opacity: .84; } }
        @keyframes glowCore { 0%,100% { transform: scale(.78); opacity: .7; } 50% { transform: scale(1.18); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .glow-ethereal-orb *, .glow-ethereal-orb__halo, .glow-ethereal-orb__body, .glow-ethereal-orb__veil, .glow-ethereal-orb__core { animation: none !important; }
        }
      `}</style>
    </span>
  );
}
