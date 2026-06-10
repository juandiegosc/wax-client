import { isRouteErrorResponse, useRouteError } from 'react-router';

export const RouteErrorPage = () => {
  const error = useRouteError();
  const isRouteResponse = isRouteErrorResponse(error);

  const title = isRouteResponse ? `${error.status} ${error.statusText}` : 'Ocurrio un error inesperado';

  let description: unknown;

  if (isRouteResponse) {
    description = error.data;
  } else if (error instanceof Error) {
    description = error.message;
  } else {
    description = 'La aplicacion encontro un problema al renderizar esta vista.';
  }

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: 'min(42rem, 100%)',
          display: 'grid',
          gap: '1rem',
          padding: '2rem',
          background: 'var(--wax-bg-elevated)',
          border: `1px solid var(--wax-color-stone)`,
          boxShadow: 'var(--wax-shadow-soft)',
        }}
      >
        <span
          style={{
            color: 'var(--wax-fg-soft)',
            fontSize: '0.75rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Error de aplicacion
        </span>
        <h1 style={{ margin: 0, fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>{title}</h1>
        <p style={{ margin: 0, color: 'var(--wax-fg-muted)', lineHeight: 1.7 }}>
          {typeof description === 'string' ? description : 'No fue posible completar esta accion.'}
        </p>
      </div>
    </section>
  );
};