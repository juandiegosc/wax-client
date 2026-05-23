import type { Basket } from '@/features/basket/types/basket.types';
import { calculateDeliveryFee, formatCurrency } from '@/utils/currency';

interface Props {
  basket: Basket;
}

export const CheckoutOrderSummary = ({ basket }: Props) => {
  const subtotal = basket.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(subtotal);
  const total = subtotal + deliveryFee;

  return (
    <aside className="checkout-summary" style={{ borderLeft: '1px solid rgba(15, 15, 16, 0.08)' }}>
      <span className="checkout-kicker">Resumen</span>

      <ul className="checkout-summary-items">
        {basket.items.map((item) => (
          <li key={item.productId} className="checkout-summary-item">
            <img
              src={item.pictureUrl}
              alt={item.productName}
              className="checkout-summary-item-img"
            />
            <div className="checkout-summary-item-body">
              <span className="checkout-summary-item-name">{item.productName}</span>
              <span className="checkout-summary-item-qty">×{item.quantity}</span>
            </div>
            <strong className="checkout-summary-item-price">
              {formatCurrency(item.price * item.quantity)}
            </strong>
          </li>
        ))}
      </ul>

      <div className="basket-summary-row">
        <span>Subtotal</span>
        <strong>{formatCurrency(subtotal)}</strong>
      </div>

      <div className="basket-summary-row">
        <span>Envío</span>
        <strong>{deliveryFee === 0 ? 'Gratis' : formatCurrency(deliveryFee)}</strong>
      </div>

      <div className="basket-summary-row basket-summary-row--total">
        <span>Total</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
    </aside>
  );
};
