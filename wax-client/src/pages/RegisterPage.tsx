import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import homePageMainImage from '@/assets/images/editorial/HOME_PAGE_MAIN.png';
import { useCurrentUser, useRegister } from '@/features/auth/hooks';
import { registerSchema } from '@/lib/schemas/registerSchema';
import type { RegisterSchema } from '@/lib/schemas/registerSchema';
import { routePaths } from '@/routes/routePaths';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setError,
  } = useForm<RegisterSchema>({
    mode: 'onTouched',
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const submitRegister = async (values: RegisterSchema) => {
    try {
      await registerMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      toast.success('Cuenta creada correctamente. Ya puedes iniciar sesion.');
      navigate(routePaths.login, {
        state: { registeredEmail: values.email },
      });
    } catch {
      setError('root', {
        message: 'No pudimos crear la cuenta con esos datos.',
      });
    }
  };

  if (currentUser) {
    return (
      <section className="login-page">
        <div className="login-shell login-shell-compact">
          <div className="login-card">
            <span className="login-kicker">Cuenta activa</span>
            <h1 className="login-title">Ya tienes una sesion iniciada.</h1>
            <p className="login-lead">
              Entraste como {currentUser.email}. No necesitas registrarte otra vez para probar el flujo.
            </p>
            <div className="login-actions-row">
              <Link to={routePaths.home} className="login-button login-button-primary">
                Volver al inicio
              </Link>
              <Link to={routePaths.atelier} className="login-button login-button-secondary">
                Ir al atelier
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
            <span className="login-visual-kicker">Registro privado</span>
            <strong className="login-visual-title">Crea tu cuenta para acceder a atelier, carrito y soporte.</strong>
            <p className="login-visual-text">
              El registro queda alineado con el mismo lenguaje limpio del login y abre las rutas protegidas del sitio.
            </p>
          </div>
        </div>

        <div className="login-card">
          <span className="login-kicker">Nueva cuenta</span>
          <h1 className="login-title">Crear cuenta</h1>
          <p className="login-lead">
            Registra tu correo para poder iniciar sesion y probar los espacios privados del storefront.
          </p>

          <form className="login-form" onSubmit={handleSubmit(submitRegister)}>
            <label className="login-field">
              <span className="login-label">Correo</span>
              <input
                className="login-input"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                disabled={registerMutation.isPending || isLoadingUser}
                {...register('email')}
              />
              {errors.email ? <span className="login-feedback login-feedback-error">{errors.email.message}</span> : null}
            </label>

            <label className="login-field">
              <span className="login-label">Contrasena</span>
              <input
                className="login-input"
                type="password"
                autoComplete="new-password"
                placeholder="Crea una contrasena"
                disabled={registerMutation.isPending || isLoadingUser}
                {...register('password')}
              />
              {errors.password ? <span className="login-feedback login-feedback-error">{errors.password.message}</span> : null}
            </label>

            <label className="login-field">
              <span className="login-label">Confirmar contrasena</span>
              <input
                className="login-input"
                type="password"
                autoComplete="new-password"
                placeholder="Repite tu contrasena"
                disabled={registerMutation.isPending || isLoadingUser}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword ? <span className="login-feedback login-feedback-error">{errors.confirmPassword.message}</span> : null}
            </label>

            {errors.root?.message ? <p className="login-feedback login-feedback-error">{errors.root.message}</p> : null}

            <button className="login-button login-button-primary" type="submit" disabled={!isValid || isSubmitting || registerMutation.isPending || isLoadingUser}>
              {registerMutation.isPending || isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="login-meta">
            <span>Si ya tienes acceso, entra con tu cuenta existente.</span>
            <Link to={routePaths.login} className="login-meta-link">
              Ir al login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};