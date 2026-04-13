import { useLocation } from 'react-router';
import type { ServerErrorState } from '@/types/api';

export const ServerErrorPage = () => {
  const location = useLocation();
  const state = (location.state ?? {}) as ServerErrorState;

  return (
    <section>
      <h1>Error del servidor</h1>
      <p>La aplicacion recibio un error del backend.</p>
      {state.error ? (
        <pre
          style={{
            overflowX: 'auto',
            padding: '1rem',
            borderRadius: '1rem',
            background: '#292524',
            color: '#f5f5f4',
          }}
        >
          {JSON.stringify(state.error, null, 2)}
        </pre>
      ) : null}
    </section>
  );
};