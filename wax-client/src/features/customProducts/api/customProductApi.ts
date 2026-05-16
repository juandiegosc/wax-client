import { httpClient } from '@/services/httpClient';
import type {
  CustomProductDto,
  ProposeAmountDto,
} from '@/features/customProducts/types/customProduct.types';

export const customProductApi = {
  getMine: async (): Promise<CustomProductDto[]> => {
    const response = await httpClient.get<CustomProductDto[]>('/CustomProduct/me');
    return response.data;
  },

  getById: async (id: string): Promise<CustomProductDto> => {
    const response = await httpClient.get<CustomProductDto>(`/CustomProduct/${id}`);
    return response.data;
  },

  // Customer counter-offer — product must be in AwaitingCustomerReview
  counterOffer: async ({
    id,
    ...dto
  }: ProposeAmountDto & { id: string }): Promise<CustomProductDto> => {
    const response = await httpClient.post<CustomProductDto>(
      `/CustomProduct/${id}/proposals`,
      dto,
    );
    return response.data;
  },

  // Customer accepts the current proposal — product moves to Approved / AddedToBasket
  approve: async (id: string): Promise<CustomProductDto> => {
    const response = await httpClient.post<CustomProductDto>(`/CustomProduct/${id}/approve`);
    return response.data;
  },
};
