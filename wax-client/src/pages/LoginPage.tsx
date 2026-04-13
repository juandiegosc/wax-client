import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router';
import homePageMainImage from '@/assets/images/editorial/HOME_PAGE_MAIN.png';
import { useCurrentUser, useLogin } from '@/lib/hooks/useAccount';
import { loginSchema } from '@/lib/schemas/loginSchema';
import type { LoginSchema } from '@/lib/schemas/loginSchema';
import { routePaths } from '@/routes/routePaths';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const loginMutation = useLogin();
  const locationState = location.state as { from?: { pathname?: string }; registeredEmail?: string } | null;
  const redirectTo = locationState?.from?.pathname ?? routePaths.home;
  const registeredEmail = locationState?.registeredEmail;
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setError,
  } = useForm<LoginSchema>({
    mode: 'onTouched',
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const submitLogin = async (values: LoginSchema) => {
    try {
      await loginMutation.mutateAsync(values);
      navigate(redirectTo);
    } catch {
      setError('root', {
        message: 'No pudimos iniciar sesion con esos datos.',
      });
    }
  };

  if (currentUser) {
    return (
      <section className="login-page">
        <div className="login-shell login-shell-compact">
          <div className="login-card">
            <span className="login-kicker">Sesion activa</span>
            <h1 className="login-title">Ya estas dentro de WAX.</h1>
            <p className="login-lead">
              Entraste como {currentUser.email}. Puedes volver a la portada o explorar la seleccion.
            </p>
            <div className="login-actions-row">
              <Link to={routePaths.home} className="login-button login-button-primary">
                Volver al inicio
              </Link>
              <Link to={routePaths.catalog} className="login-button login-button-secondary">
                Ir al catalogo
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="login-page">
      <div className="login-shell">
        <div className="login-visual">
          <img className="login-visual-image" src={homePageMainImage} alt="Pieza editorial de WAX" />
          <div aria-hidden className="login-visual-overlay" />
          <div className="login-visual-copy">
            <span className="login-visual-kicker">Acceso privado</span>
            <strong className="login-visual-title">Entra a tu espacio para seguir el ritmo de la maison.</strong>
            <p className="login-visual-text">
              Login limpio, silencioso y alineado con la direccion editorial del storefront.
            </p>
          </div>
        </div>

        <div className="login-card">
          <span className="login-kicker">Cuenta WAX</span>
          <h1 className="login-title">Iniciar sesion</h1>
          <p className="login-lead">
            Usa tu correo y tu contrasena para acceder a tu cuenta, carrito y futuras gestiones de pedido.
          </p>

          {registeredEmail ? (
            <p className="login-feedback login-feedback-success">
              Cuenta creada para {registeredEmail}. Inicia sesion para continuar.
            </p>
          ) : null}

          <form className="login-form" onSubmit={handleSubmit(submitLogin)}>
            <label className="login-field">
              <span className="login-label">Correo</span>
              <input
                className="login-input"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                disabled={loginMutation.isPending || isLoadingUser}
                {...register('email')}
              />
              {errors.email ? <span className="login-feedback login-feedback-error">{errors.email.message}</span> : null}
            </label>

            <label className="login-field">
              <span className="login-label">Contrasena</span>
              <input
                className="login-input"
                type="password"
                autoComplete="current-password"
                placeholder="Ingresa tu contrasena"
                disabled={loginMutation.isPending || isLoadingUser}
                {...register('password')}
              />
              {errors.password ? <span className="login-feedback login-feedback-error">{errors.password.message}</span> : null}
            </label>

            {errors.root?.message ? <p className="login-feedback login-feedback-error">{errors.root.message}</p> : null}

            <button className="login-button login-button-primary" type="submit" disabled={!isValid || isSubmitting || loginMutation.isPending || isLoadingUser}>
              {loginMutation.isPending || isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="login-meta">
            <span>Si todavia no tienes cuenta, puedes crearla ahora.</span>
            <Link to={routePaths.register} className="login-meta-link">
              Crear cuenta
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};