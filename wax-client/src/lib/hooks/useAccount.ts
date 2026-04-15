import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import agent from "../api/agent";
import { mutationKeys, queryKeys } from "../queryKeys";
import type { Address, Login, Register, UserInfo } from "../types/user";

/**
 * Hook for fetching current user info
 */
export const useCurrentUser = () => {
  //const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      const response = await agent.get<UserInfo>("/account/user-info");
      return response.data;
    },
    //validar uso de cache con react-query
    // enabled: !queryClient.invalidateQueries({ queryKey: queryKeys.user.current()}), // Only fetch if not already invalidated
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
      const response = await agent.get<Address>("/account/address");
      return response.data;
    },
    enabled,
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
      const response = await agent.post<Address>("/account/address", address);
      return response.data;
    },
    onSuccess: (updatedAddress) => {
      queryClient.setQueryData(queryKeys.user.address(), updatedAddress);
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
      const response = await agent.get<Address>("/account/address");
      return response.data;
    },
    enabled: !!currentUser,
  });

  const saveAddress = useMutation({
    mutationKey: mutationKeys.user.saveAddress,
    mutationFn: async (address: Address) => {
      const response = await agent.post<Address>("/account/address", address);
      return response.data;
    },
    onSuccess: (updatedAddress) => {
      queryClient.setQueryData(queryKeys.user.address(), updatedAddress);
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
