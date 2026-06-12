import { describe, it, expect } from 'vitest';
import { formatCurrency, calculateDeliveryFee } from '@/utils/currency';

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

describe('calculateDeliveryFee (IVA 15%)', () => {
  it('aplica 15% sobre el subtotal en centavos', () => {
    expect(calculateDeliveryFee(10000)).toBe(1500);
    expect(calculateDeliveryFee(20000)).toBe(3000);
  });

  it('trunca decimales (no redondea) — refleja el backend Math.trunc', () => {
    // 1001 * 0.15 = 150.15 → trunca a 150
    expect(calculateDeliveryFee(1001)).toBe(150);
    // 999 * 0.15 = 149.85 → trunca a 149
    expect(calculateDeliveryFee(999)).toBe(149);
  });

  it('devuelve 0 para subtotal 0', () => {
    expect(calculateDeliveryFee(0)).toBe(0);
  });
});
