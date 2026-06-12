import { formatCurrency } from '@/utils/currency';
import { useAddToBasket } from '@/features/basket/hooks/useAddToBasket';
import { useRemoveFromBasket } from '@/features/basket/hooks/useRemoveFromBasket';
import { isCustom3dModel } from '@/features/basket/utils/basketHelpers';
import type { BasketItem as BasketItemType } from '@/features/basket/types/basket.types';

type Props = {
  item: BasketItemType;
};

export const BasketItem = ({ item }: Props) => {
  const { mutate: addItem, isPending: isAdding } = useAddToBasket();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveFromBasket();
  const isBusy = isAdding || isRemoving;
  const is3dModel = isCustom3dModel(item.pictureUrl);

  return (
    <article className="basket-item">
      <div
        className="basket-item-visual"
        style={{ background: 'linear-gradient(135deg, var(--wax-color-stone), var(--wax-color-porcelain))' }}
      >
        {is3dModel ? (
          <div className="basket-item-3d-placeholder" aria-label={item.productName}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>Pieza 3D</span>
          </div>
        ) : (
          <img src={item.pictureUrl} alt={item.productName} className="basket-item-image" />
        )}
      </div>

      <div className="basket-item-body">
        <div className="basket-item-header">
          <span className="basket-item-brand">{item.brand}</span>
          <span className="basket-item-type">{item.type}</span>
        </div>
        <strong className="basket-item-name">{item.productName}</strong>
        <span className="basket-item-unit-price">{formatCurrency(item.price)} c/u</span>
      </div>

      <div className="basket-item-controls">
        <div className="basket-qty-row">
          <button
            className="basket-qty-btn"
            aria-label="Quitar uno"
            disabled={isBusy}
            onClick={() => removeItem({ productId: item.productId, quantity: 1 })}
          >
            −
          </button>
          <span className="basket-qty-value">{item.quantity}</span>
          <button
            className="basket-qty-btn"
            aria-label="Añadir uno"
            disabled={isBusy}
            onClick={() => addItem({ productId: item.productId, quantity: 1 })}
          >
            +
          </button>
        </div>

        <strong className="basket-item-subtotal">
          {formatCurrency(item.price * item.quantity)}
        </strong>

        <button
          className="basket-remove-btn"
          aria-label="Eliminar del carrito"
          disabled={isBusy}
          onClick={() => removeItem({ productId: item.productId, quantity: item.quantity })}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
};
