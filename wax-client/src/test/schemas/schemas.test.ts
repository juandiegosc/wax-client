import { describe, it, expect } from 'vitest';
import { loginSchema } from '@/lib/schemas/loginSchema';
import { registerSchema } from '@/lib/schemas/registerSchema';
import { billingProfileSchema } from '@/lib/schemas/billingProfileSchema';

describe('loginSchema', () => {
  it('valida email + password de al menos 6 chars', () => {
    expect(loginSchema.safeParse({ email: 'test@wax.com', password: '123456' }).success).toBe(true);
  });

  it('rechaza email invalido', () => {
    expect(loginSchema.safeParse({ email: 'no-arroba', password: '123456' }).success).toBe(false);
  });

  it('rechaza password corto', () => {
    expect(loginSchema.safeParse({ email: 't@t.com', password: '12345' }).success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('valida correctamente cuando password === confirmPassword', () => {
    const result = registerSchema.safeParse({
      email: 'test@wax.com', password: '123456', confirmPassword: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('rechaza cuando passwords no coinciden', () => {
    const result = registerSchema.safeParse({
      email: 'test@wax.com', password: '123456', confirmPassword: 'distinto',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.path[0] === 'confirmPassword')).toBe(true);
    }
  });

  it('rechaza email invalido', () => {
    expect(registerSchema.safeParse({
      email: 'not-an-email', password: '123456', confirmPassword: '123456',
    }).success).toBe(false);
  });
});

describe('billingProfileSchema', () => {
  const validProfile = {
    firstName: 'Ana',
    lastName: 'Lopez',
    identificationType: 'cedula',
    identificationNumber: '0102030405',
    phone: '0991234567',
    name: 'Ana Lopez',
    line1: 'Av. Amazonas N12-34',
    line2: '',
    city: 'Quito',
    state: 'Pichincha',
    postalCode: '170150',
    country: 'EC',
  };

  it('valida un perfil completo', () => {
    expect(billingProfileSchema.safeParse(validProfile).success).toBe(true);
  });

  it('line2 es opcional (puede ser vacio)', () => {
    expect(billingProfileSchema.safeParse({ ...validProfile, line2: '' }).success).toBe(true);
    expect(billingProfileSchema.safeParse({ ...validProfile, line2: 'Depto 5B' }).success).toBe(true);
  });

  it('rechaza si firstName esta vacio', () => {
    expect(billingProfileSchema.safeParse({ ...validProfile, firstName: '' }).success).toBe(false);
  });

  it('rechaza si firstName supera 50 chars', () => {
    expect(billingProfileSchema.safeParse({ ...validProfile, firstName: 'a'.repeat(51) }).success).toBe(false);
  });

  it('rechaza si line1 supera 200 chars', () => {
    expect(billingProfileSchema.safeParse({ ...validProfile, line1: 'a'.repeat(201) }).success).toBe(false);
  });

  it('rechaza line2 que supera 120 chars', () => {
    expect(billingProfileSchema.safeParse({ ...validProfile, line2: 'a'.repeat(121) }).success).toBe(false);
  });

  it('trim aplica antes de validar', () => {
    expect(billingProfileSchema.safeParse({ ...validProfile, city: '   ' }).success).toBe(false);
  });
});
