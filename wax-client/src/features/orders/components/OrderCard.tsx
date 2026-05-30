import { formatCurrency } from '@/utils/currency';
import type { Order } from '@/lib/types/order';

// Etiquetas legibles para el estado del pedido (fallback al valor crudo del backend)
const ORDER_STATUS_LABELS: Record<string, string> = {
  Pending: 'Pendiente',
  PaymentReceived: 'Pago recibido',
  PaymentFailed: 'Pago fallido',
  PaymentMismatch: 'Pago en revisión',
  Shipped: 'Enviado',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado',
};

type Props = {
  order: Order;
};

export const OrderCard = ({ order }: Props) => {
  const statusLabel = ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus;
  const date = new Date(order.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const itemCount = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <article className="order-card">
      <div className="order-card-header">
        <span className="order-card-ref">Pedido #{order.id.slice(0, 8).toUpperCase()}</span>
        <span className={`order-status order-status--${order.orderStatus.toLowerCase()}`}>
          {statusLabel}
        </span>
      </div>

      <ul className="order-card-items">
        {order.orderItems.map((item) => (
          <li key={item.productId} className="order-card-item">
            <span className="order-card-item-name">
              {item.name} {item.quantity > 1 && <em>×{item.quantity}</em>}
            </span>
            <span className="order-card-item-price">{formatCurrency(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="order-card-footer">
        <span className="order-card-date">{date}</span>
        <span className="order-card-meta">
          {itemCount} {itemCount === 1 ? 'pieza' : 'piezas'}
        </span>
        <strong className="order-card-total">{formatCurrency(order.total)}</strong>
      </div>
    </article>
  );
};
