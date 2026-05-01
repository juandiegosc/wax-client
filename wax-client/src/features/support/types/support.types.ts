export const TICKET_CATEGORY = {
  OrderIssue: 'OrderIssue',
  PaymentIssue: 'PaymentIssue',
  ProductIssue: 'ProductIssue',
  Other: 'Other',
} as const;
export type TicketCategory = (typeof TICKET_CATEGORY)[keyof typeof TICKET_CATEGORY];

export const TICKET_STATUS = {
  Open: 'Open',
  InProgress: 'InProgress',
  Closed: 'Closed',
} as const;
export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  OrderIssue: 'Problema con pedido',
  PaymentIssue: 'Problema con pago',
  ProductIssue: 'Problema con producto',
  Other: 'Otro',
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  Open: 'Abierto',
  InProgress: 'En proceso',
  Closed: 'Cerrado',
};

export type SupportTicket = {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  orderId: string;
  createdAt: string;
  userId: string;
  userFullName: string;
  userEmail: string;
};

export type CreateSupportTicketDto = {
  orderId: string;
  category: TicketCategory;
  status: TicketStatus;
  subject: string;
  description: string;
};

export type SupportTicketParams = {
  pageNumber?: number;
  pageSize?: number;
  orderBy?: string;
  status?: string;
  category?: string;
};
