export type BillingAddress = {
  name: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

// Forma que devuelve el backend en respuestas (camelCase)
export type PaymentSummary = {
  last4: number;
  brand: string;
  expMonth: number;
  expYear: number;
};

// Forma que acepta el backend en el request de creación (snake_case — ver CreateOrderDto)
export type PaymentSummaryInput = {
  last4: number;
  brand: string;
  exp_month: number;
  exp_year: number;
};

export type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  buyerEmail: string;
  billingAddress: BillingAddress;
  paymentSummary: PaymentSummary;
  deliveryFee: number;
  discount: number;
  subtotal: number;
  total: number;
  orderStatus: string;
  orderItems: OrderItem[];
  createAt: string;
  updatedAt: string | null;
};

// Solo paymentSummary — billingAddress la toma el backend de Stripe directamente
export type CreateOrder = {
  paymentSummary: PaymentSummaryInput;
};

export type OrderParams = {
  cursor?: string | null;
  pageSize?: number;
  filter?: string;
  startDate?: string;
};
