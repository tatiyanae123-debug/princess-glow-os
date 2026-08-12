import { describe, expect, it } from 'vitest';
import { getInboxRoutingOptions, getSuggestedInboxDestination, isInboxRouteDestination } from './inbox-routing-options';

describe('Glow Inbox routing review', () => {
  it('maps common classifications to the expected default destination', () => {
    expect(getSuggestedInboxDestination('reminder')).toBe('task');
    expect(getSuggestedInboxDestination('appointment')).toBe('calendar');
    expect(getSuggestedInboxDestination('goal')).toBe('goal');
    expect(getSuggestedInboxDestination('career')).toBe('project');
    expect(getSuggestedInboxDestination('receipt')).toBe('finance');
    expect(getSuggestedInboxDestination('beauty')).toBe('note');
  });

  it('keeps the recommendation first while offering every reviewed destination once', () => {
    const options = getInboxRoutingOptions('project');
    expect(options[0]).toEqual({ destination: 'project', label: 'Project', recommended: true });
    expect(options.map((option) => option.destination)).toEqual(['project', 'task', 'calendar', 'goal', 'finance', 'note']);
    expect(new Set(options.map((option) => option.destination)).size).toBe(6);
  });

  it('rejects arbitrary destination values before a server-side write', () => {
    expect(isInboxRouteDestination('task')).toBe(true);
    expect(isInboxRouteDestination('calendar')).toBe(true);
    expect(isInboxRouteDestination('delete_everything')).toBe(false);
    expect(isInboxRouteDestination(null)).toBe(false);
  });
});
