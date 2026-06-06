import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { TicketCard } from '@/features/support/components/TicketCard';

// Nota: el backend GET devuelve los enums como strings ("Open", "OrderIssue"...),
// no como numeros. Los labels mapean esos strings.
const baseTicket = {
  id: 't1',
  subject: 'No me llego el paquete',
  description: 'Llevo 2 semanas esperando',
  category: 'OrderIssue',
  status: 'Open',
  orderId: 'order-123',
  userId: 'u1',
  userFullName: 'Ana Lopez',
  userEmail: 'ana@wax.com',
  createdAt: '2026-06-01T00:00:00Z',
};

const renderCard = (ticket = baseTicket) =>
  render(<MemoryRouter><TicketCard ticket={ticket} /></MemoryRouter>);

describe('TicketCard', () => {
  it('renderiza subject y description', () => {
    renderCard();
    expect(screen.getByText('No me llego el paquete')).toBeInTheDocument();
    expect(screen.getByText(/Llevo 2 semanas/)).toBeInTheDocument();
  });

  it('muestra el orderId cuando esta presente', () => {
    renderCard();
    expect(screen.getByText(/order-123/)).toBeInTheDocument();
  });

  it('no muestra "Pedido:" cuando orderId esta vacio', () => {
    renderCard({ ...baseTicket, orderId: '' });
    expect(screen.queryByText(/Pedido:/)).not.toBeInTheDocument();
  });

  it('mapea TICKET_STATUS y TICKET_CATEGORY a sus labels legibles', () => {
    renderCard();
    // STATUS_LABELS[Open] = 'Abierto'
    expect(screen.getByText(/Abierto/)).toBeInTheDocument();
    // CATEGORY_LABELS[OrderIssue] = 'Problema con pedido'
    expect(screen.getByText(/Problema con pedido/)).toBeInTheDocument();
  });

  it('formatea la fecha en español', () => {
    renderCard();
    // Junio 2026 → algo como "1 jun 2026" o "01 jun. 2026"
    expect(screen.getByText(/\d+\s+\w+\s+2026/)).toBeInTheDocument();
  });

  it('el link apunta al detalle del ticket con su id', () => {
    renderCard();
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toContain('t1');
  });
});
