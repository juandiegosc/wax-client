import { Link } from 'react-router';
import { waxBrand } from '@/config/brand';
import { routePaths } from '@/routes/routePaths';

const PROCESS_STEPS = [
  {
    kicker: '01 · Conversación',
    title: 'Comparte tu idea',
    body: 'En el Atelier AI describes la pieza que imaginas. El asistente la traduce a un primer concepto: forma, materiales, ánimo.',
  },
  {
    kicker: '02 · Boceto',
    title: 'Refinamos juntos',
    body: 'Generamos un boceto 2D para ajustar proporciones. Lo iteras tantas veces como necesites antes de pasar a volumen.',
  },
  {
    kicker: '03 · Modelo 3D',
    title: 'Tu pieza cobra cuerpo',
    body: 'A partir del boceto aprobado producimos el modelo 3D que podrás girar, ver en realidad aumentada y validar antes del taller.',
  },
  {
    kicker: '04 · Cotización y taller',
    title: 'Producción artesanal',
    body: 'Te enviamos la cotización con materiales finales. Si la apruebas, el taller en Ecuador realiza la pieza a mano para ti.',
  },
];

const VALUES = [
  {
    title: 'Producción a demanda',
    body: 'Cada pieza nace de un encargo concreto. Sin sobreproducción, sin stock que no vaya a alguien.',
  },
  {
    title: 'Origen Ecuador',
    body: 'Diseñamos y producimos en Quito, apoyándonos en proveedores locales de materiales nobles.',
  },
  {
    title: 'Tecnología al servicio del oficio',
    body: 'La IA y el modelado 3D nos ayudan a iterar. La pieza siempre la termina una mano experta.',
  },
];

export const MaisonPage = () => (
  <section className="maison-page" style={{ display: 'grid', gap: '4rem' }}>
    <header style={{ display: 'grid', gap: '1rem', maxWidth: '46rem' }}>
      <span
        style={{
          fontSize: '0.72rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: waxBrand.color.smoke,
        }}
      >
        Maison
      </span>
      <h1
        style={{
          fontFamily: 'var(--wax-font-display)',
          fontSize: 'clamp(2.4rem, 4vw, 3.4rem)',
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
          color: waxBrand.color.ink,
          margin: 0,
        }}
      >
        Una maison 3D <em style={{ fontStyle: 'italic' }}>a medida</em>, hecha en Ecuador.
      </h1>
      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.55,
          color: waxBrand.color.graphite,
          margin: 0,
        }}
      >
        WAX nace para repensar la forma en que se diseña y se compra una pieza de lujo. Cada accesorio empieza
        en una conversación con nuestro Atelier AI y termina en un taller artesanal — sin sobreproducción,
        sin catálogos infinitos, sin piezas que nadie va a usar.
      </p>
    </header>

    <section style={{ display: 'grid', gap: '1.5rem' }}>
      <span
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: waxBrand.color.smoke,
        }}
      >
        Proceso
      </span>
      <h2 style={{ fontFamily: 'var(--wax-font-display)', fontSize: '1.8rem', margin: 0, color: waxBrand.color.ink }}>
        De la idea al taller, en cuatro pasos.
      </h2>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
        }}
      >
        {PROCESS_STEPS.map((step) => (
          <article
            key={step.kicker}
            style={{
              padding: '1.5rem',
              background: waxBrand.color.bone,
              borderRadius: waxBrand.radius.strong,
              boxShadow: waxBrand.shadow.soft,
              display: 'grid',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: waxBrand.color.bronze,
              }}
            >
              {step.kicker}
            </span>
            <strong
              style={{
                fontFamily: 'var(--wax-font-display)',
                fontSize: '1.15rem',
                color: waxBrand.color.ink,
              }}
            >
              {step.title}
            </strong>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: waxBrand.color.graphite, margin: 0 }}>
              {step.body}
            </p>
          </article>
        ))}
      </div>
    </section>

    <section style={{ display: 'grid', gap: '1.5rem' }}>
      <span
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: waxBrand.color.smoke,
        }}
      >
        Lo que defendemos
      </span>
      <h2 style={{ fontFamily: 'var(--wax-font-display)', fontSize: '1.8rem', margin: 0, color: waxBrand.color.ink }}>
        Tres principios que sostienen cada pieza.
      </h2>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
        }}
      >
        {VALUES.map((value) => (
          <article
            key={value.title}
            style={{
              padding: '1.5rem',
              border: `1px solid rgba(15, 15, 16, 0.08)`,
              borderRadius: waxBrand.radius.strong,
              display: 'grid',
              gap: '0.6rem',
            }}
          >
            <strong
              style={{
                fontFamily: 'var(--wax-font-display)',
                fontSize: '1.15rem',
                color: waxBrand.color.ink,
              }}
            >
              {value.title}
            </strong>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: waxBrand.color.graphite, margin: 0 }}>
              {value.body}
            </p>
          </article>
        ))}
      </div>
    </section>

    <section
      style={{
        padding: '3rem 2rem',
        background: waxBrand.color.ink,
        color: waxBrand.color.porcelain,
        borderRadius: waxBrand.radius.strong,
        display: 'grid',
        gap: '1.25rem',
        justifyItems: 'start',
      }}
    >
      <span
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          opacity: 0.7,
        }}
      >
        Empieza tu encargo
      </span>
      <h2
        style={{
          fontFamily: 'var(--wax-font-display)',
          fontSize: '2rem',
          margin: 0,
          maxWidth: '32rem',
        }}
      >
        ¿Lista para diseñar tu primera pieza WAX?
      </h2>
      <p style={{ fontSize: '1rem', lineHeight: 1.5, margin: 0, maxWidth: '38rem', opacity: 0.85 }}>
        El Atelier AI te acompaña desde la primera idea. No necesitas saber de modelado 3D — solo contarnos qué imaginas.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link
          to={routePaths.atelier}
          style={{
            display: 'inline-block',
            padding: '0.85rem 1.4rem',
            background: waxBrand.color.porcelain,
            color: waxBrand.color.ink,
            borderRadius: waxBrand.radius.soft,
            fontSize: '0.78rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Iniciar encargo
        </Link>
        <Link
          to={routePaths.catalog}
          style={{
            display: 'inline-block',
            padding: '0.85rem 1.4rem',
            border: `1px solid ${waxBrand.color.porcelain}`,
            color: waxBrand.color.porcelain,
            borderRadius: waxBrand.radius.soft,
            fontSize: '0.78rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Ver la colección
        </Link>
      </div>
    </section>
  </section>
);
