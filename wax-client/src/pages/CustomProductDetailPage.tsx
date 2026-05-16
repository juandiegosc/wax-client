import { useParams } from 'react-router';
import { CustomProductDetailPageContent } from '@/features/customProducts';

export const CustomProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  return <CustomProductDetailPageContent customProductId={id ?? ''} />;
};
