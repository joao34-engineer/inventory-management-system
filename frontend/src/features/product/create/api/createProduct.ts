import { apiFetch } from "@shared/api/api.ts"
import type { Product } from "@entities/product/model/types.ts"

export interface CreateProductInput {
  name: string;
  sku: string;
  price: number; // In cents
  quantity: number;
  categoryId: string;
  description?: string;
  status?: 'active' | 'inactive' | 'discontinued';
}

export type CreateProductResponse = {
  status: 'success' | 'error';
  data: Product;
  message?: string;
}

/**
 * Sends a POST request to create a new product.
 */
export async function createProduct(input: CreateProductInput): Promise<Product> {
  const response = await apiFetch<CreateProductResponse>('/products', {
    method: 'POST',
    body: JSON.stringify(input)
  })

  if (response.status === 'error') {
    throw new Error(response.message || 'Failed to create product')
  }

  return response.data
}
