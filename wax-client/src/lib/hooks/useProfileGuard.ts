import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { useCurrentUser, useUserAddress } from '@/features/auth/hooks';
import { PROFILE_CONTINUE_TOAST, PROFILE_LOGIN_REQUIRED_TOAST } from '@/lib/utils/profileToasts';
import { routePaths } from '@/routes/routePaths';

export const useProfileGuard = () => {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const { data: address } = useUserAddress(Boolean(currentUser));

  const isAuthenticated = Boolean(currentUser);
  const isEnrolledOnly = currentUser?.roles?.includes('Enrolled') ?? false;
  const hasCompleteProfile = isAuthenticated && !isEnrolledOnly && Boolean(address);

  const requireProfile = (action: () => void) => {
    if (!isAuthenticated) {
      toast.info(PROFILE_LOGIN_REQUIRED_TOAST);
      navigate(routePaths.login);
      return;
    }
    if (!hasCompleteProfile) {
      toast.info(PROFILE_CONTINUE_TOAST);
      navigate(routePaths.profile);
      return;
    }
    action();
  };

  return { requireProfile, isAuthenticated, hasCompleteProfile };
};
