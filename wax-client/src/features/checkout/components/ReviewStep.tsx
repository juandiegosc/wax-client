import type { ConfirmationToken } from '@stripe/stripe-js';
import type { Basket } from '@/features/basket/types/basket.types';
import { formatCurrency } from '@/utils/currency';

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
            <img src={item.pictureUrl} alt={item.productName} className="checkout-review-item-img" />
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

      <div className="checkout-review-total">
        <span>Total</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>
    </div>
  );
};
