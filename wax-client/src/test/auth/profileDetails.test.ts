import { describe, it, expect, beforeEach } from 'vitest';
import { getStoredProfileDetails, storeProfileDetails, mapAddressResponse } from '@/features/auth/utils/profileDetails';

const STORAGE_KEY = 'wax.profile.details';

describe('profileDetails', () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  describe('getStoredProfileDetails', () => {
    it('devuelve objeto vacio cuando no hay nada guardado', () => {
      expect(getStoredProfileDetails()).toEqual({});
    });

    it('lee y parsea lo guardado', () => {
      globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify({ firstName: 'Ana', phone: '0991234567' }));
      expect(getStoredProfileDetails()).toEqual({ firstName: 'Ana', phone: '0991234567' });
    });

    it('devuelve objeto vacio si el JSON es invalido (sin romper)', () => {
      globalThis.localStorage.setItem(STORAGE_KEY, '{not-valid-json');
      expect(getStoredProfileDetails()).toEqual({});
    });
  });

  describe('storeProfileDetails', () => {
    it('guarda solo los campos personales (firstName, lastName, identificationType, identificationNumber, phone)', () => {
      storeProfileDetails({
        firstName: 'Ana',
        lastName: 'Lopez',
        identificationType: 'cedula',
        identificationNumber: '0102030405',
        phone: '0991234567',
        // estos no deberian guardarse
        name: 'no-guardar',
        line1: 'no-guardar',
        city: 'no-guardar',
      } as unknown as Parameters<typeof storeProfileDetails>[0]);

      const stored = JSON.parse(globalThis.localStorage.getItem(STORAGE_KEY) ?? '{}');
      expect(stored).toEqual({
        firstName: 'Ana',
        lastName: 'Lopez',
        identificationType: 'cedula',
        identificationNumber: '0102030405',
        phone: '0991234567',
      });
      expect(stored.line1).toBeUndefined();
      expect(stored.city).toBeUndefined();
    });

    it('guardar y leer ida-vuelta funciona', () => {
      storeProfileDetails({ firstName: 'Juan', lastName: 'Perez' });
      expect(getStoredProfileDetails()).toEqual({
        firstName: 'Juan',
        lastName: 'Perez',
        identificationType: undefined,
        identificationNumber: undefined,
        phone: undefined,
      });
    });
  });

  describe('mapAddressResponse', () => {
    it('combina la respuesta del backend con los detalles guardados en localStorage', () => {
      storeProfileDetails({ firstName: 'Ana', phone: '0991234567' });

      const backendResponse = {
        name: 'Ana Lopez',
        line1: 'Av. Amazonas',
        city: 'Quito',
        state: 'Pichincha',
        postalCode: '170150',
        country: 'EC',
      };

      const result = mapAddressResponse(backendResponse as unknown as Parameters<typeof mapAddressResponse>[0]);
      expect(result.name).toBe('Ana Lopez');
      expect(result.firstName).toBe('Ana');
      expect(result.phone).toBe('0991234567');
    });

    it('los datos del localStorage sobreescriben los del backend si hay solapamiento', () => {
      storeProfileDetails({ firstName: 'OverrideLocal' });
      const backend = { name: 'BackendName', line1: 'Av X', city: 'Q', state: 'P', postalCode: '1', country: 'EC' };
      const result = mapAddressResponse(backend as unknown as Parameters<typeof mapAddressResponse>[0]);
      expect(result.firstName).toBe('OverrideLocal');
    });
  });
});
