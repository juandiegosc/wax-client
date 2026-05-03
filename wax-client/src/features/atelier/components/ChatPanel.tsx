import { useEffect, useRef, useState } from 'react';
import { useChat } from '@/features/atelier/hooks/useChat';
import type { ChatMessage } from '@/features/atelier/types/atelier.types';

type Props = {
  sessionId: string;
};

export const ChatPanel = ({ sessionId }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const { mutate: sendMessage, isPending } = useChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPending]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isPending) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    sendMessage(
      { message: text, sessionId },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: 'assistant', content: data.output },
          ]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: 'assistant', content: 'No se pudo conectar con el asistente. Intenta de nuevo.' },
          ]);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="atelier-chat">
      <div className="atelier-chat-messages">
        {messages.length === 0 && (
          <p className="atelier-chat-empty">
            Describe el accesorio que quieres crear. Puedes refinar la idea antes de generar el modelo 3D.
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`atelier-msg atelier-msg--${msg.role}`}
          >
            <p className="atelier-msg-content">{msg.content}</p>
          </div>
        ))}
        {isPending && (
          <div className="atelier-msg atelier-msg--assistant">
            <p className="atelier-msg-content atelier-msg--typing">Pensando...</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="atelier-chat-input-row">
        <textarea
          className="atelier-chat-input"
          placeholder="Escribe tu idea aquí... (Enter para enviar)"
          rows={2}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
        />
        <button
          className="atelier-chat-send"
          onClick={handleSend}
          disabled={isPending || !input.trim()}
        >
          {isPending ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
};
