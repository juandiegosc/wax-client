import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from 'axios';
import { useNavigate } from "react-router";
import agent from "../api/agent";
import { mutationKeys, queryKeys } from "../queryKeys";
import type { Address, AddressResponse, Login, Register, UserInfo } from "../types/user";

const PROFILE_DETAILS_STORAGE_KEY = "wax.profile.details";

const getStoredProfileDetails = (): Partial<Address> => {
  if (globalThis.window === undefined) return {};

  try {
    const rawValue = globalThis.localStorage.getItem(PROFILE_DETAILS_STORAGE_KEY);
    if (!rawValue) return {};
    return JSON.parse(rawValue) as Partial<Address>;
  } catch {
    return {};
  }
};

const storeProfileDetails = (address: Partial<Address>) => {
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

const mapAddressResponse = (address: AddressResponse): Address => ({
  ...address,
  ...getStoredProfileDetails(),
});

const isFalseNegativeBillingSaveError = (error: unknown) => {
  return isAxiosError(error)
    && error.response?.status === 400
    && error.response?.data === 'Failed to save billing address';
};

/**
 * Hook for fetching current user info
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      const response = await agent.get<UserInfo>("/account/user-info");
      if (response.status === 204 || !response.data) return null;

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - user data doesn't change frequently
    retry: false, // Don't retry on 401 unauthorized
  });
};

/**
 * Hook for fetching saved address
 */
export const useUserAddress = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.user.address(),
    queryFn: async () => {
      try {
        const response = await agent.get<AddressResponse>("/account/billing-address");
        if (response.status === 204 || !response.data) return null;
        return mapAddressResponse(response.data);
      } catch {
        // User has no billing address yet - this is expected for new users
        return null;
      }
    },
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

/**
 * Hook for user login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.user.login,
    mutationFn: async (creds: Login) => {
      await agent.post("/login?useCookies=true", creds);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
};

/**
 * Hook for user registration
 */
export const useRegister = () => {
  return useMutation({
    mutationKey: mutationKeys.user.register,
    mutationFn: async (creds: Register) => {
      await agent.post("/account/register", creds);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationKey: mutationKeys.user.logout,
    mutationFn: async () => {
      await agent.post("/account/logout");
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.user.all });
      queryClient.removeQueries({ queryKey: queryKeys.basket.all });
      navigate("/");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });
};

/**
 * Hook for saving user address
 */
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
        const response = await agent.post<AddressResponse>("/account/billing-address", address);
        return mergeSavedAddress(response.data);
      } catch (error) {
        if (!isFalseNegativeBillingSaveError(error)) throw error;

        const recoveryResponse = await agent.get<AddressResponse>("/account/billing-address");
        return mergeSavedAddress(recoveryResponse.data);
      }
    },
    onSuccess: async (updatedAddress) => {
      storeProfileDetails(updatedAddress);
      queryClient.setQueryData(queryKeys.user.address(), updatedAddress);
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.current() });
    },
    onError: (error) => {
      console.error("Failed to save address:", error);
    },
  });
};

/**
 * Composite hook that combines all account functionality
 * Maintains backward compatibility with existing code
 */
export const useAccount = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      const response = await agent.get<UserInfo>("/account/user-info");
      if (response.status === 204 || !response.data) return null;

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - better than checking queryClient.getQueryData
    retry: false, // Don't retry on 401 unauthorized
  });

  const loginUser = useMutation({
    mutationKey: mutationKeys.user.login,
    mutationFn: async (creds: Login) => {
      await agent.post("/login?useCookies=true", creds);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  const registerUser = useMutation({
    mutationKey: mutationKeys.user.register,
    mutationFn: async (creds: Register) => {
      await agent.post("/account/register", creds);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    },
  });

  const logoutUser = useMutation({
    mutationKey: mutationKeys.user.logout,
    mutationFn: async () => {
      await agent.post("/account/logout");
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.user.all });
      queryClient.removeQueries({ queryKey: queryKeys.basket.all });
      navigate("/");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });

  const { data: savedAddress, isLoading: isLoadingAddress } = useQuery({
    queryKey: queryKeys.user.address(),
    queryFn: async () => {
      try {
        const response = await agent.get<AddressResponse>("/account/billing-address");
        if (response.status === 204 || !response.data) return null;

        return mapAddressResponse(response.data);
      } catch {
        return null;
      }
    },
    enabled: !!currentUser,
    retry: false,
  });

  const saveAddress = useMutation({
    mutationKey: mutationKeys.user.saveAddress,
    mutationFn: async (address: Address) => {
      const response = await agent.post<AddressResponse>("/account/billing-address", address);
      return {
        ...mapAddressResponse(response.data),
        firstName: address.firstName,
        lastName: address.lastName,
        identificationType: address.identificationType,
        identificationNumber: address.identificationNumber,
        phone: address.phone,
      };
    },
    onSuccess: async (updatedAddress) => {
      storeProfileDetails(updatedAddress);
      queryClient.setQueryData(queryKeys.user.address(), updatedAddress);
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.current() });
    },
    onError: (error) => {
      console.error("Failed to save address:", error);
    },
  });

  return {
    currentUser,
    isLoadingUser,
    loginUser,
    registerUser,
    logoutUser,
    savedAddress,
    isLoadingAddress,
    saveAddress,
  };
};
