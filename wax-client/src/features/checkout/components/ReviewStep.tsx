import type { ConfirmationToken } from '@stripe/stripe-js';
import type { Basket } from '@/features/basket/types/basket.types';
import { isCustom3dModel } from '@/features/basket/utils/basketHelpers';
import { calculateDeliveryFee, formatCurrency } from '@/utils/currency';

interface Props {
  confirmationToken: ConfirmationToken | null;
  basket: Basket;
}

export const ReviewStep = ({ confirmationToken, basket }: Props) => {
  const card = confirmationToken?.payment_method_preview.card;
  const shipping = confirmationToken?.shipping;

  const addressString = () => {
    if (!shipping?.address) return '—';
    const { address, name } = shipping;
    return [name, address.line1, address.line2, address.city, address.state, address.postal_code, address.country]
      .filter(Boolean)
      .join(', ');
  };

  const paymentString = () => {
    if (!card) return '—';
    return `**** **** **** ${card.last4} — ${card.brand.toUpperCase()} exp. ${card.exp_month}/${card.exp_year}`;
  };

  const subtotal = basket.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;

  return (
    <div className="checkout-review">
      <h2 className="checkout-step-title">Confirmar pedido</h2>

      <div className="checkout-review-section">
        <span className="checkout-review-label">Envío a</span>
        <p className="checkout-review-value">{addressString()}</p>
      </div>

      <div className="checkout-review-section">
        <span className="checkout-review-label">Método de pago</span>
        <p className="checkout-review-value">{paymentString()}</p>
      </div>

      <div className="checkout-review-items">
        {basket.items.map((item) => (
          <div key={item.productId} className="checkout-review-item">
            {isCustom3dModel(item.pictureUrl) ? (
              <div className="checkout-review-item-img checkout-review-item-3d" aria-label={item.productName}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
            ) : (
              <img src={item.pictureUrl} alt={item.productName} className="checkout-review-item-img" />
            )}
            <div className="checkout-review-item-body">
              <span className="checkout-review-item-name">{item.productName}</span>
              <span className="checkout-review-item-qty">×{item.quantity}</span>
            </div>
            <strong className="checkout-review-item-price">
              {formatCurrency(item.price * item.quantity)}
            </strong>
          </div>
        ))}
      </div>

      <div className="checkout-review-total checkout-review-total--row">
        <span>Subtotal</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>

      <div className="checkout-review-total checkout-review-total--row">
        <span>IVA (15%)</span>
        <strong>{formatCurrency(deliveryFee)}</strong>
      </div>

      <div className="checkout-review-total">
        <span>Total</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
    </div>
  );
};
