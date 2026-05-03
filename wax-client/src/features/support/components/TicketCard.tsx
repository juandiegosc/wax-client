import { CATEGORY_LABELS, STATUS_LABELS } from '@/features/support/types/support.types';
import type { SupportTicket, TicketStatus, TicketCategory } from '@/features/support/types/support.types';

type Props = {
  ticket: SupportTicket;
};

export const TicketCard = ({ ticket }: Props) => {
  const statusLabel = STATUS_LABELS[ticket.status as TicketStatus] ?? ticket.status;
  const categoryLabel = CATEGORY_LABELS[ticket.category as TicketCategory] ?? ticket.category;
  const date = new Date(ticket.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="ticket-card">
      <div className="ticket-card-header">
        <div className="ticket-card-meta">
          <span className="ticket-category">{categoryLabel}</span>
          <span className="ticket-date">{date}</span>
        </div>
        <span className={`ticket-status ticket-status--${ticket.status.toLowerCase()}`}>
          {statusLabel}
        </span>
      </div>

      <strong className="ticket-subject">{ticket.subject}</strong>
      <p className="ticket-description">{ticket.description}</p>

      {ticket.orderId && (
        <span className="ticket-order-ref">Pedido: {ticket.orderId}</span>
      )}
    </article>
  );
};
