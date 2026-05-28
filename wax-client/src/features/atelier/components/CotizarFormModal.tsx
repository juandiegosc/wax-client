import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { DesignFields } from '@/features/atelier/api/atelierApi';

// Regex acotada para evitar ReDoS: dígitos limitados a 4 y whitespace a 1.
// Ya el campo está validado a max 50 chars antes, así no hay catastrophic backtracking.
const DIMENSIONS_REGEX = /^\s?\d{1,4}\s?x\s?\d{1,4}(\s?x\s?\d{1,4})?\s?cm\s?$/i;

const cotizarSchema = z.object({
  type: z.string().trim().min(1, 'Requerido').max(100),
  material: z.string().trim().min(1, 'Requerido').max(100),
  color: z.string().trim().min(1, 'Requerido').max(50),
  shape: z.string().trim().min(1, 'Requerido').max(50),
  dimensions: z
    .string()
    .trim()
    .min(1, 'Requerido')
    .max(50)
    .regex(DIMENSIONS_REGEX, 'Formato: 25x15cm o 25x15x5cm'),
  details: z.string().trim().max(490).optional(),
});

export type CotizarFormValues = z.infer<typeof cotizarSchema>;

type Props = {
  initialValues: DesignFields | null;
  isLoadingSuggestions: boolean;
  isSubmitting: boolean;
  onConfirm: (values: CotizarFormValues) => void;
  onClose: () => void;
};

export const CotizarFormModal = ({
  initialValues,
  isLoadingSuggestions,
  isSubmitting,
  onConfirm,
  onClose,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CotizarFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(cotizarSchema),
    defaultValues: {
      type: '',
      material: '',
      color: '',
      shape: '',
      dimensions: '',
      details: '',
    },
  });

  // Pre-fill once suggestions arrive
  useEffect(() => {
    if (!initialValues) return;
    reset({
      type: initialValues.type ?? '',
      material: initialValues.material ?? '',
      color: initialValues.color ?? '',
      shape: initialValues.shape ?? '',
      dimensions: (initialValues.dimensions ?? '').replaceAll('×', 'x'),
      details: initialValues.details ?? '',
    });
  }, [initialValues, reset]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isDisabled = isLoadingSuggestions || isSubmitting;

  return (
    <div className="atelier-popup-overlay" role="dialog" aria-modal="true">
      <div className="atelier-popup atelier-cotizar-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="atelier-popup-close"
          onClick={onClose}
          aria-label="Cerrar"
          disabled={isSubmitting}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="atelier-cotizar-header">
          <h3 className="atelier-cotizar-title">Detalles para cotizar</h3>
          <p className="atelier-cotizar-subtitle">
            {isLoadingSuggestions
              ? 'Analizando tu imagen…'
              : 'Revisa los datos sugeridos por la IA y ajusta lo que necesites.'}
          </p>
        </div>

        <form
          className="atelier-cotizar-form"
          onSubmit={handleSubmit(onConfirm)}
        >
          <div className="atelier-cotizar-grid">
            <label className="atelier-cotizar-field">
              <span>Tipo</span>
              <input
                type="text"
                placeholder="Bolsa, anillo, pulsera…"
                {...register('type')}
                disabled={isDisabled}
              />
              {errors.type && <em>{errors.type.message}</em>}
            </label>

            <label className="atelier-cotizar-field">
              <span>Material</span>
              <input
                type="text"
                placeholder="Cuero, metal, tejido…"
                {...register('material')}
                disabled={isDisabled}
              />
              {errors.material && <em>{errors.material.message}</em>}
            </label>

            <label className="atelier-cotizar-field">
              <span>Color</span>
              <input
                type="text"
                placeholder="Negro, dorado, etc."
                {...register('color')}
                disabled={isDisabled}
              />
              {errors.color && <em>{errors.color.message}</em>}
            </label>

            <label className="atelier-cotizar-field">
              <span>Forma</span>
              <input
                type="text"
                placeholder="Rectangular, orgánica…"
                {...register('shape')}
                disabled={isDisabled}
              />
              {errors.shape && <em>{errors.shape.message}</em>}
            </label>

            <label className="atelier-cotizar-field atelier-cotizar-field--full">
              <span>Dimensiones</span>
              <input
                type="text"
                placeholder="30x20x10cm"
                {...register('dimensions')}
                disabled={isDisabled}
              />
              {errors.dimensions && <em>{errors.dimensions.message}</em>}
            </label>

            <label className="atelier-cotizar-field atelier-cotizar-field--full">
              <span>Detalles (opcional)</span>
              <textarea
                rows={2}
                placeholder="Herrajes, costuras visibles, etc."
                {...register('details')}
                disabled={isDisabled}
              />
              {errors.details && <em>{errors.details.message}</em>}
            </label>
          </div>

          <div className="atelier-cotizar-actions">
            <button
              type="button"
              className="atelier-cotizar-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="atelier-gen-cta"
              disabled={isDisabled}
            >
              {isSubmitting ? 'Enviando…' : 'Enviar a cotizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
