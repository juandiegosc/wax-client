import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import homePageMainImage from '@/assets/images/editorial/HOME_PAGE_MAIN.png';
import { useCurrentUser, useRegister } from '@/features/auth/hooks';
import { registerSchema } from '@/lib/schemas/registerSchema';
import type { RegisterSchema } from '@/lib/schemas/registerSchema';
import { routePaths } from '@/routes/routePaths';

type PasswordStrength = { score: 0 | 1 | 2 | 3 | 4; label: string; color: string };

const evaluatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { score: 0, label: 'Sin definir', color: 'var(--wax-color-stone)' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) score += 1;
  const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  const map: Record<typeof clamped, { label: string; color: string }> = {
    0: { label: 'Muy débil', color: 'var(--wax-color-oxblood)' },
    1: { label: 'Débil', color: 'var(--wax-color-oxblood)' },
    2: { label: 'Aceptable', color: 'var(--wax-color-amber)' },
    3: { label: 'Fuerte', color: 'var(--wax-color-bronze)' },
    4: { label: 'Excelente', color: 'var(--wax-color-olive)' },
  };
  return { score: clamped, ...map[clamped] };
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    watch,
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

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const passwordValue = watch('password') ?? '';
  const passwordStrength = evaluatePasswordStrength(passwordValue);

  const submitRegister = async (values: RegisterSchema) => {
    try {
      await registerMutation.mutateAsync({
        email: values.email,
        password: values.password,
      });
      toast.success('Cuenta creada correctamente. Ya puedes iniciar sesión.');
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
            <h1 className="login-title">Ya tienes una sesión iniciada.</h1>
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
            <strong className="login-visual-title">Crea tu cuenta para acceder al Atelier, al carrito y al soporte.</strong>
            <p className="login-visual-text">
              Tu cuenta WAX te permite encargar piezas a medida, gestionar tus pedidos y recibir propuestas personalizadas de la maison.
            </p>
          </div>
        </div>

        <div className="login-card">
          <span className="login-kicker">Nueva cuenta</span>
          <h1 className="login-title">Crear cuenta</h1>
          <p className="login-lead">
            Registra tu correo para iniciar sesión y acceder a los espacios privados de la maison.
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
              <span className="login-label">Contraseña</span>
              <input
                className="login-input"
                type="password"
                autoComplete="new-password"
                placeholder="Crea una contraseña"
                disabled={registerMutation.isPending || isLoadingUser}
                {...register('password')}
              />
              {errors.password ? <span className="login-feedback login-feedback-error">{errors.password.message}</span> : null}
              {passwordValue.length > 0 ? (
                <div
                  style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  aria-live="polite"
                >
                  <div
                    style={{
                      flex: 1,
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '0.25rem',
                    }}
                  >
                    {[1, 2, 3, 4].map((tier) => (
                      <div
                        key={tier}
                        style={{
                          height: '0.25rem',
                          borderRadius: '999px',
                          background: passwordStrength.score >= tier ? passwordStrength.color : 'var(--wax-color-stone)',
                          transition: 'background 180ms ease',
                        }}
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: passwordStrength.color,
                      minWidth: '5rem',
                      textAlign: 'right',
                    }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              ) : null}
            </label>

            <label className="login-field">
              <span className="login-label">Confirmar contraseña</span>
              <input
                className="login-input"
                type="password"
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                disabled={registerMutation.isPending || isLoadingUser}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword ? <span className="login-feedback login-feedback-error">{errors.confirmPassword.message}</span> : null}
            </label>

            {errors.root?.message ? <p className="login-feedback login-feedback-error">{errors.root.message}</p> : null}

            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
                fontSize: '0.82rem',
                color: 'var(--wax-fg-muted)',
                lineHeight: 1.45,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={{ marginTop: '0.25rem', accentColor: 'var(--wax-fg)' }}
              />
              <span>
                Acepto los <a href="mailto:hello@waxatelier.com?subject=T%C3%A9rminos%20y%20condiciones" style={{ color: 'var(--wax-fg)' }}>Términos y Condiciones</a> y la <a href="mailto:hello@waxatelier.com?subject=Pol%C3%ADtica%20de%20privacidad" style={{ color: 'var(--wax-fg)' }}>Política de Privacidad</a> de WAX.
              </span>
            </label>

            <button className="login-button login-button-primary" type="submit" disabled={!isValid || !acceptedTerms || isSubmitting || registerMutation.isPending || isLoadingUser}>
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