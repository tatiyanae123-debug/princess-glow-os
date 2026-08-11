import { describe, expect, it } from 'vitest';
import { normalizeAppleReminderPayload } from '@/lib/apple-reminders/normalize';

describe('normalizeAppleReminderPayload',()=>{
  it('accepts direct string reminders from Shortcuts magic variables',()=>{
    const result=normalizeAppleReminderPayload({reminders:['Wash hair Thursday','Buy groceries']});
    expect(result?.reminders).toHaveLength(2);
    expect(result?.reminders[0]).toMatchObject({title:'Wash hair Thursday',listName:'Reminders',completed:false});
    expect(result?.reminders[0].externalId).toMatch(/^simple-/);
  });

  it('accepts common Apple Shortcuts reminder detail names',()=>{
    const result=normalizeAppleReminderPayload({reminders:[{
      Identifier:'ABC-123',
      'List Name':'Morning Ritual',
      Title:'Take vitamins',
      Notes:'With breakfast',
      'Due Date':'2026-08-11T08:00:00-04:00',
      'Is Completed':false,
    }]});
    expect(result?.reminders[0]).toEqual({
      externalId:'ABC-123',
      listName:'Morning Ritual',
      title:'Take vitamins',
      notes:'With breakfast',
      dueAt:'2026-08-11T12:00:00.000Z',
      completed:false,
    });
  });

  it('rejects payloads without a reminders array',()=>{
    expect(normalizeAppleReminderPayload({items:[]})).toBeNull();
  });
});
