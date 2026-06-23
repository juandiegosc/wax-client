import { Link } from 'react-router';
import { waxBrand } from '@/config/brand';
import { Reveal } from '@/components/Reveal';
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
    <Reveal as="header" className="maison-reveal-header">
      <span
        style={{
          fontSize: '0.72rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--wax-fg-soft)',
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
          color: 'var(--wax-fg)',
          margin: 0,
        }}
      >
        Accesorios 3D con <em style={{ fontStyle: 'italic' }}>identidad</em>, diseñados en Ecuador.
      </h1>
      <p
        style={{
          fontSize: '1.05rem',
          lineHeight: 1.55,
          color: 'var(--wax-fg-muted)',
          margin: 0,
        }}
      >
        WAX es una marca ecuatoriana de impresión 3D que diseña y produce accesorios únicos
        con identidad y visión. A través del diseño 3D impulsamos la creatividad emergente,
        fusionando tecnología y arte para convertir tus ideas en piezas auténticas y personalizadas.
      </p>
      <p
        style={{
          fontSize: '1rem',
          lineHeight: 1.55,
          color: 'var(--wax-fg-muted)',
          margin: 0,
        }}
      >
        Nuestro objetivo es visibilizar el talento de la región y posicionar el diseño 3D
        como una herramienta de expresión e innovación, hecha desde Latinoamérica para el mundo.
      </p>
    </Reveal>

    <section style={{ display: 'grid', gap: '1.5rem' }}>
      <span
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--wax-fg-soft)',
        }}
      >
        Proceso
      </span>
      <h2 style={{ fontFamily: 'var(--wax-font-display)', fontSize: '1.8rem', margin: 0, color: 'var(--wax-fg)' }}>
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
              background: 'var(--wax-bg-elevated)',
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
                color: 'var(--wax-color-bronze)',
              }}
            >
              {step.kicker}
            </span>
            <strong
              style={{
                fontFamily: 'var(--wax-font-display)',
                fontSize: '1.15rem',
                color: 'var(--wax-fg)',
              }}
            >
              {step.title}
            </strong>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--wax-fg-muted)', margin: 0 }}>
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
          color: 'var(--wax-fg-soft)',
        }}
      >
        Lo que defendemos
      </span>
      <h2 style={{ fontFamily: 'var(--wax-font-display)', fontSize: '1.8rem', margin: 0, color: 'var(--wax-fg)' }}>
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
                color: 'var(--wax-fg)',
              }}
            >
              {value.title}
            </strong>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--wax-fg-muted)', margin: 0 }}>
              {value.body}
            </p>
          </article>
        ))}
      </div>
    </section>

    <section id="envios" style={{ display: 'grid', gap: '1.5rem', scrollMarginTop: '5rem' }}>
      <span
        style={{
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--wax-fg-soft)',
        }}
      >
        Envíos y entregas
      </span>
      <h2 style={{ fontFamily: 'var(--wax-font-display)', fontSize: '1.8rem', margin: 0, color: 'var(--wax-fg)' }}>
        Llegamos a donde estés.
      </h2>
      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
        }}
      >
        {[
          {
            title: 'Cobertura',
            body: 'Enviamos a todo el mundo desde Quito, Ecuador. Confirmamos la disponibilidad y la tarifa exacta al revisar tu pedido.',
          },
          {
            title: 'Tiempos',
            body: 'Las piezas en catálogo salen del taller en 3 a 7 días hábiles. Los encargos del Atelier dependen de la complejidad — te confirmamos un estimado al aceptar la cotización.',
          },
          {
            title: 'Pago y soporte',
            body: 'Aceptamos tarjeta y PayPal. Si necesitas detalles particulares de tu envío, escríbenos a hello@waxatelier.com o abre un ticket en Soporte.',
          },
        ].map((entry) => (
          <article
            key={entry.title}
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
                fontSize: '1.1rem',
                color: 'var(--wax-fg)',
              }}
            >
              {entry.title}
            </strong>
            <p style={{ fontSize: '0.92rem', lineHeight: 1.5, color: 'var(--wax-fg-muted)', margin: 0 }}>
              {entry.body}
            </p>
          </article>
        ))}
      </div>
    </section>

    <section
      style={{
        padding: '3rem 2rem',
        background: 'var(--wax-color-ink)',
        color: 'var(--wax-color-porcelain)',
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
            background: 'var(--wax-color-porcelain)',
            color: 'var(--wax-fg)',
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
            border: `1px solid var(--wax-color-porcelain)`,
            color: 'var(--wax-color-porcelain)',
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
