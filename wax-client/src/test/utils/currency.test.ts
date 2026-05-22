import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@/utils/currency';

describe('formatCurrency', () => {
  it('formats cents as USD currency with two decimals', () => {
    expect(formatCurrency(2000)).toBe('$20.00');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('handles larger amounts with thousand separators', () => {
    expect(formatCurrency(150099)).toBe('$1,500.99');
  });

  it('formats one million cents as $10,000.00', () => {
    expect(formatCurrency(1000000)).toBe('$10,000.00');
  });
});
