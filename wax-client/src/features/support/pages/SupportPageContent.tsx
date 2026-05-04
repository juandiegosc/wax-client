import { useState } from 'react';
import { waxBrand } from '@/config/brand';
import { useTickets } from '@/features/support/hooks/useTickets';
import { useCreateTicket } from '@/features/support/hooks/useCreateTicket';
import { TicketCard } from '@/features/support/components/TicketCard';
import { TICKET_CATEGORY, TICKET_STATUS } from '@/features/support/types/support.types';
import type { TicketCategory } from '@/features/support/types/support.types';

const PAGE_SIZE = 8;

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: TICKET_CATEGORY.OrderIssue, label: 'Problema con pedido' },
  { value: TICKET_CATEGORY.PaymentIssue, label: 'Problema con pago' },
  { value: TICKET_CATEGORY.ProductIssue, label: 'Problema con producto' },
  { value: TICKET_CATEGORY.Other, label: 'Otro' },
];

const EMPTY_FORM = {
  subject: '',
  description: '',
  category: TICKET_CATEGORY.Other,
  orderId: '',
};

export const SupportPageContent = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading: isLoadingTickets } = useTickets({ pageNumber, pageSize: PAGE_SIZE });
  const { mutate: createTicket, isPending: isCreating } = useCreateTicket();

  const tickets = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleChange = (field: 'subject' | 'description' | 'orderId', value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    createTicket(
      {
        subject: form.subject.trim(),
        description: form.description.trim(),
        category: form.category,
        orderId: form.orderId.trim(),
        status: TICKET_STATUS.Open,
      },
      {
        onSuccess: () => {
          setForm(EMPTY_FORM);
          setFormOpen(false);
        },
      },
    );
  };

  const pageButtons = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <section className="support-page">
      <header className="support-header" style={{ borderBottom: `1px solid rgba(15, 15, 16, 0.08)` }}>
        <div className="support-header-copy">
          <span className="support-kicker">Soporte</span>
          <h1 className="support-title">¿Necesitas ayuda?</h1>
          <p className="support-lead">
            Envía un ticket y nuestro equipo te responderá lo antes posible.
          </p>
        </div>
        <button
          className="support-new-btn"
          onClick={() => setFormOpen((o) => !o)}
        >
          {formOpen ? 'Cancelar' : 'Nuevo ticket'}
        </button>
      </header>

      {formOpen && (
        <div className="support-form-shell">
          <form className="support-form" onSubmit={handleSubmit}>
            <span className="support-kicker">Nuevo ticket</span>

            <div className="support-field">
              <label className="support-label" htmlFor="support-subject">Asunto</label>
              <input
                id="support-subject"
                className="support-input"
                type="text"
                placeholder="Describe el problema brevemente"
                value={form.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                required
              />
            </div>

            <div className="support-field">
              <label className="support-label" htmlFor="support-category">Categoría</label>
              <select
                id="support-category"
                className="support-select"
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: Number(e.target.value) as TicketCategory }))
                }
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="support-field">
              <label className="support-label" htmlFor="support-description">Descripción</label>
              <textarea
                id="support-description"
                className="support-textarea"
                placeholder="Explica el problema con detalle"
                rows={4}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
              />
            </div>

            <div className="support-field">
              <label className="support-label" htmlFor="support-order">
                ID de pedido <span className="support-optional">(opcional)</span>
              </label>
              <input
                id="support-order"
                className="support-input"
                type="text"
                placeholder="Déjalo en blanco si no aplica"
                value={form.orderId}
                onChange={(e) => handleChange('orderId', e.target.value)}
              />
            </div>

            <div className="support-form-actions">
              <button
                type="submit"
                className="support-submit-btn"
                disabled={isCreating || !form.subject.trim() || !form.description.trim()}
              >
                {isCreating ? 'Enviando...' : 'Enviar ticket'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="support-tickets-section">
        <span className="support-kicker">Mis tickets</span>

        {isLoadingTickets ? (
          <p style={{ color: waxBrand.color.graphite }}>Cargando tickets...</p>
        ) : !tickets.length ? (
          <p style={{ color: waxBrand.color.graphite }}>No tienes tickets de soporte aún.</p>
        ) : (
          <ul className="support-ticket-list">
            {tickets.map((ticket) => (
              <li key={ticket.id}>
                <TicketCard ticket={ticket} />
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav className="catalog-pagination">
            <button
              className="catalog-page-btn"
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber === 1}
            >
              ←
            </button>
            {pageButtons.map((n) => (
              <button
                key={n}
                className={`catalog-page-btn${n === pageNumber ? ' catalog-page-btn--active' : ''}`}
                onClick={() => setPageNumber(n)}
              >
                {n}
              </button>
            ))}
            <button
              className="catalog-page-btn"
              onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
              disabled={pageNumber === totalPages}
            >
              →
            </button>
          </nav>
        )}
      </div>
    </section>
  );
};
