import { useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import type { ServerErrorState } from '@/types/api';
import { routePaths } from '@/routes/routePaths';
import { waxBrand } from '@/config/brand';

export const ServerErrorPage = () => {
  const location = useLocation();
  const state = (location.state ?? {}) as ServerErrorState;

  useEffect(() => {
    if (state.error && import.meta.env.DEV) {
      console.error('[ServerError]', state.error);
    }
  }, [state.error]);

  return (
    <section
      style={{
        display: 'grid',
        gap: '1.25rem',
        maxWidth: '36rem',
        padding: '4rem 0',
        margin: '0 auto',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          fontSize: '0.72rem',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: waxBrand.color.smoke,
        }}
      >
        Error 500
      </span>
      <h1
        style={{
          fontFamily: 'var(--wax-font-display)',
          fontSize: 'clamp(2rem, 4vw, 2.8rem)',
          lineHeight: 1.05,
          margin: 0,
          color: waxBrand.color.ink,
        }}
      >
        Algo no salió como esperábamos
      </h1>
      <p style={{ margin: 0, color: waxBrand.color.graphite, lineHeight: 1.7 }}>
        Tuvimos un problema temporal procesando tu solicitud. Por favor intenta de nuevo en unos
        minutos. Si el problema persiste, escríbenos y te ayudamos.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
        <Link
          to={routePaths.home}
          style={{
            padding: '0.85rem 1.5rem',
            background: waxBrand.color.ink,
            color: waxBrand.color.porcelain,
            fontSize: '0.78rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            borderRadius: waxBrand.radius.soft,
          }}
        >
          Volver al inicio
        </Link>
        <Link
          to={routePaths.support}
          style={{
            padding: '0.85rem 1.5rem',
            background: 'transparent',
            color: waxBrand.color.ink,
            fontSize: '0.78rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            border: `1px solid ${waxBrand.color.ink}`,
            borderRadius: waxBrand.radius.soft,
          }}
        >
          Contactar a WAX
        </Link>
      </div>
    </section>
  );
};