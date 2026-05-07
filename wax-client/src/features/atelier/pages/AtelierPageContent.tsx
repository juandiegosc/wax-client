import { AtelierChat } from '@/features/atelier/components/AtelierChat';

export const AtelierPageContent = () => (
  <div className="atelier-page">
    <aside className="atelier-brand-panel">
      <span className="atelier-kicker">Atelier AI — WAX Studio</span>
      <div className="atelier-brand-content">
        <h1 className="atelier-display">
          Diseña con<br />inteligencia<br />creativa.
        </h1>
        <p className="atelier-lead">
          Conversa con el asistente para definir tu concepto, luego genera el modelo 3D.
        </p>
      </div>
      <span className="atelier-brand-watermark" aria-hidden="true">WAX</span>
    </aside>

    <div className="atelier-chat-shell">
      <AtelierChat />
    </div>
  </div>
);
