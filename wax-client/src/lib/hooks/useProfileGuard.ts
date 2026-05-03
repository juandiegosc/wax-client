import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { useCurrentUser, useUserAddress } from '@/lib/hooks/useAccount';
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
      toast.info('Inicia sesión para añadir piezas al carrito');
      navigate(routePaths.login);
      return;
    }
    if (!hasCompleteProfile) {
      toast.info('Completa tu perfil para continuar');
      navigate(routePaths.profile);
      return;
    }
    action();
  };

  return { requireProfile, isAuthenticated, hasCompleteProfile };
};
