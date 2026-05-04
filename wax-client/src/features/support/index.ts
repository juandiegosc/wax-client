export { SupportPageContent } from '@/features/support/pages/SupportPageContent';
export { TicketDetailPageContent } from '@/features/support/pages/TicketDetailPageContent';
export { useTickets } from '@/features/support/hooks/useTickets';
export { useTicket } from '@/features/support/hooks/useTicket';
export { useCreateTicket } from '@/features/support/hooks/useCreateTicket';
export { useSupportHub } from '@/features/support/hooks/useSupportHub';
export type {
  SupportTicket,
  CreateSupportTicketDto,
  UpdateSupportTicketDto,
  TicketCategory,
  TicketStatus,
  CommentDto,
  AddCommentCommand,
} from '@/features/support/types/support.types';
