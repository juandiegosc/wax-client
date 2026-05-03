export type BasketItem = {
  productId: string;
  productName: string;
  price: number;
  pictureUrl: string;
  brand: string;
  type: string;
  quantity: number;
};

export type Basket = {
  basketId: string;
  items: BasketItem[];
  clientSecret?: string;
  paymentIntentId?: string;
};
