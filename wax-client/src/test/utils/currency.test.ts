import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@/utils/currency';

describe('formatCurrency', () => {
  it('formats a whole number as USD currency', () => {
    expect(formatCurrency(42000)).toBe('$42,000');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('rounds decimals since maximumFractionDigits is 0', () => {
    expect(formatCurrency(1500.99)).toBe('$1,501');
  });

  it('formats large amounts with thousand separators', () => {
    expect(formatCurrency(1000000)).toBe('$1,000,000');
  });
});
