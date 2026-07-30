export const featureFlags = {
  livingDashboard: true,
  widgetCustomization: true,
  aiConciergePreview: true,
  lifeWorldPreview: false,
  universalSearchPreview: false,
} as const;

export type FeatureFlag = keyof typeof featureFlags;
