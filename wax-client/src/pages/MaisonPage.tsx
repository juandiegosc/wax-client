import { Link } from 'react-router';
import { Reveal } from '@/components/Reveal';
import { routePaths } from '@/routes/routePaths';

const PROCESS_STEPS = [
  {
    no: '01',
    kicker: 'Conversación',
    title: 'Comparte tu idea',
    body: 'En el Atelier AI describes la pieza que imaginas. El asistente la traduce a un primer concepto: forma, materiales, ánimo.',
    accent: 'var(--wax-color-bronze)',
  },
  {
    no: '02',
    kicker: 'Boceto',
    title: 'Refinamos juntos',
    body: 'Generamos un boceto 2D para ajustar proporciones. Lo iteras tantas veces como necesites antes de pasar a volumen.',
    accent: 'var(--wax-color-olive)',
  },
  {
    no: '03',
    kicker: 'Modelo 3D',
    title: 'Tu pieza cobra cuerpo',
    body: 'A partir del boceto aprobado producimos el modelo 3D que podrás girar, ver en realidad aumentada y validar antes del taller.',
    accent: 'var(--wax-color-oxblood)',
  },
  {
    no: '04',
    kicker: 'Cotización y taller',
    title: 'Producción artesanal',
    body: 'Te enviamos la cotización con materiales finales. Si la apruebas, el taller en Ecuador realiza la pieza a mano para ti.',
    accent: 'var(--wax-color-amber)',
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

const SHIPPING = [
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
];

export const MaisonPage = () => (
  <section className="maison-page">
    <Reveal as="header" className="maison-header">
      <span className="maison-kicker">Maison</span>
      <h1 className="maison-title">
        Accesorios 3D con <em>identidad</em>, diseñados en Ecuador.
      </h1>
      <p className="maison-lead">
        WAX es una marca ecuatoriana de impresión 3D que diseña y produce accesorios únicos
        con identidad y visión. A través del diseño 3D impulsamos la creatividad emergente,
        fusionando tecnología y arte para convertir tus ideas en piezas auténticas y personalizadas.
      </p>
      <p className="maison-paragraph">
        Nuestro objetivo es visibilizar el talento de la región y posicionar el diseño 3D
        como una herramienta de expresión e innovación, hecha desde Latinoamérica para el mundo.
      </p>
    </Reveal>

    <Reveal as="section" className="maison-section">
      <span className="maison-section-kicker">Proceso</span>
      <h2 className="maison-section-title">De la idea al taller, en cuatro pasos.</h2>
      <ol className="maison-timeline">
        {PROCESS_STEPS.map((step, index) => (
          <Reveal
            as="article"
            key={step.no}
            delay={index * 110}
            className="maison-step"
          >
            <span className="maison-step-no" style={{ color: step.accent }}>{step.no}</span>
            <span className="maison-step-rule" style={{ background: step.accent }} />
            <div className="maison-step-copy">
              <span className="maison-step-kicker">{step.kicker}</span>
              <strong className="maison-step-title">{step.title}</strong>
              <p className="maison-step-body">{step.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </Reveal>

    <Reveal as="section" className="maison-section">
      <span className="maison-section-kicker">Lo que defendemos</span>
      <h2 className="maison-section-title">Tres principios que sostienen cada pieza.</h2>
      <div className="maison-cards">
        {VALUES.map((value, index) => (
          <Reveal as="article" key={value.title} delay={index * 100} className="maison-card">
            <strong className="maison-card-title">{value.title}</strong>
            <p className="maison-card-body">{value.body}</p>
          </Reveal>
        ))}
      </div>
    </Reveal>

    <Reveal as="section" className="maison-section">
      <div id="envios" className="maison-anchor" />
      <span className="maison-section-kicker">Envíos y entregas</span>
      <h2 className="maison-section-title">Llegamos a donde estés.</h2>
      <div className="maison-cards">
        {SHIPPING.map((entry, index) => (
          <Reveal as="article" key={entry.title} delay={index * 100} className="maison-card">
            <strong className="maison-card-title">{entry.title}</strong>
            <p className="maison-card-body">{entry.body}</p>
          </Reveal>
        ))}
      </div>
    </Reveal>

    <Reveal as="section" className="maison-cta">
      <span className="maison-cta-kicker">Empieza tu encargo</span>
      <h2 className="maison-cta-title">¿Lista para diseñar tu primera pieza WAX?</h2>
      <p className="maison-cta-body">
        El Atelier AI te acompaña desde la primera idea. No necesitas saber de modelado 3D — solo contarnos qué imaginas.
      </p>
      <div className="maison-cta-actions">
        <Link to={routePaths.atelier} className="maison-cta-primary">Iniciar encargo</Link>
        <Link to={routePaths.catalog} className="maison-cta-secondary">Ver la colección</Link>
      </div>
    </Reveal>
  </section>
);
