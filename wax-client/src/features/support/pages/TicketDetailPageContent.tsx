import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useTicket } from '@/features/support/hooks/useTicket';
import { useSupportHub } from '@/features/support/hooks/useSupportHub';
import { useCurrentUser } from '@/features/auth/hooks';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/features/support/types/support.types';
import type { CommentDto } from '@/features/support/types/support.types';
import { routePaths } from '@/routes/routePaths';

type ChatMessageProps = {
  comment: CommentDto;
  currentUserName: string | undefined;
};

const ChatMessage = ({ comment, currentUserName }: ChatMessageProps) => {
  // Comparación case-insensitive — .NET Identity puede devolver distinto casing
  const isOwn =
    currentUserName !== undefined &&
    comment.userName.toLowerCase() === currentUserName.toLowerCase();

  const time = new Date(comment.createdAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`support-chat-msg ${isOwn ? 'support-chat-msg--own' : 'support-chat-msg--other'}`}>
      <span className="support-chat-msg-author">{comment.userName}</span>
      <p className="support-chat-msg-body">{comment.body}</p>
      <time className="support-chat-msg-time">{time}</time>
    </div>
  );
};

type Props = {
  ticketId: string;
};

export const TicketDetailPageContent = ({ ticketId }: Props) => {
  const { data: ticket, isLoading } = useTicket(ticketId);
  const { data: currentUser } = useCurrentUser();
  const { comments, isConnected, sendComment } = useSupportHub(ticketId);

  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = inputValue.trim();
    if (!body || !isConnected) return;

    setIsSending(true);
    try {
      await sendComment(body);
      setInputValue('');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <section className="ticket-detail-page">
        <p className="ticket-detail-loading">Cargando ticket...</p>
      </section>
    );
  }

  if (!ticket) {
    return (
      <section className="ticket-detail-page">
        <p className="ticket-detail-loading">Ticket no encontrado.</p>
      </section>
    );
  }

  const statusLabel = STATUS_LABELS[ticket.status] ?? ticket.status;
  const categoryLabel = CATEGORY_LABELS[ticket.category] ?? ticket.category;
  const date = new Date(ticket.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <section className="ticket-detail-page">
      <Link to={routePaths.support} className="ticket-detail-back">
        ← Mis tickets
      </Link>

      <header className="ticket-detail-header">
        <div className="ticket-detail-header-top">
          <div className="ticket-detail-meta">
            <span className="ticket-category">{categoryLabel}</span>
            <span className="ticket-date">{date}</span>
          </div>
          <span className={`ticket-status ticket-status--${ticket.status.toLowerCase()}`}>
            {statusLabel}
          </span>
        </div>
        <h1 className="ticket-detail-subject">{ticket.subject}</h1>
        <p className="ticket-detail-description">{ticket.description}</p>
        {ticket.orderId && (
          <span className="ticket-order-ref">Pedido: {ticket.orderId}</span>
        )}
      </header>

      <div className="support-chat">
        <div className="support-chat-header">
          <span className="support-kicker">Chat de soporte</span>
          <span className={`support-chat-status ${isConnected ? 'support-chat-status--on' : 'support-chat-status--off'}`}>
            {isConnected ? 'Conectado' : 'Conectando...'}
          </span>
        </div>

        <div className="support-chat-messages">
          {comments.length === 0 ? (
            <p className="support-chat-empty">
              No hay mensajes aún. Escribe para iniciar la conversación.
            </p>
          ) : (
            comments.map((comment) => (
              <ChatMessage
                key={comment.id}
                comment={comment}
                currentUserName={currentUser?.userName}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="support-chat-input-row" onSubmit={handleSend}>
          <input
            className="support-chat-input"
            type="text"
            placeholder={isConnected ? 'Escribe un mensaje...' : 'Conectando...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={!isConnected || isSending}
          />
          <button
            type="submit"
            className="support-chat-send"
            disabled={!isConnected || isSending || !inputValue.trim()}
          >
            {isSending ? '...' : 'Enviar'}
          </button>
        </form>
      </div>
    </section>
  );
};
