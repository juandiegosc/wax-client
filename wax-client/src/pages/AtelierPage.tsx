import { Link, Navigate, useLocation } from 'react-router';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { useCurrentUser, useUserAddress } from '@/lib/hooks/useAccount';
import { routePaths } from '@/routes/routePaths';
import { PROFILE_WARNING_KEY } from '@/routes/RequiredAuth';

const ATELIER_WARNING_KEY = 'wax_atelier_profile_gate';

export const AtelierPage = () => {
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const { data: billingAddress, isLoading } = useUserAddress(Boolean(currentUser));
  const isEnrolledUser = currentUser?.roles?.includes('Enrolled') ?? false;
  const needsProfileCompletion = isEnrolledUser || (!isLoading && !billingAddress);

  useEffect(() => {
    if (needsProfileCompletion && !sessionStorage.getItem(ATELIER_WARNING_KEY)) {
      toast.info('Antes de entrar a Atelier AI, completa tu perfil.', {
        toastId: ATELIER_WARNING_KEY,
      });
      sessionStorage.setItem(ATELIER_WARNING_KEY, 'true');
      sessionStorage.setItem(PROFILE_WARNING_KEY, 'true');
    }
  }, [needsProfileCompletion]);

  if (!isLoading && needsProfileCompletion) {
    return <Navigate to={routePaths.profile} replace state={{ from: location, reason: 'atelier-profile' }} />;
  }

  return (
    <section className="atelier-page">
      <div className="atelier-shell">
        <span className="atelier-kicker">Atelier AI</span>
        <h1 className="atelier-title">Encargos personalizados con direccion creativa WAX.</h1>
        <p className="atelier-lead">
          Este espacio guiara encargos a medida, referencias de pieza y refinamiento creativo en una experiencia privada.
        </p>
        <div className="atelier-panel">
          <strong className="atelier-panel-title">Espacio en preparacion</strong>
          <p className="atelier-panel-copy">
            La experiencia conversacional se conectara aqui. Mientras tanto, puedes explorar catalogo o volver a tu perfil.
          </p>
          <div className="atelier-actions">
            <Link to={routePaths.catalog} className="profile-btn profile-btn-primary">Ver catalogo</Link>
            <Link to={routePaths.profile} className="profile-btn profile-btn-secondary">Mi perfil</Link>
          </div>
        </div>
      </div>
    </section>
  );
};