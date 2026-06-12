import { Navigate, useLocation } from 'react-router';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { useCurrentUser, useUserAddress } from '@/features/auth/hooks';
import { PROFILE_ATELIER_GATE_TOAST } from '@/lib/utils/profileToasts';
import { routePaths } from '@/routes/routePaths';
import { PROFILE_WARNING_KEY } from '@/routes/RequiredAuth';
import { AtelierPageContent } from '@/features/atelier';

const ATELIER_WARNING_KEY = 'wax_atelier_profile_gate';

export const AtelierPage = () => {
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const { data: billingAddress, isLoading } = useUserAddress(Boolean(currentUser));
  const isEnrolledUser = currentUser?.roles?.includes('Enrolled') ?? false;
  const needsProfileCompletion = isEnrolledUser || (!isLoading && !billingAddress);

  useEffect(() => {
    if (needsProfileCompletion && !sessionStorage.getItem(ATELIER_WARNING_KEY)) {
      toast.info(PROFILE_ATELIER_GATE_TOAST, {
        toastId: ATELIER_WARNING_KEY,
      });
      sessionStorage.setItem(ATELIER_WARNING_KEY, 'true');
      sessionStorage.setItem(PROFILE_WARNING_KEY, 'true');
    }
  }, [needsProfileCompletion]);

  if (!isLoading && needsProfileCompletion) {
    return <Navigate to={routePaths.profile} replace state={{ from: location, reason: 'atelier-profile' }} />;
  }

  return <AtelierPageContent />;
};