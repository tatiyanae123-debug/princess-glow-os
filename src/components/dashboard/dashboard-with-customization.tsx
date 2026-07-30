'use client';

import { useEffect, useRef } from 'react';
import { Palette } from 'lucide-react';
import { CustomizationProvider, useCustomization } from './customization-context';
import { VisualSettingsPanel } from './visual-settings-panel';
import { LivingDashboard } from './living-dashboard';
import type { LivingDashboardData } from '@/lib/dashboard/types';

// ── Inner component (has access to context) ───────────────────────────────────

function DashboardInner({ data, error }: { data: LivingDashboardData; error?: string }) {
  const ctx = useCustomization();
  const customizeBtnRef = useRef<HTMLButtonElement>(null);

  // When the panel closes, return focus to the customise button
  useEffect(() => {
    if (ctx && !ctx.isCustomizing) {
      customizeBtnRef.current?.focus();
    }
  }, [ctx]);

  if (!ctx || ctx.isLoading) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading visual preferences"
        className="flex min-h-[200px] items-center justify-center text-sm text-slate-500 dark:text-slate-400"
      >
        Loading your visual preferences…
      </div>
    );
  }

  const { isCustomizing, toggleCustomizing, prefs } = ctx;

  // Build background CSS for the wrapper
  const backgroundStyle: React.CSSProperties = {};
  if (prefs.background.type === 'solid' && prefs.background.value) {
    backgroundStyle.backgroundColor = prefs.background.value;
    backgroundStyle.opacity = prefs.background.opacity;
  } else if (prefs.background.type === 'gallery' && prefs.background.value) {
    backgroundStyle.background = prefs.background.value;
  }

  return (
    <>
      {/* Customise button — always visible */}
      <div className="mb-4 flex justify-end">
        <button
          ref={customizeBtnRef}
          type="button"
          onClick={toggleCustomizing}
          aria-expanded={isCustomizing}
          aria-controls="visual-settings-panel"
          aria-label={isCustomizing ? 'Close visual settings' : 'Open visual settings'}
          className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-rose-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <Palette size={15} aria-hidden="true" />
          Customise
        </button>
      </div>

      {/* Dashboard with optional background override */}
      <div
        className="relative rounded-[24px]"
        style={backgroundStyle}
        data-customizing={isCustomizing ? 'true' : undefined}
        data-reduced-motion={prefs.reducedMotion ? 'true' : undefined}
      >
        <LivingDashboard data={data} error={error} />
      </div>

      {/* Visual settings panel (rendered as a portal-like overlay) */}
      <VisualSettingsPanel />
    </>
  );
}

// ── Public component ───────────────────────────────────────────────────────────

export function DashboardWithCustomization({ data, error }: { data: LivingDashboardData; error?: string }) {
  return (
    <CustomizationProvider>
      <DashboardInner data={data} error={error} />
    </CustomizationProvider>
  );
}
