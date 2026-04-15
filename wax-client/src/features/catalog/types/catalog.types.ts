export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  pictureUrl: string;
  type: string;
  brand: string;
  quantityInStock: number;
  publicId?: string;
};

export type ProductParams = {
  orderBy?: string;
  searchTerm?: string;
  brands?: string;
  types?: string;
  pageNumber?: number;
  pageSize?: number;
};

export type CreateProduct = {
  name: string;
  description: string;
  price: number;
  file: File;
  pictureUrl?: string;
  type: string;
  brand: string;
  quantityInStock: number;
  publicId?: string;
};

export type UpdateProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  file?: File;
  pictureUrl?: string;
  type: string;
  brand: string;
  quantityInStock: number;
  publicId?: string;
};