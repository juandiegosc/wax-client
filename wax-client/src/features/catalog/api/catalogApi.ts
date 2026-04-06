import { httpClient } from '@/services/httpClient';
import type { PagedList } from '@/types/pagination';
import { toFormData } from '@/utils/formData';
import type { CreateProduct, Product, ProductParams, UpdateProduct } from '@/features/catalog/types/catalog.types';

export const catalogApi = {
  getProducts: async (params: ProductParams = {}) => {
    const response = await httpClient.get<PagedList<Product>>('/product', { params });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await httpClient.get<Product>(`/product/${id}`);
    return response.data;
  },

  createProduct: async (dto: CreateProduct) => {
    const response = await httpClient.post<Product>('/product', toFormData(dto), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  updateProduct: async (dto: UpdateProduct) => {
    await httpClient.put('/product', toFormData(dto), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteProduct: async (productId: string) => {
    await httpClient.delete(`/product/${productId}`);
  },
};