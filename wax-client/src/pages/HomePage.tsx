import { Link } from 'react-router';
import { routePaths } from '@/routes/routePaths';

export const HomePage = () => {
  return (
    <section style={{ display: 'grid', gap: '1.5rem', paddingTop: '2rem' }}>
      <span style={{ color: '#a16207', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Frontend foundation
      </span>
      <h1 style={{ margin: 0, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1 }}>
        Arquitectura escalable primero, pantallas despues.
      </h1>
      <p style={{ margin: 0, maxWidth: '60ch', fontSize: '1.05rem', color: '#57534e' }}>
        Esta base ya separa app, features e infraestructura compartida para que catalogo, cuenta,
        carrito y checkout crezcan sin mezclar responsabilidades.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link
          to={routePaths.catalog}
          style={{
            display: 'inline-flex',
            padding: '0.9rem 1.2rem',
            borderRadius: '999px',
            background: '#1c1917',
            color: '#fdf8f3',
            fontWeight: 700,
          }}
        >
          Ir al catalogo
        </Link>
      </div>
    </section>
  );
};