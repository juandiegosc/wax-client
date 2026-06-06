import { describe, it, expect } from 'vitest';
import { toFormData } from '@/utils/formData';

describe('toFormData', () => {
  it('agrega strings, numbers y booleans como strings', () => {
    const fd = toFormData({ name: 'WAX', count: 3, active: true });
    expect(fd.get('name')).toBe('WAX');
    expect(fd.get('count')).toBe('3');
    expect(fd.get('active')).toBe('true');
  });

  it('agrega Blob/File como entrada binaria (no como string)', () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    const fd = toFormData({ file: blob });
    const stored = fd.get('file');
    expect(stored).toBeInstanceOf(Blob);
    expect(typeof stored).not.toBe('string');
  });

  it('serializa Date como ISO string', () => {
    const date = new Date('2026-06-05T10:30:00.000Z');
    const fd = toFormData({ createdAt: date });
    expect(fd.get('createdAt')).toBe(date.toISOString());
  });

  it('ignora null y undefined', () => {
    const fd = toFormData({ name: 'WAX', missing: null, alsoMissing: undefined });
    expect(fd.get('name')).toBe('WAX');
    expect(fd.has('missing')).toBe(false);
    expect(fd.has('alsoMissing')).toBe(false);
  });

  it('lanza TypeError para valores no soportados (object plano)', () => {
    expect(() => toFormData({ nested: { foo: 'bar' } })).toThrow(TypeError);
    expect(() => toFormData({ list: [1, 2, 3] })).toThrow(TypeError);
  });
});
