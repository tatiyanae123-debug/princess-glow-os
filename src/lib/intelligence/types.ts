export type PrivacyLevel = 'private' | 'sensitive' | 'shared';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type EnergyLevel = 'very-low' | 'low' | 'steady' | 'high';

export type ProposalStatus = 'pending' | 'approved' | 'rejected' | 'applied' | 'failed';

export type ProposalRisk = 'reversible' | 'sensitive' | 'irreversible';

export type MemorySource =
  | 'manual'
  | 'calendar'
  | 'gmail'
  | 'task'
  | 'habit'
  | 'routine'
  | 'project'
  | 'beauty'
  | 'hair'
  | 'fitness'
  | 'finance'
  | 'wellness'
  | 'import';

export interface PersonalMemoryRecord {
  id: string;
  userId: string;
  occurredAt: string;
  source: MemorySource;
  sourceId?: string;
  category: string;
  title: string;
  summary?: string;
  relatedProjectId?: string;
  people: string[];
  confidence: ConfidenceLevel;
  privacyLevel: PrivacyLevel;
  userCorrection?: string;
  attachmentIds: string[];
  relatedMemoryIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EvidenceReference {
  source: MemorySource | 'derived';
  sourceId?: string;
  label: string;
  occurredAt?: string;
}

export interface IntelligentObservation {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: string;
  confidence: ConfidenceLevel;
  evidence: EvidenceReference[];
  windowStart?: string;
  windowEnd?: string;
  suggestedAction?: string;
  dismissedAt?: string;
  snoozedUntil?: string;
  createdAt: string;
}

export type ConciergeActionType =
  | 'create-task'
  | 'update-task'
  | 'reschedule-task'
  | 'create-calendar-event'
  | 'update-calendar-event'
  | 'apply-template'
  | 'adjust-routine'
  | 'update-habit'
  | 'update-project'
  | 'create-finance-note'
  | 'create-health-note';

export interface ConciergeAction {
  id: string;
  type: ConciergeActionType;
  targetId?: string;
  summary: string;
  reason: string;
  before?: Record<string, unknown>;
  after: Record<string, unknown>;
  risk: ProposalRisk;
}

export interface ConciergeProposal {
  id: string;
  userId: string;
  prompt: string;
  responseSummary: string;
  confidence: ConfidenceLevel;
  status: ProposalStatus;
  actions: ConciergeAction[];
  createdAt: string;
  reviewedAt?: string;
  appliedAt?: string;
}

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface DashboardWidgetPreference {
  widgetId: string;
  pinned: boolean;
  hidden: boolean;
  position: number;
  size: WidgetSize;
}

export interface DynamicDashboardContext {
  now: string;
  timezone: string;
  dayOfWeek: string;
  dayTheme?: string;
  isWorkday: boolean;
  energy?: EnergyLevel;
  upcomingEventCount: number;
  unfinishedTaskCount: number;
  workoutName?: string;
  weatherSummary?: string;
  beautyDue: string[];
  hairDue: string[];
  financeDue: string[];
  saintCareDue: string[];
}

export interface TemplateDefinition {
  id: string;
  userId?: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  energyRequired?: EnergyLevel;
  source: 'system' | 'user' | 'import';
  sourceVersion?: string;
  items: TemplateItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateItem {
  id: string;
  type: 'task' | 'habit' | 'routine' | 'calendar-event' | 'workout' | 'reminder';
  title: string;
  category?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
  startTime?: string;
  durationMinutes?: number;
  recurrence?: string[];
  metadata?: Record<string, unknown>;
}

export interface ImportPreviewItem extends TemplateItem {
  selected: boolean;
  duplicateOfId?: string;
  duplicateReason?: string;
}

export interface ImportBatchSummary {
  id: string;
  source: string;
  sourceVersion?: string;
  createdCount: number;
  skippedCount: number;
  duplicateCount: number;
  createdAt: string;
  undoneAt?: string;
}

export interface IntelligentHabitDefinition {
  id: string;
  userId: string;
  label: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  customDays?: number[];
  minimumGoal: number;
  stretchGoal?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
  durationMinutes?: number;
  allowedAlternateLabels: string[];
  recoveryRule?: string;
  relatedGoalId?: string;
  relatedRoutineId?: string;
  energyRequired?: EnergyLevel;
  active: boolean;
}

export interface HabitCompletionRecord {
  id: string;
  habitId: string;
  completedAt: string;
  completionMethod?: string;
  notes?: string;
  skipped: boolean;
  skipReason?: string;
}
