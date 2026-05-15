export const CUSTOM_PRODUCT_STATUS = [
  'PendingQuotation',
  'AwaitingAdminReview',
  'AwaitingCustomerReview',
  'Approved',
  'Rejected',
  'AddedToBasket',
] as const;

export type CustomProductStatus = (typeof CUSTOM_PRODUCT_STATUS)[number];

export const STATUS_LABELS: Record<CustomProductStatus, string> = {
  PendingQuotation: 'Procesando',
  AwaitingAdminReview: 'En revisión de WAX',
  AwaitingCustomerReview: 'Esperando tu respuesta',
  Approved: 'Aprobada',
  Rejected: 'Rechazada',
  AddedToBasket: 'En tu carrito',
};

export type ProposalSource = 'System' | 'Admin' | 'Customer';

export type DesignFields = {
  type: string;
  material: string;
  color: string;
  shape: string;
  dimensions: string;
  details?: string | null;
};

export type PriceProposalDto = {
  id: string;
  amount: number;
  source: ProposalSource;
  comment?: string | null;
  isAccepted: boolean;
  createdAt: string;
};

export type CustomProductDto = {
  id: string;
  name: string;
  description: string;
  price: number;
  taskId: string;
  glbUrl: string;
  ownerUserId: string;
  status: CustomProductStatus;
  agreedPrice?: number | null;
  design: DesignFields;
  proposals: PriceProposalDto[];
  createdAt: string;
  updatedAt?: string | null;
};

export type ProposeAmountDto = {
  amount: number;
  comment?: string;
};
