import { useParams } from 'react-router';
import { TicketDetailPageContent } from '@/features/support/pages/TicketDetailPageContent';

export const SupportTicketPage = () => {
  const { id } = useParams<{ id: string }>();
  return <TicketDetailPageContent ticketId={id ?? ''} />;
};
