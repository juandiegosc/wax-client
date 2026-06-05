import '@google/model-viewer';
import { useState } from 'react';
import { Link } from 'react-router';
import { useCustomProduct } from '@/features/customProducts/hooks/useCustomProduct';
import {
  useApproveCustomProduct,
  useCounterOffer,
} from '@/features/customProducts/hooks/useCustomProductMutations';
import { CounterOfferModal } from '@/features/customProducts/components/CounterOfferModal';
import {
  STATUS_LABELS,
  type ProposalSource,
} from '@/features/customProducts/types/customProduct.types';
import { meshyUrl } from '@/features/atelier/utils/atelierHelpers';
import { useUsdzFromGlb } from '@/features/atelier/hooks/useUsdzFromGlb';
import { routePaths } from '@/routes/routePaths';
import { formatCurrency } from '@/utils/currency';

const SOURCE_LABELS: Record<ProposalSource, string> = {
  System: 'Cotización automática',
  Admin: 'WAX Studio',
  Customer: 'Tu oferta',
};

type Props = {
  customProductId: string;
};

export const CustomProductDetailPageContent = ({ customProductId }: Props) => {
  const { data: product, isLoading } = useCustomProduct(customProductId);
  const { mutate: approve, isPending: isApproving } = useApproveCustomProduct();
  const { mutate: counterOffer, isPending: isCountering } = useCounterOffer();
  const [showCounterModal, setShowCounterModal] = useState(false);
  const proxiedGlb = product?.glbUrl ? meshyUrl(product.glbUrl) : null;
  const { usdzUrl } = useUsdzFromGlb(proxiedGlb);

  if (isLoading) {
    return (
      <section className="quote-detail-page">
        <p className="quote-empty">Cargando cotización…</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="quote-detail-page">
        <Link to={routePaths.myCustomProducts} className="quote-back">← Mis cotizaciones</Link>
        <p className="quote-empty">Cotización no encontrada.</p>
      </section>
    );
  }

  const statusLabel = STATUS_LABELS[product.status] ?? product.status;
  const canRespond = product.status === 'AwaitingCustomerReview';
  const date = new Date(product.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleApprove = () => {
    if (window.confirm('¿Aceptas esta propuesta? La pieza se añadirá a tu carrito.')) {
      approve(product.id);
    }
  };

  const handleCounterOffer = (amountUsd: number, comment?: string) => {
    counterOffer(
      { id: product.id, amount: Math.round(amountUsd * 100), comment },
      { onSuccess: () => setShowCounterModal(false) },
    );
  };

  return (
    <section className="quote-detail-page">
      <Link to={routePaths.myCustomProducts} className="quote-back">← Mis cotizaciones</Link>

      <header className="quote-detail-header">
        <div className="quote-detail-title-row">
          <h1 className="quote-detail-title">{product.design.type || product.name}</h1>
          <span className={`quote-status quote-status--${product.status.toLowerCase()}`}>
            {statusLabel}
          </span>
        </div>
        <span className="quote-detail-date">Enviada el {date}</span>
      </header>

      {product.glbUrl && proxiedGlb && (
        <div className="quote-detail-model">
          <model-viewer
            src={proxiedGlb}
            ios-src={usdzUrl ?? undefined}
            camera-controls="true"
            auto-rotate="true"
            shadow-intensity="1"
            environment-image="neutral"
            ar="true"
            ar-modes="scene-viewer webxr quick-look"
            ar-scale="auto"
            ar-placement="floor"
            style={{ width: '100%', height: '20rem', background: '#1c1c1e' }}
          />
        </div>
      )}

      <div className="quote-detail-design">
        <span className="quote-kicker">Diseño</span>
        <dl className="quote-design-grid">
          <div><dt>Tipo</dt><dd>{product.design.type}</dd></div>
          <div><dt>Material</dt><dd>{product.design.material}</dd></div>
          <div><dt>Color</dt><dd>{product.design.color}</dd></div>
          <div><dt>Forma</dt><dd>{product.design.shape}</dd></div>
          <div><dt>Dimensiones</dt><dd>{product.design.dimensions}</dd></div>
          {product.design.details && (
            <div className="quote-design-grid-full">
              <dt>Detalles</dt><dd>{product.design.details}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="quote-detail-proposals">
        <span className="quote-kicker">Historial de propuestas</span>
        <ul className="quote-proposal-list">
          {product.proposals.map((proposal) => (
            <li
              key={proposal.id}
              className={`quote-proposal quote-proposal--${proposal.source.toLowerCase()}`}
            >
              <div className="quote-proposal-head">
                <span className="quote-proposal-source">{SOURCE_LABELS[proposal.source]}</span>
                <span className="quote-proposal-amount">
                  {formatCurrency(proposal.amount)}
                </span>
              </div>
              {proposal.comment && (
                <p className="quote-proposal-comment">{proposal.comment}</p>
              )}
              <time className="quote-proposal-date">
                {new Date(proposal.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </li>
          ))}
        </ul>
      </div>

      {canRespond ? (
        <div className="quote-detail-actions">
          <p className="quote-actions-hint">
            WAX te propuso un precio. Puedes aceptarlo y la pieza pasa a tu carrito, o hacer una
            contraoferta.
          </p>
          <div className="quote-actions-buttons">
            <button
              className="quote-btn quote-btn--primary"
              onClick={handleApprove}
              disabled={isApproving || isCountering}
            >
              {isApproving ? 'Aceptando…' : `Aceptar ${formatCurrency(product.price)}`}
            </button>
            <button
              className="quote-btn quote-btn--ghost"
              onClick={() => setShowCounterModal(true)}
              disabled={isApproving || isCountering}
            >
              Hacer contraoferta
            </button>
          </div>
        </div>
      ) : (
        <div className="quote-detail-actions">
          <p className="quote-actions-hint">
            {product.status === 'AwaitingAdminReview' && 'WAX está revisando tu cotización. Te avisaremos cuando haya una propuesta.'}
            {product.status === 'Approved' && 'Aceptaste la propuesta. La pieza está lista en tu carrito.'}
            {product.status === 'AddedToBasket' && 'Esta pieza ya está en tu carrito.'}
            {product.status === 'Rejected' && 'Esta cotización fue rechazada.'}
            {product.status === 'PendingQuotation' && 'Estamos procesando tu cotización.'}
          </p>
        </div>
      )}

      {showCounterModal && (
        <CounterOfferModal
          currentPrice={product.price}
          isSubmitting={isCountering}
          onConfirm={(values) => handleCounterOffer(values.amountUsd, values.comment)}
          onClose={() => !isCountering && setShowCounterModal(false)}
        />
      )}
    </section>
  );
};
