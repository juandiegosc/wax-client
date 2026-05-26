import { Link, useLocation } from 'react-router';
import { routePaths } from '@/routes/routePaths';
import { formatCurrency } from '@/utils/currency';
import type { Order } from '@/lib/types/order';

export const CheckoutSuccessPageContent = () => {
  const { state } = useLocation() as { state: { order: Order } | null };
  const order = state?.order;

  return (
    <section className="checkout-success">
      <div>
        <span className="checkout-kicker">Confirmación</span>
        <h1 className="checkout-success-title">Pedido confirmado.</h1>
      </div>

      <p className="checkout-success-lead">
        Tu pago fue procesado correctamente. Recibirás un correo con los detalles de tu pedido.
      </p>

      {order && (
        <>
          <div className="checkout-success-meta">
            <span className="checkout-review-label">Número de pedido</span>
            <p className="checkout-success-meta-value">{order.id}</p>
          </div>

          <div className="checkout-success-meta">
            <span className="checkout-review-label">Envío a</span>
            <p className="checkout-success-meta-value">
              {[
                order.billingAddress?.name,
                order.billingAddress?.line1,
                order.billingAddress?.line2,
                order.billingAddress?.city,
                order.billingAddress?.state,
                order.billingAddress?.postalCode,
                order.billingAddress?.country,
              ]
                .filter(Boolean)
                .join(', ')}
            </p>
          </div>

          <div className="checkout-success-meta">
            <span className="checkout-review-label">Total pagado</span>
            <p className="checkout-success-meta-value">{formatCurrency(order.total)}</p>
          </div>
        </>
      )}

      <div className="checkout-success-actions">
        <Link to={routePaths.catalog} className="basket-cta">
          Seguir comprando
        </Link>
        <Link to={routePaths.myOrders} className="checkout-btn-back" style={{ padding: '0.95rem 0' }}>
          Ver mis pedidos
        </Link>
      </div>
    </section>
  );
};
