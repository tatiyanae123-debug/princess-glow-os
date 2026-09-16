export const BEAUTY_MAINTENANCE_CADENCES = ['daily','few-days','weekly','biweekly','monthly','seasonal','appointment','event','condition'] as const;
export type BeautyMaintenanceCadence = typeof BEAUTY_MAINTENANCE_CADENCES[number];

export type BeautyMaintenanceObject = {
  id: string;
  title: string;
  domain: 'hair'|'skin'|'body'|'nails'|'brows'|'lashes'|'oral'|'tools'|'inventory';
  cadence: BeautyMaintenanceCadence;
  intervalDays?: number;
  condition?: string;
  prepRoutineIds?: string[];
  recoveryRoutineIds?: string[];
  requiredObjectIds?: string[];
  appointmentType?: string;
  source?: 'user'|'provider'|'manufacturer'|'glow';
  sourceConflict?: string;
};

export type MaintenanceOccurrence = {
  maintenanceId: string;
  dueAt: string;
  status: 'upcoming'|'due'|'late'|'completed'|'skipped'|'rescheduled';
  reason: string;
};

export function shouldAutoSchedule(item: BeautyMaintenanceObject) {
  return item.cadence !== 'condition' && item.cadence !== 'event';
}

// Calendar law: cadence is layered. Event/condition triggers can coexist with a recurring baseline.
// Conflict law: preserve source disagreement instead of collapsing competing provider/manufacturer/user guidance.
