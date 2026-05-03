import { httpClient } from '@/services/httpClient';
import { toFormData } from '@/utils/formData';
import type { CreateProduct, Product, ProductParams, UpdateProduct } from '@/features/catalog/types/catalog.types';

export const catalogApi = {
  getProducts: async (params: ProductParams = {}) => {
    const response = await httpClient.get<Product[]>('/product', { params });
    const raw = response.headers['pagination'] as string | undefined;
    const header = raw ? (JSON.parse(raw) as { TotalCount: number; PageSize: number; CurrentPage: number; TotalPages: number }) : null;
    return {
      items: response.data,
      currentPage: header?.CurrentPage ?? 1,
      totalPages: header?.TotalPages ?? 1,
      pageSize: header?.PageSize ?? response.data.length,
      totalCount: header?.TotalCount ?? response.data.length,
    };
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