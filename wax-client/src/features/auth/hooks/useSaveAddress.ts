import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import agent from '@/lib/api/agent';
import { mutationKeys, queryKeys } from '@/lib/queryKeys';
import type { Address, AddressResponse } from '@/lib/types/user';
import { mapAddressResponse, storeProfileDetails } from '@/features/auth/utils/profileDetails';

// El backend a veces responde 400 "Failed to save billing address" pero la
// direccion SI quedo guardada. Hacemos un GET para recuperar la version real.
const isFalseNegativeBillingSaveError = (error: unknown) => {
  return isAxiosError(error)
    && error.response?.status === 400
    && error.response?.data === 'Failed to save billing address';
};

export const useSaveAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.user.saveAddress,
    mutationFn: async (address: Address) => {
      const mergeSavedAddress = (savedAddress: AddressResponse) => ({
        ...mapAddressResponse(savedAddress),
        firstName: address.firstName,
        lastName: address.lastName,
        identificationType: address.identificationType,
        identificationNumber: address.identificationNumber,
        phone: address.phone,
      });

      try {
        const response = await agent.post<AddressResponse>('/account/billing-address', address);
        return mergeSavedAddress(response.data);
      } catch (error) {
        if (!isFalseNegativeBillingSaveError(error)) throw error;
        const recoveryResponse = await agent.get<AddressResponse>('/account/billing-address');
        return mergeSavedAddress(recoveryResponse.data);
      }
    },
    onSuccess: async (updatedAddress) => {
      storeProfileDetails(updatedAddress);
      queryClient.setQueryData(queryKeys.user.address(), updatedAddress);
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.current() });
    },
  });
};
