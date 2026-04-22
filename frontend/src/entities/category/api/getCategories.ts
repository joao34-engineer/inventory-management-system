import { apiFetch } from "@shared/api/api.ts"
import type { Category, CategoryApiResponse } from "../model/types"

/**
 * Fetches all categories from the backend.
 * Uses the standardized Result Union pattern.
 */
export async function getCategories(): Promise<Category[]> {
  const response = await apiFetch<CategoryApiResponse>('/categories')

  if (response.status === 'error') {
    throw new Error(response.message || 'Failed to fetch categories')
  }

  return response.data
}
