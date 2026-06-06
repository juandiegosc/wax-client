import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CounterOfferModal } from '@/features/customProducts/components/CounterOfferModal';

describe('CounterOfferModal', () => {
  const onConfirm = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => { vi.clearAllMocks(); });

  it('muestra el precio actual formateado en USD', () => {
    render(<CounterOfferModal currentPrice={5000} isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />);
    // currentPrice 5000 cents → $50
    expect(screen.getByText('$50')).toBeInTheDocument();
  });

  it('muestra el título y los campos del formulario', () => {
    render(<CounterOfferModal currentPrice={5000} isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />);
    expect(screen.getByText('Hacer una contraoferta')).toBeInTheDocument();
    expect(screen.getByText('Tu oferta (USD)')).toBeInTheDocument();
    expect(screen.getByText('Comentario (opcional)')).toBeInTheDocument();
  });

  it('llama onClose al hacer click en el botón Cerrar', () => {
    render(<CounterOfferModal currentPrice={5000} isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('llama onClose al hacer click en el botón Cancelar', () => {
    render(<CounterOfferModal currentPrice={5000} isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('llama onClose al hacer click en el overlay (fuera del modal)', () => {
    const { container } = render(<CounterOfferModal currentPrice={5000} isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />);
    const overlay = container.querySelector('.quote-modal-overlay')!;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('NO llama onClose al hacer click dentro del modal (stopPropagation)', () => {
    const { container } = render(<CounterOfferModal currentPrice={5000} isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />);
    const modal = container.querySelector('.quote-modal')!;
    fireEvent.click(modal);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('llama onClose al presionar Escape', () => {
    render(<CounterOfferModal currentPrice={5000} isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('cambia el label del submit a "Enviando…" cuando isSubmitting=true', () => {
    render(<CounterOfferModal currentPrice={5000} isSubmitting={true} onConfirm={onConfirm} onClose={onClose} />);
    expect(screen.getByText('Enviando…')).toBeInTheDocument();
  });

  it('deshabilita los botones cuando isSubmitting=true', () => {
    render(<CounterOfferModal currentPrice={5000} isSubmitting={true} onConfirm={onConfirm} onClose={onClose} />);
    expect(screen.getByLabelText('Cerrar')).toBeDisabled();
    expect(screen.getByText('Cancelar')).toBeDisabled();
    expect(screen.getByText('Enviando…')).toBeDisabled();
  });

  it('llama onConfirm con el monto cuando el form es válido', async () => {
    const user = userEvent.setup();
    render(<CounterOfferModal currentPrice={5000} isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />);

    await user.type(screen.getByPlaceholderText('Ej. 3500'), '45');
    fireEvent.submit(screen.getByText('Enviar contraoferta').closest('form')!);

    await waitFor(() => expect(onConfirm).toHaveBeenCalled());
    expect(onConfirm.mock.calls[0][0].amountUsd).toBe(45);
  });

  it('NO llama onConfirm cuando el monto es 0 o negativo', async () => {
    const user = userEvent.setup();
    render(<CounterOfferModal currentPrice={5000} isSubmitting={false} onConfirm={onConfirm} onClose={onClose} />);

    await user.type(screen.getByPlaceholderText('Ej. 3500'), '-10');
    fireEvent.submit(screen.getByText('Enviar contraoferta').closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('El monto debe ser mayor a 0')).toBeInTheDocument();
    });
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
