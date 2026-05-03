import { useRef, useState } from 'react';
import { ChatPanel } from '@/features/atelier/components/ChatPanel';
import { GeneratorPanel } from '@/features/atelier/components/GeneratorPanel';

type Tab = 'chat' | 'generator';

export const AtelierPageContent = () => {
  const [tab, setTab] = useState<Tab>('chat');
  const sessionId = useRef(crypto.randomUUID()).current;

  return (
    <section className="atelier-page">
      <div className="atelier-shell">
        <span className="atelier-kicker">Atelier AI</span>
        <h1 className="atelier-title">Encargos personalizados con direccion creativa WAX.</h1>
        <p className="atelier-lead">
          Conversa con el asistente para refinar tu idea y genera modelos 3D a partir de texto o imagen de referencia.
        </p>

        <div className="atelier-tabs">
          <button
            className={`atelier-tab${tab === 'chat' ? ' atelier-tab--active' : ''}`}
            onClick={() => setTab('chat')}
          >
            Consultoría
          </button>
          <button
            className={`atelier-tab${tab === 'generator' ? ' atelier-tab--active' : ''}`}
            onClick={() => setTab('generator')}
          >
            Generador 3D
          </button>
        </div>

        {tab === 'chat' ? (
          <ChatPanel sessionId={sessionId} />
        ) : (
          <GeneratorPanel />
        )}
      </div>
    </section>
  );
};
