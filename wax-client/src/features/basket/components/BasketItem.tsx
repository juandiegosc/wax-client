import { waxBrand } from '@/config/brand';
import { formatCurrency } from '@/utils/currency';
import { useAddToBasket } from '@/features/basket/hooks/useAddToBasket';
import { useRemoveFromBasket } from '@/features/basket/hooks/useRemoveFromBasket';
import type { BasketItem as BasketItemType } from '@/features/basket/types/basket.types';

type Props = {
  item: BasketItemType;
};

export const BasketItem = ({ item }: Props) => {
  const { mutate: addItem, isPending: isAdding } = useAddToBasket();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveFromBasket();
  const isBusy = isAdding || isRemoving;

  return (
    <article className="basket-item">
      <div
        className="basket-item-visual"
        style={{ background: `linear-gradient(135deg, ${waxBrand.color.stone}, ${waxBrand.color.porcelain})` }}
      >
        <img src={item.pictureUrl} alt={item.productName} className="basket-item-image" />
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
