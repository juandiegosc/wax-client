import { Navigate, Outlet, useLocation } from 'react-router';
import { useCurrentUser } from '@/lib/hooks/useAccount';
import { routePaths } from '@/routes/routePaths';

export const RequiredAuth = () => {
  const { data: currentUser, isLoading } = useCurrentUser();
  const location = useLocation();

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

export const PROFILE_WARNING_KEY = 'wax_profile_warning_shown';
export const PROFILE_PROMPT_PENDING_KEY = 'wax_profile_prompt_pending';