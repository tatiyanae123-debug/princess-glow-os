import { describe, expect, it } from 'vitest';
import { classifyUniversalInput } from './universal-intake';

describe('classifyUniversalInput', () => {
  it('recognizes spreadsheets even when AI analysis is unavailable', () => {
    const result = classifyUniversalInput({
      filename: 'August-budget.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    expect(result.type).toBe('spreadsheet');
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.destinations).toContain('finance');
    expect(result.extracted.extension).toBe('xlsx');
  });

  it('recognizes receipts and extracts money, dates and times', () => {
    const result = classifyUniversalInput({
      text: 'Order total $1,249.50 paid August 20, 2026 at 2:30 pm',
    });

    expect(result.type).toBe('receipt');
    expect(result.extracted.amount).toBe(1249.5);
    expect(result.extracted.dateText).toBe('august 20, 2026');
    expect(result.extracted.timeText).toBe('2:30 pm');
  });

  it('recognizes links and preserves URLs for downstream review', () => {
    const result = classifyUniversalInput({
      text: 'Save this reference https://example.com/design-guide for later',
    });

    expect(result.type).toBe('link');
    expect(result.destinations).toContain('notes');
    expect(result.extracted.urls).toEqual(['https://example.com/design-guide']);
  });

  it('recognizes uploaded PDFs without relying on filename text heuristics', () => {
    const result = classifyUniversalInput({
      filename: 'scan.pdf',
      mimeType: 'application/pdf',
    });

    expect(result.type).toBe('document');
    expect(result.destinations).toContain('memory');
  });
});
