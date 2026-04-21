import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { toast } from 'react-toastify';
import { useCurrentUser, useUserAddress } from '@/lib/hooks/useAccount';
import { routePaths } from '@/routes/routePaths';

export const PROFILE_WARNING_KEY = 'wax_profile_warning_shown';
export const PROFILE_PROMPT_PENDING_KEY = 'wax_profile_prompt_pending';

export const RequiredAuth = () => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const { data: address, isLoading: isLoadingAddress } = useUserAddress(Boolean(currentUser));
  const location = useLocation();

  const isEnrolledUser = currentUser?.roles?.includes('Enrolled') ?? false;
  const addressCheckReady = Boolean(currentUser) && !isLoadingAddress;
  const needsProfileCompletion = isEnrolledUser || (addressCheckReady && !address);

  useEffect(() => {
    if (!currentUser || isLoadingAddress) return;
    const pending = sessionStorage.getItem(PROFILE_PROMPT_PENDING_KEY);
    if (pending && needsProfileCompletion && !sessionStorage.getItem(PROFILE_WARNING_KEY)) {
      toast.info('Completa tu perfil para acceder a todas las funciones de WAX.', {
        toastId: PROFILE_WARNING_KEY,
      });
      sessionStorage.setItem(PROFILE_WARNING_KEY, 'true');
      sessionStorage.removeItem(PROFILE_PROMPT_PENDING_KEY);
    }
  }, [currentUser, isLoadingAddress, needsProfileCompletion]);

  if (isLoading) {
    return (
      <section className="auth-loading-shell">
        <div className="auth-loading-card">
          <span className="auth-loading-kicker">Cuenta WAX</span>
          <h1 className="auth-loading-title">Verificando sesion...</h1>
        </div>
      </section>
    );
  }

  if (!currentUser) {
    return <Navigate to={routePaths.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
};