import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const counterOfferSchema = z.object({
  amountUsd: z.number({ message: 'Ingresa un monto' }).positive('El monto debe ser mayor a 0'),
  comment: z.string().trim().max(490).optional(),
});

export type CounterOfferValues = z.infer<typeof counterOfferSchema>;

type Props = {
  currentPrice: number;
  isSubmitting: boolean;
  onConfirm: (values: CounterOfferValues) => void;
  onClose: () => void;
};

export const CounterOfferModal = ({ currentPrice, isSubmitting, onConfirm, onClose }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CounterOfferValues>({
    mode: 'onTouched',
    resolver: zodResolver(counterOfferSchema),
    defaultValues: { amountUsd: undefined, comment: '' },
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="quote-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="quote-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
          disabled={isSubmitting}
        >
          ×
        </button>

        <h3 className="quote-modal-title">Hacer una contraoferta</h3>
        <p className="quote-modal-sub">
          Precio actual propuesto por WAX:{' '}
          <strong>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            }).format(currentPrice / 100)}
          </strong>
        </p>

        <form className="quote-modal-form" onSubmit={handleSubmit(onConfirm)}>
          <label className="quote-modal-field">
            <span>Tu oferta (USD)</span>
            <input
              type="number"
              step="1"
              min="1"
              placeholder="Ej. 3500"
              {...register('amountUsd', { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            {errors.amountUsd && <em>{errors.amountUsd.message}</em>}
          </label>

          <label className="quote-modal-field">
            <span>Comentario (opcional)</span>
            <textarea
              rows={3}
              placeholder="Cuéntale a WAX por qué propones este precio…"
              {...register('comment')}
              disabled={isSubmitting}
            />
            {errors.comment && <em>{errors.comment.message}</em>}
          </label>

          <div className="quote-modal-actions">
            <button
              type="button"
              className="quote-btn quote-btn--ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button type="submit" className="quote-btn quote-btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando…' : 'Enviar contraoferta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
