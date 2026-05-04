// Valores numéricos para el request body (el backend los espera como enteros)
export const TICKET_CATEGORY = {
  OrderIssue: 0,
  PaymentIssue: 1,
  ProductIssue: 2,
  Other: 3,
} as const;
export type TicketCategory = (typeof TICKET_CATEGORY)[keyof typeof TICKET_CATEGORY];

export const TICKET_STATUS = {
  Open: 0,
  InProgress: 1,
  Closed: 2,
} as const;
export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

// Etiquetas para mostrar — el GET devuelve strings ("OrderIssue", "Open", etc.)
export const CATEGORY_LABELS: Record<string, string> = {
  OrderIssue: 'Problema con pedido',
  PaymentIssue: 'Problema con pago',
  ProductIssue: 'Problema con producto',
  Other: 'Otro',
};

export const STATUS_LABELS: Record<string, string> = {
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

export type UpdateSupportTicketDto = {
  subject: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
};

export type CommentDto = {
  id: string;
  body: string;
  createdAt: string;
  ticketId: string;
  userId: string;
  userName: string;
};

export type AddCommentCommand = {
  body: string;
  ticketId: string;
};
