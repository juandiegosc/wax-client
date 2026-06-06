import type { Address, AddressResponse } from '@/lib/types/user';

const PROFILE_DETAILS_STORAGE_KEY = 'wax.profile.details';

export const getStoredProfileDetails = (): Partial<Address> => {
  if (globalThis.window === undefined) return {};
  try {
    const rawValue = globalThis.localStorage.getItem(PROFILE_DETAILS_STORAGE_KEY);
    if (!rawValue) return {};
    return JSON.parse(rawValue) as Partial<Address>;
  } catch {
    return {};
  }
};

export const storeProfileDetails = (address: Partial<Address>) => {
  if (globalThis.window === undefined) return;
  const profileDetails: Partial<Address> = {
    firstName: address.firstName,
    lastName: address.lastName,
    identificationType: address.identificationType,
    identificationNumber: address.identificationNumber,
    phone: address.phone,
  };
  globalThis.localStorage.setItem(PROFILE_DETAILS_STORAGE_KEY, JSON.stringify(profileDetails));
};

export const mapAddressResponse = (address: AddressResponse): Address => ({
  ...address,
  ...getStoredProfileDetails(),
});
