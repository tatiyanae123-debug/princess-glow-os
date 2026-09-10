export default function SkincareTreatmentLabLayout({ children }: { children: React.ReactNode }) {
  // The app-root Glow Current and GlowPresence remain visible here. Skincare
  // contributes its own treatment-lab composition, but it never hides or forks
  // the universal navigation or persistent intelligence runtime.
  return children;
}
