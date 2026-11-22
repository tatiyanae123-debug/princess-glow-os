export type PlannerView = 'today' | 'tomorrow' | 'week' | 'month';
export type PlannerRouteView = PlannerView | 'archive' | 'insights';
export type PlannerValue = string | boolean;

export type PlannerDocumentData = {
  version: 1;
  view: PlannerView;
  periodKey: string;
  values: Record<string, PlannerValue>;
};

export type PlannerDocumentRecord = {
  id: string;
  view: PlannerView;
  periodKey: string;
  data: PlannerDocumentData;
  focus: string | null;
  progress: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const PLANNER_VIEWS: PlannerView[] = ['today', 'tomorrow', 'week', 'month'];
export const PLANNER_ROUTE_VIEWS: PlannerRouteView[] = [...PLANNER_VIEWS, 'archive', 'insights'];

export function isPlannerView(value: string): value is PlannerView {
  return PLANNER_VIEWS.includes(value as PlannerView);
}

export function isPlannerRouteView(value: string): value is PlannerRouteView {
  return PLANNER_ROUTE_VIEWS.includes(value as PlannerRouteView);
}

function localIsoDay(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isoWeekKey(date: Date) {
  const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day + 3);
  const firstThursday = new Date(copy.getFullYear(), 0, 4);
  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);
  const week = 1 + Math.round((copy.getTime() - firstThursday.getTime()) / 604800000);
  return `${copy.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function plannerKeyForDate(view: PlannerView, date = new Date()) {
  if (view === 'tomorrow') {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return localIsoDay(tomorrow);
  }
  if (view === 'today') return localIsoDay(date);
  if (view === 'week') return isoWeekKey(date);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function dateFromWeekKey(key: string) {
  const match = /^(\d{4})-W(\d{2})$/.exec(key);
  if (!match) return new Date();
  const year = Number(match[1]);
  const week = Number(match[2]);
  const jan4 = new Date(year, 0, 4);
  const mondayOffset = (jan4.getDay() + 6) % 7;
  const monday = new Date(year, 0, 4 - mondayOffset);
  monday.setDate(monday.getDate() + (week - 1) * 7);
  return monday;
}

export function movePlannerKey(view: PlannerView, key: string, delta: number) {
  if (view === 'month') {
    const [year, month] = key.split('-').map(Number);
    const date = new Date(year, (month || 1) - 1 + delta, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  if (view === 'week') {
    const date = dateFromWeekKey(key);
    date.setDate(date.getDate() + delta * 7);
    return isoWeekKey(date);
  }
  const date = new Date(`${key}T12:00:00`);
  if (Number.isNaN(date.getTime())) return plannerKeyForDate(view);
  date.setDate(date.getDate() + delta);
  return localIsoDay(date);
}

export function emptyPlannerDocument(view: PlannerView, periodKey: string): PlannerDocumentData {
  return { version: 1, view, periodKey, values: {} };
}

export function parsePlannerDocument(raw: string | null, view: PlannerView, periodKey: string): PlannerDocumentData {
  if (!raw) return emptyPlannerDocument(view, periodKey);
  try {
    const parsed = JSON.parse(raw) as Partial<PlannerDocumentData>;
    if (parsed.version === 1 && parsed.values && typeof parsed.values === 'object') {
      return {
        version: 1,
        view,
        periodKey,
        values: parsed.values as Record<string, PlannerValue>,
      };
    }
  } catch {}
  return emptyPlannerDocument(view, periodKey);
}

export function plannerFocus(data: PlannerDocumentData) {
  const value = data.values.focus;
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 2000) : null;
}

const completionKeys = [
  'priority1', 'priority2', 'priority3',
  'nonNegotiable1', 'nonNegotiable2', 'nonNegotiable3',
  'driver1', 'driver2', 'driver3',
];

export function plannerProgress(data: PlannerDocumentData) {
  const populated = completionKeys.filter((key) => typeof data.values[key] === 'string' && String(data.values[key]).trim());
  if (!populated.length) return 0;
  const done = populated.filter((key) => data.values[`${key}Done`] === true).length;
  return Math.round((done / populated.length) * 100);
}

export function plannerPeriodBounds(view: PlannerView, key: string) {
  if (view === 'month') {
    const [year, month] = key.split('-').map(Number);
    const start = new Date(year, (month || 1) - 1, 1);
    const end = new Date(year, month || 1, 0, 23, 59, 59, 999);
    return { start, end };
  }
  if (view === 'week') {
    const start = dateFromWeekKey(key);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  const start = new Date(`${key}T00:00:00`);
  const safeStart = Number.isNaN(start.getTime()) ? new Date() : start;
  const end = new Date(safeStart);
  end.setHours(23, 59, 59, 999);
  return { start: safeStart, end };
}

export function plannerLabel(view: PlannerView, key: string) {
  if (view === 'month') {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, (month || 1) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  if (view === 'week') {
    const start = dateFromWeekKey(key);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }
  const date = new Date(`${key}T12:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function monthCalendarDays(key: string) {
  const [year, month] = key.split('-').map(Number);
  const first = new Date(year, (month || 1) - 1, 1);
  const offset = first.getDay();
  const count = new Date(year, month || 1, 0).getDate();
  return Array.from({ length: offset + count }, (_, index) => {
    if (index < offset) return null;
    const day = index - offset + 1;
    return {
      day,
      key: `${year}-${String(month || 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    };
  });
}
