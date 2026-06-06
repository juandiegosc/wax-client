import type { Basket } from '@/features/basket/types/basket.types';
import { isCustom3dModel } from '@/features/basket/utils/basketHelpers';
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
            {isCustom3dModel(item.pictureUrl) ? (
              <div className="checkout-summary-item-img checkout-summary-item-3d" aria-label={item.productName}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
            ) : (
              <img
                src={item.pictureUrl}
                alt={item.productName}
                className="checkout-summary-item-img"
              />
            )}
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
        <span>IVA (15%)</span>
        <strong>{formatCurrency(deliveryFee)}</strong>
      </div>

      <div className="basket-summary-row basket-summary-row--total">
        <span>Total</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
    </aside>
  );
};
