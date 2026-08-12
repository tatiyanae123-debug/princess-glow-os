import { describe, expect, it } from 'vitest';
import { gmailActionInsight } from '@/lib/gmail/intelligence';

describe('gmailActionInsight', () => {
  it('routes appointments to calendar with high priority when time-sensitive', () => {
    const result = gmailActionInsight({
      subject: 'Doctor appointment tomorrow',
      snippet: 'Please confirm your visit.',
      from: 'clinic@example.com',
      unread: true,
    });
    expect(result.category).toBe('appointments');
    expect(result.route).toBe('calendar');
    expect(result.priority).toBe('high');
  });

  it('routes job and school work to projects', () => {
    expect(gmailActionInsight({ subject: 'Interview follow up', unread: true }).route).toBe('projects');
    expect(gmailActionInsight({ subject: 'Course assignment update', unread: false }).route).toBe('projects');
  });

  it('keeps ordinary messages task-oriented and lowers quiet completed signals', () => {
    expect(gmailActionInsight({ subject: 'Family update', unread: true }).route).toBe('tasks');
    expect(gmailActionInsight({ subject: 'Your order shipped', unread: false }).priority).toBe('low');
  });
});
