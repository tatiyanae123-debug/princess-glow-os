export default function SkincareTreatmentLabLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .glow-presence-trigger,
        .glow-unfolded-surface {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}
